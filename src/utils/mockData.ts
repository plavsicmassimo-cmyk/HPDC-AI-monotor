import type {
  HPDCMachineState,
  ShotRecord,
  PlungerTrace,
  DieZoneTemp,
  CoolingCircuit,
  Alarm,
  AlarmSeverity,
} from '../types/hpdc';

// ─── Helper utilities ─────────────────────────────────────────────────────
export function rand(min: number, max: number, decimals = 2): number {
  const val = min + Math.random() * (max - min);
  return Math.round(val * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function randInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

function jitter(base: number, pct: number): number {
  return base * (1 + (Math.random() - 0.5) * 2 * pct);
}

// ─── Generate plunger trace ───────────────────────────────────────────────
export function generatePlungerTrace(
  p1v: number,
  p2v: number,
  intPressure: number
): PlungerTrace[] {
  const points: PlungerTrace[] = [];
  const totalTravel = 480; // mm total plunger travel
  const switchoverPos = 320; // mm phase 2 starts here
  const dt = 5; // ms per sample

  let pos = 0;
  let vel = 0;
  let pressure = 15;
  let time = 0;
  let phase = 1;

  while (pos < totalTravel && time < 3000) {
    if (phase === 1 && pos < switchoverPos) {
      vel = jitter(p1v, 0.05);
      pressure = jitter(50, 0.15);
    } else if (phase === 1) {
      phase = 2;
      vel = p2v;
    }

    if (phase === 2) {
      vel = jitter(p2v, 0.04);
      pressure = jitter(180, 0.1);
    }

    pos += vel * 1000 * (dt / 1000);

    // Cavity fill — pressure spike
    if (pos >= totalTravel - 10) {
      phase = 3;
      vel = 0;
      pressure = jitter(intPressure, 0.05);
      pos = totalTravel;
    }

    points.push({
      time: Math.round(time),
      position: Math.round(pos * 10) / 10,
      velocity: Math.round(vel * 1000) / 1000,
      pressure: Math.round(pressure),
    });

    time += dt;
    if (phase === 3 && points.length > 5) break;
  }

  // Add intensification hold
  for (let i = 0; i < 10; i++) {
    points.push({
      time: Math.round(time + i * dt),
      position: totalTravel,
      velocity: 0,
      pressure: Math.round(jitter(intPressure, 0.03)),
    });
  }

  return points;
}

// ─── Generate die temperature zones ─────────────────────────────────────
function makeDieZone(id: string, name: string, baseTemp: number, sp: number): DieZoneTemp {
  const actual = jitter(baseTemp, 0.06);
  const dev = actual - sp;
  const status =
    Math.abs(dev) < 5 ? 'OK' : Math.abs(dev) < 15 ? (dev > 0 ? 'HIGH' : 'LOW') : 'ALARM';
  return { zoneId: id, zoneName: name, actual: Math.round(actual), setpoint: sp, deviation: Math.round(dev * 10) / 10, status };
}

// ─── Generate a single cooling circuit ──────────────────────────────────
function makeCooling(id: string, name: string, inletBase: number, flowSp: number): CoolingCircuit {
  return {
    circuitId: id,
    name,
    inletTemp: Math.round(jitter(inletBase, 0.05)),
    outletTemp: Math.round(jitter(inletBase + 18, 0.08)),
    flowRate: Math.round(jitter(flowSp, 0.1) * 10) / 10,
    setpointFlow: flowSp,
    isActive: true,
  };
}

// ─── Generate a shot record ───────────────────────────────────────────────
export function generateShotRecord(shotNum: number, baseTime?: Date): ShotRecord {
  const isGood = Math.random() > 0.06;
  const scrapReasons = ['Cold shut', 'Porosity', 'Flash', 'Short fill', 'Surface defect'];
  return {
    shotNumber: shotNum,
    timestamp: baseTime ?? new Date(),
    cycleTime: rand(38, 55),
    fillTime: rand(28, 75),
    phase1Velocity: rand(0.18, 0.28),
    phase2Velocity: rand(3.8, 5.2),
    peakPressure: randInt(310, 420),
    intensificationPressure: randInt(450, 580),
    metalTemp: randInt(665, 685),
    dieTemp: randInt(175, 225),
    shotWeight: rand(2.1, 2.5),
    isGoodPart: isGood,
    scrapReason: isGood ? undefined : scrapReasons[randInt(0, scrapReasons.length - 1)],
  };
}

// ─── Generate alarm ──────────────────────────────────────────────────────
function makeAlarm(
  id: string,
  code: string,
  desc: string,
  severity: AlarmSeverity,
  state: Alarm['state'],
  minsAgo: number,
  param?: string,
  actual?: number,
  limit?: number
): Alarm {
  const ts = new Date(Date.now() - minsAgo * 60000);
  return { id, code, description: desc, severity, state, timestamp: ts, parameter: param, actualValue: actual, limitValue: limit };
}

// ─── Build initial machine state ─────────────────────────────────────────
export function buildInitialState(): HPDCMachineState {
  const now = new Date();

  // Generate shot history (last 100 shots)
  const shotHistory: ShotRecord[] = [];
  for (let i = 1; i <= 100; i++) {
    const ts = new Date(now.getTime() - (100 - i) * 45000);
    shotHistory.push(generateShotRecord(1200 + i, ts));
  }

  const goodParts = shotHistory.filter((s) => s.isGoodPart).length;
  const scrapParts = shotHistory.length - goodParts;

  const coverZones: DieZoneTemp[] = [
    makeDieZone('C1', 'Cover In-Gate', 195, 200),
    makeDieZone('C2', 'Cover Center', 185, 190),
    makeDieZone('C3', 'Cover Overflow', 175, 180),
    makeDieZone('C4', 'Cover Edge', 170, 175),
  ];

  const ejectorZones: DieZoneTemp[] = [
    makeDieZone('E1', 'Ejector In-Gate', 190, 195),
    makeDieZone('E2', 'Ejector Center', 180, 185),
    makeDieZone('E3', 'Ejector Overflow', 172, 178),
    makeDieZone('E4', 'Ejector Edge', 165, 170),
  ];

  const coolingCircuits: CoolingCircuit[] = [
    makeCooling('CC1', 'Cover Main Circuit', 28, 8.5),
    makeCooling('CC2', 'Cover Overflow Circuit', 26, 5.0),
    makeCooling('CC3', 'Ejector Main Circuit', 29, 9.0),
    makeCooling('CC4', 'Ejector Overflow Circuit', 27, 5.5),
    makeCooling('CC5', 'Slide Circuit', 25, 3.0),
    makeCooling('CC6', 'Plunger Tip', 22, 1.5),
  ];

  const activeAlarms: Alarm[] = [
    makeAlarm('A001', 'TH-101', 'Ejector Zone E2 temperature HIGH', 'MEDIUM', 'ACTIVE', 3, 'E2 Die Temp', 198, 190),
  ];

  const alarmHistory: Alarm[] = [
    makeAlarm('H001', 'HY-201', 'Hydraulic oil temp HIGH', 'HIGH', 'CLEARED', 45, 'Oil Temp', 62, 60),
    makeAlarm('H002', 'MT-301', 'Metal temperature LOW', 'MEDIUM', 'CLEARED', 120, 'Metal Temp', 658, 660),
    makeAlarm('H003', 'INJ-401', 'Phase 2 velocity deviation', 'LOW', 'CLEARED', 200, 'Ph2 Velocity', 3.2, 3.5),
    makeAlarm('H004', 'CL-501', 'Cooling circuit CC4 flow LOW', 'MEDIUM', 'CLEARED', 380, 'CC4 Flow', 3.8, 4.5),
    makeAlarm('H005', 'TH-102', 'Cover Zone C1 temp HIGH', 'LOW', 'CLEARED', 420, 'C1 Die Temp', 215, 205),
  ];

  const p1v = 0.22;
  const p2v = 4.4;
  const intP = 520;

  return {
    machineId: 'HPDC-01',
    machineName: 'Bühler Evolution 530D',
    status: 'RUNNING',
    alloy: 'A380 (AlSi8Cu3)',
    partNumber: 'GBX-HOUSING-LH',
    moldId: 'M-2241',
    operatorId: 'OP-007',

    injection: {
      phase1Velocity: p1v,
      phase1Distance: 320,
      phase2Velocity: p2v,
      phase2SwitchoverPosition: 320,
      intensificationPressure: intP,
      intensificationDelay: 12,
      intensificationTime: 1800,
    },

    currentShotTrace: generatePlungerTrace(p1v, p2v, intP),
    lastShot: shotHistory[shotHistory.length - 1],
    shotHistory,

    dieThermal: {
      coverDieZones: coverZones,
      ejectorDieZones: ejectorZones,
      coolingCircuits,
      dieSpray: {
        sprayTime: 4.5,
        lubricantConcentration: 2.0,
        airPressure: 3.8,
        coverSideZones: [true, true, true, false],
        ejectorSideZones: [true, true, true, false],
      },
    },

    furnace: {
      holdingFurnaceTemp: 695,
      holdingFurnaceSetpoint: 700,
      metalTempAtShot: 672,
      superheat: 92,
      shotWeight: 2.34,
      ladle: true,
    },

    hydraulic: {
      systemPressure: 185,
      accumulatorPressure: 160,
      accumulatorPrecharge: 95,
      oilTemperature: 48,
      oilLevel: 88,
      filterDeltaP: 0.8,
      pumpPressure: 188,
    },

    clamping: {
      clampingForce: 5200,
      clampingForceSetpoint: 5300,
      openingForce: 420,
      tieBarsOk: [true, true, true, true],
      dieProtectionOk: true,
      safetyDoorClosed: true,
    },

    timing: {
      totalCycleTime: 44.2,
      dieCloseTime: 4.1,
      injectionTime: 0.18,
      solidificationTime: 8.5,
      dieOpenTime: 3.8,
      ejectionTime: 1.2,
      sprayTime: 4.5,
      robotPickTime: 6.0,
    },

    vacuum: {
      enabled: true,
      targetVacuum: 150,
      actualVacuum: 163,
      valveOpenPosition: 12,
      evacuationTime: 185,
    },

    setpoints: {
      injection: {
        phase1Velocity: p1v,
        phase1Distance: 320,
        phase2Velocity: p2v,
        phase2SwitchoverPosition: 320,
        intensificationPressure: intP,
        intensificationDelay: 12,
        intensificationTime: 1800,
      },
      metalTemp: 675,
      holdingFurnaceTemp: 700,
      clampingForce: 5300,
      solidificationTime: 8.5,
      dieSprayTime: 4.5,
      dieSprayConcentration: 2.0,
      coolingTime: 8.0,
      dieOpenSpeed: 180,
      ejectionSpeed: 120,
      corePull1Time: 1.8,
      corePull2Time: 2.1,
      vacuumTarget: 150,
    },

    production: {
      shotCounter: 1300,
      goodParts,
      scrapParts,
      scrapRate: Math.round((scrapParts / 100) * 1000) / 10,
      oee: rand(78, 88, 1),
      availability: rand(90, 96, 1),
      performance: rand(85, 95, 1),
      quality: Math.round((goodParts / 100) * 1000) / 10,
      plannedCycleTime: 42,
      actualAvgCycleTime: 44.2,
      shiftStart: new Date(now.getTime() - 4.5 * 3600000),
      shiftParts: goodParts,
      shiftTarget: 320,
    },

    activeAlarms,
    alarmHistory: [...activeAlarms, ...alarmHistory],
  };
}

// ─── Live update — called every second ───────────────────────────────────
export function applyLiveUpdate(prev: HPDCMachineState): HPDCMachineState {
  const running = prev.status === 'RUNNING';

  if (!running) return prev;

  // Drift temperatures slightly
  const dieThermal = {
    ...prev.dieThermal,
    coverDieZones: prev.dieThermal.coverDieZones.map((z) => ({
      ...z,
      actual: clamp(z.actual + rand(-0.8, 0.8), z.setpoint - 20, z.setpoint + 20),
    })),
    ejectorDieZones: prev.dieThermal.ejectorDieZones.map((z) => ({
      ...z,
      actual: clamp(z.actual + rand(-0.8, 0.8), z.setpoint - 20, z.setpoint + 20),
    })),
    coolingCircuits: prev.dieThermal.coolingCircuits.map((c) => ({
      ...c,
      flowRate: clamp(c.flowRate + rand(-0.2, 0.2), 0.5, c.setpointFlow * 1.3),
      outletTemp: clamp(c.outletTemp + rand(-0.3, 0.3), c.inletTemp + 10, c.inletTemp + 30),
    })),
  };

  const hydraulic = {
    ...prev.hydraulic,
    systemPressure: clamp(prev.hydraulic.systemPressure + rand(-2, 2), 170, 200),
    oilTemperature: clamp(prev.hydraulic.oilTemperature + rand(-0.1, 0.15), 38, 65),
    accumulatorPressure: clamp(prev.hydraulic.accumulatorPressure + rand(-1, 1), 140, 175),
  };

  const furnace = {
    ...prev.furnace,
    holdingFurnaceTemp: clamp(prev.furnace.holdingFurnaceTemp + rand(-1, 1), 680, 715),
    metalTempAtShot: clamp(prev.furnace.metalTempAtShot + rand(-0.5, 0.5), 660, 690),
  };

  return {
    ...prev,
    dieThermal,
    hydraulic,
    furnace,
    timing: {
      ...prev.timing,
      totalCycleTime: clamp(prev.timing.totalCycleTime + rand(-0.5, 0.5), 38, 58),
    },
  };
}

// ─── Simulate a new shot completion ──────────────────────────────────────
export function simulateNewShot(prev: HPDCMachineState): HPDCMachineState {
  const newShotNum = prev.production.shotCounter + 1;
  const newShot = generateShotRecord(newShotNum);
  const updatedHistory = [...prev.shotHistory.slice(-99), newShot];

  const goodParts = updatedHistory.filter((s) => s.isGoodPart).length;
  const scrapParts = updatedHistory.length - goodParts;

  const newTrace = generatePlungerTrace(
    prev.injection.phase1Velocity,
    prev.injection.phase2Velocity,
    prev.injection.intensificationPressure
  );

  return {
    ...prev,
    lastShot: newShot,
    shotHistory: updatedHistory,
    currentShotTrace: newTrace,
    production: {
      ...prev.production,
      shotCounter: newShotNum,
      goodParts: prev.production.goodParts + (newShot.isGoodPart ? 1 : 0),
      scrapParts: prev.production.scrapParts + (newShot.isGoodPart ? 0 : 1),
      scrapRate: Math.round((scrapParts / updatedHistory.length) * 1000) / 10,
      quality: Math.round((goodParts / updatedHistory.length) * 1000) / 10,
      shiftParts: prev.production.shiftParts + (newShot.isGoodPart ? 1 : 0),
    },
    timing: {
      ...prev.timing,
      totalCycleTime: newShot.cycleTime,
    },
    furnace: {
      ...prev.furnace,
      metalTempAtShot: newShot.metalTemp,
    },
  };
}
