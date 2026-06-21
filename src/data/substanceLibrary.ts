import type { GadslClass } from '../types/imds';

/**
 * Master substance reference library.
 *
 * This is a starter knowledge base covering commonly encountered substances
 * (REACH Annex XIV/SVHC candidates, RoHS 2011/65/EU Annex II restricted
 * substances, and a handful of GADSL-declarable substances) intended to
 * power the AI drafting and compliance-checking engine. It is NOT a
 * substitute for the live ECHA SVHC Candidate List, the current RoHS
 * exemption annexes, or the official GADSL — an EHS/compliance specialist
 * should review and keep this list current before it is relied on for
 * real regulatory submissions.
 */
export interface SubstanceMaster {
  casNumber: string;
  name: string;
  svhc: boolean;
  svhcDate?: string;
  rohsRestricted: boolean;
  rohsThresholdPercent?: number;
  gadslClass: GadslClass;
}

export const SUBSTANCE_LIBRARY: SubstanceMaster[] = [
  // --- RoHS Annex II restricted substances ---
  { casNumber: '7439-92-1', name: 'Lead', svhc: true, svhcDate: '2018-01-15', rohsRestricted: true, rohsThresholdPercent: 0.1, gadslClass: 'D' },
  { casNumber: '7439-97-6', name: 'Mercury', svhc: false, rohsRestricted: true, rohsThresholdPercent: 0.1, gadslClass: 'D' },
  { casNumber: '7440-43-9', name: 'Cadmium', svhc: false, rohsRestricted: true, rohsThresholdPercent: 0.01, gadslClass: 'D' },
  { casNumber: '18540-29-9', name: 'Chromium VI compounds (as Cr(VI))', svhc: false, rohsRestricted: true, rohsThresholdPercent: 0.1, gadslClass: 'D' },
  { casNumber: '59536-65-1', name: 'Polybrominated biphenyls (PBB)', svhc: false, rohsRestricted: true, rohsThresholdPercent: 0.1, gadslClass: 'D' },
  { casNumber: '32534-81-9', name: 'Polybrominated diphenyl ethers (PBDE)', svhc: false, rohsRestricted: true, rohsThresholdPercent: 0.1, gadslClass: 'D' },
  { casNumber: '117-81-7', name: 'Bis(2-ethylhexyl) phthalate (DEHP)', svhc: true, svhcDate: '2008-10-28', rohsRestricted: true, rohsThresholdPercent: 0.1, gadslClass: 'D' },
  { casNumber: '85-68-7', name: 'Benzyl butyl phthalate (BBP)', svhc: true, svhcDate: '2008-10-28', rohsRestricted: true, rohsThresholdPercent: 0.1, gadslClass: 'D' },
  { casNumber: '84-74-2', name: 'Dibutyl phthalate (DBP)', svhc: true, svhcDate: '2008-10-28', rohsRestricted: true, rohsThresholdPercent: 0.1, gadslClass: 'D' },
  { casNumber: '84-69-5', name: 'Diisobutyl phthalate (DIBP)', svhc: true, svhcDate: '2011-06-20', rohsRestricted: true, rohsThresholdPercent: 0.1, gadslClass: 'D' },

  // --- Additional REACH SVHC candidates (non-RoHS) ---
  { casNumber: '1306-19-0', name: 'Cadmium oxide', svhc: true, svhcDate: '2012-06-18', rohsRestricted: false, gadslClass: 'D' },
  { casNumber: '7758-97-6', name: 'Lead chromate', svhc: true, svhcDate: '2010-06-18', rohsRestricted: false, gadslClass: 'D' },
  { casNumber: '10043-35-3', name: 'Boric acid', svhc: true, svhcDate: '2010-06-18', rohsRestricted: false, gadslClass: null },
  { casNumber: '1303-96-4', name: 'Disodium tetraborate (anhydrous borax)', svhc: true, svhcDate: '2010-06-18', rohsRestricted: false, gadslClass: null },
  { casNumber: '25637-99-4', name: 'Hexabromocyclododecane (HBCDD)', svhc: true, svhcDate: '2008-10-28', rohsRestricted: false, gadslClass: 'D' },
  { casNumber: '80-05-7', name: 'Bisphenol A', svhc: true, svhcDate: '2017-01-12', rohsRestricted: false, gadslClass: null },
  { casNumber: '25154-52-3', name: 'Nonylphenol', svhc: true, svhcDate: '2012-12-19', rohsRestricted: false, gadslClass: 'D' },
  { casNumber: '140-66-9', name: '4-tert-octylphenol', svhc: true, svhcDate: '2012-12-19', rohsRestricted: false, gadslClass: null },
  { casNumber: '68-12-1', name: 'N,N-dimethylformamide (DMF)', svhc: true, svhcDate: '2017-01-12', rohsRestricted: false, gadslClass: null },
  { casNumber: '50-00-0', name: 'Formaldehyde', svhc: true, svhcDate: '2023-01-25', rohsRestricted: false, gadslClass: 'D' },
  { casNumber: '7646-79-9', name: 'Cobalt dichloride', svhc: true, svhcDate: '2010-06-18', rohsRestricted: false, gadslClass: null },
  { casNumber: '25155-23-1', name: 'Trixylyl phosphate', svhc: true, svhcDate: '2018-01-15', rohsRestricted: false, gadslClass: null },

  // --- Common, non-SVHC, non-RoHS substances used in material composition ---
  { casNumber: '7439-89-6', name: 'Iron', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '7429-90-5', name: 'Aluminium', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '7440-50-8', name: 'Copper', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '7440-66-6', name: 'Zinc', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '7439-96-5', name: 'Manganese', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '7440-02-0', name: 'Nickel', svhc: false, rohsRestricted: false, gadslClass: 'D' },
  { casNumber: '7440-47-3', name: 'Chromium (metallic)', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '7440-21-3', name: 'Silicon', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '7440-31-5', name: 'Tin', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '7440-22-4', name: 'Silver', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '7440-36-0', name: 'Antimony', svhc: false, rohsRestricted: false, gadslClass: 'D' },
  { casNumber: '7440-05-3', name: 'Palladium', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '7782-42-5', name: 'Graphite (carbon black filler)', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '14808-60-7', name: 'Quartz / crystalline silica (glass fibre filler)', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '65997-17-3', name: 'Glass fibre (E-glass)', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '9002-88-4', name: 'Polyethylene (PE)', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '9003-07-0', name: 'Polypropylene (PP)', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '32131-17-7', name: 'Polyamide 66 (PA66)', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '25038-54-4', name: 'Polyamide 6 (PA6)', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '9003-56-9', name: 'Acrylonitrile butadiene styrene (ABS)', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '9002-86-2', name: 'Polyvinyl chloride (PVC)', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '25038-59-9', name: 'Polybutylene terephthalate (PBT)', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '25038-69-1', name: 'Polyethylene terephthalate (PET)', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '25068-38-6', name: 'Epoxy resin (bisphenol-A based)', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '9010-98-4', name: 'Styrene-butadiene rubber (SBR)', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '9006-26-2', name: 'Ethylene propylene diene monomer (EPDM)', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '9003-18-3', name: 'Acrylonitrile butadiene rubber (NBR)', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '9016-00-6', name: 'Silicone rubber (polydimethylsiloxane)', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '1317-65-3', name: 'Calcium carbonate (filler)', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '1314-13-2', name: 'Zinc oxide (rubber vulcanization)', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '7704-34-9', name: 'Sulfur (vulcanizing agent)', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '14808-79-8', name: 'Barium sulfate (filler/pigment)', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '13463-67-7', name: 'Titanium dioxide (pigment)', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '7440-00-8', name: 'Neodymium', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '7440-42-8', name: 'Boron', svhc: false, rohsRestricted: false, gadslClass: null },
  { casNumber: '7440-48-4', name: 'Cobalt (metallic)', svhc: false, rohsRestricted: false, gadslClass: 'D' },
];

export function lookupSubstance(casNumber: string): SubstanceMaster | undefined {
  return SUBSTANCE_LIBRARY.find((s) => s.casNumber === casNumber);
}
