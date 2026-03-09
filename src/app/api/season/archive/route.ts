import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { season } = await request.json();
    if (!season) {
      return NextResponse.json({ error: 'Season name is required' }, { status: 400 });
    }

    const seasonDir = path.join(process.cwd(), 'src', 'data', 'seasons', season);
    if (!fs.existsSync(seasonDir)) {
      fs.mkdirSync(seasonDir, { recursive: true });
    }

    const filesToArchive = [
      { src: 'cached_fixtures.json', dest: 'fixtures.json' },
      { src: 'cached_history.json', dest: 'history.json' },
      { src: 'cached_matches_list.json', dest: 'matches.json' }
    ];

    filesToArchive.forEach(file => {
      const srcPath = path.join(process.cwd(), 'src', 'data', file.src);
      const destPath = path.join(seasonDir, file.dest);
      
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
      }
    });

    return NextResponse.json({ success: true, message: `Season ${season} archived successfully` });
  } catch (error) {
    console.error('[API/SEASON/ARCHIVE] Error:', error);
    return NextResponse.json({ error: 'Failed to archive season' }, { status: 500 });
  }
}
