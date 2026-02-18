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
    id: 'RAK',
    name: 'Raków Częstochowa',
    shortName: 'Raków',
    logo: 'https://i.ibb.co/b5q4tsmh/obraz-2026-02-13-230749363.png',
    color: '#dc2626',
    stadium: 'Miejski Stadion Piłkarski Raków'
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
    id: 'GOR', 
    name: 'Górnik Zabrze', 
    shortName: 'Górnik', 
    logo: 'https://i.ibb.co/JbKwtPG/obraz-2026-02-15-150938056-removebg-preview-1.png',
    color: '#dc2626',
    stadium: 'Stadion im. Ernesta Pohla'
  },
  { 
    id: 'WID', 
    name: 'Widzew Łódź', 
    shortName: 'Widzew', 
    logo: 'https://i.ibb.co/Kzmfkdbb/Herb-Widzew-d.png',
    color: '#dc2626',
    stadium: 'Stadion Widzewa Łódź'
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
  'WID': 'Club 6', // Widzew Łódź
  'POG': 'Club 7', // Pogoń Szczecin
  'ZAG': 'Club 8', // Zagłębie Lubin
  'SOK': 'Club 9', // Sokół Olsztyn
  'WIS': 'Club 10', // Wisła Kraków
  'GRO': 'Club 11', // Grom Nowy Staw
  'GOR': 'Club 12', // Górnik Zabrze
  'MOT': 'Club 13', // Motor Lublin
  'RAK': 'Club 14', // Raków Częstochowa
  'JAG': 'Club 15', // Jagiellonia Białystok
  'WPL': 'Club 16', // Wisła Płock
  'SED': 'Referee', // Sędziowie
  'MED': 'Media'     // Media
};

