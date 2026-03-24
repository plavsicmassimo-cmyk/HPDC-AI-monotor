import React from 'react';
import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  color?: 'cyan' | 'green' | 'yellow' | 'red' | 'blue' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  subtitle?: string;
}

const colorMap = {
  cyan: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  green: 'text-green-400 bg-green-400/10 border-green-400/20',
  yellow: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  red: 'text-red-400 bg-red-400/10 border-red-400/20',
  blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  orange: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
};

export function KPICard({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  trendValue,
  color = 'cyan',
  size = 'md',
  subtitle,
}: KPICardProps) {
  return (
    <div className={clsx(
      'rounded-xl border bg-[#161b22] p-4 flex flex-col gap-2',
      colorMap[color].split(' ')[2]
    )}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">{label}</span>
        <div className={clsx('p-1.5 rounded-lg', colorMap[color].split(' ')[1])}>
          <Icon size={14} className={colorMap[color].split(' ')[0]} />
        </div>
      </div>
      <div className="flex items-end gap-1">
        <span className={clsx(
          'font-bold font-mono',
          colorMap[color].split(' ')[0],
          size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-xl'
        )}>
          {value}
        </span>
        {unit && <span className="text-gray-400 text-sm mb-0.5">{unit}</span>}
      </div>
      {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
      {trendValue && (
        <div className="flex items-center gap-1">
          <span className={clsx(
            'text-xs font-medium',
            trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'
          )}>
            {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '─'} {trendValue}
          </span>
        </div>
      )}
    </div>
  );
}
