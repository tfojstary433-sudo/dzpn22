
import { FIREBASE_BASE_URL } from './constants';
import { API_ENDPOINTS } from './constants';

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
    const response = await fetch(`${FIREBASE_BASE_URL}/users_clubs.json`, {
      next: { revalidate: 300 } // Cache for 5 minutes
    });
    if (!response.ok) return {};
    return await response.json() || {};
  } catch (error) {
    console.error('Error fetching all user clubs from Firebase:', error);
    return {};
  }
}

export async function getAllPlayerStats(): Promise<Record<string, PlayerFirebaseStats>> {
  try {
    const response = await fetch(`${FIREBASE_BASE_URL}/player_stats.json`, {
      next: { revalidate: 300 } // Cache for 5 minutes
    });
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

export async function getVerifiedPlayer(userId: string): Promise<{ discordId: string; discordUser: string } | null> {
  try {
    const response = await fetch(`${FIREBASE_BASE_URL}/VerifiedPlayers/${userId}.json`);
    if (!response.ok) return null;
    const data = await response.json();
    if (!data) return null;
    return {
      discordId: data.discordId,
      discordUser: data.discordUser
    };
  } catch (error) {
    console.error('Error fetching verified player from Firebase:', error);
    return null;
  }
}

export interface NewsArticle {
  id: string | number;
  category: string;
  title: string;
  image: string;
  description: string;
  content: string;
  date: string;
  author: string;
  isVertical?: boolean;
  relatedTeamIds?: string[];
}

const REPLIT_NEWS_URL = API_ENDPOINTS.ARTICLES;

export async function getNews(): Promise<NewsArticle[]> {
  try {
    const response = await fetch(REPLIT_NEWS_URL);
    if (!response.ok) return [];
    const data = await response.json();
    if (!data) return [];
    
    // API might return an object or an array
    const newsArray = Array.isArray(data) ? data : Object.keys(data).map(key => ({
      ...data[key],
      id: key
    }));

    return newsArray.sort((a: any, b: any) => {
      try {
        const parseDate = (dateStr: string) => {
          if (!dateStr) return 0;
          if (dateStr.includes('-')) return new Date(dateStr).getTime();
          const [datePart] = dateStr.split(',');
          const [day, month, year] = datePart.trim().split('.');
          return new Date(`${year}-${month}-${day}`).getTime();
        };
        
        return parseDate(b.date) - parseDate(a.date);
      } catch (e) {
        return 0;
      }
    });
  } catch (error) {
    console.error('Error fetching news from Replit:', error);
    return [];
  }
}

export async function saveNews(newsData: Omit<NewsArticle, 'id'>): Promise<boolean> {
  try {
    console.log('Saving news to Replit...', newsData);
    const response = await fetch(REPLIT_NEWS_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...newsData,
        isVertical: newsData.isVertical ?? false,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Replit save error:', response.status, errorText);
    }

    return response.ok;
  } catch (error) {
    console.error('Error saving news to Replit:', error);
    return false;
  }
}

export async function deleteNews(newsId: string): Promise<boolean> {
  try {
    const response = await fetch(`${REPLIT_NEWS_URL}/${newsId}`, {
      method: 'DELETE'
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting news from Replit:', error);
    return false;
  }
}

export async function getPlayerFriendlyMatches(userId: string): Promise<any[]> {
  try {
    const allMatches = await getMatchHistory();
    
    const friendlyMatches: any[] = [];
    
    for (const match of allMatches) {
      if (!match.matchId || !match.matchId.startsWith('tf-')) continue;
      if (!match.scorers && !match.extraStats) continue;
      
      const playerInMatch = 
        (match.scorers && Array.isArray(match.scorers) && 
         match.scorers.some((s: any) => s.playerId.toString() === userId)) ||
        (match.extraStats && Array.isArray(match.extraStats) && 
         match.extraStats.some((s: any) => s.playerId.toString() === userId));
      
      if (playerInMatch) {
        friendlyMatches.push(match);
      }
    }
    
    return friendlyMatches.sort((a: any, b: any) => 
      new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
    );
  } catch (error) {
    console.error('Error fetching player friendly matches:', error);
    return [];
  }
}

export async function aggregatePlayerMatchStats(userId: string, matches: any[]): Promise<{
  totalMatches: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  cleanSheets: number;
  concededGoals: number;
  totalMinutes: number;
  matchDetails: Array<{ matchId: string; goals: number; assists: number; yellowCards: number; redCards: number; cleanSheets: number; concededGoals: number; minutes: number; result: string; position: string; timestamp: string }>;
}> {
  const stats = {
    totalMatches: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    cleanSheets: 0,
    concededGoals: 0,
    totalMinutes: 0,
    matchDetails: [] as any[]
  };

  for (const match of matches) {
    if (!match.matchId || !match.matchId.startsWith('tf-')) continue;

    let playerGoals = 0;
    let playerAssists = 0;
    let playerYellow = 0;
    let playerRed = 0;
    let playerCleanSheets = 0;
    let playerConcededGoals = 0;
    let playerMinutes = 0;
    let playerTeam = '';
    let playerPosition = '';

    if (match.scorers && Array.isArray(match.scorers)) {
      const scorerEntry = match.scorers.find((s: any) => s.playerId.toString() === userId);
      if (scorerEntry) {
        playerGoals = scorerEntry.goals || 0;
        playerAssists = scorerEntry.assists || 0;
        playerTeam = scorerEntry.teamId;
        playerMinutes = scorerEntry.minutes || 0;
      }
    }

    if (match.extraStats && Array.isArray(match.extraStats)) {
      const extraEntry = match.extraStats.find((s: any) => s.playerId.toString() === userId);
      if (extraEntry) {
        playerYellow = extraEntry.yellowCards || 0;
        playerRed = extraEntry.redCards || 0;
        playerCleanSheets = extraEntry.cleanSheets || 0;
        playerConcededGoals = extraEntry.concededGoals || 0;
        playerMinutes = extraEntry.minutes || playerMinutes;
        playerTeam = extraEntry.teamId || playerTeam;
        playerPosition = extraEntry.position || playerPosition;
      }
    }

    if (playerGoals > 0 || playerYellow > 0 || playerRed > 0 || playerCleanSheets > 0 || playerConcededGoals > 0 || playerMinutes > 0) {
      stats.totalMatches++;
      stats.goals += playerGoals;
      stats.assists += playerAssists;
      stats.yellowCards += playerYellow;
      stats.redCards += playerRed;
      stats.cleanSheets += playerCleanSheets;
      stats.concededGoals += playerConcededGoals;
      stats.totalMinutes += playerMinutes;

      const matchResult = match.homeScore > match.awayScore 
        ? (playerTeam === match.homeTeamId ? 'win' : 'loss')
        : match.homeScore < match.awayScore
        ? (playerTeam === match.awayTeamId ? 'win' : 'loss')
        : 'draw';

      stats.matchDetails.push({
        matchId: match.matchId,
        goals: playerGoals,
        assists: playerAssists,
        yellowCards: playerYellow,
        redCards: playerRed,
        cleanSheets: playerCleanSheets,
        concededGoals: playerConcededGoals,
        minutes: playerMinutes,
        result: matchResult,
        position: playerPosition,
        timestamp: match.timestamp
      });
    }
  }

  return stats;
}

export async function calculatePlayerHistoricalMarketValue(
  userId: string,
  playerPosition?: string,
  accountAgeDays?: number,
  transferCount?: number
): Promise<number> {
  try {
    const friendlyMatches = await getPlayerFriendlyMatches(userId);
    
    if (friendlyMatches.length === 0) {
      return 50000;
    }

    const aggregated = await aggregatePlayerMatchStats(userId, friendlyMatches);

    if (aggregated.totalMatches === 0) {
      return 50000;
    }

    const { calculatePlayerMarketValue } = await import('./marketValue');

    let currentValue = 50000;
    const position = playerPosition || 'MID';

    for (const match of friendlyMatches) {
      if (!match.matchId || !match.matchId.startsWith('tf-')) continue;

      let playerGoals = 0;
      let playerAssists = 0;
      let playerYellow = 0;
      let playerRed = 0;
      let playerCleanSheets = 0;
      let playerConcededGoals = 0;
      let playerMinutes = 0;
      let playerTeam = '';
      let matchPosition = position;

      if (match.scorers && Array.isArray(match.scorers)) {
        const scorerEntry = match.scorers.find((s: any) => s.playerId.toString() === userId);
        if (scorerEntry) {
          playerGoals = scorerEntry.goals || 0;
          playerAssists = scorerEntry.assists || 0;
          playerTeam = scorerEntry.teamId;
          playerMinutes = scorerEntry.minutes || 0;
        }
      }

      if (match.extraStats && Array.isArray(match.extraStats)) {
        const extraEntry = match.extraStats.find((s: any) => s.playerId.toString() === userId);
        if (extraEntry) {
          playerYellow = extraEntry.yellowCards || 0;
          playerRed = extraEntry.redCards || 0;
          playerCleanSheets = extraEntry.cleanSheets || 0;
          playerConcededGoals = extraEntry.concededGoals || 0;
          playerMinutes = extraEntry.minutes || playerMinutes;
          playerTeam = extraEntry.teamId || playerTeam;
          matchPosition = extraEntry.position || position;
        }
      }

      if (playerMinutes > 0 || playerGoals > 0 || playerYellow > 0 || playerRed > 0) {
        const matchResult = match.homeScore > match.awayScore 
          ? (playerTeam === match.homeTeamId ? 'win' : 'loss')
          : match.homeScore < match.awayScore
          ? (playerTeam === match.awayTeamId ? 'win' : 'loss')
          : 'draw';

        const calculation = calculatePlayerMarketValue({
          position: (matchPosition as 'ATT' | 'MID' | 'DEF' | 'GK') || 'MID',
          minutes: playerMinutes,
          goals: playerGoals,
          assists: playerAssists,
          cleanSheets: playerCleanSheets,
          concededGoals: playerConcededGoals,
          yellowCards: playerYellow,
          redCards: playerRed,
          matchId: match.matchId,
          matchResult,
          accountAgeDays,
          transferCount,
          currentValue,
        });

        currentValue = calculation.newValue;
      }
    }

    return currentValue;
  } catch (error) {
    console.error('Error calculating historical market value:', error);
    return 50000;
  }
}