export const extraTeams: Team[] = [
  { id: 'ext1', name: 'GKS Katowice', shortName: 'GKS', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/GKS_Katowice_logo.png' },
  { id: 'WID', name: 'Widzew Łódź', shortName: 'Widzew', logo: 'https://i.ibb.co/Kzmfkdbb/Herb-Widzew-d.png' },
  { id: 'ext3', name: 'Cracovia', shortName: 'Cracovia', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/05/KS_Cracovia_logo.svg' },
  { id: 'ext4', name: 'Korona Kielce', shortName: 'Korona', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Korona_Kielce.svg' },
  { id: 'ext5', name: 'Radomiak Radom', shortName: 'Radomiak', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Radomiak_Radom_Logo.png' },
];

export const matches: Match[] = [
  // Runda 1
  { id: 'm1', homeTeam: teams[0], awayTeam: teams[1], date: '2026-01-25T20:30:00', round: 1, status: 'upcoming', stadium: teams[0].stadium, category: 'EKSTRAKLASA' },
  { id: 'm2', homeTeam: teams[2], awayTeam: teams[3], date: '2026-01-25T17:00:00', round: 1, status: 'upcoming', stadium: teams[2].stadium, category: 'EKSTRAKLASA' },
  { id: 'm4', homeTeam: teams[6], awayTeam: teams[7], date: '2026-01-26T19:30:00', round: 1, status: 'upcoming', stadium: teams[6].stadium, category: 'EKSTRAKLASA' },
  { id: 'm5', homeTeam: teams[8], awayTeam: teams[9], date: '2026-01-26T15:00:00', round: 1, status: 'upcoming', stadium: teams[8].stadium, category: 'EKSTRAKLASA' },
  { id: 'm6', homeTeam: teams[10], awayTeam: teams[3], date: '2026-01-26T17:30:00', round: 1, status: 'upcoming', stadium: teams[10].stadium, category: 'EKSTRAKLASA' },
  { id: 'm6b', homeTeam: teams[11], awayTeam: teams[12], date: '2026-01-26T18:00:00', round: 1, status: 'upcoming', stadium: teams[11].stadium, category: 'EKSTRAKLASA' },

  // Runda 2
  { id: 'm7', homeTeam: teams[1], awayTeam: teams[2], date: '2026-02-01T20:00:00', round: 2, status: 'upcoming', stadium: teams[1].stadium, category: 'EKSTRAKLASA' },
  { id: 'm8', homeTeam: teams[3], awayTeam: teams[4], date: '2026-02-01T17:00:00', round: 2, status: 'upcoming', stadium: teams[3].stadium, category: 'EKSTRAKLASA' },
  { id: 'm9', homeTeam: teams[5], awayTeam: teams[6], date: '2026-02-01T19:30:00', round: 2, status: 'upcoming', stadium: teams[5].stadium, category: 'EKSTRAKLASA' },
  { id: 'm10', homeTeam: teams[7], awayTeam: teams[8], date: '2026-02-02T17:00:00', round: 2, status: 'upcoming', stadium: teams[7].stadium, category: 'EKSTRAKLASA' },
  { id: 'm11', homeTeam: teams[9], awayTeam: teams[10], date: '2026-02-02T19:30:00', round: 2, status: 'upcoming', stadium: teams[9].stadium, category: 'EKSTRAKLASA' },
  { id: 'm12', homeTeam: teams[0], awayTeam: teams[3], date: '2026-02-02T20:30:00', round: 2, status: 'upcoming', stadium: teams[0].stadium, category: 'EKSTRAKLASA' },
  { id: 'm12b', homeTeam: teams[12], awayTeam: teams[11], date: '2026-02-02T21:00:00', round: 2, status: 'upcoming', stadium: teams[12].stadium, category: 'EKSTRAKLASA' },

  // Runda 3
  { id: 'm13', homeTeam: teams[2], awayTeam: teams[0], date: '2026-02-08T20:30:00', round: 3, status: 'upcoming', stadium: teams[2].stadium, category: 'EKSTRAKLASA' },
  { id: 'm14', homeTeam: teams[4], awayTeam: teams[1], date: '2026-02-08T17:00:00', round: 3, status: 'upcoming', stadium: teams[4].stadium, category: 'EKSTRAKLASA' },
  { id: 'm15', homeTeam: teams[6], awayTeam: teams[3], date: '2026-02-08T19:30:00', round: 3, status: 'upcoming', stadium: teams[6].stadium, category: 'EKSTRAKLASA' },
  { id: 'm16', homeTeam: teams[8], awayTeam: teams[5], date: '2026-02-09T17:00:00', round: 3, status: 'upcoming', stadium: teams[8].stadium, category: 'EKSTRAKLASA' },
  { id: 'm17', homeTeam: teams[10], awayTeam: teams[7], date: '2026-02-09T19:30:00', round: 3, status: 'upcoming', stadium: teams[10].stadium, category: 'EKSTRAKLASA' },
  { id: 'm18', homeTeam: teams[3], awayTeam: teams[9], date: '2026-02-09T20:00:00', round: 3, status: 'upcoming', stadium: teams[3].stadium, category: 'EKSTRAKLASA' },

  // Runda 4
  { id: 'm19', homeTeam: teams[0], awayTeam: teams[4], date: '2026-02-15T20:30:00', round: 4, status: 'upcoming', stadium: teams[0].stadium, category: 'EKSTRAKLASA' },
  { id: 'm20', homeTeam: teams[1], awayTeam: teams[6], date: '2026-02-15T17:00:00', round: 4, status: 'upcoming', stadium: teams[1].stadium, category: 'EKSTRAKLASA' },
  { id: 'm21', homeTeam: teams[3], awayTeam: teams[8], date: '2026-02-15T19:30:00', round: 4, status: 'upcoming', stadium: teams[3].stadium, category: 'EKSTRAKLASA' },
  { id: 'm22', homeTeam: teams[5], awayTeam: teams[10], date: '2026-02-16T17:00:00', round: 4, status: 'upcoming', stadium: teams[5].stadium, category: 'EKSTRAKLASA' },
  { id: 'm23', homeTeam: teams[7], awayTeam: teams[2], date: '2026-02-16T19:30:00', round: 4, status: 'upcoming', stadium: teams[7].stadium, category: 'EKSTRAKLASA' },
  { id: 'm24', homeTeam: teams[9], awayTeam: teams[0], date: '2026-02-16T20:00:00', round: 4, status: 'upcoming', stadium: teams[9].stadium, category: 'EKSTRAKLASA' },

  // Runda 5
  { id: 'm25', homeTeam: teams[4], awayTeam: teams[7], date: '2026-02-22T20:30:00', round: 5, status: 'upcoming', stadium: teams[4].stadium, category: 'EKSTRAKLASA' },
  { id: 'm26', homeTeam: teams[6], awayTeam: teams[9], date: '2026-02-22T17:00:00', round: 5, status: 'upcoming', stadium: teams[6].stadium, category: 'EKSTRAKLASA' },
  { id: 'm27', homeTeam: teams[8], awayTeam: teams[1], date: '2026-02-22T19:30:00', round: 5, status: 'upcoming', stadium: teams[8].stadium, category: 'EKSTRAKLASA' },
  { id: 'm28', homeTeam: teams[10], awayTeam: teams[3], date: '2026-02-23T17:00:00', round: 5, status: 'upcoming', stadium: teams[10].stadium, category: 'EKSTRAKLASA' },
  { id: 'm29', homeTeam: teams[2], awayTeam: teams[5], date: '2026-02-23T19:30:00', round: 5, status: 'upcoming', stadium: teams[2].stadium, category: 'EKSTRAKLASA' },
  { id: 'm30', homeTeam: teams[0], awayTeam: teams[6], date: '2026-02-23T20:00:00', round: 5, status: 'upcoming', stadium: teams[0].stadium, category: 'EKSTRAKLASA' },

  // Runda 6
  { id: 'm31', homeTeam: teams[7], awayTeam: teams[0], date: '2026-03-01T20:30:00', round: 6, status: 'upcoming' },
  { id: 'm32', homeTeam: teams[9], awayTeam: teams[2], date: '2026-03-01T17:00:00', round: 6, status: 'upcoming' },
  { id: 'm33', homeTeam: teams[1], awayTeam: teams[10], date: '2026-03-01T19:30:00', round: 6, status: 'upcoming' },
  { id: 'm34', homeTeam: teams[3], awayTeam: teams[4], date: '2026-03-02T17:00:00', round: 6, status: 'upcoming' },
  { id: 'm35', homeTeam: teams[5], awayTeam: teams[8], date: '2026-03-02T19:30:00', round: 6, status: 'upcoming' },
  { id: 'm36', homeTeam: teams[6], awayTeam: teams[0], date: '2026-03-02T20:00:00', round: 6, status: 'upcoming' },

  // Runda 7
  { id: 'm37', homeTeam: teams[0], awayTeam: teams[9], date: '2026-03-08T20:30:00', round: 7, status: 'upcoming' },
  { id: 'm38', homeTeam: teams[2], awayTeam: teams[1], date: '2026-03-08T17:00:00', round: 7, status: 'upcoming' },
  { id: 'm39', homeTeam: teams[4], awayTeam: teams[5], date: '2026-03-08T19:30:00', round: 7, status: 'upcoming' },
  { id: 'm40', homeTeam: teams[6], awayTeam: teams[7], date: '2026-03-09T17:00:00', round: 7, status: 'upcoming' },
  { id: 'm41', homeTeam: teams[8], awayTeam: teams[3], date: '2026-03-09T19:30:00', round: 7, status: 'upcoming' },
  { id: 'm42', homeTeam: teams[10], awayTeam: teams[9], date: '2026-03-09T20:00:00', round: 7, status: 'upcoming' },

  // Runda 8
  { id: 'm43', homeTeam: teams[9], awayTeam: teams[4], date: '2026-03-15T20:30:00', round: 8, status: 'upcoming' },
  { id: 'm44', homeTeam: teams[1], awayTeam: teams[0], date: '2026-03-15T17:00:00', round: 8, status: 'upcoming' },
  { id: 'm45', homeTeam: teams[3], awayTeam: teams[2], date: '2026-03-15T19:30:00', round: 8, status: 'upcoming' },
  { id: 'm46', homeTeam: teams[5], awayTeam: teams[6], date: '2026-03-16T17:00:00', round: 8, status: 'upcoming' },
  { id: 'm47', homeTeam: teams[7], awayTeam: teams[10], date: '2026-03-16T19:30:00', round: 8, status: 'upcoming' },
  { id: 'm48', homeTeam: teams[8], awayTeam: teams[0], date: '2026-03-16T20:00:00', round: 8, status: 'upcoming' },

  // Runda 9
  { id: 'm49', homeTeam: teams[0], awayTeam: teams[10], date: '2026-03-22T20:30:00', round: 9, status: 'upcoming' },
  { id: 'm50', homeTeam: teams[2], awayTeam: teams[9], date: '2026-03-22T17:00:00', round: 9, status: 'upcoming' },
  { id: 'm51', homeTeam: teams[4], awayTeam: teams[3], date: '2026-03-22T19:30:00', round: 9, status: 'upcoming' },
  { id: 'm52', homeTeam: teams[6], awayTeam: teams[8], date: '2026-03-23T17:00:00', round: 9, status: 'upcoming' },
  { id: 'm53', homeTeam: teams[1], awayTeam: teams[5], date: '2026-03-23T19:30:00', round: 9, status: 'upcoming' },
  { id: 'm54', homeTeam: teams[7], awayTeam: teams[4], date: '2026-03-23T20:00:00', round: 9, status: 'upcoming' },

  // Runda 10
  { id: 'm55', homeTeam: teams[10], awayTeam: teams[0], date: '2026-03-29T20:30:00', round: 10, status: 'upcoming' },
  { id: 'm56', homeTeam: teams[9], awayTeam: teams[6], date: '2026-03-29T17:00:00', round: 10, status: 'upcoming' },
  { id: 'm57', homeTeam: teams[3], awayTeam: teams[1], date: '2026-03-29T19:30:00', round: 10, status: 'upcoming' },
  { id: 'm58', homeTeam: teams[5], awayTeam: teams[2], date: '2026-03-30T17:00:00', round: 10, status: 'upcoming' },
  { id: 'm59', homeTeam: teams[7], awayTeam: teams[9], date: '2026-03-30T19:30:00', round: 10, status: 'upcoming' },
  { id: 'm60', homeTeam: teams[8], awayTeam: teams[4], date: '2026-03-30T20:00:00', round: 10, status: 'upcoming' },

  // Runda 11 - Rewanże
  { id: 'm61', homeTeam: teams[1], awayTeam: teams[0], date: '2026-04-05T20:30:00', round: 11, status: 'upcoming' },
  { id: 'm62', homeTeam: teams[3], awayTeam: teams[2], date: '2026-04-05T17:00:00', round: 11, status: 'upcoming' },
  { id: 'm63', homeTeam: teams[5], awayTeam: teams[4], date: '2026-04-05T19:30:00', round: 11, status: 'upcoming' },
  { id: 'm64', homeTeam: teams[7], awayTeam: teams[6], date: '2026-04-06T19:30:00', round: 11, status: 'upcoming' },
  { id: 'm65', homeTeam: teams[9], awayTeam: teams[8], date: '2026-04-06T15:00:00', round: 11, status: 'upcoming' },
  { id: 'm66', homeTeam: teams[3], awayTeam: teams[10], date: '2026-04-06T17:30:00', round: 11, status: 'upcoming' },

  // Runda 12
  { id: 'm67', homeTeam: teams[2], awayTeam: teams[1], date: '2026-04-12T20:00:00', round: 12, status: 'upcoming' },
  { id: 'm68', homeTeam: teams[4], awayTeam: teams[3], date: '2026-04-12T17:00:00', round: 12, status: 'upcoming' },
  { id: 'm69', homeTeam: teams[6], awayTeam: teams[5], date: '2026-04-12T19:30:00', round: 12, status: 'upcoming' },
  { id: 'm70', homeTeam: teams[8], awayTeam: teams[7], date: '2026-04-13T17:00:00', round: 12, status: 'upcoming' },
  { id: 'm71', homeTeam: teams[10], awayTeam: teams[9], date: '2026-04-13T19:30:00', round: 12, status: 'upcoming' },
  { id: 'm72', homeTeam: teams[3], awayTeam: teams[0], date: '2026-04-13T20:30:00', round: 12, status: 'upcoming' },

  // Runda 13
  { id: 'm73', homeTeam: teams[0], awayTeam: teams[2], date: '2026-04-19T20:30:00', round: 13, status: 'upcoming' },
  { id: 'm74', homeTeam: teams[1], awayTeam: teams[4], date: '2026-04-19T17:00:00', round: 13, status: 'upcoming' },
  { id: 'm75', homeTeam: teams[3], awayTeam: teams[6], date: '2026-04-19T19:30:00', round: 13, status: 'upcoming' },
  { id: 'm76', homeTeam: teams[5], awayTeam: teams[8], date: '2026-04-20T17:00:00', round: 13, status: 'upcoming' },
  { id: 'm77', homeTeam: teams[7], awayTeam: teams[10], date: '2026-04-20T19:30:00', round: 13, status: 'upcoming' },
  { id: 'm78', homeTeam: teams[9], awayTeam: teams[3], date: '2026-04-20T20:00:00', round: 13, status: 'upcoming' },

  // Runda 14
  { id: 'm79', homeTeam: teams[4], awayTeam: teams[0], date: '2026-04-26T20:30:00', round: 14, status: 'upcoming' },
  { id: 'm80', homeTeam: teams[6], awayTeam: teams[1], date: '2026-04-26T17:00:00', round: 14, status: 'upcoming' },
  { id: 'm81', homeTeam: teams[8], awayTeam: teams[3], date: '2026-04-26T19:30:00', round: 14, status: 'upcoming' },
  { id: 'm82', homeTeam: teams[10], awayTeam: teams[5], date: '2026-04-27T17:00:00', round: 14, status: 'upcoming' },
  { id: 'm83', homeTeam: teams[2], awayTeam: teams[7], date: '2026-04-27T19:30:00', round: 14, status: 'upcoming' },
  { id: 'm84', homeTeam: teams[0], awayTeam: teams[9], date: '2026-04-27T20:00:00', round: 14, status: 'upcoming' },

  // Runda 15
  { id: 'm85', homeTeam: teams[7], awayTeam: teams[4], date: '2026-05-03T20:30:00', round: 15, status: 'upcoming' },
  { id: 'm86', homeTeam: teams[9], awayTeam: teams[6], date: '2026-05-03T17:00:00', round: 15, status: 'upcoming' },
  { id: 'm87', homeTeam: teams[1], awayTeam: teams[8], date: '2026-05-03T19:30:00', round: 15, status: 'upcoming' },
  { id: 'm88', homeTeam: teams[3], awayTeam: teams[10], date: '2026-05-04T17:00:00', round: 15, status: 'upcoming' },
  { id: 'm89', homeTeam: teams[5], awayTeam: teams[2], date: '2026-05-04T19:30:00', round: 15, status: 'upcoming' },
  { id: 'm90', homeTeam: teams[6], awayTeam: teams[0], date: '2026-05-04T20:00:00', round: 15, status: 'upcoming' },

  // Runda 16
  { id: 'm91', homeTeam: teams[0], awayTeam: teams[7], date: '2026-05-10T20:30:00', round: 16, status: 'upcoming' },
  { id: 'm92', homeTeam: teams[2], awayTeam: teams[9], date: '2026-05-10T17:00:00', round: 16, status: 'upcoming' },
  { id: 'm93', homeTeam: teams[10], awayTeam: teams[1], date: '2026-05-10T19:30:00', round: 16, status: 'upcoming' },
  { id: 'm94', homeTeam: teams[4], awayTeam: teams[3], date: '2026-05-11T17:00:00', round: 16, status: 'upcoming' },
  { id: 'm95', homeTeam: teams[8], awayTeam: teams[5], date: '2026-05-11T19:30:00', round: 16, status: 'upcoming' },
  { id: 'm96', homeTeam: teams[0], awayTeam: teams[6], date: '2026-05-11T20:00:00', round: 16, status: 'upcoming' },

  // Runda 17
  { id: 'm97', homeTeam: teams[9], awayTeam: teams[0], date: '2026-05-17T20:30:00', round: 17, status: 'upcoming' },
  { id: 'm98', homeTeam: teams[1], awayTeam: teams[2], date: '2026-05-17T17:00:00', round: 17, status: 'upcoming' },
  { id: 'm99', homeTeam: teams[5], awayTeam: teams[4], date: '2026-05-17T19:30:00', round: 17, status: 'upcoming' },
  { id: 'm100', homeTeam: teams[7], awayTeam: teams[6], date: '2026-05-18T17:00:00', round: 17, status: 'upcoming' },
  { id: 'm101', homeTeam: teams[3], awayTeam: teams[8], date: '2026-05-18T19:30:00', round: 17, status: 'upcoming' },
  { id: 'm102', homeTeam: teams[9], awayTeam: teams[10], date: '2026-05-18T20:00:00', round: 17, status: 'upcoming' },

  // Runda 18
  { id: 'm103', homeTeam: teams[4], awayTeam: teams[9], date: '2026-05-24T20:30:00', round: 18, status: 'upcoming' },
  { id: 'm104', homeTeam: teams[0], awayTeam: teams[1], date: '2026-05-24T17:00:00', round: 18, status: 'upcoming' },
  { id: 'm105', homeTeam: teams[2], awayTeam: teams[3], date: '2026-05-24T19:30:00', round: 18, status: 'upcoming' },
  { id: 'm106', homeTeam: teams[6], awayTeam: teams[5], date: '2026-05-25T17:00:00', round: 18, status: 'upcoming' },
  { id: 'm107', homeTeam: teams[10], awayTeam: teams[7], date: '2026-05-25T19:30:00', round: 18, status: 'upcoming' },
  { id: 'm108', homeTeam: teams[0], awayTeam: teams[8], date: '2026-05-25T20:00:00', round: 18, status: 'upcoming' },

  // Runda 19
  { id: 'm109', homeTeam: teams[10], awayTeam: teams[0], date: '2026-05-31T20:30:00', round: 19, status: 'upcoming' },
  { id: 'm110', homeTeam: teams[9], awayTeam: teams[2], date: '2026-05-31T17:00:00', round: 19, status: 'upcoming' },
  { id: 'm111', homeTeam: teams[3], awayTeam: teams[4], date: '2026-05-31T19:30:00', round: 19, status: 'upcoming' },
  { id: 'm112', homeTeam: teams[8], awayTeam: teams[6], date: '2026-06-01T17:00:00', round: 19, status: 'upcoming' },
  { id: 'm113', homeTeam: teams[5], awayTeam: teams[1], date: '2026-06-01T19:30:00', round: 19, status: 'upcoming' },
  { id: 'm114', homeTeam: teams[4], awayTeam: teams[7], date: '2026-06-01T20:00:00', round: 19, status: 'upcoming' },

  // Runda 20
  { id: 'm115', homeTeam: teams[0], awayTeam: teams[10], date: '2026-06-07T20:30:00', round: 20, status: 'upcoming' },
  { id: 'm116', homeTeam: teams[6], awayTeam: teams[9], date: '2026-06-07T17:00:00', round: 20, status: 'upcoming' },
  { id: 'm117', homeTeam: teams[1], awayTeam: teams[3], date: '2026-06-07T19:30:00', round: 20, status: 'upcoming' },
  { id: 'm118', homeTeam: teams[2], awayTeam: teams[5], date: '2026-06-08T17:00:00', round: 20, status: 'upcoming' },
  { id: 'm119', homeTeam: teams[9], awayTeam: teams[7], date: '2026-06-08T19:30:00', round: 20, status: 'upcoming' },
  { id: 'm120', homeTeam: teams[4], awayTeam: teams[8], date: '2026-06-08T20:00:00', round: 20, status: 'upcoming' },
];

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

export const newsArticles = [
  {
    id: 1,
    category: 'EKSTRAKLASA',
    title: 'Pierwszy sezon Ekstraklasy na Polskiej Federacji Futbolu za niedługo startuje!',
    image: 'https://i.ibb.co/SXDCV1tC/PFFGRAFIKA.png',
    isVertical: true,
    description: 'Już wkrótce rozpoczynamy historyczny, pierwszy sezon rozgrywek Ekstraklasy pod szyldem Polskiej Federacji Futbolu. Przygotujcie się na niesamowite emocje!',
    content: `Pierwszy sezon Ekstraklasy PFF w Roblox – wszystko dopiero się zaczyna. Pierwszy sezon Ekstraklasy Polskiej Federacji Futbolu w Roblox to start zupełnie nowego projektu, który ma na celu stworzenie miejsca dla wszystkich fanów piłki nożnej w wirtualnym świecie. To moment, w którym liga dopiero nabiera kształtów, a każdy zawodnik ma szansę zapisać się w jej historii od samego początku. Nie ma jeszcze gwiazd, legend ani faworytów — są za to pasja, rywalizacja i otwarte drzwi dla nowych graczy, którzy chcą spróbować swoich sił na boisku.

Ekstraklasa PFF w Roblox wystartowała jako pierwsza oficjalna liga organizowana przez Polską Federację Futbolu. Sezon inauguracyjny to etap budowania zasad, struktur i drużyn, które w przyszłości stworzą silną i rozpoznawalną ligę. Rozgrywki są otwarte na nowych zawodników, a każdy mecz to okazja do nauki, rozwoju umiejętności i dobrej zabawy. Liczy się zaangażowanie, współpraca zespołowa i chęć gry — nie doświadczenie.

Pierwszy sezon to czas eksperymentów i wspólnego tworzenia ligi. Kluby dopiero się formują, a zawodnicy mają realny wpływ na atmosferę, styl gry i przyszłość rozgrywek. Każdy gol, każda asysta i każdy mecz budują historię Ekstraklasy PFF od samych podstaw. Jeśli szukasz miejsca, gdzie możesz pograć w piłkę w Roblox, poznać nowych ludzi i stać się częścią rozwijającej się społeczności — Ekstraklasa PFF to idealne miejsce na start. To nie jest liga gotowa — to liga, którą tworzymy razem.`,
    date: '10.01.2026, 17:15',
    author: 'Redakcja PFF',
    relatedTeamIds: []
  }
];

export const friendlyMatchesData = [
  {
    round: 'STYCZEŃ 2026',
    matches: [
      { id: 'f1', homeTeam: teams[0], awayTeam: teams[2], date: '2026-01-15', time: '19:00', status: 'upcoming', stadium: 'OŚRODEK TRENINGOWY PFF', category: 'ZIMOWE PRZYGOTOWANIA' },
      { id: 'f2', homeTeam: teams[1], awayTeam: teams[3], date: '2026-01-16', time: '20:00', status: 'upcoming', stadium: 'OŚRODEK TRENINGOWY PFF', category: 'MECZ TESTOWY' },
      { id: 'f3', homeTeam: teams[4], awayTeam: teams[6], date: '2026-01-20', time: '18:30', status: 'upcoming', stadium: 'OŚRODEK TRENINGOWY PFF', category: 'SPARING' },
      { id: 'f4', homeTeam: teams[5], awayTeam: teams[7], date: '2026-01-21', time: '17:00', status: 'upcoming', stadium: 'OŚRODEK TRENINGOWY PFF', category: 'MECZ KONTROLNY' },
      { id: 'f5', homeTeam: teams[8], awayTeam: teams[10], date: '2026-01-22', time: '19:00', status: 'upcoming', stadium: 'OŚRODEK TRENINGOWY PFF', category: 'ZIMOWE PRZYGOTOWANIA' },
      { id: 'f6', homeTeam: teams[9], awayTeam: teams[11], date: '2026-01-23', time: '18:00', status: 'upcoming', stadium: 'OŚRODEK TRENINGOWY PFF', category: 'SPARING' },
      { id: 'f7', homeTeam: teams[12], awayTeam: teams[0], date: '2026-01-24', time: '20:00', status: 'upcoming', stadium: 'OŚRODEK TRENINGOWY PFF', category: 'MECZ TESTOWY' },
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
    image: 'https://i.ibb.co/pBJgbXxn/image.png',
    type: 'image',
    date: '2026-01-09',
  }
];

export const cupMatchesData = [
  {
    round: '1/16 FINAŁU',
    matches: [
      { id: 'c1', homeTeam: teams[0], awayTeam: teams[1], date: '2026-03-10', time: '18:00', status: 'upcoming', stadium: teams[0].stadium, category: 'PUCHAR POLSKI' },
      { id: 'c2', homeTeam: teams[2], awayTeam: teams[3], date: '2026-03-10', time: '20:30', status: 'upcoming', stadium: teams[2].stadium, category: 'PUCHAR POLSKI' },
      { id: 'c3', homeTeam: teams[4], awayTeam: teams[5], date: '2026-03-11', time: '17:30', status: 'upcoming', stadium: teams[4].stadium, category: 'PUCHAR POLSKI' },
      { id: 'c4', homeTeam: teams[6], awayTeam: teams[7], date: '2026-03-11', time: '20:00', status: 'upcoming', stadium: teams[6].stadium, category: 'PUCHAR POLSKI' },
      { id: 'c5', homeTeam: teams[8], awayTeam: teams[9], date: '2026-03-12', time: '18:00', status: 'upcoming', stadium: teams[8].stadium, category: 'PUCHAR POLSKI' },
      { id: 'c6', homeTeam: teams[10], awayTeam: teams[1], date: '2026-03-12', time: '20:30', status: 'upcoming', stadium: teams[10].stadium, category: 'PUCHAR POLSKI' },
      { id: 'c7', homeTeam: teams[11], awayTeam: teams[12], date: '2026-03-13', time: '17:30', status: 'upcoming', stadium: teams[11].stadium, category: 'PUCHAR POLSKI' },
      { id: 'c8', homeTeam: teams[2], awayTeam: teams[6], date: '2026-03-13', time: '20:00', status: 'upcoming', stadium: teams[2].stadium, category: 'PUCHAR POLSKI' },
    ]
  },
  {
    round: '1/8 FINAŁU',
    matches: [
      { id: 'c9', homeTeam: null, awayTeam: null, date: 'TBD', time: 'TBD', status: 'upcoming', stadium: 'TBD', category: 'PUCHAR POLSKI' },
      { id: 'c10', homeTeam: null, awayTeam: null, date: 'TBD', time: 'TBD', status: 'upcoming', stadium: 'TBD', category: 'PUCHAR POLSKI' },
      { id: 'c11', homeTeam: null, awayTeam: null, date: 'TBD', time: 'TBD', status: 'upcoming', stadium: 'TBD', category: 'PUCHAR POLSKI' },
      { id: 'c12', homeTeam: null, awayTeam: null, date: 'TBD', time: 'TBD', status: 'upcoming', stadium: 'TBD', category: 'PUCHAR POLSKI' },
    ]
  },
  {
    round: '1/4 FINAŁU',
    matches: [
      { id: 'c13', homeTeam: null, awayTeam: null, date: 'TBD', time: 'TBD', status: 'upcoming', stadium: 'TBD', category: 'PUCHAR POLSKI' },
      { id: 'c14', homeTeam: null, awayTeam: null, date: 'TBD', time: 'TBD', status: 'upcoming', stadium: 'TBD', category: 'PUCHAR POLSKI' },
    ]
  }
];

export const findMatchById = (id: string): Match | undefined => {
  const allMatches: Match[] = [
    ...matches,
    ...friendlyMatchesData.flatMap(r => r.matches as Match[]),
    ...cupMatchesData.flatMap(r => r.matches as Match[])
  ];
  return allMatches.find(m => m.id === id);
};
