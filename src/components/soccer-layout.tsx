'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { newsArticles as staticNewsArticles } from '@/lib/data';
import { getTeamLogo, getTeamName } from '@/lib/useMatchStats';
import { ChevronLeft, ChevronRight, Filter, Tv, Trophy, Newspaper, Users } from 'lucide-react';

// --- Types ---
interface Match {
  id: string;
  uuid?: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  time?: string;
  timer?: string;
  status: string;
  league?: string;
  isActive?: boolean;
  date?: string;
}

// --- Constants ---
const LEAGUES = [
  { name: 'Ekstraklasa', icon: '🇵🇱', color: '#0066ff', code: 'PL', logo: 'https://i.ibb.co/gFB3FXr4/image.png', id: '2' },
];

const ALL_AVAILABLE_LEAGUES = [
  { id: '2', name: 'Ekstraklasa', logo: 'https://i.ibb.co/gFB3FXr4/image.png' },
  { id: 'CLJ', name: 'CLJ', logo: 'https://i.ibb.co/qMnRc6nx/image.png' },
  { id: 'Mecze+Towarzyskie+2026', name: 'Mecze Towarzyskie', logo: 'https://i.ibb.co/xShtkfph/image.png' }
];

// --- Components ---

const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`glass-effect rounded-[24px] border border-white/5 overflow-hidden shadow-2xl ${className}`}>
    {children}
  </div>
);

