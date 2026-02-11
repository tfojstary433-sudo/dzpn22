'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { matches, standings } from '@/lib/data';

import { LeagueTable } from './league-table';
import { Statistics } from './statistics';

interface LiveMatchData {
  id: string;
  status: string;
  timer: string;
  period: string;
  date: string;
  homeTeam: {
    score: number;
    shortName: string;
    logo: string;
  };
  awayTeam: {
    score: number;
    shortName: string;
    logo: string;
  };
}

interface ScheduleTableOverlayProps {
  isMinimized?: boolean;
  setIsMinimized?: (value: boolean) => void;
  activeTab?: 'terminarz' | 'tabela' | 'live' | 'statystyki';
  setActiveTab?: (tab: 'terminarz' | 'tabela' | 'live' | 'statystyki') => void;
}

export function ScheduleTableOverlay({ 
  isMinimized: externalIsMinimized, 
  setIsMinimized: externalSetIsMinimized,
  activeTab: externalActiveTab,
  setActiveTab: externalSetActiveTab
}: ScheduleTableOverlayProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<'terminarz' | 'tabela' | 'live' | 'statystyki'>('terminarz');
  const [internalIsMinimized, setInternalIsMinimized] = useState(false);
  
  const isMinimized = externalIsMinimized !== undefined ? externalIsMinimized : internalIsMinimized;
  const setIsMinimized = externalSetIsMinimized !== undefined ? externalSetIsMinimized : setInternalIsMinimized;
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  const setActiveTab = externalSetActiveTab !== undefined ? externalSetActiveTab : setInternalActiveTab;
  const [roundIndex, setRoundIndex] = useState(0);
  const [liveMatches, setLiveMatches] = useState<LiveMatchData[]>([]);
  const [loadingLive, setLoadingLive] = useState(false);

  useEffect(() => {
    const fetchLiveMatches = async () => {
      setLoadingLive(true);
      try {
        const response = await fetch('/api/matches', {
          headers: { 'Accept': 'application/json' },
          cache: 'no-store'
        });
        const apiMatches = await response.json();
        
        const liveData: LiveMatchData[] = [];
        
        const apiMatchesList = Array.isArray(apiMatches) ? apiMatches : [];
        
        for (const apiMatch of apiMatchesList) {
          if (apiMatch.isActive || apiMatch.status === 'active') {
            const matchInSchedule = matches.find(m => 
              (m.homeTeam.name === apiMatch.teamA || m.homeTeam.shortName === apiMatch.teamA) &&
              (m.awayTeam.name === apiMatch.teamB || m.awayTeam.shortName === apiMatch.teamB)
            );
            
            if (matchInSchedule) {
              liveData.push({
                id: apiMatch.uuid,
                status: apiMatch.status,
                timer: apiMatch.timer || '0:00',
                period: apiMatch.period || 'Pierwsza połowa',
                date: matchInSchedule.date,
                homeTeam: {
                  shortName: matchInSchedule.homeTeam.shortName,
                  logo: matchInSchedule.homeTeam.logo,
                  score: apiMatch.scoreA ?? 0
                },
                awayTeam: {
                  shortName: matchInSchedule.awayTeam.shortName,
                  logo: matchInSchedule.awayTeam.logo,
                  score: apiMatch.scoreB ?? 0
                }
              });
            }
          }
        }
        
        setLiveMatches(liveData);
      } catch (error) {
        console.error('Błąd pobierania meczów na żywo:', error);
        setLiveMatches([]);
      } finally {
        setLoadingLive(false);
      }
    };

    fetchLiveMatches();
    const interval = setInterval(fetchLiveMatches, 5000);
    return () => clearInterval(interval);
  }, []);

  const allRounds = [...new Set(matches.map(m => m.round))].sort((a, b) => Number(a) - Number(b));
  const currentRound = allRounds[roundIndex];
  const roundMatches = matches.filter(m => m.round === currentRound).slice(0, 4);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`fixed right-4 top-1/2 -translate-y-1/2 w-96 z-50 transition-all duration-300 ${isMinimized ? 'translate-x-[340px]' : 'translate-x-0'}`}>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsMinimized(!isMinimized)}
        className="absolute left-[-48px] top-0 w-12 h-12 bg-black/80 backdrop-blur-xl text-[#00ccff] flex items-center justify-center rounded-l-2xl shadow-2xl hover:bg-black transition-all border-y border-l border-white/10 group"
        title={isMinimized ? "Rozwiń" : "Zminimalizuj"}
      >
        {isMinimized ? (
          <Maximize2 size={20} className="group-hover:scale-110 transition-transform" />
        ) : (
          <Minimize2 size={20} className="group-hover:scale-110 transition-transform" />
        )}
        <div className="absolute inset-0 bg-[#00ccff]/5 opacity-0 group-hover:opacity-100 rounded-l-2xl transition-opacity" />
      </button>

      {/* Tab headers */}
      <div className="flex gap-1 p-1 bg-black/60 backdrop-blur-xl border border-white/10 rounded-t-2xl shadow-2xl relative overflow-hidden">
        {/* Background glow for the whole tab bar */}
        <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-[#00ccff] to-transparent opacity-50" />
        
        <button
          onClick={() => setActiveTab('terminarz')}
          className={`relative flex-1 py-3 text-[10px] font-black tracking-widest text-center transition-all duration-300 rounded-xl z-10 ${
            activeTab === 'terminarz'
              ? 'text-white'
              : 'text-gray-500 hover:text-white hover:bg-white/5'
          }`}
        >
          {activeTab === 'terminarz' && (
            <div className="absolute inset-0 bg-gradient-to-br from-[#00ccff] to-[#0066ff] rounded-xl -z-10 shadow-[0_0_20px_rgba(0,204,255,0.3)]" />
          )}
          TERMINARZ
        </button>
        <button
          onClick={() => setActiveTab('tabela')}
          className={`relative flex-1 py-3 text-[10px] font-black tracking-widest text-center transition-all duration-300 rounded-xl z-10 ${
            activeTab === 'tabela'
              ? 'text-white'
              : 'text-gray-500 hover:text-white hover:bg-white/5'
          }`}
        >
          {activeTab === 'tabela' && (
            <div className="absolute inset-0 bg-gradient-to-br from-[#00ccff] to-[#0066ff] rounded-xl -z-10 shadow-[0_0_20px_rgba(0,204,255,0.3)]" />
          )}
          TABELA
        </button>
        <button
          onClick={() => setActiveTab('live')}
          className={`relative flex-1 py-3 text-[10px] font-black tracking-widest text-center transition-all duration-300 rounded-xl z-10 ${
            activeTab === 'live'
              ? 'text-white'
              : 'text-gray-500 hover:text-white hover:bg-white/5'
          }`}
        >
          {activeTab === 'live' && (
            <div className="absolute inset-0 bg-gradient-to-br from-[#00ccff] to-[#0066ff] rounded-xl -z-10 shadow-[0_0_20px_rgba(0,204,255,0.3)]" />
          )}
          <span className="flex items-center justify-center gap-1.5">
            NA ŻYWO
            {liveMatches.length > 0 && (
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
            )}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('statystyki')}
          className={`relative flex-1 py-3 text-[10px] font-black tracking-widest text-center transition-all duration-300 rounded-xl z-10 ${
            activeTab === 'statystyki'
              ? 'text-white'
              : 'text-gray-500 hover:text-white hover:bg-white/5'
          }`}
        >
          {activeTab === 'statystyki' && (
            <div className="absolute inset-0 bg-gradient-to-br from-[#00ccff] to-[#0066ff] rounded-xl -z-10 shadow-[0_0_20px_rgba(0,204,255,0.3)]" />
          )}
          STATYSTYKI
        </button>
      </div>

      {/* Tab content container */}
      <div className="border-x border-b border-white/10 shadow-2xl rounded-b-2xl overflow-hidden glass">
        {activeTab === 'live' && (
          <div className="bg-[#0a0a0a]/90 text-white min-h-[200px] max-h-[600px] overflow-y-auto scrollbar-hide">
            <div className="bg-gradient-to-r from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] px-4 py-3 font-black text-[11px] tracking-widest text-center sticky top-0 z-10 border-b border-white/5 flex items-center justify-center gap-3">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              AKTUALNIE NA ŻYWO
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            </div>
          <div className="p-0">
            {loadingLive && liveMatches.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">Ładowanie...</div>
            ) : liveMatches.length > 0 ? (
              <div className="divide-y divide-gray-700">
                {liveMatches.map((match) => {
                  const matchData = matches.find(m => 
                    (m.homeTeam.shortName === match.homeTeam.shortName) &&
                    (m.awayTeam.shortName === match.awayTeam.shortName)
                  );
                  const homePos = matchData ? standings.find(s => s.team?.id === matchData.homeTeam.id)?.position || '-' : '-';
                  const awayPos = matchData ? standings.find(s => s.team?.id === matchData.awayTeam.id)?.position || '-' : '-';
                  
                  return (
                    <Link href={`/mecz/${match.id}`} key={match.id} className="block">
                      <div className="px-4 py-2 bg-red-600 text-white text-[10px] font-semibold flex justify-between items-center">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                          LIVE
                        </span>
                        <span className="text-green-300 font-bold">{match.timer}</span>
                      </div>
                      <div 
                        className="relative px-4 py-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 hover:from-gray-800 hover:via-gray-700 hover:to-gray-800 transition-all cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, 
                            ${matchData?.homeTeam.color || '#1f2937'}22 0%, 
                            #1f2937 30%,
                            #1f2937 70%,
                            ${matchData?.awayTeam.color || '#1f2937'}22 100%
                          )`
                        }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex flex-col items-center gap-1 flex-1">
                            <div className="relative">
                              <div 
                                className="absolute inset-0 blur-xl opacity-30"
                                style={{ backgroundColor: matchData?.homeTeam.color }}
                              />
                              <Image
                                src={match.homeTeam.logo}
                                alt={match.homeTeam.shortName}
                                width={36}
                                height={36}
                                className="relative z-10"
                              />
                            </div>
                            <span className="text-[10px] font-bold text-white uppercase">{match.homeTeam.shortName}</span>
                            <span className="text-xs font-black text-gray-400">#{homePos}</span>
                          </div>
                          
                          <div className="flex flex-col items-center gap-1">
                            <div className="bg-black/40 backdrop-blur-sm border border-white/10 px-3 py-2 rounded-lg">
                              <span className="text-xl font-black text-white">{match.homeTeam.score} : {match.awayTeam.score}</span>
                            </div>
                            <div className="text-red-500 text-[9px] font-bold animate-pulse">LIVE</div>
                            <div className="flex items-center gap-2 text-gray-500 text-xs font-bold">
                              <span>#{homePos}</span>
                              <span className="text-white/20">|</span>
                              <span>#{awayPos}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-center gap-1 flex-1">
                            <div className="relative">
                              <div 
                                className="absolute inset-0 blur-xl opacity-30"
                                style={{ backgroundColor: matchData?.awayTeam.color }}
                              />
                              <Image
                                src={match.awayTeam.logo}
                                alt={match.awayTeam.shortName}
                                width={36}
                                height={36}
                                className="relative z-10"
                              />
                            </div>
                            <span className="text-[10px] font-bold text-white uppercase">{match.awayTeam.shortName}</span>
                            <span className="text-xs font-black text-gray-400">#{awayPos}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center text-gray-400 text-sm">
                Brak aktywnych meczów
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'terminarz' && (
        <div className="bg-[#0a0a0a]/90 text-white max-h-[600px] overflow-y-auto scrollbar-hide">
          {/* Round selector */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#1a1a1a] to-[#0a0a0a] px-4 py-4 sticky top-0 z-10 border-b border-white/5">
            <button
              onClick={() => setRoundIndex(Math.max(0, roundIndex - 1))}
              disabled={roundIndex === 0}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white hover:bg-[#00ccff]/20 hover:text-[#00ccff] disabled:opacity-20 transition-all border border-white/10"
            >
              ←
            </button>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-[#00ccff] tracking-[0.2em] mb-0.5 uppercase">EKSTRAKLASA</span>
              <span className="font-black text-lg tracking-tighter">{currentRound}. KOLEJKA</span>
            </div>
            <button
              onClick={() => setRoundIndex(Math.min(allRounds.length - 1, roundIndex + 1))}
              disabled={roundIndex === allRounds.length - 1}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white hover:bg-[#00ccff]/20 hover:text-[#00ccff] disabled:opacity-20 transition-all border border-white/10"
            >
              →
            </button>
          </div>

          {/* Matches */}
          <div className="divide-y divide-white/5">
            {roundMatches.map((match) => {
              const homePos = standings.find(s => s.team?.id === match.homeTeam.id)?.position || '-';
              const awayPos = standings.find(s => s.team?.id === match.awayTeam.id)?.position || '-';
              
              return (
                <Link href={`/mecz/${match.id}`} key={match.id} className="block group">
                  <div className="px-4 py-2 bg-black/40 text-gray-400 text-[9px] font-black tracking-widest uppercase flex items-center gap-2">
                    <div className="w-1 h-1 bg-[#00ccff] rounded-full" />
                    {formatDate(match.date)} • {formatTime(match.date)}
                  </div>
                  <div 
                    className="relative px-4 py-6 bg-gradient-to-br from-transparent to-black/40 hover:from-white/5 hover:to-white/10 transition-all cursor-pointer"
                  >
                    {/* Gradient overlays */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-20 opacity-10 group-hover:opacity-20 transition-opacity"
                      style={{
                        background: `linear-gradient(to right, ${match.homeTeam.color || '#1f2937'}, transparent)`
                      }}
                    />
                    <div 
                      className="absolute right-0 top-0 bottom-0 w-20 opacity-10 group-hover:opacity-20 transition-opacity"
                      style={{
                        background: `linear-gradient(to left, ${match.awayTeam.color || '#1f2937'}, transparent)`
                      }}
                    />

                    <div className="relative z-10 flex items-center justify-between gap-2">
                      {/* Home Team */}
                      <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                        <div className="relative">
                          <div 
                            className="absolute inset-0 blur-lg opacity-30"
                            style={{ backgroundColor: match.homeTeam.color }}
                          />
                          <Image
                            src={match.homeTeam.logo}
                            alt={match.homeTeam.name}
                            width={32}
                            height={32}
                            className="relative z-10 drop-shadow-lg"
                          />
                        </div>
                        <span className="text-[9px] font-black text-white uppercase text-center leading-tight truncate w-full">
                          {match.homeTeam.shortName}
                        </span>
                        <span className="text-[10px] font-black text-gray-500">#{homePos}</span>
                      </div>
                      
                      {/* Time/Score */}
                      <div className="flex flex-col items-center gap-1 px-3">
                        <div className="bg-gradient-to-br from-gray-800 to-black border border-white/10 px-3 py-1.5 rounded-lg shadow-xl">
                          <span className="text-base font-black text-white tracking-tight">{formatTime(match.date)}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[8px] font-black text-[#00ccff] italic uppercase">{match.stadium?.split(' ')[0]} {match.stadium?.split(' ')[1]}...</span>
                          <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-600">
                            <span>#{homePos}</span>
                            <span className="text-blue-500">vs</span>
                            <span>#{awayPos}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Away Team */}
                      <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                        <div className="relative">
                          <div 
                            className="absolute inset-0 blur-lg opacity-30"
                            style={{ backgroundColor: match.awayTeam.color }}
                          />
                          <Image
                            src={match.awayTeam.logo}
                            alt={match.awayTeam.name}
                            width={32}
                            height={32}
                            className="relative z-10 drop-shadow-lg"
                          />
                        </div>
                        <span className="text-[9px] font-black text-white uppercase text-center leading-tight truncate w-full">
                          {match.awayTeam.shortName}
                        </span>
                        <span className="text-[10px] font-black text-gray-500">#{awayPos}</span>
                      </div>
                    </div>
                    
                    {/* Category Banner */}
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#00ccff]/10 rounded-full border border-[#00ccff]/20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[7px] font-black text-[#00ccff] tracking-widest uppercase">{match.category}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'tabela' && (
        <div className="bg-[#0a0a0a]/90 text-white max-h-[600px] overflow-y-auto scrollbar-hide">
          <div className="bg-gradient-to-r from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] px-4 py-3 font-black text-[11px] tracking-widest text-center sticky top-0 z-10 border-b border-white/5 uppercase">
            Tabela Ekstraklasy
          </div>
          <div className="divide-y divide-white/5">
            {standings.slice(0, 11).map((standing) => (
              <Link 
                href={standing.team ? `/klub/${standing.team.id}` : '#'} 
                key={`standing-${standing.position}`}
                className={`block group ${standing.team ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div 
                  className="relative px-4 py-4 transition-all hover:bg-white/5"
                  style={{
                    background: standing.team ? `linear-gradient(to right, 
                      ${standing.team.color || '#000000'}11 0%, 
                      transparent 40%
                    )` : 'transparent'
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-7 h-7 rounded-lg font-black text-[11px] shadow-lg ${
                      standing.position === 1 ? 'bg-yellow-500 text-black' :
                      standing.position >= 9 ? 'bg-red-500 text-white' :
                      'bg-[#00ccff] text-white'
                    }`}>
                      {standing.position}
                    </div>
                    
                    {standing.team ? (
                      <>
                        <div className="relative flex-shrink-0">
                          <div 
                            className="absolute inset-0 blur-md opacity-20"
                            style={{ backgroundColor: standing.team.color }}
                          />
                          <Image
                            src={standing.team.logo}
                            alt={standing.team.name}
                            width={28}
                            height={28}
                            className="relative z-10 drop-shadow-md"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-black text-white text-[11px] uppercase block truncate group-hover:text-[#00ccff] transition-colors">
                            {standing.team.shortName}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-black text-white text-lg tracking-tighter">
                            {standing.points}
                          </span>
                          <span className="text-[8px] text-gray-500 font-black uppercase">PKT</span>
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-600 text-xs font-bold">-</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'statystyki' && (
        <div className="bg-[#0a0a0a]/90 text-white max-h-[600px] overflow-y-auto scrollbar-hide">
          <div className="bg-gradient-to-r from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] px-4 py-3 font-black text-[11px] tracking-widest text-center sticky top-0 z-10 border-b border-white/5 uppercase">
            Statystyki Zawodników
          </div>
          <div className="p-0">
            <Statistics isInTab={true} />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
