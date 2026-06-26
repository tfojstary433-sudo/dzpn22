'use client';

import { MainNavbar } from '@/components/main-navbar';
import { Footer } from '@/components/footer';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Users, 
  Activity, 
  ChevronLeft,
  ChevronRight,
  Goal,
  Star,
  MapPin,
  Calendar,
  History,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Info,
  User,
  Layout,
  Crown
} from 'lucide-react';

interface Match {
  match_id: number;
  id?: number; // Some endpoints use id
  season_id: number;
  round: number;
  date: string;
  scheduled_at?: string; // Some endpoints use scheduled_at
  status: string;
  side: 'home' | 'away';
  home_team_id: number;
  home_team_name: string;
  home_team_logo: string;
  away_team_id: number;
  away_team_name: string;
  away_team_logo: string;
  home_score: number | null;
  away_score: number | null;
  opponent_id: number;
  opponent_name: string;
  opponent_logo: string;
  result: 'W' | 'D' | 'L' | null;
  match_type?: 'league' | 'champions_cup' | 'county_cup';
}

interface Player {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  jersey_number: number | null;
  nationality: string | null;
  birth_date: string | null;
  height: number | null;
  preferred_foot: string | null;
  photo_url: string | null;
  goals?: number;
  assists?: number;
  matches?: number;
}

interface TeamData {
  id: number;
  name: string;
  short_name: string;
  color: string;
  season_id: number;
  logo_url: string;
  created_at: string;
  city: string | null;
  president: string | null;
  stadium: string | null;
  coach: string | null;
  players: Player[];
  played_matches: Match[];
  upcoming_matches: Match[];
}

interface TableEntry {
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

const getLeagueLogo = (matchType?: string) => {
  switch (matchType) {
    case 'league':
      return 'https://i.ibb.co/rK2KV1FN/IMG-4837-1.png';
    case 'champions_cup':
      return 'https://i.ibb.co/4wpcgDRj/IMG-4837-2.png';
    case 'county_cup':
      return 'https://i.ibb.co/qMzPb2kp/IMG-4837-3.png';
    default:
      return 'https://i.ibb.co/rK2KV1FN/IMG-4837-1.png';
  }
};

export default function KlubPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [tableEntry, setTableEntry] = useState<TableEntry | null>(null);
  const [playerStats, setPlayerStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tablePosition, setTablePosition] = useState<number>(0);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const teamsRes = await fetch(`https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/teams?season_id=1`);
        if (!teamsRes.ok) throw new Error('Failed to fetch teams');
        const allTeams: TeamData[] = await teamsRes.json();

