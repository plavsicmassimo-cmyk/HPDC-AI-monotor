import type { ComplianceFinding, ComplianceReport, ModuleNode, RohsViolation } from '../types/imds';

const REACH_ARTICLE_33_THRESHOLD = 0.1; // % w/w of the article, SVHC communication duty
const MASS_BALANCE_TOLERANCE = 0.5; // percentage points

function walk(
  node: ModuleNode,
  parentPath: string,
  parentScale: number,
  visit: (node: ModuleNode, path: string, scale: number) => void
) {
  const path = parentPath ? `${parentPath} > ${node.name}` : node.name;
  const scale = parentPath ? parentScale * (node.percentOfParent / 100) : 1;
  visit(node, path, scale);
  node.children.forEach((child) => walk(child, path, scale, visit));
}

export function computeCompliance(root: ModuleNode): ComplianceReport {
  const rohsViolations: RohsViolation[] = [];
  const massBalanceWarnings: string[] = [];
  const svhcTotals = new Map<string, ComplianceFinding>();
  const gadslTotals = new Map<string, ComplianceFinding>();

  walk(root, '', 1, (node, path, scale) => {
    if (node.children.length > 0) {
      const sum = node.children.reduce((acc, c) => acc + c.percentOfParent, 0);
      if (Math.abs(sum - 100) > MASS_BALANCE_TOLERANCE) {
        massBalanceWarnings.push(
          `"${node.name}" children sum to ${sum.toFixed(1)}% of parent mass (expected 100%).`
        );
      }
    }

    if (node.type === 'material' && node.substances) {
      const subSum = node.substances.reduce((acc, s) => acc + s.massPercent, 0);
      if (node.substances.length > 0 && Math.abs(subSum - 100) > MASS_BALANCE_TOLERANCE) {
        massBalanceWarnings.push(
          `Material "${node.name}" substances sum to ${subSum.toFixed(1)}% (expected 100%).`
        );
      }

      for (const substance of node.substances) {
        const effectivePercent = scale * substance.massPercent;

        if (substance.rohsRestricted && substance.rohsThresholdPercent !== undefined) {
          if (substance.massPercent > substance.rohsThresholdPercent) {
            rohsViolations.push({
              nodePath: path,
              nodeName: node.name,
              substanceName: substance.name,
              casNumber: substance.casNumber,
              effectivePercent: substance.massPercent,
              thresholdPercent: substance.rohsThresholdPercent,
            });
          }
        }

        if (substance.svhc) {
          const key = substance.casNumber;
          const existing = svhcTotals.get(key);
          if (existing) {
            existing.effectivePercent += effectivePercent;
          } else {
            svhcTotals.set(key, {
              nodePath: path,
              nodeName: node.name,
              substanceName: substance.name,
              casNumber: substance.casNumber,
              effectivePercent,
            });
          }
        }

        if (substance.gadslClass === 'D') {
          const key = substance.casNumber;
          const existing = gadslTotals.get(key);
          if (existing) {
            existing.effectivePercent += effectivePercent;
          } else {
            gadslTotals.set(key, {
              nodePath: path,
              nodeName: node.name,
              substanceName: substance.name,
              casNumber: substance.casNumber,
              effectivePercent,
            });
          }
        }
      }
    }
  });

  return finalizeReport(rohsViolations, svhcTotals, gadslTotals, massBalanceWarnings);
}

export interface FlatTreeRow {
  node: ModuleNode;
  depth: number;
  path: string;
  scale: number;
}

export function flattenTree(root: ModuleNode): FlatTreeRow[] {
  const rows: FlatTreeRow[] = [];
  function visit(node: ModuleNode, parentPath: string, parentScale: number, depth: number) {
    const path = parentPath ? `${parentPath} > ${node.name}` : node.name;
    const scale = parentPath ? parentScale * (node.percentOfParent / 100) : 1;
    rows.push({ node, depth, path, scale });
    node.children.forEach((child) => visit(child, path, scale, depth + 1));
  }
  visit(root, '', 1, 0);
  return rows;
}

function finalizeReport(
  rohsViolations: RohsViolation[],
  svhcTotals: Map<string, ComplianceFinding>,
  gadslTotals: Map<string, ComplianceFinding>,
  massBalanceWarnings: string[]
): ComplianceReport {
  const svhcFindings = Array.from(svhcTotals.values())
    .map((f) => ({ ...f, meetsThreshold: f.effectivePercent >= REACH_ARTICLE_33_THRESHOLD }))
    .sort((a, b) => b.effectivePercent - a.effectivePercent);

  const gadslDeclarable = Array.from(gadslTotals.values()).sort((a, b) => b.effectivePercent - a.effectivePercent);

  let overallStatus: ComplianceReport['overallStatus'] = 'pass';
  if (rohsViolations.length > 0) {
    overallStatus = 'fail';
  } else if (svhcFindings.some((f) => f.meetsThreshold) || massBalanceWarnings.length > 0) {
    overallStatus = 'warn';
  }

  return { svhcFindings, rohsViolations, gadslDeclarable, massBalanceWarnings, overallStatus };
}
