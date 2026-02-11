'use client';

import Image from 'next/image';
import { standings as defaultStandings, teams } from '@/lib/data';
import { useMatchStats } from '@/lib/useMatchStats';

interface WidgetProps {
  setActiveTab: (tab: 'terminarz' | 'tabela' | 'live' | 'statystyki') => void;
  setIsMinimized: (value: boolean) => void;
}

export function CompactLeagueTable({ setActiveTab, setIsMinimized }: WidgetProps) {
  const standings = defaultStandings.slice(0, 5); // Top 5
  
  const handleFullTable = () => {
    setActiveTab('tabela');
    setIsMinimized(false);
  };

  return (
    <div className="bg-[#0a0a0a]/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      <div className="bg-gradient-to-r from-[#003087] to-[#001a4d] px-4 py-3 border-b border-white/10 flex justify-between items-center">
        <h3 className="text-sm font-black text-white uppercase tracking-wider">Tabela Ligowa</h3>
        <button 
          onClick={handleFullTable}
          className="text-[10px] font-bold text-[#00ccff] hover:text-white transition-colors uppercase"
        >
          Pełna →
        </button>
      </div>
      <div className="p-2 space-y-1">
        {standings.map((standing) => (
          <div 
            key={standing.position}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
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
                <span className="flex-1 text-xs font-bold text-white uppercase truncate">{standing.team.shortName}</span>
                <span className="text-xs font-black text-white bg-white/10 px-2 py-0.5 rounded-md">{standing.points}</span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CompactTopScorers({ setActiveTab, setIsMinimized }: WidgetProps) {
  const { topScorers } = useMatchStats();
  const topThree = topScorers.slice(0, 3);

  const handleFullStats = () => {
    setActiveTab('statystyki');
    setIsMinimized(false);
  };

  if (topThree.length === 0) return null;

  const getTeam = (teamId: string) => teams.find(t => t.id === teamId);

  return (
    <div className="bg-[#0a0a0a]/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      <div className="bg-gradient-to-r from-yellow-600/20 to-transparent px-4 py-3 border-b border-white/10 flex justify-between items-center">
        <h3 className="text-sm font-black text-white uppercase tracking-wider">Statystyki</h3>
        <button 
          onClick={handleFullStats}
          className="text-[10px] font-bold text-yellow-500 hover:text-white transition-colors uppercase"
        >
          Więcej →
        </button>
      </div>
      <div className="p-2 space-y-2">
        {topThree.map((player, index) => {
          const team = getTeam(player.teamId);
          return (
            <div key={player.playerId} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/5">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 bg-black">
                  <Image
                    src={`https://tr.rbxcdn.com/30DAY-AvatarHeadshot-${player.playerId}-150x150-Png-00.png`}
                    alt={player.name}
                    width={40}
                    height={40}
                    unoptimized
                  />
                </div>
                <div className="absolute -top-1 -left-1 bg-yellow-500 text-black text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg">
                  {index + 1}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-white uppercase truncate">{player.name}</p>
                <div className="flex items-center gap-1">
                  {team && <Image src={team.logo} alt={team.name} width={12} height={12} />}
                  <span className="text-[8px] text-gray-400 font-bold uppercase">{team?.shortName}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-yellow-500">{player.goals}</span>
                <p className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter">Gole</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