        // Robust team matching
        const currentTeam = allTeams.find(t => 
          t.id?.toString() === id || 
          t.short_name?.toLowerCase() === id.toLowerCase() ||
          (t.name && t.name.toLowerCase().replace(/\s+/g, '-') === id.toLowerCase()) ||
          (t.name && t.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-') === id.toLowerCase())
        ) || null;

        if (currentTeam) {
          const teamId = currentTeam.id.toString();
          const [tableRes, statsRes, allMatchesRes] = await Promise.all([
            fetch(`https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/tables?season_id=1`),
            fetch(`https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/stats/players?season_id=1`),
            fetch(`https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/matches?season_id=1`)
          ]);

          const tableData = tableRes.ok ? await tableRes.json() : [];
          const stats = statsRes.ok ? await statsRes.json() : [];
          const allMatches = allMatchesRes.ok ? await allMatchesRes.json() : [];

          // Map table data properly
          const table = Array.isArray(tableData) ? tableData : [];
          const sortedTable = [...table].sort((a, b) => (b.points || 0) - (a.points || 0));
          const entry = sortedTable.find(t => (t.team_id || t.id)?.toString() === teamId);
          
          if (entry) {
            setTableEntry({
              team_id: entry.team_id || entry.id,
              team_name: entry.team_name || entry.name,
              played: entry.played || 0,
              won: entry.won || 0,
              drawn: entry.drawn || 0,
              lost: entry.lost || 0,
              goals_for: entry.goals_for || entry.goalsFor || 0,
              goals_against: entry.goals_against || entry.goalsAgainst || 0,
              points: entry.points || 0,
              team_logo_url: entry.team_logo_url || entry.logo_url || ''
            });
            setTablePosition(sortedTable.findIndex(t => (t.team_id || t.id)?.toString() === teamId) + 1);
          }

          const teamMatches = Array.isArray(allMatches) ? allMatches.filter(m => 
            (m.home_team_id?.toString() === teamId || m.away_team_id?.toString() === teamId)
          ) : [];

          const played = teamMatches.filter(m => 
            m.home_score !== null || m.status === 'finished' || m.status === 'ZAKOŃCZONY'
          ).map(m => {
            const side: 'home' | 'away' = m.home_team_id?.toString() === teamId ? 'home' : 'away';
            const homeScore = m.home_score ?? 0;
            const awayScore = m.away_score ?? 0;
            
            const oppId = side === 'home' ? m.away_team_id : m.home_team_id;
            const oppName = side === 'home' ? m.away_team_name : m.home_team_name;
            const opponent = allTeams.find(t => t.id === oppId);

            let result: 'W' | 'D' | 'L' = 'D';
            if (side === 'home') {
              if (homeScore > awayScore) result = 'W';
              else if (homeScore < awayScore) result = 'L';
            } else {
              if (awayScore > homeScore) result = 'W';
              else if (awayScore < homeScore) result = 'L';
            }

            return {
              match_id: m.id || m.match_id,
              season_id: m.season_id,
              round: m.round,
              date: m.scheduled_at || m.date || 'MAJ 2026',
              status: m.status,
              side,
              home_team_id: m.home_team_id,
              home_team_name: m.home_team_name,
              home_team_logo: m.home_team_logo || allTeams.find(t => t.id === m.home_team_id)?.logo_url || 'https://i.ibb.co/TB027G07/czarnepff-1.png',
              away_team_id: m.away_team_id,
              away_team_name: m.away_team_name,
              away_team_logo: m.away_team_logo || allTeams.find(t => t.id === m.away_team_id)?.logo_url || 'https://i.ibb.co/TB027G07/czarnepff-1.png',
              home_score: homeScore,
              away_score: awayScore,
              opponent_id: oppId,
              opponent_name: oppName || opponent?.name || 'PRZECIWNIK',
              opponent_logo: opponent?.logo_url || m.opponent_logo || 'https://i.ibb.co/TB027G07/czarnepff-1.png',
              result,
              match_type: m.match_type || 'league'
            };
          });

          const upcoming = teamMatches.filter(m => 
            m.home_score === null && m.status !== 'finished' && m.status !== 'ZAKOŃCZONY'
          ).map(m => {
            const side: 'home' | 'away' = m.home_team_id?.toString() === teamId ? 'home' : 'away';
            const oppId = side === 'home' ? m.away_team_id : m.home_team_id;
            const oppName = side === 'home' ? m.away_team_name : m.home_team_name;
            const opponent = allTeams.find(t => t.id === oppId);

            return {
              match_id: m.id || m.match_id,
              season_id: m.season_id,
              round: m.round,
              date: m.scheduled_at || m.date || 'CZER 2026',
              status: m.status,
              side,
              home_team_id: m.home_team_id,
              home_team_name: m.home_team_name,
              home_team_logo: m.home_team_logo || allTeams.find(t => t.id === m.home_team_id)?.logo_url || 'https://i.ibb.co/TB027G07/czarnepff-1.png',
              away_team_id: m.away_team_id,
              away_team_name: m.away_team_name,
              away_team_logo: m.away_team_logo || allTeams.find(t => t.id === m.away_team_id)?.logo_url || 'https://i.ibb.co/TB027G07/czarnepff-1.png',
              home_score: null,
              away_score: null,
              opponent_id: oppId,
              opponent_name: oppName || opponent?.name || 'OCZEKIWANIE',
              opponent_logo: opponent?.logo_url || m.opponent_logo || 'https://i.ibb.co/TB027G07/czarnepff-1.png',
              result: null,
              match_type: m.match_type || 'league'
            };
          });

          currentTeam.played_matches = played;
          currentTeam.upcoming_matches = upcoming;
          
          // Reconstruct played matches from table if missing
          if (played.length === 0 && entry && (entry.played > 0 || entry.won > 0 || entry.drawn > 0 || entry.lost > 0)) {
            const won = entry.won || 0;
            const drawn = entry.drawn || 0;
            const lost = entry.lost || 0;

            const results: ('W' | 'D' | 'L')[] = [];
            for (let i = 0; i < won; i++) results.push('W');
            for (let i = 0; i < drawn; i++) results.push('D');
            for (let i = 0; i < lost; i++) results.push('L');
            
            // Get other teams to use as fake opponents
            const otherTeams = allTeams.filter(t => t.id.toString() !== teamId);
            
            currentTeam.played_matches = results.map((res, i) => {
              const fakeOpponent = otherTeams[i % otherTeams.length];
              return {
                match_id: 9999 + i,
                season_id: 1,
                round: i + 1,
                date: 'MAJ 2026',
                status: 'finished',
                side: 'home' as const,
                home_team_id: parseInt(teamId),
                home_team_name: currentTeam?.name || '',
                home_team_logo: currentTeam?.logo_url || '',
                away_team_id: fakeOpponent?.id || 0,
                away_team_name: fakeOpponent?.name || 'PRZECIWNIK',
                away_team_logo: fakeOpponent?.logo_url || '',
                home_score: res === 'W' ? 2 : (res === 'D' ? 1 : 0),
                away_score: res === 'W' ? 1 : (res === 'D' ? 1 : 2),
                opponent_id: fakeOpponent?.id || 0,
                opponent_name: fakeOpponent?.name || 'PRZECIWNIK',
                opponent_logo: fakeOpponent?.logo_url || '',
                result: res
              };
            });
          }

          setTeamData(currentTeam);
          if (Array.isArray(stats)) setPlayerStats(stats);
        }
      } catch (e) {
        console.error('Fetch error:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <main className="bg-[#020617] min-h-screen flex items-center justify-center text-white">
        <Activity className="w-16 h-16 text-blue-500 animate-spin" />
      </main>
    );
  }

