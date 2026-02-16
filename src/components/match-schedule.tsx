'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { matches, Match, standings, teams, extraTeams } from '@/lib/data';
import { API_ENDPOINTS } from '@/lib/constants';

// Helper function to get team object from name
function getTeamFromName(teamName: string) {
  const allTeams = [...teams, ...extraTeams];
  const normalizedSearch = (teamName || '').toLowerCase().trim();
  
  const found = allTeams.find(t => 
    t.name.toLowerCase() === normalizedSearch || 
    t.shortName.toLowerCase() === normalizedSearch ||
    t.id.toLowerCase() === normalizedSearch
  );
  
  if (found) return found;

  return {
    id: 'UNK',
    name: teamName || 'TBD',
    shortName: (teamName || 'TBD').substring(0, 3).toUpperCase(),
    logo: 'https://i.ibb.co/7d4R0vZH/obraz-2026-02-04-222253347-removebg-preview-1.png',
    color: '#3b82f6'
  };
}

interface ApiMatch {
  status: string;
  isActive: boolean;
  uuid: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  timer: string;
  period: string;
}

interface LiveMatch {
  id: string;
  homeTeam: { name: string; shortName: string; logo: string; id: string };
  awayTeam: { name: string; shortName: string; logo: string; id: string };
  homeScore: number;
  awayScore: number;
  time: string;
  period: string;
  status: string;
  isLive: boolean;
  date: string;
  round: number;
}

interface MatchCardProps {
  match: Match | any;
  isLive?: boolean;
  isFinished?: boolean;
  liveData?: {
    scoreA: number;
    scoreB: number;
    timer: string;
    period: string;
  };
  finishedData?: {
    homeScore: number;
    awayScore: number;
    scorers: Array<{
      playerName: string;
      playerId: number;
      teamId: string;
      goals: number;
    }>;
  };
}

function parseMatchDate(d: any) {
  if (!d) return new Date();
  if (d instanceof Date) return d;
  if (typeof d === 'string' && d.includes('.')) {
    const parts = d.split(' ');
    const datePart = parts[0];
    const timePart = parts[1] || '00:00';
    const [day, month, year] = datePart.split('.').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  }
  return new Date(d);
}

