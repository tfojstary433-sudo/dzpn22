import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { fetchExternalLeagueTable, fetchExternalPlayerStats } from '@/lib/externalApi';
import { Standing, PlayerStat } from '@/lib/data';
import { API_ENDPOINTS } from '@/lib/constants';

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
    console.log('🔄 Starting external data synchronization from Replit...');

    // Fetch data directly from Replit API
    const [tableRes, playersRes] = await Promise.all([
      fetch(API_ENDPOINTS.EXTERNAL_TABLE),
      fetch(API_ENDPOINTS.EXTERNAL_STATS)
    ]);

    let externalTable: any[] = [];
    let externalStats: any[] = [];

    if (tableRes.ok) {
      const rawTable = await tableRes.json();
      // Ensure unique team IDs
      const usedIds = new Set<string>();
      externalTable = rawTable.map((t: any, index: number) => {
        let teamId = t.team?.id || `team_${index}`;
        if (usedIds.has(teamId)) {
          teamId = `${teamId}_${index}`;
        }
        usedIds.add(teamId);

        return {
          ...t,
          team: {
            ...t.team,
            id: teamId
          }
        };
      });
      console.log(`📊 Fetched ${externalTable.length} teams from Replit API`);
    }

    if (playersRes.ok) {
      externalStats = await playersRes.json();
      console.log(`📊 Fetched ${externalStats.length} players from Replit API`);
    }

    // Save league table
    if (externalTable.length > 0) {
      saveData('league_table.json', externalTable);
      console.log(`✅ Saved ${externalTable.length} teams to league table`);
    } else {
      console.log('⚠️ No teams data received from Replit');
    }

    // Save player statistics
    if (externalStats.length > 0) {
      saveData('player_statistics.json', externalStats);
      console.log(`✅ Saved ${externalStats.length} players to statistics`);
    } else {
      console.log('⚠️ No players data received from Replit');
    }

    // Also update public files for direct access
    if (externalTable.length > 0) {
      saveData('../public/data/league_table.json', externalTable);
    }
    if (externalStats.length > 0) {
      saveData('../public/data/player_statistics.json', externalStats);
    }

    return NextResponse.json({
      success: true,
      message: 'External data synced successfully from Replit',
      teamsCount: externalTable.length,
      playersCount: externalStats.length,
    });
  } catch (error) {
    console.error('❌ Error syncing external data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync external data from Replit' },
      { status: 500 }
    );
  }
}