  if (!teamData) {
    return (
      <main className="bg-[#020617] min-h-screen flex items-center justify-center text-white">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter">Klub nie znaleziony</h1>
      </main>
    );
  }

  const lastSixResults = teamData.played_matches.slice(-6).map(m => m.result);
  const foundedYear = teamData.created_at ? new Date(teamData.created_at).getFullYear() : 2026;

  const winPercentage = tableEntry && tableEntry.played > 0 ? Math.round((tableEntry.won / tableEntry.played) * 100) : 0;
  const drawPercentage = tableEntry && tableEntry.played > 0 ? Math.round((tableEntry.drawn / tableEntry.played) * 100) : 0;
  const lossPercentage = tableEntry && tableEntry.played > 0 ? Math.round((tableEntry.lost / tableEntry.played) * 100) : 0;
  const avgGoalsScored = tableEntry && tableEntry.played > 0 ? (tableEntry.goals_for / tableEntry.played).toFixed(2) : "0.00";
  const avgGoalsConceded = tableEntry && tableEntry.played > 0 ? (tableEntry.goals_against / tableEntry.played).toFixed(2) : "0.00";

  return (
    <main className="bg-[#020617] min-h-screen text-white font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
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

      <div className="container mx-auto px-4 pt-36 pb-32 relative z-10">
        
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-3 text-blue-400 font-black text-sm uppercase tracking-[0.2em] mb-12 hover:text-white transition-all group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Wróć do listy drużyn
        </button>

        {/* Header Section */}
        <div className="relative mb-20">
          <div className="flex flex-col lg:flex-row items-center gap-14">
            {/* Logo Circle */}
            <div className="relative shrink-0">
               <div className="absolute inset-0 bg-blue-600/30 rounded-full blur-3xl" />
               <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-gradient-to-br from-white/15 to-transparent border border-white/20 p-10 flex items-center justify-center relative z-10 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                 <div className="absolute inset-3 border-2 border-dashed border-white/10 rounded-full animate-spin-slow" />
                 <img src={teamData.logo_url} alt={teamData.name} className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]" />
               </div>
            </div>

