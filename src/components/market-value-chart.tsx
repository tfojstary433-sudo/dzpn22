'use client';

import { teams, extraTeams } from '@/lib/data';
import Image from 'next/image';
import { useState } from 'react';

interface HistoryPoint {
  date: string;
  value: number;
  team: string;
}

interface MarketValueChartProps {
  history: HistoryPoint[];
  currentClubLogo?: string;
  previousClubLogo?: string;
  peakValue?: { value: number; date: string };
}

export function MarketValueChart({ history, currentClubLogo, previousClubLogo, peakValue }: MarketValueChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  if (!history || history.length === 0) return null;

  const height = 180;
  const width = 600;
  const paddingX = 40;
  const paddingY = 40;

  const maxVal = Math.max(...history.map(p => p.value)) * 1.1;
  const minVal = 0;

  const getX = (i: number) => (i / (history.length - 1 || 1)) * (width - 2 * paddingX) + paddingX;
  const getY = (val: number) => height - ((val - minVal) / (maxVal - minVal)) * (height - 2 * paddingY) - paddingY;

  const points = history.map((p, i) => `${getX(i)},${getY(p.value)}`).join(' ');
  
  const areaPoints = `
    ${getX(0)},${height - paddingY}
    ${points}
    ${getX(history.length - 1)},${height - paddingY}
  `;

  const formatValue = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1).replace('.', ',')} mln €`;
    return `${(val / 1000).toFixed(1).replace('.', ',')} tys. €`;
  };

  const getTeamInfo = (teamName: string) => {
    if (!teamName || teamName.toLowerCase().includes('wolny agent')) return { logo: 'https://i.ibb.co/DfpFSTgc/image.png', color: '#444444' };
    const cleanName = teamName.split(' | ')[0].replace(' (RW)', '').trim().toLowerCase();
    const team = [...teams, ...extraTeams].find(t => 
      t.name.toLowerCase() === cleanName || 
      t.name.toLowerCase().includes(cleanName) ||
      t.id.toLowerCase() === cleanName.toLowerCase() || 
      t.shortName.toLowerCase() === cleanName.toLowerCase()
    );
    return { 
      logo: team?.logo || 'https://i.ibb.co/DfpFSTgc/image.png',
      color: team?.color || '#3b82f6'
    };
  };

  // Create segments for the line with different colors
  const segments = history.slice(0, -1).map((p, i) => {
    const nextP = history[i+1];
    // Use the color of the club at the current point
    const teamInfo = getTeamInfo(p.team);
    return {
      x1: getX(i),
      y1: getY(p.value),
      x2: getX(i+1),
      y2: getY(nextP.value),
      color: teamInfo.color
    };
  });

  // Find significant club changes to show logos
  const logoPoints: any[] = [];
  if (history.length > 0) {
    // Current (latest) club - always show on the right
    const latestInfo = getTeamInfo(history[history.length - 1].team);
    logoPoints.push({ 
      x: getX(history.length - 1), 
      y: getY(history[history.length - 1].value), 
      logo: currentClubLogo || latestInfo.logo
    });

    // Previous club - show on the left
    if (history.length > 1) {
      const firstInfo = getTeamInfo(history[0].team);
      logoPoints.push({ 
        x: getX(0), 
        y: getY(history[0].value), 
        logo: previousClubLogo || firstInfo.logo
      });
    }
  }

  const latestValue = history[history.length - 1].value;

  return (
    <div className="w-full relative group/chart bg-white/[0.03] backdrop-blur-xl rounded-[24px] p-8 border border-white/5 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-white tracking-tight">
            Wartość transferu: <span className="text-white">{formatValue(latestValue)}</span>
          </h3>
          <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center cursor-help group/help relative">
            <span className="text-[10px] font-bold text-white/40">?</span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black border border-white/10 rounded-lg opacity-0 group-hover/help:opacity-100 transition-opacity pointer-events-none text-[10px] text-white/60 text-center z-50">
              Szacowana wartość rynkowa na podstawie statystyk i występów.
            </div>
          </div>
        </div>

        {peakValue && (
          <div className="flex items-center gap-4 text-white/40">
            <div className="w-px h-8 bg-white/10 hidden md:block" />
            <div className="flex flex-col">
              <span className="text-[11px] uppercase font-bold tracking-wider">
                Najwyższy: <span className="text-white/60">{formatValue(peakValue.value)}</span>
              </span>
              <span className="text-[10px] font-medium">({new Date(peakValue.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })})</span>
            </div>
          </div>
        )}
      </div>

      <div className="relative h-[220px]">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((factor) => {
            const val = minVal + factor * (maxVal - minVal);
            const y = getY(val);
            return (
              <g key={factor}>
                <line 
                  x1={paddingX} 
                  y1={y} 
                  x2={width - paddingX} 
                  y2={y} 
                  stroke="white" 
                  strokeOpacity="0.05" 
                  strokeWidth="1" 
                  strokeDasharray="4 4"
                />
                <text 
                  x={paddingX - 10} 
                  y={y + 4} 
                  textAnchor="end" 
                  fill="white" 
                  fillOpacity="0.8" 
                  className="text-[11px] font-bold"
                >
                  €{(val / 1000).toFixed(0)} tys.
                </text>
              </g>
            );
          })}
          
          <text 
            x={paddingX - 10} 
            y={height - paddingY + 4} 
            textAnchor="end" 
            fill="white" 
            fillOpacity="0.8" 
            className="text-[11px] font-bold"
          >
            €0
          </text>

          {/* X Axis labels (Months) */}
          {(() => {
            const labelsCount = Math.min(history.length, 6);
            const step = Math.max(1, Math.floor(history.length / labelsCount));
            const indices = [];
            for (let i = 0; i < history.length; i += step) {
              indices.push(i);
            }
            if (indices[indices.length - 1] !== history.length - 1) {
              indices.push(history.length - 1);
            }
            
            return indices.map(i => (
              <text
                key={i}
                x={getX(i)}
                y={height + 25}
                textAnchor="middle"
                fill="white"
                fillOpacity="0.4"
                className="text-[10px] font-black uppercase tracking-tighter"
              >
                {new Date(history[i].date).toLocaleDateString('pl-PL', { month: 'short', year: 'numeric' })}
              </text>
            ));
          })()}

          {/* Area fills per club */}
          {(() => {
            const polygons: any[] = [];
            let currentPoints: string[] = [];
            let currentTeam = history[0].team;

            history.forEach((p, i) => {
              if (p.team !== currentTeam) {
                // Close current polygon
                const startX = getX(history.indexOf(history.find(hp => hp.team === currentTeam)!));
                const endX = getX(i);
                polygons.push({
                  points: `${startX},${height - paddingY} ${currentPoints.join(' ')} ${getX(i-1)},${height - paddingY}`,
                  color: getTeamInfo(currentTeam).color
                });
                
                // Start new polygon
                currentTeam = p.team;
                currentPoints = [`${getX(i)},${getY(p.value)}`];
              } else {
                currentPoints.push(`${getX(i)},${getY(p.value)}`);
              }
            });

            // Close last polygon
            const startIdx = history.findIndex(hp => hp.team === currentTeam);
            polygons.push({
              points: `${getX(startIdx)},${height - paddingY} ${currentPoints.join(' ')} ${getX(history.length - 1)},${height - paddingY}`,
              color: getTeamInfo(currentTeam).color
            });

            return polygons.map((poly, idx) => (
              <polygon
                key={idx}
                points={poly.points}
                fill={poly.color}
                fillOpacity="0.1"
              />
            ));
          })()}

          {/* Colored segments */}
          {segments.map((seg, i) => (
            <line
              key={i}
              x1={seg.x1}
              y1={seg.y1}
              x2={seg.x2}
              y2={seg.y2}
              stroke={seg.color}
              strokeWidth="3"
              strokeLinecap="round"
            />
          ))}

          {/* Logos on significant points */}
          {logoPoints.map((lp, i) => (
            <foreignObject
              key={i}
              x={lp.x - 24}
              y={lp.y - 60}
              width="48"
              height="48"
              className="overflow-visible"
            >
              <div className="w-12 h-12 rounded-full bg-[#1a1a1a] border border-white/20 p-1 shadow-xl backdrop-blur-md ring-2 ring-white/5 flex items-center justify-center">
                <img src={lp.logo} alt="" className="w-full h-full object-contain filter drop-shadow-lg" />
              </div>
            </foreignObject>
          ))}

          {/* Hover detection zones */}
          {history.map((p, i) => (
            <rect
              key={i}
              x={getX(i) - (width / history.length) / 2}
              y={0}
              width={width / history.length}
              height={height}
              fill="transparent"
              onMouseEnter={() => setHoveredPoint(i)}
              onMouseLeave={() => setHoveredPoint(null)}
              className="cursor-pointer"
            />
          ))}

          {/* Active Point Highlight */}
          {hoveredPoint !== null && (
            <g>
              <line 
                x1={getX(hoveredPoint)} 
                y1={paddingY} 
                x2={getX(hoveredPoint)} 
                y2={height - paddingY} 
                stroke="#22c55e" 
                strokeOpacity="0.3" 
                strokeWidth="1.5" 
                strokeDasharray="4 2"
              />
              <circle
                cx={getX(hoveredPoint)}
                cy={getY(history[hoveredPoint].value)}
                r="5"
                fill="#22c55e"
                stroke="#111111"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Tooltip */}
        {hoveredPoint !== null && (
          <div 
            className="absolute z-50 pointer-events-none bg-black/95 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl space-y-1 min-w-[140px]"
            style={{
              left: `${(getX(hoveredPoint) / width) * 100}%`,
              top: `${(getY(history[hoveredPoint].value) / height) * 100 - 45}%`,
              transform: hoveredPoint > history.length / 2 ? 'translate(-110%, -50%)' : 'translate(10%, -50%)'
            }}
          >
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              {new Date(history[hoveredPoint].date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
            <p className="text-lg font-bold text-green-500">
              {formatValue(history[hoveredPoint].value)}
            </p>
            <div className="flex items-center gap-2 pt-1 border-t border-white/5 mt-1">
              <span className="text-[9px] font-bold text-white/60 truncate italic">
                {history[hoveredPoint].team}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
