
import { FIREBASE_BASE_URL } from './constants';

export interface PlayerFirebaseStats {
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  cleanSheets: number;
  matches: number;
  value?: number;
  number?: number;
  position?: string;
  name?: string;
  teamId?: string;
}

export async function getPlayerClub(userId: string): Promise<string | null> {
  try {
    const response = await fetch(`${FIREBASE_BASE_URL}/users_clubs/${userId}.json`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching player club from Firebase:', error);
    return null;
  }
}

export async function getPlayerStats(userId: string): Promise<PlayerFirebaseStats | null> {
  try {
    const response = await fetch(`${FIREBASE_BASE_URL}/player_stats/${userId}.json`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching player stats from Firebase:', error);
    return null;
  }
}

export async function getAllUserClubs(): Promise<Record<string, string>> {
  try {
    const response = await fetch(`${FIREBASE_BASE_URL}/users_clubs.json`);
    if (!response.ok) return {};
    return await response.json() || {};
  } catch (error) {
    console.error('Error fetching all user clubs from Firebase:', error);
    return {};
  }
}

export async function getAllPlayerStats(): Promise<Record<string, PlayerFirebaseStats>> {
  try {
    const response = await fetch(`${FIREBASE_BASE_URL}/player_stats.json`);
    if (!response.ok) return {};
    return await response.json() || {};
  } catch (error) {
    console.error('Error fetching all player stats from Firebase:', error);
    return {};
  }
}

export async function updatePlayerStats(userId: string, stats: Partial<PlayerFirebaseStats>): Promise<boolean> {
  try {
    const currentStats = await getPlayerStats(userId) || {
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      cleanSheets: 0,
      matches: 0
    };

    const newStats = {
      ...currentStats,
      goals: currentStats.goals + (stats.goals || 0),
      assists: currentStats.assists + (stats.assists || 0),
      yellowCards: currentStats.yellowCards + (stats.yellowCards || 0),
      redCards: currentStats.redCards + (stats.redCards || 0),
      cleanSheets: currentStats.cleanSheets + (stats.cleanSheets || 0),
      matches: currentStats.matches + (stats.matches || 0),
      name: stats.name || currentStats.name,
      teamId: stats.teamId || currentStats.teamId,
      position: stats.position || currentStats.position,
      value: stats.value || currentStats.value,
      number: stats.number || currentStats.number
    };

    const response = await fetch(`${FIREBASE_BASE_URL}/player_stats/${userId}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStats)
    });

    return response.ok;
  } catch (error) {
    console.error('Error updating player stats in Firebase:', error);
    return false;
  }
}

export async function saveMatchResult(matchData: any): Promise<boolean> {
  try {
    const response = await fetch(`${FIREBASE_BASE_URL}/match_history.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...matchData,
        timestamp: new Date().toISOString()
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Error saving match result to Firebase:', error);
    return false;
  }
}

export async function updateLiveMatch(matchData: any): Promise<boolean> {
  try {
    const response = await fetch(`${FIREBASE_BASE_URL}/live_match.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...matchData,
        lastUpdate: new Date().toISOString()
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Error updating live match in Firebase:', error);
    return false;
  }
}

export async function getLiveMatch(): Promise<any> {
  try {
    const response = await fetch(`${FIREBASE_BASE_URL}/live_match.json`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching live match from Firebase:', error);
    return null;
  }
}

export async function getMatchHistory(): Promise<any[]> {
  try {
    const response = await fetch(`${FIREBASE_BASE_URL}/match_history.json`);
    if (!response.ok) return [];
    const data = await response.json();
    if (!data) return [];
    
    // Convert object to array and sort by timestamp
    return Object.values(data).sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error('Error fetching match history from Firebase:', error);
    return [];
  }
}
