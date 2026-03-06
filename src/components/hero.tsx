'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { matches, Match, teams, standings as defaultStandings } from '@/lib/data';
import { ClubLogosBar } from './club-logos-bar';
import { CompactLeagueTable } from './compact-widgets';
import { API_ENDPOINTS } from '@/lib/constants';

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const calculateTimeLeft = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!mounted) return null;

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="bg-transparent backdrop-blur-xl rounded-lg md:rounded-xl border border-white/10 px-2 py-2 md:px-6 md:py-4 min-w-[45px] md:min-w-[90px] shadow-[0_0_30px_rgba(0,204,255,0.1)]">
          <span className="text-xl md:text-5xl font-black text-white tracking-tighter block text-center tabular-nums">
            {String(value).padStart(2, '0')}
          </span>
        </div>
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-b from-[#00ccff]/20 to-transparent rounded-lg md:rounded-xl blur-md -z-10" />
      </div>
      <span className="text-[8px] md:text-xs text-gray-500 font-black mt-1 md:mt-2 uppercase tracking-[0.2em]">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center justify-center gap-1 md:gap-4">
      <TimeBlock value={timeLeft.days} label="Dni" />
      <span className="text-xl md:text-4xl font-black text-white/20 mt-[-15px] md:mt-[-20px]">:</span>
      <TimeBlock value={timeLeft.hours} label="Godz" />
      <span className="text-xl md:text-4xl font-black text-white/20 mt-[-15px] md:mt-[-20px]">:</span>
      <TimeBlock value={timeLeft.minutes} label="Min" />
      <span className="text-xl md:text-4xl font-black text-white/20 mt-[-15px] md:mt-[-20px]">:</span>
      <TimeBlock value={timeLeft.seconds} label="Sek" />
    </div>
  );
}

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
}

const getTeamFromName = (teamName: string) => {
  const foundTeam = teams.find(t => t.name === teamName || t.shortName === teamName);
  
  if (foundTeam) return foundTeam;

  return {
    id: 'UNK',
    name: teamName,
    shortName: teamName.substring(0, 3).toUpperCase(),
    logo: 'https://i.ibb.co/TB027G07/czarnepff-1.png',
    color: '#3b82f6'
  };
};

