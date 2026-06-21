export type NodeType = 'component' | 'semi-component' | 'material';

export type ModuleStatus = 'draft' | 'in-review' | 'sent' | 'accepted' | 'rejected';

export type GadslClass = 'A' | 'B' | 'C' | 'D' | null;

/** A single chemical substance entry attached to a homogeneous material node. */
export interface SubstanceEntry {
  id: string;
  casNumber: string;
  name: string;
  /** Mass percent within the parent material (0-100). */
  massPercent: number;
  svhc: boolean;
  svhcDate?: string;
  rohsRestricted: boolean;
  rohsThresholdPercent?: number;
  gadslClass: GadslClass;
}

/** A node in the module BOM tree: Component > Semi-Component > Material (leaf, holds substances). */
export interface ModuleNode {
  id: string;
  type: NodeType;
  name: string;
  partNumber?: string;
  /** Mass percent this node represents of its parent's total mass (0-100). Root is always 100. */
  percentOfParent: number;
  /** Absolute mass in grams, only meaningful for the root node; children are derived by percent. */
  massGrams?: number;
  children: ModuleNode[];
  /** Only present on 'material' (leaf) nodes. */
  substances?: SubstanceEntry[];
  notes?: string;
}

export interface Module {
  id: string;
  mdsId: string;
  name: string;
  version: number;
  status: ModuleStatus;
  companyName: string;
  companyImdsId: string;
  recipientName: string;
  recipientImdsId: string;
  createdAt: string;
  updatedAt: string;
  rootNode: ModuleNode;
  aiGenerated: boolean;
  sourceDescription?: string;
}

export interface CompanyProfile {
  companyName: string;
  companyImdsId: string;
  defaultRecipientName: string;
  defaultRecipientImdsId: string;
}

export interface ComplianceFinding {
  nodePath: string;
  nodeName: string;
  substanceName: string;
  casNumber: string;
  effectivePercent: number;
  meetsThreshold?: boolean;
}

export interface RohsViolation extends ComplianceFinding {
  thresholdPercent: number;
}

export interface ComplianceReport {
  svhcFindings: ComplianceFinding[];
  rohsViolations: RohsViolation[];
  gadslDeclarable: ComplianceFinding[];
  massBalanceWarnings: string[];
  overallStatus: 'pass' | 'warn' | 'fail';
}
