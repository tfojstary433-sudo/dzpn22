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

export interface Player {
  name: string;
  team: Team;
  number: number;
  goals?: number;
  assists?: number;
  playerId?: number;
  avatarUrl?: string;
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
    id: 'UNI', 
    name: 'Unia Skierniewice', 
    shortName: 'Unia', 
    logo: 'https://i.ibb.co/Vp3YY8FY/unia-logo-300x300.png',
    color: '#facc15',
    founded: '14.12.2025',
    president: 'czokapik',
    coach: 'Nieznany',
    spokesperson: 'Japuszko',
    stadiumCapacity: 5000,
    stadium: 'Stadion Miejski w Skierniewicach',
    address: 'ul. Sportowa 1, 96-100 Skierniewice',
    phone: '+48 46 833 21 45',
    email: 'kontakt@uniaskierniewice.pl'
  },
  { 
    id: 'LGD', 
    name: 'Lechia Gdańsk', 
    shortName: 'Lechia', 
    logo: 'https://i.ibb.co/nqBHgwK2/obraz-2026-01-22-143911384.png',
    color: '#16a34a',
    founded: '14.12.2025',
    president: 'Nieznany',
    coach: 'Nieznany',
    spokesperson: 'Nieznany',
    stadiumCapacity: 43615,
    stadium: 'Stadion Energa w Gdańsku',
    address: 'ul. Pokoleń Lechii Gdańsk 1, 80-560 Gdańsk',
    phone: '+48 58 768 98 00',
    email: 'biuro@lechia.pl'
  },
  { 
    id: 'ZAG', 
    name: 'Zagłębie Lubin', 
    shortName: 'Zagłębie', 
    logo: 'https://i.ibb.co/7xBP97MW/dvyf-Zx2g-Ykwr8-Dur.png',
    color: '#f97316',
    founded: '14.12.2025',
    president: 'nark0t4k',
    coach: 'Nieznany',
    spokesperson: 'piotencjusz1_',
    stadiumCapacity: 16086,
    stadium: 'Stadion Zagłębia Lubin',
    address: 'ul. Złotoryjska 20, 59-300 Lubin',
    phone: '+48 76 749 53 00',
    email: 'biuro@zaglebie.lubin.pl'
  },
  { 
    id: 'LPO', 
    name: 'Lech Poznań', 
    shortName: 'Lech', 
    logo: 'https://ext.same-assets.com/1250577607/3317158738.png',
    color: '#1e40af',
    founded: '14.12.2025',
    president: 'matek.67',
    coach: 'Nieznany',
    spokesperson: 'Bonzai',
    stadiumCapacity: 43269,
    stadium: 'ENEA Stadion w Poznaniu',
    address: 'ul. Bułgarska 17, 60-320 Poznań',
    phone: '+48 61 850 44 50',
    email: 'biuro@lechpoznan.pl'
  },
  { 
    id: 'ARK', 
    name: 'Arka Gdynia', 
    shortName: 'Arka', 
    logo: 'https://ext.same-assets.com/1250577607/451783410.png',
    color: '#facc15',
    founded: '13.12.2025',
    president: 'mlodypikel',
    coach: 'mlodypikel',
    spokesperson: '.pako7u7',
    stadium: 'Stadion Miejski w Gdyni'
  },
  { 
    id: 'LEG', 
    name: 'Legia Warszawa', 
    shortName: 'Legia', 
    logo: 'https://ext.same-assets.com/1250577607/695801781.png',
    color: '#16a34a',
    founded: '13.12.2025',
    president: 'xlissy.',
    coach: 'Nieznany',
    spokesperson: 'Nieznany',
    stadiumCapacity: 31103,
    stadium: 'Stadion Wojska Polskiego w Warszawie',
    address: 'ul. Łazienkowska 3, 00-449 Warszawa',
    phone: '+48 22 518 61 00',
    email: 'biuro@legia.com'
  },
  { 
    id: 'POG', 
    name: 'Pogoń Szczecin', 
    shortName: 'Pogoń', 
    logo: 'https://ext.same-assets.com/1250577607/3079565559.png',
    color: '#1e3a8a',
    founded: '14.12.2025',
    president: '.flexxy',
    coach: 'Nieznany',
    spokesperson: 'klatka',
    stadiumCapacity: 21193,
    stadium: 'Stadion Miejski im. Floriana Krygiera w Szczecinie',
    address: 'ul. Karola Szymanowskiego 1, 71-426 Szczecin',
    phone: '+48 91 460 41 00',
    email: 'biuro@pogonszczecin.pl'
  },
  { 
    id: 'ZAW', 
    name: 'Zawisza Bydgoszcz', 
    shortName: 'Zawisza', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Herb_Zawiszy_Bydgoszcz.png',
    color: '#1e40af',
    founded: '13.12.2025',
    president: 'Zeusinho',
    coach: 'Nieznany',
    spokesperson: '_els1',
    stadiumCapacity: 20247,
    stadium: 'Stadion Miejski w Bydgoszczy',
    address: 'ul. Sportowa 2, 85-091 Bydgoszcz',
    phone: '+48 52 322 56 78',
    email: 'kontakt@zawiszabydgoszcz.pl'
  },
  { 
    id: 'WIS', 
    name: 'Wisła Kraków', 
    shortName: 'Wisła', 
    logo: 'https://upload.wikimedia.org/wikipedia/en/1/15/Wis%C5%82a_Krak%C3%B3w_logo.svg',
    color: '#dc2626',
    founded: '03.01.2026',
    president: 'jm242.2',
    coach: 'Nieznany',
    spokesperson: 'eryczek0103, saguaro321_47983',
    stadiumCapacity: 33326,
    stadium: 'Stadion Miejski im. Henryka Reymana',
    address: 'ul. Reymonta 22, 30-059 Kraków',
    phone: '+48 12 630 64 37',
    email: 'biuro@wisla.krakow.pl'
  },
  { 
    id: 'SOK', 
    name: 'Sokół Olsztyn', 
    shortName: 'Sokół', 
    logo: 'https://i.ibb.co/r2KwDw8h/obraz-2026-01-05-231417131.png',
    color: '#00ccff',
    founded: '29.12.2025',
    president: 'JASiO',
    coach: 'Nieznany',
    spokesperson: 'Raister',
    stadiumCapacity: 3000,
    stadium: 'Stadion Miejski w Ostródzie',
    address: 'ul. Sportowa 5, 14-100 Ostróda',
    phone: '+48 89 646 32 11',
    email: 'kontakt@sokolostroda.pl'
  },
  { 
    id: 'GRO', 
    name: 'Grom Nowy Staw', 
    shortName: 'Grom', 
    logo: 'https://i.ibb.co/V0rcs98Q/obraz-2026-01-04-213027745-removebg-preview-4.png',
    color: '#15803d',
    founded: '04.01.2026',
    president: '.eska.12',
    coach: 'Nieznany',
    spokesperson: 'Nieznany',
    stadiumCapacity: 2000,
    stadium: 'Stadion Sportowy w Nowym Stawie',
    address: 'ul. Gdańska 12, 82-230 Nowy Staw',
    phone: '+48 55 248 12 34',
    email: 'biuro@gromnowystaw.pl'
  },
  { 
    id: 'MOT', 
    name: 'Motor Lublin', 
    shortName: 'Motor', 
    logo: 'https://i.ibb.co/bgRJrvnj/Motor-Lublin-S-A-Oficjalny-Herb.png',
    color: '#facc15',
    stadium: 'Arena Lublin'
  },
  {
    id: 'OLI',
    name: 'Olimpia Elbląg',
    shortName: 'Olimpia',
    logo: 'https://i.ibb.co/RGsNqf6G/olimpia-elblag.png',
    color: '#1e40af',
    stadium: 'Stadion Miejski w Elblągu'
  },
  {
    id: 'CHO',
    name: 'Chojniczanka Chojnice',
    shortName: 'Chojniczanka',
    logo: 'https://i.ibb.co/m5RzsvnS/obraz-2026-01-22-143945160.png',
    color: '#dc2626',
    stadium: 'Stadion Miejski w Chojnicach'
  },
  {
    id: 'JAG',
    name: 'Jagiellonia Białystok',
    shortName: 'Jagiellonia',
    logo: 'https://i.ibb.co/1JmyhfVn/obraz-2026-01-29-161936924.png',
    color: '#facc15',
    stadium: 'Stadion Miejski w Białymstoku'
  },
  {
    id: 'WPL',
    name: 'Wisła Płock',
    shortName: 'Wisła Płock',
    logo: 'https://i.ibb.co/SX6LkvnR/obraz-2026-02-01-105518416.png',
    color: '#1e40af',
    stadium: 'Stadion im. Kazimierza Górskiego'
  },
  {
    id: 'SED',
    name: 'Kolegium Sędziowskie',
    shortName: 'Sędziowie',
    logo: 'https://i.ibb.co/5hYr57Mr/obraz-2026-02-01-142942311.png',
    color: '#ef4444',
    founded: '01.01.2026',
    president: 'Zarząd PFF',
    stadium: 'PFF Arena'
  },
];

