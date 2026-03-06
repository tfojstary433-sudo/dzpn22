'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { teams } from '@/lib/data';
import { useMatchStats } from '@/lib/useMatchStats';
import { RobloxAvatar } from './roblox-avatar';

export function Statistics({ isInTab = false }: { isInTab?: boolean } = {}) {
  const { topScorers, standings } = useMatchStats();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const mockPlayers = [
    { playerId: 1, name: 'PAKO7U7LOL', teamId: 'POG', goals: 13, assists: 4, cleanSheets: 0 },
    { playerId: 2, name: 'MichaelAmeyaw', teamId: 'ARK', goals: 5, assists: 8, cleanSheets: 0 },
    { playerId: 3, name: 'KarolCzubak', teamId: 'LEG', goals: 10, assists: 2, cleanSheets: 0 },
    { playerId: 4, name: 'MikaelIshak', teamId: 'LPO', goals: 10, assists: 3, cleanSheets: 0 },
    { playerId: 5, name: 'SebastianBergier', teamId: 'WIS', goals: 9, assists: 1, cleanSheets: 0 },
    { playerId: 6, name: 'JanGrzesik', teamId: 'ZAW', goals: 8, assists: 5, cleanSheets: 0 },
    { playerId: 7, name: 'CamiloMena', teamId: 'ZAG', goals: 7, assists: 5, cleanSheets: 0 },
    { playerId: 8, name: 'BartoszNowak', teamId: 'SOK', goals: 6, assists: 5, cleanSheets: 0 },
    { playerId: 9, name: 'RafalWolski', teamId: 'LGD', goals: 5, assists: 5, cleanSheets: 0 },
    { playerId: 10, name: 'JesusImaz', teamId: 'POG', goals: 9, assists: 3, cleanSheets: 0 },
    { playerId: 11, name: 'KacperTobiasz', teamId: 'LEG', goals: 0, assists: 0, cleanSheets: 7 },
    { playerId: 12, name: 'BartoszMrozek', teamId: 'LPO', goals: 0, assists: 0, cleanSheets: 6 },
    { playerId: 13, name: 'ValentinCo jocaru', teamId: 'POG', goals: 0, assists: 0, cleanSheets: 5 },
    { playerId: 14, name: 'KrzysztofB bicz', teamId: 'ZAG', goals: 0, assists: 0, cleanSheets: 5 },
    { playerId: 15, name: 'MateuszKochalski', teamId: 'WIS', goals: 0, assists: 0, cleanSheets: 4 },
  ];

  const activePlayers = mockPlayers;

  const topScorersSorted = [...activePlayers].sort((a, b) => b.goals - a.goals);
  const topAssistsSorted = [...activePlayers].sort((a, b) => (b.assists || 0) - (a.assists || 0));
  const topPointsSorted = [...activePlayers].sort((a, b) => 
    (b.goals + (b.assists || 0)) - (a.goals + (a.assists || 0))
  );
  const topKeepersSorted = [...activePlayers].filter(p => p.cleanSheets > 0).sort((a, b) => b.cleanSheets - a.cleanSheets);

  const StatCard = ({ title, players, metric, label, color = "blue" }: { title: string, players: any[], metric: string, label: string, color?: "blue" | "green" }) => {
    const topPlayer = players[0];
    const otherPlayers = players.slice(1, isInTab ? 5 : 7);
    const getTeam = (teamId: string) => teams.find(t => t.id === teamId);
    
    const themeColor = color === "green" ? "#10b981" : "#00ccff";
    const bgGradient = color === "green" ? "from-[#10b981]/10" : "from-[#0033cc]/10";

    return (
      <div className={`flex flex-col h-full rounded-2xl overflow-hidden glass border border-white/5 shadow-2xl ${isInTab ? 'border-none bg-transparent shadow-none' : ''}`}>
        {/* Title Header */}
        <div className={`${isInTab ? 'bg-[#0033cc]/20' : bgGradient} backdrop-blur-md py-4 px-6 border-b border-white/5 relative overflow-hidden`}>
          <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: themeColor }} />
          <h3 className="font-black text-[11px] uppercase tracking-[0.2em]" style={{ color: themeColor }}>
            {title}
          </h3>
        </div>

        {/* Top Player Section */}
        {topPlayer && (
          <div className={`relative ${isInTab ? 'p-4 min-h-[180px]' : 'p-6 min-h-[220px]'} overflow-hidden group`}>
            {/* Elegant Leader Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#ffd700]/20 via-[#b8860b]/10 to-transparent" />
            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
                <div className="absolute inset-0" style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,215,0,0.2) 10px, rgba(255,215,0,0.2) 20px)`
                }}></div>
            </div>
            
            <div className="relative z-20 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center font-black text-black text-[10px] shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                  1
                </div>
                <span className="text-yellow-500/80 text-[10px] font-black uppercase tracking-widest">Lider</span>
              </div>

              <h4 className={`text-white font-black uppercase mb-6 tracking-tighter leading-none group-hover:text-yellow-500 transition-colors ${isInTab ? 'text-xl truncate max-w-[150px]' : 'text-3xl'}`}>
                {topPlayer.name}
              </h4>

              <div className="mt-auto flex items-end gap-3">
                <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col items-center justify-center shadow-2xl group-hover:border-yellow-500/50 transition-colors ${isInTab ? 'px-4 py-2 min-w-[60px]' : 'px-6 py-3 min-w-[80px]'}`}>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</span>
                  <span className={`${isInTab ? 'text-2xl' : 'text-3xl'} font-black text-white leading-none`}>
                    {metric === 'points' ? (topPlayer.goals + (topPlayer.assists || 0)) : topPlayer[metric]}
                  </span>
                </div>
                
                {getTeam(topPlayer.teamId) && (
                  <Link href={`/klub/${topPlayer.teamId}`} className="hover:scale-110 transition-transform active:scale-95 duration-300">
                    <div className={`${isInTab ? 'w-10 h-10' : 'w-14 h-14'} bg-white/5 backdrop-blur-md rounded-2xl p-2 flex items-center justify-center border border-white/10 hover:border-white/30 transition-all`}>
                      <Image 
                        src={getTeam(topPlayer.teamId)!.logo} 
                        alt="Team Logo" 
                        width={isInTab ? 24 : 40} 
                        height={isInTab ? 24 : 40} 
                        className="object-contain"
                      />
                    </div>
                  </Link>
                )}
              </div>
            </div>

            {/* Avatar - Circular Frame */}
            <div className={`absolute right-4 bottom-4 z-10 group-hover:scale-105 transition-transform duration-700 ${isInTab ? 'w-24 h-24' : 'w-36 h-36'}`}>
                <div className="w-full h-full rounded-full border-4 border-yellow-500/50 bg-black/40 backdrop-blur-md overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.3)] relative group-hover:border-yellow-500 transition-colors">
                    <RobloxAvatar
                      username={topPlayer.name}
                      className="w-full h-full object-cover scale-125 translate-y-2"
                    />
                </div>
            </div>
          </div>
        )}

        {/* List Header Bar */}
        <div className={`bg-black/40 py-3 flex justify-between items-center border-y border-white/5 ${isInTab ? 'px-4' : 'px-6'}`}>
          <span className="text-gray-500 text-[9px] font-black uppercase tracking-[0.2em]">Zawodnik</span>
          <span className="text-gray-500 text-[9px] font-black uppercase tracking-[0.2em] ml-auto">{label}</span>
        </div>

        {/* List Players */}
        <div className="flex flex-col bg-[#0a0a0a]/50">
          {otherPlayers.map((player, idx) => {
            const team = getTeam(player.teamId);
            const val = metric === 'points' ? (player.goals + (player.assists || 0)) : player[metric];
            const position = idx + 2;
            
            return (
              <div 
                key={player.playerId} 
                className={`group/row flex items-center justify-between border-b border-white/5 hover:bg-white/[0.02] transition-colors relative overflow-hidden ${isInTab ? 'px-4 py-3' : 'px-6 py-4'}`}
              >
                {/* Position Highlight */}
                {position === 2 && (
                    <div className="absolute left-0 top-0 w-1 h-full bg-gray-300 shadow-[0_0_15px_rgba(209,213,219,0.5)]" />
                )}
                {position === 3 && (
                    <div className="absolute left-0 top-0 w-1 h-full bg-[#cd7f32] shadow-[0_0_15px_rgba(205,127,50,0.5)]" />
                )}

                <div className="flex items-center gap-4 flex-1 relative z-10">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all ${
                    position === 2 ? 'bg-gradient-to-br from-gray-100 to-gray-400 text-black shadow-[0_0_15px_rgba(156,163,175,0.3)]' :
                    position === 3 ? 'bg-gradient-to-br from-[#e8a87c] to-[#cd7f32] text-black shadow-[0_0_15px_rgba(205,127,50,0.3)]' :
                    'bg-white/5 text-gray-400 group-hover/row:text-white group-hover/row:bg-white/10'
                  }`}>
                    {position}
                  </div>
                  <div className="flex flex-col">
                    <span className={`font-bold text-sm uppercase tracking-tight transition-colors truncate max-w-[120px] ${
                      position === 2 ? 'text-gray-200 group-hover/row:text-white' :
                      position === 3 ? 'text-orange-200 group-hover/row:text-orange-100' :
                      'text-white group-hover/row:text-[#00ccff]'
                    }`}>
                        {player.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-5 relative z-10">
                  <span className="font-black text-lg text-white text-right min-w-[24px]">
                    {val}
                  </span>
                  {team && (
                    <Link href={`/klub/${team.id}`} className="hover:scale-110 active:scale-90 transition-all duration-300">
                      <div className="w-9 h-9 rounded-xl p-1.5 flex items-center justify-center bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all">
                        <Image 
                          src={team.logo} 
                          alt="Logo" 
                          width={24} 
                          height={24} 
                          className="object-contain"
                        />
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    );
  };

  const content = (
    <div className="relative">
      {!isInTab && (
        <div className="flex flex-col items-center mb-16">
            <div className="gradient-border px-16 py-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center relative overflow-hidden bg-[#0a0a0a]">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
              <h2 className="relative z-10 text-4xl md:text-6xl font-black text-white tracking-tighter uppercase">
                Statystyki
              </h2>
              <div className="relative z-10 w-24 h-1.5 bg-gradient-to-r from-blue-600 to-blue-400 mt-4 transform -skew-x-12 shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
            </div>
        </div>
      )}

      <div className={`${isInTab ? 'max-w-full' : 'max-w-[1400px] mx-auto'} relative z-10`}>
        <div className={`grid grid-cols-1 ${isInTab ? 'gap-4 px-0' : 'md:grid-cols-2 xl:grid-cols-4 gap-6 px-4'}`}>
          <StatCard 
            title="KLASYFIKACJA STRZELCÓW" 
            players={topScorersSorted} 
            metric="goals" 
            label="GOL"
          />
          <StatCard 
            title="ASYSTENCI" 
            players={topAssistsSorted} 
            metric="assists" 
            label="AST"
          />
          <StatCard 
            title="KLASYFIKACJA KANADYJSKA" 
            players={topPointsSorted} 
            metric="points" 
            label="PKT"
          />
          <StatCard 
            title="CZYSTE KONTA" 
            players={topKeepersSorted} 
            metric="cleanSheets" 
            label="CK"
            color="green"
          />
        </div>
      </div>
    </div>
  );

  if (isInTab) {
    return <div className="p-0">{content}</div>;
  }

  return (
    <section id="statystyki" className="py-24 relative overflow-hidden min-h-screen bg-[#000a1a]">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px]" />
        </div>
        
      <div className="container mx-auto px-4 relative z-10">
        {content}
      </div>
    </section>
  );
}
