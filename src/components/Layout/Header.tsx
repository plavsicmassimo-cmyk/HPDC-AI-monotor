import React, { useState, useEffect } from 'react';
import { BellRing, RefreshCw, Play, Pause, Wrench } from 'lucide-react';
import { useHPDCStore } from '../../store/hpdcStore';
import { MachineStatusBadge } from '../common/StatusBadge';

const PAGE_TITLES: Record<string, string> = {
  dashboard:  'Dashboard',
  injection:  'Injection Monitor',
  thermal:    'Die Thermal Management',
  parameters: 'Process Parameters',
  alarms:     'Alarm Management',
  analytics:  'Analytics & History',
};

export function Header() {
  const activePage = useHPDCStore((s) => s.activePage);
  const machine = useHPDCStore((s) => s.machine);
  const setMachineStatus = useHPDCStore((s) => s.setMachineStatus);
  const triggerShot = useHPDCStore((s) => s.triggerShot);

  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const activeAlarms = machine.activeAlarms.length;

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-[#0d1117] border-b border-[#21262d] sticky top-0 z-10">
      {/* Left: title */}
      <div className="flex items-center gap-3">
        <h1 className="text-white font-semibold text-lg">{PAGE_TITLES[activePage] ?? 'HPDC Monitor'}</h1>
        <MachineStatusBadge status={machine.status} />
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-3">
        {/* Clock */}
        <span className="text-gray-400 font-mono text-sm hidden md:block">
          {clock.toLocaleTimeString()}
        </span>

        {/* Shot counter */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#161b22] border border-[#21262d]">
          <span className="text-[10px] text-gray-500 uppercase">Shots</span>
          <span className="text-cyan-400 font-mono font-bold text-sm">{machine.production.shotCounter.toLocaleString()}</span>
        </div>

        {/* Manual shot trigger */}
        <button
          onClick={triggerShot}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-medium hover:bg-cyan-500/20 transition-all"
          title="Simulate shot"
        >
          <RefreshCw size={12} />
          <span className="hidden sm:inline">Fire Shot</span>
        </button>

        {/* Start/Stop */}
        {machine.status === 'RUNNING' ? (
          <button
            onClick={() => setMachineStatus('IDLE')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 text-xs font-medium hover:bg-yellow-500/20 transition-all"
          >
            <Pause size={12} />
            <span className="hidden sm:inline">Stop</span>
          </button>
        ) : (
          <button
            onClick={() => setMachineStatus('RUNNING')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/25 text-green-400 text-xs font-medium hover:bg-green-500/20 transition-all"
          >
            <Play size={12} />
            <span className="hidden sm:inline">Start</span>
          </button>
        )}

        {/* Alarm bell */}
        <button
          className="relative p-2 rounded-lg hover:bg-[#161b22] transition-all"
          title="Active alarms"
        >
          <BellRing size={16} className={activeAlarms > 0 ? 'text-red-400' : 'text-gray-500'} />
          {activeAlarms > 0 && (
            <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
              {activeAlarms}
            </span>
          )}
        </button>

        {/* Operator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#161b22] border border-[#21262d]">
          <Wrench size={12} className="text-gray-500" />
          <span className="text-gray-300 text-xs font-mono">{machine.operatorId}</span>
        </div>
      </div>
    </header>
  );
}
