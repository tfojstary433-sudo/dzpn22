'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { teams, extraTeams } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';

import { RobloxAvatar } from '@/components/roblox-avatar';
import { PlayerField } from '@/components/player-field';
import { RadarChart } from '@/components/radar-chart';
import { RatingChart } from '@/components/rating-chart';
import { 
  ChevronLeft, 
  ChevronRight, 
  HelpCircle, 
  Star, 
  LayoutDashboard,
  Target,
  Table as TableIcon,
  Calendar,
  Users,
  BarChart2,
  ArrowRightLeft,
  History,
  Newspaper,
  Timer as TimerIcon,
  Activity,
  Award,
  TrendingUp,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Bell,
  Trophy
} from 'lucide-react';
import { calculateMarketValue, calculateMatchRating, mapPositionToPolish } from '@/lib/utils';

interface PlayerStats {
  userId: string;
  username: string;
  avatarUrl: string | null;
  currentClub: string;
  position: string;
  value: number;
  previousClubs: string[];
  parentClub?: {
    name: string;
    joinedAt: string | null;
  } | null;
  formRatings?: number[];
  lastMatchNumber?: number;
  verified?: boolean;
  country?: string;
  stats: {
    matches: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    cleanSheets?: number;
  };
  careerTransfers?: Array<{
    name: string;
    joinedAt: string;
    leftAt: string | null;
  }>;
  recentMatches: Array<{
    id?: string;
    date: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    minutes: number;
    goals: number;
    assists: number;
    yellowCards?: number;
    redCards?: number;
    rating?: number;
    league?: string;
    role?: 'starter' | 'sub';
    result?: 'W' | 'L' | 'D';
    jerseyNumber?: number;
    number?: number;
    playerTeam?: string;
    opponent?: string;
    tournamentId?: number | null;
  }>;
}

