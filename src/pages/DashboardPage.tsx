import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
  AreaChart, Area,
} from 'recharts';
import {
  Activity, Thermometer, Gauge, Droplets, Timer, Target,
  TrendingUp, AlertTriangle, CheckCircle, Package,
} from 'lucide-react';
import { useHPDCStore } from '../store/hpdcStore';
import { GaugeChart } from '../components/common/GaugeChart';
import { KPICard } from '../components/common/KPICard';
import { AlarmSeverityBadge } from '../components/common/StatusBadge';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-2 text-xs">
      <p className="text-gray-400 mb-1">Shot #{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export function DashboardPage() {
  const machine = useHPDCStore((s) => s.machine);
  const { production, furnace, hydraulic, clamping, timing, activeAlarms, shotHistory } = machine;

  // Last 30 shots for mini-charts
  const last30 = shotHistory.slice(-30);
  const cycleData = last30.map((s) => ({ shot: s.shotNumber, value: s.cycleTime, name: 'Cycle Time' }));
  const tempData  = last30.map((s) => ({ shot: s.shotNumber, value: s.metalTemp }));
  const pressData = last30.map((s) => ({ shot: s.shotNumber, value: s.peakPressure }));

  const oeeColor = production.oee >= 85 ? 'green' : production.oee >= 70 ? 'yellow' : 'red';

  return (
    <div className="p-6 space-y-6">
      {/* KPI Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <KPICard
          label="OEE"
          value={production.oee.toFixed(1)}
          unit="%"
          icon={TrendingUp}
          color={oeeColor}
          size="lg"
          subtitle={`A:${production.availability.toFixed(1)} P:${production.performance.toFixed(1)} Q:${production.quality.toFixed(1)}`}
        />
        <KPICard
          label="Shift Parts"
          value={production.shiftParts}
          unit={`/ ${production.shiftTarget}`}
          icon={Package}
          color="cyan"
          subtitle={`${Math.round((production.shiftParts / production.shiftTarget) * 100)}% of target`}
        />
        <KPICard
          label="Scrap Rate"
          value={production.scrapRate.toFixed(1)}
          unit="%"
          icon={AlertTriangle}
          color={production.scrapRate < 3 ? 'green' : production.scrapRate < 6 ? 'yellow' : 'red'}
          subtitle={`${production.scrapParts} pcs scrap`}
        />
        <KPICard
          label="Cycle Time"
          value={timing.totalCycleTime.toFixed(1)}
          unit="s"
          icon={Timer}
          color={timing.totalCycleTime <= timing.totalCycleTime * 1.1 ? 'green' : 'yellow'}
          subtitle={`Planned: ${production.plannedCycleTime}s`}
        />
        <KPICard
          label="Metal Temp"
          value={furnace.metalTempAtShot}
          unit="°C"
          icon={Thermometer}
          color={furnace.metalTempAtShot >= 660 && furnace.metalTempAtShot <= 690 ? 'green' : 'yellow'}
          subtitle={`Furnace: ${furnace.holdingFurnaceTemp}°C`}
        />
        <KPICard
          label="Hyd. Oil Temp"
          value={hydraulic.oilTemperature}
          unit="°C"
          icon={Droplets}
          color={hydraulic.oilTemperature < 55 ? 'green' : hydraulic.oilTemperature < 62 ? 'yellow' : 'red'}
          subtitle={`Pressure: ${hydraulic.systemPressure} bar`}
        />
      </div>

      {/* Main gauges + recent alarms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gauges panel */}
        <div className="lg:col-span-2 bg-[#161b22] rounded-xl border border-[#21262d] p-4">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Live Process Gauges</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 justify-items-center">
            <GaugeChart
              value={clamping.clampingForce}
              min={0}
              max={7000}
              unit="kN"
              label="Clamping Force"
              lowWarn={4500}
              highWarn={5800}
              highAlarm={6500}
            />
            <GaugeChart
              value={machine.lastShot?.intensificationPressure ?? 500}
              min={0}
              max={800}
              unit="bar"
              label="Int. Pressure"
              lowWarn={400}
              highWarn={650}
              lowAlarm={300}
              highAlarm={700}
            />
            <GaugeChart
              value={furnace.metalTempAtShot}
              min={580}
              max={760}
              unit="°C"
              label="Metal Temp"
              lowAlarm={655}
              lowWarn={662}
              highWarn={688}
              highAlarm={700}
            />
            <GaugeChart
              value={hydraulic.oilTemperature}
              min={20}
              max={80}
              unit="°C"
              label="Oil Temp"
              highWarn={55}
              highAlarm={62}
            />
            <GaugeChart
              value={hydraulic.systemPressure}
              min={100}
              max={250}
              unit="bar"
              label="Hyd. Pressure"
              lowWarn={160}
              highWarn={210}
              lowAlarm={140}
              highAlarm={230}
            />
            <GaugeChart
              value={machine.lastShot?.phase2Velocity ?? 4.4}
              min={0}
              max={8}
              unit="m/s"
              label="Ph2 Velocity"
              lowWarn={3.5}
              highWarn={6.0}
              lowAlarm={2.5}
              highAlarm={7.0}
              decimals={2}
            />
            <GaugeChart
              value={machine.vacuum.actualVacuum}
              min={0}
              max={1000}
              unit="mbar"
              label="Vacuum"
              highWarn={250}
              highAlarm={400}
            />
            <GaugeChart
              value={machine.timing.totalCycleTime}
              min={20}
              max={80}
              unit="s"
              label="Cycle Time"
              highWarn={52}
              highAlarm={60}
            />
          </div>
        </div>

        {/* Alarms panel */}
        <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-300">Active Alarms</h2>
            {activeAlarms.length > 0 ? (
              <span className="w-5 h-5 bg-red-500 rounded-full text-xs font-bold text-white flex items-center justify-center">
                {activeAlarms.length}
              </span>
            ) : (
              <CheckCircle size={16} className="text-green-400" />
            )}
          </div>

          {activeAlarms.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
              <CheckCircle size={32} className="text-green-400 opacity-60" />
              <p className="text-green-400 text-sm font-medium">No Active Alarms</p>
              <p className="text-gray-500 text-xs">All parameters within limits</p>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto flex-1">
              {activeAlarms.map((a) => (
                <div key={a.id} className="bg-[#0d1117] rounded-lg p-3 border border-red-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-gray-400">{a.code}</span>
                    <AlarmSeverityBadge severity={a.severity} />
                  </div>
                  <p className="text-sm text-white font-medium leading-tight">{a.description}</p>
                  {a.actualValue !== undefined && (
                    <p className="text-xs text-gray-400 mt-1">
                      Actual: <span className="text-red-400 font-mono">{a.actualValue}</span>
                      {a.limitValue !== undefined && <> | Limit: <span className="text-gray-300 font-mono">{a.limitValue}</span></>}
                    </p>
                  )}
                  <p className="text-[10px] text-gray-500 mt-1">{a.timestamp.toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mini trend charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MiniChart title="Cycle Time (s)" data={cycleData} color="#22d3ee" refLow={38} refHigh={52} unit="s" />
        <MiniChart title="Metal Temperature (°C)" data={tempData} color="#fb923c" refLow={660} refHigh={690} unit="°C" />
        <MiniChart title="Peak Pressure (bar)" data={pressData} color="#a78bfa" refLow={280} refHigh={450} unit="bar" />
      </div>

      {/* Production table - last 10 shots */}
      <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Last 10 Shots</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-[#21262d]">
                {['Shot#', 'Time', 'Cycle(s)', 'Fill(ms)', 'Ph1(m/s)', 'Ph2(m/s)', 'Peak P(bar)', 'Int P(bar)', 'Metal(°C)', 'Die(°C)', 'Weight(kg)', 'Result'].map((h) => (
                  <th key={h} className="text-left pb-2 pr-4 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d]">
              {shotHistory.slice(-10).reverse().map((s) => (
                <tr key={s.shotNumber} className="hover:bg-[#0d1117] transition-colors">
                  <td className="py-2 pr-4 font-mono text-gray-300">{s.shotNumber}</td>
                  <td className="py-2 pr-4 text-gray-400">{s.timestamp.toLocaleTimeString()}</td>
                  <td className="py-2 pr-4 font-mono text-white">{s.cycleTime.toFixed(1)}</td>
                  <td className="py-2 pr-4 font-mono text-white">{s.fillTime.toFixed(1)}</td>
                  <td className="py-2 pr-4 font-mono text-cyan-400">{s.phase1Velocity.toFixed(3)}</td>
                  <td className="py-2 pr-4 font-mono text-cyan-400">{s.phase2Velocity.toFixed(2)}</td>
                  <td className="py-2 pr-4 font-mono text-purple-400">{s.peakPressure}</td>
                  <td className="py-2 pr-4 font-mono text-purple-400">{s.intensificationPressure}</td>
                  <td className="py-2 pr-4 font-mono text-orange-400">{s.metalTemp}</td>
                  <td className="py-2 pr-4 font-mono text-orange-400">{s.dieTemp}</td>
                  <td className="py-2 pr-4 font-mono text-gray-300">{s.shotWeight.toFixed(2)}</td>
                  <td className="py-2 pr-4">
                    {s.isGoodPart ? (
                      <span className="text-green-400 font-bold">✓ OK</span>
                    ) : (
                      <span className="text-red-400 font-bold" title={s.scrapReason}>✗ Scrap</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MiniChart({ title, data, color, refLow, refHigh, unit }: {
  title: string; data: { shot: number; value: number }[]; color: string;
  refLow?: number; refHigh?: number; unit: string;
}) {
  const last = data[data.length - 1]?.value;
  const isOk = last !== undefined && (!refLow || last >= refLow) && (!refHigh || last <= refHigh);
  return (
    <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs text-gray-400 font-medium">{title}</h3>
        <span className="text-xs font-mono" style={{ color: isOk ? '#4ade80' : '#facc15' }}>
          {last?.toFixed(1)} {unit}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={70}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id={`g-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="shot" hide />
          <YAxis domain={['auto', 'auto']} hide />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: '#30363d' }}
          />
          {refLow  && <ReferenceLine y={refLow}  stroke="#facc15" strokeDasharray="3 3" strokeOpacity={0.5} />}
          {refHigh && <ReferenceLine y={refHigh} stroke="#facc15" strokeDasharray="3 3" strokeOpacity={0.5} />}
          <Area type="monotone" dataKey="value" stroke={color} fill={`url(#g-${color})`} strokeWidth={1.5} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
