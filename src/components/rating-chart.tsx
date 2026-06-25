'use client';

interface RatingChartProps {
  ratings: number[];
  color: string;
}

export function RatingChart({ ratings, color }: RatingChartProps) {
  if (ratings.length === 0) return null;

  const maxRating = 10;
  const height = 100;
  const width = 300;
  const padding = 10;
  
  const points = ratings.map((rating, i) => {
    const x = (i / (ratings.length - 1 || 1)) * (width - 2 * padding) + padding;
    const y = height - (rating / maxRating) * (height - 2 * padding) - padding;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `
    ${padding},${height - padding} 
    ${points} 
    ${width - padding},${height - padding}
  `;

  return (
    <div className="w-full h-full relative">
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 2.5, 5, 7.5, 10].map((val) => {
          const y = height - (val / maxRating) * (height - 2 * padding) - padding;
          return (
            <line 
              key={val}
              x1={padding} 
              y1={y} 
              x2={width - padding} 
              y2={y} 
              stroke="white" 
              strokeOpacity="0.03" 
              strokeWidth="1" 
            />
          );
        })}

        {/* Area fill */}
        <polygon
          points={`${padding},${height-padding} ${points} ${width-padding},${height-padding}`}
          fill={`url(#gradient-${color.replace('#', '')})`}
        />

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {ratings.map((rating, i) => {
          const x = (i / (ratings.length - 1 || 1)) * (width - 2 * padding) + padding;
          const y = height - (rating / maxRating) * (height - 2 * padding) - padding;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2.5"
              fill={color}
              stroke="#111111"
              strokeWidth="1.5"
            />
          );
        })}
      </svg>
    </div>
  );
}
