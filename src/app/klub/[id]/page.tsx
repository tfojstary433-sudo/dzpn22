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

const normalizeTeamName = (name: string) =>
  (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .trim();

export default function KlubPage() {
  const params = useParams();
  const router = useRouter();
  const id = decodeURIComponent(params.id as string);
  const team = useMemo(() => teams.find(t => t.id === id), [id]);
  
  const [activeTab, setActiveTab] = useState('przegląd');
  const [players, setPlayers] = useState<ClubPlayer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [history, setHistory] = useState<any>(null);
  const [apiFixtures, setApiFixtures] = useState<any[]>([]);
  const [apiMatches, setApiMatches] = useState<any[]>([]);
  const [apiStandings, setApiStandings] = useState<any[]>([]);
  const [friendlyMatches, setFriendlyMatches] = useState<any[]>([]);

  // Get filtered players
  const filteredPlayers = useMemo(() => {
    if (!debouncedSearchQuery) return players;
    const query = debouncedSearchQuery.toLowerCase();
    return players.filter(p => 
      p.username.toLowerCase().includes(query)
    );
  }, [players, debouncedSearchQuery]);
  const [playerNumbers, setPlayerNumbers] = useState<Record<string, number>>({});
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  // Get team stats from standings
  const teamStats = useMemo(() => standings.find(s => s.team.id === id), [id]);
  
  const parseMatchDate = (dateStr: string | undefined): Date => {
    if (!dateStr || dateStr === 'TBD' || dateStr === 'N/A') return new Date(0);
    
    const s = dateStr.trim();
    
    // Handle DD.MM.YYYY format (with optional time)
    if (s.includes('.')) {
      const parts = s.split(/\s+/);
      const d = parts[0];
      const t = parts[1] || '00:00';
      const dParts = d.split('.');
      if (dParts.length === 3) {
        const day = parseInt(dParts[0], 10);
        const mon = parseInt(dParts[1], 10);
        const yr = parseInt(dParts[2], 10);
        const tParts = t.split(':');
        const h = parseInt(tParts[0], 10) || 0;
        const m = parseInt(tParts[1], 10) || 0;
        const date = new Date(yr, mon - 1, day, h, m);
        if (!isNaN(date.getTime())) return date;
      }
    }
    
    // Handle ISO or other standard formats
    const date = new Date(s);
    if (!isNaN(date.getTime())) return date;

    // Fallback for YYYY-MM-DD HH:MM
    const match = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[\sT](\d{2}):(\d{2}))?/);
    if (match) {
      const d = new Date(
        parseInt(match[1], 10),
        parseInt(match[2], 10) - 1,
        parseInt(match[3], 10),
        parseInt(match[4], 10) || 0,
        parseInt(match[5], 10) || 0
      );
      if (!isNaN(d.getTime())) return d;
    }
    
    return new Date(0);
  };

  // Get team form (last 5 matches)
  const teamForm = useMemo(() => {
    if (!team) return [];
    const n = (s: string) => normalizeTeamName(s);
    const teamKeys = [n(team.name), n(team.shortName), n(team.id)].filter(Boolean);

    // Create a map of real scores from fixtures and history to fix incorrect API data
    const realScores: Record<string, { scoreA: number; scoreB: number }> = {};
    
    // First from apiFixtures (often more accurate than apiMatches)
    if (Array.isArray(apiFixtures)) {
      apiFixtures.forEach(f => {
        if (f.status === 'played' || f.status === 'finished') {
          const uuid = f.uuid || f.matchUuid || f.id;
          if (uuid && (f.scoreA !== null || f.scoreB !== null)) {
            realScores[uuid] = { 
              scoreA: f.scoreA ?? 0, 
              scoreB: f.scoreB ?? 0 
            };
          }
        }
      });
    }

    // Then from history (as fallback or addition)
    if (history && history.players) {
      Object.values(history.players).forEach((player: any) => {
        if (player.matches) {
          player.matches.forEach((m: any) => {
            const uuid = m.matchUuid || m.uuid;
            if (uuid && (m.scoreA > 0 || m.scoreB > 0)) {
              // Store if not exists or if higher total score found
              if (!realScores[uuid] || (m.scoreA + m.scoreB > realScores[uuid].scoreA + realScores[uuid].scoreB)) {
                realScores[uuid] = { scoreA: m.scoreA, scoreB: m.scoreB };
              }
            }
          });
        }
      });
    }

    if (Array.isArray(apiMatches) && apiMatches.length > 0) {
      return apiMatches
        .filter(m => {
          if (m.status !== 'finished' && m.status !== 'played') return false;
          
          const ta = n(m.teamA);
          const tb = n(m.teamB);
          const isOurTeam = teamKeys.some(key => key === ta || ta.includes(key) || key.includes(ta) || key === tb || tb.includes(key) || key.includes(tb));
          if (!isOurTeam) return false;

          const uuid = m.uuid || m.id;
          const rScore = realScores[uuid];

          // If it's 0-0 in apiMatches but we have a score in realScores, it's a valid match
          if (m.scoreA === 0 && m.scoreB === 0) {
            if (rScore && (rScore.scoreA > 0 || rScore.scoreB > 0)) return true;
            // Also allow if it has lineups (might really be 0-0)
            if (m.lineupA?.starters?.length || m.lineupB?.starters?.length || m.lineups?.A?.starters?.length || m.lineups?.B?.starters?.length) return true;
            
            // Special case: if it's in apiFixtures as 'played', we should probably show it even if 0-0
            const fixture = Array.isArray(apiFixtures) && apiFixtures.find(f => (f.uuid || f.matchUuid || f.id) === uuid);
            if (fixture && fixture.status === 'played') return true;

            return false;
          }
          
          return true;
        })
        .sort((a, b) => parseMatchDate(b.createdAt || b.date).getTime() - parseMatchDate(a.createdAt || a.date).getTime())
        .slice(0, 5)
        .map(m => {
          const uuid = m.uuid || m.id;
          const ta = n(m.teamA);
          const isTeamA = teamKeys.some(key => key === ta || ta.includes(key) || key.includes(ta));
          
          const rScore = realScores[uuid];
          let scoreA = m.scoreA ?? 0;
          let scoreB = m.scoreB ?? 0;
          
          // Override if realScores has data and API is 0-0 or doesn't match
          if (rScore && (scoreA === 0 && scoreB === 0)) {
            scoreA = rScore.scoreA;
            scoreB = rScore.scoreB;
          }

          const opponentName = isTeamA ? m.teamB : m.teamA;
          const opponent = teams.find(t => n(t.name) === n(opponentName) || n(t.shortName) === n(opponentName) || n(t.id) === n(opponentName)) || { name: opponentName, logo: '' };
          
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

    const allMatches = Array.isArray(apiFixtures) && apiFixtures.length > 0 ? apiFixtures : matches;
    
    return allMatches
      .filter(m => m.status === 'finished' && (m.homeTeam?.id === id || m.awayTeam?.id === id))
      .sort((a, b) => parseMatchDate(b.date).getTime() - parseMatchDate(a.date).getTime())
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
  }, [id, apiFixtures, apiMatches, team, history]);

  // Get next match
  const nextMatch = useMemo(() => {
    if (!team) return null;
    const n = (s: string) => normalizeTeamName(s);
    const teamKeys = [n(team.name), n(team.shortName), n(team.id)].filter(Boolean);

    // Priority 1: API fixtures
    const apiMatch = Array.isArray(apiFixtures)
      ? apiFixtures
        .filter(f => {
          if (f.status !== 'upcoming' && f.status !== 'scheduled') return false;
          const ta = n(f.homeTeam?.name || f.teamA || '');
          const tb = n(f.awayTeam?.name || f.teamB || '');
          return teamKeys.some(key => key === ta || ta.includes(key) || key.includes(ta) || key === tb || tb.includes(key) || key.includes(tb));
        })
        .sort((a, b) => parseMatchDate(a.date).getTime() - parseMatchDate(b.date).getTime())[0]
      : null;
    
    if (apiMatch) {
      const ht = apiMatch.homeTeam || teams.find(t => n(t.name) === n(apiMatch.teamA) || n(t.shortName) === n(apiMatch.teamA) || n(t.id) === n(apiMatch.teamA)) || { name: apiMatch.teamA || 'Nieznany', logo: 'https://i.ibb.co/6RwzB3Cc/obraz-2026-02-04-222253347-removebg-preview-1.png' };
      const at = apiMatch.awayTeam || teams.find(t => n(t.name) === n(apiMatch.teamB) || n(t.shortName) === n(apiMatch.teamB) || n(t.id) === n(apiMatch.teamB)) || { name: apiMatch.teamB || 'Nieznany', logo: 'https://i.ibb.co/6RwzB3Cc/obraz-2026-02-04-222253347-removebg-preview-1.png' };
      
      return {
        ...apiMatch,
        date: apiMatch.date === 'TBD' ? 'TBD' : parseMatchDate(apiMatch.date).toISOString(),
        homeTeam: ht,
        awayTeam: at
      };
    }

    // Friendly matches
    const friendlyMatch = Array.isArray(friendlyMatches)
      ? friendlyMatches
        .filter(f => {
          if (f.status !== 'scheduled' && f.status !== 'upcoming') return false;
          const ta = n(f.teamA || '');
          const tb = n(f.teamB || '');
          return teamKeys.some(key => key === ta || ta.includes(key) || key.includes(ta) || key === tb || tb.includes(key) || key.includes(tb));
        })
        .sort((a, b) => parseMatchDate(a.date).getTime() - parseMatchDate(b.date).getTime())[0]
      : null;

    if (friendlyMatch) {
      // Map friendly match to standard format for the widget
      return {
        id: friendlyMatch.uuid || friendlyMatch.matchUuid,
        date: friendlyMatch.date === 'TBD' ? 'TBD' : parseMatchDate(friendlyMatch.date).toISOString(),
        homeTeam: teams.find(t => t.name === friendlyMatch.teamA) || { name: friendlyMatch.teamA, logo: 'https://i.ibb.co/6RwzB3Cc/obraz-2026-02-04-222253347-removebg-preview-1.png' },
        awayTeam: teams.find(t => t.name === friendlyMatch.teamB) || { name: friendlyMatch.teamB, logo: 'https://i.ibb.co/6RwzB3Cc/obraz-2026-02-04-222253347-removebg-preview-1.png' },
        type: 'friendly'
      };
    }

    const finalMatch = matches
      .filter(m => m.status === 'upcoming' && (m.homeTeam?.id === id || m.awayTeam?.id === id))
      .sort((a, b) => parseMatchDate(a.date).getTime() - parseMatchDate(b.date).getTime())[0];

    if (finalMatch) {
      return {
        ...finalMatch,
        date: finalMatch.date === 'TBD' ? 'TBD' : parseMatchDate(finalMatch.date).toISOString()
      };
    }

    return null;
  }, [id, apiFixtures, friendlyMatches, team]);

  // Get last lineup
  const lastLineup = useMemo(() => {
    if (!team) return null;

    const getPositionsForLineup = (starters: any[]) => {
      const seen = new Set();
      const uniqueStarters = starters.filter(p => {
        const id = p.id || p.robloxId || p.userId || p.name || p.playerName;
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });

      // Group players by position
      const positionGroups: Record<string, any[]> = {
        GK: [],
        DEF: [],
        MID: [],
        ATT: []
      };

      uniqueStarters.forEach(p => {
        const pos = (p.position || '').toUpperCase().trim();
        if (pos.includes('GK') || pos === 'BR' || pos === 'BRAMKARZ' || pos === 'B' || pos.includes('BRAM')) {
          positionGroups.GK.push(p);
        } else if (pos.includes('DEF') || pos.includes('CB') || pos.includes('LB') || pos.includes('RB') || pos === 'ŚO' || pos === 'LO' || pos === 'PO' || pos === 'LWB' || pos === 'RWB' || pos === 'O' || pos === 'OB' || pos === 'OBRONA' || pos === 'SO' || pos.includes('OBRO')) {
          positionGroups.DEF.push(p);
        } else if (pos.includes('MID') || pos === 'CM' || pos === 'CDM' || pos === 'CAM' || pos === 'LM' || pos === 'RM' || pos === 'ŚP' || pos === 'DP' || pos === 'PP' || pos === 'LP' || pos === 'P' || pos === 'POMÓC' || pos === 'POMOC' || pos === 'SPD' || pos.includes('POMO')) {
          positionGroups.MID.push(p);
        } else {
          positionGroups.ATT.push(p);
        }
      });

      const result: any[] = [];
      
      const getCols = (count: number, rowType: 'DEF' | 'MID' | 'ATT') => {
        if (rowType === 'DEF') {
          if (count === 1) return [3];
          if (count === 2) return [2, 4];
          if (count === 3) return [2, 3, 4];
          return [1, 2, 4, 5];
        }
        // MID and ATT use [2, 3, 4] base
        if (count === 1) return [3];
        if (count === 2) return [2, 4];
        return [2, 3, 4];
      };

      // Force 4-3-3 Layout
      // GK: Row 7, Col 3
      if (positionGroups.GK.length > 0) {
        result.push({
          ...positionGroups.GK[0],
          name: positionGroups.GK[0].name || positionGroups.GK[0].playerName,
          coords: { col: 3, row: 7 }
        });
      }

      // DEF: Row 5
      const defs = positionGroups.DEF.slice(0, 4);
      const defCols = getCols(defs.length, 'DEF');
      defs.forEach((p, i) => {
        result.push({
          ...p,
          name: p.name || p.playerName,
          coords: { col: defCols[i], row: 5 }
        });
      });

      // MID: Row 3
      const mids = positionGroups.MID.slice(0, 3);
      const midCols = getCols(mids.length, 'MID');
      mids.forEach((p, i) => {
        result.push({
          ...p,
          name: p.name || p.playerName,
          coords: { col: midCols[i], row: 3 }
        });
      });

      // ATT: Row 1
      const atts = positionGroups.ATT.slice(0, 3);
      const attCols = getCols(atts.length, 'ATT');
      atts.forEach((p, i) => {
        result.push({
          ...p,
          name: p.name || p.playerName,
          coords: { col: attCols[i], row: 1 }
        });
      });

      return result;
    };

    // Priority 1: apiMatches (Latest league match)
    if (Array.isArray(apiMatches) && apiMatches.length > 0) {
      const n = (s: string) => normalizeTeamName(s);
      const teamKeys = [n(team.name), n(team.shortName), n(team.id)].filter(Boolean);

      const teamMatches = apiMatches
        .filter(m => {
          if (m.status !== 'finished' && m.status !== 'live' && m.status !== 'in_progress' && m.status !== 'played') return false;
          const ta = n(m.teamA);
          const tb = n(m.teamB);
          return teamKeys.some(key => key === ta || ta.includes(key) || key.includes(ta) || key === tb || tb.includes(key) || key.includes(tb));
        })
        .sort((a, b) => {
          const timeA = parseMatchDate(a.createdAt || a.date || 0).getTime();
          const timeB = parseMatchDate(b.createdAt || b.date || 0).getTime();
          if (timeB !== timeA) return timeB - timeA;
          return (b.uuid || b.id || '').localeCompare(a.uuid || a.id || '');
        });

      for (const match of teamMatches) {
        const ta = n(match.teamA);
        const isTeamA = teamKeys.some(key => key === ta || ta.includes(key) || key.includes(ta));
        const lineup = isTeamA ? (match.lineupA || match.lineups?.A) : (match.lineupB || match.lineups?.B);
        
        if (lineup?.starters && lineup.starters.length > 0) {
          const lineupPlayers = getPositionsForLineup(lineup.starters);
          if (lineupPlayers.length > 0) return lineupPlayers;
        }
      }
    }

    // Priority 2: History (fallback)
    if (!history || !history.players) return null;
    
    // Find all matches for this team
    const historicalTeamMatches: any[] = [];
    const n = (s: string) => normalizeTeamName(s);
    const teamKeys = team ? [n(team.name), n(team.shortName), n(team.id)].filter(Boolean) : [];

    Object.values(history.players).forEach((player: any) => {
      if (player.matches) {
        player.matches.forEach((m: any) => {
          const pt = n(m.playerTeam);
          if (teamKeys.some(key => key === pt || pt.includes(key) || key.includes(pt))) {
            historicalTeamMatches.push({
              ...m,
              playerName: player.name,
              robloxId: player.robloxId
            });
          }
        });
      }
    });

    if (historicalTeamMatches.length === 0) return null;

    // Group by matchUuid
    const matchesByUuid: Record<string, any[]> = {};
    historicalTeamMatches.forEach(m => {
      const uuid = m.matchUuid || m.uuid;
      if (uuid) {
        if (!matchesByUuid[uuid]) matchesByUuid[uuid] = [];
        matchesByUuid[uuid].push(m);
      }
    });

    // Sort match UUIDs by date
    const sortedMatchUuuids = Object.keys(matchesByUuid).sort((a, b) => {
      const dateA = parseMatchDate(matchesByUuid[a][0].playedAt || matchesByUuid[a][0].date).getTime();
      const dateB = parseMatchDate(matchesByUuid[b][0].playedAt || matchesByUuid[b][0].date).getTime();
      return dateB - dateA;
    });

    for (const uuid of sortedMatchUuuids) {
      const matchPlayers = matchesByUuid[uuid].filter(m => m.role === 'starter');
      if (matchPlayers.length > 0) {
        const result = getPositionsForLineup(matchPlayers);
        if (result.length > 0) return result;
      }
    }

    return null;
  }, [team, history, apiMatches]);

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

    const n = (s: string) => normalizeTeamName(s);
    const teamKeys = [n(team.name), n(team.shortName), n(team.id)].filter(Boolean);

    Object.values(history.players).forEach((player: any) => {
      // Only include players currently in the club
      if (currentSquadNames.size > 0 && !currentSquadNames.has(player.name)) {
        return;
      }

      player.matches.forEach((m: any) => {
        const pt = n(m.playerTeam);
        if (teamKeys.some(key => key === pt || pt.includes(key) || key.includes(pt))) {
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

    const n = (s: string) => normalizeTeamName(s);
    const teamKeys = [n(team.name), n(team.shortName), n(team.id)].filter(Boolean);

    Object.values(history.players).forEach((player: any) => {
      const playerMatches = [...(player.matches || [])].sort((a, b) => 
        parseMatchDate(a.playedAt || a.date).getTime() - parseMatchDate(b.playedAt || b.date).getTime()
      );

      for (let i = 0; i < playerMatches.length; i++) {
        const currentMatch = playerMatches[i];
        const prevMatch = i > 0 ? playerMatches[i - 1] : null;

        const matchDate = currentMatch.playedAt || currentMatch.date;

        const cpt = n(currentMatch.playerTeam);
        const isCurrentTeamMatch = teamKeys.some(key => key === cpt || cpt.includes(key) || key.includes(cpt));
        
        const ppt = prevMatch ? n(prevMatch.playerTeam) : '';
        const isPrevTeamMatch = prevMatch ? teamKeys.some(key => key === ppt || ppt.includes(key) || key.includes(ppt)) : false;

        // Joined the club
        if (isCurrentTeamMatch && (!prevMatch || !isPrevTeamMatch)) {
          transfers.push({
            playerName: player.name,
            type: 'IN',
            fromTeam: prevMatch?.playerTeam || 'Wolny Agent',
            date: matchDate,
            timestamp: parseMatchDate(matchDate).getTime(),
            position: currentMatch.position
          });
        }

        // Left the club
        if (prevMatch && isPrevTeamMatch && !isCurrentTeamMatch) {
          transfers.push({
            playerName: player.name,
            type: 'OUT',
            fromTeam: team.name,
            toTeam: currentMatch.playerTeam,
            date: matchDate,
            timestamp: parseMatchDate(matchDate).getTime(),
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
        setApiFixtures(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setApiFixtures([]);
      }
    }
    fetchFixtures();

    async function fetchStandings() {
      try {
        const res = await fetch('https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/api/table');
        const data = await res.json();
        setApiStandings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setApiStandings([]);
      }
    }
    fetchStandings();

    async function fetchFriendlyMatches() {
      try {
        const res = await fetch('https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/api/tournament/1/');
        const data = await res.json();
        if (data && data.fixtures) {
          setFriendlyMatches(data.fixtures);
        }
      } catch (err) {
        console.error('Error fetching friendly matches:', err);
      }
    }
    fetchFriendlyMatches();

    const fetchAllData = () => {
      fetch('https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/api/matches')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setApiMatches(data);
            const numbers: Record<string, number> = {};
            const n = (s: string) => normalizeTeamName(s);
            const teamKeys = team ? [n(team.name), n(team.shortName), n(team.id)].filter(Boolean) : [];

            data.sort((a, b) => parseMatchDate(a.createdAt || a.date || 0).getTime() - parseMatchDate(b.createdAt || b.date || 0).getTime()).forEach(match => {
              const processLineup = (lineup: any, isTargetTeam: boolean) => {
                if (!isTargetTeam) return;
                if (lineup?.starters) {
                  lineup.starters.forEach((p: any) => {
                    const pid = p.id || p.userId || p.robloxId;
                    if (pid) numbers[pid.toString()] = p.number;
                  });
                }
                if (lineup?.bench) {
                  lineup.bench.forEach((p: any) => {
                    const pid = p.id || p.userId || p.robloxId;
                    if (pid) numbers[pid.toString()] = p.number;
                  });
                }
              };

              const ta = n(match.teamA);
              const tb = n(match.teamB);
              const isTeamA = teamKeys.some(key => key === ta || ta.includes(key) || key.includes(ta));
              const isTeamB = teamKeys.some(key => key === tb || tb.includes(key) || key.includes(tb));

              processLineup(match.lineupA || match.lineups?.A, isTeamA);
              processLineup(match.lineupB || match.lineups?.B, isTeamB);
            });
            setPlayerNumbers(numbers);
          }
        })
        .catch(err => console.error('Error fetching match numbers:', err));
    };

    fetchAllData();
    const interval = setInterval(fetchAllData, 10000); // Refresh every 10 seconds to keep live info fresh
    return () => clearInterval(interval);
  }, [team]);

  useEffect(() => {
    if ((activeTab === 'skład' || activeTab === 'statystyki') && players.length === 0 && !loadingPlayers && team) {
      setLoadingPlayers(true);
      fetch(`/api/club/players/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.players && Array.isArray(data.players)) {
            // Filter out players named "BRAK"
            const filteredData = data.players.filter((p: any) => 
              p.username && p.username.toUpperCase() !== 'BRAK'
            );
            setPlayers(filteredData);
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
                 suppressHydrationWarning
                 style={{ backgroundImage: `radial-gradient(circle, ${team.color || '#3b82f6'} 0%, transparent 70%)` }} />
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
                    src={nextMatch?.type === 'friendly' ? "https://i.ibb.co/6RwzB3Cc/obraz-2026-02-04-222253347-removebg-preview-1.png" : "https://i.ibb.co/6RwzB3Cc/obraz-2026-02-04-222253347-removebg-preview-1.png"} 
                    alt="PFF Tournament" 
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
                          {nextMatch.date === 'TBD' ? 'TBD' : new Date(nextMatch.date).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase">
                          {nextMatch.date === 'TBD' ? 'DO USTALENIA' : (new Date(nextMatch.date).toLocaleDateString('pl-PL') === new Date().toLocaleDateString('pl-PL') ? 'Dzisiaj' : new Date(nextMatch.date).toLocaleDateString('pl-PL'))}
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
                      src="https://i.ibb.co/zgFJ7yt/obraz-2026-02-14-195348653.png" 
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
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">OSTATNIA 11-TKA</span>
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
                    <img src="https://i.ibb.co/tMkjssPP/LOGO-PFF.png" alt="" className="w-28 h-28 object-contain" />
                  </div>
                  
                  {/* Players from last match - 5x7 grid */}
                  <div className="absolute inset-0 p-4 grid grid-cols-5 grid-rows-7 gap-1 z-10">
                    {lastLineup && lastLineup.length > 0 ? lastLineup.map((player: any, idx: number) => (
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
                          <div className="relative w-9 h-9 md:w-12 md:h-12 rounded-full bg-black border border-white/10 overflow-hidden shadow-2xl transition-transform group-hover/player:border-blue-500/50">
                            <RobloxAvatar username={player.name} className="w-full h-full object-cover rounded-full" />
                            {player.number && (
                              <div className="absolute bottom-0 right-0 bg-blue-600 text-[10px] font-bold px-1.5 py-1 rounded-tl-lg border-t border-l border-white/20 shadow-xl text-white">
                                {player.number}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="text-[9px] font-bold uppercase text-white/90 drop-shadow-lg text-center truncate max-w-[100px] tracking-tighter mt-1 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm transition-all group-hover/player:bg-blue-600/80 group-hover/player:max-w-none group-hover/player:px-3">
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
                src="https://i.ibb.co/zgFJ7yt/obraz-2026-02-14-195348653.png" 
                alt="7u7 Ekstraklasa" 
                className="h-10 md:h-12 w-auto mb-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] opacity-90"
              />
              <div className="w-16 h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent mb-4" />
            </div>
            <div className="w-full">
              <LeagueTable isInTab={true} compact={false} highlightId={id} />
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
                  const n = (s: string) => normalizeTeamName(s);
                  const teamKeys = [n(team.name), n(team.shortName), n(team.id)].filter(Boolean);

                  const fixturesArray = Array.isArray(apiFixtures) ? apiFixtures : [];
                  const friendlyArray = Array.isArray(friendlyMatches) ? friendlyMatches : [];
                  
                  // Helper to parse date
                  const parseMatchDate = (d: any) => {
                    if (d && typeof d === 'string' && d.includes('.')) {
                      const [datePart, timePart] = d.split(' ');
                      const [day, month, year] = datePart.split('.').map(Number);
                      const [hours, minutes] = (timePart || '00:00').split(':').map(Number);
                      return new Date(year, month - 1, day, hours, minutes);
                    }
                    return new Date(d || Date.now());
                  };

                  const matchDateMap = new Map();
                  [...fixturesArray, ...friendlyArray].forEach(f => {
                    if (f.uuid || f.id || f.matchUuid) {
                      matchDateMap.set(f.uuid || f.id || f.matchUuid, parseMatchDate(f.date));
                    }
                  });

                  // Merge matches (finished), fixtures (upcoming) and friendly matches
                  const rawCombinedMatches = [
                    ...fixturesArray
                      .filter(f => {
                        const ta = n(f?.teamA || '');
                        const tb = n(f?.teamB || '');
                        return teamKeys.some(key => key === ta || ta.includes(key) || key.includes(ta) || key === tb || tb.includes(key) || key.includes(tb));
                      })
                      .map(f => ({
                        id: f.uuid || f.id,
                        homeTeamName: f.teamA,
                        awayTeamName: f.teamB,
                        homeScore: f.scoreA,
                        awayScore: f.scoreB,
                        date: parseMatchDate(f.date),
                        status: f.status,
                        type: 'fixture',
                        league: 'Ekstraklasa',
                        leagueLogo: 'https://i.ibb.co/6RwzB3Cc/obraz-2026-02-04-222253347-removebg-preview-1.png'
                      })),
                    ...(Array.isArray(apiMatches) ? apiMatches : [])
                      .filter(m => {
                        const ta = n(m.teamA || '');
                        const tb = n(m.teamB || '');
                        return teamKeys.some(key => key === ta || ta.includes(key) || key.includes(ta) || key === tb || tb.includes(key) || key.includes(tb));
                      })
                      .map(m => ({
                        id: m.uuid || m.id,
                        homeTeamName: m.teamA,
                        awayTeamName: m.teamB,
                        homeScore: m.scoreA,
                        awayScore: m.scoreB,
                        date: matchDateMap.get(m.uuid || m.id) || new Date(m.createdAt),
                        status: m.status,
                        type: 'match',
                        league: 'Ekstraklasa',
                        leagueLogo: 'https://i.ibb.co/6RwzB3Cc/obraz-2026-02-04-222253347-removebg-preview-1.png'
                      })),
                    ...friendlyArray
                      .filter(f => {
                        const ta = n(f.teamA || '');
                        const tb = n(f.teamB || '');
                        return teamKeys.some(key => key === ta || ta.includes(key) || key.includes(ta) || key === tb || tb.includes(key) || key.includes(tb));
                      })
                      .map(f => ({
                        id: f.uuid || f.matchUuid || f.id,
                        homeTeamName: f.teamA,
                        awayTeamName: f.teamB,
                        homeScore: f.scoreA,
                        awayScore: f.scoreB,
                        date: parseMatchDate(f.date),
                        status: f.status,
                        type: 'friendly',
                        league: 'Mecze Towarzyskie 2026',
                        leagueLogo: 'https://i.ibb.co/6RwzB3Cc/obraz-2026-02-04-222253347-removebg-preview-1.png'
                      }))
                  ];

                  // Deduplicate by ID
                  const seenIds = new Set();
                  const combinedMatches = rawCombinedMatches
                    .filter(m => {
                      if (!m.id || seenIds.has(m.id)) return false;
                      seenIds.add(m.id);
                      return true;
                    })
                    .sort((a, b) => b.date.getTime() - a.date.getTime());

                  if (combinedMatches.length === 0) {
                    return (
                      <div className="text-center py-32">
                        <Calendar className="w-16 h-16 text-white/5 mx-auto mb-8" />
                        <p className="text-white/20 font-black uppercase tracking-[0.4em] text-xs">Brak zaplanowanych meczów</p>
                      </div>
                    );
                  }

                  return combinedMatches.map((match, idx) => {
                    const isFinished = match.status === 'finished' || match.status === 'played' || (match.status === 'in_progress' && match.homeScore !== null);
                    
                    let resultColor = 'bg-green-500/90 shadow-[0_0_40px_rgba(34,197,94,0.3)]';
                    if (isFinished) {
                      const ta = n(match.homeTeamName);
                      const isTeamA = teamKeys.some(key => key === ta || ta.includes(key) || key.includes(ta));
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

                    const teamAData = teams.find(t => n(t.name) === n(match.homeTeamName) || n(t.shortName) === n(match.homeTeamName) || n(t.id) === n(match.homeTeamName)) || { logo: '', name: match.homeTeamName };
                    const teamBData = teams.find(t => n(t.name) === n(match.awayTeamName) || n(t.shortName) === n(match.awayTeamName) || n(t.id) === n(match.awayTeamName)) || { logo: '', name: match.awayTeamName };

                    const ta = n(match.homeTeamName);
                    const tb = n(match.awayTeamName);
                    const isTeamA = teamKeys.some(key => key === ta || ta.includes(key) || key.includes(ta));
                    const isTeamB = teamKeys.some(key => key === tb || tb.includes(key) || key.includes(tb));

                    return (
                      <Link 
                        key={match.id || idx} 
                        href={`/mecz/${match.id}`}
                        className="group block"
                      >
                        <div className="flex items-center justify-between py-8 border-b border-white/5 last:border-0 group-hover:bg-white/[0.02] transition-all rounded-[32px] px-8">
                          {/* Left: Date */}
                          <div className="w-40 text-center md:text-left">
                            <p className="text-sm font-bold uppercase text-white/30 tracking-widest group-hover:text-white/60 transition-colors">
                              {dateStr}
                            </p>
                          </div>

                          {/* Center: Match Info */}
                          <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12">
                            {/* Team A */}
                            <div className="flex items-center gap-4 md:gap-6 flex-1 justify-center md:justify-end order-2 md:order-1">
                              <span className={`text-lg md:text-2xl font-bold uppercase italic tracking-tighter text-right transition-colors ${isTeamA ? 'text-blue-400' : 'text-white/90 group-hover:text-white'}`}>
                                {match.homeTeamName}
                              </span>
                              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center p-2 group-hover:scale-110 group-hover:border-blue-500/30 transition-all shadow-2xl backdrop-blur-md">
                                {teamAData.logo && <img src={teamAData.logo} alt="" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]" />}
                              </div>
                            </div>

                            {/* Result/Time */}
                            <div className="shrink-0 flex items-center justify-center min-w-[120px] md:min-w-[140px] order-1 md:order-2">
                              {isFinished ? (
                                <div className={`${resultColor} text-white px-6 md:px-8 py-2 md:py-3 rounded-2xl font-bold text-2xl md:text-3xl tracking-tighter transform group-hover:scale-110 transition-transform`}>
                                  {match.homeScore ?? 0} : {match.awayScore ?? 0}
                                </div>
                              ) : (
                                <div className="bg-white/5 border border-white/10 text-white px-6 md:px-8 py-2 md:py-3 rounded-2xl font-bold text-2xl md:text-3xl tracking-tighter shadow-xl backdrop-blur-md group-hover:border-white/20 transition-all">
                                  {timeStr}
                                </div>
                              )}
                            </div>

                            {/* Team B */}
                            <div className="flex items-center gap-4 md:gap-6 flex-1 justify-center md:justify-start order-3">
                              <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center p-2 group-hover:scale-110 group-hover:border-blue-500/30 transition-all shadow-2xl backdrop-blur-md">
                                {teamBData.logo && <img src={teamBData.logo} alt="" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]" />}
                              </div>
                              <span className={`text-lg md:text-2xl font-bold uppercase italic tracking-tighter text-left transition-colors ${isTeamB ? 'text-blue-400' : 'text-white/90 group-hover:text-white'}`}>
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
                              ) : targetTeamName === 'Wolny Agent' ? (
                                <img src="https://www.fifacm.com/content/media/imgs/fifa21/teams/256/l111592.png" alt="" className="w-full h-full object-contain" />
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
