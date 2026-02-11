import { NextRequest, NextResponse } from 'next/server';
import { updateLiveMatch } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamA, teamB } = body;
    
    const matchData = {
        active: true,
        teamA: { nazwa: teamA.nazwa, score: 0 },
        teamB: { nazwa: teamB.nazwa, score: 0 },
        timer: '0:00',
        period: 'Pierwsza połowa'
    };
    
    await updateLiveMatch(matchData);
    
    console.log(`[API] Match started: ${teamA.nazwa} vs ${teamB.nazwa}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error starting match:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
