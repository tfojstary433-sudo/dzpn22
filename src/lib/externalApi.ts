import { Standing, PlayerStat, Team } from './data';
import { API_ENDPOINTS } from './constants';

// Cache for API responses
interface CacheEntry {
  data: any;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const apiCache = new Map<string, CacheEntry>();

// Retry logic for API calls
async function fetchWithRetry(url: string, maxRetries = 3): Promise<any> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PFF-Website/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`API call failed (attempt ${i + 1}/${maxRetries}):`, error);
      if (i === maxRetries - 1) throw error;

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
}

// Get cached data or fetch new
async function getCachedData(url: string): Promise<any> {
  const cached = apiCache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const data = await fetchWithRetry(url);
  apiCache.set(url, { data, timestamp: Date.now() });
  return data;
}

// Fetch league table from external API
export async function fetchExternalLeagueTable(): Promise<Standing[]> {
  try {
    console.log('🔄 Fetching external league table...');
    const data = await getCachedData(API_ENDPOINTS.EXTERNAL_TABLE);
    console.log('📊 Raw external table data:', data);

    // Map external data to our Standing format
    const mapped = data.map((item: any, index: number) => ({
      position: index + 1,
      team: {
        id: item.team?.id || `ext${index}`,
        name: item.team?.name || item.name || 'Unknown Team',
        shortName: item.team?.shortName || item.shortName || item.name?.substring(0, 3) || 'UNK',
        logo: item.team?.logo || item.logo || `https://league-builder.replit.app/api/clubs/${item.team?.id || item.id || index}/logo`
      },
      played: item.played || item.matches || 0,
      won: item.won || 0,
      drawn: item.drawn || 0,
      lost: item.lost || 0,
      goalsFor: item.goalsFor || item.goals_for || 0,
      goalsAgainst: item.goalsAgainst || item.goals_against || 0,
      goalDifference: item.goalDifference || item.goal_difference || (item.goalsFor - item.goalsAgainst) || 0,
      points: item.points || 0
    }));

    console.log('✅ Mapped league table:', mapped);
    return mapped;
  } catch (error) {
    console.error('❌ Failed to fetch external league table:', error);
    return [];
  }
}

// Fetch player statistics from external API
export async function fetchExternalPlayerStats(): Promise<PlayerStat[]> {
  try {
    console.log('🔄 Fetching external player stats...');
    const data = await getCachedData(API_ENDPOINTS.EXTERNAL_STATS);
    console.log('📊 Raw external player stats:', data);

    // Map external data to our PlayerStat format
    const mapped = data.map((item: any) => ({
      playerId: item.playerId || item.id || Math.random(),
      name: item.name || item.playerName || 'Unknown Player',
      teamId: item.teamId || item.team?.id || 'unknown',
      goals: item.goals || 0,
      assists: item.assists || 0,
      yellowCards: item.yellowCards || item.yellow_cards || 0,
      redCards: item.redCards || item.red_cards || 0,
      avatarUrl: item.avatarUrl || item.avatar || undefined
    }));

    console.log('✅ Mapped player stats:', mapped);
    return mapped;
  } catch (error) {
    console.error('❌ Failed to fetch external player stats:', error);
    return [];
  }
}

// Sync external data with local data
export async function syncExternalData(): Promise<{
  leagueTable: Standing[];
  playerStats: PlayerStat[];
  success: boolean;
  message: string;
}> {
  try {
    console.log('🔄 Synchronizing external data...');

    const [externalTable, externalStats] = await Promise.all([
      fetchExternalLeagueTable(),
      fetchExternalPlayerStats()
    ]);

    console.log(`✅ Fetched ${externalTable.length} teams and ${externalStats.length} players from external APIs`);

    return {
      leagueTable: externalTable,
      playerStats: externalStats,
      success: true,
      message: `Successfully synced ${externalTable.length} teams and ${externalStats.length} players`
    };
  } catch (error) {
    console.error('❌ Failed to sync external data:', error);
    return {
      leagueTable: [],
      playerStats: [],
      success: false,
      message: `Failed to sync data: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Clear API cache
export function clearApiCache(): void {
  apiCache.clear();
  console.log('🧹 API cache cleared');
}

// Initialize cache clearing on module load
clearApiCache();