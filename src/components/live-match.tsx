'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { teams as localTeams, matches as scheduledMatches } from '@/lib/data';
import { ChevronLeft, Copy, Users, ListFilter } from 'lucide-react';

interface ApiMatch {
  id: number;
  uuid: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  status: string;
  timer: string;
  period: string;
  isActive: boolean;
  addedTime: number;
  stats: Record<string, unknown>;
  lineupA: {
    formation: string;
    starters: { id: number; name: string }[];
    bench: unknown[];
  };
  lineupB: {
    formation: string;
    starters: { id: number; name: string }[];
    bench: unknown[];
  };
}

interface ApiMatchDetails {
  match: ApiMatch;
  events: {
    goals: { minute: number; player: string; team: 'home' | 'away'; isPenalty: boolean }[];
    cards: unknown[];
    substitutions: unknown[];
  };
}

export function LiveMatch() {
  const [liveMatch, setLiveMatch] = useState<ApiMatchDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'lineups'>('timeline');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch('/api/matches', {
            headers: { 'Accept': 'application/json' },
            cache: 'no-store'
        });
        const matches: ApiMatch[] = await response.json();
        
        // Save finished matches that are in our schedule
        const finishedInApi = matches.filter(m => m.status === 'finished');
        const storedFinished = JSON.parse(localStorage.getItem('finishedMatches') || '{}');
        let changed = false;

        finishedInApi.forEach(m => {
          const scheduled = scheduledMatches.find(sm => 
            (sm.homeTeam.name === m.teamA || sm.homeTeam.shortName === m.teamA) &&
            (sm.awayTeam.name === m.teamB || sm.awayTeam.shortName === m.teamB)
          );
          if (scheduled && !storedFinished[scheduled.id]) {
            storedFinished[scheduled.id] = {
              scoreA: m.scoreA,
              scoreB: m.scoreB,
              status: 'finished'
            };
            changed = true;
          }
        });

        if (changed) {
          localStorage.setItem('finishedMatches', JSON.stringify(storedFinished));
          window.dispatchEvent(new Event('storage'));
        }

        // Find active match that matches our schedule
        const active = matches.find(m => (m.isActive || m.status === 'active') && scheduledMatches.some(sm =>
          (sm.homeTeam.name === m.teamA || sm.homeTeam.shortName === m.teamA) &&
          (sm.awayTeam.name === m.teamB || sm.awayTeam.shortName === m.teamB)
        ));
        
        if (active) {
          const detailRes = await fetch(`/api/matches/${active.uuid}`, {
              headers: { 'Accept': 'application/json' },
              cache: 'no-store'
          });
          const details: ApiMatchDetails = await detailRes.json();
          setLiveMatch(details);
        } else {
          setLiveMatch(null);
        }
      } catch (error) {
        console.error('Failed to fetch live matches:', error);
      }
    };

    fetchMatches();
    const interval = setInterval(fetchMatches, 5000); 
    return () => clearInterval(interval);
  }, []);

  if (!liveMatch) return null;

  const { match, events } = liveMatch;

  const calculatedScore = events?.goals ? events.goals.reduce((acc, goal) => {
    if (goal.team === 'home' || goal.team === match.teamA) acc.scoreA++;
    else if (goal.team === 'away' || goal.team === match.teamB) acc.scoreB++;
    return acc;
  }, { scoreA: 0, scoreB: 0 }) : null;

  const getTeamData = (teamName: string) => {
    return localTeams.find(t => 
      t.name.toLowerCase().includes(teamName.toLowerCase()) || 
      teamName.toLowerCase().includes(t.shortName.toLowerCase())
    );
  };

  const getTeamLogo = (teamName: string) => {
    const team = getTeamData(teamName);
    return team?.logo || 'https://i.ibb.co/23XPPB9m/system-administration-3.png';
  };

  const handleCopyUuid = () => {
    navigator.clipboard.writeText(match.uuid);
  };

  return (
    <div className="w-full bg-[#050b18] text-white py-12 border-b border-white/5 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 via-transparent to-transparent"></div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Top Status Pill */}
        <div className="flex justify-center mb-12">
          <div className="bg-black/40 border border-white/10 backdrop-blur-xl rounded-full px-8 py-3 flex items-center gap-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-3 h-3 rounded-full bg-red-500/40 animate-ping"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff4d4d] shadow-[0_0_15px_rgba(255,77,77,0.8)] z-10"></div>
            </div>
            <span className="text-xs font-black uppercase tracking-[0.25em] text-white/90 flex items-center gap-2">
              <span className="text-red-500 animate-pulse font-black">NA ŻYWO</span>
              <span className="w-px h-3 bg-white/20 mx-1"></span>
              {match.timer} <span className="text-white/40 font-medium">|</span> {match.period}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 md:gap-12 mb-16">
          {/* Home Team */}
          <Link 
            href={getTeamData(match.teamA) ? `/klub/${getTeamData(match.teamA)!.id}` : '#'} 
            className="flex flex-col items-center gap-6 flex-1 group"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-blue-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Image 
                src={getTeamLogo(match.teamA)} 
                alt={match.teamA} 
                width={140} 
                height={140} 
                className="object-contain relative z-10 w-24 h-24 md:w-36 md:h-36 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-transform group-hover:scale-105" 
              />
            </div>
            <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-center">{match.teamA}</h2>
          </Link>

          {/* Score Box */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-blue-400/20 to-blue-500/20 rounded-[40px] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
            <div className="bg-[#0a0a0a]/80 border border-white/10 backdrop-blur-xl rounded-[40px] px-8 md:px-12 py-8 md:py-10 flex flex-col items-center justify-center min-w-[160px] md:min-w-[240px] shadow-2xl relative">
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-2">WYNIK</span>
              <div className="text-6xl md:text-8xl font-black tracking-tighter flex items-center gap-4">
                <span>{calculatedScore ? calculatedScore.scoreA : match.scoreA}</span>
                <span className="text-white/20">:</span>
                <span>{calculatedScore ? calculatedScore.scoreB : match.scoreB}</span>
              </div>
              <div className="flex gap-1.5 mt-4">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>

          {/* Away Team */}
          <Link 
            href={getTeamData(match.teamB) ? `/klub/${getTeamData(match.teamB)!.id}` : '#'} 
            className="flex flex-col items-center gap-6 flex-1 group"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-blue-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Image 
                src={getTeamLogo(match.teamB)} 
                alt={match.teamB} 
                width={140} 
                height={140} 
                className="object-contain relative z-10 w-24 h-24 md:w-36 md:h-36 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-transform group-hover:scale-105" 
              />
            </div>
            <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-center">{match.teamB}</h2>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-white/5">
          {/* Tabs */}
          <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('timeline')}
              className={`px-8 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'timeline' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              RELACJA
            </button>
            <button 
              onClick={() => setActiveTab('lineups')}
              className={`px-8 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'lineups' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              SKŁADY
            </button>
          </div>

          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5 group">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/30">ID SPOTKANIA</span>
            <span className="text-xs font-mono text-white/60">{match.uuid.substring(0, 12)}...</span>
            <button onClick={handleCopyUuid} className="bg-white/10 hover:bg-blue-600 p-1.5 rounded-lg transition-all text-white/60 hover:text-white">
              <Copy size={14} />
            </button>
          </div>
        </div>

        <div className="mt-12">
          {activeTab === 'timeline' ? (
          <div className="max-w-2xl mx-auto space-y-4">
            {events.goals.length > 0 ? (
              events.goals.map((goal, index) => {
                const isHome = goal.team === 'home' || goal.team === match.teamA;
                return (
                  <div key={index} className={`relative flex items-center gap-6 p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md transition-all hover:border-white/20 group ${isHome ? 'flex-row' : 'flex-row-reverse text-right'}`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg border ${
                      isHome 
                        ? 'bg-blue-600/20 border-blue-500/30 text-blue-400 shadow-blue-500/10' 
                        : 'bg-red-600/20 border-red-500/30 text-red-400 shadow-red-500/10'
                    }`}>
                      {goal.minute}'
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-1">
                      <div className={`flex items-center gap-2 ${isHome ? '' : 'flex-row-reverse'}`}>
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md ${
                          isHome ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
                        }`}>
                          GOL!
                        </span>
                        <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">
                          {isHome ? match.teamA : match.teamB}
                        </span>
                      </div>
                      <h4 className="text-lg font-black uppercase tracking-tight text-white group-hover:text-blue-400 transition-colors">
                        {goal.player}
                      </h4>
                    </div>

                    <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 ${isHome ? 'order-last' : 'order-first'}`}>
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 4C13.43 4 14.77 4.48 15.86 5.29L14.41 6.74C13.68 6.27 12.87 6 12 6C11.13 6 10.32 6.27 9.59 6.74L8.14 5.29C9.23 4.48 10.57 4 12 4ZM4 12C4 10.57 4.48 9.23 5.29 8.14L6.74 9.59C6.27 10.32 6 11.13 6 12C6 12.87 6.27 13.68 6.74 14.41L5.29 15.86C4.48 14.77 4 13.43 4 12ZM12 20C10.57 20 9.23 19.52 8.14 18.71L9.59 17.26C10.32 17.73 11.13 18 12 18C12.87 18 13.68 17.73 14.41 17.26L15.86 18.71C14.77 19.52 13.43 20 12 20ZM20 12C20 13.43 19.52 14.77 18.71 15.86L17.26 14.41C17.73 13.68 18 12.87 18 12C18 11.13 17.73 10.32 17.26 9.59L18.71 8.14C19.52 9.23 20 10.57 20 12ZM12 10.5C12.83 10.5 13.5 11.17 13.5 12S12.83 13.5 12 13.5 10.5 12.83 10.5 12 11.17 10.5 12 10.5Z" />
                      </svg>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-[#0f172a] border border-white/5 rounded-xl p-12 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">
                Waiting for match action...
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <LineupSide teamName={match.teamA} teamId={getTeamData(match.teamA)?.id} lineup={match.lineupA} side="home" />
            <LineupSide teamName={match.teamB} teamId={getTeamData(match.teamB)?.id} lineup={match.lineupB} side="away" />
          </div>
        )}
      </div>
    </div>
  </div>
);
}

function LineupSide({ teamName, teamId, lineup, side }: { teamName: string; teamId?: string; lineup: ApiMatch['lineupA'], side: 'home' | 'away' }) {
  return (
    <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-6 shadow-xl">
      <Link href={teamId ? `/klub/${teamId}` : '#'} className="hover:text-blue-400 transition-colors">
        <h3 className="font-black uppercase mb-8 text-lg tracking-tight">{teamName} - SKŁAD</h3>
      </Link>
      
      <div className="mb-8">
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">FORMACJA</p>
        <p className="text-white font-black text-xl">{lineup.formation || '4-4-2'}</p>
      </div>

      <div className="border-t border-white/5 pt-8 mb-8">
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">WYJŚCIOWA JEDENASTKA</p>
        
        {lineup.starters.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {lineup.starters.map((player) => (
              <div key={player.id} className="text-sm font-bold text-gray-300 italic flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                {player.name}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic text-sm font-medium">Brak danych o składzie</p>
        )}
      </div>

      <div className="relative aspect-[2/3] w-full bg-gradient-to-b from-[#1a2e1a] to-[#0f1a0f] rounded-2xl border-2 border-white/10 overflow-hidden shadow-inner">
        {/* Pitch Lines */}
        <div className="absolute inset-4 border border-white/10" />
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1/2 h-[15%] border-b border-x border-white/10" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1/2 h-[15%] border-t border-x border-white/10" />
        <div className="absolute top-1/2 left-4 right-4 h-px bg-white/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 aspect-square border border-white/10 rounded-full" />
        
        {/* Players on pitch */}
        <div className="absolute inset-0 p-8">
           {renderPlayersOnPitch(lineup.starters, lineup.formation, side)}
        </div>
      </div>
    </div>
  );
}

function renderPlayersOnPitch(starters: { id: number; name: string }[], formation: string, side: 'home' | 'away') {
    if (starters.length === 0) return null;

    return starters.slice(0, 11).map((player, idx) => {
        let top = 0;
        let left = 50;

        if (idx === 0) { top = 85; left = 50; } 
        else if (idx <= 4) { top = 65; left = 20 + ((idx - 1) * 20); } 
        else if (idx <= 8) { top = 40; left = 20 + ((idx - 5) * 20); } 
        else { top = 15; left = 35 + ((idx - 9) * 30); } 

        if (side === 'away') {
            top = 100 - top;
        }
        
        return (
            <div 
                key={player.id} 
                className="absolute flex flex-col items-center gap-1 -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
                style={{ 
                    top: `${top}%`, 
                    left: `${left}%`,
                }}
            >
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-[10px] md:text-xs font-black text-white">
                    {idx + 1}
                </div>
                <div className="bg-black/80 px-2 py-0.5 rounded shadow-sm border border-white/5 text-[8px] md:text-[10px] font-bold whitespace-nowrap text-white">
                    {player.name}
                </div>
            </div>
        );
    });
}
