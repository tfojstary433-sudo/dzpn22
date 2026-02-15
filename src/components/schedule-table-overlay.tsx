'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { matches, standings, teams, extraTeams } from '@/lib/data';
import { useMatchStats } from '@/lib/useMatchStats';
import { API_ENDPOINTS } from '@/lib/constants';

import { LeagueTable } from './league-table';

const normalize = (s: string) => (s || '').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');

// Helper function to get team object from name
function getTeamFromName(teamName: string) {
  const allTeams = [...teams, ...extraTeams];
  const search = normalize(teamName);
  
  if (!search) return {
    id: 'UNK',
    name: 'TBD',
    shortName: 'TBD',
    logo: 'https://i.ibb.co/7d4R0vZH/obraz-2026-02-04-222253347-removebg-preview-1.png',
    color: '#3b82f6'
  };

  const found = allTeams.find(t => {
    const nName = normalize(t.name);
    const nShort = normalize(t.shortName);
    const nId = normalize(t.id);
    
    return nName === search || 
           nShort === search ||
           nId === search ||
           nName.includes(search) ||
           search.includes(nName) ||
           (nShort.length > 2 && (nShort.includes(search) || search.includes(nShort)));
  });
  
  if (found) return found;

  return {
    id: 'UNK',
    name: teamName || 'TBD',
    shortName: (teamName || 'TBD').substring(0, 3).toUpperCase(),
    logo: 'https://i.ibb.co/7d4R0vZH/obraz-2026-02-04-222253347-removebg-preview-1.png',
    color: '#3b82f6'
  };
}

interface LiveMatchData {
  id: string;
  status: string;
  timer: string;
  period: string;
  date: string;
  homeTeam: {
    score: number;
    name: string;
    shortName: string;
    logo: string;
  };
  awayTeam: {
    score: number;
    name: string;
    shortName: string;
    logo: string;
  };
}

interface ScheduleTableOverlayProps {
  isMinimized?: boolean;
  setIsMinimized?: (value: boolean) => void;
  activeTab?: 'terminarz' | 'tabela' | 'live';
  setActiveTab?: (tab: 'terminarz' | 'tabela' | 'live') => void;
}

