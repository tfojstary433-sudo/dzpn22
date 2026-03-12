'use client';

import { useState, useEffect, useCallback } from 'react';
import { teams } from './data';
import { getAllPlayerStats } from './firebase';
import { API_ENDPOINTS, TEAM_ID_MAPPING } from './constants';

// Helper functions for team logos and colors
export function getTeamLogo(teamId: string | number, teamName?: string): string {
  const idStr = String(teamId);
  
  // First try by direct ID (numeric or short)
  const team = teams.find(t => t.id === idStr || t.shortName === idStr || t.id === TEAM_ID_MAPPING[idStr]);
  if (team) return team.logo;

  // Then try mapping numeric ID to short name
  const mappedShortName = TEAM_ID_MAPPING[idStr];
  if (mappedShortName) {
    const mappedTeam = teams.find(t => t.id === mappedShortName || t.shortName === mappedShortName);
    if (mappedTeam) return mappedTeam.logo;
  }

  // Then try by name
  const nameToSearch = teamName || idStr;
  if (nameToSearch) {
    const normalizedName = nameToSearch.toLowerCase();
    const teamByName = teams.find(t => {
      const tName = t.name.toLowerCase();
      const tShort = t.shortName.toLowerCase();
      return tName === normalizedName || 
             normalizedName.includes(tName) || 
             tName.includes(normalizedName) ||
             (tShort.length > 2 && (normalizedName.includes(tShort) || tShort.includes(normalizedName)));
    });
    if (teamByName) return teamByName.logo;
  }
  
  return 'https://i.ibb.co/TB027G07/czarnepff-1.png';
}

export function getTeamColor(teamId: string | number, teamName?: string): string {
  const idStr = String(teamId);
  const team = teams.find(t => t.id === idStr || t.shortName === idStr || t.id === TEAM_ID_MAPPING[idStr]);
  if (team) return team.color || '#3b82f6';

  const mappedShortName = TEAM_ID_MAPPING[idStr];
  if (mappedShortName) {
    const mappedTeam = teams.find(t => t.id === mappedShortName || t.shortName === mappedShortName);
    if (mappedTeam) return mappedTeam.color || '#3b82f6';
  }

  const nameToSearch = teamName || idStr;
  if (nameToSearch) {
    const normalizedName = nameToSearch.toLowerCase();
    const teamByName = teams.find(t => {
      const tName = t.name.toLowerCase();
      const tShort = t.shortName.toLowerCase();
      return tName === normalizedName || 
             normalizedName.includes(tName) || 
             tName.includes(normalizedName);
    });
    if (teamByName) return teamByName.color || '#3b82f6';
  }

  return '#3b82f6';
}

export function getTeamName(teamId: string | number): string {
  const idStr = String(teamId);
  const team = teams.find(t => t.id === idStr || t.shortName === idStr || t.id === TEAM_ID_MAPPING[idStr]);
  if (team) return team.name;

  const mappedShortName = TEAM_ID_MAPPING[idStr];
  if (mappedShortName) {
    const mappedTeam = teams.find(t => t.id === mappedShortName || t.shortName === mappedShortName);
    if (mappedTeam) return mappedTeam.name;
  }

  // If the teamId itself looks like a name (not a number or short code)
  if (isNaN(Number(idStr)) && idStr.length > 3) {
    return idStr;
  }

  return idStr || 'Nieznany Klub';
}

export interface PlayerStats {
  playerId: number;
  name: string;
  teamId: string;
  teamName?: string;
  teamLogo?: string;
  goals: number;
  assists: number;
  points: number;
  cleanSheets: number;
  yellowCards: number;
  redCards: number;
  country?: string;
  position?: string;
  avatarUrl?: string;
}

export interface MatchResult {
  matchId: string;
  homeScore: number;
  awayScore: number;
  homeTeamId: string;
  awayTeamId: string;
  scorers: Array<{
    playerName: string;
    playerId: number;
    team: 'home' | 'away';
    goals: number;
  }>;
  finished: boolean;
  timestamp: string;
}

export interface TeamStanding {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  team?: {
    id: string;
    name: string;
    shortName: string;
    logo: string;
    color?: string;
  };
}

