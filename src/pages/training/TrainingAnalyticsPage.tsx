import React from 'react';
import clsx from 'clsx';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle2, Users } from 'lucide-react';
import { useTrainingStore } from '../../store/trainingStore';

const COMPLIANCE_BAR_COLOR: Record<string, string> = {
  compliant: 'bg-green-500',
  atRisk: 'bg-amber-500',
  nonCompliant: 'bg-red-500',
};

export function TrainingAnalyticsPage() {
  const { completionData, retentionData, complianceItems, learners } = useTrainingStore();

  const totalCompliant = complianceItems.reduce((s, c) => s + c.compliant, 0);
  const totalAtRisk = complianceItems.reduce((s, c) => s + c.atRisk, 0);
  const totalNon = complianceItems.reduce((s, c) => s + c.nonCompliant, 0);
  const totalAll = complianceItems.reduce((s, c) => s + c.total, 0);
  const complianceRate = Math.round((totalCompliant / totalAll) * 100);

  const lastWeek = completionData[completionData.length - 1];
  const prevWeek = completionData[completionData.length - 2];
  const rateChange = lastWeek.rate - prevWeek.rate;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Analytics Agent</h1>
          <p className="text-sm text-gray-400 mt-0.5">Workforce learning intelligence · Auto-generated reports</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#161b22] border border-[#21262d]">
          <span className="text-xs text-gray-500">Report period:</span>
          <span className="text-xs text-white font-medium">Last 8 weeks</span>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: 'Completion Rate', value: `${lastWeek.rate}%`,
            sub: `${rateChange >= 0 ? '+' : ''}${rateChange}% vs last week`,
            icon: TrendingUp, color: 'text-violet-400',
            positive: rateChange >= 0,
          },
          {
            label: 'Compliance Rate', value: `${complianceRate}%`,
            sub: `${totalNon} non-compliant`,
            icon: CheckCircle2, color: 'text-green-400',
            positive: complianceRate >= 80,
          },
          {
            label: 'At-Risk Learners', value: learners.filter(l => l.complianceStatus !== 'compliant').length,
            sub: 'Need intervention',
            icon: AlertTriangle, color: 'text-amber-400',
            positive: false,
          },
          {
            label: 'Active Learners', value: learners.length,
            sub: `${learners.filter(l => l.activePathId).length} on active paths`,
            icon: Users, color: 'text-blue-400',
            positive: true,
          },
        ].map(({ label, value, sub, icon: Icon, color, positive }) => (
          <div key={label} className="bg-[#161b22] rounded-xl border border-[#21262d] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
              <Icon size={14} className={color} />
            </div>
            <p className={clsx('text-2xl font-bold', color)}>{value}</p>
            <p className={clsx('text-xs mt-1', positive ? 'text-green-400' : 'text-amber-400')}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Completion trend */}
        <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Weekly Completion Rate</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={completionData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="week" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} domain={[50, 100]} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8 }}
                labelStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="rate" stroke="#a78bfa" strokeWidth={2} dot={{ fill: '#a78bfa', r: 3 }} name="Completion %" />
              <Line type="monotone" dataKey="completed" stroke="#60a5fa" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Completed" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Retention */}
        <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Knowledge Retention by Cohort</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={retentionData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="cohort" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} domain={[0, 100]} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8 }} labelStyle={{ color: '#fff' }} />
              <Legend wrapperStyle={{ fontSize: 10, color: '#9ca3af' }} />
              <Bar dataKey="day7" fill="#a78bfa" radius={[3, 3, 0, 0]} name="Day 7" />
              <Bar dataKey="day30" fill="#60a5fa" radius={[3, 3, 0, 0]} name="Day 30" />
              <Bar dataKey="day60" fill="#34d399" radius={[3, 3, 0, 0]} name="Day 60" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Compliance table */}
      <div>
        <h2 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Compliance Tracking</h2>
        <div className="bg-[#161b22] rounded-xl border border-[#21262d] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#21262d]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Requirement</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Deadline</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Total</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Compliant</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">At Risk</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Non-Compliant</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d]">
              {complianceItems.map((item) => {
                const compPct = Math.round((item.compliant / item.total) * 100);
                const atRiskPct = Math.round((item.atRisk / item.total) * 100);
                const nonPct = Math.round((item.nonCompliant / item.total) * 100);
                return (
                  <tr key={item.requirement} className="hover:bg-[#1c2128] transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{item.requirement}</td>
                    <td className="px-4 py-3 text-gray-400">{item.deadline}</td>
                    <td className="px-4 py-3 text-center text-gray-300">{item.total}</td>
                    <td className="px-4 py-3 text-center text-green-400 font-semibold">{item.compliant}</td>
                    <td className="px-4 py-3 text-center text-amber-400 font-semibold">{item.atRisk}</td>
                    <td className="px-4 py-3 text-center text-red-400 font-semibold">{item.nonCompliant}</td>
                    <td className="px-4 py-3">
                      <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                        <div className={clsx('h-full', COMPLIANCE_BAR_COLOR.compliant)} style={{ width: `${compPct}%` }} />
                        <div className={clsx('h-full', COMPLIANCE_BAR_COLOR.atRisk)} style={{ width: `${atRiskPct}%` }} />
                        <div className={clsx('h-full', COMPLIANCE_BAR_COLOR.nonCompliant)} style={{ width: `${nonPct}%` }} />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">{compPct}% compliant</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Learner risk table */}
      <div>
        <h2 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">At-Risk Learners</h2>
        <div className="bg-[#161b22] rounded-xl border border-[#21262d] divide-y divide-[#21262d]">
          {learners.filter(l => l.complianceStatus !== 'compliant').map((l) => {
            const highGaps = l.competencies.filter(c => c.gapSeverity === 'high').length;
            return (
              <div key={l.id} className="flex items-center gap-4 px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-violet-300">{l.avatarInitials}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{l.name}</p>
                  <p className="text-xs text-gray-500">{l.role} · {l.department}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{highGaps} high-severity gaps</span>
                  <span className={clsx(
                    'text-xs px-2.5 py-1 rounded-full border font-medium capitalize',
                    l.complianceStatus === 'at_risk'
                      ? 'text-amber-400 bg-amber-500/10 border-amber-500/25'
                      : 'text-red-400 bg-red-500/10 border-red-500/25'
                  )}>
                    {l.complianceStatus.replace('_', ' ')}
                  </span>
                  <button className="text-xs px-3 py-1.5 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-300 hover:bg-violet-500/25 transition-all">
                    Assign Module
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
