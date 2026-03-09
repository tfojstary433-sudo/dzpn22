import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { REPLIT_API_BASE_URL } from '@/lib/constants';

const CACHE_FILE = path.join(process.cwd(), 'src', 'data', 'cached_fixtures.json');
const REPLIT_API_URL = `${REPLIT_API_BASE_URL}/api/fixtures`;

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season') || 'current';

    if (season !== 'current') {
      const archivedFile = path.join(process.cwd(), 'src', 'data', 'seasons', season, 'fixtures.json');
      if (fs.existsSync(archivedFile)) {
        const archivedData = fs.readFileSync(archivedFile, 'utf-8');
        return NextResponse.json(JSON.parse(archivedData));
      }
      return NextResponse.json({ fixtures: [] });
    }

    // 0. Check cache freshness (5 mins)
    if (fs.existsSync(CACHE_FILE)) {
      const stats = fs.statSync(CACHE_FILE);
      const diffMinutes = (new Date().getTime() - stats.mtime.getTime()) / (1000 * 60);
      
      if (diffMinutes < 5) {
        const cachedData = fs.readFileSync(CACHE_FILE, 'utf-8');
        return NextResponse.json(JSON.parse(cachedData));
      }
    }

    // 1. Spróbuj pobrać z API Replit
    try {
      console.log('[API/SCHEDULE] Próba pobrania danych z Replit API...');
      const response = await fetch(REPLIT_API_URL, { 
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Zapisz do cache'u
        if (!fs.existsSync(path.dirname(CACHE_FILE))) {
          fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
        }
        fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), 'utf-8');
        console.log('[API/SCHEDULE] Dane pobrane i zapisane w cache.');
        return NextResponse.json(data);
      }
    } catch (e) {
      console.error('[API/SCHEDULE] Błąd pobierania z Replit API:', e);
      // Fallback do cache'u
    }

    // 2. Jeśli API zawiedzie, spróbuj odczytać z cache'u
    if (fs.existsSync(CACHE_FILE)) {
      console.log('[API/SCHEDULE] Zwracanie danych z cache (API Replit niedostępne).');
      const cachedData = fs.readFileSync(CACHE_FILE, 'utf-8');
      return NextResponse.json(JSON.parse(cachedData));
    }

    // 3. Jeśli nie ma cache'u, zwróć pustą tablicę lub błąd
    return NextResponse.json({ fixtures: [] });

  } catch (error) {
    console.error('[API/SCHEDULE] Błąd krytyczny:', error);
    return NextResponse.json({ fixtures: [] }, { status: 500 });
  }
}
