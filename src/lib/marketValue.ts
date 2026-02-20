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
