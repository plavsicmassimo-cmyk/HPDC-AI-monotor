import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Legend, ReferenceLine, BarChart, Bar, Cell, ScatterChart, Scatter, ZAxis,
  ComposedChart, Area,
} from 'recharts';
import { BarChart2, TrendingUp, Cpu, Target } from 'lucide-react';
import clsx from 'clsx';
import { useHPDCStore } from '../store/hpdcStore';

// ─── Stats helpers ─────────────────────────────────────────────────────────
function stats(data: number[]) {
  if (data.length === 0) return { mean: 0, std: 0, min: 0, max: 0, cpk: 0 };
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const std = Math.sqrt(data.map((v) => (v - mean) ** 2).reduce((a, b) => a + b, 0) / data.length);
  const min = Math.min(...data);
  const max = Math.max(...data);
  return { mean, std, min, max };
}

function cpk(data: number[], lsl: number, usl: number) {
  const { mean, std } = stats(data);
  if (std === 0) return 99;
  const cpu = (usl - mean) / (3 * std);
  const cpl = (mean - lsl) / (3 * std);
  return Math.min(cpu, cpl);
}

// ─── Histogram helper ─────────────────────────────────────────────────────
function histogram(data: number[], bins = 12): { bin: string; count: number; color: string }[] {
  if (data.length === 0) return [];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const binWidth = (max - min) / bins || 1;
  const counts = Array(bins).fill(0);
  data.forEach((v) => {
    const i = Math.min(Math.floor((v - min) / binWidth), bins - 1);
    counts[i]++;
  });
  return counts.map((count, i) => ({
    bin: (min + i * binWidth + binWidth / 2).toFixed(1),
    count,
    color: count === Math.max(...counts) ? '#22d3ee' : '#22d3ee80',
  }));
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-2 text-xs space-y-1">
      <p className="text-gray-400">Shot #{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color ?? '#22d3ee' }}>
          {p.name}: <span className="font-mono font-bold">{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Stat card ─────────────────────────────────────────────────────────────
function StatCard({ label, value, unit, good, detail }: { label: string; value: string; unit?: string; good?: boolean; detail?: string }) {
  return (
    <div className={clsx('bg-[#0d1117] rounded-lg border p-3', good === undefined ? 'border-[#21262d]' : good ? 'border-green-500/25' : 'border-yellow-500/25')}>
      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-end gap-1">
        <span className={clsx('text-lg font-bold font-mono', good === undefined ? 'text-white' : good ? 'text-green-400' : 'text-yellow-400')}>{value}</span>
        {unit && <span className="text-xs text-gray-500 mb-0.5">{unit}</span>}
      </div>
      {detail && <p className="text-[10px] text-gray-500 mt-0.5">{detail}</p>}
    </div>
  );
}

// ─── Parameter analysis panel ──────────────────────────────────────────────
function ParameterAnalysis({ title, data, sp, lsl, usl, unit, color }: {
  title: string; data: number[]; sp: number; lsl: number; usl: number; unit: string; color: string;
}) {
  const s = stats(data);
  const ck = cpk(data, lsl, usl);
  const hist = histogram(data);
  const chartData = data.map((v, i) => ({ i: i + 1, value: v }));

  return (
    <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <StatCard label="Mean" value={s.mean.toFixed(2)} unit={unit} />
        <StatCard label="Std Dev" value={s.std.toFixed(3)} unit={unit} />
        <StatCard label="Cpk" value={ck.toFixed(2)} good={ck >= 1.33} detail={ck >= 1.67 ? 'Excellent' : ck >= 1.33 ? 'Capable' : ck >= 1.0 ? 'Marginal' : 'Not capable'} />
        <StatCard label="Range" value={`${s.min.toFixed(1)} – ${s.max.toFixed(1)}`} unit={unit} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Run chart */}
        <div>
          <p className="text-[10px] text-gray-500 mb-1">Run Chart</p>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={chartData} margin={{ top: 2, right: 4, bottom: 0, left: -20 }}>
              <XAxis dataKey="i" hide />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9, fill: '#6b7280' }} />
              <ReferenceLine y={sp} stroke={color} strokeDasharray="3 3" strokeOpacity={0.6} />
              <ReferenceLine y={lsl} stroke="#f87171" strokeDasharray="2 2" strokeOpacity={0.5} />
              <ReferenceLine y={usl} stroke="#f87171" strokeDasharray="2 2" strokeOpacity={0.5} />
              <Line type="monotone" dataKey="value" stroke={color} dot={false} strokeWidth={1.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Histogram */}
        <div>
          <p className="text-[10px] text-gray-500 mb-1">Distribution</p>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={hist} margin={{ top: 2, right: 4, bottom: 0, left: -20 }}>
              <XAxis dataKey="bin" tick={{ fontSize: 8, fill: '#6b7280' }} interval={3} />
              <YAxis hide />
              <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                {hist.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── AI Insights ────────────────────────────────────────────────────────────
function AIInsights({ data }: { data: any[] }) {
  const insights = useMemo(() => {
    const ph2Vels = data.map((s) => s.phase2Velocity);
    const cycleTimes = data.map((s) => s.cycleTime);
    const scrapRate = (data.filter((s) => !s.isGoodPart).length / data.length) * 100;
    const { std: velStd } = stats(ph2Vels);
    const { mean: avgCycle } = stats(cycleTimes);

    const msgs: { type: 'info' | 'warn' | 'ok'; text: string }[] = [];

    if (scrapRate > 5) msgs.push({ type: 'warn', text: `Scrap rate (${scrapRate.toFixed(1)}%) exceeds 5% threshold. Review injection parameters and metal temperature.` });
    else msgs.push({ type: 'ok', text: `Scrap rate (${scrapRate.toFixed(1)}%) is within acceptable limits.` });

    if (velStd > 0.15) msgs.push({ type: 'warn', text: `Phase 2 velocity std dev (±${velStd.toFixed(3)} m/s) indicates high variation. Check accumulator pressure and hydraulic seals.` });
    else msgs.push({ type: 'ok', text: `Phase 2 velocity is stable (±${velStd.toFixed(3)} m/s). Hydraulic system performing well.` });

    if (avgCycle > 50) msgs.push({ type: 'warn', text: `Average cycle time (${avgCycle.toFixed(1)}s) is above target. Review solidification time and spray sequence.` });
    else msgs.push({ type: 'info', text: `Average cycle time is ${avgCycle.toFixed(1)}s. Consider reducing solidification time by 0.5s to improve throughput.` });

    msgs.push({ type: 'info', text: 'Die temperature zones show ±8°C variation. Ensure cooling circuits are balanced to minimize thermal gradient.' });
    msgs.push({ type: 'info', text: 'Plunger tip wear indicator: last 500 shots show slight peak pressure decline. Schedule tip inspection at next die change.' });

    return msgs;
  }, [data]);

  return (
    <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4">
      <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-4">
        <Cpu size={14} className="text-cyan-400" /> AI Process Insights
      </h3>
      <div className="space-y-3">
        {insights.map((ins, i) => (
          <div
            key={i}
            className={clsx(
              'flex items-start gap-3 p-3 rounded-lg border',
              ins.type === 'warn' ? 'bg-yellow-500/5 border-yellow-500/20' :
              ins.type === 'ok'   ? 'bg-green-500/5 border-green-500/20' :
              'bg-blue-500/5 border-blue-500/20'
            )}
          >
            <span className="text-lg leading-none mt-0.5">
              {ins.type === 'warn' ? '⚠️' : ins.type === 'ok' ? '✅' : '💡'}
            </span>
            <p className="text-xs text-gray-300 leading-relaxed">{ins.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsPage() {
  const machine = useHPDCStore((s) => s.machine);
  const { shotHistory, setpoints } = machine;

  const [window_, setWindow] = useState<20 | 50 | 100>(50);
  const data = shotHistory.slice(-window_);

  const ph2Vels    = data.map((s) => s.phase2Velocity);
  const cycleTimes = data.map((s) => s.cycleTime);
  const intPresses = data.map((s) => s.intensificationPressure);
  const metalTemps = data.map((s) => s.metalTemp);

  // OEE decomposition
  const oeeData = [
    { name: 'Availability', value: machine.production.availability, target: 95 },
    { name: 'Performance',  value: machine.production.performance,  target: 90 },
    { name: 'Quality',      value: machine.production.quality,      target: 97 },
    { name: 'OEE',          value: machine.production.oee,          target: 85 },
  ];

  // Scatterplot: Ph2 velocity vs peak pressure
  const scatterData = data.map((s) => ({
    x: s.phase2Velocity,
    y: s.peakPressure,
    z: s.isGoodPart ? 1 : 0,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Window selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <BarChart2 size={14} className="text-cyan-400" /> Statistical Process Control
        </h2>
        <div className="flex gap-2">
          {([20, 50, 100] as const).map((w) => (
            <button
              key={w}
              onClick={() => setWindow(w)}
              className={clsx(
                'px-3 py-1 rounded-lg text-xs font-medium border transition-all',
                window_ === w
                  ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                  : 'text-gray-400 border-[#30363d] hover:text-white'
              )}
            >
              Last {w}
            </button>
          ))}
        </div>
      </div>

      {/* OEE decomposition */}
      <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-4">
          <Target size={14} className="text-green-400" /> OEE Decomposition
        </h3>
        <div className="grid grid-cols-4 gap-4 mb-4">
          {oeeData.map((d) => (
            <div key={d.name} className="text-center">
              <p className="text-xs text-gray-400 mb-2">{d.name}</p>
              <div className="relative h-2 bg-[#21262d] rounded-full mb-2">
                <div
                  className={clsx('absolute h-full rounded-full transition-all', d.value >= d.target ? 'bg-green-500' : d.value >= d.target * 0.95 ? 'bg-yellow-500' : 'bg-red-500')}
                  style={{ width: `${d.value}%` }}
                />
              </div>
              <p className={clsx('text-xl font-bold font-mono', d.value >= d.target ? 'text-green-400' : d.value >= d.target * 0.95 ? 'text-yellow-400' : 'text-red-400')}>
                {d.value.toFixed(1)}%
              </p>
              <p className="text-[10px] text-gray-500">Target: {d.target}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Parameter SPC */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ParameterAnalysis
          title="Phase 2 Velocity"
          data={ph2Vels}
          sp={setpoints.injection.phase2Velocity}
          lsl={setpoints.injection.phase2Velocity * 0.88}
          usl={setpoints.injection.phase2Velocity * 1.12}
          unit="m/s"
          color="#22d3ee"
        />
        <ParameterAnalysis
          title="Intensification Pressure"
          data={intPresses}
          sp={setpoints.injection.intensificationPressure}
          lsl={setpoints.injection.intensificationPressure * 0.85}
          usl={setpoints.injection.intensificationPressure * 1.15}
          unit="bar"
          color="#a78bfa"
        />
        <ParameterAnalysis
          title="Cycle Time"
          data={cycleTimes}
          sp={machine.production.plannedCycleTime}
          lsl={machine.production.plannedCycleTime * 0.85}
          usl={machine.production.plannedCycleTime * 1.2}
          unit="s"
          color="#4ade80"
        />
        <ParameterAnalysis
          title="Metal Temperature"
          data={metalTemps}
          sp={setpoints.metalTemp}
          lsl={setpoints.metalTemp - 20}
          usl={setpoints.metalTemp + 15}
          unit="°C"
          color="#fb923c"
        />
      </div>

      {/* Scatter: Ph2 vel vs pressure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Ph2 Velocity vs Peak Pressure Correlation</h3>
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart margin={{ top: 4, right: 8, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis
                type="number" dataKey="x" name="Ph2 Vel" unit=" m/s"
                tick={{ fontSize: 10, fill: '#6b7280' }}
                label={{ value: 'Phase 2 Velocity (m/s)', position: 'insideBottom', offset: -12, fontSize: 10, fill: '#6b7280' }}
              />
              <YAxis
                type="number" dataKey="y" name="Peak Pressure" unit=" bar"
                tick={{ fontSize: 10, fill: '#6b7280' }}
              />
              <ZAxis type="number" dataKey="z" range={[20, 60]} />
              <Tooltip
                contentStyle={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, fontSize: 11 }}
                cursor={{ strokeDasharray: '3 3' }}
              />
              <Scatter
                data={scatterData.filter((d) => d.z === 1)}
                fill="#4ade80"
                name="Good"
                fillOpacity={0.7}
              />
              <Scatter
                data={scatterData.filter((d) => d.z === 0)}
                fill="#f87171"
                name="Scrap"
                fillOpacity={0.9}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Shot quality timeline */}
        <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Shot Quality Timeline</h3>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={data.map((s) => ({ shot: s.shotNumber, good: s.isGoodPart ? 1 : 0, cycleTime: s.cycleTime }))}
              margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="shot" tick={{ fontSize: 9, fill: '#6b7280' }} interval={Math.floor(data.length / 8)} />
              <YAxis yAxisId="ct" domain={[30, 65]} tick={{ fontSize: 9, fill: '#6b7280' }} />
              <YAxis yAxisId="q" orientation="right" domain={[0, 1.2]} hide />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area yAxisId="ct" type="monotone" dataKey="cycleTime" fill="#22d3ee20" stroke="#22d3ee" strokeWidth={1.5} dot={false} name="Cycle Time (s)" />
              <Bar yAxisId="q" dataKey="good" name="Good Part" barSize={3}>
                {data.map((s, i) => (
                  <Cell key={i} fill={s.isGoodPart ? '#4ade80' : '#f87171'} />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights */}
      <AIInsights data={data} />
    </div>
  );
}
