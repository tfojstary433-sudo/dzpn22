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
  
  const pos = String(playerPosition || '').toUpperCase();
  const isGK = pos === 'GK' || pos.includes('BR') || pos.includes('BRAMKARZ');
  const isDF = pos.includes('DF') || pos.includes('OB');
  
  // Base rating from minutes played (40 min is full match as per user request)
  const mins = Number(match.minutes) || 0;
  let score = (mins / 40) * 5.0 + 3.0;
  
  if (isGK) {
    // GK specific logic: focus on goals conceded and minutes
    const club = String(playerClub || '').trim();
    const homeTeam = String(match.homeTeam || '').trim();
    const goalsConceded = Number(club === homeTeam ? match.awayScore : match.homeScore) || 0;
    
    if (goalsConceded === 0 && mins > 30) score += 2.5; // Big clean sheet bonus
    else if (goalsConceded === 1) score += 0.5;
    else if (goalsConceded === 2) score += 0;
    else if (goalsConceded === 3) score -= 0.5;
    else if (goalsConceded > 3) score -= (goalsConceded - 3) * 1.0;
    
    // Impact of match result
    if (match.result === 'W') score += 1.0;
    else if (match.result === 'D') score += 0.5;
    else score -= 0.5;
    
    // Penalty for yellow/red cards
    if (Number(match.yellowCards)) score -= 1.0;
    if (Number(match.redCards)) score -= 3.0;
  } else {
    // Outfield players
    score += (Number(match.goals) || 0) * 2.0;
    score += (Number(match.assists) || 0) * 1.5;
    
    if (isDF) {
      const club = String(playerClub || '').trim();
      const homeTeam = String(match.homeTeam || '').trim();
      const goalsConceded = Number(club === homeTeam ? match.awayScore : match.homeScore) || 0;
      if (goalsConceded === 0 && mins > 30) score += 1.5;
    }
    
    // Win/Loss impact
    if (match.result === 'W') score += 0.8;
    else if (match.result === 'D') score += 0.3;
    else score -= 0.3;
  }

  return Number(Math.min(10.0, Math.max(1.0, score)).toFixed(1));
}

export function getRatingColor(rating: number, position?: string): string {
  const pos = String(position || '').toUpperCase();
  const isGK = pos === 'GK' || pos.includes('BR') || pos.includes('BRAMKARZ');
  
  // Amazing = Blue, Good = Green, Weak = Red
  if (isGK) {
    if (rating >= 8.5) return 'bg-blue-600/20 border-blue-500/50 text-blue-400 shadow-blue-500/20';
    if (rating >= 6.5) return 'bg-green-600/20 border-green-500/50 text-green-400 shadow-green-500/20';
    return 'bg-red-600/20 border-red-500/50 text-red-400 shadow-red-500/20';
  }
  
  if (rating >= 9.0) return 'bg-blue-600/20 border-blue-500/50 text-blue-400 shadow-blue-500/20';
  if (rating >= 7.0) return 'bg-green-600/20 border-green-500/50 text-green-400 shadow-green-500/20';
  return 'bg-red-600/20 border-red-500/50 text-red-400 shadow-red-500/20';
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
