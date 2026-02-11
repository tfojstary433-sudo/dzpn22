import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Standing } from '@/lib/data';

interface Scorer {
  playerId: number;
  playerName: string;
  teamId: string;
  goals?: number;
  assists?: number;
  yellowCards?: number;
  redCards?: number;
  avatarUrl?: string;
}

interface PlayerStat {
  playerId: number;
  name: string;
  teamId: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  avatarUrl?: string;
}

interface MatchResultRequest {
  matchId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  scorers: Scorer[];
  lineups?: unknown;
}

const DATA_DIR = path.join(process.cwd(), 'src', 'data');

const readData = (filename: string) => {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
};

const saveData = (filename: string, data: unknown) => {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

export async function POST(request: NextRequest) {
  try {
    const matchResult: MatchResultRequest = await request.json();
    const { matchId, homeTeamId, awayTeamId, homeScore, awayScore, scorers, lineups } = matchResult;

    if (!matchId) {
      return NextResponse.json({ success: false, error: 'Missing matchId' }, { status: 400 });
    }

    console.log(`📥 Przetwarzanie meczu: ${matchId} (${homeTeamId} ${homeScore}:${awayScore} ${awayTeamId})`);

    // KROK 1 & WARUNEK STARTOWY - Sprawdź czy mecz został już przetworzony
    const history = readData('matches_history.json');
    if (history.find((m: unknown) => (m as { matchId: string }).matchId === matchId)) {
      return NextResponse.json({ success: false, error: 'Match already processed' }, { status: 400 });
    }

    // KROK 2 - ZAPIS WYNIKU MECZU
    const newHistoryEntry = {
      matchId,
      homeTeamId,
      awayTeamId,
      homeScore,
      awayScore,
      date: new Date().toISOString(),
      status: 'FINISHED',
      processed: true
    };
    history.push(newHistoryEntry);
    saveData('matches_history.json', history);

    // KROK 3 - AKTUALIZACJA TABELI LIGOWEJ
    const leagueTable: Standing[] = readData('league_table.json') as Standing[];
    const homeTeam = leagueTable.find((t) => t.team.id === homeTeamId);
    const awayTeam = leagueTable.find((t) => t.team.id === awayTeamId);

    if (homeTeam && awayTeam) {
      homeTeam.played += 1;
      awayTeam.played += 1;
      homeTeam.goalsFor += homeScore;
      homeTeam.goalsAgainst += awayScore;
      awayTeam.goalsFor += awayScore;
      awayTeam.goalsAgainst += homeScore;
      homeTeam.goalDifference = homeTeam.goalsFor - homeTeam.goalsAgainst;
      awayTeam.goalDifference = awayTeam.goalsFor - awayTeam.goalsAgainst;

      if (homeScore > awayScore) {
        homeTeam.points += 3;
        homeTeam.won += 1;
        awayTeam.lost += 1;
      } else if (homeScore < awayScore) {
        awayTeam.points += 3;
        awayTeam.won += 1;
        homeTeam.lost += 1;
      } else {
        homeTeam.points += 1;
        awayTeam.points += 1;
        homeTeam.drawn += 1;
        awayTeam.drawn += 1;
      }
      saveData('league_table.json', leagueTable);
    }

    // KROK 4 - STATYSTYKI ZAWODNIKÓW
    if (scorers && Array.isArray(scorers)) {
      const playerStats: PlayerStat[] = readData('player_statistics.json') as PlayerStat[];
      for (const scorer of scorers) {
        let player = playerStats.find((p) => p.playerId === scorer.playerId);
        if (!player) {
          player = {
            playerId: scorer.playerId,
            name: scorer.playerName,
            teamId: scorer.teamId,
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            avatarUrl: scorer.avatarUrl
          };
          playerStats.push(player);
        }
        player.goals += (scorer.goals || 0);
        player.assists += (scorer.assists || 0);
        player.yellowCards += (scorer.yellowCards || 0);
        player.redCards += (scorer.redCards || 0);
      }
      saveData('player_statistics.json', playerStats);
    }

    // KROK 5 - ZAPIS SKŁADÓW MECZU
    if (lineups) {
      const allLineups = readData('lineups.json');
      allLineups.push({
        matchId,
        lineups
      });
      saveData('lineups.json', allLineups);
    }

    // KROK 6 - USUNIĘCIE MECZU Z TERMINARZA
    const schedule = readData('matches_schedule.json');
    const updatedSchedule = schedule.filter((m: any) => m.id !== matchId);
    saveData('matches_schedule.json', updatedSchedule);

    return NextResponse.json({ 
      success: true, 
      message: 'Match processed successfully',
      matchId 
    });

  } catch (error) {
    console.error('❌ Błąd przetwarzania meczu:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