export function SoccerLayout() {
  const [articles, setArticles] = useState<any[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAllLeagues, setShowAllLeagues] = useState(false);

  // Fetch News
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('https://league-builder.replit.app/api/articles');
        if (response.ok) {
          const data = await response.json();
          setArticles(data.slice(0, 5));
        } else {
          setArticles(staticNewsArticles.slice(0, 5));
        }
      } catch (error) {
        setArticles(staticNewsArticles.slice(0, 5));
      }
    };
    fetchArticles();
  }, []);

  // Fetch Live Matches
  const fetchLiveMatches = useCallback(async () => {
    try {
      const response = await fetch('/api/matches');
      if (response.ok) {
        const data = await response.json();
        const mapped = data.map((m: any) => {
          let status = 'upcoming';
          const isFinished = m.isFinished || m.status === 'finished' || m.status === 'ZAKOŃCZONY' || m.isActive === false;
          
          if (m.isHalftime) status = 'ht';
          else if (isFinished) status = 'finished';
          else if (m.status === 'active' || m.isActive === true) status = 'live';

          // Próba odgadnięcia ligi na podstawie UUID (np. tf- to towarzyskie)
          let league = m.league || 'Ekstraklasa';
          const uuid = (m.uuid || m.id || '').toLowerCase();
          if (uuid.startsWith('tf-')) league = 'Mecze towarzyskie';

          // Próba odgadnięcia daty z UUID (format: tf-...-DDMM)
          let date = m.date;
          if (!date && uuid.startsWith('tf-')) {
            const parts = uuid.split('-');
            const datePart = parts[parts.length - 1]; // np. 2402
            if (datePart && datePart.length === 4) {
              const day = datePart.substring(0, 2);
              const month = datePart.substring(2, 4);
              date = `2026-${month}-${day}T12:00:00.000Z`;
            }
          }

          return {
            id: m.uuid || m.id,
            homeTeam: m.teamA || m.homeTeam,
            awayTeam: m.teamB || m.awayTeam,
            homeScore: m.scoreA ?? m.homeScore ?? 0,
            awayScore: m.scoreB ?? m.awayScore ?? 0,
            time: m.timer || m.time || '00:00',
            status: status,
            league: league,
            date: date
          };
        });
        setLiveMatches(mapped);
      }
    } catch (error) {
      console.error('Error fetching live matches:', error);
    }
  }, []);

  // Fetch Schedule (Fixtures)
  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/schedule');
      if (response.ok) {
        const data = await response.json();
        const fixturesData = Array.isArray(data) ? data : data.fixtures || [];
        const mapped = fixturesData.map((f: any) => {
          let status = 'upcoming';
          if (f.isHalftime) status = 'ht';
          else if (f.isFinished || f.status === 'finished' || f.status === 'played') status = 'finished';
          else if (f.status === 'active' || f.timer) status = 'live';

          return {
            id: (f.matchUuid || f.uuid || f.id).toString(),
            homeTeam: f.homeTeam || f.teamA,
            awayTeam: f.awayTeam || f.teamB,
            homeScore: f.homeScore || f.scoreA || 0,
            awayScore: f.awayScore || f.scoreB || 0,
            time: f.time || (f.date ? new Date(f.date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }) : '00:00'),
            status: status,
            league: f.league || f.category || 'Ekstraklasa',
            date: f.date
          };
        });
        setMatches(mapped);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveMatches();
    fetchSchedule();
    const interval = setInterval(fetchLiveMatches, 15000);
    return () => clearInterval(interval);
  }, [fetchLiveMatches, fetchSchedule]);

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const isSameDay = (date1: Date, date2String: string) => {
    if (!date2String) return false;
    const date2 = new Date(date2String);
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const filteredMatches = matches.filter(m => isSameDay(selectedDate, m.date || ''));
  const filteredLive = liveMatches.filter(m => {
    if (m.date) return isSameDay(selectedDate, m.date);
    // Jeśli mecz nie ma daty, pokazuj go tylko jeśli jest LIVE/HT i wybrany dzień to DZISIAJ
    return (m.status === 'live' || m.status === 'ht') && isToday(selectedDate);
  });
  
  const allMatchesToDisplay = [...filteredLive, ...filteredMatches.filter(fm => !filteredLive.some(lm => lm.id === fm.id))];

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 max-w-[1600px] mx-auto min-h-screen pt-24 lg:pt-32">
      {/* LEFT SIDEBAR: LEAGUES */}
      <aside className="w-full lg:w-64 flex flex-col gap-4">
        <GlassCard className="p-4 bg-black/40">
          <h2 className="text-white font-black uppercase tracking-tighter mb-4 text-sm px-2">Najważniejsze ligi</h2>
          <nav className="flex flex-col gap-1">
            {LEAGUES.map((league) => (
              <Link 
                key={league.name} 
                href={`/liga/${league.id}`} 
                className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
              >
                <div className="w-1 h-4 rounded-full" style={{ backgroundColor: league.color }} />
                <div className="flex items-center gap-2 flex-1">
                   {league.logo ? (
                     <img src={league.logo} alt="" className="w-5 h-5 object-contain" />
                   ) : (
                     <span className="text-[10px] font-black text-white/40 w-5 text-center">{league.code}</span>
                   )}
                   <span className="text-[13px] font-bold tracking-tight">{league.name}</span>
                </div>
              </Link>
            ))}
          </nav>
        </GlassCard>

        <div className="relative">
          <GlassCard className="p-4 bg-black/40">
            <button 
              onClick={() => setShowAllLeagues(!showAllLeagues)}
              className="flex items-center justify-between w-full px-2 text-white font-black uppercase tracking-tighter text-sm"
            >
              Wszystkie ligi
              <ChevronRight className={`w-4 h-4 transition-transform ${showAllLeagues ? 'rotate-90' : ''}`} />
            </button>
          </GlassCard>
          
          {showAllLeagues && (
            <GlassCard className="absolute top-full left-0 w-full mt-2 p-2 bg-black/80 z-50 animate-in fade-in slide-in-from-top-2">
              {ALL_AVAILABLE_LEAGUES.map(league => (
                <Link key={league.id} href={`/liga/${league.id}`} className="flex items-center gap-3 w-full px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                  <img src={league.logo} alt="" className="w-5 h-5 object-contain" />
                  <span className="text-xs font-bold">{league.name}</span>
                </Link>
              ))}
            </GlassCard>
          )}
        </div>
      </aside>

      {/* CENTER CONTENT: MATCHES */}
      <main className="flex-1 flex flex-col gap-4">
        {/* Date Selector & Filters */}
        <GlassCard className="p-3 bg-black/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => changeDate(-1)} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-2 text-white font-bold px-4 py-2 hover:bg-white/5 rounded-xl transition-colors min-w-[120px] justify-center">
              {selectedDate.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}
            </button>
            <button onClick={() => changeDate(1)} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="whitespace-nowrap px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-bold border border-white/10">Trwające</button>
            <div className="h-6 w-px bg-white/10 mx-2" />
            <button className="flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white text-sm font-bold transition-colors">
              <Filter className="w-4 h-4" />
              Filtr
            </button>
          </div>
        </GlassCard>

        {/* Match List */}
        <div className="flex flex-col gap-4">
          {['Ekstraklasa', 'CLJ', 'Mecze towarzyskie'].map(leagueName => {
            const leagueMatches = allMatchesToDisplay.filter(m => {
              const matchesLeague = m.league?.toLowerCase() === leagueName.toLowerCase() || 
                                   (leagueName === 'Ekstraklasa' && (!m.league || m.league === 'Liga'));
              return matchesLeague;
            });

            if (leagueMatches.length === 0 && leagueName !== 'Ekstraklasa') return null;

            return (
              <GlassCard key={leagueName} className="bg-black/40">
                <div className="bg-white/5 px-4 py-3 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center gap-3">
                    {ALL_AVAILABLE_LEAGUES.find(l => l.name.toLowerCase() === leagueName.toLowerCase())?.logo ? (
                      <img 
                        src={ALL_AVAILABLE_LEAGUES.find(l => l.name.toLowerCase() === leagueName.toLowerCase())?.logo} 
                        alt="" 
                        className="w-5 h-5 object-contain"
                      />
                    ) : (
                      <Trophy className="w-4 h-4 text-blue-400" />
                    )}
                    <h3 className="text-white font-bold text-sm uppercase">{leagueName}</h3>
                  </div>
                </div>

                <div className="flex flex-col">
                  {leagueMatches.length > 0 ? leagueMatches.map((match) => (
                    <Link key={match.id} href={`/mecz/${match.id}`} className="flex items-center gap-4 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                      <div className="w-10 flex flex-col items-center justify-center">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 flex items-center justify-center rounded-md ${
                          match.status === 'live' ? 'bg-green-500/20 text-green-400 animate-pulse' : 
                          match.status === 'ht' ? 'bg-yellow-500/20 text-yellow-400' :
                          match.status === 'finished' ? 'bg-white/5 text-gray-500' :
                          'bg-blue-500/10 text-blue-400'
                        }`}>
                          {match.status === 'live' ? match.time : 
                           match.status === 'ht' ? 'PRZERWA' : 
                           match.status === 'finished' ? 'KONIEC' : 
                           match.time}
                        </span>
                      </div>
                      
                      <div className="flex-1 grid grid-cols-[1fr,auto,1fr] items-center gap-4">
                        <div className="flex items-center justify-end gap-3 text-right">
                          <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{getTeamName(match.homeTeam)}</span>
                          <div className="relative w-6 h-6 shrink-0">
                            <img src={getTeamLogo(match.homeTeam)} alt="" className="w-full h-full object-contain" />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 px-4 py-1.5 bg-black/20 rounded-lg border border-white/5 min-w-[80px] justify-center">
                          {match.status === 'upcoming' ? (
                            <span className="text-gray-600 font-black">- : -</span>
                          ) : (
                            <>
                              <span className="text-lg font-black text-white">{match.homeScore}</span>
                              <span className="text-gray-600 font-bold">:</span>
                              <span className="text-lg font-black text-white">{match.awayScore}</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-left">
                          <div className="relative w-6 h-6 shrink-0">
                            <img src={getTeamLogo(match.awayTeam)} alt="" className="w-full h-full object-contain" />
                          </div>
                          <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{getTeamName(match.awayTeam)}</span>
                        </div>
                      </div>

                      <div className="w-8 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Tv className="w-4 h-4 text-gray-500" />
                      </div>
                    </Link>
                  )) : (
                    <div className="p-8 text-center text-gray-500 text-xs italic">Brak meczów w tym dniu</div>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </main>

      {/* RIGHT SIDEBAR: SQUAD BUILDER & NEWS */}
      <aside className="w-full lg:w-80 flex flex-col gap-6">
        {/* Squad Builder CTA */}
        <Link href="/kreator-skladu">
          <GlassCard className="p-5 bg-gradient-to-br from-blue-600/20 to-purple-600/20 group cursor-pointer hover:from-blue-600/30 hover:to-purple-600/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-black uppercase tracking-tighter text-sm">Zbuduj swoją własną 11</h3>
                <p className="text-gray-400 text-[10px] mt-1">Wypróbuj nasz kreator składu</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="relative aspect-[4/3] bg-black/40 rounded-xl border border-white/10 overflow-hidden p-4 flex items-center justify-center">
              <div className="grid grid-cols-4 gap-4 opacity-40">
                {[...Array(11)].map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded-full border border-white/40 mx-auto" />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">OTWÓRZ KREATOR</span>
              </div>
            </div>
          </GlassCard>
        </Link>

        {/* News Sidebar */}
        <GlassCard className="p-5 bg-black/40">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-black uppercase tracking-tighter text-sm">Newsy</h3>
            <Newspaper className="w-4 h-4 text-gray-500" />
          </div>

          <div className="flex flex-col gap-6">
            {articles.length > 0 ? (
              <>
                <Link href={`/aktualnosc/${articles[0].id}`} className="group block">
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
                    <img src={articles[0].imageUrl || articles[0].image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  </div>
                  <h4 className="text-white font-bold text-sm line-clamp-2 group-hover:text-blue-400 transition-colors leading-snug">
                    {articles[0].title}
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-2">SI • 1 godz. temu</p>
                </Link>

                <div className="h-px bg-white/5" />

                {articles.slice(1, 4).map((article) => (
                  <Link key={article.id} href={`/aktualnosc/${article.id}`} className="flex gap-3 group">
                    <div className="relative w-20 h-14 rounded-lg overflow-hidden shrink-0">
                      <img src={article.imageUrl || article.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className="text-white font-bold text-[11px] line-clamp-2 group-hover:text-blue-400 transition-colors leading-tight">
                        {article.title}
                      </h4>
                      <p className="text-[9px] text-gray-500 mt-1">SI • 29 min temu</p>
                    </div>
                  </Link>
                ))}
              </>
            ) : (
              <div className="animate-pulse flex flex-col gap-4">
                <div className="h-32 bg-white/5 rounded-xl" />
                <div className="h-4 bg-white/5 rounded w-3/4" />
              </div>
            )}
          </div>
          <Link href="/aktualnosci" className="block text-center text-gray-400 hover:text-white text-[11px] font-black uppercase mt-8 transition-colors pt-4 border-t border-white/5">
            Zobacz więcej
          </Link>
        </GlassCard>
      </aside>
    </div>
  );
}
