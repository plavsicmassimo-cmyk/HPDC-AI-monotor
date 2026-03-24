import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  ReferenceLine, CartesianGrid, BarChart, Bar, Cell,
} from 'recharts';
import { Zap, ArrowRightLeft, Gauge } from 'lucide-react';
import { useHPDCStore } from '../store/hpdcStore';
import { GaugeChart } from '../components/common/GaugeChart';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-2 text-xs space-y-1">
      <p className="text-gray-400">t = {label} ms</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <span className="font-mono font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export function InjectionPage() {
  const machine = useHPDCStore((s) => s.machine);
  const { injection, currentShotTrace, lastShot, shotHistory } = machine;
  const [overlayShots, setOverlayShots] = useState(false);

  // Last 50 shots for charts
  const last50 = shotHistory.slice(-50);

  const phase2VelData = last50.map((s) => ({
    shot: s.shotNumber,
    actual: s.phase2Velocity,
    setpoint: injection.phase2Velocity,
  }));

  const peakPresData = last50.map((s) => ({
    shot: s.shotNumber,
    peak: s.peakPressure,
    int: s.intensificationPressure,
  }));

  const fillTimeData = last50.map((s) => ({ shot: s.shotNumber, value: s.fillTime }));

  // Compute stats
  const phase2Vels = last50.map((s) => s.phase2Velocity);
  const avgPh2 = phase2Vels.reduce((a, b) => a + b, 0) / phase2Vels.length;
  const stdPh2 = Math.sqrt(phase2Vels.map((v) => (v - avgPh2) ** 2).reduce((a, b) => a + b, 0) / phase2Vels.length);

  const intPressures = last50.map((s) => s.intensificationPressure);
  const avgIntP = intPressures.reduce((a, b) => a + b, 0) / intPressures.length;

  // Color cells by deviation from setpoint
  function velColor(v: number) {
    const dev = Math.abs(v - injection.phase2Velocity) / injection.phase2Velocity;
    if (dev < 0.03) return '#4ade80';
    if (dev < 0.08) return '#facc15';
    return '#f87171';
  }

  return (
    <div className="p-6 space-y-6">
      {/* Top gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4 flex flex-col items-center">
          <GaugeChart
            value={injection.phase1Velocity}
            min={0} max={0.8} unit="m/s" label="Phase 1 Vel."
            lowWarn={0.12} highWarn={0.4} lowAlarm={0.05} highAlarm={0.6}
            size={120} decimals={3}
          />
        </div>
        <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4 flex flex-col items-center">
          <GaugeChart
            value={lastShot?.phase2Velocity ?? injection.phase2Velocity}
            min={0} max={8} unit="m/s" label="Phase 2 Vel."
            lowWarn={3.5} highWarn={6.0} lowAlarm={2.5} highAlarm={7.0}
            size={120} decimals={2}
          />
        </div>
        <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4 flex flex-col items-center">
          <GaugeChart
            value={injection.intensificationPressure}
            min={0} max={800} unit="bar" label="Int. Pressure"
            lowWarn={400} highWarn={650} lowAlarm={300} highAlarm={700}
            size={120}
          />
        </div>
        <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4 flex flex-col items-center">
          <GaugeChart
            value={lastShot?.peakPressure ?? 380}
            min={0} max={700} unit="bar" label="Peak Pressure"
            lowWarn={280} highWarn={500} lowAlarm={200} highAlarm={600}
            size={120}
          />
        </div>
        <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4 flex flex-col items-center">
          <GaugeChart
            value={lastShot?.fillTime ?? 45}
            min={0} max={150} unit="ms" label="Fill Time"
            highWarn={80} highAlarm={110}
            size={120} decimals={1}
          />
        </div>
        <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4 flex flex-col items-center">
          <GaugeChart
            value={injection.intensificationDelay}
            min={0} max={50} unit="ms" label="Int. Delay"
            highWarn={20} highAlarm={30}
            size={120}
          />
        </div>
      </div>

      {/* Shot trace + settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Plunger trace */}
        <div className="lg:col-span-2 bg-[#161b22] rounded-xl border border-[#21262d] p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Zap size={14} className="text-cyan-400" /> Last Shot Plunger Trace
            </h2>
            <span className="text-xs text-gray-500 font-mono">Shot #{lastShot?.shotNumber}</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={currentShotTrace} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6b7280' }} label={{ value: 'Time (ms)', position: 'insideBottom', offset: -2, fontSize: 10, fill: '#6b7280' }} />
              <YAxis yAxisId="vel" orientation="left" tick={{ fontSize: 10, fill: '#22d3ee' }} label={{ value: 'Vel (m/s)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#22d3ee' }} />
              <YAxis yAxisId="pres" orientation="right" tick={{ fontSize: 10, fill: '#a78bfa' }} label={{ value: 'Pressure (bar)', angle: 90, position: 'insideRight', fontSize: 10, fill: '#a78bfa' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine yAxisId="vel" y={injection.phase1Velocity} stroke="#22d3ee" strokeDasharray="4 4" strokeOpacity={0.4} />
              <ReferenceLine yAxisId="vel" y={injection.phase2Velocity} stroke="#22d3ee" strokeDasharray="4 4" strokeOpacity={0.4} />
              <Line yAxisId="vel" type="monotone" dataKey="velocity" stroke="#22d3ee" dot={false} strokeWidth={2} name="Velocity (m/s)" />
              <Line yAxisId="pres" type="monotone" dataKey="pressure" stroke="#a78bfa" dot={false} strokeWidth={2} name="Pressure (bar)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Injection parameters panel */}
        <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4">
          <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-4">
            <Gauge size={14} className="text-cyan-400" /> Injection Settings
          </h2>
          <div className="space-y-3">
            <ParamRow label="Phase 1 Velocity" value={injection.phase1Velocity} unit="m/s" sp={injection.phase1Velocity} decimals={3} />
            <ParamRow label="Phase 1 Distance" value={injection.phase1Distance} unit="mm" sp={injection.phase1Distance} decimals={0} />
            <ParamRow label="Phase 2 Velocity" value={injection.phase2Velocity} unit="m/s" sp={injection.phase2Velocity} decimals={2} highlight />
            <ParamRow label="Switchover Position" value={injection.phase2SwitchoverPosition} unit="mm" sp={injection.phase2SwitchoverPosition} decimals={0} />
            <ParamRow label="Int. Pressure" value={injection.intensificationPressure} unit="bar" sp={injection.intensificationPressure} decimals={0} highlight />
            <ParamRow label="Int. Delay" value={injection.intensificationDelay} unit="ms" sp={injection.intensificationDelay} decimals={0} />
            <ParamRow label="Int. Time" value={injection.intensificationTime} unit="ms" sp={injection.intensificationTime} decimals={0} />
          </div>

          {/* Stats */}
          <div className="mt-4 pt-4 border-t border-[#21262d] space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Last 50 Shots Stats</p>
            <StatRow label="Avg Ph2 Vel." value={`${avgPh2.toFixed(3)} m/s`} />
            <StatRow label="Ph2 Vel. Std Dev" value={`±${stdPh2.toFixed(3)} m/s`} />
            <StatRow label="Avg Int. Pressure" value={`${avgIntP.toFixed(0)} bar`} />
          </div>
        </div>
      </div>

      {/* Phase 2 velocity trend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Phase 2 Velocity — Last 50 Shots</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={phase2VelData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="shot" tick={{ fontSize: 9, fill: '#6b7280' }} interval={9} />
              <YAxis domain={[3, 6]} tick={{ fontSize: 10, fill: '#6b7280' }} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={injection.phase2Velocity} stroke="#22d3ee" strokeDasharray="4 4" label={{ value: 'SP', fill: '#22d3ee', fontSize: 10 }} />
              <ReferenceLine y={injection.phase2Velocity * 0.93} stroke="#facc15" strokeDasharray="3 3" strokeOpacity={0.5} />
              <ReferenceLine y={injection.phase2Velocity * 1.07} stroke="#facc15" strokeDasharray="3 3" strokeOpacity={0.5} />
              <Bar dataKey="actual" name="Ph2 Velocity (m/s)" radius={[2, 2, 0, 0]}>
                {phase2VelData.map((entry, index) => (
                  <Cell key={index} fill={velColor(entry.actual)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Intensification Pressure — Last 50 Shots</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={peakPresData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="shot" tick={{ fontSize: 9, fill: '#6b7280' }} interval={9} />
              <YAxis domain={[250, 700]} tick={{ fontSize: 10, fill: '#6b7280' }} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={injection.intensificationPressure} stroke="#a78bfa" strokeDasharray="4 4" />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="peak" stroke="#a78bfa" dot={false} strokeWidth={1.5} name="Peak P (bar)" />
              <Line type="monotone" dataKey="int" stroke="#f472b6" dot={false} strokeWidth={1.5} name="Int. P (bar)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function ParamRow({ label, value, unit, sp, decimals, highlight }: {
  label: string; value: number; unit: string; sp: number; decimals: number; highlight?: boolean;
}) {
  const dev = sp !== 0 ? Math.abs((value - sp) / sp) : 0;
  const devColor = dev < 0.02 ? 'text-green-400' : dev < 0.06 ? 'text-yellow-400' : 'text-red-400';
  return (
    <div className={`flex items-center justify-between py-1.5 px-2 rounded ${highlight ? 'bg-[#0d1117]' : ''}`}>
      <span className={`text-xs ${highlight ? 'text-white font-medium' : 'text-gray-400'}`}>{label}</span>
      <div className="flex items-center gap-2">
        <span className={`font-mono text-sm font-bold ${devColor}`}>{value.toFixed(decimals)}</span>
        <span className="text-xs text-gray-500">{unit}</span>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-mono text-gray-300">{value}</span>
    </div>
  );
}
