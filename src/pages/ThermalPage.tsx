import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ReferenceLine, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { Thermometer, Droplets, Wind, Activity } from 'lucide-react';
import clsx from 'clsx';
import { useHPDCStore } from '../store/hpdcStore';

function TempZoneCard({ zone }: { zone: { zoneId: string; zoneName: string; actual: number; setpoint: number; deviation: number; status: string } }) {
  const statusColors = {
    OK:    'border-green-500/30 bg-green-500/5',
    HIGH:  'border-yellow-500/40 bg-yellow-500/5',
    LOW:   'border-blue-500/40 bg-blue-500/5',
    ALARM: 'border-red-500/40 bg-red-500/10',
  };
  const valColors = {
    OK:    'text-green-400',
    HIGH:  'text-yellow-400',
    LOW:   'text-blue-400',
    ALARM: 'text-red-400',
  };
  const st = zone.status as keyof typeof statusColors;
  const pct = Math.min(Math.max((zone.actual - 140) / (250 - 140) * 100, 0), 100);
  const spPct = Math.min(Math.max((zone.setpoint - 140) / (250 - 140) * 100, 0), 100);

  return (
    <div className={clsx('rounded-xl border p-3 flex flex-col gap-2', statusColors[st])}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 font-medium">{zone.zoneName}</span>
        <span className={clsx('text-xs font-bold px-1.5 py-0.5 rounded', valColors[st],
          st === 'ALARM' ? 'bg-red-500/20' : st === 'HIGH' ? 'bg-yellow-500/10' : st === 'LOW' ? 'bg-blue-500/10' : 'bg-green-500/10'
        )}>{zone.status}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className={clsx('text-2xl font-bold font-mono', valColors[st])}>{zone.actual}°</span>
        <span className="text-gray-500 text-xs mb-1">SP: {zone.setpoint}°C</span>
        <span className={clsx('text-xs mb-1 ml-auto', zone.deviation > 0 ? 'text-orange-400' : 'text-blue-400')}>
          {zone.deviation > 0 ? '+' : ''}{zone.deviation}°
        </span>
      </div>
      {/* Bar */}
      <div className="relative h-2 bg-[#21262d] rounded-full overflow-visible">
        <div
          className={clsx('absolute h-full rounded-full transition-all duration-500', valColors[st].replace('text-', 'bg-').replace('-400', '-500/60'))}
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-gray-300 rounded"
          style={{ left: `${spPct}%` }}
          title={`Setpoint: ${zone.setpoint}°C`}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-600">
        <span>140°C</span>
        <span>250°C</span>
      </div>
    </div>
  );
}

function CoolingCircuitRow({ circuit }: { circuit: any }) {
  const flowPct = Math.min((circuit.flowRate / circuit.setpointFlow) * 100, 130);
  const flowOk = flowPct >= 80 && flowPct <= 120;
  const flowColor = flowOk ? 'text-green-400' : 'text-yellow-400';
  return (
    <div className="flex items-center gap-3 py-2 border-b border-[#21262d] last:border-0">
      <div className="w-20 shrink-0">
        <p className="text-xs text-white font-medium truncate">{circuit.name}</p>
        <p className="text-[10px] text-gray-500">{circuit.circuitId}</p>
      </div>
      <div className="flex items-center gap-1 w-20 shrink-0">
        <Thermometer size={10} className="text-orange-400" />
        <span className="text-xs font-mono text-orange-400">{circuit.inletTemp}°</span>
        <span className="text-gray-600 text-xs">→</span>
        <span className="text-xs font-mono text-red-400">{circuit.outletTemp}°</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className={clsx('text-xs font-mono font-bold', flowColor)}>{circuit.flowRate.toFixed(1)}</span>
          <span className="text-[10px] text-gray-500">/{circuit.setpointFlow} L/min</span>
        </div>
        <div className="h-1.5 bg-[#21262d] rounded-full">
          <div
            className={clsx('h-full rounded-full transition-all', flowOk ? 'bg-green-500' : 'bg-yellow-500')}
            style={{ width: `${Math.min(flowPct, 100)}%` }}
          />
        </div>
      </div>
      <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0', circuit.isActive ? 'bg-green-500/15 text-green-400' : 'bg-gray-500/15 text-gray-400')}>
        {circuit.isActive ? 'ON' : 'OFF'}
      </span>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-2 text-xs space-y-1">
      <p className="text-gray-400">Shot #{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: <span className="font-mono">{p.value}°C</span></p>
      ))}
    </div>
  );
};

