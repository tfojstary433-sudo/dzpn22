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
    id: 'ZAW', 
    name: 'Zawisza Bydgoszcz', 
    shortName: 'Zawisza', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Herb_Zawiszy_Bydgoszcz.png',
    color: '#1e40af',
    founded: '13.12.2025',
    stadium: 'Stadion Miejski w Bydgoszczy'
  } as any,
  { 
    id: 'ARK', 
    name: 'Arka Gdynia', 
    shortName: 'Arka', 
    logo: 'https://arka.gdynia.pl/files/herb/arka_gdynia_mzks_kolor.png',
    color: '#facc15',
    founded: '13.12.2025',
    stadium: 'Stadion Miejski w Gdyni'
  } as any,
  { 
    id: 'LEG', 
    name: 'Legia Warszawa', 
    shortName: 'Legia', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Legia_Warsaw_logo.png',
    color: '#16a34a',
    founded: '13.12.2025',
    stadium: 'Stadion Wojska Polskiego w Warszawie'
  } as any,
  { 
    id: 'LPO', 
    name: 'Lech Poznań', 
    shortName: 'Lech', 
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b0/KKS_Lech_Pozna%C5%84.svg/960px-KKS_Lech_Pozna%C5%84.svg.png',
    color: '#1e40af',
    founded: '14.12.2025',
    stadium: 'ENEA Stadion w Poznaniu'
  } as any,
  { 
    id: 'LGD', 
    name: 'Lechia Gdańsk', 
    shortName: 'Lechia', 
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b7/Lechia_Gda%C5%84sk_logo.svg/1200px-Lechia_Gda%C5%84sk_logo.svg.png',
    color: '#16a34a',
    founded: '14.12.2025',
    stadium: 'Stadion Energa w Gdańsku'
  } as any,
  { 
    id: 'WID', 
    name: 'Widzew Łódź', 
    shortName: 'Widzew', 
    logo: 'https://i.ibb.co/1fNvYHvf/Widzew-L-dz-logo.png',
    color: '#dc2626',
    stadium: 'Stadion Widzewa'
  } as any,
  { 
    id: 'POG', 
    name: 'Pogoń Szczecin', 
    shortName: 'Pogoń', 
    logo: 'https://pogoncdn.stellis.one/imgsize-xs/documents/7740889/44a6ff9f-f346-69e6-890c-c6f10c6e891b',
    color: '#1e3a8a',
    founded: '14.12.2025',
    stadium: 'Stadion Miejski im. Floriana Krygiera w Szczecinie'
  } as any,
  { 
    id: 'ZAG', 
    name: 'Zagłębie Lubin', 
    shortName: 'Zagłębie', 
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/20/Zag%C5%82%C4%99bie_Lubin_crest.svg/1200px-Zag%C5%82%C4%99bie_Lubin_crest.svg.png',
    color: '#f97316',
    founded: '14.12.2025',
    stadium: 'Stadion Zagłębia Lubin'
  } as any,
  { 
    id: 'SOK', 
    name: 'Sokół Olsztyn', 
    shortName: 'Sokół', 
    logo: 'https://i.ibb.co/r2KwDw8h/obraz-2026-01-05-231417131.png',
    color: '#00ccff',
    founded: '29.12.2025',
    stadium: 'Stadion Miejski w Ostródzie'
  } as any,
  { 
    id: 'WIS', 
    name: 'Wisła Kraków', 
    shortName: 'Wisła', 
    logo: 'https://upload.wikimedia.org/wikipedia/en/1/15/Wis%C5%82a_Krak%C3%B3w_logo.svg',
    color: '#dc2626',
    founded: '03.01.2026',
    stadium: 'Stadion Miejski im. Henryka Reymana'
  } as any,
  { 
    id: 'GOR', 
    name: 'Górnik Zabrze', 
    shortName: 'Górnik', 
    logo: 'https://i.ibb.co/VWrm9ws7/obraz-2026-03-12-125114114-removebg-preview.png',
    color: '#16a34a',
    stadium: 'Stadion im. Ernesta Pohla'
  } as any,
  { 
    id: 'MOT', 
    name: 'Motor Lublin', 
    shortName: 'Motor', 
    logo: 'https://i.ibb.co/bgRJrvnj/Motor-Lublin-S-A-Oficjalny-Herb.png',
    color: '#facc15',
    stadium: 'Arena Lublin'
  } as any,
  { 
    id: 'RAK', 
    name: 'Raków Częstochowa', 
    shortName: 'Raków', 
    logo: 'https://i.ibb.co/JWY69LTG/obraz-2026-03-12-125051411-removebg-preview.png',
    color: '#dc2626',
    stadium: 'Miejski Stadion Piłkarski Raków'
  } as any,
  { 
    id: 'JAG', 
    name: 'Jagiellonia Białystok', 
    shortName: 'Jagiellonia', 
    logo: 'https://i.ibb.co/1JmyhfVn/obraz-2026-01-29-161936924.png',
    color: '#facc15',
    stadium: 'Stadion Miejski w Białymstoku'
  } as any,
  { 
    id: 'WPL', 
    name: 'Wisła Płock', 
    shortName: 'Wisła Płock', 
    logo: 'https://i.ibb.co/SX6LkvnR/obraz-2026-02-01-105518416.png',
    color: '#1e40af',
    stadium: 'Stadion im. Kazimierza Górskiego'
  } as any,
  { 
    id: 'BBT', 
    name: 'Bruk-Bet Termalica', 
    shortName: 'Termalica', 
    logo: 'https://i.ibb.co/ymPLdBLJ/obraz-2026-03-12-125026443-removebg-preview.png',
    color: '#f97316',
    founded: '04.01.2026',
    stadium: 'Stadion Bruk-Bet w Niecieczy'
  } as any,
  {
    id: 'SED',
    name: 'Kolegium Sędziowskie',
    shortName: 'Sędziowie',
    logo: 'https://i.ibb.co/5hYr57Mr/obraz-2026-02-01-142942311.png',
    color: '#ef4444',
    founded: '01.01.2026',
    president: 'Zarząd PFF',
    stadium: 'PFF Arena'
  } as any,
];

// Map club IDs to Firebase keys
export const clubToFirebaseKey: { [key: string]: string } = {
  'ZAW': 'Club 1', // Zawisza Bydgoszcz
  'ARK': 'Club 2', // Arka Gdynia
  'LEG': 'Club 3', // Legia Warszawa
  'LPO': 'Club 4', // Lech Poznań
  'LGD': 'Club 5', // Lechia Gdańsk
  'WID': 'Club 6', // Widzew Łódź
  'POG': 'Club 7', // Pogoń Szczecin
  'ZAG': 'Club 8', // Zagłębie Lubin
  'SOK': 'Club 9', // Sokół Olsztyn
  'WIS': 'Club 10', // Wisła Kraków
  'GOR': 'Club 12', // Górnik Zabrze
  'MOT': 'Club 13', // Motor Lublin
  'RAK': 'Club 14', // Raków Częstochowa
  'JAG': 'Club 15', // Jagiellonia Białystok
  'WPL': 'Club 16', // Wisła Płock
  'BBT': 'Club 17', // Bruk-Bet Termalica
  'SED': 'Referee', // Sędziowie
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

export const newsArticles: Article[] = [];

export const friendlyMatchesData: any[] = [];

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
    ...friendlyMatchesData.flatMap((r: any) => r.matches as Match[]),
    ...cupMatchesData.flatMap((r: any) => r.matches as Match[])
  ];
  return allMatches.find(m => m.id === id);
};
