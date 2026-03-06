'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { matches, Match, standings as defaultStandings } from '@/lib/data';
import { ClubLogosBar } from './club-logos-bar';
import { CompactLeagueTable, CompactTopScorers } from './compact-widgets';

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
        <div className="bg-[#0a0a0a]/80 backdrop-blur-md rounded-xl border border-white/10 px-4 py-3 md:px-6 md:py-4 min-w-[60px] md:min-w-[90px] shadow-[0_0_30px_rgba(0,204,255,0.1)]">
          <span className="text-3xl md:text-5xl font-black text-white tracking-tighter block text-center tabular-nums">
            {String(value).padStart(2, '0')}
          </span>
        </div>
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-b from-[#00ccff]/20 to-transparent rounded-xl blur-md -z-10" />
      </div>
      <span className="text-[10px] md:text-xs text-gray-500 font-black mt-2 uppercase tracking-[0.2em]">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4">
      <TimeBlock value={timeLeft.days} label="Dni" />
      <span className="text-2xl md:text-4xl font-black text-[#00ccff]/50 mt-[-20px]">:</span>
      <TimeBlock value={timeLeft.hours} label="Godz" />
      <span className="text-2xl md:text-4xl font-black text-[#00ccff]/50 mt-[-20px]">:</span>
      <TimeBlock value={timeLeft.minutes} label="Min" />
      <span className="text-2xl md:text-4xl font-black text-[#00ccff]/50 mt-[-20px]">:</span>
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

export function Hero({ 
  setActiveTab, 
  setIsMinimized 
}: { 
  setActiveTab: (tab: 'terminarz' | 'tabela' | 'live' | 'statystyki') => void;
  setIsMinimized: (value: boolean) => void;
}) {
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [liveMatch, setLiveMatch] = useState<ApiMatch | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveMatches = async () => {
      try {
        const response = await fetch('/api/matches', { cache: 'no-store' });
        const matchesData = await response.json();
        
        const apiMatches = Array.isArray(matchesData) ? matchesData : [];
        const active = apiMatches.find((m: ApiMatch) => m.isActive || m.status === 'active');
        setLiveMatch(active || null);
      } catch (error) {
        console.error('Failed to fetch live matches:', error);
      }
    };

    fetchLiveMatches();
    const interval = setInterval(fetchLiveMatches, 5000);
    
    const now = new Date();
    const filtered = matches
      .filter(m => new Date(m.date).getTime() > now.getTime())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    setUpcomingMatches(filtered);
    setLoading(false);

    return () => clearInterval(interval);
  }, []);

  if (loading || (upcomingMatches.length === 0 && !liveMatch)) return null;

  const isMatchLive = liveMatch !== null;
  const currentMatch = upcomingMatches[currentIndex];

  const getTeamData = (teamName: string) => {
    return matches.find(m => 
      m.homeTeam.name === teamName || m.homeTeam.shortName === teamName ||
      m.awayTeam.name === teamName || m.awayTeam.shortName === teamName
    );
  };

  const standings = defaultStandings;
  const getTeamPosition = (teamId: string) => {
    return standings.find(s => s.team?.id === teamId)?.position || '-';
  };

  const liveHomeTeam = liveMatch ? (getTeamData(liveMatch.teamA)?.homeTeam.name === liveMatch.teamA ? getTeamData(liveMatch.teamA)?.homeTeam : getTeamData(liveMatch.teamA)?.awayTeam) : null;
  const liveAwayTeam = liveMatch ? (getTeamData(liveMatch.teamB)?.homeTeam.name === liveMatch.teamB ? getTeamData(liveMatch.teamB)?.homeTeam : getTeamData(liveMatch.teamB)?.awayTeam) : null;

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
    scoreA: null,
    scoreB: null,
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
    <div className="relative w-full py-16 md:py-24 overflow-hidden min-h-[850px] flex items-center justify-center">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-[#00ccff]/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-[#0066ff]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Additional decorative elements to fill space */}
        <div className="absolute top-10 right-[10%] w-px h-64 bg-gradient-to-b from-transparent via-[#00ccff]/20 to-transparent hidden 2xl:block" />
        <div className="absolute bottom-10 left-[10%] w-px h-64 bg-gradient-to-b from-transparent via-[#00ccff]/20 to-transparent hidden 2xl:block" />
        
        {/* Floating particles */}
        <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-[#00ccff]/30 rounded-full blur-sm animate-bounce" style={{ animationDuration: '3s' }} />
        <div className="absolute top-2/3 right-1/4 w-3 h-3 bg-[#0066ff]/20 rounded-full blur-sm animate-bounce" style={{ animationDuration: '5s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col 2xl:flex-row items-center 2xl:items-center justify-center gap-8 2xl:gap-12">
          
          {/* Left Sidebar - Hidden on mobile/tablet */}
          <div className="hidden 2xl:block w-72 shrink-0 space-y-6 animate-in fade-in slide-in-from-left duration-1000">
            <CompactLeagueTable setActiveTab={setActiveTab} setIsMinimized={setIsMinimized} />
            <div className="p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm">
              <h4 className="text-[10px] font-black text-[#00ccff] uppercase tracking-[0.3em] mb-4">Social Media</h4>
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
              {/* Background Glows */}
              <div className="absolute -inset-10 bg-blue-600/5 blur-[100px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              {/* Main Frame */}
              <div className="bg-[#0a0a0a]/80 backdrop-blur-2xl px-12 md:px-20 py-10 rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col items-center w-full">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                
                {/* 7U7 Side Label (Left) */}
                <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-2">
                  <div className="w-px h-12 bg-gradient-to-b from-transparent via-[#00ccff]/40 to-transparent" />
                  <span className="text-xl font-black text-white italic tracking-tighter transition-transform group-hover:scale-110">7U7</span>
                  <div className="w-px h-12 bg-gradient-to-t from-transparent via-[#00ccff]/40 to-transparent" />
                </div>

                {/* Content Container */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#00ccff]/10 blur-2xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Image
                      src="https://i.ibb.co/MyfXtGLH/ekstraklasabaner-removebg-preview.png"
                      alt="7U7 Ekstraklasa"
                      width={600}
                      height={150}
                      className="h-28 md:h-36 w-auto object-contain relative z-10 drop-shadow-[0_0_30px_rgba(0,204,255,0.3)] group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4 w-full px-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.5em] whitespace-nowrap">Seven UltimateSeven • PFF</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </div>
                </div>

                {/* PFF Side Label (Right) */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-2">
                  <div className="w-px h-12 bg-gradient-to-b from-transparent via-[#00ccff]/40 to-transparent" />
                  <span className="text-sm font-black text-[#00ccff] uppercase tracking-widest italic drop-shadow-[0_0_10px_rgba(0,204,255,0.4)]">PFF</span>
                  <div className="w-px h-12 bg-gradient-to-t from-transparent via-[#00ccff]/40 to-transparent" />
                </div>

                {/* Glass corner accents */}
                <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-[#00ccff]/30 rounded-tl-[2.5rem]" />
                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-[#00ccff]/30 rounded-br-[2.5rem]" />
              </div>
            </div>

            {/* Round Title */}
            <div className="mb-6 flex flex-col items-center">
              <div className="relative">
                <h3 className="text-3xl md:text-5xl font-black text-[#00ccff] uppercase tracking-[0.15em] drop-shadow-[0_0_20px_rgba(0,204,255,0.4)]">
                  {isMatchLive ? (liveMatch?.period || 'MECZ TRWA') : `${currentMatch.round}. KOLEJKA`}
                </h3>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[#00ccff] to-transparent" />
              </div>
            </div>

            <div className="relative w-full">
              {/* Date/Live badge */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-30 w-full flex justify-center">
                {isMatchLive ? (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-red-600/50 blur-xl rounded-full animate-pulse" />
                    <div className="relative bg-gradient-to-r from-[#dc2626] to-[#b91c1c] text-white px-10 py-2.5 rounded-full shadow-2xl text-xs font-black uppercase tracking-[0.2em] border border-red-400/30 whitespace-nowrap flex items-center gap-3">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                      </span>
                      NA ŻYWO - {displayData.period} ({displayData.timer})
                    </div>
                  </div>
                ) : (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-[#00ccff]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative bg-gradient-to-r from-[#003087] to-[#001a4d] text-white px-8 py-2.5 rounded-full shadow-2xl text-xs font-black uppercase tracking-[0.15em] border border-[#00ccff]/20 whitespace-nowrap flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#00ccff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(displayData.date)}
                    </div>
                  </div>
                )}
              </div>

              {/* Main match card */}
              <div className={`relative overflow-hidden rounded-3xl transition-all duration-500 ${
                isMatchLive
                  ? 'gradient-border-animated shadow-[0_0_60px_rgba(220,38,38,0.3)]'
                  : 'gradient-border shadow-[0_0_60px_rgba(0,204,255,0.15)]'
              }`}>
                <div className="bg-[#0a0a0a]/95 backdrop-blur-xl p-8 md:p-12">
                  {/* Team color gradients */}
                  <div
                    className="absolute inset-0 opacity-20 pointer-events-none transition-opacity duration-500"
                    style={{
                      background: `
                        radial-gradient(ellipse at 15% 50%, ${displayData.homeTeam.color || '#ffffff'}40 0%, transparent 50%),
                        radial-gradient(ellipse at 85% 50%, ${displayData.awayTeam.color || '#ffffff'}40 0%, transparent 50%)
                      `
                    }}
                  />

                  {/* Shine effect overlay */}
                  <div className="absolute inset-0 shine-effect pointer-events-none" />

                  <div className="relative z-10 flex flex-col items-center w-full">
                    <div className="flex items-center justify-between w-full gap-4 md:gap-8 px-4">
                      {/* Home team name */}
                      <h2 className="hidden md:block text-xl lg:text-2xl xl:text-3xl font-black text-white uppercase tracking-tight text-right w-[30%] transition-all hover:text-[#00ccff]">
                        {displayData.homeTeam.name}
                      </h2>

                      {/* Home team logo */}
                      <div className="relative group flex-shrink-0 w-24 md:w-32 lg:w-40 flex justify-center">
                        <div
                          className="absolute inset-0 blur-3xl opacity-40 rounded-full scale-150 transition-all duration-500 group-hover:opacity-60 group-hover:scale-175"
                          style={{ backgroundColor: displayData.homeTeam.color }}
                        />
                        <Image
                          src={displayData.homeTeam.logo || 'https://i.ibb.co/TB027G07/czarnepff-1.png'}
                          alt={displayData.homeTeam.name}
                          width={140}
                          height={140}
                          className="relative z-10 object-contain drop-shadow-2xl h-20 w-20 md:h-28 md:w-28 lg:h-32 lg:w-32 transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>

                      {/* Score/Time display */}
                      <div className="flex flex-col items-center justify-center min-w-[140px] md:min-w-[220px] mx-2">
                        <div className={`relative overflow-hidden rounded-2xl border px-8 md:px-12 py-4 md:py-6 flex flex-col items-center justify-center w-full transition-all duration-500 ${
                          isMatchLive
                            ? 'bg-gradient-to-b from-red-950/50 to-black/90 border-red-500/30'
                            : 'bg-gradient-to-b from-[#0a1628] to-black/90 border-[#00ccff]/20'
                        }`}>
                          {/* Inner glow */}
                          <div className={`absolute inset-0 ${isMatchLive ? 'bg-red-500/5' : 'bg-[#00ccff]/5'} rounded-2xl`} />
                          
                          <span className={`text-4xl md:text-5xl lg:text-6xl font-black tracking-wider relative z-10 whitespace-nowrap ${
                            isMatchLive ? 'text-white' : 'text-white'
                          }`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {isMatchLive ? `${displayData.scoreA}:${displayData.scoreB}` : new Date(displayData.date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMatchLive && (
                            <span className="text-red-500 font-black text-xs md:text-sm tracking-[0.3em] uppercase mt-2 animate-pulse">LIVE</span>
                          )}
                        </div>
                        
                        {!isMatchLive && (
                          <div className="flex flex-col items-center gap-2 mt-4">
                            <div className="flex items-center gap-4 font-black text-base md:text-lg">
                              <span className="text-[#00ccff]/70 bg-[#00ccff]/10 px-3 py-1 rounded-full whitespace-nowrap">#{homePos}</span>
                              <span className="text-gray-600">vs</span>
                              <span className="text-[#00ccff]/70 bg-[#00ccff]/10 px-3 py-1 rounded-full whitespace-nowrap">#{awayPos}</span>
                            </div>
                            {currentMatch.stadium && (
                              <div className="flex flex-col items-center gap-1 mt-2">
                                <span className="text-[10px] md:text-xs font-black text-white/40 uppercase tracking-[0.2em]">{currentMatch.stadium}</span>
                                <span className="text-[9px] font-black text-[#00ccff] uppercase tracking-[0.3em]">{currentMatch.category}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Away team logo */}
                      <div className="relative group flex-shrink-0 w-24 md:w-32 lg:w-40 flex justify-center">
                        <div
                          className="absolute inset-0 blur-3xl opacity-40 rounded-full scale-150 transition-all duration-500 group-hover:opacity-60 group-hover:scale-175"
                          style={{ backgroundColor: displayData.awayTeam.color }}
                        />
                        <Image
                          src={displayData.awayTeam.logo || 'https://i.ibb.co/TB027G07/czarnepff-1.png'}
                          alt={displayData.awayTeam.name}
                          width={140}
                          height={140}
                          className="relative z-10 object-contain drop-shadow-2xl h-20 w-20 md:h-28 md:w-28 lg:h-32 lg:w-32 transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>

                      {/* Away team name */}
                      <h2 className="hidden md:block text-xl lg:text-2xl xl:text-3xl font-black text-white uppercase tracking-tight text-left w-[30%] transition-all hover:text-[#00ccff]">
                        {displayData.awayTeam.name}
                      </h2>
                    </div>

                    {/* Mobile team names */}
                    <div className="flex md:hidden justify-between w-full px-4 mt-4">
                      <span className="text-sm font-black text-white uppercase tracking-tight text-center flex-1">{displayData.homeTeam.name}</span>
                      <div className="w-16" />
                      <span className="text-sm font-black text-white uppercase tracking-tight text-center flex-1">{displayData.awayTeam.name}</span>
                    </div>

                    {/* Match navigation - arrows on sides */}
                    {!isMatchLive && upcomingMatches.length > 1 && (
                      <div className="flex items-center justify-center gap-6 w-full mt-6">
                        <button
                          onClick={prevMatch}
                          disabled={currentIndex === 0}
                          className="group px-5 py-3 rounded-xl font-black bg-white/5 text-gray-400 hover:bg-[#00ccff]/10 hover:text-[#00ccff] disabled:opacity-20 disabled:hover:bg-white/5 disabled:hover:text-gray-400 border border-white/10 hover:border-[#00ccff]/30 transition-all flex items-center gap-2"
                        >
                          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          <span className="hidden md:inline text-sm uppercase tracking-wider">Poprzedni</span>
                        </button>
                        
                        <div className="px-6 py-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
                          <span className="text-sm text-gray-400 font-black uppercase tracking-wider">
                            Mecz {currentIndex + 1} / {upcomingMatches.length}
                          </span>
                        </div>

                        <button
                          onClick={nextMatch}
                          disabled={currentIndex === upcomingMatches.length - 1}
                          className="group px-5 py-3 rounded-xl font-black bg-white/5 text-gray-400 hover:bg-[#00ccff]/10 hover:text-[#00ccff] disabled:opacity-20 disabled:hover:bg-white/5 disabled:hover:text-gray-400 border border-white/10 hover:border-[#00ccff]/30 transition-all flex items-center gap-2"
                        >
                          <span className="hidden md:inline text-sm uppercase tracking-wider">Następny</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* Live match CTA */}
                    {isMatchLive && (
                      <Link
                        href={`/mecz/${liveMatch?.uuid}`}
                        className="group mt-8 relative overflow-hidden px-10 py-4 rounded-xl font-black uppercase tracking-wider transition-all ripple"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-white/5" />
                        <div className="absolute inset-[1px] bg-[#0a0a0a] rounded-[10px] group-hover:bg-transparent transition-colors duration-300" />
                        <span className="relative z-10 text-white flex items-center gap-3">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Centrum Meczowe
                          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Hidden on mobile/tablet */}
          <div className="hidden 2xl:block w-72 shrink-0 space-y-6 animate-in fade-in slide-in-from-right duration-1000">
            <CompactTopScorers setActiveTab={setActiveTab} setIsMinimized={setIsMinimized} />
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-2xl" />
              <div className="relative p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm">
                <h4 className="text-[10px] font-black text-[#00ccff] uppercase tracking-[0.3em] mb-2">WSPARCIE</h4>
                <p className="text-[10px] text-gray-400 font-bold leading-relaxed mb-4">Podoba Ci się projekt? Dołącz do naszej społeczności i wspieraj rozwój ligi!</p>
                <Link href="https://discord.gg/R7y6ZnczP4" target="_blank" className="flex items-center justify-center gap-2 w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all">
                  DOŁĄCZ TERAZ
                </Link>
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