export function useMatchStats(season: string = 'current') {
  const [topScorers, setTopScorers] = useState<PlayerStats[]>([]);
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [finishedMatches, setFinishedMatches] = useState<Record<string, MatchResult>>({});

  const fetchFromServer = useCallback(async () => {
    try {
      const seasonQuery = season !== 'current' ? `?season=${season}` : '';
      
      // Use the local caching APIs
      const [historyRes, matchesRes] = await Promise.all([
        fetch(`/api/history${seasonQuery}`).catch(() => null),
        fetch(`/api/matches${seasonQuery}`).catch(() => null)
      ]);

      let historyData: any = null;
      let matchesData: any = null;

      if (historyRes && historyRes.ok) historyData = await historyRes.json();
      if (matchesRes && matchesRes.ok) matchesData = await matchesRes.json();

      let combinedPlayers: PlayerStats[] = [];

      // Process Player Stats from players-history.json
      if (historyData && historyData.players) {
        combinedPlayers = Object.entries(historyData.players).map(([id, player]: [string, any]) => {
          let goals = 0;
          let assists = 0;
          let yellowCards = 0;
          let redCards = 0;
          let cleanSheets = 0;

          // Aggregating from matches if available
          const matches = player.matches || (player.matchHistory ? Object.values(player.matchHistory) : []);
          matches.forEach((m: any) => {
            // Goals can be a number or an array of goal events
            const matchGoals = Array.isArray(m.goals) ? m.goals.length : (m.goals || 0);
            const matchAssists = Array.isArray(m.assists) ? m.assists.length : (m.assists || 0);
            
            goals += matchGoals;
            assists += matchAssists;

            // Handle cards
            if (m.cards && Array.isArray(m.cards)) {
              m.cards.forEach((c: any) => {
                if (c.type === 'yellow' || c.color === 'yellow') yellowCards++;
                if (c.type === 'red' || c.color === 'red') redCards++;
              });
            } else {
              yellowCards += m.yellowCards || 0;
              redCards += m.redCards || 0;
            }

            // Clean sheet logic for goalkeepers
            if ((player.position === 'BR' || player.position === 'GK') && m.cleanSheet) {
              cleanSheets++;
            }
          });

          // Find the latest team based on match history dates
          let latestTeamId = player.teamId || 'UNK';
          
          if (player.matchHistory) {
            // Sort matchHistory keys (which contain timestamps like match_1234567)
            const matchKeys = Object.keys(player.matchHistory).sort((a, b) => {
              const timeA = parseInt(a.split('_')[1]) || 0;
              const timeB = parseInt(b.split('_')[1]) || 0;
              return timeB - timeA; // Descending
            });
            
            if (matchKeys.length > 0) {
              latestTeamId = player.matchHistory[matchKeys[0]].playerTeam || player.matchHistory[matchKeys[0]].teamId || latestTeamId;
            }
          } else if (player.matches && player.matches.length > 0) {
            // If it's an array, sort by date/timestamp if available
            const sortedMatches = [...player.matches].sort((a, b) => {
              const dateA = new Date(a.date || a.timestamp || 0).getTime();
              const dateB = new Date(b.date || b.timestamp || 0).getTime();
              return dateB - dateA;
            });
            latestTeamId = sortedMatches[0].playerTeam || sortedMatches[0].teamId || latestTeamId;
          }

          return {
            playerId: parseInt(id) || 0,
            name: player.name || "Nieznany",
            teamId: latestTeamId,
            teamName: getTeamName(latestTeamId),
            teamLogo: getTeamLogo(latestTeamId, getTeamName(latestTeamId)),
            goals,
            assists,
            yellowCards,
            redCards,
            cleanSheets,
            points: goals + assists,
            country: player.country || "PL",
            position: player.position || "---",
            avatarUrl: player.avatar
          };
        });
        
        if (combinedPlayers.length > 0) {
          setTopScorers(combinedPlayers);
          localStorage.setItem('topScorers', JSON.stringify(combinedPlayers));
        }
      }

      // Process Team Standings from /api/matches
      if (matchesData) {
        const matchesArray = Array.isArray(matchesData) ? matchesData : (matchesData.matches || []);
        const teamStatsMap: Record<string, TeamStanding> = {};
        const finishedMap: Record<string, MatchResult> = {};

        matchesArray.forEach((m: any) => {
          const mId = m.id || m.matchId || m.uuid || Math.random().toString();
          const isFinished = m.status === 'FINISHED' || m.status === 'finished' || m.status === 'ZAKOŃCZONY';
          
          if (!isFinished) return;

          const scoreA = m.homeScore ?? m.scoreA ?? 0;
          const scoreB = m.awayScore ?? m.scoreB ?? 0;
          const teamA = m.homeTeamId || m.teamA;
          const teamB = m.awayTeamId || m.teamB;

          finishedMap[mId] = {
            matchId: mId,
            homeScore: scoreA,
            awayScore: scoreB,
            homeTeamId: teamA,
            awayTeamId: teamB,
            scorers: m.scorers || [],
            finished: true,
            timestamp: m.timestamp || new Date().toISOString()
          };

          [teamA, teamB].forEach(tId => {
            if (!tId) return;
            if (!teamStatsMap[tId]) {
              const shortName = TEAM_ID_MAPPING[tId] || (typeof tId === 'string' ? tId.substring(0, 3).toUpperCase() : tId);
              const teamData = teams.find(t => t.id === shortName || t.shortName === shortName || t.id === tId);
              
              teamStatsMap[tId] = {
                teamId: tId,
                played: 0,
                won: 0,
                drawn: 0,
                lost: 0,
                goalsFor: 0,
                goalsAgainst: 0,
                goalDifference: 0,
                points: 0,
                team: {
                  id: tId,
                  name: teamData?.name || getTeamName(tId),
                  shortName: shortName,
                  logo: getTeamLogo(tId, teamData?.name),
                  color: getTeamColor(tId, teamData?.name)
                }
              };
            }
          });

          if (teamA && teamB) {
            teamStatsMap[teamA].played++;
            teamStatsMap[teamB].played++;
            teamStatsMap[teamA].goalsFor += scoreA;
            teamStatsMap[teamA].goalsAgainst += scoreB;
            teamStatsMap[teamB].goalsFor += scoreB;
            teamStatsMap[teamB].goalsAgainst += scoreA;

            if (scoreA > scoreB) {
              teamStatsMap[teamA].won++;
              teamStatsMap[teamA].points += 3;
              teamStatsMap[teamB].lost++;
            } else if (scoreA < scoreB) {
              teamStatsMap[teamB].won++;
              teamStatsMap[teamB].points += 3;
              teamStatsMap[teamA].lost++;
            } else {
              teamStatsMap[teamA].drawn++;
              teamStatsMap[teamB].drawn++;
              teamStatsMap[teamA].points += 1;
              teamStatsMap[teamB].points += 1;
            }
          }
        });

        const calculatedStandings = Object.values(teamStatsMap).map(s => ({
          ...s,
          goalDifference: s.goalsFor - s.goalsAgainst
        })).sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);

        setStandings(calculatedStandings);
        localStorage.setItem('standings', JSON.stringify(calculatedStandings));
        
        setFinishedMatches(finishedMap);
        localStorage.setItem('matchStats', JSON.stringify(finishedMap));
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      loadLocalData();
    }
  }, [season]);

  useEffect(() => {
    loadStats();
    fetchFromServer();

    const handleStorageChange = () => {
      loadStats();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [season, fetchFromServer]);

  const loadLocalData = () => {
    try {
      const standingsData = localStorage.getItem('standings');
      const playersData = localStorage.getItem('topScorers');

      if (standingsData) {
        setStandings(JSON.parse(standingsData));
      } else {
        // Fallback to defaults from data.ts
        import('./data').then(data => {
          if (data.standings) {
            setStandings(data.standings.map((s, idx) => ({
              ...s,
              teamId: s.team.id,
              position: idx + 1
            })));
          }
        });
      }

      if (playersData) {
        setTopScorers(JSON.parse(playersData));
      } else {
        // Fallback to mockPlayersData
        import('./data').then(data => {
          if (data.mockPlayersData) {
            setTopScorers(data.mockPlayersData.map(p => ({
              playerId: p.playerId,
              name: p.name,
              teamId: p.teamId,
              goals: p.goals,
              assists: p.assists,
              points: p.goals + p.assists,
              cleanSheets: p.cleanSheets || 0,
              yellowCards: p.yellowCards || 0,
              redCards: p.redCards || 0
            })));
          }
        });
      }
    } catch (error) {
      console.error('Error loading local data:', error);
    }
  };

  const loadStats = () => {
    try {
      const scorersData = localStorage.getItem('topScorers');
      const standingsData = localStorage.getItem('standings');
      const matchesData = localStorage.getItem('matchStats');

      if (scorersData) {
        setTopScorers(JSON.parse(scorersData));
      }

      if (standingsData) {
        setStandings(JSON.parse(standingsData));
      } else {
        const initialStandings = teams.map(team => ({
          teamId: team.id,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0
        }));
        setStandings(initialStandings);
        localStorage.setItem('standings', JSON.stringify(initialStandings));
      }

      if (matchesData) {
        setFinishedMatches(JSON.parse(matchesData));
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const saveMatchResult = async (matchData: {
    matchId: string;
    homeTeamId: string;
    awayTeamId: string;
    homeScore: number;
    awayScore: number;
    scorers: Array<{
      playerName: string;
      playerId: number;
      teamId: string;
      goals: number;
      avatarUrl?: string;
    }>;
  }) => {
    try {
      console.log('🎯 Zapisywanie wyniku meczu na serwerze:', matchData);
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      
      const response = await fetch(`${baseUrl}/api/endmatch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(matchData)
      });

      if (response.ok) {
        console.log('✅ Wynik meczu zapisany na serwerze');
        await fetchFromServer();
        return { success: true };
      } else {
        const errorData = await response.json();
        console.error('❌ Błąd serwera:', errorData);
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error('❌ Błąd zapisywania wyniku meczu:', error);
      return { success: false, error };
    }
  };

  return {
    topScorers,
    standings,
    finishedMatches,
    saveMatchResult
  };
}
