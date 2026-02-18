'use client';

import React from 'react';

interface RadarChartProps {
  stats: {
    label: string;
    value: number; // 0 to 100
    percentage?: number;
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
    const startAngle = -Math.PI / 2;
    const x = center + r * Math.cos(angle + startAngle);
    const y = center + r * Math.sin(angle + startAngle);
    return { x, y };
  };

  const getAxisPoint = (angle: number) => {
    const startAngle = -Math.PI / 2;
    const x = center + radius * Math.cos(angle + startAngle);
    const y = center + radius * Math.sin(angle + startAngle);
    return { x, y };
  };

  const getLabelPoint = (angle: number) => {
    const labelRadius = radius + 65;
    const startAngle = -Math.PI / 2;
    const x = center + labelRadius * Math.cos(angle + startAngle);
    const y = center + labelRadius * Math.sin(angle + startAngle);
    return { x, y };
  };

  const polygonPoints = stats
    .map((s, i) => {
      const { x, y } = getPoint(s.value, i * angleStep);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="relative w-full aspect-square max-w-[500px] mx-auto">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible">
        {/* Background polygons (grid) */}
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale) => (
          <polygon
            key={scale}
            points={stats
              .map((_, i) => {
                const angle = i * angleStep;
                const startAngle = -Math.PI / 2;
                const x = center + radius * scale * Math.cos(angle + startAngle);
                const y = center + radius * scale * Math.sin(angle + startAngle);
                return `${x},${y}`;
              })
              .join(' ')}
            fill="none"
            stroke="white"
            strokeOpacity="0.1"
            strokeWidth="1"
            strokeDasharray={scale === 1 ? "0" : "2 2"}
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
        {stats.map((stat, i) => {
          const angle = i * angleStep;
          const { x, y } = getLabelPoint(angle);
          
          // Adjust text anchor based on position
          let textAnchor: "start" | "middle" | "end" = "middle";
          if (x < center - 20) textAnchor = "end";
          if (x > center + 20) textAnchor = "start";

          const displayValue = stat.percentage !== undefined ? stat.percentage : Math.round(stat.value);

          return (
            <g key={i}>
              <text
                x={x}
                y={y - 8}
                fill="white"
                fillOpacity="0.4"
                fontSize="10"
                fontWeight="900"
                textAnchor={textAnchor}
                className="uppercase italic tracking-widest"
              >
                {stat.label}
              </text>
              <text
                x={x}
                y={y + 12}
                fill="white"
                fontSize="16"
                fontWeight="900"
                textAnchor={textAnchor}
                className="italic"
              >
                {displayValue}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
