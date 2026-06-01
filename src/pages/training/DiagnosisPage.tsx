import React from 'react';
import clsx from 'clsx';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { Activity, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { useTrainingStore } from '../../store/trainingStore';
import type { Learner } from '../../types/training';

const GAP_COLOR: Record<string, string> = {
  high: 'text-red-400 bg-red-500/10 border-red-500/25',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
  low: 'text-green-400 bg-green-500/10 border-green-500/25',
};
const GAP_BAR: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-green-500',
};
const COMPLIANCE_BADGE: Record<string, string> = {
  compliant: 'text-green-400 bg-green-500/10 border border-green-500/25',
  at_risk: 'text-amber-400 bg-amber-500/10 border border-amber-500/25',
  non_compliant: 'text-red-400 bg-red-500/10 border border-red-500/25',
};

function LearnerRow({ learner, selected, onClick }: { learner: Learner; selected: boolean; onClick: () => void }) {
  const highGaps = learner.competencies.filter((c) => c.gapSeverity === 'high').length;
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b border-[#21262d]',
        selected ? 'bg-violet-500/10' : 'hover:bg-[#1c2128]'
      )}
    >
      <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-violet-300">{learner.avatarInitials}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{learner.name}</p>
        <p className="text-xs text-gray-500 truncate">{learner.role}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {highGaps > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/25 text-red-400">
            {highGaps} high
          </span>
        )}
        <span className={clsx('text-xs px-2 py-0.5 rounded-full capitalize', COMPLIANCE_BADGE[learner.complianceStatus])}>
          {learner.complianceStatus.replace('_', ' ')}
        </span>
        <ChevronRight size={12} className="text-gray-600" />
      </div>
    </button>
  );
}

export function DiagnosisPage() {
  const { learners, selectedLearnerId, selectLearner } = useTrainingStore();
  const selected = learners.find((l) => l.id === selectedLearnerId) ?? learners[0];

  const radarData = selected.competencies.map((c) => ({
    subject: c.topic.length > 14 ? c.topic.slice(0, 14) + '…' : c.topic,
    value: c.proficiency,
    fullMark: 4,
  }));

  return (
    <div className="p-6 flex gap-6 h-full">
      {/* Learner list */}
      <div className="w-72 shrink-0 bg-[#161b22] rounded-xl border border-[#21262d] flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-[#21262d]">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-cyan-400" />
            <span className="text-sm font-semibold text-white">Diagnosis Agent</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{learners.length} learners profiled</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {learners.map((l) => (
            <LearnerRow
              key={l.id}
              learner={l}
              selected={selected.id === l.id}
              onClick={() => selectLearner(l.id)}
            />
          ))}
        </div>
      </div>

      {/* Detail panel */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Learner header */}
        <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
            <span className="text-base font-bold text-violet-300">{selected.avatarInitials}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-white">{selected.name}</h2>
            <p className="text-sm text-gray-400">{selected.role} · {selected.department} · {selected.seniorityLevel}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Hired</p>
            <p className="text-sm text-gray-300">{selected.hireDate}</p>
          </div>
          <span className={clsx('text-xs px-3 py-1.5 rounded-full capitalize font-medium', COMPLIANCE_BADGE[selected.complianceStatus])}>
            {selected.complianceStatus.replace('_', ' ')}
          </span>
        </div>

        <div className="flex gap-4 flex-1 min-h-0">
          {/* Radar chart */}
          <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4 flex flex-col" style={{ width: 280 }}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Competency Map</p>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="#21262d" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 9 }} />
                <Radar name="Proficiency" dataKey="value" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex justify-between text-[10px] text-gray-500 pt-2 border-t border-[#21262d]">
              <span>0 = None</span><span>4 = Expert</span>
            </div>
          </div>

          {/* Gap breakdown */}
          <div className="flex-1 bg-[#161b22] rounded-xl border border-[#21262d] p-4 flex flex-col gap-3 overflow-y-auto">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gap Analysis</p>
            {selected.competencies
              .slice()
              .sort((a, b) => (a.gapSeverity === 'high' ? -1 : b.gapSeverity === 'high' ? 1 : 0))
              .map((c) => (
                <div key={c.topic} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {c.gapSeverity === 'high' ? <AlertTriangle size={12} className="text-red-400" /> : <CheckCircle2 size={12} className="text-gray-500" />}
                      <span className="text-sm text-white">{c.topic}</span>
                      <span className="text-[10px] text-gray-500">{c.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{c.proficiency}/4</span>
                      <span className={clsx('text-[10px] px-2 py-0.5 rounded-full border capitalize font-medium', GAP_COLOR[c.gapSeverity])}>
                        {c.gapSeverity}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                    <div
                      className={clsx('h-full rounded-full transition-all', GAP_BAR[c.gapSeverity])}
                      style={{ width: `${(c.proficiency / 4) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-[#161b22] rounded-xl border border-[#21262d] p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Conductor Recommendations</p>
          <div className="grid grid-cols-3 gap-3">
            {selected.competencies.filter(c => c.gapSeverity === 'high').slice(0, 3).map((c, i) => (
              <div key={c.topic} className="rounded-lg bg-[#0d1117] border border-[#21262d] p-3">
                <p className="text-[10px] text-gray-500 uppercase mb-1">Priority {i + 1}</p>
                <p className="text-sm font-medium text-white">{c.topic}</p>
                <p className="text-xs text-gray-500 mt-1">Generate new module → assess → coach</p>
              </div>
            ))}
            {selected.competencies.filter(c => c.gapSeverity === 'high').length === 0 && (
              <div className="col-span-3 text-center py-4 text-sm text-green-400">No high-severity gaps — learner is on track</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