export function ThermalPage() {
  const machine = useHPDCStore((s) => s.machine);
  const { dieThermal, furnace, shotHistory } = machine;
  const last50 = shotHistory.slice(-50);

  // Build die temp trend from shot history
  const dieTempTrend = last50.map((s) => ({
    shot: s.shotNumber,
    dieTemp: s.dieTemp,
    metalTemp: s.metalTemp,
  }));

  // Radar data for die temperature balance
  const radarData = [
    ...dieThermal.coverDieZones.map((z) => ({ zone: z.zoneId, temp: z.actual, setpoint: z.setpoint })),
    ...dieThermal.ejectorDieZones.map((z) => ({ zone: z.zoneId, temp: z.actual, setpoint: z.setpoint })),
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Die half overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cover (Fixed) Die */}
        <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4">
          <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-4">
            <Thermometer size={14} className="text-orange-400" />
            Cover Die (Fixed Half)
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {dieThermal.coverDieZones.map((z) => (
              <TempZoneCard key={z.zoneId} zone={z} />
            ))}
          </div>
        </div>

        {/* Ejector (Moving) Die */}
        <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4">
          <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-4">
            <Thermometer size={14} className="text-cyan-400" />
            Ejector Die (Moving Half)
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {dieThermal.ejectorDieZones.map((z) => (
              <TempZoneCard key={z.zoneId} zone={z} />
            ))}
          </div>
        </div>
      </div>

      {/* Cooling circuits + furnace + spray */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cooling circuits */}
        <div className="md:col-span-2 bg-[#161b22] rounded-xl border border-[#21262d] p-4">
          <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-3">
            <Droplets size={14} className="text-blue-400" /> Cooling Circuits
          </h2>
          <div>
            {dieThermal.coolingCircuits.map((c) => (
              <CoolingCircuitRow key={c.circuitId} circuit={c} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {/* Furnace */}
          <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4">
            <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-3">
              <Activity size={14} className="text-orange-400" /> Holding Furnace
            </h2>
            <FurnaceRow label="Furnace Temp" value={furnace.holdingFurnaceTemp} sp={furnace.holdingFurnaceSetpoint} unit="°C" />
            <FurnaceRow label="Metal at Shot" value={furnace.metalTempAtShot} sp={675} unit="°C" />
            <FurnaceRow label="Superheat" value={furnace.superheat} sp={90} unit="°C" />
            <FurnaceRow label="Shot Weight" value={furnace.shotWeight} sp={2.34} unit="kg" decimals={2} />
          </div>

          {/* Die Spray */}
          <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4">
            <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-3">
              <Wind size={14} className="text-teal-400" /> Die Spray
            </h2>
            <FurnaceRow label="Spray Time" value={dieThermal.dieSpray.sprayTime} sp={4.5} unit="s" decimals={1} />
            <FurnaceRow label="Concentration" value={dieThermal.dieSpray.lubricantConcentration} sp={2.0} unit="%" decimals={1} />
            <FurnaceRow label="Air Pressure" value={dieThermal.dieSpray.airPressure} sp={3.8} unit="bar" decimals={1} />
          </div>
        </div>
      </div>

      {/* Temperature trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Die & Metal Temp Trend — Last 50 Shots</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dieTempTrend} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="shot" tick={{ fontSize: 9, fill: '#6b7280' }} interval={9} />
              <YAxis domain={[150, 750]} tick={{ fontSize: 10, fill: '#6b7280' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={660} stroke="#fb923c" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: 'Min Metal', fill: '#fb923c', fontSize: 9 }} />
              <ReferenceLine y={200} stroke="#22d3ee" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: 'SP Die', fill: '#22d3ee', fontSize: 9 }} />
              <Line type="monotone" dataKey="metalTemp" stroke="#fb923c" dot={false} strokeWidth={2} name="Metal Temp (°C)" />
              <Line type="monotone" dataKey="dieTemp" stroke="#22d3ee" dot={false} strokeWidth={2} name="Die Avg Temp (°C)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Temperature balance radar */}
        <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Die Temperature Balance</h2>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#21262d" />
              <PolarAngleAxis dataKey="zone" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <PolarRadiusAxis angle={30} domain={[140, 230]} tick={{ fontSize: 9, fill: '#6b7280' }} />
              <Radar name="Actual" dataKey="temp" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.25} />
              <Radar name="Setpoint" dataKey="setpoint" stroke="#4ade80" fill="#4ade80" fillOpacity={0.1} strokeDasharray="4 4" />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function FurnaceRow({ label, value, sp, unit, decimals = 0 }: {
  label: string; value: number; sp: number; unit: string; decimals?: number;
}) {
  const dev = Math.abs(value - sp);
  const devPct = sp !== 0 ? dev / sp : 0;
  const valColor = devPct < 0.02 ? 'text-green-400' : devPct < 0.05 ? 'text-yellow-400' : 'text-red-400';
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[#21262d] last:border-0">
      <span className="text-xs text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className={clsx('text-sm font-mono font-bold', valColor)}>{value.toFixed(decimals)}</span>
        <span className="text-xs text-gray-500">{unit}</span>
        <span className="text-[10px] text-gray-600">(SP:{sp.toFixed(decimals)})</span>
      </div>
    </div>
  );
}