export function Hero({ 
  setActiveTab, 
  setIsMinimized 
}: { 
  setActiveTab: (tab: 'terminarz' | 'tabela' | 'live') => void;
  setIsMinimized: (value: boolean) => void;
}) {
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [liveMatch, setLiveMatch] = useState<ApiMatch | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch live matches
        const liveResponse = await fetch('/api/matches', { cache: 'no-store' });
        const matchesData = await liveResponse.json();

        const apiMatches = Array.isArray(matchesData) ? matchesData : [];
        const active = apiMatches.find((m: ApiMatch) => m.isActive || m.status === 'active');
        setLiveMatch(active || null);

        // Fetch upcoming fixtures from API
        const fixturesResponse = await fetch(API_ENDPOINTS.SCHEDULE);
        if (fixturesResponse.ok) {
          const fixturesData = await fixturesResponse.json();
          const fixtures = fixturesData.fixtures || [];

          // Map API fixtures to match format
          const mappedFixtures = fixtures
            .map((fixture: any) => {
              const matchDate = new Date(fixture.date).getTime();
              const now = new Date().getTime();
              const isPast = matchDate < now - (2 * 60 * 60 * 1000); // More than 2 hours ago
              
              return {
                id: (fixture.matchUuid || fixture.uuid || fixture.id).toString(),
                round: fixture.round,
                date: fixture.date,
                homeTeam: getTeamFromName(fixture.teamA),
                awayTeam: getTeamFromName(fixture.teamB),
                homeScore: fixture.scoreA,
                awayScore: fixture.scoreB,
                stadium: "Stadion",
                category: "Liga",
                status: (fixture.status === 'finished' || fixture.status === 'FT' || isPast) ? 'finished' as const : 'upcoming' as const
              };
            })
            .filter((m: any) => {
              const matchDate = new Date(m.date);
              const now = new Date();
              // Show matches from the last 24h (likely finished/current) and all future matches
              return matchDate.getTime() > (now.getTime() - 24 * 60 * 60 * 1000);
            })
            .sort((a: any, b: any) => new Date((a as any).date).getTime() - new Date((b as any).date).getTime());

          setUpcomingMatches(mappedFixtures);
        } else {
          // Fallback to static data if API fails
          const now = new Date();
          const filtered = matches
            .filter(m => new Date(m.date).getTime() > (now.getTime() - 24 * 60 * 60 * 1000))
            .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

          setUpcomingMatches(filtered);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Fallback to static data
        const now = new Date();
        const filtered = matches
          .filter(m => new Date(m.date).getTime() > (now.getTime() - 24 * 60 * 60 * 1000))
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setUpcomingMatches(filtered);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="min-h-[600px] md:min-h-[850px] bg-black/20" />;

  const isMatchLive = liveMatch !== null;
  
  if (upcomingMatches.length === 0 && !isMatchLive) {
    return (
      <div className="relative w-full py-16 md:py-24 overflow-hidden min-h-[400px] flex items-center justify-center bg-gradient-to-b from-black to-[#0a1628]">
        <div className="container mx-auto px-4 text-center z-10">
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
            Witamy w <span className="text-[#00ccff]">PFF</span>
          </h1>
          <p className="text-gray-400 text-lg uppercase tracking-widest font-bold">
            Brak zaplanowanych meczów w najbliższym czasie
          </p>
        </div>
        <div className="absolute inset-0 bg-[url('https://i.ibb.co/TB027G07/czarnepff-1.png')] bg-center bg-no-repeat opacity-5 scale-150 pointer-events-none" />
      </div>
    );
  }

  const currentMatch = upcomingMatches[currentIndex];

  const standings = defaultStandings;
  const getTeamPosition = (teamId: string) => {
    return standings.find(s => s.team?.id === teamId)?.position || '-';
  };

  const liveHomeTeam = liveMatch ? getTeamFromName(liveMatch.teamA) : null;
  const liveAwayTeam = liveMatch ? getTeamFromName(liveMatch.teamB) : null;

  const displayData = isMatchLive ? {
    homeTeam: liveHomeTeam || { id: '', name: liveMatch!.teamA, logo: '', color: '#ffffff' },
    awayTeam: liveAwayTeam || { id: '', name: liveMatch!.teamB, logo: '', color: '#ffffff' },
    date: new Date().toISOString(),
    scoreA: liveMatch!.scoreA,
    scoreB: liveMatch!.scoreB,
    timer: liveMatch!.timer,
    period: liveMatch!.period
  } : {
    homeTeam: currentMatch.homeTeam,
    awayTeam: currentMatch.awayTeam,
    date: currentMatch.date,
    scoreA: currentMatch.homeScore ?? null,
    scoreB: currentMatch.awayScore ?? null,
    timer: null,
    period: null
  };

  const homePos = getTeamPosition(displayData.homeTeam.id);
  const awayPos = getTeamPosition(displayData.awayTeam.id);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
    return `${days[date.getDay()]}, ${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`.toUpperCase();
  };

  const nextMatch = () => {
    if (currentIndex < upcomingMatches.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const prevMatch = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  return (
    <div className="relative w-full py-8 md:py-24 overflow-hidden min-h-[600px] md:min-h-[850px] flex items-center justify-center">
      {/* Background decorations removed for transparency */}

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col 2xl:grid 2xl:grid-cols-[300px_1fr_300px] items-center gap-8 2xl:gap-12">
          
          {/* Left Sidebar - Hidden on mobile/tablet */}
          <div className="hidden 2xl:block w-72 space-y-6 animate-in fade-in slide-in-from-left duration-1000">
            <CompactLeagueTable setActiveTab={setActiveTab} setIsMinimized={setIsMinimized} />
            <div className="p-6 rounded-2xl border border-white/10 bg-transparent">
              <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">Social Media</h4>
              <div className="flex items-center gap-6">
                <Link href="https://discord.gg/R7y6ZnczP4" target="_blank" className="text-gray-400 hover:text-[#5865F2] transition-colors">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </Link>
                <Link href="https://www.tiktok.com/@polskafederacjafutbolu_" target="_blank" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 448 512">
                    <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14z"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Center Content */}
          <div className="flex-1 w-full max-w-5xl flex flex-col items-center">
            {/* Logo with broadcast style frame */}
            <div className="mb-8 flex flex-col items-center relative group w-full max-w-[800px]">
              {/* Background Glows removed */}
              
              {/* Main Frame */}
              <div className="bg-transparent px-6 md:px-20 py-6 md:py-10 rounded-3xl md:rounded-[2.5rem] border border-white/10 relative overflow-hidden flex flex-col items-center w-full">
                <div className="absolute inset-0 bg-transparent pointer-events-none" />
                
                {/* 7U7 Side Label (Left) */}
                <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 hidden sm:flex flex-col items-center gap-2">
                  <div className="w-px h-8 md:h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                  <span className="text-sm md:text-xl font-black text-white italic tracking-tighter transition-transform group-hover:scale-110">7U7</span>
                  <div className="w-px h-8 md:h-12 bg-gradient-to-t from-transparent via-white/20 to-transparent" />
                </div>

                {/* Content Container */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative">
                    {/* Inner logo glow removed */}
                    <Image
                      src="https://i.ibb.co/MyfXtGLH/ekstraklasabaner-removebg-preview.png"
                      alt="7U7 Ekstraklasa"
                      width={1000}
                      height={250}
                      className="h-36 md:h-64 w-auto object-contain relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 md:gap-4 mt-2 md:mt-4 w-full px-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <span className="text-[7px] md:text-[9px] font-bold text-gray-500 uppercase tracking-[0.3em] md:tracking-[0.5em] whitespace-nowrap">Seven UltimateSeven • PFF</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </div>
                </div>

                {/* PFF Side Label (Right) */}
                <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 hidden sm:flex flex-col items-center gap-2">
                  <div className="w-px h-8 md:h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                  <span className="text-xs md:text-sm font-black text-white uppercase tracking-widest italic drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">PFF</span>
                  <div className="w-px h-8 md:h-12 bg-gradient-to-t from-transparent via-white/20 to-transparent" />
                </div>

                {/* Glass corner accents removed */}
              </div>
            </div>

            {/* Round Title */}
            <div className="mb-4 md:mb-6 flex flex-col items-center">
              <div className="relative">
                <h3 className="text-xl md:text-5xl font-black text-white uppercase tracking-[0.1em] md:tracking-[0.15em] drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  {isMatchLive ? (liveMatch?.period || 'MECZ TRWA') : `${currentMatch.round}. KOLEJKA`}
                </h3>
                <div className="absolute -bottom-1 md:-bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
            </div>

            <div className="relative w-full">
              {/* Live Status Badge */}
              {isMatchLive && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30">
                  <div className="bg-black/60 backdrop-blur-xl px-4 md:px-8 py-1 md:py-2 rounded-full flex items-center gap-2 border border-white/10 shadow-2xl">
                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                    <span className="text-white text-[10px] md:text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap">
                      NA ŻYWO - {displayData.period} ({displayData.timer})
                    </span>
                  </div>
                </div>
              )}

              {/* Date/Status bar removed */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-30 w-full flex justify-center">
                {!isMatchLive && (
                  <div className="relative group">
                    <div className="relative bg-black/40 backdrop-blur-md text-white px-8 py-2.5 rounded-full shadow-2xl text-xs font-black uppercase tracking-[0.15em] border border-white/20 whitespace-nowrap flex items-center gap-2">
                      <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(displayData.date)}
                    </div>
                  </div>
                )}
              </div>

              {/* Main match card - simplified border */}
              <div className="relative overflow-hidden rounded-[2rem] md:rounded-3xl transition-all duration-500 border border-white/5 bg-black/20 backdrop-blur-xl shadow-2xl">
                <div className="p-4 md:p-12">
                  {/* Team color gradients removed */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />

                  <div className="relative z-10 flex flex-col items-center w-full">
                    <div className="flex items-center justify-between w-full gap-2 md:gap-8 px-2 md:px-4">
                      {/* Home team name */}
                      <h2 className="hidden md:block text-xl lg:text-2xl xl:text-3xl font-black text-white uppercase tracking-tight text-right w-[30%] transition-all italic">
                        {displayData.homeTeam.name}
                      </h2>

                      {/* Home team logo */}
                      <div className="relative group flex-shrink-0 w-20 md:w-32 lg:w-40 flex justify-center">
                        <Image
                          src={displayData.homeTeam.logo || 'https://i.ibb.co/TB027G07/czarnepff-1.png'}
                          alt={displayData.homeTeam.name}
                          width={140}
                          height={140}
                          className="relative z-10 object-contain drop-shadow-2xl h-16 w-16 md:h-28 md:w-28 lg:h-32 lg:w-32 transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>

                      {/* Score/Time display */}
                      <div className="flex flex-col items-center justify-center min-w-[100px] md:min-w-[220px] mx-1 md:mx-2">
                        <div className="relative overflow-hidden rounded-xl md:rounded-2xl border border-white/10 px-4 md:px-12 py-3 md:py-6 flex flex-col items-center justify-center w-full transition-all duration-500 bg-black/10">
                          <span className={`text-2xl md:text-5xl lg:text-6xl font-black tracking-wider relative z-10 whitespace-nowrap text-white`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {isMatchLive ? (
                              `${displayData.scoreA}:${displayData.scoreB}`
                            ) : (currentMatch.status === 'finished' || (currentMatch.homeScore !== undefined && currentMatch.awayScore !== undefined)) ? (
                              `${currentMatch.homeScore ?? 0}:${currentMatch.awayScore ?? 0}`
                            ) : (
                              new Date(displayData.date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
                            )}
                          </span>
                        </div>
                        
                        {!isMatchLive && currentMatch.status !== 'finished' && !(currentMatch.homeScore !== undefined && currentMatch.awayScore !== undefined) && (
                          <div className="mt-4 md:mt-8 scale-90 md:scale-100">
                            <CountdownTimer targetDate={displayData.date} />
                          </div>
                        )}

                        {!isMatchLive && (currentMatch.status === 'finished' || (currentMatch.homeScore !== undefined && currentMatch.awayScore !== undefined)) && (
                          <div className="flex flex-col items-center gap-1 md:gap-2 mt-2 md:mt-4">
                            <div className="bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                              <span className="text-[10px] md:text-xs font-black text-[#00ccff] uppercase tracking-[0.2em]">ZAKOŃCZONY</span>
                            </div>
                          </div>
                        )}
                        
                        {!isMatchLive && currentMatch.status !== 'finished' && !(currentMatch.homeScore !== undefined && currentMatch.awayScore !== undefined) && (
                          <div className="flex flex-col items-center gap-1 md:gap-2 mt-2 md:mt-4">
                            <div className="flex items-center gap-2 md:gap-4 font-black text-xs md:text-lg">
                              <span className="text-white/60 bg-white/5 px-2 md:px-3 py-0.5 md:py-1 rounded-full whitespace-nowrap">#{homePos}</span>
                              <span className="text-gray-600 text-[10px] md:text-base">vs</span>
                              <span className="text-white/60 bg-white/5 px-2 md:px-3 py-0.5 md:py-1 rounded-full whitespace-nowrap">#{awayPos}</span>
                            </div>
                            {currentMatch.stadium && (
                              <div className="flex flex-col items-center gap-0.5 md:gap-1 mt-1 md:mt-2">
                                <span className="text-[8px] md:text-xs font-black text-white/40 uppercase tracking-[0.2em]">{currentMatch.stadium}</span>
                                <span className="text-[7px] md:text-[9px] font-black text-white/60 uppercase tracking-[0.3em]">{currentMatch.category}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Away team logo */}
                      <div className="relative group flex-shrink-0 w-20 md:w-32 lg:w-40 flex justify-center">
                        {/* Team color glow removed */}
                        <Image
                          src={displayData.awayTeam.logo || 'https://i.ibb.co/TB027G07/czarnepff-1.png'}
                          alt={displayData.awayTeam.name}
                          width={140}
                          height={140}
                          className="relative z-10 object-contain drop-shadow-2xl h-16 w-16 md:h-28 md:w-28 lg:h-32 lg:w-32 transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>

                      {/* Away team name */}
                      <h2 className="hidden md:block text-xl lg:text-2xl xl:text-3xl font-black text-white uppercase tracking-tight text-left w-[30%] transition-all italic">
                        {displayData.awayTeam.name}
                      </h2>
                    </div>

                    {/* Mobile team names */}
                    <div className="flex md:hidden justify-between w-full px-2 mt-3 gap-2">
                      <span className="text-[10px] font-black text-white uppercase tracking-tight text-center flex-1 truncate">{displayData.homeTeam.name}</span>
                      <div className="w-8" />
                      <span className="text-[10px] font-black text-white uppercase tracking-tight text-center flex-1 truncate">{displayData.awayTeam.name}</span>
                    </div>

                    {/* Match navigation - arrows on sides */}
                    {!isMatchLive && (
                      <div className="flex flex-col items-center gap-6 w-full mt-4 md:mt-8">
                        {(currentMatch.status === 'finished' || (currentMatch.homeScore !== undefined && currentMatch.awayScore !== undefined)) && (
                          <Link
                            href={`/mecz/${currentMatch?.id}`}
                            className="group relative px-6 md:px-10 py-3 md:py-4 rounded-lg md:rounded-xl font-black uppercase tracking-wider transition-all border border-white/20 hover:border-white/40 hover:bg-white/5"
                          >
                            <span className="relative z-10 text-white flex items-center gap-2 md:gap-3 text-xs md:text-base">
                              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Centrum Meczowe
                            </span>
                          </Link>
                        )}

                        {upcomingMatches.length > 1 && (
                          <div className="flex items-center justify-center gap-3 md:gap-6">
                            <button
                              onClick={prevMatch}
                              disabled={currentIndex === 0}
                              className="group px-3 md:px-5 py-2 md:py-3 rounded-lg md:rounded-xl font-black bg-white/5 text-gray-400 hover:bg-[#00ccff]/10 hover:text-[#00ccff] disabled:opacity-20 disabled:hover:bg-white/5 disabled:hover:text-gray-400 border border-white/10 hover:border-[#00ccff]/30 transition-all flex items-center gap-2"
                            >
                              <svg className="w-4 h-4 md:w-5 md:h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                              <span className="hidden md:inline text-sm uppercase tracking-wider">Poprzedni</span>
                            </button>
                            
                            <div className="px-3 md:px-6 py-2 md:py-3 bg-white/5 backdrop-blur-md rounded-lg md:rounded-xl border border-white/10">
                              <span className="text-[10px] md:text-sm text-gray-400 font-black uppercase tracking-wider">
                                {currentIndex + 1} / {upcomingMatches.length}
                              </span>
                            </div>

                            <button
                              onClick={nextMatch}
                              disabled={currentIndex === upcomingMatches.length - 1}
                              className="group px-3 md:px-5 py-2 md:py-3 rounded-lg md:rounded-xl font-black bg-white/5 text-gray-400 hover:bg-[#00ccff]/10 hover:text-[#00ccff] disabled:opacity-20 disabled:hover:bg-white/5 disabled:hover:text-gray-400 border border-white/10 hover:border-[#00ccff]/30 transition-all flex items-center gap-2"
                            >
                              <span className="hidden md:inline text-sm uppercase tracking-wider">Następny</span>
                              <svg className="w-4 h-4 md:w-5 md:h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Live match CTA */}
                    {isMatchLive && (
                      <Link
                        href={`/mecz/${liveMatch?.uuid}`}
                        className="group mt-4 md:mt-8 relative px-6 md:px-10 py-3 md:py-4 rounded-lg md:rounded-xl font-black uppercase tracking-wider transition-all border border-white/20 hover:border-white/40 hover:bg-white/5"
                      >
                        <span className="relative z-10 text-white flex items-center gap-2 md:gap-3 text-xs md:text-base">
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Centrum Meczowe
                        </span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>


        </div>

        {/* Club logos bar */}
        <div className="mt-16 w-full">
          <ClubLogosBar />
        </div>
      </div>
    </div>
  );
}
