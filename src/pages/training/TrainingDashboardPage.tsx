import React from 'react';
import clsx from 'clsx';
import { Brain, CheckCircle2, Clock, AlertTriangle, Activity, Zap, FileText, MessageSquare, BarChart3, Users } from 'lucide-react';
import { useTrainingStore } from '../../store/trainingStore';
import type { AgentState } from '../../types/training';

const AGENT_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  conductor: { icon: Brain, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/25' },
  diagnosis: { icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/25' },
  content: { icon: FileText, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/25' },
  assessment: { icon: Zap, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/25' },
  coaching: { icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/25' },
  analytics: { icon: BarChart3, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/25' },
};

const STATUS_DOT: Record<AgentState['status'], string> = {
  working: 'bg-green-400 animate-pulse',
  idle: 'bg-gray-500',
  waiting: 'bg-amber-400',
  error: 'bg-red-400',
};

function AgentCard({ agentKey, agent }: { agentKey: string; agent: AgentState }) {
  const cfg = AGENT_CONFIG[agentKey];
  const Icon = cfg.icon;
  return (
    <div className={clsx('rounded-xl border p-4 flex flex-col gap-3', cfg.bg, cfg.border)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', cfg.bg, cfg.border, 'border')}>
            <Icon size={15} className={cfg.color} />
          </div>
          <span className="text-sm font-semibold text-white">{agent.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={clsx('w-2 h-2 rounded-full', STATUS_DOT[agent.status])} />
          <span className="text-xs text-gray-400 capitalize">{agent.status}</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 leading-relaxed min-h-[32px]">{agent.currentTask}</p>
      <div className="flex gap-4 pt-1 border-t border-white/5">
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Completed</p>
          <p className={clsx('text-lg font-bold', cfg.color)}>{agent.tasksCompleted}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Queued</p>
          <p className="text-lg font-bold text-white">{agent.tasksQueued}</p>
        </div>
      </div>
    </div>
  );
}

const LEVEL_COLOR: Record<string, string> = {
  success: 'text-green-400',
  warning: 'text-amber-400',
  info: 'text-blue-400',
};
const LEVEL_ICON: Record<string, React.ElementType> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Clock,
};

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export function TrainingDashboardPage() {
  const { agents, learners, modules, eventLog, complianceItems } = useTrainingStore();

  const published = modules.filter((m) => m.status === 'published').length;
  const totalCompliant = complianceItems.reduce((a, c) => a + c.compliant, 0);
  const totalAll = complianceItems.reduce((a, c) => a + c.total, 0);
  const complianceRate = Math.round((totalCompliant / totalAll) * 100);
  const atRiskLearners = learners.filter((l) => l.complianceStatus !== 'compliant').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Training AI — Command Center</h1>
          <p className="text-sm text-gray-400 mt-0.5">Multi-agent orchestration overview · Real-time</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/25">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-xs text-violet-300 font-medium">All Agents Active</span>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Learners', value: learners.length, icon: Users, color: 'text-violet-400', sub: `${atRiskLearners} at risk` },
          { label: 'Published Modules', value: published, icon: FileText, color: 'text-amber-400', sub: `${modules.filter(m => m.status === 'generating').length} generating` },
          { label: 'Compliance Rate', value: `${complianceRate}%`, icon: CheckCircle2, color: 'text-green-400', sub: `${totalAll - totalCompliant} non-compliant` },
          { label: 'Coaching Sessions', value: 93, icon: MessageSquare, color: 'text-blue-400', sub: '1 active now' },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-[#161b22] rounded-xl border border-[#21262d] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
              <Icon size={14} className={color} />
            </div>
            <p className={clsx('text-2xl font-bold', color)}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Agents grid */}
      <div>
        <h2 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Agent Fleet</h2>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(agents).map(([key, agent]) => (
            <AgentCard key={key} agentKey={key} agent={agent} />
          ))}
        </div>
      </div>

      {/* Event log */}
      <div>
        <h2 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Live Event Feed</h2>
        <div className="bg-[#161b22] rounded-xl border border-[#21262d] divide-y divide-[#21262d]">
          {eventLog.slice(0, 8).map((event) => {
            const Icon = LEVEL_ICON[event.level];
            return (
              <div key={event.id} className="flex items-start gap-3 px-4 py-3">
                <Icon size={13} className={clsx('mt-0.5 shrink-0', LEVEL_COLOR[event.level])} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-gray-300">{event.agent}</span>
                    <span className="text-xs text-gray-500">·</span>
                    <span className="text-xs text-gray-500">{event.action}</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{event.detail}</p>
                </div>
                <span className="text-[10px] text-gray-600 shrink-0 mt-0.5">{formatRelative(event.timestamp)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
