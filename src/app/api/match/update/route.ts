import { NextRequest, NextResponse } from 'next/server';
import { updateLiveMatch, getLiveMatch } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamAScore, teamBScore, timer, period } = body;
    
    const currentMatch = await getLiveMatch() || {};
    
    const updatedMatch = {
        ...currentMatch,
        teamA: { ...currentMatch.teamA, score: teamAScore !== undefined ? teamAScore : currentMatch.teamA?.score },
        teamB: { ...currentMatch.teamB, score: teamBScore !== undefined ? teamBScore : currentMatch.teamB?.score },
        timer: timer || currentMatch.timer,
        period: period || currentMatch.period
    };
    
    await updateLiveMatch(updatedMatch);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating match:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
