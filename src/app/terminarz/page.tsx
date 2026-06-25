'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MainNavbar } from '@/components/main-navbar';
import { Footer } from '@/components/footer';
import { useRouter } from 'next/navigation';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Activity,
  ChevronDown,
  Check,
  RotateCcw,
  Clock,
  MapPin
} from 'lucide-react';

interface Match {
  id: number;
  home_team_id: number;
  away_team_id: number;
  home_team_name: string;
  away_team_name: string;
  home_score: number | null;
  away_score: number | null;
  status: string;
  scheduled_at: string;
  round: number;
  match_type: string;
  home_team_logo: string;
  away_team_logo: string;
  date_formatted?: string;
  time_formatted?: string;
  venue_name?: string;
}

interface Team {
  id: number;
  name: string;
  logo_url: string;
}

export default function TerminarzPage() {
  const router = useRouter();
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'terminarz' | 'wyniki' | 'live'>('terminarz');
  const [visibleRounds, setVisibleRounds] = useState(3);
  const [showCup, setShowCup] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedRound, setSelectedRound] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1));
  const [appliedFilters, setAppliedFilters] = useState({
    team: 'all',
    round: 'all',
    month: 'all',
    day: null as number | null,
    year: 2026
  });

  useEffect(() => {
    const drawDate = new Date('2026-06-30T17:00:00');
    const isFinished = localStorage.getItem('county_cup_draw_finished') === 'true';
    setShowCup(new Date() >= drawDate || isFinished);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const drawDate = new Date('2026-06-30T17:00:00');
        const isFinished = localStorage.getItem('county_cup_draw_finished') === 'true';
        const canShowCup = new Date() >= drawDate || isFinished;

        const [leagueRes, cupRes, teamsRes, liveRes] = await Promise.all([
          fetch('https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/public/schedule?type=league'),
          canShowCup ? fetch('https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/public/schedule?type=county_cup') : Promise.resolve({ json: () => ({ matches: [] }) }),
          fetch('https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/teams?season_id=1'),
          fetch('https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/matches/live')
        ]);
        const leagueData = await leagueRes.json();
        const cupData = await (cupRes as any).json();
        const teamsData = await teamsRes.json();
        const liveData = await liveRes.json();

        setTeams(teamsData);
        
        const allMatchData = [...(leagueData.matches || []), ...(canShowCup ? (cupData.matches || []) : [])];
        
        const mappedMatches = allMatchData.map((m: any) => ({
          id: m.id,
          home_team_id: m.home_team?.id,
          away_team_id: m.away_team?.id,
          home_team_name: m.home_team?.name || 'TBD',
          away_team_name: m.away_team?.name || 'TBD',
          home_score: m.score?.home ?? null,
          away_score: m.score?.away ?? null,
          status: m.status,
          scheduled_at: m.scheduled?.datetime_local || m.scheduled?.datetime_iso || '',
          round: m.round,
          match_type: m.match_type || (m.round_name ? 'county_cup' : 'league'),
          date_formatted: m.scheduled?.date || '',
          time_formatted: m.scheduled?.time || '18:00',
          venue_name: m.venue?.name || '',
          home_team_logo: m.home_team?.logo_url || teamsData.find((t: any) => t.id === m.home_team?.id)?.logo_url || 'https://i.ibb.co/Rkz8MRSy/IMG-4837.png',
          away_team_logo: m.away_team?.logo_url || teamsData.find((t: any) => t.id === m.away_team?.id)?.logo_url || 'https://i.ibb.co/Rkz8MRSy/IMG-4837.png'
        }));
        setAllMatches(mappedMatches);

        setLiveMatches(liveData.filter((m: any) => canShowCup || m.match_type !== 'county_cup').map((m: any) => {
          const scheduleMatch = allMatchData.find((sm: any) => sm.id === m.id);
          return {
            ...m,
            match_type: m.match_type || 'league',
            venue_name: scheduleMatch?.venue?.name || '',
            date_formatted: scheduleMatch?.scheduled?.date || '',
            time_formatted: scheduleMatch?.scheduled?.time || '',
            home_team_logo: teamsData.find((t: any) => t.id === m.home_team_id)?.logo_url || 'https://i.ibb.co/Rkz8MRSy/IMG-4837.png',
            away_team_logo: teamsData.find((t: any) => t.id === m.away_team_id)?.logo_url || 'https://i.ibb.co/Rkz8MRSy/IMG-4837.png'
          };
        }));
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    fetchData();
    const interval = setInterval(fetchData, 10000); // Odświeżanie co 10 sekund
    return () => clearInterval(interval);
  }, []);

  const calculateMinute = (startTimestamp: string) => {
    if (!startTimestamp) return '1\'';
    const start = new Date(startTimestamp).getTime();
    const now = new Date().getTime();
    const diff = Math.floor((now - start) / 60000);
    return diff > 90 ? '90+\'' : diff < 0 ? '1\'' : `${diff}'`;
  };

  const filteredMatches = useMemo(() => {
    return allMatches.filter(match => {
      if (activeTab === 'terminarz' && match.status !== 'scheduled') return false;
      if (activeTab === 'wyniki' && match.status !== 'finished') return false;
      
      const mDate = new Date(match.scheduled_at);
      
      if (appliedFilters.team !== 'all' && match.home_team_id !== parseInt(appliedFilters.team) && match.away_team_id !== parseInt(appliedFilters.team)) return false;
      if (appliedFilters.round !== 'all' && match.round !== parseInt(appliedFilters.round)) return false;
      if (appliedFilters.month !== 'all' && mDate.getMonth() !== parseInt(appliedFilters.month)) return false;
      if (appliedFilters.day !== null) {
          if (mDate.getDate() !== appliedFilters.day || mDate.getMonth() !== currentDate.getMonth() || mDate.getFullYear() !== currentDate.getFullYear()) return false;
      }
      
      return true;
    });
  }, [allMatches, activeTab, appliedFilters, currentDate]);

  const groupedMatches = useMemo(() => {
    return filteredMatches.reduce((acc: { [key: string]: Match[] }, match) => {
      const groupKey = match.match_type === 'league' ? `L-${match.round}` : `${match.match_type}-${match.round}`;
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(match);
      return acc;
    }, {});
  }, [filteredMatches]);

  const formatMatchDateLong = (iso: string, date_formatted?: string) => {
    if (!iso && !date_formatted) return 'SIERPIEŃ 2026';
    const date = new Date(iso);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' }).toUpperCase();
    }
    if (date_formatted) {
      const [day, month, year] = date_formatted.split('.');
      if (day && month && year) {
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' }).toUpperCase();
      }
    }
    return 'SIERPIEŃ 2026';
  };

  const sortedKeys = useMemo(() => Object.keys(groupedMatches).sort((a, b) => {
    const tA = new Date(groupedMatches[a][0].scheduled_at).getTime();
    const tB = new Date(groupedMatches[b][0].scheduled_at).getTime();
    return activeTab === 'wyniki' ? tB - tA : tA - tB;
  }), [groupedMatches, activeTab]);

  const getRoundName = (round: number, type: string) => {
    if (type === 'league') return `KOLEJKA ${round}`;
    const names: any = { 
      4: '1/8 FINAŁU', 
      3: 'ĆWIERĆFINAŁ', 
      2: 'PÓŁFINAŁ', 
      1: 'FINAŁ' 
    };
    return `${names[round] || `RUNDA ${round}`} - ${type === 'champions_cup' ? 'PUCHAR MISTRZÓW' : 'PUCHAR POWIATU'}`;
  };

  const applyFilters = () => {
    setAppliedFilters({ team: selectedTeam, round: selectedRound, month: selectedMonth, day: selectedDay, year: currentDate.getFullYear() });
    setVisibleRounds(3);
  };

  const resetFilters = () => {
    setSelectedTeam('all');
    setSelectedRound('all');
    setSelectedMonth('all');
    setSelectedDay(null);
    setAppliedFilters({ team: 'all', round: 'all', month: 'all', day: null, year: 2026 });
    setCurrentDate(new Date(2026, 7, 1));
  };

  const handleDayClick = (day: number) => {
    const newDay = selectedDay === day ? null : day;
    setSelectedDay(newDay);
    setAppliedFilters(prev => ({ ...prev, day: newDay, month: currentDate.getMonth().toString() }));
  };

  // Calendar logic
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const start = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const offset = start === 0 ? 6 : start - 1;
    return [...Array(offset).fill(null), ...Array.from({length: days}, (_, i) => i + 1)];
  }, [currentDate]);

  return (
    <main className="bg-black min-h-screen text-white font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      <MainNavbar />
      <div className="fixed inset-0 z-0 brightness-[0.7]"><Image src="https://i.ibb.co/YCB7X52/obraz-2026-06-13-150303737.png" alt="" fill className="object-cover" priority /></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 z-0" />

      <div className="container mx-auto px-4 pt-44 pb-24 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1">
            <header className="mb-12"><h1 className="text-7xl md:text-8xl font-black italic uppercase tracking-tighter mb-4">{activeTab === 'wyniki' ? 'WYNIKI' : activeTab === 'live' ? 'LIVE' : 'TERMINARZ'}</h1><div className="flex flex-col gap-1"><span className="text-blue-500 font-bold text-xl uppercase tracking-wider">SEZON 2026/2027</span><span className="text-white/40 font-bold text-sm uppercase tracking-[0.2em]">1 LIGA DZIAŁDOWSKA</span></div></header>
            <div className="flex p-1.5 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl mb-12 w-fit">
              <TabButton active={activeTab === 'terminarz'} onClick={() => setActiveTab('terminarz')} icon={<CalendarIcon className="w-4 h-4" />}>TERMINARZ</TabButton>
              <TabButton active={activeTab === 'wyniki'} onClick={() => setActiveTab('wyniki')} icon={<Activity className="w-4 h-4" />}>WYNIKI</TabButton>
              <TabButton active={activeTab === 'live'} onClick={() => setActiveTab('live')} icon={
                <div className="relative">
                  <Activity className={`w-4 h-4 ${liveMatches.length > 0 ? 'text-red-500' : ''}`} />
                  {liveMatches.length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                </div>
              }>MECZE NA ŻYWO</TabButton>
            </div>

            <div className="space-y-10">
              {loading ? <div className="py-20 flex flex-col items-center"><Activity className="w-12 h-12 text-blue-500 animate-spin" /></div> : (
                <>
                  {/* Live Matches Section - Always visible at top if there are live matches or if in live tab */}
                  {(liveMatches.length > 0) && (
                    <div className="bg-white/[0.02] border border-red-500/20 rounded-[3rem] overflow-hidden backdrop-blur-2xl shadow-2xl relative">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50" />
                      <div className="p-8 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="bg-red-600 text-white px-5 py-2 rounded-xl text-xs font-black uppercase italic tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            NA ŻYWO
                          </div>
                          <span className="text-xs font-black text-white/30 uppercase tracking-[0.2em]">TRWAJĄCE SPOTKANIA</span>
                        </div>
                      </div>
                      <div className="p-8 space-y-4">
                        {liveMatches.map(m => (
                          <div 
                            key={m.id} 
                            onClick={() => router.push(`/mecz/${m.id}`)}
                            className="grid grid-cols-[1fr_auto_1fr_60px] items-center gap-10 p-4 rounded-2xl hover:bg-white/5 transition-all group relative cursor-pointer"
                          >
                            <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                            <Link 
                              href={`/klub/${m.home_team_id}`} 
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-6 justify-end relative z-10"
                            >
                              <span className="text-xl font-black uppercase italic tracking-tighter truncate group-hover:text-blue-400">{m.home_team_name}</span>
                              <img src={m.home_team_logo} className="w-14 h-14 object-contain" alt="" />
                            </Link>
                            <div className="flex flex-col items-center gap-3 transition-all hover:scale-105 active:scale-95 relative z-10">
                                <div className="bg-red-600 text-white text-sm font-black px-6 py-2 rounded-full animate-pulse tracking-[0.2em] shadow-[0_0_25px_rgba(220,38,38,0.6)] border-2 border-white/20">
                                    {calculateMinute(m.start_timestamp || '')}
                                </div>
                                <div className="bg-red-600/10 border border-red-500/40 px-10 py-5 rounded-[2.5rem] flex flex-col items-center shadow-[inset_0_0_30px_rgba(239,68,68,0.15)] backdrop-blur-md group-hover:bg-red-600/20">
                                    <span className="text-5xl font-black italic tracking-tighter text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]">
                                        {m.home_score}:{m.away_score}
                                    </span>
                                </div>
                                {m.venue_name && (
                                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-red-400/60 mt-2">
                                        <MapPin className="w-2.5 h-2.5" /> {m.venue_name}
                                    </div>
                                )}
                            </div>
                            <Link 
                              href={`/klub/${m.away_team_id}`} 
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-6 relative z-10"
                            >
                              <img src={m.away_team_logo} className="w-14 h-14 object-contain" alt="" />
                              <span className="text-xl font-black uppercase italic tracking-tighter truncate group-hover:text-blue-400">{m.away_team_name}</span>
                            </Link>
                            <div className="flex justify-center relative z-10">
                              <img src={m.match_type === 'champions_cup' ? 'https://i.ibb.co/4wpcgDRj/IMG-4837-2.png' : m.match_type === 'county_cup' ? 'https://i.ibb.co/qMzPb2kp/IMG-4837-3.png' : 'https://i.ibb.co/rK2KV1FN/IMG-4837-1.png'} className="w-8 h-8 object-contain brightness-125 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" alt="" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'live' && liveMatches.length === 0 && (
                    <div className="py-32 flex flex-col items-center gap-8 bg-white/[0.02] border border-white/5 rounded-[3rem] backdrop-blur-2xl">
                      <div className="relative">
                        <Activity className="w-20 h-20 text-white/5" />
                        <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
                      </div>
                      <div className="text-center">
                        <h3 className="text-2xl font-black uppercase italic tracking-widest text-white/40 mb-2">Brak meczów na żywo</h3>
                        <p className="text-white/10 text-xs font-bold uppercase tracking-[0.2em]">ZAPRASZAMY WKRÓTCE NA RELACJE LIVE</p>
                      </div>
                    </div>
                  )}

                  {activeTab !== 'live' && sortedKeys.slice(0, visibleRounds).map(key => (
                  <div key={key} className="bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden backdrop-blur-2xl shadow-2xl">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between"><div className="flex items-center gap-6"><div className="bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-black uppercase italic tracking-widest">{getRoundName(groupedMatches[key][0].round, groupedMatches[key][0].match_type)}</div><span className="text-xs font-black text-white/30 uppercase tracking-[0.2em]">{formatMatchDateLong(groupedMatches[key][0].scheduled_at, groupedMatches[key][0].date_formatted)}</span></div><Link href={`/kolejka/${groupedMatches[key][0].round}`} className="text-[10px] font-black text-white/20 hover:text-blue-400 uppercase tracking-widest flex items-center gap-2">SZCZEGÓŁY <ChevronRight className="w-4 h-4" /></Link></div>
                    <div className="p-8 space-y-4">
                      {groupedMatches[key].map(m => (
                        <div 
                          key={m.id} 
                          onClick={() => router.push(`/mecz/${m.id}`)}
                          className="grid grid-cols-[1fr_auto_1fr_60px] items-center gap-4 md:gap-12 p-4 rounded-2xl hover:bg-white/5 transition-all group cursor-pointer relative"
                        >
                          <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                          <Link 
                            href={`/klub/${m.home_team_id}`} 
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-6 justify-end relative z-10"
                          >
                            <span className="text-xl font-black uppercase italic tracking-tighter truncate group-hover:text-blue-400 hidden md:block">{m.home_team_name}</span>
                            <img src={m.home_team_logo} className="w-10 h-10 md:w-14 md:h-14 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform" alt="" />
                          </Link>
                          <div className="flex flex-col items-center transition-all relative z-10">
                            <div className="bg-[#0b1629]/80 border border-white/10 px-8 py-4 rounded-2xl group-hover:border-blue-500/50 transition-all shadow-xl backdrop-blur-sm min-w-[120px] text-center">
                              <span className="text-xl font-black italic tracking-tighter text-white/90">{m.home_score !== null ? `${m.home_score}:${m.away_score}` : m.time_formatted || '18:00'}</span>
                            </div>
                          </div>
                          <Link 
                            href={`/klub/${m.away_team_id}`} 
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-6 relative z-10"
                          >
                            <img src={m.away_team_logo} className="w-10 h-10 md:w-14 md:h-14 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform" alt="" />
                            <span className="text-xl font-black uppercase italic tracking-tighter truncate group-hover:text-blue-400 hidden md:block">{m.away_team_name}</span>
                          </Link>
                          <div className="flex justify-center relative z-10">
                            <img src={m.match_type === 'champions_cup' ? 'https://i.ibb.co/4wpcgDRj/IMG-4837-2.png' : m.match_type === 'county_cup' ? 'https://i.ibb.co/qMzPb2kp/IMG-4837-3.png' : 'https://i.ibb.co/rK2KV1FN/IMG-4837-1.png'} className="w-8 h-8 object-contain brightness-110 group-hover:brightness-150 transition-all drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]" alt="" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              }
            </>
          )}
        </div>
        {visibleRounds < sortedKeys.length && (
          <button onClick={() => setVisibleRounds(v => v + 3)} className="w-full mt-10 bg-white/[0.03] border border-white/5 py-6 rounded-3xl text-xs font-black uppercase tracking-[0.4em] text-white/40 hover:text-white transition-all">
            POKAŻ WIĘCEJ
          </button>
        )}
      </div>

          <aside className="w-full lg:w-[400px] flex flex-col gap-10">
            <Card title="FILTRY" icon={<Filter className="w-4 h-4 text-blue-500" />}>
              <div className="space-y-4">
                <CustomSelect label="Druzyna" value={selectedTeam} options={[{id: 'all', name: 'WSZYSTKIE DRUŻYNY'}, ...teams]} onSelect={setSelectedTeam} icon />
                <CustomSelect label="Kolejka" value={selectedRound} options={[{id: 'all', name: 'WSZYSTKIE KOLEJKI'}, ...Array.from({length: 15}, (_,i)=>({id: (i+1).toString(), name: `KOLEJKA ${i+1}`}))]} onSelect={setSelectedRound} />
                <CustomSelect label="Miesiąc" value={selectedMonth} options={[{id: 'all', name: 'WSZYSTKIE MIESIĄCE'}, {id: '7', name: 'SIERPIEŃ'}, {id: '8', name: 'WRZESIEŃ'}, {id: '9', name: 'PAŹDZIERNIK'}]} onSelect={setSelectedMonth} />
                <button onClick={applyFilters} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-xl mt-4 transition-all">ZASTOSUJ FILTRY</button>
                <button onClick={resetFilters} className="w-full flex items-center justify-center gap-2 text-[9px] font-black text-white/20 hover:text-white uppercase tracking-widest mt-2 transition-colors"><RotateCcw className="w-3 h-3" /> Resetuj wszystkie filtry</button>
              </div>
            </Card>

            <Card title="KALENDARZ" icon={<CalendarIcon className="w-4 h-4 text-blue-500" />}>
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><ChevronLeft className="w-5 h-5 text-white/30" /></button>
                  <span className="text-sm font-black uppercase tracking-widest italic">{currentDate.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' }).toUpperCase()}</span>
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><ChevronRight className="w-5 h-5 text-white/30" /></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center mb-4 text-[8px] font-black text-white/20 uppercase">{['PON', 'WT', 'ŚR', 'CZW', 'PT', 'SOB', 'NIED'].map(d => <span key={d}>{d}</span>)}</div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, i) => {
                    if (!day) return <div key={i} />;
                    const isMatch = allMatches.some(m => { const d = new Date(m.scheduled_at); return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear(); });
                    const isSelected = selectedDay === day;
                    return <button key={i} onClick={() => handleDayClick(day)} className={`aspect-square flex items-center justify-center rounded-xl text-xs font-black transition-all border ${isSelected ? 'bg-white text-black border-white shadow-2xl scale-110' : isMatch ? 'bg-blue-600/20 text-blue-400 border-blue-500/30 hover:bg-blue-600 hover:text-white' : 'bg-transparent text-white/20 border-transparent hover:text-white'}`}>{day}</button>;
                  })}
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>
      <Footer />
    </main>
  );
}

function CustomSelect({ label, value, options, onSelect, icon }: any) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o:any) => o.id === value);
  useEffect(() => { const h = (e:any) => { if(ref.current && !ref.current.contains(e.target)) setOpen(false); }; window.addEventListener('mousedown', h); return () => window.removeEventListener('mousedown', h); }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="w-full bg-white/[0.03] border border-white/10 px-6 py-4 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-all">
        <div className="flex items-center gap-4">
          {icon && selected?.logo_url && <img src={selected.logo_url} className="w-5 h-5 object-contain" alt="" />}
          <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{selected?.name || label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-white/20 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-[#0b1629] border border-white/10 rounded-2xl p-2 z-[100] shadow-2xl max-h-[250px] overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2">
          {options.map((o:any) => (
            <button key={o.id} onClick={() => { onSelect(o.id); setOpen(false); }} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-4">
                {icon && o.logo_url && <img src={o.logo_url} className="w-5 h-5 object-contain" alt="" />}
                <span className="text-[9px] font-black uppercase tracking-widest text-white/60 group-hover:text-white">{o.name}</span>
              </div>
              {value === o.id && <Check className="w-3 h-3 text-blue-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TabButton({ active, icon, children, onClick }: any) {
  return <button onClick={onClick} className={`flex items-center gap-3 px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-blue-600 text-white shadow-xl border border-blue-400/30 scale-105' : 'text-white/30 hover:text-white'}`}>{icon} {children}</button>;
}

function Card({ title, icon, children }: any) {
  return <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group hover:bg-white/[0.05] transition-all"><div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-8"><div className="p-3 bg-blue-600/5 rounded-2xl border border-blue-500/10 shadow-lg">{icon}</div><h3 className="text-blue-500 font-black text-xs uppercase tracking-[0.4em]">{title}</h3></div><div className="relative z-10">{children}</div></div>;
}
