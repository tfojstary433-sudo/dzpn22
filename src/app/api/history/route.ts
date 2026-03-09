import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { REPLIT_API_BASE_URL } from '@/lib/constants';

const CACHE_FILE = path.join(process.cwd(), 'src', 'data', 'cached_history.json');
const REPLIT_URL = `${REPLIT_API_BASE_URL}/players-history.json`;

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season') || 'current';

    if (season !== 'current') {
      const archivedFile = path.join(process.cwd(), 'src', 'data', 'seasons', season, 'history.json');
      if (fs.existsSync(archivedFile)) {
        const archivedData = fs.readFileSync(archivedFile, 'utf-8');
        return NextResponse.json(JSON.parse(archivedData));
      }
      return NextResponse.json({ players: {} });
    }

    // Check if cache is fresh (5 mins)
    if (fs.existsSync(CACHE_FILE)) {
      const stats = fs.statSync(CACHE_FILE);
      const diffMinutes = (new Date().getTime() - stats.mtime.getTime()) / (1000 * 60);
      
      if (diffMinutes < 5) {
        const cachedData = fs.readFileSync(CACHE_FILE, 'utf-8');
        return NextResponse.json(JSON.parse(cachedData));
      }
    }

    // Try Replit API
    try {
      const response = await fetch(REPLIT_URL, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        if (!fs.existsSync(path.dirname(CACHE_FILE))) {
          fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
        }
        fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), 'utf-8');
        return NextResponse.json(data);
      }
    } catch (e) {
      console.error('[API/HISTORY] Error fetching:', e);
    }

    // Fallback
    if (fs.existsSync(CACHE_FILE)) {
      const cachedData = fs.readFileSync(CACHE_FILE, 'utf-8');
      return NextResponse.json(JSON.parse(cachedData));
    }

    return NextResponse.json({ players: {} });
  } catch (error) {
    console.error('[API/HISTORY] Critical error:', error);
    return NextResponse.json({ players: {} }, { status: 500 });
  }
}
