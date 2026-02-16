import { REPLIT_API_BASE_URL } from '@/lib/constants';
import { getLiveMatch } from '@/lib/firebase';
import { fetchWithTimeout } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1) Try Replit list endpoint first (prefer external source of truth)
    try {
      const res = await fetchWithTimeout(`${REPLIT_API_BASE_URL}/api/matches`, { cache: 'no-store', timeout: 3000 });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (Array.isArray(data?.matches) ? data.matches : []);
        if (list.length > 0) {
          const mapped = list.map((m: any) => ({
            uuid: m.uuid || m.id || 'unknown',
            isActive: m.isActive === true || m.status === 'active' || m.status === 'live' || m.status === 'playing' || (m.timer && m.timer !== '0:00' && m.timer !== '00:00' && m.status !== 'finished' && m.status !== 'scheduled'),
            status: m.status || (m.isActive ? 'active' : 'unknown'),
            teamA: m.teamA || m.homeTeam || 'Team A',
            teamB: m.teamB || m.awayTeam || 'Team B',
            scoreA: m.scoreA ?? 0,
            scoreB: m.scoreB ?? 0,
            timer: m.timer || '0:00',
            period: m.period || 'Pierwsza połowa'
          }));
          return Response.json(mapped);
        }
      }
    } catch (e) {
      // ignore and fallback
    }

    // 2) Try Replit single current match endpoint as a pseudo-list
    try {
      const resOne = await fetchWithTimeout(`${REPLIT_API_BASE_URL}/api/match`, { cache: 'no-store', timeout: 3000 });
      if (resOne.ok) {
        const m = await resOne.json();
        if (m && (m.isActive || m.status === 'active')) {
          const formatted = [{
            uuid: m.uuid || m.id || 'live-match-1',
            isActive: m.isActive === true || m.status === 'active' || m.status === 'live' || m.status === 'playing' || (m.timer && m.timer !== '0:00' && m.timer !== '00:00' && m.status !== 'finished' && m.status !== 'scheduled'),
            status: m.status || (m.isActive ? 'active' : 'unknown'),
            teamA: m.teamA || m.homeTeam || 'Team A',
            teamB: m.teamB || m.awayTeam || 'Team B',
            scoreA: m.scoreA ?? 0,
            scoreB: m.scoreB ?? 0,
            timer: m.timer || '0:00',
            period: m.period || 'Pierwsza połowa'
          }];
          return Response.json(formatted);
        }
      }
    } catch (e) {
      // ignore and fallback
    }

    // 3) Fallback to Firebase live match (keeps previous behavior)
    const liveMatch = await getLiveMatch();
    if (liveMatch && liveMatch.active) {
      const formattedMatch = {
        uuid: 'live-match-1',
        isActive: true,
        status: 'active',
        teamA: liveMatch.teamA?.nazwa || 'Team A',
        teamB: liveMatch.teamB?.nazwa || 'Team B',
        scoreA: liveMatch.teamA?.score || 0,
        scoreB: liveMatch.teamB?.score || 0,
        timer: liveMatch.timer || '0:00',
        period: liveMatch.period || 'Pierwsza połowa'
      };
      return Response.json([formattedMatch]);
    }

    // Nothing found anywhere
    return Response.json([]);
  } catch (error) {
    console.error('Error fetching matches list:', error);
    return Response.json([], { status: 500 });
  }
}
