import React from 'react';
import clsx from 'clsx';
import {
  LayoutDashboard,
  Zap,
  Thermometer,
  SlidersHorizontal,
  BellRing,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  Factory,
  Brain,
  Activity,
  FileText,
  MessageSquare,
  BarChart3,
  GraduationCap,
} from 'lucide-react';
import { useHPDCStore } from '../../store/hpdcStore';
import { useTrainingStore } from '../../store/trainingStore';

const HPDC_NAV = [
  { id: 'dashboard',   label: 'Dashboard',        icon: LayoutDashboard },
  { id: 'injection',   label: 'Injection Monitor', icon: Zap },
  { id: 'thermal',     label: 'Die Thermal',       icon: Thermometer },
  { id: 'parameters',  label: 'Process Params',    icon: SlidersHorizontal },
  { id: 'alarms',      label: 'Alarms',            icon: BellRing },
  { id: 'analytics',   label: 'Analytics',         icon: BarChart2 },
];

const TRAINING_NAV = [
  { id: 'training-dashboard', label: 'Command Center', icon: Brain },
  { id: 'training-diagnosis', label: 'Skill Diagnosis', icon: Activity },
  { id: 'training-content',   label: 'Content Generator', icon: FileText },
  { id: 'training-assessment',label: 'Assessments', icon: Zap },
  { id: 'training-coaching',  label: 'AI Coaching', icon: MessageSquare },
  { id: 'training-analytics', label: 'Learning Analytics', icon: BarChart3 },
];

type AppMode = 'hpdc' | 'training';

export function Sidebar() {
  const { activePage, sidebarCollapsed, setActivePage, toggleSidebar } = useHPDCStore();
  const { activeTrainingPage, setActiveTrainingPage } = useTrainingStore();
  const machine = useHPDCStore((s) => s.machine);

  const alarmCount = machine.activeAlarms.length;

  const isTraining = activeTrainingPage !== 'training-dashboard'
    ? TRAINING_NAV.some(n => n.id === activeTrainingPage)
    : activePage.startsWith('training');

  const [mode, setMode] = React.useState<AppMode>('hpdc');

  const handleHPDCNav = (id: string) => {
    setActivePage(id);
    setMode('hpdc');
  };

  const handleTrainingNav = (id: string) => {
    setActiveTrainingPage(id);
    setActivePage('training');
    setMode('training');
  };

  const currentTrainingPage = activeTrainingPage;
  const currentHPDCPage = mode === 'hpdc' ? activePage : '';

  return (
    <aside className={clsx(
      'flex flex-col bg-[#0d1117] border-r border-[#21262d] transition-all duration-300 h-screen sticky top-0',
      sidebarCollapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className={clsx(
        'flex items-center gap-3 px-4 py-4 border-b border-[#21262d]',
        sidebarCollapsed && 'justify-center px-0'
      )}>
        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
          <Factory size={16} className="text-cyan-400" />
        </div>
        {!sidebarCollapsed && (
          <div className="flex flex-col leading-tight">
            <span className="text-white font-bold text-sm">HPDC Suite</span>
            <span className="text-cyan-400 text-xs font-medium">AI Platform</span>
          </div>
        )}
      </div>

      {/* Mode switcher */}
      {!sidebarCollapsed && (
        <div className="mx-3 mt-3 flex rounded-lg overflow-hidden border border-[#21262d] text-xs font-semibold">
          <button
            onClick={() => { setMode('hpdc'); setActivePage('dashboard'); }}
            className={clsx('flex-1 py-1.5 transition-all', mode === 'hpdc' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-white')}
          >
            Monitor
          </button>
          <button
            onClick={() => { setMode('training'); setActivePage('training'); }}
            className={clsx('flex-1 py-1.5 transition-all', mode === 'training' ? 'bg-violet-500/20 text-violet-400' : 'text-gray-500 hover:text-white')}
          >
            Training
          </button>
        </div>
      )}

      {/* Machine info (HPDC mode) */}
      {!sidebarCollapsed && mode === 'hpdc' && (
        <div className="mx-3 mt-2 p-2.5 rounded-lg bg-[#161b22] border border-[#21262d]">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Machine</p>
          <p className="text-xs text-white font-medium truncate">{machine.machineName}</p>
          <p className="text-[10px] text-gray-400 truncate mt-0.5">Part: {machine.partNumber}</p>
        </div>
      )}

      {/* Training mode header */}
      {!sidebarCollapsed && mode === 'training' && (
        <div className="mx-3 mt-2 p-2.5 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center gap-2">
          <GraduationCap size={13} className="text-violet-400 shrink-0" />
          <div>
            <p className="text-xs text-violet-300 font-medium">Training Agent</p>
            <p className="text-[10px] text-gray-500">6 agents active</p>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {mode === 'hpdc' ? (
          HPDC_NAV.map(({ id, label, icon: Icon }) => {
            const active = currentHPDCPage === id;
            const showBadge = id === 'alarms' && alarmCount > 0;
            return (
              <button
                key={id}
                onClick={() => handleHPDCNav(id)}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  sidebarCollapsed && 'justify-center px-0',
                  active
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25'
                    : 'text-gray-400 hover:bg-[#161b22] hover:text-white border border-transparent'
                )}
                title={sidebarCollapsed ? label : undefined}
              >
                <div className="relative shrink-0">
                  <Icon size={16} />
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center">
                      {alarmCount}
                    </span>
                  )}
                </div>
                {!sidebarCollapsed && <span className="truncate">{label}</span>}
              </button>
            );
          })
        ) : (
          TRAINING_NAV.map(({ id, label, icon: Icon }) => {
            const active = currentTrainingPage === id;
            return (
              <button
                key={id}
                onClick={() => handleTrainingNav(id)}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  sidebarCollapsed && 'justify-center px-0',
                  active
                    ? 'bg-violet-500/15 text-violet-400 border border-violet-500/25'
                    : 'text-gray-400 hover:bg-[#161b22] hover:text-white border border-transparent'
                )}
                title={sidebarCollapsed ? label : undefined}
              >
                <Icon size={16} className="shrink-0" />
                {!sidebarCollapsed && <span className="truncate">{label}</span>}
              </button>
            );
          })
        )}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-[#21262d] p-2">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-white hover:bg-[#161b22] transition-all"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
