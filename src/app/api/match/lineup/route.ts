import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getMatchHistory } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    // Try to read from local lineups.json file
    const lineupsPath = path.join(process.cwd(), 'src/data/lineups.json');
    let lineupData = [];

    if (fs.existsSync(lineupsPath)) {
      const fileContent = fs.readFileSync(lineupsPath, 'utf8');
      if (fileContent.trim()) {
        lineupData = JSON.parse(fileContent);
      }
    }

    // If no local data, try to fetch from Firebase match history
    if (lineupData.length === 0) {
      try {
        const firebaseMatches = await getMatchHistory();

        // Convert Firebase match history to lineup format
        lineupData = firebaseMatches.map((match: any) => ({
          matchId: match.matchId || match.uuid || `match-${Date.now()}`,
          date: match.timestamp ? new Date(match.timestamp).toLocaleDateString('pl-PL') : '---',
          homeTeam: match.homeTeam || match.homeTeamId || '---',
          awayTeam: match.awayTeam || match.awayTeamId || '---',
          homeScore: match.homeScore || 0,
          awayScore: match.awayScore || 0,
          league: match.league || 'LL',
          lineup: [
            // Convert scorers to lineup format
            ...(match.scorers || []).map((scorer: any) => ({
              userId: scorer.playerId?.toString() || 'unknown',
              username: scorer.playerName || 'Unknown',
              goals: scorer.goals || 0,
              assists: scorer.assists || 0,
              yellowCards: 0,
              redCards: 0,
              rating: 0,
              minutes: 90,
              number: scorer.number || null
            })),
            // Convert extra stats to lineup format
            ...(match.extraStats || []).map((stat: any) => ({
              userId: stat.playerId?.toString() || 'unknown',
              username: stat.playerName || 'Unknown',
              goals: 0,
              assists: 0,
              yellowCards: stat.yellowCards || 0,
              redCards: stat.redCards || 0,
              rating: stat.rating || 0,
              minutes: stat.minutes || 90,
              number: stat.number || null
            }))
          ].filter((player, index, self) =>
            // Remove duplicates based on userId
            index === self.findIndex(p => p.userId === player.userId)
          )
        }));
      } catch (error) {
        console.error('Error fetching from Firebase:', error);
      }
    }

    return NextResponse.json(lineupData);
  } catch (error) {
    console.error('Error in lineup API:', error);
    return NextResponse.json({ error: 'Failed to fetch lineup data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uuid, team, formation, starters, bench } = body;

    // Read existing lineups
    const lineupsPath = path.join(process.cwd(), 'src/data/lineups.json');
    let existingLineups = [];

    if (fs.existsSync(lineupsPath)) {
      const fileContent = fs.readFileSync(lineupsPath, 'utf8');
      if (fileContent.trim()) {
        existingLineups = JSON.parse(fileContent);
      }
    }

    // Find or create match entry
    let matchEntry = existingLineups.find((m: any) => m.matchId === uuid);
    if (!matchEntry) {
      matchEntry = {
        matchId: uuid,
        date: new Date().toLocaleDateString('pl-PL'),
        homeTeam: team === 'A' ? 'Unknown' : 'Unknown', // Will be updated when match data is available
        awayTeam: team === 'B' ? 'Unknown' : 'Unknown',
        homeScore: 0,
        awayScore: 0,
        league: 'LL',
        lineup: []
      };
      existingLineups.push(matchEntry);
    }

    // Add players to lineup
    const allPlayers = [...(starters || []), ...(bench || [])];
    allPlayers.forEach(player => {
      const existingPlayer = matchEntry.lineup.find((p: any) => p.userId === player.id.toString());
      if (!existingPlayer) {
        matchEntry.lineup.push({
          userId: player.id.toString(),
          username: player.name,
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          rating: 0,
          minutes: 0, // Will be updated after match
          number: player.number,
          position: player.position
        });
      }
    });

    // Save to file
    fs.writeFileSync(lineupsPath, JSON.stringify(existingLineups, null, 2));

    return NextResponse.json({ success: true, message: 'Lineup saved successfully' });
  } catch (error) {
    console.error('Error saving lineup:', error);
    return NextResponse.json({ error: 'Failed to save lineup' }, { status: 500 });
  }
}
