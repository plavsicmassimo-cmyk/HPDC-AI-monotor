import type { ModuleNode, SubstanceEntry } from '../types/imds';
import { MATERIAL_TEMPLATES, type MaterialTemplate } from '../data/materialTemplates';
import { lookupSubstance } from '../data/substanceLibrary';
import { generateId } from './idGenerator';

export interface MaterialMatch {
  template: MaterialTemplate;
  score: number;
  matchedKeywords: string[];
  specificity: number;
}

function tokenize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9% .\-]/g, ' ');
}

/**
 * Scores every known material template against free-text input by counting
 * keyword occurrences. This is a deterministic, explainable rule-based
 * "AI assistant" rather than a generative model — every match it returns
 * traces back to a specific keyword hit, which keeps drafts auditable.
 */
export function matchMaterials(description: string, maxMatches = 4): MaterialMatch[] {
  const text = tokenize(description);
  const matches: MaterialMatch[] = [];

  for (const template of MATERIAL_TEMPLATES) {
    let score = 0;
    let specificity = 0;
    const matchedKeywords: string[] = [];
    for (const keyword of template.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        const words = keyword.split(' ').length;
        score += words; // multi-word keywords are stronger signals
        specificity = Math.max(specificity, words);
        matchedKeywords.push(keyword);
      }
    }
    if (score > 0) {
      matches.push({ template, score, matchedKeywords, specificity });
    }
  }

  // Some templates are mutually-exclusive alternatives for the same physical
  // material (e.g. "Low Alloy Steel" vs. "Stainless Steel" both matching a
  // generic "steel" + "bracket" hit) — those are tagged with a shared
  // `group` and only the best-scoring one should survive. Templates without
  // a group never collide with anything else, so a multi-material assembly
  // (steel + brass + coating, etc.) keeps every distinct material it found.
  // On a tied score within a group, prefer the more specific (longer) keyword.
  const bestPerGroup = new Map<string, MaterialMatch>();
  for (const match of matches) {
    const key = match.template.group ?? match.template.id;
    const existing = bestPerGroup.get(key);
    const better =
      !existing ||
      match.score > existing.score ||
      (match.score === existing.score && match.specificity > existing.specificity);
    if (better) {
      bestPerGroup.set(key, match);
    }
  }

  return Array.from(bestPerGroup.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, maxMatches);
}

function buildSubstanceEntries(template: MaterialTemplate): SubstanceEntry[] {
  const total = template.substances.reduce((acc, s) => acc + s.percentTypical, 0) || 1;
  return template.substances.map((share) => {
    const master = lookupSubstance(share.casNumber);
    return {
      id: generateId('sub'),
      casNumber: share.casNumber,
      name: master?.name ?? share.casNumber,
      massPercent: Math.round((share.percentTypical / total) * 1000) / 10,
      svhc: master?.svhc ?? false,
      svhcDate: master?.svhcDate,
      rohsRestricted: master?.rohsRestricted ?? false,
      rohsThresholdPercent: master?.rohsThresholdPercent,
      gadslClass: master?.gadslClass ?? null,
    };
  });
}

export function buildMaterialNode(template: MaterialTemplate, percentOfParent: number): ModuleNode {
  return {
    id: generateId('node'),
    type: 'material',
    name: template.name,
    percentOfParent: Math.round(percentOfParent * 10) / 10,
    children: [],
    substances: buildSubstanceEntries(template),
    notes: `AI-suggested from knowledge base template "${template.id}".`,
  };
}

export interface DraftResult {
  rootNode: ModuleNode;
  matches: MaterialMatch[];
  unmatched: boolean;
}

/**
 * Generates a draft module BOM tree from a free-text component/assembly
 * description. The highest-scoring material is weighted more heavily
 * (it is assumed to be the primary/structural material), remaining matches
 * share the rest of the mass evenly.
 */
export function generateModuleDraft(
  componentName: string,
  description: string,
  massGrams: number
): DraftResult {
  const matches = matchMaterials(description);

  const rootNode: ModuleNode = {
    id: generateId('node'),
    type: 'component',
    name: componentName || 'New Component',
    percentOfParent: 100,
    massGrams,
    children: [],
    notes: description ? `AI draft generated from description: "${description}"` : undefined,
  };

  if (matches.length === 0) {
    rootNode.children = [
      {
        id: generateId('node'),
        type: 'material',
        name: 'Unspecified Material',
        percentOfParent: 100,
        children: [],
        substances: [],
        notes: 'No material keywords matched the description — fill in composition manually.',
      },
    ];
    return { rootNode, matches, unmatched: true };
  }

  const weights = matches.map((_, i) => (i === 0 ? 3 : 1));
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  rootNode.children = matches.map((match, i) => {
    const percent = (weights[i] / totalWeight) * 100;
    return buildMaterialNode(match.template, percent);
  });

  return { rootNode, matches, unmatched: false };
}

export function suggestCompositionForName(name: string): MaterialMatch[] {
  return matchMaterials(name, 3);
}
