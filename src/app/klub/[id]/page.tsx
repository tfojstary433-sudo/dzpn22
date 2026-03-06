'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useParams } from 'next/navigation';
import { teams, matches, standings } from '@/lib/data';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { RobloxAvatar } from '@/components/roblox-avatar';
import { LeagueTable } from '@/components/league-table';
import { 
  Calendar, 
  ChevronRight, 
  Trophy, 
  Users, 
  BarChart2, 
  History, 
  Newspaper,
  LayoutDashboard,
  Table as TableIcon,
  ArrowRightLeft,
  Bell,
  Star
} from 'lucide-react';
import { calculateMarketValue } from '@/lib/utils';

interface ClubPlayer {
  userId: string;
  username: string;
  avatarUrl: string | null;
  clubId: string;
  value?: number;
  previousClubs?: string[];
  lastMatchNumber?: number;
  position?: string;
  verified?: boolean;
  stats?: {
    goals: number;
    assists: number;
    matches: number;
  };
}

export default function KlubPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const team = useMemo(() => teams.find(t => t.id === id), [id]);
  
  const [activeTab, setActiveTab] = useState('przegląd');
  const [players, setPlayers] = useState<ClubPlayer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState<any>(null);
  const [apiFixtures, setApiFixtures] = useState<any[]>([]);
  const [apiMatches, setApiMatches] = useState<any[]>([]);
  const [apiStandings, setApiStandings] = useState<any[]>([]);
  const [friendlyMatches, setFriendlyMatches] = useState<any[]>([]);

  // Get filtered players
  const filteredPlayers = useMemo(() => {
    return players.filter(p => 
      p.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [players, searchQuery]);
  const [playerNumbers, setPlayerNumbers] = useState<Record<string, number>>({});
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  // Get team stats from standings
  const teamStats = useMemo(() => standings.find(s => s.team.id === id), [id]);
  
  // Get team form (last 5 matches)
  const teamForm = useMemo(() => {
    if (!team) return [];
    if (apiMatches.length > 0) {
      return apiMatches
        .filter(m => m.status === 'finished' && (m.teamA === team.name || m.teamB === team.name))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(m => {
          const isTeamA = m.teamA === team.name;
          const scoreA = m.scoreA ?? 0;
          const scoreB = m.scoreB ?? 0;
          const opponentName = isTeamA ? m.teamB : m.teamA;
          const opponent = teams.find(t => t.name === opponentName) || { name: opponentName, logo: '' };
          
          let res: 'W' | 'L' | 'D';
          if (scoreA === scoreB) res = 'D';
          else if (isTeamA) res = scoreA > scoreB ? 'W' : 'L';
          else res = scoreB > scoreA ? 'W' : 'L';

          return { 
            res, 
            score: `${scoreA}-${scoreB}`,
            opponent,
            matchId: m.uuid || m.id
          };
        })
        .reverse();
    }

    const allMatches = apiFixtures.length > 0 ? apiFixtures : matches;
    
    return allMatches
      .filter(m => m.status === 'finished' && (m.homeTeam?.id === id || m.awayTeam?.id === id))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(m => {
        const isHome = m.homeTeam?.id === id;
        const homeScore = m.homeScore ?? 0;
        const awayScore = m.awayScore ?? 0;
        const opponent = isHome ? m.awayTeam : m.homeTeam;
        
        let res: 'W' | 'L' | 'D';
        if (homeScore === awayScore) res = 'D';
        else if (isHome) res = homeScore > awayScore ? 'W' : 'L';
        else res = awayScore > homeScore ? 'W' : 'L';

        return { 
          res, 
          score: `${homeScore}-${awayScore}`,
          opponent,
          matchId: m.id
        };
      })
      .reverse();
  }, [id, apiFixtures, apiMatches, team]);

  // Get next match
  const nextMatch = useMemo(() => {
    // Priority: API fixtures
    const apiMatch = apiFixtures
      .filter(f => f.status === 'upcoming' && (f.homeTeam.id === id || f.awayTeam.id === id))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    
    if (apiMatch) return apiMatch;

    return matches
      .filter(m => m.status === 'upcoming' && (m.homeTeam.id === id || m.awayTeam.id === id))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  }, [id, apiFixtures]);

  // Get last lineup
  const lastLineup = useMemo(() => {
    if (!team || !history || !history.players) return null;
    
    // Find all matches for this team
    const teamMatches: any[] = [];
    Object.values(history.players).forEach((player: any) => {
      player.matches.forEach((m: any) => {
        if (m.playerTeam === team.name) {
          teamMatches.push({
            ...m,
            playerName: player.name,
            robloxId: player.robloxId
          });
        }
      });
    });

    if (teamMatches.length === 0) return null;

    // Find the latest match date
    const latestMatch = teamMatches.sort((a, b) => 
      new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()
    )[0];

    // Get all starters for this specific match
    const starters = teamMatches.filter(m => 
      m.matchUuid === latestMatch.matchUuid && m.role === 'starter'
    );

    // Position mapping for field (Row 1 is Top/Attack, Row 7 is Bottom/Defense)
    const posCoords: Record<string, { col: number, row: number }> = {
      'GK': { col: 3, row: 7 },
      'BRAMKARZ': { col: 3, row: 7 },
      'CB': { col: 3, row: 6 },
      'LB': { col: 1, row: 6 },
      'RB': { col: 5, row: 6 },
      'LWB': { col: 1, row: 5 },
      'RWB': { col: 5, row: 5 },
      'CDM': { col: 3, row: 5 },
      'CM': { col: 3, row: 4 },
      'LM': { col: 1, row: 4 },
      'RM': { col: 5, row: 4 },
      'CAM': { col: 3, row: 3 },
      'LW': { col: 1, row: 1.5 },
      'RW': { col: 5, row: 1.5 },
      'ST': { col: 3, row: 0.6 }, // Right in front of the goal
      'N': { col: 3, row: 0.6 },
      'CF': { col: 3, row: 1.1 },
      'NAPASTNIK': { col: 3, row: 0.6 },
      'LF': { col: 2, row: 1.1 },
      'RF': { col: 4, row: 1.1 },
      'LCB': { col: 2, row: 6 },
      'RCB': { col: 4, row: 6 },
      'LCM': { col: 2, row: 4 },
      'RCM': { col: 4, row: 4 },
    };

    const usedCoords = new Set();

    return starters.map((p: any) => {
      const pos = p.position?.toUpperCase() || 'CM';
      const coords = { ...posCoords[pos] || { col: 3, row: 4 } };
      
      // Basic overlap prevention
      let key = `${coords.col}-${coords.row}`;
      while (usedCoords.has(key)) {
        coords.col = (coords.col % 5) + 1;
        key = `${coords.col}-${coords.row}`;
      }
      usedCoords.add(key);

      return {
        name: p.playerName,
        id: p.robloxId,
        position: p.position,
        number: p.number,
        coords
      };
    });
  }, [team, history]);

  // Get aggregated stats for the club
  const clubStats = useMemo(() => {
    if (!team || !history || !history.players) return null;

    const statsMap: Record<string, { 
      name: string, 
      goals: number, 
      assists: number, 
      rating: number, 
      matches: number,
      ratingSum: number
    }> = {};

    // Get current squad player names for filtering
    const currentSquadNames = new Set(players.map(p => p.username));

    Object.values(history.players).forEach((player: any) => {
      // Only include players currently in the club
      if (currentSquadNames.size > 0 && !currentSquadNames.has(player.name)) {
        return;
      }

      player.matches.forEach((m: any) => {
        if (m.playerTeam === team.name) {
          if (!statsMap[player.name]) {
            statsMap[player.name] = { 
              name: player.name, 
              goals: 0, 
              assists: 0, 
              rating: 0, 
              matches: 0,
              ratingSum: 0
            };
          }
          const s = statsMap[player.name];
          s.goals += (m.goals?.length || 0);
          s.assists += (m.assists || 0);
          s.ratingSum += (m.rating || 0);
          s.matches += 1;
        }
      });
    });

    const playerList = Object.values(statsMap).map(s => ({
      ...s,
      rating: s.matches > 0 ? s.ratingSum / s.matches : 0
    }));

    return {
      topScorers: [...playerList].sort((a, b) => b.goals - a.goals).slice(0, 3),
      topAssists: [...playerList].sort((a, b) => b.assists - a.assists).slice(0, 3),
      topGplusA: [...playerList].sort((a, b) => (b.goals + b.assists) - (a.goals + a.assists)).slice(0, 3),
      topRating: [...playerList].filter(p => p.matches >= 1).sort((a, b) => b.rating - a.rating).slice(0, 3),
      topMatches: [...playerList].sort((a, b) => b.matches - a.matches).slice(0, 3),
    };
  }, [team, history, players]);

  // Get transfers (joined/left)
  const clubTransfers = useMemo(() => {
    if (!team || !history || !history.players) return null;

    const transfers: Array<{
      playerName: string,
      type: 'IN' | 'OUT',
      fromTeam?: string,
      toTeam?: string,
      date: string,
      timestamp: number,
      position?: string
    }> = [];

    Object.values(history.players).forEach((player: any) => {
      const playerMatches = [...player.matches].sort((a, b) => 
        new Date(a.playedAt || a.date).getTime() - new Date(b.playedAt || b.date).getTime()
      );

      for (let i = 0; i < playerMatches.length; i++) {
        const currentMatch = playerMatches[i];
        const prevMatch = i > 0 ? playerMatches[i - 1] : null;

        const matchDate = currentMatch.playedAt || currentMatch.date;

        // Joined the club
        if (currentMatch.playerTeam === team.name && (!prevMatch || prevMatch.playerTeam !== team.name)) {
          transfers.push({
            playerName: player.name,
            type: 'IN',
            fromTeam: prevMatch?.playerTeam || 'Wolny agent',
            date: matchDate,
            timestamp: new Date(matchDate).getTime(),
            position: currentMatch.position
          });
        }

        // Left the club
        if (prevMatch && prevMatch.playerTeam === team.name && currentMatch.playerTeam !== team.name) {
          transfers.push({
            playerName: player.name,
            type: 'OUT',
            toTeam: currentMatch.playerTeam,
            date: matchDate,
            timestamp: new Date(matchDate).getTime(),
            position: prevMatch.position
          });
        }
      }
    });

    return transfers.sort((a, b) => b.timestamp - a.timestamp);
  }, [team, history]);

  // Fetch player numbers and players
  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch('https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/players-history.json');
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchHistory();

    async function fetchFixtures() {
      try {
        const res = await fetch('https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/api/fixtures');
        const data = await res.json();
        setApiFixtures(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchFixtures();

    async function fetchStandings() {
      try {
        const res = await fetch('https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/api/table');
        const data = await res.json();
        setApiStandings(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchStandings();

    async function fetchFriendlyMatches() {
      try {
        const res = await fetch('https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/api/tournament/1/fixtures');
        const data = await res.json();
        if (data && data.fixtures) {
          setFriendlyMatches(data.fixtures);
        }
      } catch (err) {
        console.error('Error fetching friendly matches:', err);
      }
    }
    fetchFriendlyMatches();

    fetch('https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/api/matches')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setApiMatches(data);
          const numbers: Record<string, number> = {};
          data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).forEach(match => {
            const processLineup = (lineup: any) => {
              if (lineup?.starters) {
                lineup.starters.forEach((p: any) => {
                  if (p.id) numbers[p.id.toString()] = p.number;
                });
              }
              if (lineup?.bench) {
                lineup.bench.forEach((p: any) => {
                  if (p.id) numbers[p.id.toString()] = p.number;
                });
              }
            };
            processLineup(match.lineupA);
            processLineup(match.lineupB);
          });
          setPlayerNumbers(numbers);
        }
      })
      .catch(err => console.error('Error fetching match numbers:', err));
  }, []);

  useEffect(() => {
    if ((activeTab === 'skład' || activeTab === 'statystyki') && players.length === 0 && !loadingPlayers && team) {
      setLoadingPlayers(true);
      fetch(`/api/club/players/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.players && Array.isArray(data.players)) {
            setPlayers(data.players);
          }
          setLoadingPlayers(false);
        })
        .catch(error => {
          console.error('Error fetching players:', error);
          setLoadingPlayers(false);
        });
    }
  }, [activeTab, team, id, players.length, loadingPlayers]);

  if (!team) {
    return (
      <div className="min-h-screen bg-transparent backdrop-blur-xl text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-4">KLUB NIEZNALEZIONY</h1>
          <Link href="/" className="text-blue-500 hover:underline">Wróć do strony głównej</Link>
        </div>
      </div>
    );
  }

  const isRefereeCollege = id === 'SED' || team.name.toUpperCase() === 'KOLEGIUM SĘDZIOWSKIE';

  const tabs = [
    { id: 'przegląd', label: 'Przegląd', icon: LayoutDashboard },
    ...(isRefereeCollege ? [] : [
      { id: 'tabela', label: 'Tabela', icon: TableIcon },
      { id: 'mecze', label: 'Mecze', icon: Calendar },
    ]),
    { id: 'skład', label: isRefereeCollege ? 'Sędziowie' : 'Skład', icon: Users },
    ...(isRefereeCollege ? [] : [
      { id: 'statystyki', label: 'Statystyki', icon: BarChart2 },
      { id: 'transfery', label: 'Transfery', icon: ArrowRightLeft },
    ]),
    { id: 'historia', label: 'Historia', icon: History },
    { id: 'newsy', label: 'Newsy', icon: Newspaper },
  ];

  return (
    <div className="min-h-screen bg-transparent text-white font-sans selection:bg-blue-500/30">
      <Navbar />
      
      <main className="max-w-[1600px] mx-auto px-4 pt-24 pb-12">
        {/* Header Section */}
        <div className="bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/5 rounded-[40px] p-10 md:p-16 mb-8 relative overflow-hidden shadow-2xl">
          {/* Animated Background Glow */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-transparent" />
            <div className="absolute -top-1/2 -left-1/4 w-[150%] h-[150%] opacity-[0.05] blur-[120px] animate-pulse pointer-events-none" 
                 style={{ background: `radial-gradient(circle, ${team.color || '#3b82f6'} 0%, transparent 70%)` }} />
          </div>
          
          <div className="flex flex-col lg:flex-row items-center lg:items-end gap-12 relative z-10">
            <div className="relative group">
              <div className="absolute inset-0 blur-3xl rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-700"
                   style={{ backgroundColor: team.color || '#3b82f6' }} />
              <div className="relative w-40 h-40 md:w-56 md:h-56 flex items-center justify-center bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/10 rounded-full p-8 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                <Image
                  src={team.logo}
                  alt={team.name}
                  width={160}
                  height={160}
                  className="object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                />
              </div>
            </div>
            
            <div className="text-center lg:text-left flex-1 space-y-6 pb-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-2">
                  <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">{team.name}</h1>
                  <div className="bg-blue-600/10 text-blue-400 text-[10px] font-black px-4 py-1.5 rounded-full border border-blue-500/20 flex items-center gap-2 backdrop-blur-md uppercase tracking-widest">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    Verified Club
                  </div>
                </div>
                <p className="text-white/40 font-black uppercase italic tracking-[0.2em] flex items-center justify-center lg:justify-start gap-3 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                  {isRefereeCollege ? 'Polska • Oficjele PFF' : 'Polska • Ekstraklasa'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 w-full lg:w-auto">
              <button className="px-10 py-5 bg-white text-black rounded-2xl font-black uppercase italic tracking-widest text-sm hover:bg-white/90 transition-all flex items-center justify-center gap-3 group shadow-xl">
                <Bell className="w-5 h-5 transition-transform group-hover:rotate-12" />
                Obserwuj
              </button>
              <button className="px-10 py-5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl font-black uppercase italic tracking-widest text-sm transition-all flex items-center justify-center gap-3">
                <Calendar className="w-5 h-5 text-blue-500" />
                Kalendarz
              </button>
            </div>
          </div>

          {/* Background Brand Logo */}
          <div className="absolute bottom-0 right-0 w-64 h-64 md:w-96 md:h-96 opacity-[0.03] pointer-events-none translate-x-10 translate-y-10">
            <img 
              src="https://i.ibb.co/xqTNKqrw/bot-3.png" 
              alt="" 
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 p-2 bg-[#0a0a0a]/60 border border-white/5 rounded-[28px] mt-16 sticky top-24 z-40 backdrop-blur-xl shadow-2xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase italic tracking-widest transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.3)] scale-105' 
                    : 'text-white/30 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'przegląd' && (
          isRefereeCollege ? (
            <div className="space-y-8">
              <div className="bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/5 rounded-[40px] p-10 md:p-16 relative overflow-hidden shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                  <div className="w-32 h-32 md:w-48 md:h-48 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 flex items-center justify-center p-8 shadow-2xl">
                    <img 
                      src="https://i.ibb.co/5hYr57Mr/obraz-2026-02-01-142942311.png" 
                      alt="Referee Logo" 
                      className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]" 
                    />
                  </div>
                  <div className="text-center md:text-left space-y-4">
                    <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">Kolegium Sędziowskie PFF</h2>
                    <p className="text-white/40 text-sm font-medium leading-relaxed max-w-2xl">
                      Organ odpowiedzialny za obsadę sędziowską, szkolenie oraz certyfikację arbitrów PFF. 
                      W tej sekcji znajdziesz listę oficjalnych sędziów uprawnionych do prowadzenia rozgrywek ligowych.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                <div className="p-10 border-b border-white/5">
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter">LISTA SĘDZIÓW</h2>
                </div>
                {/* We'll render the squad table here - I'll refactor the squad table to be a reusable component if needed, 
                    but for now I'll just copy the logic or use a simpler version */}
                <div className="p-10">
                   <p className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px] mb-8">Oficjalni arbitrzy sezonu 2024/2025</p>
                   {/* I'll use the Skład tab logic here or just tell the user to check the "Sędziowie" tab 
                       Actually, it's better to just redirect or show the list */}
                   <button 
                    onClick={() => setActiveTab('skład')}
                    className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl font-black uppercase italic tracking-widest text-xs transition-all flex items-center gap-3"
                   >
                     <Users className="w-4 h-4 text-blue-500" />
                     Zobacz pełną kadrę sędziowską
                   </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form Widget */}
                <div className="bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
                  <h3 className="text-lg font-black uppercase mb-6 flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-500" />
                    Forma zespołu
                  </h3>
                  <div className="flex items-center gap-3">
                    {teamForm.length > 0 ? teamForm.map((result, i) => (
                      <Link 
                        key={i} 
                        href={`/mecz/${result.matchId}`}
                        className="flex flex-col items-center gap-2 group/form"
                      >
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-lg transition-all group-hover/form:scale-110 ${
                          result.res === 'W' ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]' :
                          result.res === 'L' ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]' :
                          'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]'
                        }`}>
                          {result.res}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center overflow-hidden transition-colors group-hover/form:border-white/30">
                          <Image 
                            src={result.opponent.logo} 
                            alt="logo" 
                            width={24} 
                            height={24} 
                            className="object-contain opacity-50 group-hover/form:opacity-100"
                          />
                        </div>
                      </Link>
                    )) : (
                      <p className="text-gray-500 text-sm italic">Brak rozegranych meczów</p>
                    )}
                  </div>
                </div>

                {/* Next Match Widget */}
                <div className="bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black uppercase flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      Następny mecz
                    </h3>
                    <div className="flex items-center gap-2">
                      <img 
                        src="https://i.ibb.co/ksb3b2Bs/obraz-2026-01-29-190552532.png" 
                        alt="Ekstraklasa" 
                        className="h-10 object-contain"
                      />
                    </div>
                  </div>
                  
                  {nextMatch ? (
                    <Link 
                      href={`/mecz/${nextMatch.id}`}
                      className="flex items-center justify-between group/match hover:bg-white/[0.02] -mx-2 px-2 py-3 rounded-2xl transition-all border border-transparent hover:border-white/5"
                    >
                      <div className="text-center">
                        <Image src={nextMatch.homeTeam.logo} alt="" width={48} height={48} className="mx-auto mb-2 transition-transform group-hover/match:scale-110" />
                        <p className="text-xs font-bold uppercase truncate max-w-[80px]">{nextMatch.homeTeam.name}</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-black mb-1 group-hover/match:text-blue-400 transition-colors">
                          {new Date(nextMatch.date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase">
                          {new Date(nextMatch.date).toLocaleDateString('pl-PL') === new Date().toLocaleDateString('pl-PL') ? 'Dzisiaj' : new Date(nextMatch.date).toLocaleDateString('pl-PL')}
                        </div>
                        <div className="mt-2 text-[8px] font-black text-blue-500 opacity-0 group-hover/match:opacity-100 uppercase tracking-tighter transition-opacity">
                          Szczegóły meczu →
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <Image src={nextMatch.awayTeam.logo} alt="" width={48} height={48} className="mx-auto mb-2 transition-transform group-hover/match:scale-110" />
                        <p className="text-xs font-bold uppercase truncate max-w-[80px]">{nextMatch.awayTeam.name}</p>
                      </div>
                    </Link>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm italic">Brak zaplanowanych meczów</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Table Widget */}
              <div className="bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 overflow-hidden w-full">
                <div className="flex items-center justify-between mb-6 px-2">
                  <div className="flex items-center gap-4">
                    <img 
                      src="https://i.ibb.co/ksb3b2Bs/obraz-2026-01-29-190552532.png" 
                      alt="7u7 Ekstraklasa" 
                      className="h-16 w-auto opacity-90"
                    />
                  </div>
                  <button onClick={() => setActiveTab('tabela')} className="text-xs font-bold text-gray-500 hover:text-white transition-colors flex items-center gap-1 uppercase tracking-widest">
                    Pełna tabela <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                
                <LeagueTable isInTab={true} compact={false} highlightId={id} />
              </div>
            </div>

            {/* Right Column - Stats/Lineup */}
            <div className="space-y-8 flex flex-col items-center">
              <div className="bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col items-center w-full">
                <div className="flex items-center justify-between w-full mb-6 px-2">
                  <h3 className="text-lg font-black uppercase flex items-center gap-2">
                    <Star className="w-5 h-5 text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    Statystyki
                  </h3>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ostatnia 11-tka</span>
                </div>
                
                {/* Field Visualization - Even longer and more professional */}
                <div className="relative aspect-[1/1.6] w-full bg-white/[0.03] backdrop-blur-xl rounded-[32px] border border-white/10 overflow-hidden group shadow-2xl">
                  {/* Field Lines - More visible */}
                  <div className="absolute inset-4 border border-white/20 rounded-2xl pointer-events-none" />
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-40 h-20 border-b border-x border-white/20 rounded-b-2xl pointer-events-none" />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-40 h-20 border-t border-x border-white/20 rounded-t-2xl pointer-events-none" />
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20 pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-white/20 rounded-full pointer-events-none" />
                  
                  {/* PFF Logo Watermark - Centered in circle */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.25] pointer-events-none z-0">
                    <img src="https://i.ibb.co/fVGvzTZX/image.png" alt="" className="w-28 h-28 object-contain" />
                  </div>
                  
                  {/* Players from last match - 5x7 grid */}
                  <div className="absolute inset-0 p-4 grid grid-cols-5 grid-rows-7 gap-1 z-10">
                    {lastLineup ? lastLineup.map((player: any, idx: number) => (
                      <div 
                        key={idx} 
                        className="flex flex-col items-center justify-center transition-all duration-500 hover:scale-110"
                        style={{ 
                          gridColumnStart: player.coords.col, 
                          gridRowStart: player.coords.row 
                        }}
                      >
                        <div className="relative group/player">
                          <div className="absolute -inset-2 bg-blue-500/20 rounded-full blur-xl opacity-0 group-hover/player:opacity-100 transition-opacity" />
                          <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-black border border-white/10 overflow-hidden shadow-2xl transition-transform group-hover/player:border-blue-500/50">
                            <RobloxAvatar username={player.name} className="w-full h-full object-cover rounded-full" />
                            {player.number && (
                              <div className="absolute bottom-0 right-0 bg-blue-600 text-[12px] font-black px-2 py-1.5 rounded-tl-xl border-t border-l border-white/20 shadow-xl text-white">
                                {player.number}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] font-black uppercase text-white/90 drop-shadow-lg text-center truncate max-w-[100px] tracking-tighter mt-2 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm">
                          {player.name}
                        </span>
                      </div>
                    )) : (
                      <div className="col-start-1 col-span-5 row-start-1 row-span-7 flex items-center justify-center">
                        <div className="text-center space-y-3 opacity-20">
                          <Users className="w-10 h-10 mx-auto" />
                          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Brak danych</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}

        {/* Table Tab Logic */}
        {activeTab === 'tabela' && (
          <div className="max-w-4xl mx-auto bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/5 rounded-[40px] p-6 md:p-8 overflow-hidden shadow-2xl">
            <div className="flex flex-col items-center mb-6">
              <img 
                src="https://i.ibb.co/ksb3b2Bs/obraz-2026-01-29-190552532.png" 
                alt="7u7 Ekstraklasa" 
                className="h-10 md:h-12 w-auto mb-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] opacity-90"
              />
              <div className="w-16 h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent mb-4" />
            </div>
            <div className="w-full">
              <LeagueTable isInTab={true} compact={true} highlightId={id} />
            </div>
          </div>
        )}

        {/* Existing Skład Tab Logic */}
        {activeTab === 'skład' && (
          <div className="bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
            <div className="p-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">{isRefereeCollege ? 'KADRA SĘDZIOWSKA' : 'KADRA ZESPOŁU'}</h2>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Sezon 2024/2025</p>
              </div>
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder="Szukaj zawodnika..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm font-black uppercase italic tracking-widest focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[1000px]">
                <thead>
                  <tr className="text-[10px] text-white/20 uppercase font-black tracking-[0.2em] border-b border-white/5 bg-white/[0.01]">
                    <th className="px-10 py-6">Gracz</th>
                    <th className="px-10 py-6 text-center">Kraj</th>
                    {!isRefereeCollege && <th className="px-10 py-6 text-center">Koszulka</th>}
                    <th className="px-10 py-6 text-right">{isRefereeCollege ? 'Rola' : 'Pozycja'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loadingPlayers ? (
                    <tr>
                      <td colSpan={4} className="px-10 py-32 text-center">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                        <p className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px]">Ładowanie kadry...</p>
                      </td>
                    </tr>
                  ) : filteredPlayers.length > 0 ? (
                    filteredPlayers.map((player) => {
                      // Mapping positions to Polish
                      const posMap: Record<string, string> = {
                        'GK': 'B',
                        'CB': 'ŚO',
                        'LB': 'LO',
                        'RB': 'PO',
                        'CM': 'ŚP',
                        'LM': 'LP',
                        'RM': 'PP',
                        'ST': 'ŚN',
                        'LW': 'LS',
                        'RW': 'PS',
                        'CAM': 'PO',
                        'CDM': 'DP'
                      };
                      
                      // Check country from history
                      const playerInHistory = history?.players?.[player.userId] || 
                                             Object.values(history?.players || {}).find((p: any) => p.name === player.username);
                      const hasCountry = !!playerInHistory;

                      // Get position from API if available
                      const apiPos = playerInHistory?.matches?.[0]?.position;
                      const effectivePos = apiPos || player.position;
                      const polishPos = isRefereeCollege ? 'Sędzia PFF' : (posMap[effectivePos || ''] || effectivePos || 'Z');

                      // Use shared market value calculation
                      const matches = playerInHistory?.matches || [];
                      const avgRating = matches.length > 0 
                        ? matches.reduce((acc: number, m: any) => acc + (m.rating || 0), 0) / matches.length 
                        : 6.0;

                      const marketValue = calculateMarketValue(player.stats, effectivePos, avgRating);
                      
                      const formatValue = (val: number) => {
                        if (val >= 1000000) return `${(val / 1000000).toFixed(1).replace('.', ',')} mln €`;
                        return `${(val / 1000).toFixed(1).replace('.', ',')} tys. €`;
                      };

                      return (
                        <tr key={player.userId} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="px-10 py-6">
                            <Link href={`/gracz/${player.username}`} className="flex items-center gap-5">
                              <div className="w-12 h-12 bg-white/[0.03] rounded-2xl border border-white/5 overflow-hidden group-hover:scale-110 group-hover:border-blue-500/30 transition-all">
                                <RobloxAvatar username={player.username} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-black italic uppercase tracking-tight group-hover:text-blue-400 transition-colors">
                                  {player.username}
                                </span>
                                {player.verified && (
                                  <div className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center">
                                    <svg className="w-2 h-2 text-white fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/></svg>
                                  </div>
                                )}
                              </div>
                            </Link>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex items-center justify-center gap-3">
                              {hasCountry ? (
                                <>
                                  <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 bg-white/5">
                                    <img src="https://flagcdn.com/w80/pl.png" className="w-full h-full object-cover" alt="" />
                                  </div>
                                  <span className="text-xs font-black italic uppercase text-white/40">Polska</span>
                                </>
                              ) : (
                                <>
                                  <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                                    <span className="text-[10px] text-white/20">?</span>
                                  </div>
                                  <span className="text-xs font-black italic uppercase text-white/20">Nieznana</span>
                                </>
                              )}
                            </div>
                          </td>
                          {!isRefereeCollege && (
                            <td className="px-10 py-6 text-center font-black italic text-white/80">
                              {playerNumbers[player.userId] || '--'}
                            </td>
                          )}
                          <td className="px-10 py-6 text-right">
                            <span className="font-black italic text-white/40 uppercase group-hover:text-white transition-colors">
                              {polishPos}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-10 py-32 text-center">
                        <Users className="w-12 h-12 text-white/5 mx-auto mb-6" />
                        <p className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px]">Brak zawodników w kadrze</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Mecze Tab Logic */}
        {activeTab === 'mecze' && (
          <div className="max-w-6xl mx-auto space-y-4">
            <div className="bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 md:p-16 shadow-2xl">
              <div className="flex flex-col items-center mb-12">
                <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4">Terminarz i wyniki</h2>
                <div className="w-32 h-1.5 bg-blue-600 rounded-full" />
              </div>

              <div className="space-y-2">
                {(() => {
                  // Merge matches (finished), fixtures (upcoming) and friendly matches
                  const combinedMatches = [
                    ...apiMatches
                      .filter(m => m.teamA === team.name || m.teamB === team.name)
                      .map(m => ({
                        id: m.uuid || m.id,
                        homeTeamName: m.teamA,
                        awayTeamName: m.teamB,
                        homeScore: m.scoreA,
                        awayScore: m.scoreB,
                        date: new Date(m.createdAt),
                        status: m.status,
                        type: 'match',
                        league: 'Ekstraklasa',
                        leagueLogo: 'https://i.ibb.co/MyfXtGLH/ekstraklasabaner-removebg-preview.png'
                      })),
                    ...apiFixtures
                      .filter(f => f?.teamA === team?.name || f?.teamB === team?.name)
                      .map(f => ({
                        id: f.id,
                        homeTeamName: f.teamA,
                        awayTeamName: f.teamB,
                        homeScore: f.scoreA,
                        awayScore: f.scoreB,
                        date: new Date(f.date),
                        status: f.status,
                        type: 'fixture',
                        league: 'Ekstraklasa',
                        leagueLogo: 'https://i.ibb.co/MyfXtGLH/ekstraklasabaner-removebg-preview.png'
                      })),
                    ...friendlyMatches
                      .filter(f => f.teamA === team.name || f.teamB === team.name)
                      .map(f => {
                        const [datePart, timePart] = f.date.split(' ');
                        const [day, month, year] = datePart.split('.').map(Number);
                        const [hours, minutes] = (timePart || '00:00').split(':').map(Number);
                        const matchDate = new Date(year, month - 1, day, hours, minutes);
                        
                        return {
                          id: f.matchUuid || f.uuid,
                          homeTeamName: f.teamA,
                          awayTeamName: f.teamB,
                          homeScore: f.scoreA,
                          awayScore: f.scoreB,
                          date: matchDate,
                          status: f.status,
                          type: 'friendly',
                          league: 'Mecze Towarzyskie',
                          leagueLogo: 'https://i.ibb.co/KxyY30Gk/towarzyskie.png'
                        };
                      })
                  ].sort((a, b) => b.date.getTime() - a.date.getTime());

                  if (combinedMatches.length === 0) {
                    return (
                      <div className="text-center py-32">
                        <Calendar className="w-16 h-16 text-white/5 mx-auto mb-8" />
                        <p className="text-white/20 font-black uppercase tracking-[0.4em] text-xs">Brak zaplanowanych meczów</p>
                      </div>
                    );
                  }

                  return combinedMatches.map((match, idx) => {
                    const isFinished = match.status === 'finished' || match.status === 'played';
                    
                    let resultColor = 'bg-green-500/90 shadow-[0_0_40px_rgba(34,197,94,0.3)]';
                    if (isFinished) {
                      const isTeamA = match.homeTeamName === team.name;
                      const scoreA = match.homeScore || 0;
                      const scoreB = match.awayScore || 0;
                      
                      if (scoreA === scoreB) {
                        resultColor = 'bg-blue-500/90 shadow-[0_0_40px_rgba(59,130,246,0.3)]';
                      } else if ((isTeamA && scoreA < scoreB) || (!isTeamA && scoreB < scoreA)) {
                        resultColor = 'bg-red-500/90 shadow-[0_0_40px_rgba(239,68,68,0.3)]';
                      }
                    }

                    const days = ['Niedz.', 'Pon.', 'Wt.', 'Śr.', 'Czw.', 'Pt.', 'Sob.'];
                    const months = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
                    
                    const dateStr = `${days[match.date.getDay()]}, ${match.date.getDate()} ${months[match.date.getMonth()]}`;
                    const timeStr = match.date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

                    const teamAData = teams.find(t => t.name === match.homeTeamName) || { logo: '', name: match.homeTeamName };
                    const teamBData = teams.find(t => t.name === match.awayTeamName) || { logo: '', name: match.awayTeamName };

                    return (
                      <Link 
                        key={match.id || idx} 
                        href={`/mecz/${match.id}`}
                        className="group block"
                      >
                        <div className="flex items-center justify-between py-8 border-b border-white/5 last:border-0 group-hover:bg-white/[0.02] transition-all rounded-[32px] px-8">
                          {/* Left: Date */}
                          <div className="w-40 text-center md:text-left">
                            <p className="text-sm font-black uppercase text-white/30 tracking-widest group-hover:text-white/60 transition-colors">
                              {dateStr}
                            </p>
                          </div>

                          {/* Center: Match Info */}
                          <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12">
                            {/* Team A */}
                            <div className="flex items-center gap-4 md:gap-6 flex-1 justify-center md:justify-end order-2 md:order-1">
                              <span className={`text-lg md:text-2xl font-black uppercase italic tracking-tighter text-right transition-colors ${match.homeTeamName === team.name ? 'text-blue-400' : 'text-white/90 group-hover:text-white'}`}>
                                {match.homeTeamName}
                              </span>
                              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center p-2 group-hover:scale-110 group-hover:border-blue-500/30 transition-all shadow-2xl backdrop-blur-md">
                                {teamAData.logo && <img src={teamAData.logo} alt="" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]" />}
                              </div>
                            </div>

                            {/* Result/Time */}
                            <div className="shrink-0 flex items-center justify-center min-w-[120px] md:min-w-[140px] order-1 md:order-2">
                              {isFinished ? (
                                <div className={`${resultColor} text-white px-6 md:px-8 py-2 md:py-3 rounded-2xl font-black text-2xl md:text-3xl tracking-tighter transform group-hover:scale-110 transition-transform`}>
                                  {match.homeScore} : {match.awayScore}
                                </div>
                              ) : (
                                <div className="bg-white/5 border border-white/10 text-white px-6 md:px-8 py-2 md:py-3 rounded-2xl font-black text-2xl md:text-3xl tracking-tighter shadow-xl backdrop-blur-md group-hover:border-white/20 transition-all">
                                  {timeStr}
                                </div>
                              )}
                            </div>

                            {/* Team B */}
                            <div className="flex items-center gap-4 md:gap-6 flex-1 justify-center md:justify-start order-3">
                              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center p-2 group-hover:scale-110 group-hover:border-blue-500/30 transition-all shadow-2xl backdrop-blur-md">
                                {teamBData.logo && <img src={teamBData.logo} alt="" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]" />}
                              </div>
                              <span className={`text-lg md:text-2xl font-black uppercase italic tracking-tighter text-left transition-colors ${match.awayTeamName === team.name ? 'text-blue-400' : 'text-white/90 group-hover:text-white'}`}>
                                {match.awayTeamName}
                              </span>
                            </div>
                          </div>

                          {/* Right: League Logo */}
                          <div className="hidden md:flex w-56 items-center justify-end gap-4 group-hover:scale-105 transition-all">
                            <div className="h-16 w-auto flex items-center justify-center">
                              <img src={match.leagueLogo} alt={match.league} className="h-full w-auto object-contain brightness-110" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}
        
        {/* Statystyki Tab */}
        {activeTab === 'statystyki' && clubStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Najlepszy strzelec */}
            <div className="bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/5 rounded-[32px] overflow-hidden flex flex-col shadow-2xl">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-black uppercase italic tracking-tighter text-sm text-white/40">Najlepszy strzelec</h3>
                <ChevronRight className="w-4 h-4 text-white/20" />
              </div>
              <div className="flex-1">
                {clubStats.topScorers.length > 0 ? clubStats.topScorers.map((p, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-white/5">
                        <RobloxAvatar username={p.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-black italic uppercase text-sm group-hover:text-blue-400 transition-colors">{p.name}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
                      <span className="font-black text-blue-400 text-sm">{p.goals}</span>
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center text-white/10 font-black italic uppercase text-xs">Brak danych</div>
                )}
              </div>
            </div>

            {/* Asysty */}
            <div className="bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/5 rounded-[32px] overflow-hidden flex flex-col shadow-2xl">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-black uppercase italic tracking-tighter text-sm text-white/40">Asysty</h3>
                <ChevronRight className="w-4 h-4 text-white/20" />
              </div>
              <div className="flex-1">
                {clubStats.topAssists.length > 0 ? clubStats.topAssists.map((p, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-white/5">
                        <RobloxAvatar username={p.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-black italic uppercase text-sm group-hover:text-blue-400 transition-colors">{p.name}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
                      <span className="font-black text-blue-400 text-sm">{p.assists}</span>
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center text-white/10 font-black italic uppercase text-xs">Brak danych</div>
                )}
              </div>
            </div>

            {/* Gole + asysty */}
            <div className="bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/5 rounded-[32px] overflow-hidden flex flex-col shadow-2xl">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-black uppercase italic tracking-tighter text-sm text-white/40">Gole + asysty</h3>
                <ChevronRight className="w-4 h-4 text-white/20" />
              </div>
              <div className="flex-1">
                {clubStats.topGplusA.length > 0 ? clubStats.topGplusA.map((p, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-white/5">
                        <RobloxAvatar username={p.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-black italic uppercase text-sm group-hover:text-blue-400 transition-colors">{p.name}</span>
                    </div>
                    <div className="w-10 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
                      <span className="font-black text-blue-400 text-sm">{p.goals + p.assists}</span>
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center text-white/10 font-black italic uppercase text-xs">Brak danych</div>
                )}
              </div>
            </div>

            {/* Ocena */}
            <div className="bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/5 rounded-[32px] overflow-hidden flex flex-col shadow-2xl">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-black uppercase italic tracking-tighter text-sm text-white/40">Ocena</h3>
                <ChevronRight className="w-4 h-4 text-white/20" />
              </div>
              <div className="flex-1">
                {clubStats.topRating.length > 0 ? clubStats.topRating.map((p, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-white/5">
                        <RobloxAvatar username={p.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-black italic uppercase text-sm group-hover:text-blue-400 transition-colors">{p.name}</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-pink-600/20 flex items-center justify-center">
                      <span className="font-black text-pink-400 text-sm">{p.rating.toFixed(2)}</span>
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center text-white/10 font-black italic uppercase text-xs">Brak danych</div>
                )}
              </div>
            </div>

            {/* Rozegrane mecze */}
            <div className="bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/5 rounded-[32px] overflow-hidden flex flex-col shadow-2xl">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-black uppercase italic tracking-tighter text-sm text-white/40">Rozegrane mecze</h3>
                <ChevronRight className="w-4 h-4 text-white/20" />
              </div>
              <div className="flex-1">
                {clubStats.topMatches.length > 0 ? clubStats.topMatches.map((p, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-white/5">
                        <RobloxAvatar username={p.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-black italic uppercase text-sm group-hover:text-blue-400 transition-colors">{p.name}</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-blue-600/20 flex items-center justify-center">
                      <span className="font-black text-blue-400 text-sm">{p.matches}</span>
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center text-white/10 font-black italic uppercase text-xs">Brak danych</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Transfery Tab */}
        {activeTab === 'transfery' && clubTransfers && (
          <div className="bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
            <div className="p-12 border-b border-white/5 bg-white/[0.02]">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-4">
                <ArrowRightLeft className="w-10 h-10 text-blue-500" />
                Historia Transferowa
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01]">
                    <th className="px-12 py-10 font-black uppercase italic tracking-widest text-[14px] text-white/40">Data</th>
                    <th className="px-12 py-10 font-black uppercase italic tracking-widest text-[14px] text-white/40">{isRefereeCollege ? 'Sędzia' : 'Zawodnik'}</th>
                    <th className="px-12 py-10 font-black uppercase italic tracking-widest text-[14px] text-white/40 text-center">Typ</th>
                    <th className="px-12 py-10 font-black uppercase italic tracking-widest text-[14px] text-white/40">{isRefereeCollege ? 'Klub' : 'Klub (Skąd / Dokąd)'}</th>
                  </tr>
                </thead>
                <tbody>
                  {clubTransfers.length > 0 ? clubTransfers.map((t, i) => {
                    const targetTeamName = t.type === 'IN' ? t.fromTeam : t.toTeam;
                    const targetTeam = teams.find(team => team.name === targetTeamName);
                    const formattedDate = new Date(t.date).toLocaleDateString('pl-PL', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    });

                    return (
                      <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-all group py-4">
                        <td className="px-12 py-10">
                          <span className="text-base font-black text-white/40 tabular-nums uppercase">{formattedDate}</span>
                        </td>
                        <td className="px-12 py-10">
                          <div className="flex items-center gap-8">
                            <div className="relative">
                              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 bg-white/5 transition-transform group-hover:scale-110 shadow-2xl">
                                <RobloxAvatar username={t.playerName} className="w-full h-full object-cover" />
                              </div>
                              {t.position && !isRefereeCollege && (
                                <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-[11px] font-black px-2.5 py-1 rounded-md border border-white/20 italic shadow-xl">
                                  {t.position}
                                </div>
                              )}
                            </div>
                            <span className="font-black italic uppercase text-2xl group-hover:text-blue-400 transition-colors tracking-tighter">{t.playerName}</span>
                          </div>
                        </td>
                        <td className="px-12 py-10 text-center">
                          <span className={`px-8 py-3.5 rounded-full font-black text-sm uppercase tracking-widest inline-block shadow-xl ${
                            t.type === 'IN' 
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-green-500/5' 
                              : 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-red-500/5'
                          }`}>
                            {t.type === 'IN' ? 'DOŁĄCZYŁ' : 'ODESZEDŁ'}
                          </span>
                        </td>
                        <td className="px-12 py-10">
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-2.5 shadow-lg group-hover:border-blue-500/30 transition-colors">
                              {targetTeam?.logo ? (
                                <img src={targetTeam.logo} alt="" className="w-full h-full object-contain" />
                              ) : (
                                <Users className="w-6 h-6 text-white/10" />
                              )}
                            </div>
                            <span className="text-xl font-black italic uppercase text-white/80 tracking-tight group-hover:text-white transition-colors">
                              {targetTeamName}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={4} className="px-12 py-40 text-center">
                        <div className="flex flex-col items-center gap-8 opacity-20">
                          <ArrowRightLeft className="w-20 h-20" />
                          <span className="font-black uppercase italic tracking-[0.3em] text-lg">Brak zarejestrowanych transferów</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Simple placeholder for other tabs */}
        {activeTab !== 'przegląd' && activeTab !== 'skład' && activeTab !== 'tabela' && activeTab !== 'mecze' && activeTab !== 'statystyki' && activeTab !== 'transfery' && (
          <div className="bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-20 text-center">
            <div className="w-20 h-20 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-gray-600" />
            </div>
            <h2 className="text-2xl font-black uppercase mb-2">Moduł w budowie</h2>
            <p className="text-gray-500 font-medium">Zakładka {activeTab.toUpperCase()} będzie dostępna wkrótce.</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
