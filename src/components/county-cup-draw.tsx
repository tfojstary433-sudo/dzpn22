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
}

export function CountyCupDraw() {
  const [isActive, setIsActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [revealedMatches, setRevealedMatches] = useState<Match[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isHandDrawing, setIsHandDrawing] = useState(false);
  const [currentDrawnTeam, setCurrentDrawnTeam] = useState<Team | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const drawDate = useMemo(() => new Date('2026-06-25T15:06:00'), []);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      if (now >= drawDate && !isFinished && !isActive) {
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

  const startDrawingProcess = async () => {
    setIsDrawing(true);
    try {
      const res = await fetch('https://league-builder.replit.app/api/public/schedule/cup.json');
      const data = await res.json();
      const cupMatches = data.matches.filter((m: any) => m.match_type === 'county_cup' && (m.home_team || m.away_team));
      
      // Animation sequence for each match
      for (let i = 0; i < cupMatches.length; i++) {
        const match = cupMatches[i];
        
        // Prepare slot in grid
        setRevealedMatches(prev => {
          const newMatches = [...prev];
          newMatches[i] = { ...match, home_team: null, away_team: null };
          return newMatches;
        });

        // Draw Home Team
        if (match.home_team) {
          await performHandDraw(match.home_team);
          setRevealedMatches(prev => {
            const newMatches = [...prev];
            newMatches[i] = { ...newMatches[i], home_team: match.home_team };
            return newMatches;
          });
        }

        await new Promise(r => setTimeout(r, 500));

        // Draw Away Team
        if (match.away_team) {
          await performHandDraw(match.away_team);
          setRevealedMatches(prev => {
            const newMatches = [...prev];
            newMatches[i] = { ...newMatches[i], away_team: match.away_team };
            return newMatches;
          });
        }
        
        await new Promise(r => setTimeout(r, 800));
      }
      
      setIsDrawing(false);
      setIsFinished(true);
    } catch (e) {
      console.error('Draw process error:', e);
    }
  };

  const performHandDraw = async (team: Team) => {
    setIsHandDrawing(true);
    setCurrentDrawnTeam(null);
    await new Promise(r => setTimeout(r, 1500)); // Hand moving to basket
    setCurrentDrawnTeam(team);
    await new Promise(r => setTimeout(r, 2000)); // Hand showing team
    setIsHandDrawing(false);
    setCurrentDrawnTeam(null);
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#020617]/98 backdrop-blur-3xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-1000">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center">
        {/* Header */}
        <div className="mb-12 text-center animate-in slide-in-from-top-12 duration-1000">
          <div className="relative w-32 h-32 md:w-48 md:h-48 mx-auto mb-8">
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

        {/* Countdown Phase */}
        {countdown !== null && (
          <div className="flex flex-col items-center gap-8 animate-in zoom-in duration-500 mt-12">
            <span className="text-blue-500/40 text-xs font-black uppercase tracking-[0.8em] animate-pulse">PRZYGOTUJ SIĘ</span>
            <div className="text-[12rem] font-black italic text-white tabular-nums leading-none drop-shadow-[0_0_80px_rgba(59,130,246,0.4)]">
              {countdown}
            </div>
          </div>
        )}

        {/* Drawing Animation (The "Soccer Ball" Reveal) */}
        {isHandDrawing && (
          <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-300">
            <div className="relative flex flex-col items-center">
              {/* Soccer Ball Container */}
              <div className={`relative w-72 h-72 md:w-96 md:h-96 transition-all duration-1000 ${currentDrawnTeam ? 'scale-110' : 'scale-90 opacity-50'}`}>
                {/* Soccer Ball Background Image */}
                <Image 
                  src="https://emojigraph.org/media/openmoji/soccer-ball_26bd.png" 
                  alt="" 
                  fill 
                  className={`object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.2)] ${!currentDrawnTeam ? 'animate-spin-slow' : 'animate-bounce-short'}`}
                  onError={(e: any) => { e.target.src = 'https://i.ibb.co/rK2KV1FN/IMG-4837-1.png' }}
                />
                
                {/* Inner Content (Team Logo) */}
                <div className="absolute inset-0 flex items-center justify-center pt-4">
                  {currentDrawnTeam ? (
                    <div className="flex flex-col items-center animate-in zoom-in duration-500">
                      <div className="relative w-28 h-28 md:w-36 md:h-36 mb-4 drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                        <Image 
                          src={`https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/teams/${currentDrawnTeam.id}/logo`} 
                          alt="" 
                          fill 
                          className="object-contain"
                          onError={(e: any) => { e.target.src = 'https://i.ibb.co/rK2KV1FN/IMG-4837-1.png' }}
                        />
                      </div>
                      <span className="text-xl md:text-3xl font-black text-white italic uppercase tracking-tighter text-center bg-black/60 px-4 py-1 rounded-full backdrop-blur-md border border-white/20">
                        {currentDrawnTeam.name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 bg-black/40 p-6 rounded-full backdrop-blur-sm border border-white/10">
                      <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                      <span className="text-white font-black uppercase tracking-widest text-[10px]">LOSOWANIE...</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Hand Line Visual */}
              <div className="w-1 h-48 bg-gradient-to-b from-transparent via-white/40 to-transparent blur-[2px] animate-draw-line" />
            </div>
          </div>
        )}

        {/* Revealed Results Grid */}
        {(isDrawing || isFinished) && (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-12 duration-1000 mt-8 max-h-[50vh] overflow-y-auto p-4 scrollbar-hide">
            {revealedMatches.map((match, idx) => (
              <div 
                key={idx} 
                className={`bg-[#0c162d]/60 backdrop-blur-2xl border border-white/5 p-8 rounded-[3rem] transition-all duration-700 flex items-center justify-between group shadow-2xl relative overflow-hidden ${
                  idx === revealedMatches.length - 1 && isDrawing ? 'ring-2 ring-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.3)] bg-blue-500/10' : ''
                }`}
              >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl -mr-12 -mt-12" />

                {/* Home */}
                <div className="flex flex-col items-center gap-4 flex-1">
                   <div className={`relative w-20 h-20 bg-black/40 rounded-2xl p-3 border border-white/10 shadow-2xl transition-all duration-700 ${!match.home_team ? 'opacity-20 scale-90 blur-sm' : 'opacity-100 scale-100'}`}>
                      {match.home_team ? (
                        <Image 
                          src={`https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/teams/${match.home_team.id}/logo`} 
                          alt="" 
                          fill
                          className="object-contain p-2"
                          onError={(e: any) => { e.target.src = 'https://i.ibb.co/rK2KV1FN/IMG-4837-1.png' }}
                        />
                      ) : (
                        <Image src="https://i.ibb.co/rK2KV1FN/IMG-4837-1.png" alt="" fill className="object-contain opacity-20 p-2" />
                      )}
                   </div>
                   <span className={`text-[11px] font-black uppercase tracking-tight text-center transition-colors ${!match.home_team ? 'text-white/20' : 'text-white'}`}>
                     {match.home_team?.name || '???'}
                   </span>
                </div>

                <div className="px-6 flex flex-col items-center shrink-0">
                   <div className="text-blue-500 font-black text-lg italic tracking-tighter drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">VS</div>
                </div>

                {/* Away */}
                <div className="flex flex-col items-center gap-4 flex-1">
                   <div className={`relative w-20 h-20 bg-black/40 rounded-2xl p-3 border border-white/10 shadow-2xl transition-all duration-700 ${!match.away_team ? 'opacity-20 scale-90 blur-sm' : 'opacity-100 scale-100'}`}>
                      {match.away_team ? (
                        <Image 
                          src={`https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/teams/${match.away_team.id}/logo`} 
                          alt="" 
                          fill
                          className="object-contain p-2"
                          onError={(e: any) => { e.target.src = 'https://i.ibb.co/rK2KV1FN/IMG-4837-1.png' }}
                        />
                      ) : (
                        <Image src="https://i.ibb.co/rK2KV1FN/IMG-4837-1.png" alt="" fill className="object-contain opacity-20 p-2" />
                      )}
                   </div>
                   <span className={`text-[11px] font-black uppercase tracking-tight text-center transition-colors ${!match.away_team ? 'text-white/20' : 'text-white'}`}>
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
            className="mt-12 px-16 py-5 bg-blue-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-700 transition-all transform hover:scale-105 shadow-[0_10px_40px_rgba(37,99,235,0.4)] animate-in zoom-in duration-500"
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
          50% { height: 256px; opacity: 1; }
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
          animation: spin-slow 8s linear infinite;
        }
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-bounce-short {
          animation: bounce-short 0.5s ease-in-out infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
