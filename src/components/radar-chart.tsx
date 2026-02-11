'use client';

import React from 'react';

interface RadarChartProps {
  stats: {
    label: string;
    value: number; // 0 to 100
  }[];
  color?: string;
}

export function RadarChart({ stats, color = '#ff0000' }: RadarChartProps) {
  const size = 300;
  const center = size / 2;
  const radius = (size / 2) * 0.7;
  const angleStep = (Math.PI * 2) / stats.length;

  const getPoint = (value: number, angle: number) => {
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle - Math.PI / 2);
    const y = center + r * Math.sin(angle - Math.PI / 2);
    return { x, y };
  };

  const getAxisPoint = (angle: number) => {
    const x = center + radius * Math.cos(angle - Math.PI / 2);
    const y = center + radius * Math.sin(angle - Math.PI / 2);
    return { x, y };
  };

  const polygonPoints = stats
    .map((s, i) => {
      const { x, y } = getPoint(s.value, i * angleStep);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="relative w-full aspect-square max-w-[300px] mx-auto">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible">
        {/* Background polygons (grid) */}
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale) => (
          <polygon
            key={scale}
            points={stats
              .map((_, i) => {
                const angle = i * angleStep;
                const x = center + radius * scale * Math.cos(angle - Math.PI / 2);
                const y = center + radius * scale * Math.sin(angle - Math.PI / 2);
                return `${x},${y}`;
              })
              .join(' ')}
            fill="none"
            stroke="white"
            strokeOpacity="0.1"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {stats.map((_, i) => {
          const { x, y } = getAxisPoint(i * angleStep);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="white"
              strokeOpacity="0.1"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          fill={color}
          fillOpacity="0.4"
          stroke={color}
          strokeWidth="2"
        />

        {/* Labels */}
        {stats.map((s, i) => {
          const angle = i * angleStep;
          const labelDist = radius + 35;
          const x = center + labelDist * Math.cos(angle - Math.PI / 2);
          const y = center + labelDist * Math.sin(angle - Math.PI / 2);

          return (
            <g key={i}>
              <text
                x={x}
                y={y - 10}
                textAnchor="middle"
                className="fill-white font-black italic text-[11px]"
              >
                {s.value}%
              </text>
              <text
                x={x}
                y={y + 5}
                textAnchor="middle"
                className="fill-white/40 text-[9px] font-black uppercase tracking-[0.2em] italic"
              >
                {s.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