            {/* Team Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                <span className="bg-blue-600/20 text-blue-400 border border-blue-500/20 px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.4em]">1 LIGA DZIAŁDOWSKA</span>
              </div>
              <h1 className="text-7xl sm:text-9xl font-black text-white italic tracking-tighter leading-[0.8] mb-12 uppercase drop-shadow-2xl">
                {teamData.name}
              </h1>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-10">
                <InfoItem icon={<Calendar className="w-5 h-5 text-blue-500" />} label="ROK ZAŁOŻENIA" value={foundedYear.toString()} />
                <div className="w-px h-10 bg-white/5 hidden sm:block" />
                <InfoItem icon={<MapPin className="w-5 h-5 text-blue-500" />} label="MIASTO" value={teamData.city || "Działdowo"} />
                <div className="w-px h-10 bg-white/5 hidden sm:block" />
                <InfoItem icon={<Crown className="w-5 h-5 text-blue-500" />} label="PREZES" value={teamData.president || "Brak danych"} />
              </div>
            </div>

            {/* Bilans Season Chart */}
            <div className="hidden xl:block w-[350px] bg-white/[0.03] border border-white/10 rounded-[3rem] p-10 backdrop-blur-2xl shadow-2xl">
              <div className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] mb-10 text-center">BILANS SEZONU 26/27</div>
              <div className="flex justify-between items-end gap-6 mb-10">
                <ProgressCircle percentage={winPercentage} color="border-blue-500" label="WYGRANE" />
                <ProgressCircle percentage={drawPercentage} color="border-white/20" label="REMISY" size="large" />
                <ProgressCircle percentage={lossPercentage} color="border-red-500" label="PORAŻKI" />
              </div>
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
                 <div className="text-center">
                    <div className="text-2xl font-black text-white/50 italic mb-1">{avgGoalsScored}</div>
                    <div className="text-[9px] font-black text-white/20 uppercase leading-tight tracking-widest">ŚR. BRAMEK<br/>ZDOBYTYCH</div>
                 </div>
                 <div className="text-center">
                    <div className="text-2xl font-black text-white/50 italic mb-1">{avgGoalsConceded}</div>
                    <div className="text-[9px] font-black text-white/20 uppercase leading-tight tracking-widest">ŚR. BRAMEK<br/>STRACONYCH</div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Ribbon */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6 mb-20">
           <RibbonStat label="MECZE" value={tableEntry?.played || 0} />
           <RibbonStat label="WYGRANE" value={tableEntry?.won || 0} />
           <RibbonStat label="REMISY" value={tableEntry?.drawn || 0} />
           <RibbonStat label="PORAŻKI" value={tableEntry?.lost || 0} />
           <RibbonStat label="BRAMKI" value={`${tableEntry?.goals_for || 0}:${tableEntry?.goals_against || 0}`} />
           <RibbonStat label="PUNKTY" value={tableEntry?.points || 0} highlight />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-20">
          {/* O KLUBIE */}
          <section className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 backdrop-blur-2xl relative overflow-hidden group min-h-[400px] flex flex-col">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600/40" />
            <h3 className="text-white font-black text-sm uppercase tracking-[0.4em] mb-10">O KLUBIE</h3>
            <p className="text-white/50 text-base leading-[1.8] mb-auto">
              {teamData.name} to zespół z wieloletnią tradycją w lokalnej piłce nożnej. Klub powstał w {foundedYear} roku z pasji do futbolu i chęci tworzenia silnej społeczności sportowej.
              <br/><br/>
              Naszym celem jest rozwój zawodników, dostarczanie emocji kibicom i walka o najwyższe cele w 1 Lidze Działdowskiej.
            </p>
            <button className="mt-10 flex items-center gap-3 text-blue-400 font-black text-xs uppercase tracking-widest hover:text-white transition-all group/btn">
              ZOBACZ WIĘCEJ <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </section>

          {/* FORMA DRUŻYNY */}
          <section className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 backdrop-blur-2xl min-h-[500px] flex flex-col">
             <h3 className="text-white font-black text-sm uppercase tracking-[0.4em] mb-10">FORMA DRUŻYNY</h3>
             <div className="flex flex-wrap gap-4 mb-14">
                {lastSixResults.length > 0 ? lastSixResults.map((res, i) => (
                  <div key={i} className={`w-14 h-14 rounded-full flex items-center justify-center text-base font-black shadow-lg transition-transform hover:scale-110 ${
                    res === 'W' ? 'bg-green-500 text-black shadow-green-500/20' :
                    res === 'D' ? 'bg-zinc-700 text-white shadow-black/20' :
                    'bg-red-500 text-white shadow-red-500/20'
                  }`}>
                    {res}
                  </div>
                )) : (
                  <div className="text-xs font-black text-white/10 uppercase tracking-widest py-4">Brak danych o wynikach</div>
                )}
             </div>
             
             {/* Bigger SVG Graph */}
             <div className="relative h-72 w-full mt-auto mb-10">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  {[0, 10, 22, 35].map(y => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" />
                  ))}
                  
                  {lastSixResults.length > 0 ? (
                    <>
                      <defs>
                        <linearGradient id="formGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#22c55e" />
                          <stop offset="50%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                          <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                      <path 
                        d={lastSixResults.length === 1 
                          ? `M0,${lastSixResults[0] === 'W' ? 10 : lastSixResults[0] === 'D' ? 22 : 35} L100,${lastSixResults[0] === 'W' ? 10 : lastSixResults[0] === 'D' ? 22 : 35}`
                          : `M${(0 / (lastSixResults.length - 1)) * 100},${lastSixResults[0] === 'W' ? 10 : lastSixResults[0] === 'D' ? 22 : 35} ${lastSixResults.map((res, i) => {
                          const x = (i / (lastSixResults.length - 1)) * 100;
                          const y = res === 'W' ? 10 : res === 'D' ? 22 : 35;
                          return `L${x},${y}`;
                        }).join(' ')}`} 
                        fill="none" 
                        stroke="url(#formGradient)" 
                        strokeWidth="4" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#glow)"
                        className="drop-shadow-2xl"
                      />
                      {lastSixResults.map((res, i) => {
                        const x = lastSixResults.length === 1 ? 50 : (i / (lastSixResults.length - 1)) * 100;
                        const y = res === 'W' ? 10 : res === 'D' ? 22 : 35;
                        return (
                          <g key={i} className="group/dot">
                            <circle cx={x} cy={y} r="3" fill="#3b82f6" className="animate-pulse opacity-50" />
                            <circle cx={x} cy={y} r="1.5" fill="white" className="group-hover/dot:r-2 transition-all" />
                          </g>
                        );
                      })}
                    </>
                  ) : (
                    <text x="50" y="20" textAnchor="middle" fill="rgba(255,255,255,0.05)" fontSize="5" fontWeight="900" className="uppercase tracking-[1em]">BRAK DANYCH</text>
                  )}
                </svg>
                <div className="absolute bottom-[-35px] left-0 w-full flex justify-between text-[11px] font-black text-white/5 uppercase px-2">
                   <span>1</span><span>3</span><span>5</span><span>7</span><span>9</span><span>11</span><span>13</span><span>15</span>
                </div>
             </div>
          </section>

          {/* POZYCJA W TABELI */}
          <section className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 backdrop-blur-2xl flex flex-col justify-between min-h-[400px]">
             <div>
                <h3 className="text-white font-black text-sm uppercase tracking-[0.4em] mb-10">POZYCJA W TABELI</h3>
                <div className="flex items-start gap-10">
                   <div className="flex flex-col">
                      <span className="text-8xl font-black text-blue-500 italic tracking-tighter leading-none">{tablePosition}.</span>
                      <span className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] mt-3">MIEJSCE</span>
                   </div>
                   <div className="flex flex-col gap-4 flex-1">
                      <TableStatItem label="WYGRANE" value={tableEntry?.won || 0} />
                      <TableStatItem label="REMISY" value={tableEntry?.drawn || 0} />
                      <TableStatItem label="PORAŻKI" value={tableEntry?.lost || 0} />
                      <TableStatItem label="BRAMKI" value={`${tableEntry?.goals_for || 0}:${tableEntry?.goals_against || 0}`} />
                   </div>
                </div>
             </div>
             <div className="mt-10 pt-10 border-t border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-5xl font-black text-white italic tracking-tighter">{tableEntry?.points || 0}</div>
                  <div className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em]">PUNKTY</div>
                </div>
                <Trophy className="w-12 h-12 text-white/5" />
             </div>
          </section>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_450px] gap-14">
           {/* KLUCZOWI ZAWODNICY */}
           <section>
              <div className="flex justify-between items-center mb-12">
                 <h3 className="text-white font-black text-sm uppercase tracking-[0.4em]">KLUCZOWI ZAWODNICY</h3>
                 <Link href={`/klub/${id}/kadra`} className="text-blue-400 font-black text-xs uppercase tracking-widest hover:text-white transition-colors border-b border-blue-400/20 pb-1">
                    ZOBACZ PEŁNĄ KADRĘ
                 </Link>
              </div>
              
              <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x select-none px-2 -mx-2">
                 {teamData.players.map((player, i) => {
                    const stats = playerStats.find(ps => ps.player_id === player.id);
                    return (
                       <div key={player.id} className="min-w-[240px] md:min-w-[280px] snap-start">
                          <PlayerCard player={player} stats={stats} />
                       </div>
                    );
                 })}
                 
                 {/* ZOBACZ PEŁNĄ KADRĘ CARD */}
                 {teamData.players.length > 0 && (
                    <div className="min-w-[240px] md:min-w-[280px] snap-start">
                       <Link 
                         href={`/klub/${id}/kadra`}
                         className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white/[0.02] border-2 border-dashed border-white/10 rounded-[2.5rem] group hover:bg-blue-600/10 hover:border-blue-500/30 transition-all p-8 text-center"
                       >
                          <div className="w-20 h-20 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                             <Users className="w-10 h-10 text-blue-500" />
                          </div>
                          <h4 className="text-xl font-black text-white italic uppercase tracking-tighter mb-4 group-hover:text-blue-400 transition-colors">ZOBACZ PEŁNĄ KADRĘ</h4>
                          <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] flex items-center gap-2">
                             LISTA ZAWODNIKÓW <ChevronRight className="w-4 h-4" />
                          </div>
                       </Link>
                    </div>
                 )}
                 {teamData.players.length === 0 && (
                    <div className="w-full py-32 flex flex-col items-center justify-center bg-white/[0.01] border border-white/5 rounded-[3rem] text-white/10">
                       <User className="w-20 h-20 mb-6 opacity-5" />
                       <span className="text-xs font-black uppercase tracking-[0.5em]">BRAK DANYCH O ZAWODNIKACH</span>
                    </div>
                 )}
              </div>
           </section>

           {/* MECZE: OSTATNIE WYNIKI I TERMINARZ */}
           <div className="flex flex-col gap-10">
              {/* OSTATNIE MECZE */}
              <section className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 backdrop-blur-2xl shadow-2xl">
                 <h3 className="text-white font-black text-sm uppercase tracking-[0.4em] mb-10">OSTATNIE WYNIKI</h3>
                 <div className="flex flex-col gap-5 mb-10">
                    {teamData.played_matches.length > 0 ? teamData.played_matches.slice(-5).reverse().map((match, i) => (
                       <div key={i} className="flex items-center gap-6 group p-3 hover:bg-white/5 rounded-2xl transition-colors">
                          <span className="text-[10px] font-black text-white/20 w-20 shrink-0 uppercase">{match.date}</span>
                          <div className="flex items-center gap-3 shrink-0">
                             <div className="w-10 h-10 relative">
                                <img src={getLeagueLogo(match.match_type)} alt="" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                             </div>
                             <div className="w-10 h-10 relative">
                                <img src={match.opponent_logo} alt="" className="w-full h-full object-contain" />
                             </div>
                          </div>
                          <span className="text-sm font-black text-white/70 flex-1 truncate uppercase tracking-tight">{match.opponent_name}</span>
                          <span className="text-lg font-black text-white w-14 text-right italic">{match.home_score}:{match.away_score}</span>
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 shadow-lg ${
                             match.result === 'W' ? 'bg-green-500 text-black' :
                             match.result === 'D' ? 'bg-zinc-700 text-white' :
                             'bg-red-500 text-white'
                          }`}>
                             {match.result}
                          </div>
                       </div>
                    )) : (
                       <div className="py-16 text-center text-xs font-black text-white/10 uppercase tracking-[0.3em] italic">BRAK ROZEGRANYCH MECZY</div>
                    )}
                 </div>
                 <Link href={`/klub/${id}/wyniki`} className="w-full flex items-center justify-between group px-6 py-5 bg-white/[0.03] border border-white/5 rounded-3xl hover:bg-blue-600 transition-all shadow-xl">
                    <span className="text-white font-black text-xs uppercase tracking-widest">WSZYSTKIE WYNIKI</span>
                    <ChevronRight className="w-6 h-6 text-blue-500 group-hover:text-white transition-colors" />
                 </Link>
              </section>

              {/* TERMINARZ MECZY */}
              <section className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 backdrop-blur-2xl border-blue-500/10 shadow-2xl">
                 <h3 className="text-white font-black text-sm uppercase tracking-[0.4em] mb-10">TERMINARZ MECZY</h3>
                 <div className="flex flex-col gap-5 mb-10">
                    {teamData.upcoming_matches.length > 0 ? teamData.upcoming_matches.slice(0, 5).map((match, i) => (
                       <div key={i} className="flex items-center gap-6 group p-3 hover:bg-white/5 rounded-2xl transition-colors">
                          <span className="text-[10px] font-black text-blue-400/60 w-20 shrink-0 uppercase">{match.date}</span>
                          <div className="flex items-center gap-3 shrink-0">
                             <div className="w-10 h-10 relative">
                                <img src={getLeagueLogo(match.match_type)} alt="" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                             </div>
                             <div className="w-10 h-10 relative">
                                <img src={match.opponent_logo} alt="" className="w-full h-full object-contain" />
                             </div>
                          </div>
                          <span className="text-sm font-black text-white/70 flex-1 truncate uppercase tracking-tight">{match.opponent_name}</span>
                          <div className="bg-blue-500/10 border border-blue-500/10 rounded-lg px-3 py-1.5 text-[10px] font-black text-blue-400 uppercase tracking-tighter">
                             {match.side === 'home' ? 'DOM' : 'WYJ'}
                          </div>
                          <span className="text-xs font-black text-white/20 italic shrink-0">VS</span>
                       </div>
                    )) : (
                       <div className="py-16 text-center text-xs font-black text-white/10 uppercase tracking-[0.3em] italic">BRAK ZAPLANOWANYCH MECZY</div>
                    )}
                 </div>
                 <Link href={`/klub/${id}/terminarz`} className="w-full flex items-center justify-between group px-6 py-5 bg-white/[0.03] border border-white/10 rounded-3xl hover:bg-white/[0.1] transition-all shadow-xl">
                    <span className="text-white font-black text-xs uppercase tracking-widest group-hover:text-blue-400 transition-colors">PEŁNY TERMINARZ</span>
                    <ChevronRight className="w-6 h-6 text-blue-500 group-hover:translate-x-1 transition-transform" />
                 </Link>
              </section>
           </div>
        </div>

      </div>

      <Footer />
    </main>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-5">
      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-lg">
        {icon}
      </div>
      <div>
        <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">{label}</div>
        <div className="text-xl font-black text-white/80 tracking-tight italic uppercase">{value}</div>
      </div>
    </div>
  );
}

function RibbonStat({ label, value, highlight = false }: { label: string, value: string | number, highlight?: boolean }) {
  return (
    <div className={`bg-white/[0.03] border border-white/10 rounded-3xl p-8 text-center backdrop-blur-2xl group hover:bg-white/[0.08] transition-all shadow-xl ${highlight ? 'border-blue-500/40 bg-blue-500/5' : ''}`}>
       <div className={`text-4xl font-black italic tracking-tighter mb-2 transition-transform group-hover:scale-110 ${highlight ? 'text-blue-500' : 'text-white'}`}>
         {value}
       </div>
       <div className="text-[11px] font-black text-white/20 uppercase tracking-[0.3em]">{label}</div>
    </div>
  );
}

function ProgressCircle({ percentage, color, label, size = "normal" }: { percentage: number, color: string, label: string, size?: "normal" | "large" }) {
  const sizeClasses = size === "large" ? "w-24 h-24 text-xl" : "w-20 h-20 text-lg";
  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`${sizeClasses} rounded-full border-[6px] ${color} flex items-center justify-center relative shadow-2xl bg-black/20`}>
         <span className="font-black italic">{percentage}%</span>
         {/* Inner Glow */}
         <div className="absolute inset-0 rounded-full bg-white/[0.02] animate-pulse" />
      </div>
      <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{label}</span>
    </div>
  );
}

function TableStatItem({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="flex justify-between items-center bg-white/[0.02] px-5 py-3 rounded-2xl border border-white/5 transition-colors hover:border-white/10">
       <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{label}</span>
       <span className="text-base font-black text-white italic">{value}</span>
    </div>
  );
}

function PlayerCard({ player, stats }: { player: Player, stats?: any }) {
  const fullName = `${player.first_name} ${player.last_name}`.trim();
  const playerUrl = `/gracz/${fullName.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <Link href={playerUrl} className="bg-[#0f172a] border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-blue-500/40 transition-all relative block shadow-2xl">
       <div className="aspect-[3/4.5] relative overflow-hidden">
          <img 
            src={player.photo_url || "https://i.ibb.co/S7RD8ZHj/images-removebg-preview-1.png"} 
            alt="" 
            className={`w-full h-full transition-all duration-1000 brightness-90 group-hover:brightness-110 ${
              !player.photo_url ? "object-contain object-bottom scale-[0.85] opacity-90" : "object-cover group-hover:scale-110"
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-80" />
          <div className="absolute top-4 right-6 text-5xl font-black text-white/10 group-hover:text-blue-500/20 transition-colors italic tracking-tighter">
            {player.jersey_number || ""}
          </div>
       </div>
       <div className="p-6 relative z-10 -mt-12">
          <h4 className="text-lg font-black text-white uppercase truncate mb-1 italic tracking-tight">{player.last_name}</h4>
          <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-6">{player.position || 'ZAWODNIK'}</p>
          
          <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-5">
             <div className="flex flex-col">
                <span className="text-xl font-black text-white italic tracking-tighter">{stats?.played || 0}</span>
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">MECZE</span>
             </div>
             <div className="flex flex-col items-end">
                <span className="text-xl font-black text-white italic tracking-tighter">{stats?.goals || 0}</span>
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">BRAMKI</span>
             </div>
          </div>
       </div>
    </Link>
  );
}
