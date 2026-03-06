import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { POSITION_MAPPING } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function mapPositionToPolish(pos: string): string {
  if (!pos || pos === '---') return '---';
  const p = pos.toUpperCase();
  return POSITION_MAPPING[p] || pos;
}

export async function fetchWithTimeout(resource: string | Request, options: RequestInit & { timeout?: number } = {}) {
  const { timeout = 5000 } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export function calculateMatchRating(match: any, playerClub?: string, playerPosition?: string): number {
  if (!match) return 6.0;
  
  // Base rating from minutes played
  let score = (match.minutes / 90) * 6.0 + 1.0;
  
  // Stats impact
  score += (match.goals || 0) * 1.5;
  score += (match.assists || 0) * 1.0;
  
  // Win/Loss impact
  if (match.result === 'W') score += 0.3;
  else if (match.result === 'D') score += 0.1;
  else score -= 0.2;
  
  // Clean sheet bonus (approximate for GK/DF)
  const isCleanSheet = match.homeTeam === playerClub 
    ? match.awayScore === 0 
    : match.homeScore === 0;

  if ((playerPosition === 'GK' || playerPosition?.includes('DF')) && isCleanSheet) {
    score += 0.5;
  }

  return Math.min(10.0, Math.max(1.0, score));
}

export function calculateMarketValue(stats: any, position?: string, avgRating: number = 6.5): number {
  const baseValue = 50000;
  const matchesCount = stats?.matches || 0;
  const isDefensive = position === 'GK' || position?.includes('DF');
  
  // Growth from match to match (experience)
  const experienceValue = matchesCount * 85000;
  
  // Performance impact adjusted by position
  let performanceScore = 0;
  if (isDefensive) {
    // For GK/DF: focus on matches, clean sheets and rating
    performanceScore = (matchesCount * 0.8) + ((stats?.cleanSheets || 0) * 3.0);
  } else {
    // For MF/FW: focus on goals, assists and matches
    performanceScore = (stats?.goals || 0) * 2.0 + (stats?.assists || 0) * 1.5 + (matchesCount * 0.3);
  }

  // Quality multiplier based on average rating (exponential impact)
  const qualityMultiplier = avgRating > 0 ? Math.pow(avgRating / 6.5, 1.5) : 1;
  
  const calculatedValue = baseValue + (experienceValue + (performanceScore * 250000)) * qualityMultiplier;
  return Math.min(28000000, Math.max(baseValue, calculatedValue));
}
