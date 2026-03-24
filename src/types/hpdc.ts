// ─── Machine Status ────────────────────────────────────────────────────────
export type MachineStatus = 'RUNNING' | 'IDLE' | 'ALARM' | 'MAINTENANCE' | 'SETUP';

// ─── Alarm Severity ────────────────────────────────────────────────────────
export type AlarmSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type AlarmState = 'ACTIVE' | 'ACKNOWLEDGED' | 'CLEARED';

export interface Alarm {
  id: string;
  code: string;
  description: string;
  severity: AlarmSeverity;
  state: AlarmState;
  timestamp: Date;
  acknowledgedAt?: Date;
  clearedAt?: Date;
  parameter?: string;
  actualValue?: number;
  limitValue?: number;
}

// ─── Injection / Shot Data ─────────────────────────────────────────────────
export interface InjectionPhase {
  /** Phase 1 (slow shot) - fills shot sleeve */
  phase1Velocity: number;          // m/s
  phase1Distance: number;          // mm (travel in phase 1)

  /** Phase 2 (fast shot) - fills cavity */
  phase2Velocity: number;          // m/s
  phase2SwitchoverPosition: number; // mm (from shot end)

  /** Phase 3 (intensification) */
  intensificationPressure: number;  // bar
  intensificationDelay: number;     // ms
  intensificationTime: number;      // ms
}

export interface ShotRecord {
  shotNumber: number;
  timestamp: Date;
  cycleTime: number;              // s
  fillTime: number;               // ms
  phase1Velocity: number;         // m/s actual
  phase2Velocity: number;         // m/s actual
  peakPressure: number;           // bar
  intensificationPressure: number; // bar
  metalTemp: number;              // °C
  dieTemp: number;                // °C (average)
  shotWeight: number;             // kg
  isGoodPart: boolean;
  scrapReason?: string;
}

export interface PlungerTrace {
  time: number;    // ms
  position: number; // mm
  velocity: number; // m/s
  pressure: number; // bar
}

// ─── Die Temperature ────────────────────────────────────────────────────────
export interface DieZoneTemp {
  zoneId: string;
  zoneName: string;
  actual: number;   // °C
  setpoint: number; // °C
  deviation: number; // °C difference
  status: 'OK' | 'HIGH' | 'LOW' | 'ALARM';
}

export interface CoolingCircuit {
  circuitId: string;
  name: string;
  inletTemp: number;   // °C
  outletTemp: number;  // °C
  flowRate: number;    // L/min
  setpointFlow: number; // L/min
  isActive: boolean;
}

export interface DieSpray {
  sprayTime: number;       // s
  lubricantConcentration: number; // % dilution
  airPressure: number;     // bar
  coverSideZones: boolean[];
  ejectorSideZones: boolean[];
}

export interface DieThermalData {
  coverDieZones: DieZoneTemp[];
  ejectorDieZones: DieZoneTemp[];
  coolingCircuits: CoolingCircuit[];
  dieSpray: DieSpray;
}

// ─── Metal / Furnace ────────────────────────────────────────────────────────
export interface FurnaceData {
  holdingFurnaceTemp: number;    // °C
  holdingFurnaceSetpoint: number; // °C
  metalTempAtShot: number;       // °C
  superheat: number;             // °C above liquidus (A380 liquidus ~580°C)
  shotWeight: number;            // kg
  ladle: boolean;
}

// ─── Hydraulic System ───────────────────────────────────────────────────────
export interface HydraulicData {
  systemPressure: number;        // bar
  accumulatorPressure: number;   // bar
  accumulatorPrecharge: number;  // bar (N2 precharge)
  oilTemperature: number;        // °C
  oilLevel: number;              // % full
  filterDeltaP: number;          // bar (pressure drop across filter)
  pumpPressure: number;          // bar
}

// ─── Clamping System ───────────────────────────────────────────────────────
export interface ClampingData {
  clampingForce: number;         // kN
  clampingForceSetpoint: number; // kN
  openingForce: number;          // kN
  tieBarsOk: boolean[];          // 4 tie bars
  dieProtectionOk: boolean;
  safetyDoorClosed: boolean;
}

// ─── Timing Data ───────────────────────────────────────────────────────────
export interface TimingData {
  totalCycleTime: number;     // s
  dieCloseTime: number;       // s
  injectionTime: number;      // s
  solidificationTime: number; // s
  dieOpenTime: number;        // s
  ejectionTime: number;       // s
  sprayTime: number;          // s
  robotPickTime: number;      // s
}

// ─── Vacuum System ─────────────────────────────────────────────────────────
export interface VacuumData {
  enabled: boolean;
  targetVacuum: number;       // mbar
  actualVacuum: number;       // mbar
  valveOpenPosition: number;  // mm
  evacuationTime: number;     // ms
}

// ─── Process Setpoints (settable parameters) ───────────────────────────────
export interface ProcessSetpoints {
  injection: InjectionPhase;
  metalTemp: number;          // °C
  holdingFurnaceTemp: number; // °C
  clampingForce: number;      // kN
  solidificationTime: number; // s
  dieSprayTime: number;       // s
  dieSprayConcentration: number; // %
  coolingTime: number;        // s
  dieOpenSpeed: number;       // mm/s
  ejectionSpeed: number;      // mm/s
  corePull1Time: number;      // s
  corePull2Time: number;      // s
  vacuumTarget: number;       // mbar
}

// ─── Production Stats ──────────────────────────────────────────────────────
export interface ProductionStats {
  shotCounter: number;
  goodParts: number;
  scrapParts: number;
  scrapRate: number;           // %
  oee: number;                 // % Overall Equipment Effectiveness
  availability: number;        // %
  performance: number;         // %
  quality: number;             // %
  plannedCycleTime: number;    // s
  actualAvgCycleTime: number;  // s
  shiftStart: Date;
  shiftParts: number;
  shiftTarget: number;
}

// ─── Full Machine State ────────────────────────────────────────────────────
export interface HPDCMachineState {
  machineId: string;
  machineName: string;
  status: MachineStatus;
  alloy: string;
  partNumber: string;
  moldId: string;
  operatorId: string;

  // Live data
  injection: InjectionPhase;
  currentShotTrace: PlungerTrace[];
  lastShot: ShotRecord | null;
  shotHistory: ShotRecord[];

  // Thermal
  dieThermal: DieThermalData;
  furnace: FurnaceData;

  // Machine
  hydraulic: HydraulicData;
  clamping: ClampingData;
  timing: TimingData;
  vacuum: VacuumData;

  // Settings
  setpoints: ProcessSetpoints;

  // Production
  production: ProductionStats;

  // Alarms
  activeAlarms: Alarm[];
  alarmHistory: Alarm[];
}

// ─── Chart Data ────────────────────────────────────────────────────────────
export interface TrendPoint {
  shot: number;
  value: number;
  timestamp: string;
}

export interface ParameterLimit {
  low: number;
  high: number;
  lowWarn: number;
  highWarn: number;
  unit: string;
  label: string;
}