export function ScheduleTableOverlay({
  isMinimized: externalIsMinimized,
  setIsMinimized: externalSetIsMinimized,
  activeTab: externalActiveTab,
  setActiveTab: externalSetActiveTab
}: ScheduleTableOverlayProps) {
  const { finishedMatches } = useMatchStats();
  const [internalActiveTab, setInternalActiveTab] = useState<'terminarz' | 'tabela' | 'live'>('terminarz');
  const [internalIsMinimized, setInternalIsMinimized] = useState(false);

  const isMinimized = externalIsMinimized !== undefined ? externalIsMinimized : internalIsMinimized;
  const setIsMinimized = externalSetIsMinimized !== undefined ? externalSetIsMinimized : setInternalIsMinimized;
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  const setActiveTab = externalSetActiveTab !== undefined ? externalSetActiveTab : setInternalActiveTab;
  const [roundIndex, setRoundIndex] = useState(0);
  const [liveMatches, setLiveMatches] = useState<LiveMatchData[]>([]);
  const [loadingLive, setLoadingLive] = useState(false);
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [loadingFixtures, setLoadingFixtures] = useState(false);
  const [currentStandings, setCurrentStandings] = useState<any>(null);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const response = await fetch('https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/api/tournament/1/table.json');
        if (response.ok) {
          const data = await response.json();
          setCurrentStandings(data);
        }
      } catch (err) {
        console.error('Failed to fetch tournament table for overlay:', err);
      }
    };
    fetchStandings();
  }, []);

  const getTeamPosition = (teamName: string) => {
    const search = normalize(teamName);
    if (currentStandings) {
      const groupKeys = Object.keys(currentStandings).filter(key => key.startsWith('grupa'));
      for (const key of groupKeys) {
        const group = currentStandings[key];
        if (Array.isArray(group)) {
          const found = group.find((s: any) => 
            normalize(s.team || s.name || '') === search
          );
          if (found) return found.position;
        }
      }
    }
    return standings.find(s => 
      normalize(s.team?.name) === search ||
      normalize(s.team?.shortName) === search ||
      normalize(s.team?.id) === search
    )?.position || '-';
  };

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
            const matchInSchedule = fixtures.find(m => {
              const ta = normalize(apiMatch.teamA);
              const tb = normalize(apiMatch.teamB);
              const ha = [normalize(m.homeTeam?.name), normalize(m.homeTeam?.shortName), normalize(m.homeTeam?.id)];
              const aa = [normalize(m.awayTeam?.name), normalize(m.awayTeam?.shortName), normalize(m.awayTeam?.id)];
              
              const homeOk = ha.some(h => h && (h === ta || ta.includes(h) || h.includes(ta)));
              const awayOk = aa.some(a => a && (a === tb || tb.includes(a) || a.includes(tb)));
              return homeOk && awayOk;
            });
            
            if (matchInSchedule) {
              liveData.push({
                id: apiMatch.uuid,
                status: apiMatch.status,
                timer: apiMatch.timer || '0:00',
                period: apiMatch.period || 'Pierwsza połowa',
                date: matchInSchedule.date,
                homeTeam: {
                  name: matchInSchedule.homeTeam.name,
                  shortName: matchInSchedule.homeTeam.shortName,
                  logo: matchInSchedule.homeTeam.logo,
                  score: apiMatch.scoreA ?? 0
                },
                awayTeam: {
                  name: matchInSchedule.awayTeam.name,
                  shortName: matchInSchedule.awayTeam.shortName,
                  logo: matchInSchedule.awayTeam.logo,
                  score: apiMatch.scoreB ?? 0
                }
              });
            } else {
              // Fallback for matches not in fixtures
              const homeTeam = getTeamFromName(apiMatch.teamA);
              const awayTeam = getTeamFromName(apiMatch.teamB);

              liveData.push({
                id: apiMatch.uuid,
                status: apiMatch.status,
                timer: apiMatch.timer || '0:00',
                period: apiMatch.period || 'Pierwsza połowa',
                date: new Date().toISOString(),
                homeTeam: {
                  name: homeTeam.name || apiMatch.teamA,
                  shortName: homeTeam.shortName || apiMatch.teamA?.substring(0, 3).toUpperCase() || 'HOM',
                  logo: homeTeam.logo,
                  score: apiMatch.scoreA ?? 0
                },
                awayTeam: {
                  name: awayTeam.name || apiMatch.teamB,
                  shortName: awayTeam.shortName || apiMatch.teamB?.substring(0, 3).toUpperCase() || 'AWA',
                  logo: awayTeam.logo,
                  score: apiMatch.scoreB ?? 0
                }
              });
            }
          }
        }
        
        setLiveMatches(liveData);
      } catch (error) {
        console.error('Błąd pobierania meczów na żywo:', error);
        // Don't clear liveMatches on error to prevent flickering
      } finally {
        setLoadingLive(false);
      }
    };

    fetchLiveMatches();
    const interval = setInterval(fetchLiveMatches, 30000); // Increased from 5s to 30s
    return () => clearInterval(interval);
  }, [fixtures]);

  useEffect(() => {
    const fetchFixtures = async () => {
      setLoadingFixtures(true);
      try {
        console.log('Fetching fixtures from API...');
        const response = await fetch(API_ENDPOINTS.SCHEDULE);
        console.log('Fixtures API response:', response.status, response.statusText);
        if (response.ok) {
          const data = await response.json();
          console.log('Fixtures data:', data);
          const fixturesData = Array.isArray(data) ? data : (data.fixtures || []);
          console.log('Fixtures array length:', fixturesData.length);
          if (Array.isArray(fixturesData) && fixturesData.length > 0) {
            // Get unique dates sorted chronologically
            const uniqueDates = [...new Set(fixturesData.map(f => f.date ? f.date.split(' ')[0] : ''))]
              .filter(d => d !== '')
              .sort((a, b) => {
                const [da, ma, ya] = a.split('.').map(Number);
                const [db, mb, yb] = b.split('.').map(Number);
                return new Date(ya, ma-1, da).getTime() - new Date(yb, mb-1, db).getTime();
              });

            // Map API data to expected format
            const mappedFixtures = fixturesData.map(fixture => {
              const datePart = fixture.date ? fixture.date.split(' ')[0] : '';
              const dateIndex = uniqueDates.indexOf(datePart);
              
              // Every 3 unique dates constitute one round (as per user: "3 dni jedna kolejka")
              // One round = 3 match days
              let calculatedRound = 1;
              if (dateIndex !== -1) {
                calculatedRound = Math.floor(dateIndex / 3) + 1;
              }
              
              return {
                id: fixture.matchUuid || (fixture.id ? fixture.id.toString() : Math.random().toString()),
                round: calculatedRound.toString(),
                date: fixture.date,
                homeTeam: getTeamFromName(fixture.teamA),
                awayTeam: getTeamFromName(fixture.teamB),
                homeScore: fixture.scoreA,
                awayScore: fixture.scoreB,
                stadium: fixture.group || "Stadion",
                category: fixture.stage || "Mecz",
                status: ((fixture.status === 'played' || fixture.status === 'finished' || fixture.isFinished || (fixture.scoreA !== null && fixture.scoreB !== null)) ? 'finished' : 'upcoming') as 'finished' | 'upcoming'
              };
            });
            
            // Sort fixtures by date
            mappedFixtures.sort((a, b) => {
              const dateA = safeParseDate(a.date).getTime();
              const dateB = safeParseDate(b.date).getTime();
              return dateA - dateB;
            });

            console.log('Mapped fixtures:', mappedFixtures.slice(0, 3));
            setFixtures(mappedFixtures);
          } else {
            console.log('No fixtures data or empty array');
            setFixtures([]);
          }
        } else {
          console.error('Failed to fetch fixtures, status:', response.status);
          setFixtures([]);
        }
      } catch (error) {
        console.error('Error fetching fixtures:', error);
        setFixtures([]);
      } finally {
        setLoadingFixtures(false);
      }
    };

    fetchFixtures();
  }, []);

  const allRounds = useMemo(() => fixtures.length > 0 
    ? [...new Set(fixtures.map(m => m.round))].sort((a, b) => {
        const numA = parseInt(a) || 0;
        const numB = parseInt(b) || 0;
        return numA - numB;
      }) 
    : ['1'], [fixtures]);
  
  const currentRound = useMemo(() => allRounds[roundIndex] || '1', [allRounds, roundIndex]);
  const roundMatches = useMemo(() => fixtures.filter(m => m.round === currentRound), [fixtures, currentRound]);

  // Auto-select current round only once on initial load
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  
  useEffect(() => {
    if (fixtures.length > 0 && allRounds.length > 0 && !hasAutoSelected) {
      // Find the first round that has upcoming matches
      const firstUpcomingMatch = fixtures.find(m => m.status === 'upcoming');
      if (firstUpcomingMatch) {
        const upcomingRound = firstUpcomingMatch.round;
        const index = allRounds.indexOf(upcomingRound);
        if (index !== -1) {
          setRoundIndex(index);
        }
      } else {
        // If all are finished, show the last round
        setRoundIndex(allRounds.length - 1);
      }
      setHasAutoSelected(true);
    }
  }, [fixtures, allRounds, hasAutoSelected]);

  const safeParseDate = (dateString: string) => {
    if (!dateString) return new Date();
    
    // If it's already a ISO string or something new Date() likes
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) return date;
    
    // Try parsing DD.MM.YYYY HH:mm or DD.MM.YYYY
    try {
      const parts = dateString.split(/[\s,.:]+/);
      if (parts.length >= 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]);
        const hour = parts[3] ? parseInt(parts[3]) : 0;
        const minute = parts[4] ? parseInt(parts[4]) : 0;
        const d = new Date(year, month, day, hour, minute);
        if (!isNaN(d.getTime())) return d;
      }
    } catch (e) {}
    
    return new Date();
  };

  const formatDate = (dateString: string) => {
    if (dateString && dateString.includes('.') && !dateString.includes('-') && !dateString.includes('T')) {
      return dateString.split(' ')[0];
    }
    const date = safeParseDate(dateString);
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '--:--';
    // If it's in format DD.MM.YYYY HH:mm, just extract HH:mm
    const parts = dateString.split(' ');
    if (parts.length >= 2 && parts[1].includes(':')) {
      return parts[1];
    }
    const date = safeParseDate(dateString);
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
        className="absolute left-[-48px] top-0 w-12 h-12 bg-transparent text-white/60 flex items-center justify-center rounded-l-2xl shadow-2xl hover:bg-white/5 transition-all border-y border-l border-white/10 group"
        title={isMinimized ? "Rozwiń" : "Zminimalizuj"}
        suppressHydrationWarning={true}
      >
        {isMinimized ? (
          <Maximize2 size={20} className="group-hover:scale-110 transition-transform" />
        ) : (
          <Minimize2 size={20} className="group-hover:scale-110 transition-transform" />
        )}
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 rounded-l-2xl transition-opacity" />
      </button>

      {/* Tab headers */}
      <div className="flex gap-1 p-1 bg-black/20 backdrop-blur-md border border-white/10 rounded-t-2xl shadow-2xl relative overflow-hidden">
        {/* Background glow removed */}
        
        <button
          onClick={() => setActiveTab('terminarz')}
          className={`relative flex-1 py-3 text-[10px] font-black tracking-widest text-center transition-all duration-300 rounded-xl z-10 ${
            activeTab === 'terminarz'
              ? 'text-white'
              : 'text-gray-500 hover:text-white hover:bg-white/5'
          }`}
        >
          {activeTab === 'terminarz' && (
            <div className="absolute inset-0 bg-white/10 rounded-xl -z-10 shadow-[0_0_20px_rgba(255,255,255,0.05)]" />
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
            <div className="absolute inset-0 bg-white/10 rounded-xl -z-10 shadow-[0_0_20px_rgba(255,255,255,0.05)]" />
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
            <div className="absolute inset-0 bg-white/10 rounded-xl -z-10 shadow-[0_0_20px_rgba(255,255,255,0.05)]" />
          )}
          <span className="flex items-center justify-center gap-1.5">
            NA ŻYWO
            {liveMatches.length > 0 && (
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
            )}
          </span>
        </button>
      </div>

      {/* Tab content container */}
      <div className="border-x border-b border-white/10 shadow-2xl rounded-b-2xl overflow-hidden bg-black/20 backdrop-blur-md">
        {activeTab === 'live' && (
          <div className="bg-transparent text-white min-h-[200px] max-h-[600px] overflow-y-auto scrollbar-hide">
            <div className="bg-black/40 backdrop-blur-md px-4 py-3 font-black text-[11px] tracking-widest text-center sticky top-0 z-10 border-b border-white/10 flex items-center justify-center gap-3">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              AKTUALNIE NA ŻYWO
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            </div>
          <div className="p-0">
            {loadingLive && liveMatches.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">Ładowanie...</div>
            ) : liveMatches.length > 0 ? (
              <div className="divide-y divide-white/5">
                {liveMatches.map((match) => {
                  const homePos = getTeamPosition(match.homeTeam.name);
                  const awayPos = getTeamPosition(match.awayTeam.name);
                  const homeTeamData = getTeamFromName(match.homeTeam.name);
                  const awayTeamData = getTeamFromName(match.awayTeam.name);
                  
                  return (
                    <Link href={`/mecz/${match.id}`} key={match.id} className="block">
                      <div className="px-4 py-2 bg-black/20 text-white text-[10px] font-semibold flex justify-between items-center border-b border-white/5">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                          LIVE
                        </span>
                        <span className="text-white font-bold opacity-80">{match.timer}</span>
                      </div>
                      <div 
                        className="relative px-4 py-6 hover:bg-white/5 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex flex-col items-center gap-1 flex-1">
                            <div className="relative">
                              <div 
                                className="absolute inset-0 blur-xl opacity-30"
                                style={{ backgroundColor: homeTeamData.color }}
                              />
                              <Image
                                src={homeTeamData.logo}
                                alt={match.homeTeam.shortName}
                                width={36}
                                height={36}
                                className="relative z-10"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://i.ibb.co/7d4R0vZH/obraz-2026-02-04-222253347-removebg-preview-1.png';
                                }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-white uppercase">{match.homeTeam.shortName}</span>
                            <span className="text-xs font-black text-gray-400">#{homePos}</span>
                          </div>
                          
                          <div className="flex flex-col items-center gap-1">
                            <div className="bg-transparent backdrop-blur-sm border border-white/10 px-3 py-2 rounded-lg">
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
                                style={{ backgroundColor: awayTeamData.color }}
                              />
                              <Image
                                src={awayTeamData.logo}
                                alt={match.awayTeam.shortName}
                                width={36}
                                height={36}
                                className="relative z-10"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://i.ibb.co/7d4R0vZH/obraz-2026-02-04-222253347-removebg-preview-1.png';
                                }}
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
        <div className="bg-transparent text-white max-h-[600px] overflow-y-auto scrollbar-hide">
          {/* Round selector */}
          <div className="flex items-center justify-between bg-black/20 backdrop-blur-md px-4 py-4 sticky top-0 z-10 border-b border-white/10">
            <button
              onClick={() => setRoundIndex(Math.max(0, roundIndex - 1))}
              disabled={roundIndex === 0}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white hover:bg-white/10 disabled:opacity-20 transition-all border border-white/10"
            >
              ←
            </button>
            <div className="flex flex-col items-center">
              <span className="font-black text-lg tracking-tighter uppercase">
                {currentRound}. KOLEJKA
              </span>
            </div>
            <button
              onClick={() => setRoundIndex(Math.min(allRounds.length - 1, roundIndex + 1))}
              disabled={roundIndex === allRounds.length - 1}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white hover:bg-white/10 disabled:opacity-20 transition-all border border-white/10"
            >
              →
            </button>
          </div>

          {/* Matches */}
          <div className="divide-y divide-white/5 bg-transparent">
            {roundMatches.map((match, index) => {
              const homePos = getTeamPosition(match.homeTeam?.name || '');
              const awayPos = getTeamPosition(match.awayTeam?.name || '');

              return (
                <Link href={`/mecz/${match.id || index}`} key={match.id || index} className="block group">
                  <div className="px-4 py-2 bg-black/10 text-gray-400 text-[9px] font-black tracking-widest uppercase flex items-center gap-2 border-b border-white/5">
                    <div className="w-1 h-1 bg-white/40 rounded-full" />
                    {match.date ? formatDate(match.date) + ' • ' + formatTime(match.date) : 'Data nieznana'}
                  </div>
                  <div 
                    className="relative px-4 py-6 bg-transparent hover:bg-white/5 transition-all cursor-pointer"
                  >
                    {/* Gradient overlays removed */}
                    
                    <div className="relative z-10 flex items-center justify-between gap-2">
                      {/* Home Team */}
                      <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                        <div className="relative">
                          {/* No background glow */}
                          <Image
                            src={match.homeTeam?.logo || '/default-logo.png'}
                            alt={match.homeTeam?.name || 'Home Team'}
                            width={32}
                            height={32}
                            className="relative z-10 drop-shadow-lg"
                          />
                        </div>
                        <span className="text-[9px] font-black text-white uppercase text-center leading-tight truncate w-full">
                          {match.homeTeam?.shortName || match.homeTeam?.name || 'Home'}
                        </span>
                        <span className="text-[10px] font-black text-gray-500">#{homePos}</span>
                      </div>
                      
                      {/* Time/Score */}
                      <div className="flex flex-col items-center gap-1 px-3">
                        <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                          {finishedMatches[match.id || index] ? (
                            <span className="text-base font-black text-green-400 tracking-tight">
                              {finishedMatches[match.id || index].homeScore}:{finishedMatches[match.id || index].awayScore}
                            </span>
                          ) : (match.status === 'finished') ? (
                            <span className="text-base font-black text-white tracking-tight">
                              {match.homeScore ?? 0}:{match.awayScore ?? 0}
                            </span>
                          ) : (
                            <span className="text-base font-black text-white tracking-tight">{match.date ? formatTime(match.date) : 'TBD'}</span>
                          )}
                        </div>
                        <div className="flex flex-col items-center">
                          {(finishedMatches[match.id || index] || match.status === 'finished') ? (
                            <span className="text-[8px] font-black text-green-400 uppercase">ZAKOŃCZONY</span>
                          ) : (
                            <span className="text-[8px] font-black text-white/40 italic uppercase">{match.stadium ? match.stadium.split(' ')[0] + ' ' + (match.stadium.split(' ')[1] || '') + '...' : 'Stadion'}</span>
                          )}
                          <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-600">
                            <span>#{homePos}</span>
                            <span className="text-white/20">vs</span>
                            <span>#{awayPos}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Away Team */}
                      <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                        <div className="relative">
                          {/* No background glow */}
                          <Image
                            src={match.awayTeam?.logo || '/default-logo.png'}
                            alt={match.awayTeam?.name || 'Away Team'}
                            width={32}
                            height={32}
                            className="relative z-10 drop-shadow-lg"
                          />
                        </div>
                        <span className="text-[9px] font-black text-white uppercase text-center leading-tight truncate w-full">
                          {match.awayTeam?.shortName || match.awayTeam?.name || 'Away'}
                        </span>
                        <span className="text-[10px] font-black text-gray-500">#{awayPos}</span>
                      </div>
                    </div>
                    
                    {/* Category Banner */}
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-white/10 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[7px] font-black text-white/60 tracking-widest uppercase">{match.category || 'Mecz'}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'tabela' && (
        <div className="bg-transparent text-white max-h-[600px] overflow-y-auto scrollbar-hide">
          <LeagueTable isInTab={true} compact={true} />
        </div>
      )}
      </div>
    </div>
  );
}
