import fs from 'fs';
import path from 'path';

const SEASONS_DIR = path.join(process.cwd(), 'src', 'data', 'seasons');

export interface Season {
  id: string;
  name: string;
}

export function getAvailableSeasons(): Season[] {
  const currentSeason = { id: 'current', name: '2025/2026' };
  
  if (!fs.existsSync(SEASONS_DIR)) {
    return [currentSeason];
  }

  const files = fs.readdirSync(SEASONS_DIR);
  const archivedSeasons = files
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const id = f.replace('.json', '');
      return {
        id,
        name: id.replace('-', '/')
      };
    });

  return [currentSeason, ...archivedSeasons];
}

export function getSeasonData(seasonId: string, dataType: 'fixtures' | 'history' | 'matches') {
  if (seasonId === 'current') return null;

  const filePath = path.join(SEASONS_DIR, seasonId, `${dataType}.json`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  return null;
}
