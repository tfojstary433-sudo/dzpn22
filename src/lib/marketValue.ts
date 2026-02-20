export interface PlayerMarketValueInput {
  position: 'ATT' | 'MID' | 'DEF' | 'GK';
  minutes: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  concededGoals: number;
  yellowCards: number;
  redCards: number;
  matchId?: string;
  matchResult?: 'win' | 'draw' | 'loss';
  accountAgeDays?: number;
  transferCount?: number;
  currentValue?: number;
}

export interface MarketValueCalculation {
  baseValue: number;
  playingTimeBonus: number;
  performancePoints: number;
  specialBonus: number;
  ageMultiplier: number;
  transferMultiplier: number;
  finalPoints: number;
  newValue: number;
  breakdown: {
    playingTime: string;
    performance: string;
    special: string;
    multipliers: string;
  };
}

const DEFAULT_BASE_VALUE = 50000;
const MIN_VALUE = 25000;
const ROUNDING = 100;

class MarketValueCalculator {
  private baseValue: number;

  constructor(currentValue?: number) {
    this.baseValue = currentValue || DEFAULT_BASE_VALUE;
  }

  getPlayingTimeBonus(minutes: number): number {
    if (minutes <= 10) return 0.5;
    if (minutes <= 30) return 2.0;
    return 4.0;
  }

  getPerformancePoints(input: PlayerMarketValueInput): number {
    const { position, goals, assists, cleanSheets, concededGoals, yellowCards, redCards } = input;

    let points = 0;

    const actionBonuses: Record<string, Record<string, number>> = {
      ATT: { goal: 5, assist: 3, cleanSheet: 0, concededGoal: 0, yellowCard: -2, redCard: -7 },
      MID: { goal: 6, assist: 4, cleanSheet: 1, concededGoal: 0, yellowCard: -2, redCard: -7 },
      DEF: { goal: 8, assist: 5, cleanSheet: 4, concededGoal: -1, yellowCard: -2, redCard: -7 },
      GK: { goal: 15, assist: 10, cleanSheet: 7, concededGoal: -1.5, yellowCard: -2, redCard: -7 },
    };

    const bonus = actionBonuses[position];

    points += goals * bonus.goal;
    points += assists * bonus.assist;
    points += cleanSheets * bonus.cleanSheet;
    points += concededGoals * bonus.concededGoal;
    points += yellowCards * bonus.yellowCard;
    points += redCards * bonus.redCard;

    return points;
  }

  getSpecialBonus(matchId?: string, matchResult?: 'win' | 'draw' | 'loss'): number {
    if (!matchId) return 0;

    let bonus = 0;

    if (matchId === 'tf-final-0403') {
      bonus = 10;
      if (matchResult === 'win') {
        bonus += 15;
      }
    } else if (matchId === 'tf-3rd-0403') {
      bonus = 5;
      if (matchResult === 'win') {
        bonus += 5;
      }
    }

    return bonus;
  }

  getAgeMultiplier(accountAgeDays?: number): number {
    if (!accountAgeDays) return 1.0;

    if (accountAgeDays < 90) return 1.2;
    if (accountAgeDays <= 365) return 1.0;
    return 0.9;
  }

  getTransferMultiplier(transferCount?: number): number {
    if (transferCount === undefined) return 1.1;

    if (transferCount <= 2) return 1.1;
    if (transferCount <= 5) return 0.8;
    return 0.5;
  }

