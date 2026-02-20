import { NextRequest, NextResponse } from 'next/server';
import { updatePlayerStats, saveMatchResult, getPlayerStats } from '@/lib/firebase';
import { calculatePlayerMarketValue } from '@/lib/marketValue';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      matchId, 
      homeTeamId, 
      awayTeamId, 
      homeScore, 
      awayScore, 
      scorers, 
      extraStats, 
      report,
      playerDetails = {} 
    } = body;

    if (!matchId) {
      return NextResponse.json({ success: false, error: 'Missing matchId' }, { status: 400 });
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 [ENDMATCH] Processing match: ${matchId}`);
    console.log(`${'='.repeat(60)}`);

    const isFriendlyMatch = matchId.startsWith('tf-');
    console.log(`🎯 Match type: ${isFriendlyMatch ? '⭐ FRIENDLY (towarzyski) - WARTOŚĆ ZMIENIA SIĘ' : '⚪ OFFICIAL (ligowy) - brak zmian wartości'}`);
    console.log(`🏠 ${homeTeamId} ${homeScore} : ${awayScore} ${awayTeamId}`);

    const matchResult = homeScore > awayScore ? 'win' : homeScore < awayScore ? 'loss' : 'draw';

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

    // 2. Update player statistics and market values
    const playerUpdates: Promise<any>[] = [];
    const marketValueUpdates: any[] = [];

    // Collect all player data
    const allPlayers = new Map();

    // Process scorers
    if (scorers && Array.isArray(scorers)) {
      scorers.forEach((s: any) => {
        const playerId = s.playerId.toString();
        if (!allPlayers.has(playerId)) {
          allPlayers.set(playerId, {
            id: playerId,
            name: s.playerName,
            teamId: s.teamId,
            goals: 0,
            assists: 0,
            minutes: 0,
            yellowCards: 0,
            redCards: 0,
            cleanSheets: 0,
            concededGoals: 0,
            position: playerDetails[playerId]?.position || 'ATT',
          });
        }
        const player = allPlayers.get(playerId);
        player.goals += s.goals || 0;
        player.assists += s.assists || 0;
        player.minutes = playerDetails[playerId]?.minutes || 40;
      });
    }

    // Process extra stats (cards, clean sheets)
    if (extraStats && Array.isArray(extraStats)) {
      extraStats.forEach((s: any) => {
        const playerId = s.playerId.toString();
        if (!allPlayers.has(playerId)) {
          allPlayers.set(playerId, {
            id: playerId,
            name: s.playerName,
            teamId: s.teamId,
            goals: 0,
            assists: 0,
            minutes: playerDetails[playerId]?.minutes || 40,
            yellowCards: 0,
            redCards: 0,
            cleanSheets: 0,
            concededGoals: 0,
            position: playerDetails[playerId]?.position || 'DEF',
          });
        }
        const player = allPlayers.get(playerId);
        player.yellowCards += s.yellowCards || 0;
        player.redCards += s.redCards || 0;
        player.cleanSheets += s.cleanSheets || 0;
        player.concededGoals += s.concededGoals || 0;
      });
    }

    // Update stats and calculate market value for each player
    for (const [playerId, playerData] of allPlayers) {
      const currentStats = await getPlayerStats(playerId);
      const currentValue = currentStats?.value || 50000;
      let newValue = currentValue;

      if (isFriendlyMatch) {
        const calculation = calculatePlayerMarketValue({
          position: playerData.position,
          minutes: playerData.minutes,
          goals: playerData.goals,
          assists: playerData.assists,
          cleanSheets: playerData.cleanSheets,
          concededGoals: playerData.concededGoals,
          yellowCards: playerData.yellowCards,
          redCards: playerData.redCards,
          matchId,
          matchResult: playerData.teamId === homeTeamId ? matchResult : matchResult === 'win' ? 'loss' : matchResult === 'loss' ? 'win' : 'draw',
          accountAgeDays: playerDetails[playerId]?.accountAgeDays,
          transferCount: playerDetails[playerId]?.transferCount,
          currentValue,
        });

        newValue = calculation.newValue;

        console.log(`📈 [FRIENDLY] Player ${playerData.name} (${playerId}):`, {
          oldValue: currentValue,
          newValue: calculation.newValue,
          change: calculation.newValue - currentValue,
        });

        marketValueUpdates.push({
          playerId,
          oldValue: currentValue,
          newValue: calculation.newValue,
          change: calculation.newValue - currentValue,
          calculation,
        });
      } else {
        console.log(`⚪ [OFFICIAL] Player ${playerData.name} (${playerId}): Wartość pozostaje bez zmian (${currentValue} €)`);
      }

      // Update player stats with new value
      playerUpdates.push(updatePlayerStats(playerId, {
        goals: playerData.goals,
        assists: playerData.assists,
        matches: 1,
        yellowCards: playerData.yellowCards,
        redCards: playerData.redCards,
        cleanSheets: playerData.cleanSheets,
        name: playerData.name,
        teamId: playerData.teamId,
        position: playerData.position,
        value: newValue,
      }));
    }

    await Promise.all(playerUpdates);

    return NextResponse.json({ 
      success: true, 
      message: 'Match processed and market values updated',
      marketValueUpdates,
    });
  } catch (error) {
    console.error('Error in /api/endmatch:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
