import { NextRequest, NextResponse } from 'next/server';
import { FIREBASE_BASE_URL } from '@/lib/constants';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId, playerId, rating, type, prediction } = await request.json();

  if (!userId || (!playerId && type === 'motm') || (rating === undefined && type === 'rating') || (!prediction && type === 'winner')) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Używamy REST API Firebase (Realtime Database)
    // Zapisujemy głos pod kluczem match_votes/id/userId
    const voteUrl = `${FIREBASE_BASE_URL}/match_votes/${id}/${userId}.json`;
    
    const currentVoteRes = await fetch(voteUrl);
    const currentVote = await currentVoteRes.json() || {};

    const updatedVote = {
      ...currentVote,
      matchId: id,
      voterId: userId,
      timestamp: new Date().toISOString()
    };

    if (type === 'motm') {
      updatedVote.motmPlayerId = playerId;
    } else if (type === 'rating') {
      updatedVote.matchRating = rating;
    } else if (type === 'winner') {
      updatedVote.winnerPrediction = prediction;
    }

    const response = await fetch(voteUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedVote)
    });

    if (!response.ok) throw new Error('Failed to save vote');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Voting error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const response = await fetch(`${FIREBASE_BASE_URL}/match_votes/${id}.json`);
    if (!response.ok) throw new Error('Failed to fetch votes');
    
    const data = await response.json();
    if (!data) {
      return NextResponse.json({
        motm: { winnerId: null, votes: {}, totalVotes: 0 },
        averageRating: null,
        ratingCount: 0
      });
    }

    const votes = Object.values(data) as any[];
    
    // Oblicz wyniki
    const motmVotes: Record<string, number> = {};
    const winnerVotes: Record<string, number> = { home: 0, draw: 0, away: 0 };
    let totalRating = 0;
    let ratingCount = 0;
    let totalWinnerVotes = 0;

    votes.forEach(vote => {
      if (vote.motmPlayerId) {
        motmVotes[vote.motmPlayerId] = (motmVotes[vote.motmPlayerId] || 0) + 1;
      }
      if (vote.matchRating) {
        totalRating += vote.matchRating;
        ratingCount++;
      }
      if (vote.winnerPrediction) {
        winnerVotes[vote.winnerPrediction] = (winnerVotes[vote.winnerPrediction] || 0) + 1;
        totalWinnerVotes++;
      }
    });

    // Znajdź gracza z największą liczbą głosów
    let winnerId = null;
    let maxVotes = 0;
    for (const [pId, count] of Object.entries(motmVotes)) {
      if (count > maxVotes) {
        maxVotes = count;
        winnerId = pId;
      }
    }

    return NextResponse.json({
      motm: {
        winnerId,
        votes: motmVotes,
        totalVotes: Object.keys(motmVotes).length
      },
      averageRating: ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : null,
      ratingCount,
      winnerPredictions: {
        votes: winnerVotes,
        totalVotes: totalWinnerVotes
      }
    });
  } catch (error) {
    console.error('Fetch votes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
