export type MaterialCategory =
  | 'metal'
  | 'plastic'
  | 'elastomer'
  | 'coating'
  | 'electronic'
  | 'glass-ceramic'
  | 'composite';

export interface MaterialSubstanceShare {
  casNumber: string;
  /** Typical mass percent within this homogeneous material; templates are re-normalized to 100. */
  percentTypical: number;
}

export interface MaterialTemplate {
  id: string;
  name: string;
  category: MaterialCategory;
  description: string;
  /** Free-text keywords used by the AI drafting engine to match a user's component description. */
  keywords: string[];
  substances: MaterialSubstanceShare[];
  /**
   * Templates sharing a `group` are mutually-exclusive alternatives for the
   * same physical material (e.g. carbon steel vs. stainless steel) — the AI
   * drafting engine keeps only the best match per group. Most templates have
   * no group and can freely coexist alongside any other material.
   */
  group?: string;
}

/**
 * Starter materials/substance knowledge base used by the AI drafting engine.
 * Compositions are representative typical values for common engineering
 * grades, not certified mill-test or supplier data — every AI-generated
 * draft should be verified against the actual supplier material declaration
 * before a module is submitted.
 */
export const MATERIAL_TEMPLATES: MaterialTemplate[] = [
  {
    id: 'low-alloy-steel',
    name: 'Low Alloy Steel',
    category: 'metal',
    group: 'steel',
    description: 'General structural/fastener steel grade (e.g. similar to SAE 1045 / C45).',
    keywords: ['steel', 'bracket', 'fastener', 'screw', 'bolt', 'nut', 'washer', 'structural steel', 'mild steel', 'shaft'],
    substances: [
      { casNumber: '7439-89-6', percentTypical: 97.4 },
      { casNumber: '7439-96-5', percentTypical: 1.2 },
      { casNumber: '7440-21-3', percentTypical: 0.3 },
      { casNumber: '7440-47-3', percentTypical: 0.6 },
      { casNumber: '7440-02-0', percentTypical: 0.3 },
      { casNumber: '7440-31-5', percentTypical: 0.2 },
    ],
  },
  {
    id: 'stainless-steel-304',
    name: 'Stainless Steel (AISI 304)',
    category: 'metal',
    group: 'steel',
    description: 'Austenitic chromium-nickel stainless steel, common for fasteners, trim, housings.',
    keywords: ['stainless steel', 'ss304', '304 stainless', 'inox', 'stainless bracket', 'stainless housing'],
    substances: [
      { casNumber: '7439-89-6', percentTypical: 70.0 },
      { casNumber: '7440-47-3', percentTypical: 18.5 },
      { casNumber: '7440-02-0', percentTypical: 9.0 },
      { casNumber: '7439-96-5', percentTypical: 1.5 },
      { casNumber: '7440-21-3', percentTypical: 1.0 },
    ],
  },
  {
    id: 'aluminum-6061',
    name: 'Aluminium Alloy 6061',
    category: 'metal',
    description: 'Common structural/heatsink/housing aluminium alloy (Al-Mg-Si).',
    keywords: ['aluminum', 'aluminium', 'alloy wheel', 'heatsink', 'housing', 'aluminum bracket', 'die cast aluminum', 'al6061', '6061'],
    substances: [
      { casNumber: '7429-90-5', percentTypical: 97.9 },
      { casNumber: '7440-21-3', percentTypical: 0.6 },
      { casNumber: '7440-50-8', percentTypical: 0.28 },
      { casNumber: '7440-47-3', percentTypical: 0.2 },
      { casNumber: '7439-89-6', percentTypical: 0.5 },
      { casNumber: '7439-96-5', percentTypical: 0.15 },
      { casNumber: '7440-66-6', percentTypical: 0.1 },
    ],
  },
  {
    id: 'leaded-brass',
    name: 'Leaded Brass (C36000)',
    category: 'metal',
    description: 'Free-cutting brass alloy used in connectors and fittings; contains lead.',
    keywords: ['brass', 'connector pin', 'brass fitting', 'terminal', 'brass insert'],
    substances: [
      { casNumber: '7440-50-8', percentTypical: 64.5 },
      { casNumber: '7440-66-6', percentTypical: 32.5 },
      { casNumber: '7439-92-1', percentTypical: 3.0 },
    ],
  },
  {
    id: 'solder-sac305',
    name: 'Lead-Free Solder (SAC305)',
    category: 'electronic',
    description: 'Tin-silver-copper lead-free solder alloy for PCB assembly.',
    keywords: ['solder', 'lead-free solder', 'sac305', 'pcb solder', 'solder joint'],
    substances: [
      { casNumber: '7440-31-5', percentTypical: 96.5 },
      { casNumber: '7440-22-4', percentTypical: 3.0 },
      { casNumber: '7440-50-8', percentTypical: 0.5 },
    ],
  },
  {
    id: 'solder-snpb',
    name: 'Tin-Lead Solder (Sn63Pb37)',
    category: 'electronic',
    description: 'Legacy leaded solder alloy — restricted under RoHS for most applications.',
    keywords: ['leaded solder', 'tin-lead solder', 'sn-pb solder', 'snpb'],
    substances: [
      { casNumber: '7440-31-5', percentTypical: 63 },
      { casNumber: '7439-92-1', percentTypical: 37 },
    ],
  },
  {
    id: 'pa66-gf30',
    name: 'Polyamide 66, 30% Glass Filled (PA66-GF30)',
    category: 'plastic',
    description: 'Glass-fibre reinforced nylon for connector housings, gears, structural plastic parts.',
    keywords: ['nylon', 'pa66', 'polyamide', 'connector housing', 'gear', 'gf30', 'glass filled nylon'],
    substances: [
      { casNumber: '32131-17-7', percentTypical: 70 },
      { casNumber: '65997-17-3', percentTypical: 30 },
    ],
  },
  {
    id: 'polypropylene',
    name: 'Polypropylene (PP)',
    category: 'plastic',
    description: 'Unfilled polypropylene for caps, containers, light housings.',
    keywords: ['polypropylene', 'pp', 'plastic cap', 'plastic container', 'pp housing'],
    substances: [
      { casNumber: '9003-07-0', percentTypical: 98 },
      { casNumber: '13463-67-7', percentTypical: 2 },
    ],
  },
  {
    id: 'abs',
    name: 'Acrylonitrile Butadiene Styrene (ABS)',
    category: 'plastic',
    description: 'Common engineering plastic for enclosures and trim covers.',
    keywords: ['abs', 'enclosure', 'plastic casing', 'abs housing', 'trim cover'],
    substances: [
      { casNumber: '9003-56-9', percentTypical: 96 },
      { casNumber: '13463-67-7', percentTypical: 2 },
      { casNumber: '7440-36-0', percentTypical: 2 },
    ],
  },
  {
    id: 'pvc-flexible',
    name: 'Flexible PVC (plasticized)',
    category: 'plastic',
    description: 'Plasticized PVC for cable insulation, hoses, soft gaskets — commonly contains phthalate plasticizers.',
    keywords: ['pvc cable', 'cable insulation', 'wire insulation', 'pvc hose', 'flexible pvc', 'pvc gasket'],
    substances: [
      { casNumber: '9002-86-2', percentTypical: 60 },
      { casNumber: '117-81-7', percentTypical: 35 },
      { casNumber: '1317-65-3', percentTypical: 5 },
    ],
  },
  {
    id: 'pvc-rigid',
    name: 'Rigid PVC',
    category: 'plastic',
    description: 'Unplasticized PVC for pipes and rigid profiles.',
    keywords: ['rigid pvc', 'pvc pipe', 'pvc profile', 'upvc'],
    substances: [
      { casNumber: '9002-86-2', percentTypical: 95 },
      { casNumber: '1317-65-3', percentTypical: 5 },
    ],
  },
  {
    id: 'epdm-rubber',
    name: 'EPDM Rubber',
    category: 'elastomer',
    description: 'Weather-resistant rubber compound for gaskets, seals, weatherstrips.',
    keywords: ['epdm', 'rubber seal', 'gasket', 'weatherstrip', 'rubber gasket'],
    substances: [
      { casNumber: '9006-26-2', percentTypical: 55 },
      { casNumber: '7782-42-5', percentTypical: 25 },
      { casNumber: '1314-13-2', percentTypical: 5 },
      { casNumber: '7704-34-9', percentTypical: 1 },
      { casNumber: '1317-65-3', percentTypical: 14 },
    ],
  },
  {
    id: 'nbr-rubber',
    name: 'NBR Rubber (Nitrile)',
    category: 'elastomer',
    description: 'Oil-resistant rubber for o-rings and seals.',
    keywords: ['nbr', 'nitrile rubber', 'o-ring', 'oil seal'],
    substances: [
      { casNumber: '9003-18-3', percentTypical: 60 },
      { casNumber: '7782-42-5', percentTypical: 25 },
      { casNumber: '1314-13-2', percentTypical: 5 },
      { casNumber: '7704-34-9', percentTypical: 1 },
      { casNumber: '1317-65-3', percentTypical: 9 },
    ],
  },
  {
    id: 'silicone-rubber',
    name: 'Silicone Rubber',
    category: 'elastomer',
    description: 'High-temperature silicone elastomer for seals and gaskets.',
    keywords: ['silicone', 'silicone seal', 'silicone gasket', 'high temp seal'],
    substances: [
      { casNumber: '9016-00-6', percentTypical: 95 },
      { casNumber: '13463-67-7', percentTypical: 5 },
    ],
  },
  {
    id: 'pcb-fr4',
    name: 'PCB Laminate (FR4)',
    category: 'electronic',
    description: 'Glass-reinforced epoxy laminate used as the base material of printed circuit boards.',
    keywords: ['pcb', 'circuit board', 'printed circuit board', 'fr4', 'pcb laminate'],
    substances: [
      { casNumber: '25068-38-6', percentTypical: 30 },
      { casNumber: '65997-17-3', percentTypical: 70 },
    ],
  },
  {
    id: 'zinc-chromate-coating',
    name: 'Zinc-Chromate Conversion Coating',
    category: 'coating',
    description: 'Hexavalent-chromium passivation coating for corrosion protection — restricted under RoHS.',
    keywords: ['chromate coating', 'yellow passivate', 'zinc chromate', 'cr6 coating', 'hexavalent chromium plating'],
    substances: [
      { casNumber: '7440-66-6', percentTypical: 92 },
      { casNumber: '18540-29-9', percentTypical: 3 },
      { casNumber: '7439-89-6', percentTypical: 5 },
    ],
  },
  {
    id: 'cadmium-plating',
    name: 'Cadmium Plating',
    category: 'coating',
    description: 'Cadmium electroplating for corrosion/galling resistance — heavily restricted under RoHS.',
    keywords: ['cadmium plating', 'cd plating', 'cadmium coating'],
    substances: [
      { casNumber: '7440-43-9', percentTypical: 98 },
      { casNumber: '7439-89-6', percentTypical: 2 },
    ],
  },
  {
    id: 'powder-coat-paint',
    name: 'Epoxy Powder Coating / Paint',
    category: 'coating',
    description: 'Pigmented epoxy coating for corrosion protection and appearance.',
    keywords: ['paint', 'powder coat', 'coating', 'varnish', 'painted surface'],
    substances: [
      { casNumber: '25068-38-6', percentTypical: 55 },
      { casNumber: '13463-67-7', percentTypical: 25 },
      { casNumber: '1317-65-3', percentTypical: 19 },
      { casNumber: '68-12-1', percentTypical: 1 },
    ],
  },
  {
    id: 'float-glass',
    name: 'Float Glass',
    category: 'glass-ceramic',
    description: 'Soda-lime glass for lenses, covers, glazing.',
    keywords: ['glass', 'lens', 'glass cover', 'window glass', 'glazing'],
    substances: [
      { casNumber: '14808-60-7', percentTypical: 90 },
      { casNumber: '1317-65-3', percentTypical: 10 },
    ],
  },
  {
    id: 'technical-ceramic',
    name: 'Technical Ceramic (Alumina-based)',
    category: 'glass-ceramic',
    description: 'Alumina-based technical ceramic for electrical insulators.',
    keywords: ['ceramic', 'alumina', 'insulator', 'ceramic substrate'],
    substances: [
      { casNumber: '7429-90-5', percentTypical: 60 },
      { casNumber: '14808-60-7', percentTypical: 40 },
    ],
  },
  {
    id: 'cfrp',
    name: 'Carbon Fibre Reinforced Polymer (CFRP)',
    category: 'composite',
    description: 'Carbon-fibre composite panel/structure with epoxy matrix.',
    keywords: ['carbon fiber', 'carbon fibre', 'cfrp', 'composite panel', 'carbon composite'],
    substances: [
      { casNumber: '25068-38-6', percentTypical: 35 },
      { casNumber: '7782-42-5', percentTypical: 65 },
    ],
  },
  {
    id: 'copper-wire',
    name: 'Copper Conductor Wire',
    category: 'metal',
    description: 'Bare copper conductor for wiring and busbars.',
    keywords: ['copper wire', 'wire conductor', 'busbar', 'electrical wire', 'cable conductor'],
    substances: [{ casNumber: '7440-50-8', percentTypical: 100 }],
  },
  {
    id: 'ndfeb-magnet',
    name: 'NdFeB Permanent Magnet',
    category: 'metal',
    description: 'Sintered neodymium-iron-boron permanent magnet used in motors and sensors.',
    keywords: ['magnet', 'ndfeb', 'neodymium magnet', 'permanent magnet'],
    substances: [
      { casNumber: '7440-00-8', percentTypical: 30 },
      { casNumber: '7439-89-6', percentTypical: 66 },
      { casNumber: '7440-42-8', percentTypical: 1.2 },
      { casNumber: '7440-48-4', percentTypical: 2.8 },
    ],
  },
];

export function findMaterialTemplate(id: string): MaterialTemplate | undefined {
  return MATERIAL_TEMPLATES.find((m) => m.id === id);
}
