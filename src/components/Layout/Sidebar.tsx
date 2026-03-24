import React from 'react';
import clsx from 'clsx';
import {
  LayoutDashboard,
  Zap,
  Thermometer,
  SlidersHorizontal,
  BellRing,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Factory,
} from 'lucide-react';
import { useHPDCStore } from '../../store/hpdcStore';

const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Dashboard',        icon: LayoutDashboard },
  { id: 'injection',   label: 'Injection Monitor', icon: Zap },
  { id: 'thermal',     label: 'Die Thermal',       icon: Thermometer },
  { id: 'parameters',  label: 'Process Params',    icon: SlidersHorizontal },
  { id: 'alarms',      label: 'Alarms',            icon: BellRing },
  { id: 'analytics',   label: 'Analytics',         icon: BarChart2 },
];

export function Sidebar() {
  const { activePage, sidebarCollapsed, setActivePage, toggleSidebar } = useHPDCStore();
  const machine = useHPDCStore((s) => s.machine);

  const alarmCount = machine.activeAlarms.length;

  return (
    <aside className={clsx(
      'flex flex-col bg-[#0d1117] border-r border-[#21262d] transition-all duration-300 h-screen sticky top-0',
      sidebarCollapsed ? 'w-16' : 'w-56'
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
            <span className="text-white font-bold text-sm">HPDC</span>
            <span className="text-cyan-400 text-xs font-medium">AI Monitor</span>
          </div>
        )}
      </div>

      {/* Machine info */}
      {!sidebarCollapsed && (
        <div className="mx-3 mt-3 p-2.5 rounded-lg bg-[#161b22] border border-[#21262d]">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Machine</p>
          <p className="text-xs text-white font-medium truncate">{machine.machineName}</p>
          <p className="text-[10px] text-gray-400 truncate mt-0.5">Part: {machine.partNumber}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activePage === id;
          const showBadge = id === 'alarms' && alarmCount > 0;
          return (
            <button
              key={id}
              onClick={() => setActivePage(id)}
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
        })}
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
