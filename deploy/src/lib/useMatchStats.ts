'use client';

import { useState, useEffect } from 'react';
import { teams } from './data';

export interface PlayerStats {
  playerId: number;
  name: string;
  teamId: string;
  goals: number;
  assists: number;
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
}

export function useMatchStats() {
  const [topScorers, setTopScorers] = useState<PlayerStats[]>([]);
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [finishedMatches, setFinishedMatches] = useState<Record<string, MatchResult>>({});

  useEffect(() => {
    loadStats();
    
    const handleStorageChange = () => {
      loadStats();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
      console.log('🎯 Zapisywanie wyniku meczu:', matchData);
      
      // Załaduj aktualne dane
      const currentScorersData = localStorage.getItem('topScorers');
      const currentStandingsData = localStorage.getItem('standings');
      const currentMatchesData = localStorage.getItem('matchStats');
      
      const currentScorers = currentScorersData ? JSON.parse(currentScorersData) : [];
      const currentStandings = currentStandingsData ? JSON.parse(currentStandingsData) : teams.map(team => ({
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
      const currentMatches = currentMatchesData ? JSON.parse(currentMatchesData) : {};
      
      console.log('📊 Aktualne standing przed zapisem:', currentStandings);
      
      const updatedScorers = [...currentScorers];
      
      matchData.scorers.forEach(scorer => {
        const existingIndex = updatedScorers.findIndex(
          s => s.playerId === scorer.playerId
        );
        
        if (existingIndex >= 0) {
          updatedScorers[existingIndex].goals += scorer.goals;
        } else {
          updatedScorers.push({
            playerId: scorer.playerId,
            name: scorer.playerName,
            teamId: scorer.teamId,
            goals: scorer.goals,
            assists: 0,
            avatarUrl: scorer.avatarUrl
          });
        }
      });
      
      updatedScorers.sort((a, b) => b.goals - a.goals);
      console.log('⚽ Zaktualizowani strzelcy:', updatedScorers);

      const updatedStandings = currentStandings.map((standing: TeamStanding) => {
        if (standing.teamId === matchData.homeTeamId) {
          const won = matchData.homeScore > matchData.awayScore ? 1 : 0;
          const drawn = matchData.homeScore === matchData.awayScore ? 1 : 0;
          const lost = matchData.homeScore < matchData.awayScore ? 1 : 0;
          
          return {
            ...standing,
            played: standing.played + 1,
            won: standing.won + won,
            drawn: standing.drawn + drawn,
            lost: standing.lost + lost,
            goalsFor: standing.goalsFor + matchData.homeScore,
            goalsAgainst: standing.goalsAgainst + matchData.awayScore,
            goalDifference: standing.goalDifference + (matchData.homeScore - matchData.awayScore),
            points: standing.points + (won * 3) + (drawn * 1)
          };
        } else if (standing.teamId === matchData.awayTeamId) {
          const won = matchData.awayScore > matchData.homeScore ? 1 : 0;
          const drawn = matchData.awayScore === matchData.homeScore ? 1 : 0;
          const lost = matchData.awayScore < matchData.homeScore ? 1 : 0;
          
          return {
            ...standing,
            played: standing.played + 1,
            won: standing.won + won,
            drawn: standing.drawn + drawn,
            lost: standing.lost + lost,
            goalsFor: standing.goalsFor + matchData.awayScore,
            goalsAgainst: standing.goalsAgainst + matchData.homeScore,
            goalDifference: standing.goalDifference + (matchData.awayScore - matchData.homeScore),
            points: standing.points + (won * 3) + (drawn * 1)
          };
        }
        return standing;
      });

      updatedStandings.sort((a: TeamStanding, b: TeamStanding) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });
      
      console.log('📈 Zaktualizowana tabela:', updatedStandings);

      const matchResult: MatchResult = {
        matchId: matchData.matchId,
        homeScore: matchData.homeScore,
        awayScore: matchData.awayScore,
        homeTeamId: matchData.homeTeamId,
        awayTeamId: matchData.awayTeamId,
        scorers: matchData.scorers.map(s => ({
          playerName: s.playerName,
          playerId: s.playerId,
          team: s.teamId === matchData.homeTeamId ? 'home' as const : 'away' as const,
          goals: s.goals
        })),
        finished: true,
        timestamp: new Date().toISOString()
      };

      const updatedMatches = {
        ...currentMatches,
        [matchData.matchId]: matchResult
      };

      console.log('💾 Zapisywanie do localStorage...');
      localStorage.setItem('topScorers', JSON.stringify(updatedScorers));
      localStorage.setItem('standings', JSON.stringify(updatedStandings));
      localStorage.setItem('matchStats', JSON.stringify(updatedMatches));
      localStorage.setItem('finishedMatches', JSON.stringify(
        Object.keys(updatedMatches).reduce((acc, key) => {
          acc[key] = { 
            scoreA: updatedMatches[key].homeScore, 
            scoreB: updatedMatches[key].awayScore,
            status: 'finished'
          };
          return acc;
        }, {} as Record<string, any>)
      ));

      setTopScorers(updatedScorers);
      setStandings(updatedStandings);
      setFinishedMatches(updatedMatches);
      
      window.dispatchEvent(new Event('storage'));
      
      console.log('✅ Dane zapisane pomyślnie!');
      return { success: true };
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