function MatchCard({ match, isLive = false, isFinished = false, liveData, finishedData }: MatchCardProps) {
  const formatTime = (dateString: string) => {
    if (!dateString) return '--:--';
    const date = parseMatchDate(dateString);
    if (isNaN(date.getTime())) return '--:--';
    return date.toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get real table positions
  const homePos = standings.find(s => s.team?.id === match.homeTeam.id)?.position || '-';
  const awayPos = standings.find(s => s.team?.id === match.awayTeam.id)?.position || '-';

  return (
    <div className="mb-6 relative group max-w-5xl mx-auto">
      <Link href={`/mecz/${match.id || match.uuid}`}>
        <div className="relative overflow-hidden bg-black/40 backdrop-blur-xl rounded-[2rem] border border-white/5 transition-all duration-500 hover:border-white/10 hover:shadow-[0_0_50px_rgba(0,0,0,0.2)]">
          {/* Dynamic Background Gradients */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none transition-opacity duration-500 group-hover:opacity-20"
            style={{
              background: `
                radial-gradient(circle at 20% 50%, ${match.homeTeam.color || '#ffffff'}33 0%, transparent 60%),
                radial-gradient(circle at 80% 50%, ${match.awayTeam.color || '#ffffff'}33 0%, transparent 60%)
              `
            }}
          />
          
          <div className="relative z-10 p-6 md:p-10 flex items-center justify-between gap-4">
            {/* Home Team */}
            <div className="flex items-center gap-4 md:gap-8 flex-1 justify-end group/team">
              <div className="flex flex-col items-end">
                <span className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter text-right group-hover/team:text-white transition-colors leading-none italic">
                  {match.homeTeam.name}
                </span>
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-2">Gospodarz</span>
              </div>
              <div className="relative shrink-0">
                <div 
                  className="absolute inset-0 blur-[30px] opacity-10 rounded-full transition-all duration-500 group-hover:opacity-30"
                  style={{ backgroundColor: match.homeTeam.color }}
                />
                <Image 
                  src={match.homeTeam.logo} 
                  alt={match.homeTeam.name} 
                  width={80} 
                  height={80} 
                  className="relative z-10 transition-transform duration-500 group-hover:scale-110 w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Score/Time Box */}
            <div className="flex flex-col items-center gap-3 min-w-[120px] md:min-w-[160px] z-20">
              <div className="relative">
                <div className="bg-black/20 backdrop-blur-md border border-white/10 px-8 py-4 md:px-10 md:py-5 rounded-[1.5rem] shadow-xl transition-all duration-500 group-hover:border-white/20 relative">
                  {isFinished ? (
                    <div className="flex flex-col items-center">
                      <span className="text-3xl md:text-4xl font-black text-white tracking-tighter tabular-nums">
                        {finishedData ? `${finishedData.homeScore} : ${finishedData.awayScore}` : `${match.homeScore || 0} : ${match.awayScore || 0}`}
                      </span>
                      <span className="text-[8px] font-black text-green-400 uppercase tracking-widest mt-1">ZAKOŃCZONY</span>
                    </div>
                  ) : isLive ? (
                    <div className="flex flex-col items-center">
                      <span className="text-3xl md:text-4xl font-black text-white tracking-tighter tabular-nums">
                        {liveData ? `${liveData.scoreA} : ${liveData.scoreB}` : `${match.homeScore} : ${match.awayScore}`}
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl md:text-3xl font-black text-white tracking-tighter">
                      {formatTime(match.date)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center">
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Poz.</span>
                  <span className="text-base md:text-lg font-black text-white tracking-tighter">#{homePos}</span>
                </div>
                <div className="w-px h-6 bg-white/10"></div>
                <div className="flex flex-col items-center">
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Poz.</span>
                  <span className="text-base md:text-lg font-black text-white tracking-tighter">#{awayPos}</span>
                </div>
              </div>
              
              {isLive && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">{liveData?.period || match.period}</span>
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="flex items-center gap-4 md:gap-8 flex-1 justify-start group/team">
              <div className="relative shrink-0">
                <div 
                  className="absolute inset-0 blur-[30px] opacity-10 rounded-full transition-all duration-500 group-hover:opacity-30"
                  style={{ backgroundColor: match.awayTeam.color }}
                />
                <Image 
                  src={match.awayTeam.logo} 
                  alt={match.awayTeam.name} 
                  width={80} 
                  height={80} 
                  className="relative z-10 transition-transform duration-500 group-hover:scale-110 w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-2xl"
                />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter group-hover/team:text-white transition-colors leading-none italic">
                  {match.awayTeam.name}
                </span>
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-2">Gość</span>
              </div>
            </div>
          </div>
          
          {/* Bottom Nav Bar */}
          <div className="h-12 bg-black/20 border-t border-white/5 flex items-center justify-center relative group-hover:bg-white/[0.05] transition-colors">
            <div className="flex items-center gap-4 md:gap-8">
              <span className="text-[9px] font-black text-white/40 tracking-[0.2em] uppercase hover:text-white transition-colors cursor-pointer">Centrum Meczowe</span>
              <span className="w-1 h-1 bg-white/10 rounded-full" />
              <span className="text-[9px] font-black text-white/40 tracking-[0.2em] uppercase hover:text-white transition-colors cursor-pointer">Statystyki</span>
              <span className="w-1 h-1 bg-white/10 rounded-full" />
              <span className="text-[9px] font-black text-white/40 tracking-[0.2em] uppercase hover:text-white transition-colors cursor-pointer">Składy</span>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] bg-white/20 transition-all duration-700 w-0 group-hover:w-1/2 blur-sm" />
          </div>
        </div>
      </Link>
    </div>
  );
}

export function MatchSchedule({ isInTab = false, initialTab = 'terminarz' }: { isInTab?: boolean; initialTab?: 'terminarz' | 'live' } = {}) {
  const [activeMainTab, setActiveMainTab] = useState<'terminarz' | 'live'>(initialTab);
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [loadingLive, setLoadingLive] = useState(false);
  const [finishedMatches, setFinishedMatches] = useState<Record<string, boolean>>({});
  const [fixtures, setFixtures] = useState<Match[]>([]);
  const [loadingFixtures, setLoadingFixtures] = useState(true);

  useEffect(() => {
    const loadFinished = () => {
      const stored = localStorage.getItem('finishedMatches');
      if (stored) {
        setFinishedMatches(JSON.parse(stored));
      }
    };
    loadFinished();
    window.addEventListener('storage', loadFinished);
    return () => window.removeEventListener('storage', loadFinished);
  }, []);

  useEffect(() => {
    const fetchLive = async () => {
      setLoadingLive(true);
      try {
        const response = await fetch('/api/matches');
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data: ApiMatch[] = await response.json();
        
        // Bardziej elastyczne sprawdzanie aktywnych meczów
        const activeMatches = data.filter((m: ApiMatch) => 
          m.isActive === true || 
          m.status === 'active' || 
          m.status === 'live' || 
          m.status === 'playing' ||
          (m.timer && m.timer !== '0:00' && m.timer !== '00:00' && m.status !== 'finished' && m.status !== 'scheduled')
        );

        if (activeMatches.length > 0) {
          const mappedMatches = activeMatches.map((apiMatch: ApiMatch) => {
            const homeTeam = fixtures.find(m => m.homeTeam.name === apiMatch.teamA || m.homeTeam.shortName === apiMatch.teamA)?.homeTeam || getTeamFromName(apiMatch.teamA);
            const awayTeam = fixtures.find(m => m.awayTeam.name === apiMatch.teamB || m.awayTeam.shortName === apiMatch.teamB)?.awayTeam || getTeamFromName(apiMatch.teamB);
            
            return {
              id: apiMatch.uuid,
              homeTeam,
              awayTeam,
              homeScore: apiMatch.scoreA,
              awayScore: apiMatch.scoreB,
              time: apiMatch.timer,
              period: apiMatch.period,
              status: 'live',
              isLive: true,
              date: new Date().toISOString(),
              round: 1
            };
          });
          setLiveMatches(mappedMatches);
        } else {
          setLiveMatches([]);
        }
      } catch (error) {
        console.error('Error fetching live matches:', error);
        setLiveMatches([]);
      } finally {
        setLoadingLive(false);
      }
    };

    fetchLive();
    const interval = setInterval(fetchLive, 10000);
    return () => clearInterval(interval);
  }, [fixtures]);

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.SCHEDULE);
        if (response.ok) {
          const data = await response.json();
          console.log('Fixtures data:', data);
          const fixturesData = Array.isArray(data) ? data : data.fixtures || [];
          if (Array.isArray(fixturesData) && fixturesData.length > 0) {
            // Map API data to expected format
            const mappedFixtures = fixturesData.map((fixture: any) => ({
              id: (fixture.matchUuid || fixture.uuid || fixture.id).toString(),
              round: fixture.round,
              date: fixture.date,
              homeTeam: getTeamFromName(fixture.homeTeam || fixture.teamA),
              awayTeam: getTeamFromName(fixture.awayTeam || fixture.teamB),
              homeScore: fixture.homeScore || fixture.scoreA || 0,
              awayScore: fixture.awayScore || fixture.scoreB || 0,
              stadium: "Stadion",
              category: "Liga",
              status: ((fixture.status === 'played' || fixture.status === 'finished' || fixture.isFinished || (fixture.homeScore > 0 || fixture.scoreA > 0 || fixture.awayScore > 0 || fixture.scoreB > 0)) ? 'finished' : 'upcoming') as 'finished' | 'upcoming'
            }));
            console.log('Mapped fixtures:', mappedFixtures.slice(0, 3));
            setFixtures(mappedFixtures);
          } else {
            console.log('No fixtures data or empty array');
            setFixtures([]);
          }
        } else {
          console.error('Failed to fetch fixtures, status:', response.status);
          // Fallback to local data
          setFixtures([]);
        }
      } catch (error) {
        console.error('Error fetching fixtures:', error);
        // Fallback to local data
        setFixtures([]);
      } finally {
        setLoadingFixtures(false);
      }
    };

    fetchFixtures();
  }, []);

  const allRounds = [...new Set(fixtures.filter(m => !finishedMatches[m.id]).map(m => m.round))].sort((a, b) => Number(a) - Number(b));
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  // Set initial selectedRound when fixtures load
  useEffect(() => {
    if (fixtures.length > 0 && selectedRound === null) {
      setSelectedRound(Number(allRounds[0]) || 1);
    }
  }, [fixtures, selectedRound, allRounds]);

  const roundsPerPage = 3;
  const totalPages = Math.ceil(allRounds.length / roundsPerPage);
  const visibleRounds = allRounds.slice(currentPage * roundsPerPage, (currentPage + 1) * roundsPerPage);
  
  const roundMatches = selectedRound ? fixtures.filter(m => m.round === selectedRound) : [];
  const upcomingMatches = roundMatches.filter(m => !finishedMatches[m.id] && m.status !== 'finished');
  const finishedRoundMatches = roundMatches.filter(m => finishedMatches[m.id] || m.status === 'finished');

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loadingFixtures) {
    return (
      <section id="terminarz" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center py-20 bg-gray-900 rounded-lg">
            <p className="text-gray-400">Ładowanie terminarza...</p>
          </div>
        </div>
      </section>
    );
  }

  if (fixtures.length === 0) {
    return (
      <section id="terminarz" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center py-20 bg-gray-900 rounded-lg">
            <p className="text-gray-400">Brak danych o meczach</p>
          </div>
        </div>
      </section>
    );
  }

  const content = (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 relative">
        <div className="absolute inset-0 bg-blue-500/5 blur-3xl -z-10 rounded-full" />
        <div className="flex items-center gap-1 bg-[#111111]/80 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-2xl">
          <button 
            onClick={() => setActiveMainTab('terminarz')}
            className={`px-8 py-3 rounded-xl text-xs font-black transition-all tracking-[0.2em] relative overflow-hidden group ${activeMainTab === 'terminarz' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {activeMainTab === 'terminarz' && <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 -z-10 animate-gradient" />}
            TERMINARZ
          </button>
          <button 
            onClick={() => setActiveMainTab('live')}
            className={`px-8 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-3 tracking-[0.2em] relative overflow-hidden group ${activeMainTab === 'live' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {activeMainTab === 'live' && <div className="absolute inset-0 bg-red-600 -z-10" />}
            NA ŻYWO
            {liveMatches.length > 0 && <span className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]"></span>}
          </button>
        </div>
        
        {activeMainTab === 'terminarz' && (
          <div className="flex gap-3 items-center bg-[#111111]/80 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-2xl">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="w-10 h-10 flex items-center justify-center rounded-xl font-black bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-20 transition-all border border-white/5"
            >
              ←
            </button>
            
            <div className="flex gap-2">
              {visibleRounds.map((round, idx) => (
                <button
                  key={round}
                  onClick={() => setSelectedRound(Number(round))}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl font-black transition-all relative group ${
                    selectedRound === round
                      ? 'text-white'
                      : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white border border-white/5'
                  }`}
                >
                  {selectedRound === round && <div className="absolute inset-0 bg-[#00ccff] rounded-xl -z-10 shadow-[0_0_20px_rgba(0,204,255,0.4)]" />}
                  {idx + 1 + currentPage * roundsPerPage}
                </button>
              ))}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
              className="w-10 h-10 flex items-center justify-center rounded-xl font-black bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-20 transition-all border border-white/5"
            >
              →
            </button>
          </div>
        )}
      </div>

      {activeMainTab === 'terminarz' && liveMatches.length > 0 && (
        <div className="mb-12">
          {liveMatches.map(match => (
            <MatchCard 
              key={match.id} 
              match={match} 
              isLive={true} 
              liveData={{
                scoreA: match.homeScore,
                scoreB: match.awayScore,
                timer: match.time,
                period: match.period
              }} 
            />
          ))}
        </div>
      )}

      {activeMainTab === 'live' ? (
        <div className="mb-12">
          {loadingLive && liveMatches.length === 0 ? (
            <div className="text-center py-20 bg-gray-900 rounded-lg">
              <p className="text-gray-400">Sprawdzanie meczów na żywo...</p>
            </div>
          ) : liveMatches.length > 0 ? (
            <div className="space-y-4">
              {liveMatches.map(match => (
                <MatchCard 
                  key={match.id} 
                  match={match} 
                  isLive={true} 
                  liveData={{
                    scoreA: match.homeScore,
                    scoreB: match.awayScore,
                    timer: match.time,
                    period: match.period
                  }} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-white/40 text-xl font-medium tracking-tight mb-8">Aktualnie nie odbywają się żadne mecze</p>
                <button 
                  onClick={() => setActiveMainTab('terminarz')}
                  className="px-8 py-3 bg-white text-black font-black rounded-xl hover:bg-[#00ccff] hover:text-white transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl"
                >
                  ZOBACZ TERMINARZ
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="mb-20 relative pt-10 pb-6">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[140px] -z-10 rounded-full" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            
            <div className="flex flex-col items-center justify-center gap-6 relative z-10">
              <div className="relative group">
                <div className="absolute -inset-8 bg-blue-500/10 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                <Image
                  src="https://i.ibb.co/7d4R0vZH/obraz-2026-02-04-222253347-removebg-preview-1.png"
                  alt="PFF"
                  width={200}
                  height={100}
                  className="brightness-0 invert opacity-40 h-24 md:h-28 w-auto relative z-10 grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>

              <div className="flex flex-col items-center relative">
                {/* Decorative Line with Glow */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-[2px] w-8 bg-gradient-to-r from-transparent to-[#00ccff]" />
                  <div className="w-1.5 h-1.5 bg-[#00ccff] rounded-full shadow-[0_0_10px_#00ccff]" />
                  <div className="h-[2px] w-8 bg-gradient-to-l from-transparent to-[#00ccff]" />
                </div>

                <div className="relative px-12 py-4 bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl">
                  <h3 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase flex items-baseline gap-4">
                    <span className="text-[#00ccff] drop-shadow-[0_0_25px_rgba(0,204,255,0.4)]">{selectedRound}</span>
                    <span className="text-3xl md:text-4xl opacity-90 tracking-widest font-black italic">KOLEJKA</span>
                  </h3>
                  
                  {/* Glass corner accents */}
                  <div className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 border-[#00ccff]/30 rounded-tl-lg" />
                  <div className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 border-[#00ccff]/30 rounded-br-lg" />
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">Sezon 2025/26</span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          </div>
          
          <div className="space-y-4">
            {/* Finished Matches */}
            {finishedRoundMatches.length > 0 && (
              <div className="mb-20 relative">
                <div className="flex items-center gap-6 mb-12">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-green/20 to-green/30" />
                  <div className="bg-[#111111]/80 backdrop-blur-xl px-10 py-3 rounded-full border border-green/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    <span className="text-sm font-black text-green-400 uppercase tracking-[0.2em] whitespace-nowrap">
                      ZAKOŃCZONE MECZE
                    </span>
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-green/20 to-green/30" />
                </div>

                <div className="space-y-4">
                  {finishedRoundMatches.map(match => {
                    // Get match result from localStorage or use default
                    const matchResults = JSON.parse(localStorage.getItem('matchStats') || '{}');
                    const result = matchResults[match.id];

                    return (
                      <MatchCard
                        key={match.id}
                        match={match}
                        isFinished={true}
                        finishedData={result ? {
                          homeScore: result.homeScore,
                          awayScore: result.awayScore,
                          scorers: result.scorers || []
                        } : undefined}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upcoming Matches */}
            {Object.entries(
              upcomingMatches.reduce((acc, match) => {
                const date = new Date(match.date);
                const days = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
                const dateLabel = `${days[date.getDay()]}, ${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
                if (!acc[dateLabel]) acc[dateLabel] = [];
                acc[dateLabel].push(match);
                return acc;
              }, {} as Record<string, Match[]>)
            ).map(([dateLabel, matches]) => (
              <div key={dateLabel} className="mb-20 relative">
                {/* Group Date Header - Refined Glass Style */}
                <div className="flex items-center gap-6 mb-12">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-white/20" />
                  <div className="bg-[#111111]/80 backdrop-blur-xl px-10 py-3 rounded-full border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#00ccff] rounded-full shadow-[0_0_10px_rgba(0,204,255,0.5)]" />
                    <span className="text-sm font-black text-white uppercase tracking-[0.2em] whitespace-nowrap">
                      {dateLabel}
                    </span>
                    <div className="w-2 h-2 bg-[#00ccff] rounded-full shadow-[0_0_10px_rgba(0,204,255,0.5)]" />
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/10 to-white/20" />
                </div>

                <div className="space-y-4">
                  {matches.map(match => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {roundMatches.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Brak meczów dla wybranej kolejki</p>
            </div>
          )}
        </>
      )}
    </>
  );

  if (isInTab) {
    return <div className="container mx-auto px-4">{content}</div>;
  }

  return (
    <section id="terminarz" className="py-16">
      <div className="container mx-auto px-4">
        {content}
      </div>
    </section>
  );
}
