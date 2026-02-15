import { NextRequest, NextResponse } from 'next/server';
import { updateLiveMatch, getLiveMatch } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamAScore, teamBScore, timer, period, event } = body;
    
    const currentMatch = await getLiveMatch() || {};
    
    // Add event to events list if provided
    const events = currentMatch.events || { goals: [], cards: [], substitutions: [] };
    if (event) {
        if (event.type === 'goal') {
            events.goals.push({
                minute: parseInt(timer?.split(':')[0]) || 0,
                player: event.description?.split(' ')[0] || 'Zawodnik',
                team: event.team === 'A' ? 'home' : 'away',
                description: event.description
            });
        } else if (event.type === 'card') {
            events.cards.push({
                minute: parseInt(timer?.split(':')[0]) || 0,
                player: event.playerName || 'Zawodnik',
                team: event.team === 'A' ? 'home' : 'away',
                type: event.cardType // 'yellow' or 'red'
            });
        }
    }

    const updatedMatch = {
        ...currentMatch,
        teamA: { ...currentMatch.teamA, score: teamAScore !== undefined ? teamAScore : currentMatch.teamA?.score },
        teamB: { ...currentMatch.teamB, score: teamBScore !== undefined ? teamBScore : currentMatch.teamB?.score },
        timer: timer || currentMatch.timer,
        period: period || currentMatch.period,
        events: events
    };
    
    await updateLiveMatch(updatedMatch);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating match:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
