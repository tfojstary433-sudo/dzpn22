'use client';

import Image from 'next/image';
import Link from 'next/link';
import { standings as defaultStandings, teams } from '@/lib/data';
import { useMatchStats } from '@/lib/useMatchStats';

interface WidgetProps {
  setActiveTab: (tab: 'terminarz' | 'tabela' | 'live') => void;
  setIsMinimized: (value: boolean) => void;
}

export function CompactLeagueTable({ setActiveTab, setIsMinimized }: WidgetProps) {
  const { standings: apiStandings } = useMatchStats();
  const standings = (apiStandings.length > 0 ? apiStandings.map((s: any, idx) => ({ ...s, position: (s as any).position || idx + 1 })) : defaultStandings).slice(0, 5); // Top 5 from API or fallback
  
  const handleFullTable = () => {
    setActiveTab('tabela');
    setIsMinimized(false);
  };

  return (
    <div className="bg-transparent rounded-2xl border border-white/10 overflow-hidden">
      <div className="bg-transparent px-4 py-3 border-b border-white/10 flex justify-between items-center">
        <h3 className="text-sm font-black text-white uppercase tracking-wider">Tabela Ligowa</h3>
        <button 
          onClick={handleFullTable}
          className="text-[10px] font-bold text-white/60 hover:text-white transition-colors uppercase"
        >
          Pełna →
        </button>
      </div>
      <div className="p-2 space-y-1">
        {standings.map((standing) => (
          <Link 
            key={standing.position}
            href={standing.team ? `/klub/${standing.team.id}` : '#'}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
          >
            <span className={`w-6 text-xs font-black ${
              standing.position === 1 ? 'text-yellow-500' : 
              standing.position === 2 ? 'text-gray-400' :
              standing.position === 3 ? 'text-orange-700' : 'text-gray-500'
            }`}>
              {standing.position}.
            </span>
            {standing.team && (
              <>
                <Image src={standing.team.logo} alt={standing.team.name} width={24} height={24} className="shrink-0" />
                <span className="flex-1 text-xs font-bold text-white uppercase truncate group-hover:text-white transition-colors">{standing.team.shortName}</span>
              </>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
