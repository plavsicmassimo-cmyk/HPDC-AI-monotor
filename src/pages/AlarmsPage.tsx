import React, { useState } from 'react';
import { BellRing, CheckCircle, X, Clock, Filter, BarChart2 } from 'lucide-react';
import clsx from 'clsx';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { useHPDCStore } from '../store/hpdcStore';
import { AlarmSeverityBadge } from '../components/common/StatusBadge';
import type { Alarm, AlarmSeverity } from '../types/hpdc';

const SEVERITY_COLORS: Record<AlarmSeverity, string> = {
  CRITICAL: '#ef4444',
  HIGH:     '#f97316',
  MEDIUM:   '#eab308',
  LOW:      '#60a5fa',
  INFO:     '#6b7280',
};

export function AlarmsPage() {
  const machine = useHPDCStore((s) => s.machine);
  const acknowledgeAlarm = useHPDCStore((s) => s.acknowledgeAlarm);
  const clearAlarm = useHPDCStore((s) => s.clearAlarm);

  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'ACKNOWLEDGED' | 'CLEARED'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<AlarmSeverity | 'ALL'>('ALL');
  const [tab, setTab] = useState<'list' | 'stats'>('list');

  const allAlarms = machine.alarmHistory;

  const filtered = allAlarms.filter((a) => {
    if (filter !== 'ALL' && a.state !== filter) return false;
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    return true;
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Stats
  const bySeverity = Object.entries(SEVERITY_COLORS).map(([sev, color]) => ({
    name: sev,
    value: allAlarms.filter((a) => a.severity === sev).length,
    color,
  })).filter((x) => x.value > 0);

  const byCode: Record<string, number> = {};
  allAlarms.forEach((a) => { byCode[a.code] = (byCode[a.code] ?? 0) + 1; });
  const topAlarms = Object.entries(byCode).sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([code, count]) => ({ code, count }));

  const activeCount = machine.activeAlarms.length;
  const ackCount = allAlarms.filter((a) => a.state === 'ACKNOWLEDGED').length;

  return (
    <div className="p-6 space-y-4">
      {/* Summary bar */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active',       count: activeCount,                                         color: 'red'    },
          { label: 'Acknowledged', count: ackCount,                                             color: 'yellow' },
          { label: 'Total (session)', count: allAlarms.length,                                  color: 'blue'   },
          { label: 'Critical',     count: allAlarms.filter((a) => a.severity === 'CRITICAL').length, color: 'orange' },
        ].map(({ label, count, color }) => (
          <div key={label} className={clsx(
            'bg-[#161b22] rounded-xl border p-4 flex flex-col gap-1',
            color === 'red' ? 'border-red-500/30' : color === 'yellow' ? 'border-yellow-500/30' : color === 'orange' ? 'border-orange-500/30' : 'border-blue-500/30'
          )}>
            <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
            <span className={clsx('text-3xl font-bold font-mono',
              color === 'red' ? 'text-red-400' : color === 'yellow' ? 'text-yellow-400' : color === 'orange' ? 'text-orange-400' : 'text-blue-400'
            )}>{count}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#21262d] pb-0">
        {([['list', 'Alarm Log', BellRing], ['stats', 'Statistics', BarChart2]] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-all',
              tab === id ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-gray-400 hover:text-white'
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'list' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter size={12} className="text-gray-500" />
            {(['ALL', 'ACTIVE', 'ACKNOWLEDGED', 'CLEARED'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  'px-3 py-1 rounded-full text-xs font-medium border transition-all',
                  filter === f
                    ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                    : 'bg-transparent text-gray-400 border-[#30363d] hover:text-white'
                )}
              >{f}</button>
            ))}
            <span className="mx-2 text-gray-600">|</span>
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={clsx(
                  'px-3 py-1 rounded-full text-xs font-medium border transition-all',
                  severityFilter === s
                    ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
                    : 'bg-transparent text-gray-400 border-[#30363d] hover:text-white'
                )}
              >{s}</button>
            ))}
          </div>

          {/* Alarm list */}
          <div className="bg-[#161b22] rounded-xl border border-[#21262d] overflow-hidden">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <CheckCircle size={40} className="text-green-400 opacity-50" />
                <p className="text-gray-400 font-medium">No alarms match the filter</p>
              </div>
            ) : (
              <div className="divide-y divide-[#21262d]">
                {filtered.map((alarm) => (
                  <AlarmRow
                    key={alarm.id}
                    alarm={alarm}
                    onAck={() => acknowledgeAlarm(alarm.id)}
                    onClear={() => clearAlarm(alarm.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pie */}
          <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Alarms by Severity</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={bySeverity} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: '#4b5563' }}>
                  {bySeverity.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top alarm codes */}
          <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Most Frequent Alarm Codes</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topAlarms} layout="vertical" margin={{ top: 4, right: 8, bottom: 0, left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis type="category" dataKey="code" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="count" name="Count" fill="#22d3ee" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Alarm log summary */}
          <div className="md:col-span-2 bg-[#161b22] rounded-xl border border-[#21262d] p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Alarm Rate Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {bySeverity.map((s) => (
                <div key={s.name} className="bg-[#0d1117] rounded-lg p-3 border border-[#21262d]">
                  <p className="text-xs text-gray-500 mb-1">{s.name}</p>
                  <p className="text-2xl font-bold font-mono" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{((s.value / allAlarms.length) * 100).toFixed(0)}% of total</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AlarmRow({ alarm, onAck, onClear }: { alarm: Alarm; onAck: () => void; onClear: () => void }) {
  const borderColor = alarm.severity === 'CRITICAL' ? 'border-l-red-500' : alarm.severity === 'HIGH' ? 'border-l-orange-500' : alarm.severity === 'MEDIUM' ? 'border-l-yellow-500' : 'border-l-blue-500';
  const stateOpacity = alarm.state === 'CLEARED' ? 'opacity-50' : '';

  return (
    <div className={clsx('flex items-start gap-4 px-4 py-3 hover:bg-[#0d1117] transition-colors border-l-2', borderColor, stateOpacity)}>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-xs font-mono text-gray-400">{alarm.code}</span>
          <AlarmSeverityBadge severity={alarm.severity} />
          <span className={clsx(
            'text-[10px] px-1.5 py-0.5 rounded border font-medium',
            alarm.state === 'ACTIVE' ? 'text-red-400 bg-red-400/10 border-red-400/20' :
            alarm.state === 'ACKNOWLEDGED' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' :
            'text-gray-400 bg-gray-400/10 border-gray-400/20'
          )}>{alarm.state}</span>
        </div>
        <p className="text-sm text-white font-medium">{alarm.description}</p>
        {alarm.actualValue !== undefined && (
          <p className="text-xs text-gray-400 mt-0.5">
            Value: <span className="text-red-400 font-mono">{alarm.actualValue}</span>
            {alarm.limitValue !== undefined && <> | Limit: <span className="font-mono">{alarm.limitValue}</span></>}
            {alarm.parameter && <> | Param: <span className="text-gray-300">{alarm.parameter}</span></>}
          </p>
        )}
        <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500">
          <span className="flex items-center gap-1">
            <Clock size={9} /> {alarm.timestamp.toLocaleString()}
          </span>
          {alarm.acknowledgedAt && (
            <span>ACK: {alarm.acknowledgedAt.toLocaleTimeString()}</span>
          )}
          {alarm.clearedAt && (
            <span>CLR: {alarm.clearedAt.toLocaleTimeString()}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {alarm.state === 'ACTIVE' && (
          <button
            onClick={onAck}
            className="px-2 py-1 text-xs rounded-lg bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 hover:bg-yellow-500/20 transition-all"
          >
            ACK
          </button>
        )}
        {alarm.state !== 'CLEARED' && (
          <button
            onClick={onClear}
            className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-[#21262d] transition-all"
            title="Clear alarm"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
