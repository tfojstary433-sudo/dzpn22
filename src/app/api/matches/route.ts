import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { REPLIT_API_BASE_URL } from '@/lib/constants';
import { getLiveMatch } from '@/lib/firebase';
import { fetchWithTimeout } from '@/lib/utils';

const CACHE_FILE = path.join(process.cwd(), 'src', 'data', 'cached_matches_list.json');

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season') || 'current';

    if (season !== 'current') {
      const archivedFile = path.join(process.cwd(), 'src', 'data', 'seasons', season, 'matches.json');
      if (fs.existsSync(archivedFile)) {
        const archivedData = fs.readFileSync(archivedFile, 'utf-8');
        return NextResponse.json(JSON.parse(archivedData));
      }
      return NextResponse.json([]);
    }

    // 0. Check cache freshness
    if (fs.existsSync(CACHE_FILE)) {
      const stats = fs.statSync(CACHE_FILE);
      const diffMinutes = (new Date().getTime() - stats.mtime.getTime()) / (1000 * 60);
      
      if (diffMinutes < 5) {
        const cachedData = fs.readFileSync(CACHE_FILE, 'utf-8');
        return NextResponse.json(JSON.parse(cachedData));
      }
    }

    let results: any[] = [];

    // 1) Try Replit list endpoint first (prefer external source of truth)
    try {
      const res = await fetchWithTimeout(`${REPLIT_API_BASE_URL}/api/matches`, { cache: 'no-store', timeout: 3000 });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (Array.isArray(data?.matches) ? data.matches : []);
        if (list.length > 0) {
          results = list.map((m: any) => ({
            uuid: m.uuid || m.id || 'unknown',
            isActive: m.isActive ?? (m.status ? m.status === 'active' : true),
            status: m.status || (m.isActive ? 'active' : 'unknown'),
            teamA: m.teamA || m.homeTeam || 'Team A',
            teamB: m.teamB || m.awayTeam || 'Team B',
            scoreA: m.scoreA ?? 0,
            scoreB: m.scoreB ?? 0,
            timer: m.timer || '0:00',
            period: m.period || 'Pierwsza połowa',
            homeScore: m.scoreA ?? 0,
            awayScore: m.scoreB ?? 0,
            homeTeamId: m.teamA,
            awayTeamId: m.teamB,
            scorers: m.scorers || []
          }));
        }
      }
    } catch (e) {
      console.error('[API/MATCHES] Error fetching list:', e);
    }

    if (results.length === 0) {
      // 2) Try Replit single current match endpoint as a pseudo-list
      try {
        const resOne = await fetchWithTimeout(`${REPLIT_API_BASE_URL}/api/match`, { cache: 'no-store', timeout: 3000 });
        if (resOne.ok) {
          const m = await resOne.json();
          if (m && (m.isActive || m.status === 'active')) {
            results = [{
              uuid: m.uuid || m.id || 'live-match-1',
              isActive: m.isActive ?? (m.status ? m.status === 'active' : true),
              status: m.status || (m.isActive ? 'active' : 'unknown'),
              teamA: m.teamA || m.homeTeam || 'Team A',
              teamB: m.teamB || m.awayTeam || 'Team B',
              scoreA: m.scoreA ?? 0,
              scoreB: m.scoreB ?? 0,
              timer: m.timer || '0:00',
              period: m.period || 'Pierwsza połowa'
            }];
          }
        }
      } catch (e) {
        console.error('[API/MATCHES] Error fetching single match:', e);
      }
    }

    if (results.length === 0) {
      // 3) Fallback to Firebase live match
      const liveMatch = await getLiveMatch();
      if (liveMatch && liveMatch.active) {
        results = [{
          uuid: 'live-match-1',
          isActive: true,
          status: 'active',
          teamA: liveMatch.teamA?.nazwa || 'Team A',
          teamB: liveMatch.teamB?.nazwa || 'Team B',
          scoreA: liveMatch.teamA?.score || 0,
          scoreB: liveMatch.teamB?.score || 0,
          timer: liveMatch.timer || '0:00',
          period: liveMatch.period || 'Pierwsza połowa'
        }];
      }
    }

    // If we have results, cache them
    if (results.length > 0) {
      if (!fs.existsSync(path.dirname(CACHE_FILE))) {
        fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
      }
      fs.writeFileSync(CACHE_FILE, JSON.stringify(results, null, 2), 'utf-8');
      return NextResponse.json(results);
    }

    // Last resort: Fallback to old cache
    if (fs.existsSync(CACHE_FILE)) {
      const cachedData = fs.readFileSync(CACHE_FILE, 'utf-8');
      return NextResponse.json(JSON.parse(cachedData));
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error('Error fetching matches list:', error);
    return NextResponse.json([], { status: 500 });
  }
}
