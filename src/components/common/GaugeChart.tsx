import React from 'react';

interface GaugeProps {
  value: number;
  min: number;
  max: number;
  unit: string;
  label: string;
  lowWarn?: number;
  highWarn?: number;
  lowAlarm?: number;
  highAlarm?: number;
  size?: number;
  decimals?: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function arc(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polarToCartesian(cx, cy, r, endDeg);
  const end = polarToCartesian(cx, cy, r, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
}

export function GaugeChart({
  value,
  min,
  max,
  unit,
  label,
  lowWarn,
  highWarn,
  lowAlarm,
  highAlarm,
  size = 160,
  decimals = 1,
}: GaugeProps) {
  const cx = size / 2;
  const cy = size / 2 + 10;
  const r = size * 0.38;
  const strokeW = size * 0.07;

  const START_DEG = -135;
  const END_DEG = 135;
  const TOTAL_DEG = END_DEG - START_DEG;

  function valToDeg(v: number) {
    const pct = Math.min(Math.max((v - min) / (max - min), 0), 1);
    return START_DEG + pct * TOTAL_DEG;
  }

  const pct = Math.min(Math.max((value - min) / (max - min), 0), 1);

  // Color zones
  const zones: { from: number; to: number; color: string }[] = [];
  const la = lowAlarm ?? min;
  const lw = lowWarn ?? (la + (highWarn !== undefined ? highWarn : max)) / 2;
  const hw = highWarn ?? max * 0.85;
  const ha = highAlarm ?? max;

  zones.push({ from: min, to: la, color: '#f87171' });
  zones.push({ from: la, to: lw, color: '#facc15' });
  zones.push({ from: lw, to: hw, color: '#4ade80' });
  zones.push({ from: hw, to: ha, color: '#facc15' });
  zones.push({ from: ha, to: max, color: '#f87171' });

  // Determine needle color
  let needleColor = '#4ade80';
  if (value < (lowAlarm ?? min) || value > (highAlarm ?? max)) needleColor = '#f87171';
  else if (value < (lowWarn ?? min) || value > (highWarn ?? max)) needleColor = '#facc15';

  // Needle
  const needleDeg = valToDeg(value);
  const needleRad = ((needleDeg - 90) * Math.PI) / 180;
  const needleLen = r * 0.82;
  const nx = cx + needleLen * Math.cos(needleRad);
  const ny = cy + needleLen * Math.sin(needleRad);

  const displayVal = value.toFixed(decimals);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.85} viewBox={`0 0 ${size} ${size * 0.85}`}>
        {/* Background track */}
        <path
          d={arc(cx, cy, r, START_DEG, END_DEG)}
          fill="none"
          stroke="#21262d"
          strokeWidth={strokeW}
          strokeLinecap="round"
        />
        {/* Color zones */}
        {zones.map((z, i) => {
          if (z.from >= z.to) return null;
          return (
            <path
              key={i}
              d={arc(cx, cy, r, valToDeg(z.from), valToDeg(z.to))}
              fill="none"
              stroke={z.color}
              strokeWidth={strokeW * 0.35}
              opacity={0.5}
            />
          );
        })}
        {/* Value arc */}
        <path
          d={arc(cx, cy, r, START_DEG, valToDeg(value))}
          fill="none"
          stroke={needleColor}
          strokeWidth={strokeW * 0.55}
          strokeLinecap="round"
          opacity={0.9}
        />
        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={nx}
          y2={ny}
          stroke={needleColor}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={strokeW * 0.4} fill={needleColor} />
        {/* Min / Max labels */}
        <text
          x={polarToCartesian(cx, cy, r + strokeW * 0.9, START_DEG).x}
          y={polarToCartesian(cx, cy, r + strokeW * 0.9, START_DEG).y}
          fill="#6b7280"
          fontSize={size * 0.07}
          textAnchor="middle"
        >
          {min}
        </text>
        <text
          x={polarToCartesian(cx, cy, r + strokeW * 0.9, END_DEG).x}
          y={polarToCartesian(cx, cy, r + strokeW * 0.9, END_DEG).y}
          fill="#6b7280"
          fontSize={size * 0.07}
          textAnchor="middle"
        >
          {max}
        </text>
        {/* Value */}
        <text
          x={cx}
          y={cy + 4}
          fill={needleColor}
          fontSize={size * 0.14}
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="monospace"
        >
          {displayVal}
        </text>
        <text
          x={cx}
          y={cy + size * 0.14}
          fill="#9ca3af"
          fontSize={size * 0.08}
          textAnchor="middle"
        >
          {unit}
        </text>
      </svg>
      <span className="text-xs text-gray-400 text-center leading-tight mt-1">{label}</span>
    </div>
  );
}