// Map club IDs to Firebase keys
export const clubToFirebaseKey: { [key: string]: string } = {
  'ZAW': 'Club 1', // Zawisza Bydgoszcz
  'ARK': 'Club 2', // Arka Gdynia
  'LEG': 'Club 3', // Legia Warszawa
  'LPO': 'Club 4', // Lech Poznań
  'LGD': 'Club 5', // Lechia Gdańsk
  'UNI': 'Club 6', // Unia Skierniewice
  'POG': 'Club 7', // Pogoń Szczecin
  'ZAG': 'Club 8', // Zagłębie Lubin
  'SOK': 'Club 9', // Sokół Olsztyn
  'WIS': 'Club 10', // Wisła Kraków
  'GRO': 'Club 11', // Grom Nowy Staw
  'MOT': 'Club 12', // Motor Lublin
  'OLI': 'Club 13', // Olimpia Elbląg
  'CHO': 'Club 14', // Chojniczanka Chojnice
  'JAG': 'Club 15', // Jagiellonia Białystok
  'WPL': 'Club 16', // Wisła Płock
  'SED': 'Referee', // Sędziowie
  'MED': 'Media'     // Media
};

export const extraTeams: Team[] = [
  { id: 'ext1', name: 'GKS Katowice', shortName: 'GKS', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/GKS_Katowice_logo.png' },
  { id: 'ext2', name: 'Widzew Łódź', shortName: 'Widzew', logo: 'https://i.ibb.co/1fNvYHvf/Widzew-L-dz-logo.png' },
  { id: 'ext3', name: 'Cracovia', shortName: 'Cracovia', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/05/KS_Cracovia_logo.svg' },
  { id: 'ext4', name: 'Korona Kielce', shortName: 'Korona', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Korona_Kielce.svg' },
  { id: 'ext5', name: 'Radomiak Radom', shortName: 'Radomiak', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Radomiak_Radom_Logo.png' },
];

export const matches: Match[] = [];

export const standings: Standing[] = [
  { position: 1, team: teams[4], played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
  { position: 2, team: teams[10], played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
  { position: 3, team: teams[3], played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
  { position: 4, team: teams[1], played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
  { position: 5, team: teams[5], played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
  { position: 6, team: teams[11], played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
  { position: 7, team: teams[12], played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
  { position: 8, team: teams[6], played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
  { position: 9, team: teams[9], played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
  { position: 10, team: teams[0], played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
  { position: 11, team: teams[8], played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
  { position: 12, team: teams[2], played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
  { position: 13, team: teams[7], played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
  { position: 14, team: teams[13], played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
  { position: 15, team: teams[14], played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
  { position: 16, team: teams[15], played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
];

export const topScorers: Player[] = [];

export const topAssists: Player[] = [];

export const mockPlayersData = [
  { playerId: 1, name: 'PAKO7U7LOL', teamId: 'POG', goals: 13, assists: 4, cleanSheets: 0, yellowCards: 2, redCards: 0, value: 1250000, position: 'Napastnik', previousClubs: ['ARK', 'LEG'] },
  { playerId: 2, name: 'MichaelAmeyaw', teamId: 'ARK', goals: 5, assists: 8, cleanSheets: 0, yellowCards: 1, redCards: 0, value: 850000, position: 'Pomocnik', previousClubs: ['POG'] },
  { playerId: 3, name: 'KarolCzubak', teamId: 'LEG', goals: 10, assists: 2, cleanSheets: 0, yellowCards: 3, redCards: 0, value: 950000, position: 'Napastnik', previousClubs: ['ARK'] },
  { playerId: 4, name: 'MikaelIshak', teamId: 'LPO', goals: 10, assists: 3, cleanSheets: 0, yellowCards: 1, redCards: 0, value: 1500000, position: 'Napastnik', previousClubs: [] },
  { playerId: 5, name: 'SebastianBergier', teamId: 'WIS', goals: 9, assists: 1, cleanSheets: 0, yellowCards: 2, redCards: 1, value: 750000, position: 'Napastnik', previousClubs: ['LGD'] },
  { playerId: 6, name: 'JanGrzesik', teamId: 'ZAW', goals: 8, assists: 5, cleanSheets: 0, yellowCards: 1, redCards: 0, value: 650000, position: 'Obrońca', previousClubs: ['ZAG'] },
  { playerId: 7, name: 'CamiloMena', teamId: 'ZAG', goals: 7, assists: 5, cleanSheets: 0, yellowCards: 4, redCards: 0, value: 1100000, position: 'Pomocnik', previousClubs: ['LGD'] },
  { playerId: 8, name: 'BartoszNowak', teamId: 'SOK', goals: 6, assists: 5, cleanSheets: 0, yellowCards: 2, redCards: 0, value: 550000, position: 'Pomocnik', previousClubs: ['LPO'] },
  { playerId: 9, name: 'RafalWolski', teamId: 'LGD', goals: 5, assists: 5, cleanSheets: 0, yellowCards: 1, redCards: 0, value: 450000, position: 'Pomocnik', previousClubs: ['LEG', 'WIS'] },
  { playerId: 10, name: 'JesusImaz', teamId: 'POG', goals: 9, assists: 3, cleanSheets: 0, yellowCards: 3, redCards: 0, value: 800000, position: 'Pomocnik', previousClubs: ['LEG'] },
  { playerId: 11, name: 'KacperTobiasz', teamId: 'LEG', goals: 0, assists: 0, cleanSheets: 7, yellowCards: 0, redCards: 0, value: 2000000, position: 'Bramkarz', previousClubs: [] },
  { playerId: 12, name: 'BartoszMrozek', teamId: 'LPO', goals: 0, assists: 0, cleanSheets: 6, yellowCards: 1, redCards: 0, value: 1200000, position: 'Bramkarz', previousClubs: ['ZAG'] },
  { playerId: 13, name: 'ValentinCojocaru', teamId: 'POG', goals: 0, assists: 0, cleanSheets: 5, yellowCards: 0, redCards: 0, value: 900000, position: 'Bramkarz', previousClubs: [] },
  { playerId: 14, name: 'KrzysztofBebicz', teamId: 'ZAG', goals: 0, assists: 0, cleanSheets: 5, yellowCards: 2, redCards: 0, value: 400000, position: 'Bramkarz', previousClubs: [] },
  { playerId: 15, name: 'MateuszKochalski', teamId: 'WIS', goals: 0, assists: 0, cleanSheets: 4, yellowCards: 1, redCards: 0, value: 700000, position: 'Bramkarz', previousClubs: [] },
];

export interface Article {
  id: number;
  title: string;
  description: string;
  content?: string;
  image: string;
  category: string;
  date: string;
  author?: string;
  isVertical?: boolean;
}

export const newsArticles: Article[] = [];

export const friendlyMatchesData = [
  {
    round: 'MARZEC 2026',
    matches: [
      { id: 'f11', homeTeam: teams[4], awayTeam: teams[7], date: '2026-03-10', time: '18:00', status: 'upcoming', stadium: 'OŚRODEK TRENINGOWY PFF', category: 'MECZ TOWARZYSKI' },
      { id: 'f12', homeTeam: teams[1], awayTeam: teams[3], date: '2026-03-12', time: '20:00', status: 'upcoming', stadium: 'OŚRODEK TRENINGOWY PFF', category: 'SPARING' },
    ]
  },
  {
    round: 'LUTY 2026',
    matches: [
      { id: 'f8', homeTeam: teams[11], awayTeam: teams[1], date: '2026-02-01', time: '17:30', status: 'upcoming', stadium: 'OŚRODEK TRENINGOWY PFF', category: 'PRE-SEASON' },
      { id: 'f9', homeTeam: teams[2], awayTeam: teams[5], date: '2026-02-02', time: '19:00', status: 'upcoming', stadium: 'OŚRODEK TRENINGOWY PFF', category: 'SPARING' },
      { id: 'f10', homeTeam: teams[7], awayTeam: teams[8], date: '2026-02-03', time: '18:30', status: 'upcoming', stadium: 'OŚRODEK TRENINGOWY PFF', category: 'MECZ KONTROLNY' },
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
    image: 'https://i.ibb.co/TB027G07/czarnepff-1.png',
    type: 'image',
    date: '2026-01-09',
  }
];

export const cupMatchesData: any[] = [];

export const findMatchById = (id: string): Match | undefined => {
  const allMatches: Match[] = [
    ...matches,
    ...friendlyMatchesData.flatMap(r => r.matches as Match[]),
    ...cupMatchesData.flatMap(r => r.matches as Match[])
  ];
  return allMatches.find(m => m.id === id);
};
