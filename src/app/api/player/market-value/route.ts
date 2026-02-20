import { NextRequest, NextResponse } from 'next/server';
import { calculatePlayerMarketValue } from '@/lib/marketValue';
import { getPlayerStats, calculatePlayerHistoricalMarketValue } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      playerId,
      position,
      minutes,
      goals,
      assists,
      cleanSheets,
      concededGoals,
      yellowCards,
      redCards,
      matchId,
      matchResult,
      accountAgeDays,
      transferCount,
    } = body;

    if (!playerId || !position || minutes === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: playerId, position, minutes' },
        { status: 400 }
      );
    }

    if (!matchId || !matchId.startsWith('tf-')) {
      return NextResponse.json(
        { error: 'Market value calculation only available for friendly matches. Match ID must start with "tf-"' },
        { status: 403 }
      );
    }

    const currentStats = await getPlayerStats(playerId.toString());
    const currentValue = currentStats?.value || 50000;

    const calculation = calculatePlayerMarketValue({
      position,
      minutes: minutes || 0,
      goals: goals || 0,
      assists: assists || 0,
      cleanSheets: cleanSheets || 0,
      concededGoals: concededGoals || 0,
      yellowCards: yellowCards || 0,
      redCards: redCards || 0,
      matchId,
      matchResult,
      accountAgeDays,
      transferCount,
      currentValue,
    });

    console.log(`📊 Market Value Calculation for player ${playerId}:`, {
      oldValue: currentValue,
      newValue: calculation.newValue,
      change: calculation.newValue - currentValue,
      percentage: ((calculation.newValue - currentValue) / currentValue * 100).toFixed(2) + '%',
      ...calculation.breakdown,
    });

    return NextResponse.json({
      success: true,
      playerId,
      oldValue: currentValue,
      newValue: calculation.newValue,
      change: calculation.newValue - currentValue,
      calculation,
    });
  } catch (error) {
    console.error('Error calculating market value:', error);
    return NextResponse.json(
      { error: 'Failed to calculate market value' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');
    const matchId = searchParams.get('matchId');

    if (!playerId) {
      return NextResponse.json(
        { error: 'Missing playerId parameter' },
        { status: 400 }
      );
    }

    const isFriendlyMatch = matchId ? matchId.startsWith('tf-') : false;

    if (matchId && !isFriendlyMatch) {
      return NextResponse.json(
        { error: 'Market value calculation only available for friendly matches (tf-*)' },
        { status: 403 }
      );
    }

    const stats = await getPlayerStats(playerId);

    if (!stats) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    const historicalValue = await calculatePlayerHistoricalMarketValue(
      playerId,
      stats.position,
      undefined,
      undefined
    );

    console.log(`📊 [Market Value] Player ${playerId}:`, {
      currentValue: stats.value || 50000,
      historicalValue,
      usingHistorical: historicalValue !== 50000,
    });

    return NextResponse.json({
      success: true,
      playerId,
      value: historicalValue || stats.value || 50000,
      stats,
      isFriendlyMatch,
      historicalCalculation: historicalValue !== 50000,
    });
  } catch (error) {
    console.error('Error fetching market value:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market value' },
      { status: 500 }
    );
  }
}
