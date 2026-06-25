'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MainNavbar } from '@/components/main-navbar';
import { Footer } from '@/components/footer';
import { 
  Trophy, Calendar, ChevronRight, Loader2, Goal, Activity, CircleDot, Users,
  Layout, Award, Shield
} from 'lucide-react';

interface TableTeam {
  team_id: number;
  team_name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  points: number;
  team_logo_url: string;
}

interface Match {
  id: number;
  home_team_id: number;
  away_team_id: number;
  home_team_name: string;
  away_team_name: string;
  home_score: number;
  away_score: number;
  status: string;
  scheduled_at: string;
  match_type?: string;
  round?: number;
}

interface StatsSummary {
  total_teams: number;
  total_players: number;
  total_goals: number;
  total_matches: number;
}

interface PlayerStat {
  player_id: number;
  player_name: string;
  team_name: string;
  team_id: number;
  goals: number;
  assists: number;
  photo_url?: string | null;
}

export default function TabelaPage() {
  return (
    <Suspense fallback={
      <main className="bg-black min-h-screen text-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </main>
    }>
      <TabelaContent />
    </Suspense>
  );
}

function TabelaContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'league' | 'county_cup' | 'champions_cup'>('league');
  const [showCup, setShowCup] = useState(false);

  useEffect(() => {
    const drawDate = new Date('2026-06-30T17:00:00');
    const isFinished = localStorage.getItem('county_cup_draw_finished') === 'true';
    const canShow = new Date() >= drawDate || isFinished;
    setShowCup(canShow);

    if (tabParam === 'champions_cup' || tabParam === 'county_cup' || tabParam === 'league') {
      if (tabParam === 'county_cup' && !canShow) {
        setActiveTab('league');
      } else {
        setActiveTab(tabParam as any);
      }
    }
  }, [tabParam]);

  const [tableData, setTableData] = useState<TableTeam[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([]);
  const [cupPlayerStats, setCupPlayerStats] = useState<PlayerStat[]>([]);
  const [cupMatches, setCupMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [tableRes, matchesRes, upcomingRes, statsRes, playersStatsRes, playersRes, cupRes, cupPlayersStatsRes] = await Promise.all([
          fetch('https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/tables?season_id=1'),
          fetch('https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/matches?season_id=1&status=finished'),
          fetch('https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/matches?season_id=1&status=scheduled'),
          fetch('https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/stats/summary'),
          fetch('https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/stats/players?season_id=1'),
          fetch('https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/players'),
          fetch('https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/matches?season_id=1'),
          fetch('https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/stats/players')
        ]);
        
        const tableJson = await tableRes.json();
        const matchesJson = await matchesRes.json();
        const upcomingJson = await upcomingRes.json();
        const statsJson = await statsRes.json();
        const playersStatsJson = await playersStatsRes.json();
        const playersJson = await playersRes.json();
        const cupMatchesJson = await cupRes.json();
        const cupPlayersStatsJson = await cupPlayersStatsRes.json();

        if (Array.isArray(cupMatchesJson)) {
          setCupMatches(cupMatchesJson.filter(m => m.match_type === 'champions_cup' || m.match_type === 'county_cup'));
        }

        if (Array.isArray(tableJson)) {
          setTableData([...tableJson].sort((a, b) => b.points - a.points));
        }
        if (Array.isArray(matchesJson)) {
          setMatches([...matchesJson].reverse());
        }
        if (Array.isArray(upcomingJson)) {
          setUpcomingMatches(upcomingJson);
        }
        if (statsJson) setStats(statsJson);
        
        if (Array.isArray(playersStatsJson) && Array.isArray(playersJson)) {
          const mergedPlayers = playersStatsJson.map((ps: any) => {
            const playerInfo = playersJson.find((p: any) => p.id === ps.player_id);
            return {
              ...ps,
              photo_url: playerInfo?.photo_url
            };
          });
          setPlayerStats(mergedPlayers.sort((a, b) => b.goals - a.goals));
        }

        if (Array.isArray(cupPlayersStatsJson) && Array.isArray(playersJson)) {
          const mergedCupPlayers = cupPlayersStatsJson.map((ps: any) => {
            const playerInfo = playersJson.find((p: any) => p.id === ps.player_id);
            return {
              ...ps,
              photo_url: playerInfo?.photo_url
            };
          });
          setCupPlayerStats(mergedCupPlayers);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getTeamNameById = (teamId: number) => {
    return tableData.find(t => t.team_id === teamId)?.team_name || `Team ${teamId}`;
  };

  const getTeamPositionById = (teamId: number) => {
    const idx = tableData.findIndex(t => t.team_id === teamId);
    return idx !== -1 ? `#${idx + 1}` : '-';
  };

  const totalGoals = tableData.reduce((acc, team) => acc + team.goals_for, 0);

  const getTeamLogoById = (teamId: number) => {
    return tableData.find(t => t.team_id === teamId)?.team_logo_url;
  };

  const getLeagueLogo = (matchType?: string) => {
    if (matchType === 'champions_cup') return 'https://i.ibb.co/4wpcgDRj/IMG-4837-2.png';
    if (matchType === 'county_cup') return 'https://i.ibb.co/qMzPb2kp/IMG-4837-3.png';
    return 'https://i.ibb.co/rK2KV1FN/IMG-4837-1.png'; // league
  };

  if (loading) {
    return (
      <main className="bg-black min-h-screen text-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </main>
    );
  }

  return (
    <main className="bg-black min-h-screen text-white font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      <MainNavbar />
      
      {/* Background Section */}
      <div className="fixed inset-0 z-0">
        <Image
          src="https://i.ibb.co/YCB7X52/obraz-2026-06-13-150303737.png"
          alt="Stadium Background"
          fill
          className="object-cover brightness-[0.7]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
        
        {/* Blue/Red Splashes based on new logo */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 pt-44 pb-24 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-8">
          <div>
            <h1 className="text-white font-black text-7xl md:text-8xl leading-none uppercase italic tracking-tighter mb-2">
              {activeTab === 'league' ? 'TABELA' : activeTab === 'champions_cup' ? 'PUCHAR MISTRZÓW' : 'PUCHAR POWIATU'}
            </h1>
            <div className="flex flex-col gap-1">
              <span className="text-blue-500 font-bold text-xl uppercase tracking-wider">SEZON 2026/2027</span>
              <div className="flex flex-col">
                <span className="text-white/40 font-bold text-sm uppercase tracking-[0.2em]">
                  {activeTab === 'league' ? '1 LIGA DZIAŁDOWSKA' : activeTab === 'champions_cup' ? 'ELITARNE ROZGRYWKI' : 'TURNIEJ REGIONALNY'}
                </span>
                <span className="text-[10px] font-black tracking-[0.3em] text-white/20 uppercase italic mt-1">
                  Istniejemy od 2024 roku • 10.04.2026 wznowiono prace nad ligą
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 flex-wrap">
             <TopStatItem icon={<Users className="w-6 h-6 text-blue-400" />} label="DRUŻYN" value={stats?.total_teams || 6} />
             <TopStatItem icon={<CircleDot className="w-6 h-6 text-blue-400" />} label="ZAWODNIKÓW" value={stats?.total_players || 48} />
             <TopStatItem icon={<Calendar className="w-6 h-6 text-blue-400" />} label="KOLEJKI" value={3} />
             <TopStatItem icon={<Activity className="w-6 h-6 text-blue-400" />} label="MECZÓW" value={stats?.total_matches || 9} />
             <TopStatItem icon={<Goal className="w-6 h-6 text-blue-400" />} label="BRAMEK" value={totalGoals} />
          </div>
        </div>

        {activeTab === 'league' ? (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 items-start">
              <div className="flex flex-col gap-4">
                {/* List of Team Cards */}
                <div className="flex flex-col gap-4">
                  {tableData.map((team, index) => {
                    const diff = team.goals_for - team.goals_against;
                    
                    return (
                      <Link 
                        href={`/klub/${team.team_id}`}
                        key={team.team_id}
                        className="relative bg-white/[0.03] backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 sm:p-8 flex items-center justify-between shadow-[0_30px_60px_rgba(0,0,0,0.4)] transition-all duration-500 hover:bg-white/[0.06] hover:border-white/10 group overflow-hidden"
                      >
                        {/* Inner Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="flex items-center gap-6 sm:gap-8 flex-1 relative z-10">
                          {/* Position Circle */}
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shrink-0 shadow-2xl ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-black shadow-yellow-500/30 scale-110' :
                            index === 1 ? 'bg-gradient-to-br from-slate-200 via-slate-400 to-slate-500 text-black shadow-slate-400/20' :
                            index === 2 ? 'bg-gradient-to-br from-orange-600 via-orange-800 to-orange-900 text-white shadow-orange-800/20' :
                            'bg-white/[0.05] text-white/40 border border-white/10'
                          }`}>
                            {index + 1}
                          </div>
                          
                          {/* Selection indicator line */}
                          {(index === 0 || index === 1) && (
                            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-green-500 rounded-r-full shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                          )}
                          {(index === 2 || index === 3) && (
                            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-blue-500 rounded-r-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                          )}

                          {/* Logo and Name */}
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 relative shrink-0 group-hover:scale-110 transition-transform duration-700 ease-out">
                              <img src={team.team_logo_url} alt="" className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tighter leading-none group-hover:text-blue-400 transition-colors duration-300 italic uppercase">
                              {team.team_name}
                            </h3>
                          </div>
                        </div>

                        {/* Stats Section */}
                        <div className="flex items-center gap-6 sm:gap-12 relative z-10">
                          <div className="flex items-center gap-0 bg-white/[0.02] rounded-2xl p-2 border border-white/5 group-hover:bg-white/[0.05] transition-colors">
                            <StatBox label="M" value={team.played} />
                            <StatBox label="W" value={team.won} color="text-green-500" border />
                            <StatBox label="R" value={team.drawn} color="text-yellow-500" border />
                            <StatBox label="P" value={team.lost} color="text-red-500" border />
                            <StatBox label="+/-" value={diff > 0 ? `+${diff}` : diff} color={diff > 0 ? 'text-green-500' : diff < 0 ? 'text-red-500' : 'text-white'} border wide />
                          </div>

                          {/* Points Box */}
                          <div className="bg-gradient-to-br from-blue-600 to-blue-800 border border-white/20 rounded-2xl px-6 py-3 sm:py-4 flex flex-col items-center min-w-[70px] sm:min-w-[100px] shadow-[0_10px_30px_rgba(37,99,235,0.3)] group-hover:scale-105 transition-transform duration-500">
                            <span className="text-2xl sm:text-4xl font-black text-white leading-none tracking-tighter italic">{team.points}</span>
                            <span className="text-[9px] sm:text-[11px] text-white/60 font-black uppercase tracking-[0.2em] mt-1.5">PKT</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap gap-6 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-1 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">AWANS DO PUCHARU MISTRZÓW</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-1 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">AWANS DO BARAŻY</span>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="flex flex-col gap-6">
                <Card title="NASTĘPNA KOLEJKA" icon={<Calendar className="w-4 h-4 text-blue-400" />}>
                  {upcomingMatches.length > 0 ? (
                    <div className="flex flex-col items-center">
                      <div className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em] mb-8 w-full border-b border-white/10 pb-4">
                        {new Date(upcomingMatches[0].scheduled_at).toLocaleString('pl-PL', {
                          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                      <div className="flex items-center justify-between w-full mb-8 px-2">
                        <div className="flex flex-col items-center gap-4 flex-1">
                          <div className="w-16 h-16 relative">
                            <img src={getTeamLogoById(upcomingMatches[0].home_team_id)} alt="" className="w-full h-full object-contain drop-shadow-lg" />
                          </div>
                          <span className="text-[11px] font-black text-white/80 tracking-tight text-center leading-tight min-h-[2em] flex items-center">{getTeamNameById(upcomingMatches[0].home_team_id)}</span>
                          <span className="text-[9px] font-black text-white/20 tracking-[0.2em]">{getTeamPositionById(upcomingMatches[0].home_team_id)}</span>
                        </div>
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-10 h-10 relative">
                            <img src={getLeagueLogo(upcomingMatches[0].match_type)} alt="" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                          </div>
                          <div className="bg-blue-600/20 border border-blue-500/20 rounded-2xl px-5 py-3 flex items-center justify-center shadow-2xl">
                            <span className="text-blue-400 font-black text-xl italic tracking-tighter">VS</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-4 flex-1">
                          <div className="w-16 h-16 relative">
                            <img src={getTeamLogoById(upcomingMatches[0].away_team_id)} alt="" className="w-full h-full object-contain drop-shadow-lg" />
                          </div>
                          <span className="text-[11px] font-black text-white/80 tracking-tight text-center leading-tight min-h-[2em] flex items-center">{getTeamNameById(upcomingMatches[0].away_team_id)}</span>
                          <span className="text-[9px] font-black text-white/20 tracking-[0.2em]">{getTeamPositionById(upcomingMatches[0].away_team_id)}</span>
                        </div>
                      </div>
                      <button className="w-full bg-blue-600/10 hover:bg-blue-600 border border-blue-500/20 text-blue-400 hover:text-white font-black py-4 rounded-2xl text-[11px] transition-all uppercase tracking-[0.2em] shadow-lg">
                        ZOBACZ PEŁNY TERMINARZ
                      </button>
                    </div>
                  ) : (
                    <div className="py-10 flex flex-col items-center justify-center text-white/20">
                      <Calendar className="w-10 h-10 mb-3 opacity-10" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Brak zaplanowanych meczy</span>
                    </div>
                  )}
                </Card>

                <Card title="OSTATNIE WYNIKI" icon={<Activity className="w-4 h-4 text-blue-400" />}>
                  {matches.length > 0 ? (
                    <>
                      <div className="flex flex-col gap-0 -mx-8 -mb-8">
                        {matches.slice(0, 3).map((m, i) => (
                          <div key={i} className="flex flex-col border-b border-white/10 last:border-0 hover:bg-white/[0.02] transition-colors">
                            <div className="text-[9px] text-white/20 font-black px-8 py-3 uppercase tracking-[0.2em] bg-white/[0.01] flex justify-between">
                              <span>{new Date(m.scheduled_at).toLocaleDateString('pl-PL')}</span>
                              <span className="text-green-500/50">ZAKOŃCZONY</span>
                            </div>
                            <div className="flex items-center justify-between p-8">
                              <div className="flex flex-col items-center gap-3 flex-1">
                                <img src={getTeamLogoById(m.home_team_id)} alt="" className="w-10 h-10 object-contain drop-shadow-md" />
                                <span className="text-[10px] font-black text-white/60 truncate max-w-[80px]">{m.home_team_name}</span>
                              </div>
                              <div className="flex flex-col items-center mx-4 gap-2">
                                <div className="w-6 h-6 relative opacity-30">
                                  <img src={getLeagueLogo(m.match_type)} alt="" className="w-full h-full object-contain" />
                                </div>
                                <div className="bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2 shadow-xl group-hover:border-blue-500/30 transition-colors">
                                  <span className="text-white font-black text-xl italic tracking-tighter">{m.home_score}:{m.away_score}</span>
                                </div>
                              </div>
                              <div className="flex flex-col items-center gap-3 flex-1">
                                <img src={getTeamLogoById(m.away_team_id)} alt="" className="w-10 h-10 object-contain drop-shadow-md" />
                                <span className="text-[10px] font-black text-white/60 truncate max-w-[80px]">{m.away_team_name}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button className="w-full text-blue-400 font-black text-[10px] uppercase tracking-[0.3em] mt-12 hover:text-white transition-all flex items-center justify-center gap-3 group">
                        ZOBACZ WSZYSTKIE WYNIKI <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </>
                  ) : (
                    <div className="py-10 flex flex-col items-center justify-center text-white/20">
                      <Activity className="w-10 h-10 mb-3 opacity-10" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Brak rozegranych meczy</span>
                    </div>
                  )}
                </Card>
              </div>
            </div>

            {/* Bottom Section: Player Statistics */}
            <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
              <Card title="TOP STRZELCY" icon={<Goal className="w-5 h-5 text-blue-400" />}>
                {playerStats.filter(p => p.goals > 0).length > 0 ? (
                  <div className="flex flex-col gap-0 -mx-10 -mb-10">
                    {playerStats
                      .filter(p => p.goals > 0)
                      .sort((a, b) => b.goals - a.goals)
                      .slice(0, 5)
                      .map((p, i) => (
                      <Link 
                        key={i} 
                        href={`/gracz/${p.player_name.replace(/\s+/g, '-').toLowerCase()}`}
                        className="flex items-center justify-between p-10 px-12 border-b border-white/5 last:border-0 hover:bg-white/[0.04] transition-all group/item"
                      >
                        <div className="flex items-center gap-6">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 shadow-xl ${
                            i === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black scale-110 shadow-yellow-500/30' : 
                            'bg-white/[0.1] text-white/60 border border-white/10'
                          }`}>
                            {i + 1}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 relative rounded-full overflow-hidden bg-white/5 border border-white/10 shrink-0">
                              <Image 
                                src={p.photo_url || "https://i.ibb.co/S7RD8ZHj/images-removebg-preview-1.png"} 
                                alt="" 
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-lg font-black text-white group-hover/item:text-blue-400 transition-colors leading-none tracking-tight uppercase italic">{p.player_name}</span>
                              <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] mt-1">{p.team_name}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center bg-white/[0.04] border border-white/10 rounded-xl w-14 h-14 shadow-2xl group-hover/item:bg-blue-600 transition-all duration-500">
                          <span className="text-3xl font-black text-white italic tracking-tighter">{p.goals}</span>
                        </div>
                      </Link>
                    ))}
                    <Link href="/statystyki?tab=goals" className="w-full text-blue-400 font-black text-[11px] uppercase tracking-[0.4em] py-10 hover:text-white transition-all flex items-center justify-center gap-4 group border-t border-white/10 hover:bg-white/[0.02]">
                      ZOBACZ PEŁNĄ KLASYFIKACJĘ <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </Link>
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-white/20">
                    <Goal className="w-12 h-12 mb-4 opacity-10" />
                    <span className="text-sm font-black uppercase tracking-[0.2em]">Brak danych</span>
                  </div>
                )}
              </Card>

              <Card title="TOP ASYSTENCI" icon={<Users className="w-5 h-5 text-blue-400" />}>
                {playerStats.filter(p => p.assists > 0).length > 0 ? (
                  <div className="flex flex-col gap-0 -mx-10 -mb-10">
                    {playerStats
                      .filter(p => p.assists > 0)
                      .sort((a, b) => b.assists - a.assists)
                      .slice(0, 5)
                      .map((p, i) => (
                      <Link 
                        key={i} 
                        href={`/gracz/${p.player_name.replace(/\s+/g, '-').toLowerCase()}`}
                        className="flex items-center justify-between p-10 px-12 border-b border-white/5 last:border-0 hover:bg-white/[0.04] transition-all group/item"
                      >
                        <div className="flex items-center gap-6">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 shadow-xl ${
                            i === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black scale-110 shadow-yellow-500/30' : 
                            'bg-white/[0.1] text-white/60 border border-white/10'
                          }`}>
                            {i + 1}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 relative rounded-full overflow-hidden bg-white/5 border border-white/10 shrink-0">
                              <Image 
                                src={p.photo_url || "https://i.ibb.co/S7RD8ZHj/images-removebg-preview-1.png"} 
                                alt="" 
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-lg font-black text-white group-hover/item:text-blue-400 transition-colors leading-none tracking-tight uppercase italic">{p.player_name}</span>
                              <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] mt-1">{p.team_name}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center bg-white/[0.04] border border-white/10 rounded-xl w-14 h-14 shadow-2xl group-hover/item:bg-blue-600 transition-all duration-500">
                          <span className="text-3xl font-black text-white italic tracking-tighter">{p.assists}</span>
                        </div>
                      </Link>
                    ))}
                    <Link href="/statystyki?tab=assists" className="w-full text-blue-400 font-black text-[11px] uppercase tracking-[0.4em] py-10 hover:text-white transition-all flex items-center justify-center gap-4 group border-t border-white/10 hover:bg-white/[0.02]">
                      ZOBACZ PEŁNĄ KLASYFIKACJĘ <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </Link>
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-white/20">
                    <Users className="w-12 h-12 mb-4 opacity-10" />
                    <span className="text-sm font-black uppercase tracking-[0.2em]">Brak danych</span>
                  </div>
                )}
              </Card>

              <Card title="PUNKTACJA KANADYJSKA" icon={<Trophy className="w-5 h-5 text-yellow-500" />}>
                {playerStats.filter(p => (p.goals + p.assists) > 0).length > 0 ? (
                  <div className="flex flex-col gap-0 -mx-10 -mb-10">
                    {playerStats
                      .filter(p => (p.goals + p.assists) > 0)
                      .sort((a, b) => (b.goals + b.assists) - (a.goals + a.assists))
                      .slice(0, 5)
                      .map((p, i) => (
                      <Link 
                        key={i} 
                        href={`/gracz/${p.player_name.replace(/\s+/g, '-').toLowerCase()}`}
                        className="flex items-center justify-between p-10 px-12 border-b border-white/5 last:border-0 hover:bg-white/[0.04] transition-all group/item"
                      >
                        <div className="flex items-center gap-6">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 shadow-xl ${
                            i === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black scale-110 shadow-yellow-500/30' : 
                            'bg-white/[0.1] text-white/60 border border-white/10'
                          }`}>
                            {i + 1}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 relative rounded-full overflow-hidden bg-white/5 border border-white/10 shrink-0">
                              <Image 
                                src={p.photo_url || "https://i.ibb.co/S7RD8ZHj/images-removebg-preview-1.png"} 
                                alt="" 
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-lg font-black text-white group-hover/item:text-blue-400 transition-colors leading-none tracking-tight uppercase italic">{p.player_name}</span>
                              <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] mt-1">{p.goals} G + {p.assists} A</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 border border-white/20 rounded-xl w-14 h-14 shadow-2xl">
                          <span className="text-3xl font-black text-white italic tracking-tighter">{p.goals + p.assists}</span>
                        </div>
                      </Link>
                    ))}
                    <Link href="/statystyki?tab=canadian" className="w-full text-blue-400 font-black text-[11px] uppercase tracking-[0.4em] py-10 hover:text-white transition-all flex items-center justify-center gap-4 group border-t border-white/10 hover:bg-white/[0.02]">
                      ZOBACZ PEŁNĄ KLASYFIKACJĘ <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </Link>
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-white/20">
                    <Trophy className="w-12 h-12 mb-4 opacity-10" />
                    <span className="text-sm font-black uppercase tracking-[0.2em]">Brak danych</span>
                  </div>
                )}
              </Card>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-12 w-full">
            <TournamentBracket 
              matches={cupMatches.filter(m => m.match_type === activeTab)} 
              getLogo={getTeamLogoById}
              type={activeTab}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
              <Card title="TOP STRZELCY" icon={<Goal className="w-5 h-5 text-blue-400" />}>
                {cupPlayerStats.filter(p => p.match_type === activeTab && p.goals > 0).length > 0 ? (
                  <div className="flex flex-col gap-0 -mx-10 -mb-10">
                    {cupPlayerStats
                      .filter(p => p.match_type === activeTab && p.goals > 0)
                      .sort((a, b) => b.goals - a.goals)
                      .slice(0, 5)
                      .map((p, i) => (
                      <Link 
                        key={i} 
                        href={`/gracz/${p.player_name.replace(/\s+/g, '-').toLowerCase()}`}
                        className="flex items-center justify-between p-10 px-12 border-b border-white/5 last:border-0 hover:bg-white/[0.04] transition-all group/item"
                      >
                        <div className="flex items-center gap-6">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 shadow-xl ${
                            i === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black scale-110 shadow-yellow-500/30' : 
                            'bg-white/[0.1] text-white/60 border border-white/10'
                          }`}>
                            {i + 1}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 relative rounded-full overflow-hidden bg-white/5 border border-white/10 shrink-0">
                              <Image 
                                src={p.photo_url || "https://i.ibb.co/S7RD8ZHj/images-removebg-preview-1.png"} 
                                alt="" 
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-lg font-black text-white group-hover/item:text-blue-400 transition-colors leading-none tracking-tight uppercase italic">{p.player_name}</span>
                              <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] mt-1">{p.team_name}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center bg-white/[0.04] border border-white/10 rounded-xl w-14 h-14 shadow-2xl group-hover/item:bg-blue-600 transition-all duration-500">
                          <span className="text-3xl font-black text-white italic tracking-tighter">{p.goals}</span>
                        </div>
                      </Link>
                    ))}
                    <Link href={`/statystyki?tab=goals&type=${activeTab}`} className="w-full text-blue-400 font-black text-[11px] uppercase tracking-[0.4em] py-10 hover:text-white transition-all flex items-center justify-center gap-4 group border-t border-white/10 hover:bg-white/[0.02]">
                      ZOBACZ PEŁNĄ KLASYFIKACJĘ <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </Link>
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-white/20">
                    <Goal className="w-12 h-12 mb-4 opacity-10" />
                    <span className="text-sm font-black uppercase tracking-[0.2em]">Brak danych</span>
                  </div>
                )}
              </Card>

              <Card title="TOP ASYSTENCI" icon={<Users className="w-5 h-5 text-blue-400" />}>
                {cupPlayerStats.filter(p => p.match_type === activeTab && p.assists > 0).length > 0 ? (
                  <div className="flex flex-col gap-0 -mx-10 -mb-10">
                    {cupPlayerStats
                      .filter(p => p.match_type === activeTab && p.assists > 0)
                      .sort((a, b) => b.assists - a.assists)
                      .slice(0, 5)
                      .map((p, i) => (
                      <Link 
                        key={i} 
                        href={`/gracz/${p.player_name.replace(/\s+/g, '-').toLowerCase()}`}
                        className="flex items-center justify-between p-10 px-12 border-b border-white/5 last:border-0 hover:bg-white/[0.04] transition-all group/item"
                      >
                        <div className="flex items-center gap-6">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 shadow-xl ${
                            i === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black scale-110 shadow-yellow-500/30' : 
                            'bg-white/[0.1] text-white/60 border border-white/10'
                          }`}>
                            {i + 1}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 relative rounded-full overflow-hidden bg-white/5 border border-white/10 shrink-0">
                              <Image 
                                src={p.photo_url || "https://i.ibb.co/S7RD8ZHj/images-removebg-preview-1.png"} 
                                alt="" 
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-lg font-black text-white group-hover/item:text-blue-400 transition-colors leading-none tracking-tight uppercase italic">{p.player_name}</span>
                              <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] mt-1">{p.team_name}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center bg-white/[0.04] border border-white/10 rounded-xl w-14 h-14 shadow-2xl group-hover/item:bg-blue-600 transition-all duration-500">
                          <span className="text-3xl font-black text-white italic tracking-tighter">{p.assists}</span>
                        </div>
                      </Link>
                    ))}
                    <Link href={`/statystyki?tab=assists&type=${activeTab}`} className="w-full text-blue-400 font-black text-[11px] uppercase tracking-[0.4em] py-10 hover:text-white transition-all flex items-center justify-center gap-4 group border-t border-white/10 hover:bg-white/[0.02]">
                      ZOBACZ PEŁNĄ KLASYFIKACJĘ <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </Link>
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-white/20">
                    <Users className="w-12 h-12 mb-4 opacity-10" />
                    <span className="text-sm font-black uppercase tracking-[0.2em]">Brak danych</span>
                  </div>
                )}
              </Card>

              <Card title="PUNKTACJA KANADYJSKA" icon={<Trophy className="w-5 h-5 text-yellow-500" />}>
                {cupPlayerStats.filter(p => p.match_type === activeTab && (p.goals + p.assists) > 0).length > 0 ? (
                  <div className="flex flex-col gap-0 -mx-10 -mb-10">
                    {cupPlayerStats
                      .filter(p => p.match_type === activeTab && (p.goals + p.assists) > 0)
                      .sort((a, b) => (b.goals + b.assists) - (a.goals + a.assists))
                      .slice(0, 5)
                      .map((p, i) => (
                      <Link 
                        key={i} 
                        href={`/gracz/${p.player_name.replace(/\s+/g, '-').toLowerCase()}`}
                        className="flex items-center justify-between p-10 px-12 border-b border-white/5 last:border-0 hover:bg-white/[0.04] transition-all group/item"
                      >
                        <div className="flex items-center gap-6">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 shadow-xl ${
                            i === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black scale-110 shadow-yellow-500/30' : 
                            'bg-white/[0.1] text-white/60 border border-white/10'
                          }`}>
                            {i + 1}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 relative rounded-full overflow-hidden bg-white/5 border border-white/10 shrink-0">
                              <Image 
                                src={p.photo_url || "https://i.ibb.co/S7RD8ZHj/images-removebg-preview-1.png"} 
                                alt="" 
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-lg font-black text-white group-hover/item:text-blue-400 transition-colors leading-none tracking-tight uppercase italic">{p.player_name}</span>
                              <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] mt-1">{p.goals} G + {p.assists} A</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 border border-white/20 rounded-xl w-14 h-14 shadow-2xl">
                          <span className="text-3xl font-black text-white italic tracking-tighter">{p.goals + p.assists}</span>
                        </div>
                      </Link>
                    ))}
                    <Link href={`/statystyki?tab=canadian&type=${activeTab}`} className="w-full text-blue-400 font-black text-[11px] uppercase tracking-[0.4em] py-10 hover:text-white transition-all flex items-center justify-center gap-4 group border-t border-white/10 hover:bg-white/[0.02]">
                      ZOBACZ PEŁNĄ KLASYFIKACJĘ <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </Link>
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-white/20">
                    <Trophy className="w-12 h-12 mb-4 opacity-10" />
                    <span className="text-sm font-black uppercase tracking-[0.2em]">Brak danych</span>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}

function TournamentBracket({ matches, getLogo, type }: { matches: Match[], getLogo: (id: number) => string | undefined, type: string }) {
  const rounds = useMemo(() => {
    const grouped = matches.reduce((acc: { [key: number]: Match[] }, match) => {
      const round = match.round || 1;
      if (!acc[round]) acc[round] = [];
      acc[round].push(match);
      return acc;
    }, {});

    let roundNames: any = { 4: '1/8 Finału', 3: 'Ćwierćfinały', 2: 'Półfinały', 1: 'Finał' };
    
    // Based on the database structure seen in Terminarz, round 1 is the Final
    // and round 2 is Semifinals. Sorting ascending puts Final on the left.
    if (type === 'champions_cup') {
      roundNames = { 2: 'Półfinały', 1: 'Finał' };
    } else if (type === 'county_cup') {
      roundNames = { 4: '1/8 Finału', 3: 'Ćwierćfinały', 2: 'Półfinały', 1: 'Finał' };
    }
    
    return Object.entries(grouped)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([round, roundMatches]) => ({
        name: roundNames[round] || `Runda ${round}`,
        matches: roundMatches
      }));
  }, [matches, type]);

  if (matches.length === 0) {
    return (
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-24 flex flex-col items-center justify-center text-center shadow-2xl">
        <Trophy className="w-20 h-20 text-white/5 mb-8" />
        <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white/20">Brak zaplanowanych meczów</h3>
        <p className="text-white/10 font-bold uppercase tracking-[0.2em] mt-4 text-xs">Drabinka pucharowa zostanie wygenerowana wkrótce</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start justify-center overflow-x-auto pb-12 px-4 scrollbar-hide py-10">
      {rounds.map((round, roundIdx) => (
        <div key={roundIdx} className="flex flex-col gap-12 min-w-[320px]">
          <div className="text-center">
             <span className="text-[12px] font-black text-blue-500 uppercase tracking-[0.5em] italic shrink-0">{round.name}</span>
          </div>
          
          <div className={cn(
            "flex flex-col gap-12 h-full justify-around",
            roundIdx === 1 ? "pt-16 pb-16" : 
            roundIdx === 2 ? "pt-32 pb-32" : 
            roundIdx === 3 ? "pt-48 pb-48" : ""
          )}>
            {round.matches.map((match, mIdx) => (
              <div key={mIdx} className="relative">
                <Link 
                  href={`/mecz/${match.id}`}
                  className="block bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:bg-white/[0.05] hover:border-blue-500/30 transition-all duration-500 shadow-2xl group w-full"
                >
                  <div className="flex flex-col">
                    <BracketTeam 
                      name={match.home_team_name} 
                      logo={getLogo(match.home_team_id)} 
                      score={match.home_score} 
                      isWinner={match.status === 'finished' && match.home_score > match.away_score} 
                    />
                    <div className="h-px bg-white/5 w-full" />
                    <BracketTeam 
                      name={match.away_team_name} 
                      logo={getLogo(match.away_team_id)} 
                      score={match.away_score} 
                      isWinner={match.status === 'finished' && match.away_score > match.home_score} 
                    />
                  </div>
                  
                  {match.status === 'finished' ? (
                    <div className="bg-blue-600/10 py-2 px-4 flex items-center justify-center border-t border-white/5">
                      <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest italic">Wynik końcowy</span>
                    </div>
                  ) : (
                    <div className="bg-white/5 py-2 px-4 flex items-center justify-center border-t border-white/5">
                      <span className="text-[8px] font-black text-white/30 uppercase tracking-widest italic">
                        {match.scheduled_at ? (
                          <>
                            {new Date(match.scheduled_at).toLocaleDateString()} @ {new Date(match.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </>
                        ) : 'Termin do ustalenia'}
                      </span>
                    </div>
                  )}
                </Link>

                {/* Vertical Connector lines - simplified for robust layout */}
                {roundIdx < rounds.length - 1 && (
                  <div className="hidden lg:block absolute -right-8 top-1/2 w-8 h-px bg-white/20" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function BracketTeam({ name, logo, score, isWinner }: { name: string, logo?: string, score: number, isWinner: boolean }) {
  return (
    <div className={cn(
      "flex items-center justify-between p-4 transition-all duration-500",
      isWinner ? "bg-blue-600/5" : ""
    )}>
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={cn(
          "w-10 h-10 rounded-lg bg-black/40 border p-2 flex items-center justify-center shrink-0 transition-all duration-500",
          isWinner ? "border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "border-white/5"
        )}>
          <img src={logo || 'https://i.ibb.co/rK2KV1FN/IMG-4837-1.png'} alt="" className="w-full h-full object-contain" />
        </div>
        <span className={cn(
          "text-sm font-black uppercase tracking-tight italic truncate transition-all duration-500",
          isWinner ? "text-white scale-105 origin-left" : "text-white/40"
        )}>
          {name}
        </span>
      </div>
      <div className={cn(
        "w-12 text-right font-black italic text-xl transition-all duration-500",
        isWinner ? "text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "text-white/20"
      )}>
        {score !== null && score !== undefined ? score : '-'}
      </div>
    </div>
  );
}

function TopStatItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/5 p-6 rounded-[2rem] flex flex-col items-center text-center min-w-[150px] shadow-2xl relative overflow-hidden group hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-1">
      <div className="mb-4 p-3 rounded-xl bg-blue-600/5 border border-blue-500/10 group-hover:scale-110 group-hover:bg-blue-600/10 transition-all duration-500">
        {icon}
      </div>
      <div className="flex flex-col relative z-10">
        <span className="text-3xl font-black text-white leading-none tracking-tighter italic drop-shadow-md">{value}</span>
        <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter mt-2">{label}</span>
      </div>
    </div>
  );
}

function MVPStat({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
        <span className="text-2xl font-black text-white italic">{value}</span>
        <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">{label}</span>
    </div>
  );
}

function Card({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-10 shadow-[0_30px_60px_rgba(0,0,0,0.4)] relative overflow-hidden group hover:bg-white/[0.06] transition-all duration-500">
      {/* Subtle shine effect */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <h3 className="text-blue-500 font-black text-[12px] uppercase tracking-[0.3em] mb-10 flex items-center gap-5 border-b border-white/5 pb-8">
         <span className="p-3 bg-blue-600/5 rounded-xl border border-blue-500/10 shadow-lg">{icon}</span> {title}
      </h3>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

function StatBox({ label, value, color = "text-white", border = false, wide = false }: { label: string, value: string | number, color?: string, border?: boolean, wide?: boolean }) {
  return (
    <div className={`flex flex-col items-center ${wide ? 'w-10 sm:w-16' : 'w-10 sm:w-12'} ${border ? 'border-l border-white/20' : ''}`}>
      <span className="text-[8px] sm:text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mb-1.5">{label}</span>
      <span className={`text-sm sm:text-lg font-black ${color} leading-none italic drop-shadow-sm`}>{value}</span>
    </div>
  );
}

function SideTeam({ logo, name }: { logo?: string, name: string }) {
  return (
    <div className="flex flex-col items-center gap-3 flex-1">
      <div className="w-16 h-16 rounded-xl bg-black/20 border border-white/5 p-3 flex items-center justify-center shadow-lg">
        <img src={logo} alt="" className="w-full h-full object-contain" />
      </div>
      <span className="text-[9px] font-bold uppercase text-center text-white/60 tracking-tight leading-tight max-w-[80px]">{name}</span>
    </div>
  );
}