  calculate(input: PlayerMarketValueInput): MarketValueCalculation {
    const playingTimeBonus = this.getPlayingTimeBonus(input.minutes);
    const performancePoints = this.getPerformancePoints(input);
    const specialBonus = this.getSpecialBonus(input.matchId, input.matchResult);

    const ageMultiplier = this.getAgeMultiplier(input.accountAgeDays);
    const transferMultiplier = this.getTransferMultiplier(input.transferCount);

    const totalPoints = playingTimeBonus + performancePoints + specialBonus;
    const multipliedPoints = totalPoints * ageMultiplier * transferMultiplier;

    const valueIncrease = this.baseValue * (multipliedPoints / 100);
    const newValue = Math.max(
      MIN_VALUE,
      Math.round((this.baseValue + valueIncrease) / ROUNDING) * ROUNDING
    );

    const breakdown = {
      playingTime: `${playingTimeBonus}% (${input.minutes} minut)`,
      performance: `${performancePoints}% (${input.goals}G, ${input.assists}A, ${input.yellowCards}Y, ${input.redCards}R)`,
      special: `${specialBonus}% (${input.matchId || 'brak'})`,
      multipliers: `x${ageMultiplier} (wiek) × x${transferMultiplier} (transfer)`,
    };

    return {
      baseValue: this.baseValue,
      playingTimeBonus,
      performancePoints,
      specialBonus,
      ageMultiplier,
      transferMultiplier,
      finalPoints: multipliedPoints,
      newValue,
      breakdown,
    };
  }
}

export function calculatePlayerMarketValue(
  input: PlayerMarketValueInput
): MarketValueCalculation {
  const calculator = new MarketValueCalculator(input.currentValue);
  return calculator.calculate(input);
}

export function getAgeCategory(accountAgeDays?: number): string {
  if (!accountAgeDays) return 'Brak danych';
  if (accountAgeDays < 90) return 'Nowy Gracz (< 90 dni)';
  if (accountAgeDays <= 365) return 'Regularny (90-365 dni)';
  return 'Weteran (> 365 dni)';
}

export function getTransferCategory(transferCount?: number): string {
  if (transferCount === undefined) return 'Brak danych';
  if (transferCount <= 2) return 'Lojalny (0-2 zmiany)';
  if (transferCount <= 5) return 'Niestabilny (3-5 zmian)';
  return 'Skoczek (6+ zmian)';
}

export function formatMarketValue(value: number): string {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + ' M €';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(0) + ' K €';
  }
  return value.toLocaleString() + ' €';
}

interface FriendlyMatch {
  matchUuid: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  playerTeam: string;
  position: string | null;
  minutesPlayed: number;
  goals: Array<{ minute: number; isPenalty: boolean }>;
  cards: Array<{ type: string; minute: number }>;
  playedAt: string;
  tournamentId?: number;
  tournamentName?: string;
  role?: 'starter' | 'bench';
}

interface PlayerHistoryEntry {
  robloxId: number;
  name: string;
  matches: FriendlyMatch[];
}

function getAgeMultiplierStandalone(accountAgeDays?: number): number {
  if (!accountAgeDays) return 1.0;

  if (accountAgeDays < 90) return 1.2;
  if (accountAgeDays <= 365) return 1.0;
  return 0.9;
}

function getTransferMultiplierStandalone(transferCount?: number): number {
  if (transferCount === undefined) return 1.1;

  if (transferCount <= 2) return 1.1;
  if (transferCount <= 5) return 0.8;
  return 0.5;
}

