import React, { useState } from 'react';
import { Save, RotateCcw, Edit3, Lock, Unlock, ChevronDown, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { useHPDCStore } from '../store/hpdcStore';
import type { ProcessSetpoints } from '../types/hpdc';

interface ParameterDef {
  key: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  decimals: number;
  description: string;
  critical?: boolean;
}

const PARAMETER_GROUPS: { id: string; label: string; color: string; params: ParameterDef[] }[] = [
  {
    id: 'injection',
    label: 'Injection System',
    color: 'cyan',
    params: [
      { key: 'injection.phase1Velocity',            label: 'Phase 1 Velocity',          unit: 'm/s',  min: 0.05, max: 0.8,   step: 0.01,  decimals: 3, description: 'Slow shot velocity to fill shot sleeve', critical: false },
      { key: 'injection.phase1Distance',            label: 'Phase 1 Distance',           unit: 'mm',   min: 100,  max: 450,   step: 5,     decimals: 0, description: 'Plunger travel in Phase 1' },
      { key: 'injection.phase2Velocity',            label: 'Phase 2 Velocity',           unit: 'm/s',  min: 1.0,  max: 8.0,   step: 0.1,   decimals: 2, description: 'Fast shot velocity to fill cavity', critical: true },
      { key: 'injection.phase2SwitchoverPosition',  label: 'Switchover Position',        unit: 'mm',   min: 200,  max: 450,   step: 5,     decimals: 0, description: 'Plunger position for P1→P2 transition', critical: true },
      { key: 'injection.intensificationPressure',   label: 'Intensification Pressure',   unit: 'bar',  min: 200,  max: 750,   step: 10,    decimals: 0, description: 'Hydraulic pressure applied during solidification', critical: true },
      { key: 'injection.intensificationDelay',      label: 'Intensification Delay',      unit: 'ms',   min: 0,    max: 80,    step: 1,     decimals: 0, description: 'Delay before intensification valve opens' },
      { key: 'injection.intensificationTime',       label: 'Intensification Hold Time',  unit: 'ms',   min: 500,  max: 5000,  step: 100,   decimals: 0, description: 'Duration to hold intensification pressure' },
    ],
  },
  {
    id: 'metal',
    label: 'Metal & Furnace',
    color: 'orange',
    params: [
      { key: 'metalTemp',           label: 'Metal Temp Setpoint',    unit: '°C',  min: 620, max: 730, step: 5,   decimals: 0, description: 'Target molten metal temperature at shot', critical: true },
      { key: 'holdingFurnaceTemp',  label: 'Holding Furnace Temp',   unit: '°C',  min: 640, max: 750, step: 5,   decimals: 0, description: 'Holding furnace temperature setpoint' },
    ],
  },
  {
    id: 'clamping',
    label: 'Clamping',
    color: 'purple',
    params: [
      { key: 'clampingForce',  label: 'Clamping Force',    unit: 'kN',    min: 1000, max: 7000, step: 100, decimals: 0, description: 'Die clamping force during injection', critical: true },
      { key: 'dieOpenSpeed',   label: 'Die Opening Speed', unit: 'mm/s',  min: 50,   max: 400,  step: 10,  decimals: 0, description: 'Speed of platen opening' },
      { key: 'ejectionSpeed',  label: 'Ejection Speed',    unit: 'mm/s',  min: 50,   max: 300,  step: 10,  decimals: 0, description: 'Ejector plate speed' },
    ],
  },
  {
    id: 'timing',
    label: 'Timing & Sequence',
    color: 'green',
    params: [
      { key: 'solidificationTime',  label: 'Solidification Time',    unit: 's',  min: 3,   max: 30,  step: 0.5, decimals: 1, description: 'Wait time after injection before die opens', critical: true },
      { key: 'coolingTime',         label: 'Cooling Time',           unit: 's',  min: 2,   max: 20,  step: 0.5, decimals: 1, description: 'Additional cooling after intensification' },
      { key: 'corePull1Time',       label: 'Core Pull 1 Time',       unit: 's',  min: 0.5, max: 8,   step: 0.1, decimals: 1, description: 'Core pull 1 actuator time' },
      { key: 'corePull2Time',       label: 'Core Pull 2 Time',       unit: 's',  min: 0.5, max: 8,   step: 0.1, decimals: 1, description: 'Core pull 2 actuator time' },
    ],
  },
  {
    id: 'spray',
    label: 'Die Spray & Lubrication',
    color: 'teal',
    params: [
      { key: 'dieSprayTime',           label: 'Spray Time',         unit: 's',  min: 1,   max: 15, step: 0.5, decimals: 1, description: 'Die spray duration per cycle' },
      { key: 'dieSprayConcentration',  label: 'Lubricant Concentration', unit: '%', min: 0.5, max: 5,  step: 0.1, decimals: 1, description: 'Release agent dilution ratio' },
    ],
  },
  {
    id: 'vacuum',
    label: 'Vacuum System',
    color: 'blue',
    params: [
      { key: 'vacuumTarget',  label: 'Vacuum Target',  unit: 'mbar', min: 50, max: 800, step: 10, decimals: 0, description: 'Target vacuum level before injection' },
    ],
  },
];

// ─── Helper: nested key accessor ──────────────────────────────────────────
function getNestedValue(obj: ProcessSetpoints, key: string): number {
  const parts = key.split('.');
  let cur: any = obj;
  for (const p of parts) cur = cur?.[p];
  return cur as number;
}

function setNestedValue(obj: ProcessSetpoints, key: string, value: number): ProcessSetpoints {
  const parts = key.split('.');
  if (parts.length === 1) return { ...obj, [key]: value };
  const [head, ...rest] = parts;
  return {
    ...obj,
    [head]: setNestedValue((obj as any)[head], rest.join('.'), value),
  };
}

export function ParametersPage() {
  const machine = useHPDCStore((s) => s.machine);
  const updateSetpoints = useHPDCStore((s) => s.updateSetpoints);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<ProcessSetpoints>(machine.setpoints);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  const sp = editMode ? draft : machine.setpoints;

  function handleChange(key: string, value: number) {
    setDraft((prev) => setNestedValue(prev, key, value));
  }

  function handleSave() {
    updateSetpoints(draft);
    setSaved(true);
    setEditMode(false);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleDiscard() {
    setDraft(machine.setpoints);
    setEditMode(false);
  }

  function toggleGroup(id: string) {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const colorClasses: Record<string, string> = {
    cyan:   'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    orange: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    green:  'text-green-400 bg-green-400/10 border-green-400/20',
    teal:   'text-teal-400 bg-teal-400/10 border-teal-400/20',
    blue:   'text-blue-400 bg-blue-400/10 border-blue-400/20',
  };

  return (
    <div className="p-6 space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-[#161b22] rounded-xl border border-[#21262d] p-4">
        <div>
          <h2 className="text-white font-semibold">Process Parameter Setpoints</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Recipe: <span className="text-cyan-400 font-mono">{machine.partNumber}</span> — Mold: <span className="text-cyan-400 font-mono">{machine.moldId}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-xs text-green-400 font-medium bg-green-400/10 px-3 py-1.5 rounded-lg border border-green-400/20">
              ✓ Parameters saved
            </span>
          )}
          {editMode ? (
            <>
              <button
                onClick={handleDiscard}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#30363d] text-gray-400 text-xs hover:bg-[#21262d] transition-all"
              >
                <RotateCcw size={12} /> Discard
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-medium hover:bg-green-500/25 transition-all"
              >
                <Save size={12} /> Save to Machine
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-medium hover:bg-cyan-500/20 transition-all"
            >
              <Edit3 size={12} /> Edit Parameters
            </button>
          )}
        </div>
      </div>

      {/* Parameter groups */}
      {PARAMETER_GROUPS.map((group) => {
        const isOpen = !collapsed[group.id];
        const colorCls = colorClasses[group.color] ?? colorClasses['cyan'];
        return (
          <div key={group.id} className="bg-[#161b22] rounded-xl border border-[#21262d] overflow-hidden">
            {/* Group header */}
            <button
              onClick={() => toggleGroup(group.id)}
              className={clsx(
                'w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#0d1117] transition-colors',
              )}
            >
              <div className="flex items-center gap-2">
                <span className={clsx('text-xs font-bold px-2 py-0.5 rounded border', colorCls)}>{group.label.toUpperCase()}</span>
                <span className="text-xs text-gray-500">{group.params.length} parameters</span>
                {group.params.some((p) => p.critical) && (
                  <span className="text-[10px] text-yellow-400 bg-yellow-400/10 px-1.5 rounded border border-yellow-400/20">CRITICAL</span>
                )}
              </div>
              {isOpen ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
            </button>

            {isOpen && (
              <div className="border-t border-[#21262d]">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0">
                  {group.params.map((param, idx) => {
                    const currentVal = getNestedValue(machine.setpoints, param.key);
                    const draftVal = getNestedValue(draft, param.key);
                    const displayVal = getNestedValue(sp, param.key);
                    const changed = editMode && Math.abs(draftVal - currentVal) > 0.0001;
                    return (
                      <div
                        key={param.key}
                        className={clsx(
                          'p-4 border-b border-r border-[#21262d]',
                          changed && 'bg-yellow-500/5',
                          param.critical && 'relative'
                        )}
                      >
                        {param.critical && (
                          <span className="absolute top-2 right-2 text-[9px] text-yellow-400 bg-yellow-400/10 px-1 rounded border border-yellow-400/20">★</span>
                        )}
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className={clsx('text-xs font-medium', param.critical ? 'text-white' : 'text-gray-300')}>{param.label}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">{param.description}</p>
                          </div>
                        </div>
                        {editMode ? (
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="number"
                              min={param.min}
                              max={param.max}
                              step={param.step}
                              value={draftVal.toFixed(param.decimals)}
                              onChange={(e) => handleChange(param.key, parseFloat(e.target.value))}
                              className={clsx(
                                'flex-1 bg-[#0d1117] border rounded px-2 py-1.5 text-sm font-mono text-white focus:outline-none focus:ring-1 transition-all',
                                changed ? 'border-yellow-500/50 focus:ring-yellow-500/50' : 'border-[#30363d] focus:ring-cyan-500/50'
                              )}
                            />
                            <span className="text-xs text-gray-400 shrink-0 w-10 text-right">{param.unit}</span>
                          </div>
                        ) : (
                          <div className="flex items-end gap-2 mt-1">
                            <span className={clsx('text-xl font-bold font-mono', colorCls.split(' ')[0])}>
                              {displayVal.toFixed(param.decimals)}
                            </span>
                            <span className="text-gray-400 text-xs mb-0.5">{param.unit}</span>
                            <span className="text-[10px] text-gray-600 mb-0.5 ml-auto">[{param.min}–{param.max}]</span>
                          </div>
                        )}
                        {changed && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] text-gray-500">Was:</span>
                            <span className="text-[10px] font-mono text-gray-400">{currentVal.toFixed(param.decimals)} {param.unit}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Change summary when in edit mode */}
      {editMode && (() => {
        const changes: { label: string; from: number; to: number; unit: string }[] = [];
        for (const group of PARAMETER_GROUPS) {
          for (const param of group.params) {
            const from = getNestedValue(machine.setpoints, param.key);
            const to = getNestedValue(draft, param.key);
            if (Math.abs(to - from) > 0.0001) {
              changes.push({ label: param.label, from, to, unit: param.unit });
            }
          }
        }
        if (changes.length === 0) return null;
        return (
          <div className="bg-yellow-500/5 rounded-xl border border-yellow-500/20 p-4">
            <h3 className="text-sm font-semibold text-yellow-400 mb-3">Pending Changes ({changes.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {changes.map((c) => (
                <div key={c.label} className="flex items-center justify-between text-xs bg-[#0d1117] rounded-lg px-3 py-2">
                  <span className="text-gray-300 font-medium">{c.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-mono">{c.from.toFixed(2)}</span>
                    <span className="text-gray-600">→</span>
                    <span className="text-yellow-400 font-mono font-bold">{c.to.toFixed(2)}</span>
                    <span className="text-gray-500">{c.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
