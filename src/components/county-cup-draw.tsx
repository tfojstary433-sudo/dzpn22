'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Trophy, Timer, Loader2 } from 'lucide-react';

interface Team {
  id: number;
  name: string;
  logo_url?: string;
}

interface Match {
  id: number;
  home_team: Team | null;
  away_team: Team | null;
  round?: number;
}

export function CountyCupDraw() {
  const [isActive, setIsActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [revealedMatches, setRevealedMatches] = useState<Match[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isHandDrawing, setIsHandDrawing] = useState(false);
  const [currentDrawnTeam, setCurrentDrawnTeam] = useState<Team | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [apiTeams, setApiTeams] = useState<any[]>([]);

  const drawDate = useMemo(() => new Date('2026-06-30T17:00:00'), []);

  useEffect(() => {
    const checkTime = () => {
      const isAlreadyFinished = localStorage.getItem('county_cup_draw_finished_3006_1700') === 'true';
      if (isAlreadyFinished) {
        setIsActive(false);
        return;
      }

      const now = new Date();
      if (now >= drawDate && !isFinished && !isActive) {
        console.log('Starting draw process at', now);
        setIsActive(true);
        startCountdown();
      }
    };

    const timer = setInterval(checkTime, 1000);
    checkTime();
    return () => clearInterval(timer);
  }, [drawDate, isFinished, isActive]);

  const startCountdown = () => {
    setCountdown(10);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev !== null && prev <= 1) {
          clearInterval(interval);
          startDrawingProcess();
          return null;
        }
        return prev !== null ? prev - 1 : null;
      });
    }, 1000);
  };

  const getTeamLogo = (teamId: any, teamObj?: any) => {
    if (teamObj?.logo_url) return teamObj.logo_url;
    if (!teamId) return 'https://i.ibb.co/gFm0wL5C/IMG-4837-3.png';
    const team = apiTeams.find(t => String(t.team_id || t.id) === String(teamId));
    return team?.team_logo_url || team?.logo_url || `https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/teams/${teamId}/logo`;
  };

  const startDrawingProcess = async () => {
    setIsDrawing(true);
    try {
      // Fetch teams first for logos from the full teams list
      const teamsRes = await fetch('https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/teams');
      if (teamsRes.ok) {
        const teamsData = await teamsRes.json();
        setApiTeams(Array.isArray(teamsData) ? teamsData : []);
      }

      const res = await fetch('https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/brackets/1?type=county_cup');
      const data = await res.json();
      
      // Extract all matches from all rounds to show full draw
      const cupMatches: any[] = [];
      if (data.rounds && Array.isArray(data.rounds)) {
        // Use the round with the most matches (usually the starting round)
        const sortedRounds = [...data.rounds].sort((a: any, b: any) => (b.matches?.length || 0) - (a.matches?.length || 0));
        const drawRound = sortedRounds[0];
        
        if (drawRound && drawRound.matches) {
          cupMatches.push(...drawRound.matches);
        }
      }
      
      // Initialize revealed matches with the correct number of slots
      setRevealedMatches(new Array(cupMatches.length).fill(null).map((_, i) => ({
        id: i,
        home_team: null,
        away_team: null
      })));
      
      for (let i = 0; i < cupMatches.length; i++) {
        const match = cupMatches[i];
        
        if (match.home_team) {
          await performHandDraw(match.home_team);
          setRevealedMatches(prev => {
            const newMatches = [...prev];
            newMatches[i] = { ...newMatches[i], home_team: match.home_team };
            return newMatches;
          });
        } else {
           // Skip drawing if no team, but show the slot
           setRevealedMatches(prev => {
            const newMatches = [...prev];
            newMatches[i] = { ...newMatches[i], home_team: { id: 0, name: 'TBD' } };
            return newMatches;
          });
        }

        await new Promise(r => setTimeout(r, 400));

        if (match.away_team) {
          await performHandDraw(match.away_team);
          setRevealedMatches(prev => {
            const newMatches = [...prev];
            newMatches[i] = { ...newMatches[i], away_team: match.away_team };
            return newMatches;
          });
        } else {
          setRevealedMatches(prev => {
            const newMatches = [...prev];
            newMatches[i] = { ...newMatches[i], away_team: { id: 0, name: 'TBD' } };
            return newMatches;
          });
        }
        
        await new Promise(r => setTimeout(r, 600));
      }
      
      setIsDrawing(false);
      setIsFinished(true);
      localStorage.setItem('county_cup_draw_finished_3006_1700', 'true');
    } catch (e) {
      console.error('Draw process error:', e);
    }
  };

  const performHandDraw = async (team: Team) => {
    setIsHandDrawing(true);
    setCurrentDrawnTeam(null);
    await new Promise(r => setTimeout(r, 1200));
    setCurrentDrawnTeam(team);
    await new Promise(r => setTimeout(r, 1800));
    setIsHandDrawing(false);
    setCurrentDrawnTeam(null);
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#020617]/98 backdrop-blur-3xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-1000">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-7xl flex flex-col items-center">
        <div className="mb-8 text-center animate-in slide-in-from-top-12 duration-1000">
          <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-6">
             <Image 
               src="https://i.ibb.co/gFm0wL5C/IMG-4837-3.png" 
               alt="Puchar Powiatu" 
               fill 
               className="object-contain drop-shadow-[0_0_50px_rgba(59,130,246,0.5)] animate-float"
             />
          </div>
          <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-white mb-4">
            WIELKIE <span className="text-blue-500">LOSOWANIE</span>
          </h1>
          <div className="flex items-center justify-center gap-4">
             <div className="h-px w-12 bg-blue-500/50" />
             <p className="text-white/40 font-black uppercase tracking-[0.4em] text-[10px] md:text-xs">PUCHAR POWIATU • EDYCJA 2026</p>
             <div className="h-px w-12 bg-blue-500/50" />
          </div>
        </div>

        {countdown !== null && (
          <div className="flex flex-col items-center gap-8 animate-in zoom-in duration-500 mt-12">
            <span className="text-blue-500/40 text-xs font-black uppercase tracking-[0.8em] animate-pulse">PRZYGOTUJ SIĘ</span>
            <div className="text-[12rem] font-black italic text-white tabular-nums leading-none drop-shadow-[0_0_80px_rgba(59,130,246,0.4)]">
              {countdown}
            </div>
          </div>
        )}

        {isHandDrawing && (
          <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-300 bg-black/40 backdrop-blur-sm">
            <div className="relative flex flex-col items-center">
              <div className={`relative w-80 h-80 md:w-[30rem] md:h-[30rem] transition-all duration-1000 ${currentDrawnTeam ? 'scale-110' : 'scale-90 opacity-50'}`}>
                <Image 
                  src="https://emojigraph.org/media/openmoji/soccer-ball_26bd.png" 
                  alt="" 
                  fill 
                  className={`object-contain drop-shadow-[0_0_60px_rgba(255,255,255,0.3)] ${!currentDrawnTeam ? 'animate-spin-slow' : 'animate-bounce-short'}`}
                />
                
                <div className="absolute inset-0 flex items-center justify-center pt-4">
                  {currentDrawnTeam && (
                    <div className="flex flex-col items-center animate-in zoom-in duration-500">
                      <div className="relative w-32 h-32 md:w-44 md:h-44 mb-6 drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                        <Image 
                          src={getTeamLogo(currentDrawnTeam.id)} 
                          alt="" 
                          fill 
                          className="object-contain"
                        />
                      </div>
                      <span className="text-2xl md:text-4xl font-black text-white italic uppercase tracking-tighter text-center bg-black/80 px-8 py-2 rounded-full border-2 border-white/20 shadow-2xl">
                        {currentDrawnTeam.name}
                      </span>
                    </div>
                  )}
                  {!currentDrawnTeam && (
                    <div className="flex flex-col items-center gap-4 bg-black/60 p-8 rounded-full backdrop-blur-md border border-white/10">
                      <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                      <span className="text-white font-black uppercase tracking-widest text-xs">LOSOWANIE...</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-1 h-64 bg-gradient-to-b from-transparent via-white/60 to-transparent blur-[2px] animate-draw-line" />
            </div>
          </div>
        )}

        {(isDrawing || isFinished) && (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in slide-in-from-bottom-12 duration-1000 mt-4 max-h-[55vh] overflow-y-auto p-4 scrollbar-hide">
            {revealedMatches.map((match, idx) => (
              <div 
                key={idx} 
                className={`bg-[#0c162d]/80 backdrop-blur-2xl border border-white/5 p-6 rounded-[2.5rem] transition-all duration-700 flex items-center justify-between group shadow-xl relative overflow-hidden ${
                  idx === revealedMatches.length - 1 && isDrawing ? 'ring-2 ring-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.3)] bg-blue-500/10' : ''
                }`}
              >
                <div className="absolute top-0 left-0 px-3 py-1 bg-white/5 rounded-br-2xl text-[8px] font-black text-white/20 uppercase tracking-widest">
                  MECZ {idx + 1}
                </div>

                <div className="flex flex-col items-center gap-3 flex-1 mt-2">
                   <div className={`relative w-16 h-16 bg-black/40 rounded-2xl p-2 border border-white/10 shadow-2xl transition-all duration-700 ${!match.home_team ? 'opacity-10 scale-90 blur-sm' : 'opacity-100 scale-100'}`}>
                      <Image 
                        src={getTeamLogo(match.home_team?.id, match.home_team)} 
                        alt="" 
                        fill
                        className="object-contain p-1.5"
                      />
                   </div>
                   <span className={`text-[10px] font-black uppercase tracking-tight text-center transition-colors line-clamp-1 ${!match.home_team ? 'text-white/10' : 'text-white'}`}>
                     {match.home_team?.name || '???'}
                   </span>
                </div>

                <div className="px-4 flex flex-col items-center shrink-0">
                   <div className="text-blue-500 font-black text-sm italic tracking-tighter drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">VS</div>
                </div>

                <div className="flex flex-col items-center gap-3 flex-1 mt-2">
                   <div className={`relative w-16 h-16 bg-black/40 rounded-2xl p-2 border border-white/10 shadow-2xl transition-all duration-700 ${!match.away_team ? 'opacity-10 scale-90 blur-sm' : 'opacity-100 scale-100'}`}>
                      <Image 
                        src={getTeamLogo(match.away_team?.id, match.away_team)} 
                        alt="" 
                        fill
                        className="object-contain p-1.5"
                      />
                   </div>
                   <span className={`text-[10px] font-black uppercase tracking-tight text-center transition-colors line-clamp-1 ${!match.away_team ? 'text-white/10' : 'text-white'}`}>
                     {match.away_team?.name || '???'}
                   </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {isFinished && (
          <button 
            onClick={() => setIsActive(false)}
            className="mt-8 px-16 py-5 bg-blue-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-700 transition-all transform hover:scale-105 shadow-[0_10px_40px_rgba(37,99,235,0.4)] animate-in zoom-in duration-500"
          >
            ZAKOŃCZ I WRÓĆ DO STRONY
          </button>
        )}
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes draw-line {
          0% { height: 0; opacity: 0; }
          50% { height: 300px; opacity: 1; }
          100% { height: 0; opacity: 0; }
        }
        .animate-draw-line {
          animation: draw-line 3.5s infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-30px); }
        }
        .animate-bounce-short {
          animation: bounce-short 0.4s ease-in-out infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
