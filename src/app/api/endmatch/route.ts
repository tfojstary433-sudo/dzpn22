import { NextRequest, NextResponse } from 'next/server';
import { updatePlayerStats, saveMatchResult } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId, homeTeamId, awayTeamId, homeScore, awayScore, scorers, extraStats, report } = body;

    if (!matchId) {
      return NextResponse.json({ success: false, error: 'Missing matchId' }, { status: 400 });
    }

    console.log(`[API] Processing match: ${matchId}`);

    // 1. Save match result to history
    await saveMatchResult({
      matchId,
      homeTeamId,
      awayTeamId,
      homeScore,
      awayScore,
      scorers,
      extraStats,
      report,
      status: 'FINISHED'
    });

    // 2. Update player statistics
    const playerUpdates: Promise<any>[] = [];

    // Process scorers
    if (scorers && Array.isArray(scorers)) {
      scorers.forEach((s: any) => {
        playerUpdates.push(updatePlayerStats(s.playerId.toString(), {
          goals: s.goals || 0,
          assists: s.assists || 0,
          matches: 1,
          name: s.playerName,
          teamId: s.teamId
        }));
      });
    }

    // Process extra stats (cards, clean sheets)
    if (extraStats && Array.isArray(extraStats)) {
      extraStats.forEach((s: any) => {
        playerUpdates.push(updatePlayerStats(s.playerId.toString(), {
          yellowCards: s.yellowCards || 0,
          redCards: s.redCards || 0,
          cleanSheets: s.cleanSheets || 0,
          name: s.playerName,
          teamId: s.teamId,
          // If they weren't in scorers, we still count the match
          matches: scorers?.find((sc: any) => sc.playerId === s.playerId) ? 0 : 1
        }));
      });
    }

    await Promise.all(playerUpdates);

    return NextResponse.json({ success: true, message: 'Match processed and saved to Firebase' });
  } catch (error) {
    console.error('Error in /api/endmatch:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
