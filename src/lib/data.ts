export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  color?: string;
  founded?: string;
  president?: string;
  coach?: string;
  spokesperson?: string;
  discordAvatars?: {
    president?: string;
    coach?: string;
    spokesperson?: string[];
  };
  stadiumCapacity?: number;
  address?: string;
  phone?: string;
  email?: string;
  stadium?: string;
  achievements?: {
    titles?: { count: number; years: string };
    viceTitles?: { count: number; years: string };
    cups?: { count: number; years: string };
    friendlyMatches?: {
      firstPlace?: { count: number; years: string };
      secondPlace?: { count: number; years: string };
      thirdPlace?: { count: number; years: string };
    };
  };
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number;
  awayScore?: number;
  date: string;
  time?: string;
  round: number | string;
  status: 'finished' | 'upcoming';
  stadium?: string;
  category?: string;
}

export interface Standing {
  position: number;
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface PlayerAchievement {
  tournament: string;
  season: string;
  place: number;
  matchUuid?: string;
  awardedAt: string;
  teamName?: string;
}

export interface Player {
  name: string;
  team: Team;
  number: number;
  goals?: number;
  assists?: number;
  playerId?: number;
  avatarUrl?: string;
  achievements?: PlayerAchievement[];
}

export interface PlayerStat {
  playerId: number;
  name: string;
  teamId: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  avatarUrl?: string;
}

export interface SneakPeak {
  id: number;
  title: string;
  image: string;
  type: 'image' | 'video';
  date: string;
}

export const teams: Team[] = [
  { 
    id: 'BOB', 
    name: 'CF BOBILAND', 
    shortName: 'BOBILAND', 
    logo: 'https://i.ibb.co/HpV1xXZk/herb-bobilandu-Bolczi-removebg-preview-2-5.png',
    color: '#1e40af'
  } as any,
  { 
    id: 'DRM', 
    name: 'DREAM TEAM', 
    shortName: 'DREAM', 
    logo: 'https://i.ibb.co/211VY6Tt/herb-bobilandu-Bolczi-removebg-preview-2-2.png',
    color: '#facc15'
  } as any,
  { 
    id: 'DZ4', 
    name: 'DZIAŁÓWKA 420', 
    shortName: 'DZIAŁÓWKA', 
    logo: 'https://i.ibb.co/5gKS8Cgx/dziaodufka-420-gabriel-seweryn.png',
    color: '#16a34a'
  } as any,
  { 
    id: 'BOS', 
    name: 'FC BOSKI', 
    shortName: 'BOSKI', 
    logo: 'https://i.ibb.co/ycgWT4yh/herb-bobilandu-Bolczi-removebg-preview-2-3.png',
    color: '#1e40af'
  } as any,
  { 
    id: 'DZI', 
    name: 'FC DZIAŁDOWO', 
    shortName: 'DZIAŁDOWO', 
    logo: 'https://i.ibb.co/5gyG34rw/obraz-2026-06-07-214108536-removebg-preview-1-2.png',
    color: '#16a34a'
  } as any,
  { 
    id: 'MAK', 
    name: 'FC MAKOWA', 
    shortName: 'MAKOWA', 
    logo: 'https://i.ibb.co/S4hMtjPT/IMG-0626-Nikodem-Samsel-removebg-preview-1-3.png',
    color: '#dc2626'
  } as any,
  { 
    id: 'ZZB', 
    name: 'FC ZIELONA ŻABKA', 
    shortName: 'ŻABKA', 
    logo: 'https://i.ibb.co/XrVk0h4C/IMG-0626-Nikodem-Samsel-removebg-preview-1-4.png',
    color: '#1e3a8a'
  } as any,
  { 
    id: 'KSP', 
    name: 'KS PŁOMYK WIERZBOWO', 
    shortName: 'PŁOMYK', 
    logo: 'https://i.ibb.co/FbGS5c5d/herb-bobilandu-Bolczi-removebg-preview-2-1.png',
    color: '#f97316'
  } as any,
  { 
    id: 'PKS', 
    name: 'PKS PETRYKOZY', 
    shortName: 'PETRYKOZY', 
    logo: 'https://i.ibb.co/qYXGwtBM/obraz-2026-06-07-214108536-removebg-preview-1-3.png',
    color: '#00ccff'
  } as any,
  { 
    id: 'SET', 
    name: 'SETA DZIAŁDOWO', 
    shortName: 'SETA', 
    logo: 'https://i.ibb.co/s9NbHtXB/IMG-0626-Nikodem-Samsel-removebg-preview-1-2.png',
    color: '#dc2626'
  } as any,
  { 
    id: 'SPA', 
    name: 'SPARTA NARZYM', 
    shortName: 'SPARTA', 
    logo: 'https://i.ibb.co/s9kmkqF7/herb-bobilandu-Bolczi-removebg-preview-2-4.png',
    color: '#16a34a'
  } as any,
  { 
    id: 'USL', 
    name: 'USŁUGI WYKOŃCZENIOWE', 
    shortName: 'USŁUGI', 
    logo: 'https://i.ibb.co/Qv6Chmjr/IMG-0626-Nikodem-Samsel-removebg-preview-1.png',
    color: '#facc15'
  } as any,
  { 
    id: 'ZKP', 
    name: 'ZKP CONDOMIA', 
    shortName: 'CONDOMIA', 
    logo: 'https://i.ibb.co/NdJxY77m/IMG-0626-Nikodem-Samsel-removebg-preview-2.png',
    color: '#1e40af'
  } as any,
  { 
    id: 'CAN', 
    name: 'CD CANTERA', 
    shortName: 'CANTERA', 
    logo: 'https://i.ibb.co/rGJKJsNg/IMG-0626-Nikodem-Samsel-removebg-preview-6.png',
    color: '#f97316'
  } as any,
  {
    id: 'REF',
    name: 'Kolegium Sędziowskie',
    shortName: 'Sędziowie',
    logo: 'https://i.ibb.co/5hYr57Mr/obraz-2026-02-01-142942311.png',
    color: '#ef4444'
  } as any,
];

// Map club IDs to Firebase keys
export const clubToFirebaseKey: { [key: string]: string } = {
  'BOB': 'Club 1',
  'CAN': 'Club 2',
  'DRM': 'Club 3',
  'DZ4': 'Club 4',
  'BOS': 'Club 5',
  'DZI': 'Club 6',
  'MAK': 'Club 7',
  'ZZB': 'Club 8',
  'KSP': 'Club 9',
  'PKS': 'Club 10',
  'SET': 'Club 11',
  'SPA': 'Club 12',
  'USL': 'Club 13',
  'ZKP': 'Club 14',
  'REF': 'Referee', // Sędziowie
  'MED': 'Media'     // Media
};

export const extraTeams: Team[] = [];

export const matches: Match[] = [];

export const standings: Standing[] = teams.filter(t => t.id !== 'SED').map((team, index) => ({
  position: index + 1,
  team,
  played: 0,
  won: 0,
  drawn: 0,
  lost: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDifference: 0,
  points: 0
}));

export const topScorers: Player[] = [];

export const topAssists: Player[] = [];

export const mockPlayersData: any[] = [];

export interface Article {
  id: number;
  title: string;
  image: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  author: string;
}

export const newsArticles: Article[] = [];

export const friendlyMatchesData: any[] = [
  {
    round: 'PÓŁFINAŁY',
    matches: [
      {
        id: 'sf1',
        homeTeam: teams.find(t => t.id === 'BOB'),
        awayTeam: teams.find(t => t.id === 'CAN'),
        homeScore: 0,
        awayScore: 0,
        status: 'finished',
        round: 'PÓŁFINAŁ',
        category: 'FAZA PUCHAROWA',
        date: '01.03.2026'
      },
      {
        id: 'sf2',
        homeTeam: teams.find(t => t.id === 'DRM'),
        awayTeam: teams.find(t => t.id === 'DZ4'),
        homeScore: 0,
        awayScore: 0,
        status: 'finished',
        round: 'PÓŁFINAŁ',
        category: 'FAZA PUCHAROWA',
        date: '01.03.2026'
      }
    ]
  },
  {
    round: 'MECZ O 3. MIEJSCE',
    matches: [
      {
        id: '3rd',
        homeTeam: teams.find(t => t.id === 'CAN'),
        awayTeam: teams.find(t => t.id === 'DZ4'),
        homeScore: 6,
        awayScore: 1,
        status: 'finished',
        round: 'MECZ O 3. MIEJSCE',
        category: 'FAZA PUCHAROWA',
        date: '04.03.2026'
      }
    ]
  },
  {
    round: 'FINAŁ',
    matches: [
      {
        id: 'final',
        homeTeam: teams.find(t => t.id === 'DRM'),
        awayTeam: teams.find(t => t.id === 'BOB'),
        homeScore: 3,
        awayScore: 0,
        status: 'finished',
        round: 'FINAŁ',
        category: 'FAZA PUCHAROWA',
        date: '04.03.2026'
      }
    ]
  }
];

export const sneakPeeks: SneakPeak[] = [
  {
    id: 1,
    title: 'Nowy system stadionów',
    image: 'https://i.ibb.co/SXDCV1tC/PFFGRAFIKA.png',
    type: 'image',
    date: '2026-01-11',
  },
  {
    id: 2,
    title: 'Prezentacja strojów domowych',
    image: 'https://i.ibb.co/r2KwDw8h/obraz-2026-01-05-231417131.png',
    type: 'video',
    date: '2026-01-10',
  },
  {
    id: 3,
    title: 'Przeciek nowego interfejsu',
    image: 'https://i.ibb.co/23XPPB9m/system-administration-3.png',
    type: 'image',
    date: '2026-01-09',
  }
];

export const cupMatchesData: any[] = [];

export const findMatchById = (id: string): Match | undefined => {
  const allMatches: Match[] = [
    ...matches,
    ...friendlyMatchesData.flatMap((r: any) => r.matches as Match[]),
    ...cupMatchesData.flatMap((r: any) => r.matches as Match[])
  ];
  return allMatches.find(m => m.id === id);
};