export function calculateMarketValueFromFriendlyMatches(
  playerHistory: FriendlyMatch[],
  accountAgeDays?: number,
  transferCount: number = 0
): { value: number; breakdown: any } {
  if (!playerHistory || playerHistory.length === 0) {
    return {
      value: 50000,
      breakdown: { message: 'No friendly matches found' }
    };
  }

  const baseValue = 50000;
  let totalPoints = 0;
  const calculations: any[] = [];

  const ageMultiplier = getAgeMultiplierStandalone(accountAgeDays);
  const transferMultiplier = getTransferMultiplierStandalone(transferCount);

  playerHistory.forEach((match) => {
    const position = normalizePosition(match.position);
    if (!position) return;

    let matchPoints = 0;

    const playingTimeBonus = getPlayingTimeBonus(match.minutesPlayed);
    matchPoints += playingTimeBonus;

    const goals = match.goals?.length || 0;
    const yellowCards = match.cards?.filter(c => c.type.toLowerCase().includes('yellow')).length || 0;
    const redCards = match.cards?.filter(c => c.type.toLowerCase().includes('red')).length || 0;

    const isWinner = (match.playerTeam === match.teamA && match.scoreA > match.scoreB) ||
                     (match.playerTeam === match.teamB && match.scoreB > match.scoreA);
    const cleanSheet = isWinner && (
      (match.playerTeam === match.teamA && match.scoreB === 0) ||
      (match.playerTeam === match.teamB && match.scoreA === 0)
    );
    const concededGoals = (match.playerTeam === match.teamA ? match.scoreB : match.scoreA);

    const bonuses: Record<string, Record<string, number>> = {
      'ATT': { goal: 5, assist: 3, cleanSheet: 0, concededGoal: 0, yellowCard: -2, redCard: -7 },
      'MID': { goal: 6, assist: 4, cleanSheet: 1, concededGoal: 0, yellowCard: -2, redCard: -7 },
      'DEF': { goal: 8, assist: 5, cleanSheet: 4, concededGoal: -1, yellowCard: -2, redCard: -7 },
      'GK': { goal: 15, assist: 10, cleanSheet: 7, concededGoal: -1.5, yellowCard: -2, redCard: -7 },
    };

    const bonus = bonuses[position];
    matchPoints += goals * bonus.goal;
    matchPoints += (cleanSheet ? bonus.cleanSheet : 0);
    matchPoints += concededGoals * bonus.concededGoal;
    matchPoints += yellowCards * bonus.yellowCard;
    matchPoints += redCards * bonus.redCard;

    const matchMultipliedPoints = matchPoints * ageMultiplier * transferMultiplier;
    totalPoints += matchMultipliedPoints;

    calculations.push({
      date: match.playedAt,
      opponent: match.playerTeam === match.teamA ? match.teamB : match.teamA,
      position,
      minutes: match.minutesPlayed,
      goals,
      cleanSheet: cleanSheet ? 1 : 0,
      cards: { yellow: yellowCards, red: redCards },
      playingTimeBonus,
      performancePoints: matchPoints - playingTimeBonus,
      totalPoints: matchMultipliedPoints
    });
  });

  const avgPointsPerMatch = playerHistory.length > 0 ? totalPoints / playerHistory.length : 0;
  const valueIncrease = baseValue * (avgPointsPerMatch / 100);
  const newValue = Math.max(
    25000,
    Math.round((baseValue + valueIncrease) / 100) * 100
  );

  return {
    value: newValue,
    breakdown: {
      matchesAnalyzed: playerHistory.length,
      baseValue,
      totalPointsAccumulated: totalPoints,
      avgPointsPerMatch,
      valueIncrease,
      calculations,
      ageMultiplier,
      transferMultiplier,
      formula: `${baseValue} + (${baseValue} * ${avgPointsPerMatch.toFixed(2)} / 100) = ${newValue}`
    }
  };
}

function normalizePosition(pos: string | null): string | null {
  if (!pos) return null;
  const posUpper = pos.toUpperCase();
  
  const attackPositions = ['N', 'LS', 'ST', 'CF', 'ŚN', 'NAPAD', 'LW', 'RW', 'PN', 'LN'];
  const midPositions = ['ŚP', 'CM', 'CAM', 'CDP', 'OP', 'LP', 'PP', 'LM', 'RM', 'POMOC'];
  const defPositions = ['ŚO', 'PO', 'LO', 'SO', 'SP', 'PD', 'LD', 'RD', 'OBRONA', 'PS', 'PL', 'LS'];
  const gkPositions = ['BR', 'GK', 'BRAMKARZ'];

  if (attackPositions.some(p => posUpper.includes(p))) return 'ATT';
  if (midPositions.some(p => posUpper.includes(p))) return 'MID';
  if (defPositions.some(p => posUpper.includes(p))) return 'DEF';
  if (gkPositions.some(p => posUpper.includes(p))) return 'GK';

  return null;
}

function getPlayingTimeBonus(minutes: number): number {
  if (minutes <= 10) return 0.5;
  if (minutes <= 30) return 2.0;
  return 4.0;
}