export default function GraczPage() {
  const params = useParams();
  const username = params.username as string;
  const [player, setPlayer] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statMode, setStatMode] = useState<'total' | 'per90'>('total');
  const [activeTab, setActiveTab] = useState('przegląd');
  const [selectedTournament, setSelectedTournament] = useState<'Ekstraklasa' | 'Mecze Towarzyskie'>('Ekstraklasa');
  const [isTournamentOpen, setIsTournamentOpen] = useState(false);
  const [matchPage, setMatchPage] = useState(0);
  const [history, setHistory] = useState<any>(null);
  const [tournamentPlayers, setTournamentPlayers] = useState<any[]>([]);
  const matchesPerPage = 10;

  useEffect(() => {
    async function fetchAllData() {
      try {
        setLoading(true);
        const decodedUsername = decodeURIComponent(username).trim();
        
        // Pobierz statystyki turniejowe
        try {
          const tournamentRes = await fetch('https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/api/tournament/1/players.json');
          if (tournamentRes.ok) {
            const tournamentData = await tournamentRes.json();
            setTournamentPlayers(tournamentData.players || []);
          }
        } catch (e) {
          console.error('Tournament players fetch failed:', e);
        }
        let historyData = null;
        try {
          const historyRes = await fetch('https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/players-history.json');
          if (historyRes.ok) {
            historyData = await historyRes.json();
            setHistory(historyData);
          }
        } catch (e) {
          console.error('History fetch failed:', e);
        }

        // Pobierz listę meczów
        let allMatches = [];
        try {
          const matchesRes = await fetch('https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/api/matches');
          if (matchesRes.ok) {
            allMatches = await matchesRes.json();
          }
        } catch (e) {
          console.error('Matches fetch failed:', e);
        }

        // Znajdź zawodnika w historii
        let playerFound = false;
        if (historyData && historyData.players) {
          const playerEntry = Object.values(historyData.players).find((p: any) => 
            p.name?.toLowerCase().trim() === decodedUsername.toLowerCase()
          );
          
          if (playerEntry) {
            playerFound = true;
            const p = playerEntry as any;
            const sortedMatches = [...p.matches].sort((a: any, b: any) => 
              new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()
            );
            const latestMatch = sortedMatches[0];
            const currentClub = latestMatch?.playerTeam || 'Wolny Agent';
            const oldestMatch = sortedMatches[sortedMatches.length - 1];

            // Agreguj statystyki
            let totalGoals = 0;
            let totalYellow = 0;
            let totalRed = 0;
            p.matches.forEach((m: any) => {
              totalGoals += (m.goals?.length || 0);
              m.cards?.forEach((c: any) => {
                if (c.type.includes('yellow')) totalYellow++;
                if (c.type.includes('red')) totalRed++;
              });
            });

            // Mapuj na format PlayerStats
            const mappedPlayer: PlayerStats = {
              userId: p.robloxId.toString(),
              username: p.name,
              avatarUrl: null,
              currentClub: currentClub,
              position: latestMatch?.position || '---',
              value: 0,
              country: p.country || 'PL',
              verified: true,
              previousClubs: Array.from(new Set(p.matches.map((m: any) => m.playerTeam))),
              parentClub: oldestMatch ? {
                name: oldestMatch.playerTeam,
                joinedAt: oldestMatch.playedAt
              } : null,
              formRatings: sortedMatches.slice(0, 15).map((m: any) => {
                const isWinner = (m.playerTeam === m.teamA && m.scoreA > m.scoreB) || (m.playerTeam === m.teamB && m.scoreB > m.scoreA);
                const isDraw = m.scoreA === m.scoreB;
                const result: 'W' | 'D' | 'L' = isWinner ? 'W' : (isDraw ? 'D' : 'L');
                return calculateMatchRating({
                  minutes: m.minutesPlayed || (m.role === 'starter' ? 90 : 30),
                  goals: m.goals?.length || 0,
                  assists: m.assists || 0,
                  result: result,
                  homeTeam: m.teamA,
                  awayTeam: m.teamB,
                  homeScore: m.scoreA,
                  awayScore: m.scoreB
                }, m.playerTeam, m.position);
              }).reverse(),
              stats: {
                matches: p.matches.length,
                goals: totalGoals,
                assists: 0,
                yellowCards: totalYellow,
                redCards: totalRed
              },
              recentMatches: sortedMatches.map((m: any) => {
                  const isWinner = (m.playerTeam === m.teamA && m.scoreA > m.scoreB) || (m.playerTeam === m.teamB && m.scoreB > m.scoreA);
                  const isDraw = m.scoreA === m.scoreB;
                  const result: 'W' | 'D' | 'L' = isWinner ? 'W' : (isDraw ? 'D' : 'L');
                  
                  return {
                    uuid: m.matchUuid,
                    date: m.playedAt,
                    homeTeam: m.teamA,
                    awayTeam: m.teamB,
                    homeScore: m.scoreA,
                    awayScore: m.scoreB,
                    minutes: m.minutesPlayed || (m.role === 'starter' ? 90 : 30),
                    goals: m.goals?.length || 0,
                    assists: m.assists || 0,
                    yellowCards: m.cards?.filter((c: any) => c.type.includes('yellow')).length || 0,
                    redCards: m.cards?.filter((c: any) => c.type.includes('red')).length || 0,
                    rating: calculateMatchRating({
                      minutes: m.minutesPlayed || (m.role === 'starter' ? 90 : 30),
                      goals: m.goals?.length || 0,
                      assists: m.assists || 0,
                      result: result,
                      homeTeam: m.teamA,
                      awayTeam: m.teamB,
                      homeScore: m.scoreA,
                      awayScore: m.scoreB
                    }, m.playerTeam, m.position),
                    league: m.league || m.category || (m.tournamentName) || 'Ekstraklasa',
                    role: m.role,
                    result: result,
                    wasExcluded: false,
                    playerTeam: m.playerTeam,
                    opponent: m.playerTeam === m.teamA ? m.teamB : m.teamA,
                    tournamentId: m.tournamentId
                  };
                })
                .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
            };
            
            setPlayer(mappedPlayer);
          }
        }

        if (!playerFound) {
          const res = await fetch(`/api/players/${encodeURIComponent(decodedUsername)}`);
          if (res.ok) {
            const data = await res.json();
            if (data) {
              setPlayer(data);
            } else {
              setPlayer(null);
            }
          } else {
            setPlayer(null);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setPlayer(null);
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, [username]);

  const playerHistory = useMemo(() => {
    if (!history?.players || !player) return [];
    const playerEntry = history.players[player.userId] || 
                         Object.values(history.players).find((p: any) => p.name?.toLowerCase().trim() === player.username?.toLowerCase().trim());
    return playerEntry?.matches || [];
  }, [history, player]);

  const structuredCareer = useMemo(() => {
    if (!playerHistory || playerHistory.length === 0) return { senior: [], junior: [], national: [] };
    
    const seniorGroups: any[] = [];
    const juniorGroups: any[] = [];
    const nationalGroups: any[] = [];
    
    const sortedMatches = [...playerHistory].sort((a: any, b: any) => 
      new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime()
    );

    let currentStint: any = null;

    sortedMatches.forEach((match: any, index: number) => {
      const isNational = match.country !== null;
      const teamName = isNational ? (match.country === 'PL' ? 'Polska' : match.country) : match.playerTeam;
      const isJunior = !isNational && (teamName.toLowerCase().includes('u1') || teamName.toLowerCase().includes('u2') || teamName.toLowerCase().includes('under') || teamName.toLowerCase().includes('junior'));
      
      if (!currentStint || currentStint.name !== teamName) {
        if (currentStint) {
          // Zamknij poprzedni stint
          currentStint.leftAt = sortedMatches[index - 1]?.playedAt;
          currentStint.isCurrent = false;
        }

        const clubData = [...teams, ...extraTeams].find(t => t.name === teamName);
        currentStint = {
          name: teamName,
          joinedAt: match.playedAt,
          leftAt: match.playedAt,
          matches: 0,
          goals: 0,
          logo: clubData?.logo,
          country: match.country,
          isJunior,
          isNational,
          isCurrent: false
        };

        if (isNational) nationalGroups.push(currentStint);
        else if (isJunior) juniorGroups.push(currentStint);
        else seniorGroups.push(currentStint);
      }
      
      currentStint.matches++;
      currentStint.goals += (match.goals?.length || 0);
      currentStint.leftAt = match.playedAt;
    });

    // Tylko ostatni stint może być "obecny"
    if (currentStint) {
      const lastMatchDate = new Date(currentStint.leftAt).getTime();
      const now = new Date().getTime();
      const isRecent = (now - lastMatchDate) < (1000 * 60 * 60 * 24 * 30); // 30 dni zamiast 14
      currentStint.isCurrent = isRecent;
    }

    return {
      senior: seniorGroups.reverse(),
      junior: juniorGroups.reverse(),
      national: nationalGroups.reverse()
    };
  }, [playerHistory]);

  const isVerified = useMemo(() => {
    if (!history?.players || !player) return player?.verified || false;
    const entry = history.players[player.userId] || 
                         Object.values(history.players).find((p: any) => p.name?.toLowerCase().trim() === player.username?.toLowerCase().trim());
    return !!entry;
  }, [history, player]);

  const playerCountry = useMemo(() => {
    if (!history?.players || !player) return player?.country || 'PL';
    const entry = history.players[player.userId] || 
                         Object.values(history.players).find((p: any) => p.name?.toLowerCase().trim() === player.username?.toLowerCase().trim());
    return entry ? (player.country || 'PL') : (player?.country || 'PL');
  }, [history, player]);

  const last15Ratings = useMemo(() => {
    if (!player?.recentMatches) return [];
    return [...player.recentMatches]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-15)
      .map(m => m.rating || 6.0);
  }, [player]);

  const parentClub = useMemo(() => {
    if (structuredCareer.senior.length > 0) {
      return structuredCareer.senior[structuredCareer.senior.length - 1];
    }
    if (structuredCareer.junior.length > 0) {
      return structuredCareer.junior[structuredCareer.junior.length - 1];
    }
    return null;
  }, [structuredCareer]);

  const extraStats = useMemo(() => {
    // 1. Zawsze licz wartość rynkową na podstawie Ekstraklasy (playerHistory)
    const eksStats = { goals: 0, assists: 0, matches: 0, redCards: 0 };
    const eksHistory = playerHistory.filter((m: any) => {
      const matchLeague = (m.league || m.category || 'Ekstraklasa').toLowerCase();
      return matchLeague.includes('ekstraklasa') || (!matchLeague.includes('towarzyskie'));
    });
    
    eksHistory.forEach((m: any) => {
      eksStats.matches++;
      eksStats.goals += (m.goals?.length || 0);
      eksStats.assists += (m.assists || 0);
      m.cards?.forEach((c: any) => {
        if (String(c.type).toLowerCase().includes('red')) eksStats.redCards++;
      });
    });

    const eksAvgRating = eksHistory.length > 0 
      ? eksHistory.reduce((acc: number, m: any) => {
          const isWinner = (m.playerTeam === m.teamA && m.scoreA > m.scoreB) || (m.playerTeam === m.teamB && m.scoreB > m.scoreA);
          const isDraw = m.scoreA === m.scoreB;
          const result: 'W' | 'D' | 'L' = isWinner ? 'W' : (isDraw ? 'D' : 'L');
          return acc + calculateMatchRating({
            minutes: m.minutesPlayed || (m.role === 'starter' ? 90 : 30),
            goals: m.goals?.length || 0,
            assists: m.assists || 0,
            result: result,
            homeTeam: m.teamA,
            awayTeam: m.teamB,
            homeScore: m.scoreA,
            awayScore: m.scoreB
          }, m.playerTeam, m.position);
        }, 0) / eksHistory.length
      : 6.5;

    const marketValue = calculateMarketValue({
      matches: eksStats.matches,
      goals: eksStats.goals,
      assists: eksStats.assists,
      redCards: eksStats.redCards
    }, player?.position, eksAvgRating);

    // 2. Inicjalizuj statystyki dla wybranego turnieju
    const stats = {
      marketValue: marketValue,
      goals: 0,
      assists: 0,
      matchesCount: 0,
      minutes: 0,
      avgRating: 6.50,
      yellowCards: 0,
      redCards: 0,
      started: 0
    };

    if (selectedTournament === 'Mecze Towarzyskie') {
      const tournamentPlayer = tournamentPlayers.find(p => 
        p.robloxNick?.toLowerCase().trim() === player?.username?.toLowerCase().trim() ||
        p.robloxId?.toString() === player?.userId
      );

      if (tournamentPlayer) {
        stats.matchesCount = tournamentPlayer.matchesPlayed || 0;
        stats.goals = tournamentPlayer.goals || 0;
        stats.assists = tournamentPlayer.assists || 0;
        stats.yellowCards = tournamentPlayer.yellowCards || 0;
        stats.redCards = tournamentPlayer.redCards || 0;
        stats.minutes = tournamentPlayer.totalMinutes || 0;
        stats.started = tournamentPlayer.matches?.filter((m: any) => m.role === 'starter').length || stats.matchesCount;
        
        const matches = tournamentPlayer.matches || [];
        if (matches.length > 0) {
          const ratings = matches.map((m: any) => {
            const result = (m.playerTeamScore > m.opponentScore) ? 'W' : (m.playerTeamScore === m.opponentScore ? 'D' : 'L');
            return calculateMatchRating({
              minutes: m.minutesPlayed || (m.role === 'starter' ? 90 : 30),
              goals: m.goals || 0,
              assists: m.assists || 0,
              result: result,
              homeTeam: m.playerTeam,
              awayTeam: m.opponent,
              homeScore: m.playerTeamScore,
              awayScore: m.opponentScore
            }, m.playerTeam, player?.position);
          });
          stats.avgRating = ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;
        } else {
          stats.avgRating = 6.0 + (stats.goals * 0.5) + (stats.assists * 0.3) - (stats.redCards * 1.0);
        }
        stats.avgRating = Math.max(1, Math.min(10, stats.avgRating));
      }
    } else {
      if (playerHistory.length > 0) {
        const filteredHistory = playerHistory.filter((m: any) => {
          const matchLeague = (m.league || m.category || 'Ekstraklasa').toLowerCase();
          return matchLeague.includes('ekstraklasa') || (!matchLeague.includes('towarzyskie'));
        });

        filteredHistory.forEach((m: any) => {
          stats.matchesCount++;
          if (m.role === 'starter') {
            stats.started++;
          }
          
          stats.minutes += (m.minutesPlayed || (m.role === 'starter' ? 90 : 30));
          
          stats.goals += (m.goals?.length || 0);
          stats.assists += (m.assists || 0);
          
          m.cards?.forEach((c: any) => {
            const type = String(c.type).toLowerCase();
            if (type.includes('yellow')) stats.yellowCards++;
            if (type.includes('red')) stats.redCards++;
          });
        });

        if (stats.matchesCount > 0) {
          const ratings = filteredHistory.map((m: any) => {
            const isWinner = (m.playerTeam === m.teamA && m.scoreA > m.scoreB) || (m.playerTeam === m.teamB && m.scoreB > m.scoreA);
            const isDraw = m.scoreA === m.scoreB;
            const result = isWinner ? 'W' : (isDraw ? 'D' : 'L');
            return calculateMatchRating({
              minutes: m.minutesPlayed || (m.role === 'starter' ? 90 : 30),
              goals: m.goals?.length || 0,
              assists: m.assists || 0,
              result: result,
              homeTeam: m.teamA,
              awayTeam: m.teamB,
              homeScore: m.scoreA,
              awayScore: m.scoreB
            }, m.playerTeam, m.position);
          });
          stats.avgRating = ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;
        }
      }
    }

    return stats;
  }, [playerHistory, player, selectedTournament, tournamentPlayers]);


  const playerPosition = useMemo(() => {
    if (playerHistory.length > 0) {
      const latestMatch = [...playerHistory].sort((a: any, b: any) => 
        new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()
      )[0];
      if (latestMatch?.position) return mapPositionToPolish(latestMatch.position) || latestMatch.position;
    }
    return player?.position || '---';
  }, [playerHistory, player]);

  const isReferee = useMemo(() => {
    const club = String(player?.currentClub || '').toUpperCase();
    return club === 'REFEREE' || club === 'SED' || club === 'KOLEGIUM SĘDZIOWSKIE' || club.includes('SĘDZIA');
  }, [player]);

  if (loading) return (
    <div className="min-h-screen bg-transparent backdrop-blur-xl flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-white/5 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (!player) return (
    <div className="min-h-screen bg-transparent backdrop-blur-xl flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-black text-white mb-4 uppercase italic">Nie znaleziono gracza</h1>
        <Link href="/" className="text-white/40 hover:text-white transition-colors uppercase font-bold text-sm tracking-widest">Wróć do strony głównej</Link>
      </div>
    </div>
  );

  const clubData = teams.find(t => t.name === player.currentClub);
  const clubColor = isReferee ? '#ef4444' : (clubData?.color || '#ffffff');

  const radarStats = [
    { label: 'Gole', value: Math.min(100, (extraStats.goals / 10) * 100) },
    { label: 'Asysty', value: Math.min(100, (extraStats.assists / 8) * 100) },
    { label: 'Mecze', value: Math.min(100, (extraStats.matchesCount / 20) * 100) },
    { label: 'Rating', value: (extraStats.avgRating / 10) * 100 },
    { label: 'Dyscyplina', value: 100 - (extraStats.yellowCards * 10) },
    { label: 'Minuty', value: Math.min(100, (extraStats.minutes / 1800) * 100) },
  ];

  return (
    <div className="min-h-screen bg-transparent text-white font-sans selection:bg-white selection:text-black">
      <Navbar />
      
      <main className="max-w-[1400px] mx-auto px-4 pt-32 pb-20 space-y-8">
        {isReferee ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] py-10">
            {/* Main Referee "Embed" */}
            <div className="w-full max-w-4xl bg-[#0a0a0a]/60 backdrop-blur-3xl rounded-[50px] border border-red-500/20 shadow-[0_0_100px_rgba(239,68,68,0.1)] overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.05] via-transparent to-transparent opacity-50" />
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-500/10 blur-[120px] rounded-full animate-pulse" />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-500/5 blur-[120px] rounded-full animate-pulse" />

              <div className="relative z-10 p-12 md:p-20 flex flex-col items-center text-center space-y-12">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/20 blur-[60px] rounded-full scale-110 animate-pulse" />
                  <div className="flex items-center gap-8 relative z-10">
                    <div className="w-40 h-40 md:w-56 md:h-56 rounded-3xl overflow-hidden border-2 border-white/10 bg-black shadow-2xl transform transition-transform group-hover:scale-105 duration-700">
                      <RobloxAvatar username={player.username} className="w-full h-full object-cover scale-110" />
                    </div>
                    <div className="w-32 h-32 md:w-44 md:h-44 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 flex items-center justify-center p-6 shadow-2xl transform transition-transform group-hover:scale-110 duration-700 delay-100">
                      <img 
                        src="https://i.ibb.co/5hYr57Mr/obraz-2026-02-01-142942311.png" 
                        alt="Referee Logo" 
                        className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]" 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    <div className="h-px w-12 bg-red-500/30" />
                    <span className="text-[11px] font-black uppercase tracking-[0.5em] text-red-500/60 italic">Oficjalny Arbiter PFF</span>
                    <div className="h-px w-12 bg-red-500/30" />
                  </div>
                  <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    {player.username}
                  </h1>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-3xl">
                  <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 backdrop-blur-md">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Mecze</p>
                    <p className="text-4xl font-black italic text-white">{player.stats.matches}</p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 backdrop-blur-md">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Żółte</p>
                    <p className="text-4xl font-black italic text-yellow-400">{player.stats.yellowCards}</p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 backdrop-blur-md">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Czerwone</p>
                    <p className="text-4xl font-black italic text-red-500">{player.stats.redCards}</p>
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 backdrop-blur-md">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Status</p>
                    <p className="text-2xl font-black italic text-green-500 uppercase">Aktywny</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-[#0a0a0a]/60 backdrop-blur-3xl rounded-[50px] border border-white/5 shadow-2xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] via-transparent to-transparent opacity-50" />
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full animate-pulse" />
              
              <div className="relative z-10 p-8 md:p-12 lg:p-16">
                <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-12">
                  <div className="flex flex-col lg:flex-row items-center lg:items-center gap-10 w-full">
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 bg-blue-500/20 blur-[40px] rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      <div className="w-48 h-48 md:w-64 md:h-64 rounded-[40px] overflow-hidden border border-white/10 bg-black relative z-10 shadow-2xl transform transition-transform group-hover:scale-105 duration-700">
                        <RobloxAvatar username={player.username} className="w-full h-full object-cover scale-110" />
                      </div>
                      <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center border-4 border-[#0a0a0a] z-20 shadow-xl">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    <div className="flex-1 text-center lg:text-left space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-center lg:justify-start gap-4">
                          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 italic">Profil zawodnika</span>
                          <div className={`px-3 py-1 ${isVerified ? 'bg-blue-500/10 border-blue-500/20' : 'bg-red-500/10 border-red-500/20'} rounded-full flex items-center gap-2`}>
                            <div className={`w-1 h-1 ${isVerified ? 'bg-blue-500 animate-pulse' : 'bg-red-500'} rounded-full`} />
                            <span className={`text-[8px] font-black uppercase tracking-widest ${isVerified ? 'text-blue-400' : 'text-red-400'}`}>
                              {isVerified ? 'zweryfikowane dane' : 'nie zweryfikowane dane'}
                            </span>
                          </div>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                          {player.username}
                        </h1>
                      </div>
                      
                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-4">
                        <div className="flex items-center gap-4 group">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-transform group-hover:scale-110">
                            {clubData?.logo ? (
                              <img src={clubData.logo} alt="" className="w-8 h-8 object-contain" />
                            ) : (
                              <ShieldCheck className="w-6 h-6 text-white/20" />
                            )}
                          </div>
                          <div className="text-left">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{isReferee ? 'Organ' : 'Klub'}</p>
                            <p className="text-lg font-black italic uppercase tracking-tight group-hover:text-white transition-colors">
                              {player.currentClub || 'Wolny Agent'}
                            </p>
                          </div>
                        </div>

                        <div className="w-px h-12 bg-white/5 hidden md:block" />

                        <div className="flex items-center gap-4 group">
                          <div className="w-14 h-14 rounded-full border border-white/10 p-1 group-hover:border-white/20 transition-all overflow-hidden bg-white/5 backdrop-blur-md flex items-center justify-center">
                            {playerCountry ? (
                              <img 
                                src={`https://flagcdn.com/w80/${playerCountry.toLowerCase()}.png`} 
                                alt="" 
                                className="w-full h-full object-cover rounded-full" 
                              />
                            ) : (
                              <HelpCircle className="w-6 h-6 text-white/10" />
                            )}
                          </div>
                          <div className="text-left">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Narodowość</p>
                            <p className="text-lg font-black italic uppercase tracking-tight">
                              {playerCountry ? (playerCountry === 'PL' ? 'Polska' : playerCountry) : 'Nieznana'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="hidden lg:flex flex-col gap-4">
                    <button className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-black uppercase italic tracking-widest text-xs hover:bg-gray-200 transition-all shadow-xl group">
                      <Bell className="w-4 h-4 group-hover:animate-bounce" />
                      Obserwuj
                    </button>
                    <button className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase italic tracking-widest text-xs hover:bg-white/10 transition-all group">
                      <Star className="w-4 h-4 group-hover:text-yellow-400 group-hover:fill-current" />
                      Ulubiony
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 p-2 bg-[#0a0a0a]/60 border border-white/5 rounded-[28px] sticky top-24 z-40 backdrop-blur-xl shadow-2xl overflow-x-auto">
              {['przegląd', 'statystyki', 'mecze', 'kariera']
                .filter(tab => {
                  if (extraStats.matchesCount === 0 && (tab === 'statystyki' || tab === 'mecze')) return false;
                  return true;
                })
                .map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase italic tracking-widest transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab 
                      ? 'bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.3)] scale-105' 
                      : 'text-white/30 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab === 'przegląd' && <LayoutDashboard className="w-4 h-4" />}
                  {tab === 'statystyki' && <BarChart2 className="w-4 h-4" />}
                  {tab === 'mecze' && <Calendar className="w-4 h-4" />}
                  {tab === 'kariera' && <History className="w-4 h-4" />}
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Pitch Visualization & Form */}
              {activeTab === 'przegląd' && (
                <div className="lg:col-span-3 space-y-8">
                  <div className="bg-[#0a0a0a]/60 backdrop-blur-xl rounded-[40px] p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col items-center justify-center gap-8">
                      <div className="w-full">
                        <PlayerField position={playerPosition} />
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] mb-3 italic">Pozycja gracza</p>
                        <div className="inline-flex items-center gap-3 px-6 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                          <span className="text-xs font-black uppercase tracking-widest">{playerPosition}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progresja Formy moved from middle column */}
                  <div className="bg-[#0a0a0a]/60 backdrop-blur-xl rounded-[40px] p-10 border border-white/5 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter">Progresja formy</h3>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Ostatnie 15 meczów</p>
                      </div>
                    </div>
                    <RatingChart ratings={last15Ratings} color="#f97316" />
                  </div>
                </div>
              )}

              {/* Middle Column: Main Stats */}
              <div className={`${activeTab === 'przegląd' ? 'lg:col-span-6' : 'lg:col-span-9'} space-y-8`}>
                {activeTab === 'przegląd' && (
                  <>
                    <div className="bg-[#0a0a0a]/60 backdrop-blur-xl rounded-[40px] p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                        <TrendingUp className="w-64 h-64 rotate-12" />
                      </div>
                      <div className="relative z-10">
                        <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em] mb-4 italic">Wartość transferowa</p>
                        <div className="flex items-baseline gap-4">
                          <h2 className="text-7xl md:text-8xl font-black italic tracking-tighter text-green-500 drop-shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                            {extraStats.marketValue >= 1000000 
                              ? `${(extraStats.marketValue / 1000000).toFixed(1).replace('.', ',')} mln €` 
                              : `${(extraStats.marketValue / 1000).toFixed(0)} tys. €`}
                          </h2>
                          <div className="flex items-center gap-2 text-white/40 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                            <Activity className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Trend: Stabilny</span>
                          </div>
                        </div>
                      </div>
                    </div>


                    <div className="bg-[#0a0a0a]/60 backdrop-blur-xl rounded-[40px] p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
                      <div className="flex flex-col items-center gap-8 py-6 border-b border-white/5 mb-10">
                        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 relative z-20">
                           {(['Ekstraklasa', 'Mecze Towarzyskie'] as const).map((t) => (
                             <button 
                               key={t}
                               onClick={() => setSelectedTournament(t)}
                               className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${selectedTournament === t ? 'bg-white text-black shadow-xl scale-105' : 'text-white/40 hover:text-white'}`}
                             >
                               {t}
                             </button>
                           ))}
                        </div>
                        <img 
                          src={selectedTournament === 'Ekstraklasa' ? "https://i.ibb.co/MyfXtGLH/ekstraklasabaner-removebg-preview.png" : "https://i.ibb.co/vWZWXTC/obraz-2026-02-04-222253347-removebg-preview-1.png"} 
                          alt={selectedTournament} 
                          className="h-32 w-auto object-contain transition-all duration-500 scale-110"
                        />
                      </div>

                      {extraStats.matchesCount > 0 ? (
                        <div className="grid grid-cols-4 gap-y-12 gap-x-4">
                          <div className="text-center">
                            <p className="text-2xl font-black italic mb-1">{extraStats.goals}</p>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Bramki</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-black italic mb-1">{extraStats.assists}</p>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Asysty</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-black italic mb-1">{extraStats.started}</p>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Rozpoczęte</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-black italic mb-1">{extraStats.matchesCount}</p>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Mecze</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-black italic mb-1">{extraStats.minutes}</p>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Rozegrane minuty</p>
                          </div>
                          <div className="text-center">
                            <div className="inline-block px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-lg mb-1">
                              <p className="text-xl font-black italic text-orange-500">{extraStats.avgRating.toFixed(2).replace('.', ',')}</p>
                            </div>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest block">Ocena</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <div className="w-3 h-4 bg-yellow-400 rounded-sm shadow-[0_0_10px_rgba(250,204,21,0.4)]" />
                              <p className="text-2xl font-black italic">{extraStats.yellowCards}</p>
                            </div>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Żółte kartki</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <div className="w-3 h-4 bg-red-500 rounded-sm shadow-[0_0_10px_rgba(239,68,68,0.4)]" />
                              <p className="text-2xl font-black italic">{extraStats.redCards}</p>
                            </div>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Czerwone kartki</p>
                          </div>
                        </div>
                      ) : (
                        <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
                          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                            <LayoutDashboard className="w-10 h-10 text-white/10" />
                          </div>
                          <div>
                            <p className="text-xl font-black italic uppercase tracking-tighter text-white/60">Brak statystyk</p>
                            <p className="text-sm font-medium text-white/20">Brak rozegranych meczów w tych rozgrywkach.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {activeTab === 'statystyki' && (
                  <div className="bg-[#0a0a0a]/60 backdrop-blur-xl rounded-[40px] pt-10 px-10 pb-8 border border-white/5 shadow-2xl space-y-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div>
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-1">Wyniki w sezonie</h2>
                        <p className="text-sm font-black text-white/40 uppercase italic tracking-widest">Rozegrane minuty: {extraStats.minutes}</p>
                      </div>
                      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                         <button 
                           onClick={() => setStatMode('total')}
                           className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${statMode === 'total' ? 'bg-white text-black shadow-xl scale-105' : 'text-white/40 hover:text-white'}`}
                         >
                           Ogółem
                         </button>
                         <button 
                           onClick={() => setStatMode('per90')}
                           className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${statMode === 'per90' ? 'bg-white text-black shadow-xl scale-105' : 'text-white/40 hover:text-white'}`}
                         >
                           Na 90
                         </button>
                      </div>
                    </div>

                    <div className="space-y-12">
                       <section className="space-y-8">
                          <div className="flex items-center gap-4 opacity-40">
                             <h3 className="text-sm font-black uppercase italic tracking-widest">Strzelanie</h3>
                             <div className="h-px flex-1 bg-white/10" />
                             <div className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                               Rank. <HelpCircle className="w-3 h-3" />
                             </div>
                          </div>

                          <div className="space-y-6">
                             <DetailedStat 
                               label="Bramki" 
                               value={extraStats.goals} 
                               max={10} 
                               mode={statMode} 
                               mins={extraStats.minutes}
                               color="bg-orange-500"
                             />
                             <DetailedStat 
                               label="Oczekiwane gole (xG)" 
                               value={extraStats.goals * 0.85 + 0.5} 
                               max={10} 
                               mode={statMode} 
                               mins={extraStats.minutes}
                               color="bg-orange-500"
                               isFloat
                             />
                             <DetailedStat 
                               label="xG w światło bramki (xGOT)" 
                               value={extraStats.goals * 0.9 + 0.3} 
                               max={10} 
                               mode={statMode} 
                               mins={extraStats.minutes}
                               color="bg-orange-500"
                               isFloat
                             />
                             <DetailedStat 
                               label="xG bez rzutów karnych" 
                               value={extraStats.goals * 0.85} 
                               max={10} 
                               mode={statMode} 
                               mins={extraStats.minutes}
                               color="bg-orange-500"
                               isFloat
                             />
                             <DetailedStat 
                               label="Strzały" 
                               value={extraStats.goals * 4 + 2} 
                               max={40} 
                               mode={statMode} 
                               mins={extraStats.minutes}
                               color="bg-orange-500"
                             />
                             <DetailedStat 
                               label="Strzały celne" 
                               value={extraStats.goals * 2 + 1} 
                               max={20} 
                               mode={statMode} 
                               mins={extraStats.minutes}
                               color="bg-orange-500"
                             />
                             <DetailedStat 
                               label="Headed shots" 
                               value={Math.floor(extraStats.goals * 0.5)} 
                               max={10} 
                               mode={statMode} 
                               mins={extraStats.minutes}
                               color="bg-orange-500"
                             />
                          </div>
                       </section>
                    </div>
                  </div>
                )}

                {activeTab === 'mecze' && (
                  <div className="bg-[#0a0a0a]/60 backdrop-blur-xl rounded-[40px] pt-8 px-8 pb-6 border border-white/5 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                       <h2 className="text-3xl font-black italic uppercase tracking-tighter">Statystyki meczu</h2>
                    </div>

                    <div className="mb-6 flex items-center gap-4">
                       <div className="relative">
                         <div 
                           onClick={() => setIsTournamentOpen(!isTournamentOpen)}
                           className="px-5 py-2 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-all cursor-pointer group/select min-w-[320px]"
                         >
                            <div className="w-32 h-32 flex items-center justify-center bg-white/5 rounded-lg border border-white/10 overflow-hidden p-1 shadow-inner group-hover/select:scale-110 transition-transform">
                               <img src={selectedTournament === 'Ekstraklasa' ? "https://i.ibb.co/MyfXtGLH/ekstraklasabaner-removebg-preview.png" : "https://i.ibb.co/vWZWXTC/obraz-2026-02-04-222253347-removebg-preview-1.png"} className="w-full h-full object-contain brightness-110" alt="" />
                            </div>
                            <span className="text-[16px] font-black uppercase italic tracking-[0.15em] whitespace-nowrap">{selectedTournament === 'Ekstraklasa' ? 'Ekstraklasa' : 'Mecze Towarzyskie'}</span>
                            <div className="flex-1" />
                            <ChevronLeft className={`w-4 h-4 transition-transform opacity-40 group-hover/select:opacity-100 ${isTournamentOpen ? 'rotate-90' : 'rotate-[270deg]'}`} />
                         </div>
                         
                         {isTournamentOpen && (
                           <div className="absolute top-full left-0 w-full mt-2 bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 z-50 shadow-2xl backdrop-blur-3xl animate-in fade-in slide-in-from-top-2 duration-200">
                              {(['Ekstraklasa', 'Mecze Towarzyskie'] as const).map((t) => (
                                <button 
                                  key={t}
                                  onClick={() => {
                                    setSelectedTournament(t);
                                    setIsTournamentOpen(false);
                                  }}
                                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${selectedTournament === t ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-white/5 text-white/40 hover:text-white'}`}
                                >
                                  <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 p-1">
                                    <img src={t === 'Ekstraklasa' ? "https://i.ibb.co/MyfXtGLH/ekstraklasabaner-removebg-preview.png" : "https://i.ibb.co/vWZWXTC/obraz-2026-02-04-222253347-removebg-preview-1.png"} className="w-full h-full object-contain" alt="" />
                                  </div>
                                  <span className="text-xs font-black uppercase italic tracking-widest">{t}</span>
                                </button>
                              ))}
                           </div>
                         )}
                       </div>
                       
                       <div className="flex-1" />

                       <div className="flex items-center gap-10 px-8 opacity-60">
                          <div className="group/icon relative">
                            <TimerIcon className="w-5 h-5" />
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-white/10 rounded-md text-[10px] font-bold uppercase whitespace-nowrap opacity-0 group-hover/icon:opacity-100 transition-opacity">Minuty</div>
                          </div>
                          <div className="group/icon relative">
                            <Target className="w-5 h-5" />
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-white/10 rounded-md text-[10px] font-bold uppercase whitespace-nowrap opacity-0 group-hover/icon:opacity-100 transition-opacity">Gole</div>
                          </div>
                          <div className="group/icon relative">
                            <ArrowRightLeft className="w-5 h-5" />
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-white/10 rounded-md text-[10px] font-bold uppercase whitespace-nowrap opacity-0 group-hover/icon:opacity-100 transition-opacity">Asysty</div>
                          </div>
                          <div className="w-3.5 h-4.5 bg-yellow-400 rounded-sm opacity-60" />
                          <div className="w-3.5 h-4.5 bg-red-500 rounded-sm opacity-60" />
                          <Star className="w-5 h-5" />
                       </div>
                    </div>

                    <div className="space-y-1">
                       {(() => {
                         const matchesToDisplay = player.recentMatches.filter(m => {
                           if (selectedTournament === 'Mecze Towarzyskie') {
                             return m.tournamentId === 1 || m.league?.toLowerCase().includes('towarzyskie');
                           } else {
                             // Domyślnie Ekstraklasa - wszystko co nie jest towarzyskie lub ma league Ekstraklasa
                             return m.tournamentId !== 1 && (m.league?.toLowerCase().includes('ekstraklasa') || !m.league?.toLowerCase().includes('towarzyskie'));
                           }
                         });

                         return matchesToDisplay.slice(0, 8).map((match: any, i: number) => (
                           <div key={i} className={`group flex items-center py-2 px-6 hover:bg-white/[0.03] rounded-2xl transition-all border border-transparent hover:border-white/10 ${match.wasExcluded ? 'opacity-40' : ''}`}>
                              <div className="w-40 h-28 rounded-xl border border-white/10 flex items-center justify-center mr-6 bg-white/5 overflow-hidden p-1.5 shadow-lg group-hover:scale-105 transition-transform">
                                 <img src={selectedTournament === 'Ekstraklasa' ? "https://i.ibb.co/MyfXtGLH/ekstraklasabaner-removebg-preview.png" : "https://i.ibb.co/vWZWXTC/obraz-2026-02-04-222253347-removebg-preview-1.png"} className="w-full h-full object-contain brightness-110" alt="" />
                              </div>
                              
                              <div className="w-36">
                                 <p className="text-[13px] font-black uppercase italic tracking-[0.2em] text-white/30 group-hover:text-white/60 transition-colors">
                                   {new Date(match.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}
                                 </p>
                              </div>

                              <div className="flex items-center gap-10 flex-1">
                                 <div className="flex items-center gap-5 min-w-[260px]">
                                    <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center p-2 border border-white/10 shadow-inner group-hover:border-white/20 transition-all">
                                       <img 
                                          src={[...teams, ...extraTeams].find(t => 
                                            t.name === match.opponent || 
                                            t.shortName === match.opponent ||
                                            t.id === match.opponent
                                          )?.logo || "https://i.ibb.co/xbrWSnb/Przezroczyste-PFF.png"} 
                                          className="w-full h-full object-contain brightness-110" 
                                          alt="" 
                                       />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-xl font-black italic uppercase tracking-tighter truncate max-w-[200px]">
                                         {match.opponent}
                                      </span>
                                      <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Przeciwnik</span>
                                    </div>
                                 </div>

                                 <div className="flex items-center gap-10 min-w-[140px] justify-center bg-white/5 py-2 px-6 rounded-2xl border border-white/5">
                                    <span className={`text-lg font-black uppercase italic w-6 text-center drop-shadow-[0_0_8px_currentColor] ${match.result === 'W' ? 'text-green-500' : match.result === 'L' ? 'text-red-500' : 'text-white/40'}`}>
                                       {match.result || '-'}
                                    </span>
                                    <span className="text-2xl font-black italic tabular-nums tracking-tighter text-white/90">
                                       {match.homeScore} : {match.awayScore}
                                    </span>
                                  </div>
                              </div>

                              <div className="flex items-center gap-8 pl-8 pr-2">
                                 <p className="w-10 text-center text-xl font-black italic">{match.minutes}</p>
                                 <p className="w-8 text-center text-xl font-black italic text-white/40 group-hover:text-white transition-colors drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{match.goals}</p>
                                 <p className="w-8 text-center text-xl font-black italic text-white/40 group-hover:text-white transition-colors">{match.assists}</p>
                                 <div className="w-6 flex justify-center">
                                   {match.yellowCards > 0 && <div className="w-3 h-4 bg-yellow-400 rounded-sm shadow-[0_0_10px_rgba(250,204,21,0.4)]" />}
                                 </div>
                                 <div className="w-6 flex justify-center">
                                   {match.redCards > 0 && <div className="w-3 h-4 bg-red-500 rounded-sm shadow-[0_0_10px_rgba(239,68,68,0.4)]" />}
                                 </div>
                                 
                                 <div className={`w-16 h-12 rounded-2xl flex items-center justify-center border-2 font-black italic text-lg shadow-xl transition-all ${
                                   match.wasExcluded 
                                     ? 'bg-red-500/10 border-red-500/40 text-red-500 shadow-red-500/10'
                                     : match.rating 
                                       ? 'bg-orange-500/10 border-orange-500/40 text-orange-500 shadow-orange-500/10 group-hover:bg-orange-500 group-hover:text-black group-hover:shadow-orange-500/20' 
                                       : 'bg-white/5 border-white/10 text-white/20'
                                 }`}>
                                    {match.wasExcluded ? 'WYK' : (match.rating ? match.rating.toFixed(1).replace('.', ',') : '-')}
                                 </div>
                              </div>
                           </div>
                         ));
                       })()}
                    </div>

                    <div className="mt-12 flex items-center justify-between border-t border-white/5 pt-8">
                       <button className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/60 hover:text-white group">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                             <ChevronLeft className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-black italic uppercase tracking-widest">Poprzednia kolejka</span>
                       </button>

                       <button className="flex items-center gap-3 px-6 py-3 rounded-full bg-transparent text-white/20 cursor-not-allowed group">
                          <span className="text-xs font-black italic uppercase tracking-widest">Następna kolejka</span>
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                             <ChevronRight className="w-4 h-4" />
                          </div>
                       </button>
                    </div>
                  </div>
                )}

                {activeTab === 'kariera' && (
                  <div className="bg-[#0a0a0a]/60 backdrop-blur-xl rounded-[40px] pt-10 px-10 pb-8 border border-white/5 shadow-2xl space-y-12">
                    <div>
                      <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8">Kariera</h2>

                      <div className="space-y-16">
                        {/* Seniorska */}
                        <div className="space-y-8">
                          <div className="flex items-center justify-between opacity-40">
                            <h3 className="text-sm font-black uppercase italic tracking-widest">Kariera seniorska</h3>
                            <div className="flex gap-14 mr-4">
                              <LayoutDashboard className="w-4 h-4" />
                              <Target className="w-4 h-4" />
                            </div>
                          </div>
                          <div className="space-y-6">
                            {structuredCareer.senior.length > 0 ? (
                              structuredCareer.senior.map((group, i) => (
                                <CareerItem key={i} item={group} />
                              ))
                            ) : (
                              <p className="text-xs font-black uppercase italic tracking-widest text-white/10 text-center py-10 border border-dashed border-white/5 rounded-3xl">Brak danych</p>
                            )}
                          </div>
                        </div>

                        {/* Juniorska */}
                        <div className="space-y-8">
                          <div className="flex items-center justify-between opacity-40">
                            <h3 className="text-sm font-black uppercase italic tracking-widest">Kariera juniorska</h3>
                            <div className="flex gap-14 mr-4">
                              <LayoutDashboard className="w-4 h-4" />
                              <Target className="w-4 h-4" />
                            </div>
                          </div>
                          <div className="space-y-6">
                            {structuredCareer.junior.length > 0 ? (
                              structuredCareer.junior.map((group, i) => (
                                <CareerItem key={i} item={group} />
                              ))
                            ) : (
                              <p className="text-xs font-black uppercase italic tracking-widest text-white/10 text-center py-10 border border-dashed border-white/5 rounded-3xl">Brak danych klubów juniorskich</p>
                            )}
                          </div>
                        </div>

                        {/* Narodowa */}
                        <div className="space-y-8">
                          <div className="flex items-center justify-between opacity-40">
                            <h3 className="text-sm font-black uppercase italic tracking-widest">Kadra narodowa</h3>
                            <div className="flex gap-14 mr-4">
                              <LayoutDashboard className="w-4 h-4" />
                              <Target className="w-4 h-4" />
                            </div>
                          </div>
                          <div className="space-y-6">
                            {structuredCareer.national.length > 0 ? (
                              structuredCareer.national.map((group, i) => (
                                <CareerItem key={i} item={group} isNational />
                              ))
                            ) : (
                              <p className="text-xs font-black uppercase italic tracking-widest text-white/10 text-center py-10 border border-dashed border-white/5 rounded-3xl">Brak występów w reprezentacji</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-3 space-y-8">
                <div className="bg-[#0a0a0a]/60 backdrop-blur-xl rounded-[40px] p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
                  <div className="flex items-center gap-4 pb-6 border-b border-white/5 mb-10">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-500">
                      {playerCountry ? (
                        <img src={`https://flagcdn.com/w80/${playerCountry.toLowerCase()}.png`} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <HelpCircle className="w-4 h-4 text-white/20" />
                      )}
                    </div>
                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Reprezentacja</h3>
                  </div>
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className={`text-3xl font-black italic uppercase tracking-tight ${!playerCountry ? 'text-white/20' : 'text-white'}`}>
                          {playerCountry ? (playerCountry === 'PL' ? 'Polska' : playerCountry) : 'Nieznana'}
                        </p>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Główna kadra</p>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-black italic text-white/10 group-hover:text-white/30 transition-colors tracking-tighter">0</p>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Występy</p>
                      </div>
                    </div>
                    <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                       <p className="text-[10px] font-black text-white/10 uppercase italic tracking-[0.3em]">Debiut: {playerCountry ? 'Wkrótce' : 'Brak informacji'}</p>
                       <div className="flex items-center gap-4">
                         <div className="text-right">
                           <p className="text-lg font-black italic text-white/10">0</p>
                           <p className="text-[8px] font-black text-white/20 uppercase">Gole</p>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>

                {extraStats.matchesCount > 0 && (
                  <>

                    <div className="bg-[#0a0a0a]/60 backdrop-blur-xl rounded-[40px] p-10 border border-white/5 shadow-2xl group">
                      <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-10">
                        <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                          <Star className="w-6 h-6 text-blue-500" />
                          Statystyki Sezonu
                        </h3>
                        <HelpCircle className="w-5 h-5 text-white/10 hover:text-white/40 cursor-help" />
                      </div>
                      <div className="relative aspect-square group-hover:scale-105 transition-transform duration-700">
                        <RadarChart stats={radarStats} color={clubColor} />
                      </div>
                      <div className="mt-8 grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Mocne strony</p>
                            <p className="text-xs font-black italic uppercase text-blue-400">Wykończenie</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Styl gry</p>
                            <p className="text-xs font-black italic uppercase text-white/60">Skrzydłowy</p>
                        </div>
                      </div>
                    </div>


                  </>
                )}
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function DetailedStat({ label, value, max, mode, mins, color = "bg-white", isFloat = false }: { label: string; value: number; max: number; mode: 'total' | 'per90'; mins: number; color?: string; isFloat?: boolean }) {
  const displayValue = mode === 'per90' && mins > 0 ? (value / mins * 90).toFixed(2) : (isFloat ? value.toFixed(2) : value);
  const percentage = Math.min(100, ((mode === 'per90' ? (value / mins * 90) : value) / (mode === 'per90' ? (max / 10) : max)) * 100);

  return (
    <div className="flex items-center gap-6 group/stat">
      <div className="w-1/3">
        <p className="text-sm font-black italic uppercase tracking-tight text-white group-hover/stat:text-orange-500 transition-colors">{label}</p>
      </div>
      <div className="w-16 text-right">
        <p className="text-lg font-black italic">{displayValue.toString().replace('.', ',')}</p>
      </div>
      <div className="w-px h-6 bg-white/10" />
      <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(249,115,22,0.3)]`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function CareerItem({ item, isNational }: { item: any; isNational?: boolean }) {
  const formatDate = (date: string) => {
    if (!date) return '---';
    const d = new Date(date);
    const months = ['STY', 'LUT', 'MAR', 'KWI', 'MAJ', 'CZE', 'LIP', 'SIE', 'WRZ', 'PAŹ', 'LIS', 'GRU'];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <div className="flex items-center justify-between group py-2">
      <div className="flex items-center gap-6">
        <div className={`w-12 h-12 ${isNational ? 'rounded-full' : 'rounded-xl'} bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-colors overflow-hidden shadow-xl`}>
          {isNational ? (
            <img src={`https://flagcdn.com/w80/${(item.country || 'PL').toLowerCase()}.png`} className="w-full h-full object-cover" />
          ) : item.logo ? (
            <img src={item.logo} className="w-8 h-8 object-contain" />
          ) : (
            <div className="w-8 h-8 bg-white/5 rounded-full border border-white/10" />
          )}
        </div>
        <div>
          <h4 className="font-black italic uppercase tracking-tight text-lg group-hover:text-blue-400 transition-colors">{item.name}</h4>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest italic">
            {formatDate(item.joinedAt)} - {item.isCurrent ? 'TERAZ' : formatDate(item.leftAt)}
          </p>
        </div>
      </div>
      <div className="flex gap-14 items-center mr-4">
        <span className="text-xl font-black italic w-6 text-right">{item.matches}</span>
        <span className="text-xl font-black italic w-6 text-right text-white/20 group-hover:text-white transition-colors">{item.goals}</span>
      </div>
    </div>
  );
}

