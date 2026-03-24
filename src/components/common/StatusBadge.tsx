import React from 'react';
import clsx from 'clsx';
import type { MachineStatus, AlarmSeverity } from '../../types/hpdc';

interface MachineStatusBadgeProps {
  status: MachineStatus;
}

const machineStatusConfig: Record<MachineStatus, { label: string; classes: string; dot: string }> = {
  RUNNING:     { label: 'RUNNING',     classes: 'bg-green-400/10 text-green-400 border-green-400/30',  dot: 'bg-green-400 animate-pulse' },
  IDLE:        { label: 'IDLE',        classes: 'bg-gray-400/10 text-gray-400 border-gray-400/30',    dot: 'bg-gray-400' },
  ALARM:       { label: 'ALARM',       classes: 'bg-red-400/10 text-red-400 border-red-400/30',       dot: 'bg-red-400 animate-ping' },
  MAINTENANCE: { label: 'MAINTENANCE', classes: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30', dot: 'bg-yellow-400' },
  SETUP:       { label: 'SETUP',       classes: 'bg-blue-400/10 text-blue-400 border-blue-400/30',    dot: 'bg-blue-400' },
};

export function MachineStatusBadge({ status }: MachineStatusBadgeProps) {
  const cfg = machineStatusConfig[status];
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border tracking-widest', cfg.classes)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  );
}

interface AlarmSeverityBadgeProps {
  severity: AlarmSeverity;
}

const severityConfig: Record<AlarmSeverity, { classes: string }> = {
  CRITICAL: { classes: 'bg-red-500/20 text-red-300 border-red-500/40' },
  HIGH:     { classes: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
  MEDIUM:   { classes: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' },
  LOW:      { classes: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  INFO:     { classes: 'bg-gray-500/20 text-gray-300 border-gray-500/40' },
};

export function AlarmSeverityBadge({ severity }: AlarmSeverityBadgeProps) {
  return (
    <span className={clsx('px-2 py-0.5 rounded text-xs font-bold border', severityConfig[severity].classes)}>
      {severity}
    </span>
  );
}
