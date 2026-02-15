"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { matches, Match, teams, extraTeams, standings, friendlyMatchesData, findMatchById } from '@/lib/data';
import { REPLIT_API_BASE_URL, API_ENDPOINTS } from '@/lib/constants';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useParams } from 'next/navigation';
import { RobloxAvatar } from '@/components/roblox-avatar';

const isUuid = (v: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(v);
const isNumeric = (v: string) => /^\d+$/.test(v);

const normalizeTeamName = (name: string) =>
  (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .trim();


interface Goal {
  minute: number;
  player: string;
  team: string;
  isPenalty: boolean;
  number?: number;
}

interface Card {
  minute: number;
  player: string;
  team: string;
  type: 'yellow' | 'red';
  number?: number;
}

interface Substitution {
  minute: number;
  team: string;
  playerOut: string;
  playerIn: string;
  numberOut?: number;
  numberIn?: number;
}

interface MatchEvents {
  goals: Goal[];
  cards: Card[];
  substitutions: Substitution[];
  cancelledGoals?: any[];
}

interface MatchApiData {
  match: {
    status: string;
    uuid: string;
    teamA: string;
    teamB: string;
    scoreA: number;
    scoreB: number;
    timer: string;
    period: string;
    isActive: boolean;
    stats?: {
      possessionA: number;
      possessionB: number;
      shotsA: number;
      shotsB: number;
      onTargetA?: number;
      onTargetB?: number;
      cornersA?: number;
      cornersB?: number;
      foulsA?: number;
      foulsB?: number;
      xgA?: number;
      xgB?: number;
    };
    lineupA?: {
      starters: Array<{ name: string; id: string; position?: string }>;
      bench: Array<{ name: string; id: string; position?: string }>;
      formation: string;
    };
    lineupB?: {
      starters: Array<{ name: string; id: string; position?: string }>;
      bench: Array<{ name: string; id: string; position?: string }>;
      formation: string;
    };
  };
  events: MatchEvents;
  timeline?: Array<{
    minute: number;
    type: string;
    player?: string;
    team?: string;
    content?: string;
  }>;
}

interface PlayerPosition {
  x: string;
  y: string;
  color: string;
}

const getPlayerPositions = (formation: string, side: 'home' | 'away'): Record<string, PlayerPosition> => {
  const positionsByRole: Record<string, Record<string, PlayerPosition>> = {
    '4-4-2': {
      GK0: side === 'home' ? {x: '8%', y: '50%', color: 'blue-600'} : {x: '92%', y: '50%', color: 'red-600'},
      DEF0: side === 'home' ? {x: '20%', y: '15%', color: 'blue-600'} : {x: '80%', y: '15%', color: 'red-600'},
      DEF1: side === 'home' ? {x: '20%', y: '35%', color: 'blue-600'} : {x: '80%', y: '35%', color: 'red-600'},
      DEF2: side === 'home' ? {x: '20%', y: '65%', color: 'blue-600'} : {x: '80%', y: '65%', color: 'red-600'},
      DEF3: side === 'home' ? {x: '20%', y: '85%', color: 'blue-600'} : {x: '80%', y: '85%', color: 'red-600'},
      CM0: side === 'home' ? {x: '38%', y: '25%', color: 'blue-600'} : {x: '62%', y: '25%', color: 'red-600'},
      CM1: side === 'home' ? {x: '38%', y: '45%', color: 'blue-600'} : {x: '62%', y: '45%', color: 'red-600'},
      CM2: side === 'home' ? {x: '38%', y: '55%', color: 'blue-600'} : {x: '62%', y: '55%', color: 'red-600'},
      CM3: side === 'home' ? {x: '38%', y: '75%', color: 'blue-600'} : {x: '62%', y: '75%', color: 'red-600'},
      CAM0: side === 'home' ? {x: '55%', y: '35%', color: 'blue-600'} : {x: '45%', y: '35%', color: 'red-600'},
      CAM1: side === 'home' ? {x: '55%', y: '65%', color: 'blue-600'} : {x: '45%', y: '65%', color: 'red-600'},
      ST0: side === 'home' ? {x: '72%', y: '40%', color: 'blue-600'} : {x: '28%', y: '40%', color: 'red-600'},
      ST1: side === 'home' ? {x: '72%', y: '60%', color: 'blue-600'} : {x: '28%', y: '60%', color: 'red-600'},
    },
    '4-3-3': {
      GK0: side === 'home' ? {x: '8%', y: '50%', color: 'blue-600'} : {x: '92%', y: '50%', color: 'red-600'},
      DEF0: side === 'home' ? {x: '20%', y: '12%', color: 'blue-600'} : {x: '80%', y: '12%', color: 'red-600'},
      DEF1: side === 'home' ? {x: '20%', y: '35%', color: 'blue-600'} : {x: '80%', y: '35%', color: 'red-600'},
      DEF2: side === 'home' ? {x: '20%', y: '65%', color: 'blue-600'} : {x: '80%', y: '65%', color: 'red-600'},
      DEF3: side === 'home' ? {x: '20%', y: '88%', color: 'blue-600'} : {x: '80%', y: '88%', color: 'red-600'},
      CM0: side === 'home' ? {x: '40%', y: '25%', color: 'blue-600'} : {x: '60%', y: '25%', color: 'red-600'},
      CM1: side === 'home' ? {x: '40%', y: '50%', color: 'blue-600'} : {x: '60%', y: '50%', color: 'red-600'},
      CM2: side === 'home' ? {x: '40%', y: '75%', color: 'blue-600'} : {x: '60%', y: '75%', color: 'red-600'},
      ST0: side === 'home' ? {x: '70%', y: '18%', color: 'blue-600'} : {x: '30%', y: '18%', color: 'red-600'},
      ST1: side === 'home' ? {x: '70%', y: '50%', color: 'blue-600'} : {x: '30%', y: '50%', color: 'red-600'},
      ST2: side === 'home' ? {x: '70%', y: '82%', color: 'blue-600'} : {x: '30%', y: '82%', color: 'red-600'},
    },
    '3-5-2': {
      GK0: side === 'home' ? {x: '8%', y: '50%', color: 'blue-600'} : {x: '92%', y: '50%', color: 'red-600'},
      DEF0: side === 'home' ? {x: '20%', y: '25%', color: 'blue-600'} : {x: '80%', y: '25%', color: 'red-600'},
      DEF1: side === 'home' ? {x: '20%', y: '50%', color: 'blue-600'} : {x: '80%', y: '50%', color: 'red-600'},
      DEF2: side === 'home' ? {x: '20%', y: '75%', color: 'blue-600'} : {x: '80%', y: '75%', color: 'red-600'},
      CM0: side === 'home' ? {x: '40%', y: '15%', color: 'blue-600'} : {x: '60%', y: '15%', color: 'red-600'},
      CM1: side === 'home' ? {x: '40%', y: '35%', color: 'blue-600'} : {x: '60%', y: '35%', color: 'red-600'},
      CM2: side === 'home' ? {x: '40%', y: '65%', color: 'blue-600'} : {x: '60%', y: '65%', color: 'red-600'},
      CM3: side === 'home' ? {x: '40%', y: '85%', color: 'blue-600'} : {x: '60%', y: '85%', color: 'red-600'},
      ST0: side === 'home' ? {x: '70%', y: '38%', color: 'blue-600'} : {x: '30%', y: '38%', color: 'red-600'},
      ST1: side === 'home' ? {x: '70%', y: '62%', color: 'blue-600'} : {x: '30%', y: '62%', color: 'red-600'},
    },
  };
  return positionsByRole[formation] || positionsByRole['4-4-2'];
};

const getSmartPositions = (positionType: string, count: number, xBase: string, side: 'home' | 'away'): PlayerPosition[] => {
  const color = side === 'home' ? 'blue-600' : 'red-600';
  const positions: PlayerPosition[] = [];
  
  if (count === 1) {
    positions.push({ x: xBase, y: '50%', color });
  } else if (count === 2) {
    positions.push({ x: xBase, y: '33%', color });
    positions.push({ x: xBase, y: '67%', color });
  } else if (count === 3) {
    positions.push({ x: xBase, y: '25%', color });
    positions.push({ x: xBase, y: '50%', color });
    positions.push({ x: xBase, y: '75%', color });
  } else if (count === 4) {
    positions.push({ x: xBase, y: '15%', color });
    positions.push({ x: xBase, y: '38%', color });
    positions.push({ x: xBase, y: '62%', color });
    positions.push({ x: xBase, y: '85%', color });
  } else if (count === 5) {
    positions.push({ x: xBase, y: '12%', color });
    positions.push({ x: xBase, y: '30%', color });
    positions.push({ x: xBase, y: '50%', color });
    positions.push({ x: xBase, y: '70%', color });
    positions.push({ x: xBase, y: '88%', color });
  }
  
  return positions;
};

const getHalfPitchPositions = (positionType: string, count: number, xBase: number, side: 'home' | 'away'): PlayerPosition[] => {
  const color = side === 'home' ? 'blue-600' : 'red-600';
  const positions: PlayerPosition[] = [];
  
  if (count === 0) {
    return positions;
  } else if (count === 1) {
    positions.push({ x: `${xBase}%`, y: '50%', color });
  } else if (count === 2) {
    positions.push({ x: `${xBase}%`, y: '35%', color });
    positions.push({ x: `${xBase}%`, y: '65%', color });
  } else if (count === 3) {
    positions.push({ x: `${xBase}%`, y: '25%', color });
    positions.push({ x: `${xBase}%`, y: '50%', color });
    positions.push({ x: `${xBase}%`, y: '75%', color });
  } else if (count === 4) {
    positions.push({ x: `${xBase}%`, y: '18%', color });
    positions.push({ x: `${xBase}%`, y: '40%', color });
    positions.push({ x: `${xBase}%`, y: '60%', color });
    positions.push({ x: `${xBase}%`, y: '82%', color });
  } else if (count === 5) {
    positions.push({ x: `${xBase}%`, y: '15%', color });
    positions.push({ x: `${xBase}%`, y: '32%', color });
    positions.push({ x: `${xBase}%`, y: '50%', color });
    positions.push({ x: `${xBase}%`, y: '68%', color });
    positions.push({ x: `${xBase}%`, y: '85%', color });
  } else if (count === 6) {
    positions.push({ x: `${xBase}%`, y: '12%', color });
    positions.push({ x: `${xBase}%`, y: '28%', color });
    positions.push({ x: `${xBase}%`, y: '42%', color });
    positions.push({ x: `${xBase}%`, y: '58%', color });
    positions.push({ x: `${xBase}%`, y: '72%', color });
    positions.push({ x: `${xBase}%`, y: '88%', color });
  } else if (count === 7) {
    positions.push({ x: `${xBase}%`, y: '10%', color });
    positions.push({ x: `${xBase}%`, y: '23%', color });
    positions.push({ x: `${xBase}%`, y: '37%', color });
    positions.push({ x: `${xBase}%`, y: '50%', color });
    positions.push({ x: `${xBase}%`, y: '63%', color });
    positions.push({ x: `${xBase}%`, y: '77%', color });
    positions.push({ x: `${xBase}%`, y: '90%', color });
  } else {
    for (let i = 0; i < count; i++) {
      const y = 10 + (80 / Math.max(count - 1, 1)) * i;
      positions.push({ x: `${xBase}%`, y: `${y}%`, color });
    }
  }
  
  return positions;
};

const calculateSmartPositions = (starters: Array<{name: string; id?: string; position?: string}>, side: 'home' | 'away', formation?: string): Record<string, PlayerPosition> => {
  const positionGroups: Record<string, Array<{name: string; id?: string; position?: string}>> = {
    GK: [],
    DEF: [],
    MID: [],
    ATT: []
  };
  
  const seen = new Set();
  const uniqueStarters = starters.filter(p => {
    const id = p.id || p.name;
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  // Group players by position
  uniqueStarters.forEach(p => {
    const pos = (p.position || '').toUpperCase().trim();
    if (pos.includes('GK') || pos === 'BR' || pos === 'BRAMKARZ' || pos === 'B') {
      positionGroups.GK.push(p);
    } else if (pos.includes('DEF') || pos.includes('CB') || pos.includes('LB') || pos.includes('RB') || pos === 'ŚO' || pos === 'LO' || pos === 'PO' || pos === 'LWB' || pos === 'RWB' || pos === 'O') {
      positionGroups.DEF.push(p);
    } else if (pos.includes('MID') || pos.includes('CM') || pos.includes('CDM') || pos.includes('CAM') || pos.includes('LM') || pos.includes('RM') || pos === 'ŚP' || pos === 'DP' || pos === 'PP' || pos === 'LP' || pos === 'P') {
      positionGroups.MID.push(p);
    } else {
      positionGroups.ATT.push(p);
    }
  });
  
  // X positions for 4-3-3
  const xPositions: Record<string, number> = side === 'home' ? {
    GK: 8,
    DEF: 20,
    MID: 34,
    ATT: 45
  } : {
    GK: 92,
    DEF: 80,
    MID: 66,
    ATT: 55
  };
  
  // Helper for centered Y positions (fixed for 4-3-3 layout)
  const getYPositions = (posType: string, count: number): string[] => {
    if (posType === 'GK') return ['50%'];
    
    const getCentered = (c: number) => {
      if (c === 1) return ['50%'];
      if (c === 2) return ['30%', '70%'];
      if (c === 3) return ['20%', '50%', '80%'];
      if (c === 4) return ['15%', '38%', '62%', '85%'];
      return Array.from({length: c}, (_, i) => `${10 + (i * (80/(c-1)))}%`);
    };

    return getCentered(count);
  };

  const result: Record<string, PlayerPosition> = {};
  const color = side === 'home' ? 'blue-600' : 'red-600';
  
  Object.entries(positionGroups).forEach(([posType, players]) => {
    if (players.length === 0) return;
    
    const xBase = xPositions[posType];
    const yCoords = getYPositions(posType, players.length);
    
    players.forEach((player, idx) => {
      if (yCoords[idx]) {
        result[player.name] = {
          x: `${xBase}%`,
          y: yCoords[idx],
          color
        };
      } else {
        // Fallback for extra players in same line
        result[player.name] = {
          x: `${xBase}%`,
          y: `${10 + (idx * 10)}%`,
          color
        };
      }
    });
  });
  
  return result;
};

const GoalOverlay = ({ isVisible, team, player, logo, side }: { isVisible: boolean, team: string, player: string, logo?: string, side: 'home' | 'away' }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden pointer-events-none">
      <div className={`absolute inset-0 animate-goal-bg-flash backdrop-blur-sm ${side === 'home' ? 'bg-blue-600/30' : 'bg-red-600/30'}`}></div>
      
      <div className="relative flex flex-col items-center justify-center text-center px-4">
        <div className={`h-1 mb-8 rounded-full animate-goal-bar ${side === 'home' ? 'bg-blue-400 shadow-[0_0_20px_rgba(96,165,250,1)]' : 'bg-red-400 shadow-[0_0_20px_rgba(248,113,113,1)]'}`}></div>

        {logo && (
          <div className="mb-10 animate-goal-logo">
            <div className="relative">
              <div className={`absolute -inset-8 rounded-full blur-3xl ${side === 'home' ? 'bg-blue-500/40' : 'bg-red-500/40'}`}></div>
              <Image 
                src={logo} 
                alt={team} 
                width={220} 
                height={220} 
                className="object-contain relative z-10 w-40 h-40 md:w-56 md:h-56 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              />
            </div>
          </div>
        )}

        <div className="relative animate-goal-text">
          <h1 className="text-[80px] md:text-[180px] font-[1000] uppercase italic tracking-tighter leading-none text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.5)]">
            {side === 'home' ? 'GOOOOL!' : 'BRAMKA!'}
          </h1>
          
          <div className="mt-4 flex flex-col items-center">
            <span className={`text-2xl md:text-5xl font-black uppercase tracking-[0.2em] mb-2 ${side === 'home' ? 'text-blue-300' : 'text-red-300'}`}>
              {team}
            </span>
            <div className="flex items-center gap-4">
              <div className={`h-px w-12 md:w-24 ${side === 'home' ? 'bg-blue-400/50' : 'bg-red-400/50'}`}></div>
              <span className="text-white/80 text-xl md:text-3xl font-bold uppercase tracking-widest">{player}</span>
              <div className={`h-px w-12 md:w-24 ${side === 'home' ? 'bg-blue-400/50' : 'bg-red-400/50'}`}></div>
            </div>
          </div>
        </div>

        <div className={`h-1 mt-12 rounded-full animate-goal-bar ${side === 'home' ? 'bg-blue-400 shadow-[0_0_20px_rgba(96,165,250,1)]' : 'bg-red-400 shadow-[0_0_20px_rgba(248,113,113,1)]'}`}></div>
      </div>
    </div>
  );
};

export default function MatchDetail() {
  const params = useParams();
  const id = params.id as string;
  
  const match = findMatchById(id);
  
  const [activeTab, setActiveTab] = useState<'na-żywo' | 'relacja' | 'składy' | 'statystyki'>('relacja');
  const [apiData, setApiData] = useState<MatchApiData | null>(null);
  const [tableData, setTableData] = useState<any>(null);
  const [preMatchInfo, setPreMatchInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(!!match);
  const hasAutoSwitched = useRef(false);

  const allTeams = [...teams, ...extraTeams];

  const getHomeTeam = () => {
    if (match?.homeTeam) return match.homeTeam;
    if (apiData?.match) {
      const apiTeamA = apiData?.match?.teamA;
      const found = allTeams.find(t => 
        normalizeTeamName(t.name) === normalizeTeamName(apiTeamA) || 
        normalizeTeamName(t.shortName) === normalizeTeamName(apiTeamA) ||
        normalizeTeamName(t.id) === normalizeTeamName(apiTeamA)
      );
      if (found) return found;
      return { name: apiData?.match?.teamA, shortName: apiData?.match?.teamA, logo: 'https://i.ibb.co/7d4R0vZH/obraz-2026-02-04-222253347-removebg-preview-1.png', id: '' };
    }
    if (preMatchInfo) {
      const teamA = preMatchInfo.teamA || preMatchInfo.homeTeam || preMatchInfo.home;
      const teamAName = typeof teamA === 'string' ? teamA : (teamA?.name || teamA?.shortName);
      const found = allTeams.find(t => 
        normalizeTeamName(t.name) === normalizeTeamName(teamAName) || 
        normalizeTeamName(t.shortName) === normalizeTeamName(teamAName) ||
        normalizeTeamName(t.id) === normalizeTeamName(teamAName)
      );
      if (found) return found;
      return { name: teamAName, shortName: teamAName, logo: 'https://i.ibb.co/7d4R0vZH/obraz-2026-02-04-222253347-removebg-preview-1.png', id: '' };
    }
    return { name: 'TBD', shortName: 'TBD', logo: 'https://i.ibb.co/7d4R0vZH/obraz-2026-02-04-222253347-removebg-preview-1.png', id: '' };
  };

  const getAwayTeam = () => {
    if (match?.awayTeam) return match.awayTeam;
    if (apiData?.match) {
      const apiTeamB = apiData?.match?.teamB;
      const found = allTeams.find(t => 
        normalizeTeamName(t.name) === normalizeTeamName(apiTeamB) || 
        normalizeTeamName(t.shortName) === normalizeTeamName(apiTeamB) ||
        normalizeTeamName(t.id) === normalizeTeamName(apiTeamB)
      );
      if (found) return found;
      return { name: apiData?.match?.teamB, shortName: apiData?.match?.teamB, logo: 'https://i.ibb.co/7d4R0vZH/obraz-2026-02-04-222253347-removebg-preview-1.png', id: '' };
    }
    if (preMatchInfo) {
      const teamB = preMatchInfo.teamB || preMatchInfo.awayTeam || preMatchInfo.away;
      const teamBName = typeof teamB === 'string' ? teamB : (teamB?.name || teamB?.shortName);
      const found = allTeams.find(t => 
        normalizeTeamName(t.name) === normalizeTeamName(teamBName) || 
        normalizeTeamName(t.shortName) === normalizeTeamName(teamBName) ||
        normalizeTeamName(t.id) === normalizeTeamName(teamBName)
      );
      if (found) return found;
      return { name: teamBName, shortName: teamBName, logo: 'https://i.ibb.co/7d4R0vZH/obraz-2026-02-04-222253347-removebg-preview-1.png', id: '' };
    }
    return { name: 'TBD', shortName: 'TBD', logo: 'https://i.ibb.co/7d4R0vZH/obraz-2026-02-04-222253347-removebg-preview-1.png', id: '' };
  };

  const homeTeam = getHomeTeam();
  const awayTeam = getAwayTeam();

  const homeStanding = standings.find(s => s.team?.id === homeTeam.id);
  const awayStanding = standings.find(s => s.team?.id === awayTeam.id);

  const getTeamFromTable = (teamName: string) => {
    if (!tableData) return null;
    const all = [...(tableData.grupaa || []), ...(tableData.grupab || [])];
    return all.find(t => 
      normalizeTeamName(t.team) === normalizeTeamName(teamName)
    );
  };

  const homeTableTeam = getTeamFromTable(homeTeam.name);
  const awayTableTeam = getTeamFromTable(awayTeam.name);

  const homePosition = homeTableTeam?.position || homeTableTeam?.rank || homeStanding?.position || '-';
  const awayPosition = awayTableTeam?.position || awayTableTeam?.rank || awayStanding?.position || '-';
  const homePoints = homeTableTeam?.points || homeStanding?.points || 0;
  const awayPoints = awayTableTeam?.points || awayStanding?.points || 0;

  const isHomeTeam = useCallback((event: any) => {
    if (!event || !event.team) return false;
    const teamStr = event.team.toString().trim().toLowerCase();
    const hName = homeTeam.name.toLowerCase().trim();
    const hShort = homeTeam.shortName.toLowerCase().trim();
    const apiTeamA = apiData?.match?.teamA?.toLowerCase().trim();

    return teamStr === 'home' ||
           teamStr === 'gospodarz' ||
           teamStr === 'team a' ||
           teamStr === 'teama' ||
           teamStr === apiTeamA ||
           teamStr === hName ||
           teamStr === hShort ||
           hName.includes(teamStr) ||
           teamStr.includes(hName) ||
           (homeTeam.id && teamStr === homeTeam.id.toLowerCase());
  }, [homeTeam.name, homeTeam.shortName, homeTeam.id, apiData?.match?.teamA]);

  const isAwayTeam = useCallback((event: any) => {
    if (!event || !event.team) return false;
    const teamStr = event.team.toString().trim().toLowerCase();
    const aName = awayTeam.name.toLowerCase().trim();
    const aShort = awayTeam.shortName.toLowerCase().trim();
    const apiTeamB = apiData?.match?.teamB?.toLowerCase().trim();

    return teamStr === 'away' ||
           teamStr === 'gość' ||
           teamStr === 'team b' ||
           teamStr === 'teamb' ||
           teamStr === apiTeamB ||
           teamStr === aName ||
           teamStr === aShort ||
           aName.includes(teamStr) ||
           teamStr.includes(aName) ||
           (awayTeam.id && teamStr === awayTeam.id.toLowerCase());
  }, [awayTeam.name, awayTeam.shortName, awayTeam.id, apiData?.match?.teamB]);

  const calculatedScore = apiData?.events?.goals ? apiData?.events.goals.reduce((acc, goal) => {
    if (isHomeTeam(goal)) acc.scoreA++;
    else if (isAwayTeam(goal)) acc.scoreB++;
    return acc;
  }, { scoreA: 0, scoreB: 0 }) : null;

  // Check if match is finished based on localStorage
  const [isMatchFinished, setIsMatchFinished] = useState(false);
  const [isMatchActive, setIsMatchActive] = useState(false);
  const [finishedMatchData, setFinishedMatchData] = useState<any>(null);

  useEffect(() => {
    // Load finished matches from localStorage
    const loadFinished = () => {
      const stored = localStorage.getItem('finishedMatches');
      if (stored) {
        const finished = JSON.parse(stored);
        setFinishedMatches(finished);
        const status = apiData?.match?.status?.toLowerCase();
        setIsMatchFinished(finished[id] || match?.status === 'finished' || status === 'finished' || status === 'played' || status === 'ft' || false);
        setIsMatchActive(apiData?.match?.isActive || status === 'active' || status === 'live' || false);

        // Load match result data for finished matches
        if (finished[id] || match?.status === 'finished') {
          const matchStats = localStorage.getItem('matchStats');
          if (matchStats) {
            const stats = JSON.parse(matchStats);
            setFinishedMatchData(stats[id] || null);
          }
        }
      } else {
        setIsMatchFinished(false);
        setIsMatchActive(false);
      }
    };
    loadFinished();

    const fetchMatchData = async (isInitial = false) => {
      if (isInitial) setLoading(true);
      setError(null);
      try {
        let loaded = false;

        // Parallel fetch for initial data to speed up
        const [tournamentRes, scheduleRes, matchesListRes, tableRes] = await Promise.all([
          fetch(`${REPLIT_API_BASE_URL}/api/tournament/1.json`, { headers: { 'Accept': 'application/json' }, cache: 'no-store' }).catch(() => null),
          fetch(API_ENDPOINTS.SCHEDULE, { headers: { 'Accept': 'application/json' }, cache: 'no-store' }).catch(() => null),
          fetch(`${REPLIT_API_BASE_URL}/api/matches`, { headers: { 'Accept': 'application/json' }, cache: 'no-store' }).catch(() => null),
          fetch(`${REPLIT_API_BASE_URL}/api/tournament/1/table.json`, { headers: { 'Accept': 'application/json' }, cache: 'no-store' }).catch(() => null)
        ]);

        if (tableRes && tableRes.ok) {
          const tableData = await tableRes.json();
          setTableData(tableData);
        }

        if (matchesListRes && matchesListRes.ok) {
          const list = await matchesListRes.json();
          const found = (Array.isArray(list) ? list : []).find((m: any) => m.uuid === id || m.id?.toString() === id);
          if (found) {
            setPreMatchInfo((prev: any) => ({
              ...prev,
              ...found,
              homeScore: found.scoreA,
              awayScore: found.scoreB
            }));
          }
        }

        if (tournamentRes && tournamentRes.ok) {
          const data = await tournamentRes.json();
          const fixtures = data.fixtures || [];
          
          // Prioritize matchUuid for precise matching
          let found = fixtures.find((m: any) => m.matchUuid === id || m.uuid === id);
          
          // Fallback to id only if no uuid match found
          if (!found && isNumeric(id)) {
            found = fixtures.find((m: any) => m.id?.toString() === id);
          }
          
          if (found) {
            setPreMatchInfo((prev: any) => ({
              ...(prev || {}),
              ...found,
              homeTeam: found.teamA?.name ? found.teamA : { name: found.teamA },
              awayTeam: found.teamB?.name ? found.teamB : { name: found.teamB },
              homeScore: found.scoreA,
              awayScore: found.scoreB,
              stadium: found.stadium || 'Ośrodek Treningowy PFF',
              category: 'MECZE TOWARZYSKIE'
            }));
          }
        }

        if (scheduleRes && scheduleRes.ok) {
          const data = await scheduleRes.json();
          const list = Array.isArray(data) ? data : (Array.isArray(data?.fixtures) ? data.fixtures : (Array.isArray(data?.matches) ? data.matches : []));
          
          // Prioritize matchUuid
          let found = list.find((m: any) => m.matchUuid === id || m.uuid === id);
          
          // Fallback to id only if no uuid match found
          if (!found && isNumeric(id)) {
            found = list.find((m: any) => m.id?.toString() === id);
          }
          
          if (found) {
            setPreMatchInfo((prev: any) => ({ ...prev, ...found }));
          }
        }

        // Try Replit details
        if (isUuid(id)) {
          try {
            const replitRes = await fetch(`${REPLIT_API_BASE_URL}/api/matches/${id}`, { headers: { 'Accept': 'application/json' }, cache: 'no-store' });
            if (replitRes.ok) {
              const replitData = await replitRes.json();
              setApiData(replitData);
              loaded = true;
            }
          } catch {}
        }

        // Local API / Firebase fallback
        if (!loaded) {
          try {
            const response = await fetch(`/api/matches/${id}`, { headers: { 'Accept': 'application/json' }, cache: 'no-store' });
            if (response.ok) {
              const data = await response.json();
              setApiData(data);
              loaded = true;
            }
          } catch {}
        }

        // Try players-history.json as a definitive score source for finished matches
        try {
          const historyRes = await fetch('https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/players-history.json', { cache: 'no-store' });
          if (historyRes.ok) {
            const historyData = await historyRes.json();
            if (historyData.players) {
              let historyMatch = null;
              for (const p of Object.values(historyData.players) as any[]) {
                const m = p.matches?.find((match: any) => match.matchUuid === id || match.id?.toString() === id);
                if (m) {
                  historyMatch = m;
                  break;
                }
              }

              if (historyMatch) {
                // If we found it in history, it means it's finished and we have scores
                const hScoreA = historyMatch.scoreA;
                const hScoreB = historyMatch.scoreB;

                setPreMatchInfo((prev: any) => ({
                  ...(prev || {}),
                  scoreA: hScoreA,
                  scoreB: hScoreB,
                  homeScore: hScoreA,
                  awayScore: hScoreB,
                  status: 'finished',
                  teamA: historyMatch.teamA,
                  teamB: historyMatch.teamB
                }));
                
                if (!loaded) {
                  setIsMatchFinished(true);
                }
              }
            }
          }
        } catch (e) {
          console.error('History score fetch failed:', e);
        }

        if (!loaded && !preMatchInfo && !match) {
          throw new Error('Nie udało się znaleźć danych meczu');
        }
        
        if (loaded || preMatchInfo || match) {
          setHasFetchedOnce(true);
        }
      } catch (err: any) {
        console.error('Error fetching match data:', err);
        if (isInitial) setError(err.message || 'Nie udało się pobrać danych meczu');
      } finally {
        if (isInitial) setLoading(false);
      }
    };

    fetchMatchData(true);
    const interval = setInterval(() => fetchMatchData(false), 5000);
    return () => clearInterval(interval);
  }, [id]); // Only re-run when ID changes

  useEffect(() => {
    if (preMatchInfo) {
      setHasFetchedOnce(true);
      const matchDate = new Date(preMatchInfo.date).getTime();
      const now = new Date().getTime();
      const isPast = matchDate < now - (2 * 60 * 60 * 1000); // More than 2 hours ago
      const status = preMatchInfo.status?.toLowerCase();
      const hasStatusFinished = status === 'finished' || status === 'ft' || status === 'played';
      
      const isActive = preMatchInfo.isActive || status === 'active' || status === 'live' || status === 'in_progress';
      if (isActive && !isMatchActive) {
        setIsMatchActive(true);
      }
      
      // If we have scores and it's not active, it's likely finished or has a result to show
      const hasScore = (preMatchInfo.scoreA !== undefined && preMatchInfo.scoreA !== null && (preMatchInfo.scoreA > 0 || (preMatchInfo.scoreB !== undefined && preMatchInfo.scoreB > 0)));
      
      if ((hasStatusFinished || isPast || (hasScore && isPast)) && !isMatchActive) {
        setIsMatchFinished(true);
      }
    }
  }, [preMatchInfo, isMatchActive]);

  useEffect(() => {
    if (apiData?.match) {
      const status = apiData?.match?.status?.toLowerCase();
      const isActive = apiData?.match?.isActive || status === 'active' || status === 'live' || status === 'in_progress';
      const isFinished = status === 'finished' || status === 'played' || status === 'ft';

      if (isActive) {
        setIsMatchActive(true);
      }
      
      if (isFinished) {
        setIsMatchFinished(true);
        setIsMatchActive(false);
      }
      
      // If we have a match object from API, we definitely have data
      setHasFetchedOnce(true);
    }
  }, [apiData]);

  useEffect(() => {
    if (isMatchFinished && !hasAutoSwitched.current) {
      setActiveTab('relacja');
      hasAutoSwitched.current = true;
    } else if (isMatchActive && !hasAutoSwitched.current) {
      setActiveTab('na-żywo');
      hasAutoSwitched.current = true;
    }
  }, [isMatchFinished, isMatchActive]);

  useEffect(() => {
    // Don't run if match is active/finished or if we already have preMatchInfo from ID matching
    const isPre = !isMatchActive && !isMatchFinished;
    if (!isPre || (preMatchInfo && (preMatchInfo.matchUuid === id || preMatchInfo.id?.toString() === id))) return;

    const fetchSchedule = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.SCHEDULE, { headers: { 'Accept': 'application/json' }, cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data) ? data : (Array.isArray(data?.fixtures) ? data.fixtures : (Array.isArray(data?.matches) ? data.matches : []));
        
        // Try to find by ID first
        let found = list.find((m: any) => m.matchUuid === id || m.id?.toString() === id);
        
        // Fallback to team names matching
        if (!found) {
          const n = (s: string) => normalizeTeamName(s);
          const homeKeys = [n(homeTeam.name), n(homeTeam.shortName), n(homeTeam.id)];
          const awayKeys = [n(awayTeam.name), n(awayTeam.shortName), n(awayTeam.id)];
          found = list.find((m: any) => {
            const ta = n(m.teamA || m.homeTeam || m.home || m.host || '');
            const tb = n(m.teamB || m.awayTeam || m.away || m.guest || '');
            const homeOk = homeKeys.some(t => t && (t === ta || ta.includes(t) || t.includes(ta)));
            const awayOk = awayKeys.some(t => t && (t === tb || tb.includes(t) || t.includes(tb)));
            return homeOk && awayOk;
          });
        }
        
        if (found) setPreMatchInfo(found);
      } catch {}
    };

    fetchSchedule();
  }, [isMatchActive, isMatchFinished, homeTeam, awayTeam, id, preMatchInfo]);

  const [finishedMatches, setFinishedMatches] = useState<Record<string, boolean>>({});
  const [showGoalAnimation, setShowGoalAnimation] = useState(false);
  const [goalInfo, setGoalInfo] = useState<{ team: string; player: string; logo?: string; side: 'home' | 'away' } | null>(null);
  const prevScoreRef = useRef({ scoreA: 0, scoreB: 0 });
  const isInitialLoad = useRef(true);
  const isPreMatch = !isMatchActive && !isMatchFinished;

  useEffect(() => {
    if (apiData && calculatedScore) {
      if (isInitialLoad.current) {
        prevScoreRef.current = calculatedScore;
        isInitialLoad.current = false;
        return;
      }

      const prev = prevScoreRef.current;
      const isHomeGoalScored = calculatedScore.scoreA > prev.scoreA;
      const isAwayGoalScored = calculatedScore.scoreB > prev.scoreB;

      if (isHomeGoalScored || isAwayGoalScored) {
        const isHome = isHomeGoalScored;
        const relevantTeamGoals = apiData?.events.goals.filter(g => isHome ? isHomeTeam(g) : isAwayTeam(g));
        const latestGoal = relevantTeamGoals[relevantTeamGoals.length - 1];
        
        setGoalInfo({
          team: isHome ? homeTeam.name : awayTeam.name,
          player: latestGoal?.player || 'Zawodnik',
          logo: isHome ? homeTeam.logo : awayTeam.logo,
          side: isHome ? 'home' : 'away'
        });
        setShowGoalAnimation(true);
        setTimeout(() => setShowGoalAnimation(false), 8000);
      }
      prevScoreRef.current = calculatedScore;
    }
  }, [apiData, calculatedScore, homeTeam, awayTeam, isHomeTeam, isAwayTeam]);

  if (loading && !hasFetchedOnce && !match) {
    return (
      <div className="flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 font-medium">Ładowanie danych meczu...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!match && !apiData && !preMatchInfo && !loading) {
    return (
      <div className="flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20 text-center">
          <div>
            <p className="text-gray-400 text-lg mb-4">{error || 'Mecz nie znaleziony'}</p>
            <Link href="/" className="text-blue-500 hover:text-blue-400 font-semibold">
              Powrót do strony głównej
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const parseMatchDate = (d: any) => {
    if (!d) return new Date();
    if (d instanceof Date) return d;
    if (typeof d === 'string' && d.includes('.')) {
      const parts = d.split(' ');
      const datePart = parts[0];
      const timePart = parts[1] || '00:00';
      const [day, month, year] = datePart.split('.').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);
      return new Date(year, month - 1, day, hours, minutes);
    }
    return new Date(d);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'DATA NIEZNANA';
    const date = parseMatchDate(dateString);
    if (isNaN(date.getTime())) return 'DATA NIEPRAWIDŁOWA';
    const days = ['NIEDZIELA', 'PONIEDZIAŁEK', 'WTOREK', 'ŚRODA', 'CZWARTEK', 'PIĄTEK', 'SOBOTA'];
    return `${days[date.getDay()]}, ${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '--:--';
    const date = parseMatchDate(dateString);
    if (isNaN(date.getTime())) return '--:--';
    return date.toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Build fallback events from finishedMatchData scorers when API has no events
  const buildEventsFromFinished = (scorers: any[]): MatchEvents => {
    const goals = (scorers || []).map((s: any) => ({
      minute: typeof s.minute === 'number' ? s.minute : (typeof s.minute === 'string' && /^\d+$/.test(s.minute) ? parseInt(s.minute, 10) : undefined as any),
      player: s.playerName,
      team: s.teamId === homeTeam.id ? 'home' : 'away',
      isPenalty: false,
      number: s.number
    }));
    return { goals, cards: [], substitutions: [] };
  };

  const eventsData: MatchEvents | null = apiData?.events
    ? apiData?.events
    : (finishedMatchData?.scorers ? buildEventsFromFinished(finishedMatchData.scorers) : null);

  const scoreA = apiData?.match 
    ? (Math.max(apiData?.match?.scoreA || 0, calculatedScore?.scoreA || 0, preMatchInfo?.scoreA || 0, preMatchInfo?.homeScore || 0))
    : (isMatchFinished && preMatchInfo?.scoreA !== undefined) 
      ? preMatchInfo.scoreA 
      : (Math.max(finishedMatchData?.homeScore || 0, preMatchInfo?.scoreA || 0, preMatchInfo?.homeScore || 0, match?.homeScore || 0));
  const scoreB = apiData?.match
    ? (Math.max(apiData?.match?.scoreB || 0, calculatedScore?.scoreB || 0, preMatchInfo?.scoreB || 0, preMatchInfo?.awayScore || 0))
    : (isMatchFinished && preMatchInfo?.scoreB !== undefined)
      ? preMatchInfo.scoreB
      : (Math.max(finishedMatchData?.awayScore || 0, preMatchInfo?.scoreB || 0, preMatchInfo?.awayScore || 0, match?.awayScore || 0));

  const hasScore = scoreA > 0 || scoreB > 0 || isMatchActive || isMatchFinished;

  return (
    <>
      <GoalOverlay 
        isVisible={showGoalAnimation}
        team={goalInfo?.team || ''}
        player={goalInfo?.player || ''}
        logo={goalInfo?.logo}
        side={goalInfo?.side || 'home'}
      />
      <Navbar />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes goal-shimmer {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
        .animate-pulse-live {
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-goal-shimmer {
          animation: goal-shimmer 3s ease-in-out infinite;
        }
        @keyframes goal-bg-flash {
          0% { opacity: 0; }
          10%, 90% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes goal-text-enter {
          0% { transform: scale(0.5) translateY(100px); opacity: 0; filter: blur(20px); }
          20% { transform: scale(1.2) translateY(-20px); opacity: 1; filter: blur(0px); }
          30% { transform: scale(1) translateY(0); }
          80% { transform: scale(1.05); opacity: 1; filter: blur(0px); }
          100% { transform: scale(1.5) translateY(-50px); opacity: 0; filter: blur(20px); }
        }
        @keyframes goal-logo-enter {
          0% { transform: scale(0) rotate(-45deg); opacity: 0; }
          25% { transform: scale(1.2) rotate(10deg); opacity: 1; }
          35% { transform: scale(1) rotate(0deg); }
          80% { transform: scale(1) rotate(0deg); opacity: 1; }
          100% { transform: scale(0.5); opacity: 0; }
        }
        @keyframes goal-bar-expand {
          0% { width: 0%; opacity: 0; }
          20% { width: 100%; opacity: 1; }
          80% { width: 100%; opacity: 1; }
          100% { width: 0%; opacity: 0; }
        }
        .animate-goal-bg-flash {
          animation: goal-bg-flash 8s forwards;
        }
        .animate-goal-text {
          animation: goal-text-enter 8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }
        .animate-goal-logo {
          animation: goal-logo-enter 8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }
        .animate-goal-bar {
          animation: goal-bar-expand 8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }
      `}</style>

      {(isMatchActive || isMatchFinished) ? (
        <div className="relative min-h-screen bg-transparent text-white">
          {/* Main Content */}
          
          <div className="relative z-10">
            <div className="container mx-auto px-4 py-12">
              <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="flex justify-center mb-12">
                  <div className="bg-[#0a101f]/60 backdrop-blur-xl border border-white/10 rounded-full px-10 py-4 flex items-center gap-4 shadow-2xl">
                    <div className="relative flex items-center justify-center">
                      {isMatchFinished ? (
                        <div className="w-3 h-3 rounded-full bg-green-500 z-10 shadow-[0_0_15px_rgba(34,197,94,0.5)]"></div>
                      ) : isMatchActive ? (
                        <div className="w-3 h-3 rounded-full bg-blue-500 z-10 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-white/30"></div>
                      )}
                    </div>
                    <span className="text-sm font-black uppercase tracking-[0.4em] text-white flex items-center gap-3">
                      {isMatchFinished ? (
                        <>
                          <span className="text-white/60">ZAKOŃCZONY</span>
                          <span className="w-px h-4 bg-white/20 mx-1"></span>
                          WYNIK KOŃCOWY
                        </>
                      ) : isMatchActive ? (
                        <>
                          <span className="text-white/60">TRWA</span>
                          <span className="w-px h-4 bg-white/20 mx-1"></span>
                          {apiData?.match?.timer || '00:00'} <span className="text-white/30 font-medium">|</span> {apiData?.match?.period || 'MECZ TRWA'}
                        </>
                      ) : (
                        <>
                          <span className="text-white/60">PRZED MECZEM</span>
                          <span className="w-px h-4 bg-white/20 mx-1"></span>
                          {preMatchInfo?.time ?? formatTime(preMatchInfo?.date ?? preMatchInfo?.dateTime ?? match?.date)} <span className="text-white/30 font-medium">|</span> {formatDate(preMatchInfo?.date ?? preMatchInfo?.dateTime ?? match?.date)}
                        </>
                      )}
                    </span>
                    {(match?.stadium || match?.category) && (
                      <div className="hidden md:flex items-center gap-3 ml-4 pl-4 border-l border-white/10">
                        {match.stadium && <span className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest">{match.stadium}</span>}
                        {match.stadium && match.category && <span className="w-1 h-1 rounded-full bg-white/20"></span>}
                        {match.category && <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{match.category}</span>}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 md:gap-16 mb-20 relative">
                  {/* Home Team */}
                  <div className="flex flex-col items-center gap-6 w-[35%] group">
                    <div className="relative">
                      {homeTeam.logo && (
                        <Image
                          src={homeTeam.logo}
                          alt={homeTeam.name}
                          width={200}
                          height={200}
                          className="object-contain relative z-10 w-28 h-28 md:w-52 md:h-52 drop-shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-transform duration-500 group-hover:scale-110"
                        />
                      )}
                    </div>
                    <h2 className="text-xl md:text-5xl font-black uppercase tracking-tighter text-center leading-none drop-shadow-2xl h-12 md:h-24 flex items-center justify-center">{homeTeam.name}</h2>
                  </div>

                  {/* Score Box */}
                  <div className="relative z-20 shrink-0">
                    <div className="bg-[#0a101f]/60 backdrop-blur-xl border border-white/10 rounded-[40px] px-8 md:px-16 py-8 md:py-12 flex flex-col items-center justify-center min-w-[160px] md:min-w-[340px] shadow-2xl relative overflow-hidden">
                      <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.5em] text-white/40 mb-4 relative z-10">{isMatchFinished ? 'WYNIK KOŃCOWY' : isMatchActive ? 'WYNIK NA ŻYWO' : 'ZAPLANOWANY'}</span>
                      <div className="text-6xl md:text-9xl font-black tracking-tighter flex items-center gap-4 md:gap-8 tabular-nums relative z-10">
                        {(!isMatchFinished && !isMatchActive) ? (
                          <span className="drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                            {preMatchInfo?.time || formatTime(preMatchInfo?.date || preMatchInfo?.dateTime || match?.date)}
                          </span>
                        ) : (
                          <>
                            <span className="drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">{scoreA}</span>
                            <span className="text-white/10">:</span>
                            <span className="drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">{scoreB}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className="flex flex-col items-center gap-6 w-[35%] group">
                    <div className="relative">
                      {awayTeam.logo && (
                        <Image
                          src={awayTeam.logo}
                          alt={awayTeam.name}
                          width={200}
                          height={200}
                          className="object-contain relative z-10 w-28 h-28 md:w-52 md:h-52 drop-shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-transform duration-500 group-hover:scale-110"
                        />
                      )}
                    </div>
                    <h2 className="text-xl md:text-5xl font-black uppercase tracking-tighter text-center leading-none drop-shadow-2xl h-12 md:h-24 flex items-center justify-center">{awayTeam.name}</h2>
                  </div>
                </div>

                {/* Score Summary (Goals) */}
                <div className="grid grid-cols-2 gap-12 md:gap-32 mb-20 max-w-5xl mx-auto">
                  <div className="flex flex-col gap-3 items-end">
                    {(finishedMatchData?.scorers || apiData?.events?.goals) && (finishedMatchData?.scorers ? finishedMatchData.scorers.filter((s: any) => s.teamId === homeTeam.id) : apiData?.events?.goals?.filter(g => isHomeTeam(g)) || []).map((goal: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-4 bg-transparent hover:bg-white/5 px-5 py-3 rounded-2xl border border-white/10 transition-all group cursor-default">
                        <div className="flex flex-col items-end">
                          <span className="text-white text-sm font-black uppercase tracking-wide group-hover:text-blue-400 transition-colors">{goal.playerName || goal.player}</span>
                          <span className="text-white/20 text-[9px] font-black uppercase tracking-widest">GOL</span>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 font-black text-xs shadow-lg group-hover:scale-110 transition-transform">
                          {goal.minute != null ? `${goal.minute}'` : ''}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 items-start">
                    {(finishedMatchData?.scorers || apiData?.events?.goals) && (finishedMatchData?.scorers ? finishedMatchData.scorers.filter((s: any) => s.teamId === awayTeam.id) : apiData?.events?.goals?.filter(g => isAwayTeam(g)) || []).map((goal: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-4 bg-transparent hover:bg-white/5 px-5 py-3 rounded-2xl border border-white/10 transition-all group cursor-default">
                        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-red-400 font-black text-xs shadow-lg group-hover:scale-110 transition-transform">
                          {goal.minute != null ? `${goal.minute}'` : ''}
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="text-white text-sm font-black uppercase tracking-wide group-hover:text-red-400 transition-colors">{goal.playerName || goal.player}</span>
                          <span className="text-white/20 text-[9px] font-black uppercase tracking-widest">GOL</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12 bg-[#0a101f]/60 backdrop-blur-xl p-2 rounded-[24px] w-fit mx-auto border border-white/10 shadow-2xl">
                  {[
                    { id: 'relacja', label: 'RELACJA' },
                    { id: 'składy', label: 'SKŁADY' },
                    { id: 'statystyki', label: 'STATYSTYKI' }
                  ].map((tab) => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${
                        activeTab === tab.id 
                          ? 'bg-blue-600/40 text-white border border-blue-400/50 shadow-[0_0_30px_rgba(37,99,235,0.3)] scale-105' 
                          : 'text-white/40 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats Comparison Card */}
              <div className="max-w-4xl mx-auto mt-12">
                <div className="bg-[#0a101f]/60 backdrop-blur-xl rounded-[40px] overflow-hidden shadow-2xl border border-white/10 relative">
                  <div className="relative py-14 px-8">
                    <div className="absolute left-12 top-1/2 -translate-y-1/2 opacity-10 hidden md:block">
                      {homeTeam.logo && (
                        <Image
                          src={homeTeam.logo}
                          alt={homeTeam.name}
                          width={140}
                          height={140}
                          className="drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                        />
                      )}
                    </div>
                    
                    <div className="absolute right-12 top-1/2 -translate-y-1/2 opacity-10 hidden md:block">
                      {awayTeam.logo && (
                        <Image
                          src={awayTeam.logo}
                          alt={awayTeam.name}
                          width={140}
                          height={140}
                          className="drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                        />
                      )}
                    </div>

                    <h2 className="text-white text-xl font-black text-center mb-16 tracking-[0.5em] uppercase opacity-30">STATYSTYKI</h2>
                    
                    <div className="space-y-16 max-w-2xl mx-auto relative z-10">
                      <div className="grid grid-cols-3 gap-8 items-center">
                        <div className="text-blue-400 text-7xl font-black text-center tabular-nums transition-all hover:scale-110 drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">{homePosition}</div>
                        <div className="text-white/40 font-black text-[10px] tracking-[0.4em] text-center uppercase leading-tight">POZYCJA</div>
                        <div className="text-blue-400 text-7xl font-black text-center tabular-nums transition-all hover:scale-110 drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">{awayPosition}</div>
                      </div>

                      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                      <div className="grid grid-cols-3 gap-8 items-center">
                        <div className="text-white text-7xl font-black text-center tabular-nums transition-all hover:scale-110 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">{homePoints}</div>
                        <div className="text-white/40 font-black text-[10px] tracking-[0.4em] text-center uppercase leading-tight">PUNKTY</div>
                        <div className="text-white text-7xl font-black text-center tabular-nums transition-all hover:scale-110 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">{awayPoints}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

                {activeTab === 'relacja' && (
                  <div className="max-w-5xl mx-auto mt-16">
                    <div className="bg-[#0a101f]/60 backdrop-blur-xl rounded-[30px] p-8 border border-white/10 shadow-2xl">
                      <h3 className="text-blue-400 text-2xl font-black text-center mb-10 tracking-[0.2em] uppercase">RELACJA MECZOWA</h3>
                      {eventsData && (eventsData.goals.length > 0 || eventsData.cards.length > 0 || eventsData.substitutions.length > 0) ? (
                        <div className="space-y-10">
                  {(() => {
                    const sortedGoals = [...eventsData.goals].sort((a, b) => a.minute - b.minute);
                    const goalScores = new Map<any, {scoreA: number, scoreB: number}>();
                    let currentScoreA = 0;
                    let currentScoreB = 0;
                    
                    sortedGoals.forEach((goal) => {
                      if (isHomeTeam(goal)) {
                        currentScoreA++;
                      } else if (isAwayTeam(goal)) {
                        currentScoreB++;
                      }
                      
                      goalScores.set(goal, {
                        scoreA: currentScoreA,
                        scoreB: currentScoreB
                      });
                    });
                    
                    return [
                      ...eventsData.goals.map((e) => ({...e, type: 'goal' as const, _id: `goal-${Math.random()}`, original: e})),
                      ...eventsData.cards.map((e, i) => ({...e, type: e.type, _id: `card-${i}`})),
                      ...eventsData.substitutions.map((e, i) => ({...e, type: 'substitution' as const, _id: `sub-${i}`})),
                      ...(eventsData.cancelledGoals || []).map((e, i) => ({...e, type: 'goal_cancelled' as const, _id: `cancelled-${i}`})),
                      ...(apiData?.timeline || []).filter(e => e.type === 'goal_cancelled').map((e, i) => ({...e, type: 'goal_cancelled' as const, _id: `timeline-cancelled-${i}`}))
                    ].sort((a, b) => b.minute - a.minute).map((event: any) => {
                      const isHomeEvent = isHomeTeam(event);
                      const isAwayEvent = isAwayTeam(event);
                      
                      let scoringTeam = isHomeEvent ? homeTeam : awayTeam;
                      
                      // Fallback: if it's neither home nor away according to isHome/isAway, 
                      // but event.team matches away better, or if it's just not matching at all,
                      // try to find the team in our global teams list.
                      if (!isHomeEvent && !isAwayEvent && event.team) {
                        const tName = event.team.toString().toLowerCase().trim();
                        const foundTeam = teams.find(t => 
                          t.name.toLowerCase().includes(tName) || 
                          t.shortName.toLowerCase() === tName ||
                          t.id.toLowerCase() === tName
                        );
                        if (foundTeam) {
                          scoringTeam = foundTeam;
                        }
                      }
                      
                      const teamLogo = scoringTeam.logo;
                      
                      if (event.type === 'goal') {
                        const score = goalScores.get(event.original) || {scoreA: currentScoreA, scoreB: currentScoreB};
                        
                        return (
                          <div key={event._id} className="relative overflow-hidden rounded-[32px] bg-transparent border border-white/10 shadow-2xl group">
                            
                            {/* Goal Shimmer Animation */}
                            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-1/2 animate-goal-shimmer"></div>
                            </div>

                            <div className={`relative z-10 flex items-center gap-6 p-6 md:p-8 ${isHomeEvent ? 'flex-row' : 'flex-row-reverse'}`}>
                              {/* Minute & Avatar */}
                              <div className="relative shrink-0 flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xl text-white/60 shadow-lg relative z-20">
                                  {event.minute != null ? `${event.minute}'` : ''}
                                </div>
                                <Link href={`/gracz/${encodeURIComponent(event.player)}`} className="relative group/avatar">
                                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-white/10 shadow-2xl bg-white/5 relative z-10 transition-transform group-hover/avatar:scale-105">
                                    <RobloxAvatar username={event.player} className="w-full h-full object-cover scale-110" />
                                  </div>
                                </Link>
                              </div>

                              {/* Info */}
                              <div className={`flex-1 flex flex-col gap-2 ${isHomeEvent ? 'items-start' : 'items-end'}`}>
                                <div className={`flex items-center gap-3 ${isHomeEvent ? 'flex-row' : 'flex-row-reverse'}`}>
                                  <div className="px-3 py-1 border border-white/10 bg-white/5 rounded-lg">
                                    <span className="text-white/60 font-black text-[10px] uppercase tracking-widest">GOL</span>
                                  </div>
                                  <div className={`flex items-center gap-2 ${isHomeEvent ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <img src={teamLogo} alt="" className="w-5 h-5 object-contain opacity-60" />
                                    <span className="text-white/40 font-black text-[10px] uppercase tracking-[0.2em]">{scoringTeam.shortName || scoringTeam.name}</span>
                                  </div>
                                </div>
                                <h4 className={`text-white text-2xl md:text-5xl font-black tracking-tighter uppercase leading-tight group-hover:text-white transition-colors drop-shadow-2xl ${isHomeEvent ? 'text-left' : 'text-right'}`}>
                                  <Link href={`/gracz/${encodeURIComponent(event.player)}`}>
                                    {event.player}
                                  </Link>
                                </h4>
                              </div>

                              {/* Score Display */}
                              <div className="shrink-0 flex flex-col items-center gap-2">
                                <div className="bg-transparent border border-white/10 px-6 py-4 rounded-3xl shadow-2xl flex flex-col items-center justify-center min-w-[120px]">
                                  <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">WYNIK</span>
                                  <div className="text-3xl md:text-4xl font-black text-white tracking-tighter tabular-nums drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                                    <span className="text-white">{score.scoreA}</span>
                                    <span className="text-white/20 mx-1">:</span>
                                    <span className="text-white">{score.scoreB}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (event.type === 'goal_cancelled') {
                        return (
                          <div key={event._id} className="relative overflow-hidden rounded-[32px] bg-transparent border border-white/10 shadow-2xl group grayscale-[0.3]">
                            <div className={`relative z-10 flex items-center gap-6 p-6 md:p-8 ${isHomeEvent ? 'flex-row' : 'flex-row-reverse'}`}>
                              <div className="relative shrink-0 flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xl text-white/40 shadow-lg relative z-20">
                                  {event.minute != null ? `${event.minute}'` : ''}
                                </div>
                                <div className="relative opacity-40">
                                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-white/10 bg-white/5">
                                    <RobloxAvatar username={event.player || ""} className="w-full h-full object-cover grayscale" />
                                  </div>
                                  <div className="absolute inset-0 flex items-center justify-center text-4xl">❌</div>
                                </div>
                              </div>

                              <div className={`flex-1 flex flex-col gap-2 ${isHomeEvent ? 'items-start' : 'items-end'}`}>
                                <div className={`flex items-center gap-3 ${isHomeEvent ? 'flex-row' : 'flex-row-reverse'}`}>
                                  <div className="px-3 py-1 border border-white/10 bg-white/5 rounded-lg">
                                    <span className="text-white/40 font-black text-[10px] uppercase tracking-widest">BRAMKA ANULOWANA</span>
                                  </div>
                                  <span className="text-white/20 font-black text-[10px] uppercase tracking-[0.2em]">VAR DECISION</span>
                                </div>
                                <h4 className={`text-white/40 text-2xl md:text-5xl font-black tracking-tighter uppercase leading-tight line-through decoration-4 ${isHomeEvent ? 'text-left' : 'text-right'}`}>
                                  {event.player || "BRAMKA"}
                                </h4>
                              </div>
                            </div>
                          </div>
                        );
                      }

                    if (event.type === 'substitution') {
                      return (
                        <div key={event._id} className="relative overflow-hidden rounded-[32px] bg-transparent border border-white/10 p-6 md:p-8 flex items-center gap-6 transition-all hover:bg-white/[0.05] group">
                          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xl text-white/40 shadow-lg shrink-0">
                            {event.minute != null ? `${event.minute}'` : ''}
                          </div>
                          
                          <div className="flex items-center gap-4 flex-1">
                            <div className="relative group/avatar shrink-0">
                              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 shadow-xl bg-white/5 relative z-10">
                                <RobloxAvatar username={event.playerIn} className="w-full h-full object-cover" />
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-black flex items-center justify-center text-white text-[10px] z-20">↑</div>
                            </div>

                            <div className="flex-1 flex flex-col gap-1">
                              <div className="flex items-center gap-3">
                                <span className="text-white font-black uppercase text-xl tracking-tight group-hover:text-white transition-colors">{event.playerIn}</span>
                                <span className="text-green-400 font-black text-[8px] px-2 py-0.5 rounded border border-green-500/30 uppercase tracking-widest">WCHODZI</span>
                              </div>
                              <div className="flex items-center gap-3 opacity-30">
                                <span className="text-white font-bold text-sm">{event.playerOut}</span>
                                <span className="text-red-400 font-black text-[8px] px-2 py-0.5 rounded border border-red-500/30 uppercase tracking-widest">SCHODZI</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-3 border border-white/10 rounded-2xl shrink-0">
                            <img src={teamLogo} alt="" className="w-8 h-8 object-contain grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={event._id} className="relative overflow-hidden rounded-[32px] bg-transparent p-6 md:p-8 flex items-center gap-6 transition-all hover:bg-white/[0.05] group border border-white/10">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shrink-0 border border-white/10 bg-white/5 text-white/40">
                          {event.minute != null ? `${event.minute}'` : ''}
                        </div>
                        
                        <div className="flex items-center gap-4 flex-1">
                          <div className="relative group/avatar shrink-0">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 shadow-xl bg-white/5 relative z-10">
                              <RobloxAvatar username={event.player} className="w-full h-full object-cover" />
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-6 h-8 rounded border-2 border-black z-20 ${
                              event.type === 'yellow' ? 'bg-yellow-500' : 'bg-red-600'
                            }`}></div>
                          </div>

                          <div className="flex-1">
                            <h4 className="text-white font-black uppercase text-xl tracking-tight group-hover:text-white transition-colors mb-1">{event.player}</h4>
                            <span className={`text-[9px] font-black uppercase px-3 py-1 rounded border shadow-lg ${
                              event.type === 'yellow' 
                                ? 'bg-yellow-500 border-yellow-400 text-black' 
                                : 'bg-red-600 border-red-500 text-white'
                            }`}>
                              {event.type === 'yellow' ? 'ŻÓŁTA KARTKA' : 'CZERWONA KARTKA'}
                            </span>
                          </div>
                        </div>

                        <div className="p-3 border border-white/10 rounded-2xl shrink-0">
                          <img src={teamLogo} alt="" className="w-8 h-8 object-contain grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                        </div>
                      </div>
                    );
                  });
                })()}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-gray-500 italic">Oczekiwanie na wydarzenia meczowe...</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'składy' && (
                  <div className="max-w-[1600px] mx-auto mt-8 px-4">
                    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
                      
                      {/* Home Team Column */}
                      <div className="w-full lg:w-72 xl:w-80 shrink-0 space-y-6 order-2 lg:order-1">
                        <div className="bg-transparent rounded-[30px] p-6 border border-white/10 shadow-2xl">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
                              <img src={homeTeam.logo} alt="" className="w-8 h-8 object-contain opacity-60" />
                            </div>
                            <div>
                              <h4 className="text-white font-black uppercase text-lg tracking-tight leading-none">{homeTeam.name}</h4>
                              <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] mt-1">Formacja 4-3-3</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {apiData?.match?.lineupA ? (
                              <>
                                <div>
                                  <h5 className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em] mb-3 ml-1">WYJŚCIOWA JEDENASTKA</h5>
                                  <div className="space-y-2">
                                    {apiData?.match?.lineupA?.starters?.map((p, idx) => (
                                      <div key={idx} className="flex items-center gap-3 bg-[#0a101f]/40 backdrop-blur-md p-2.5 rounded-xl border border-white/10 hover:bg-white/10 transition-all group">
                                        <div className="w-7 h-7 rounded-full border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center shrink-0">
                                          <RobloxAvatar username={p.name} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="font-bold text-white/70 text-xs uppercase truncate group-hover:text-white transition-colors">{p.name}</span>
                                        {p.position && <span className="text-[8px] font-black text-white/10 ml-auto uppercase">{p.position}</span>}
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {apiData?.match?.lineupA?.bench && apiData?.match?.lineupA?.bench.length > 0 && (
                                  <div className="pt-4 border-t border-white/10">
                                    <h5 className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em] mb-3 ml-1">ŁAWKA REZERWOWYCH</h5>
                                    <div className="space-y-2">
                                      {apiData?.match?.lineupA?.bench.map((p, idx) => (
                                        <div key={idx} className="flex items-center gap-3 bg-[#0a101f]/20 backdrop-blur-md p-2 rounded-xl border border-white/5 hover:bg-white/5 transition-all group">
                                          <div className="w-6 h-6 rounded-full border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center shrink-0">
                                            <RobloxAvatar username={p.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100" />
                                          </div>
                                          <span className="font-medium text-white/40 text-[11px] uppercase truncate group-hover:text-white/70 transition-colors">{p.name}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="py-8 text-center bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-white/20 font-black text-[10px] uppercase tracking-widest">Składy niedostępne</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Pitch Column */}
                      <div className="w-full lg:flex-1 max-w-5xl order-1 lg:order-2">
                        <div className="bg-[#0a101f]/60 backdrop-blur-xl rounded-[30px] p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden h-full">
                          <h3 className="text-white/60 text-2xl font-black text-center mb-8 tracking-[0.2em] uppercase relative z-10">BOISKO</h3>
                          
                          <div className="relative aspect-[3/2] w-full rounded-xl overflow-hidden shadow-2xl border border-white/10">
                            <div className="absolute inset-0 bg-[#0a101f]/40">
                              {/* Field Markings */}
                              <div className="absolute inset-0 border-2 border-white/10"></div>
                              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-white/10"></div>
                              
                              {/* Center Circle */}
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/10 rounded-full flex items-center justify-center">
                                <img 
                                  src="https://i.ibb.co/tMkjssPP/LOGO-PFF.png" 
                                  alt="" 
                                  className="w-20 h-20 object-contain opacity-10 brightness-0 invert pointer-events-none" 
                                />
                              </div>
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                              
                              <div className="absolute top-1/2 left-3 -translate-y-1/2 w-16 h-44 border-2 border-white/20 border-l-0"></div>
                              <div className="absolute top-1/2 left-3 -translate-y-1/2 w-6 h-20 border-2 border-white/20 border-l-0"></div>
                              
                              <div className="absolute top-1/2 right-3 -translate-y-1/2 w-16 h-44 border-2 border-white/20 border-r-0"></div>
                              <div className="absolute top-1/2 right-3 -translate-y-1/2 w-6 h-20 border-2 border-white/20 border-r-0"></div>
                              
                              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/20 rounded-full"></div>
                              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/20 rounded-full"></div>
                              
                              <div className="absolute top-1/2 left-[11.5%] -translate-y-1/2 w-1.5 h-1.5 bg-white/20 rounded-full"></div>
                              <div className="absolute top-1/2 right-[11.5%] -translate-y-1/2 w-1.5 h-1.5 bg-white/20 rounded-full"></div>
                              
                              <svg className="absolute top-3 left-3 w-3 h-3" viewBox="0 0 10 10">
                                <path d="M 0 10 Q 0 0 10 0" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"/>
                              </svg>
                              <svg className="absolute top-3 right-3 w-3 h-3" viewBox="0 0 10 10">
                                <path d="M 10 10 Q 10 0 0 0" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"/>
                              </svg>
                              <svg className="absolute bottom-3 left-3 w-3 h-3" viewBox="0 0 10 10">
                                <path d="M 0 0 Q 0 10 10 10" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"/>
                              </svg>
                              <svg className="absolute bottom-3 right-3 w-3 h-3" viewBox="0 0 10 10">
                                <path d="M 10 0 Q 10 10 0 10" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"/>
                              </svg>
                            </div>
                            
                            <div className="absolute inset-0 z-10 p-4 md:p-8 flex items-center justify-center">
                              {apiData?.match?.lineupA && apiData?.match?.lineupB ? (
                                <div className="relative w-full h-full">
                                  {(() => {
                                    const homePositions = calculateSmartPositions(apiData?.match?.lineupA?.starters, 'home', apiData?.match?.lineupA?.formation);
                                    const awayPositions = calculateSmartPositions(apiData?.match?.lineupB?.starters, 'away', apiData?.match?.lineupB?.formation);
                                    
                                    return [
                                      ...apiData?.match?.lineupA?.starters.map(p => ({ ...p, team: 'home', pos: homePositions[p.name] })),
                                      ...apiData?.match?.lineupB?.starters.map(p => ({ ...p, team: 'away', pos: awayPositions[p.name] }))
                                    ].map((player, idx) => {
                                      if (!player.pos) return null;
                                      return (
                                        <div 
                                          key={idx} 
                                          className="absolute flex flex-col items-center group cursor-pointer"
                                          style={{ 
                                            left: player.pos.x, 
                                            top: player.pos.y,
                                            transform: 'translate(-50%, -50%)',
                                            zIndex: 20
                                          }}
                                        >
                                          <div className={`w-7 h-7 md:w-9 md:h-9 rounded-full border-2 border-white shadow-lg overflow-hidden transition-transform group-hover:scale-125 bg-gray-900`}>
                                            <RobloxAvatar username={player.name} className="w-full h-full object-cover" />
                                          </div>
                                          <div className="mt-1 text-[8px] md:text-[10px] text-white font-black bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap border border-white/10 uppercase tracking-tighter">
                                            {player.name.split(' ').pop()}
                                          </div>
                                        </div>
                                      );
                                    });
                                  })()}
                                </div>
                              ) : (
                                <div className="text-center bg-black/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
                                  <p className="text-white/40 font-black text-xs uppercase tracking-widest">Składy niedostępne</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Away Team Column */}
                      <div className="w-full lg:w-72 xl:w-80 shrink-0 space-y-6 order-3 lg:order-3">
                        <div className="bg-[#0a101f]/60 backdrop-blur-xl rounded-[30px] p-6 border border-white/10 shadow-2xl">
                          <div className="flex items-center gap-4 mb-6 lg:flex-row-reverse">
                            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center shadow-lg">
                              <img src={awayTeam.logo} alt="" className="w-8 h-8 object-contain" />
                            </div>
                            <div className="lg:text-right">
                              <h4 className="text-white font-black uppercase text-lg tracking-tight leading-none">{awayTeam.name}</h4>
                              <p className="text-red-400/60 text-[9px] font-black uppercase tracking-[0.2em] mt-1">Formacja 4-3-3</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {apiData?.match?.lineupB ? (
                              <>
                                <div>
                                  <h5 className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em] mb-3 lg:text-right mr-1">WYJŚCIOWA JEDENASTKA</h5>
                                  <div className="space-y-2">
                                    {apiData?.match?.lineupB?.starters?.map((p, idx) => (
                                      <div key={idx} className="flex items-center gap-3 bg-[#0a101f]/40 backdrop-blur-md p-2.5 rounded-xl border border-white/10 hover:bg-white/10 transition-all group flex-row-reverse">
                                        <div className="w-7 h-7 rounded-full border border-red-600/50 overflow-hidden bg-red-600/10 flex items-center justify-center shrink-0">
                                          <RobloxAvatar username={p.name} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="font-bold text-white/70 text-xs uppercase truncate group-hover:text-white transition-colors text-right">{p.name}</span>
                                        {p.position && <span className="text-[8px] font-black text-white/10 mr-auto uppercase">{p.position}</span>}
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {apiData?.match?.lineupB?.bench && apiData?.match?.lineupB?.bench.length > 0 && (
                                  <div className="pt-4 border-t border-white/5">
                                    <h5 className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em] mb-3 lg:text-right mr-1">ŁAWKA REZERWOWYCH</h5>
                                    <div className="space-y-2">
                                      {apiData?.match?.lineupB?.bench.map((p, idx) => (
                                        <div key={idx} className="flex items-center gap-3 bg-[#0a101f]/20 backdrop-blur-md p-2 rounded-xl border border-white/[0.02] hover:bg-white/5 transition-all group flex-row-reverse">
                                          <div className="w-6 h-6 rounded-full border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center shrink-0">
                                            <RobloxAvatar username={p.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100" />
                                          </div>
                                          <span className="font-medium text-white/40 text-[11px] uppercase truncate group-hover:text-white/70 transition-colors text-right">{p.name}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="py-8 text-center bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-white/20 font-black text-[10px] uppercase tracking-widest">Składy niedostępne</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {activeTab === 'statystyki' && (
                  <div className="max-w-5xl mx-auto mt-16">
                    <div className="bg-[#0a101f]/60 backdrop-blur-xl rounded-[30px] p-10 border border-white/10 shadow-2xl relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-30"></div>
                      <h3 className="text-blue-400 text-2xl font-black text-center mb-12 tracking-[0.2em] uppercase relative z-10">STATYSTYKI DRUŻYNOWE</h3>
                      {apiData?.match?.stats ? (
                        <div className="space-y-8 relative z-10">
                          <StatBar label="POSIADANIE PIŁKI" valA={apiData?.match?.stats?.possessionA} valB={apiData?.match?.stats?.possessionB} suffix="%" />
                          <StatBar label="STRZAŁY" valA={apiData?.match?.stats?.shotsA} valB={apiData?.match?.stats?.shotsB} />
                          <StatBar label="STRZAŁY CELNE" valA={apiData?.match?.stats?.onTargetA || 0} valB={apiData?.match?.stats?.onTargetB || 0} />
                          <StatBar label="RZUTY ROŻNE" valA={apiData?.match?.stats?.cornersA || 0} valB={apiData?.match?.stats?.cornersB || 0} />
                          <StatBar label="FAULE" valA={apiData?.match?.stats?.foulsA || 0} valB={apiData?.match?.stats?.foulsB || 0} />
                          <StatBar label="EXPECTED GOALS (xG)" valA={apiData?.match?.stats?.xgA || 0} valB={apiData?.match?.stats?.xgB || 0} />
                        </div>
                      ) : (
                        <div className="text-center py-12 relative z-10">
                          <p className="text-white/30 italic">
                            {isMatchFinished ? 'Statystyki niedostępne' : 'Statystyki zostaną zaktualizowane po rozpoczęciu spotkania'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
      ) : (
        <div className="min-h-screen bg-transparent text-white">
          {/* Main Background with Blue Glow */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px]"></div>
          </div>
          
          <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
            <div className="max-w-7xl mx-auto flex flex-col items-center">
              
              {/* Date Header Pill */}
              <div className="mb-8 md:mb-12 relative">
                <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full"></div>
                <div className="relative px-8 md:px-12 py-2 md:py-3 bg-[#0a101f]/60 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-3 md:gap-5 shadow-2xl ring-1 ring-white/10">
                  <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa]"></div>
                  <span className="text-white text-[10px] md:text-sm font-black uppercase tracking-[0.4em]">{formatDate(match?.date || preMatchInfo?.date)}</span>
                  <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa]"></div>
                </div>
              </div>

              {/* Match Card */}
              <div className="w-full bg-[#0a101f]/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] md:rounded-[4rem] p-6 md:p-12 relative shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent rounded-[2rem] md:rounded-[4rem]"></div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 relative z-10">
                  {/* Home Team */}
                  <div className="flex items-center gap-4 md:gap-6 lg:gap-10 flex-1 justify-center md:justify-end group w-full">
                    <div className="flex flex-col items-center md:items-end order-2 md:order-1">
                      <h2 className="text-white text-3xl md:text-5xl lg:text-6xl font-[1000] uppercase tracking-tighter leading-[0.8] md:leading-[0.85] text-center md:text-right transition-transform group-hover:scale-105">
                        {homeTeam.name.split(' ').map((word: string, i: number) => (
                          <div key={i} className="whitespace-nowrap">{word}</div>
                        ))}
                      </h2>
                      <span className="text-blue-400/60 text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] mt-3 md:mt-4">GOSPODARZ</span>
                    </div>

                    <div className="shrink-0 relative order-1 md:order-2">
                      <div className="absolute -inset-6 md:-inset-10 bg-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      {homeTeam.logo && (
                        <Image
                          src={homeTeam.logo}
                          alt={homeTeam.name}
                          width={180}
                          height={180}
                          className="w-20 h-20 md:w-32 lg:w-40 md:h-32 lg:h-40 object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.15)] relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                        />
                      )}
                    </div>
                  </div>

                  <div className="w-px h-32 md:h-40 bg-white/10 hidden md:block opacity-20 mx-2 lg:mx-4"></div>

                  {/* Center Box */}
                  <div className="flex flex-col items-center gap-6 px-2 md:px-4 order-first md:order-none w-full md:w-auto self-center">
                    <div className="bg-[#0a101f]/80 backdrop-blur-2xl px-8 md:px-10 py-8 md:py-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/10 flex flex-col items-center justify-center min-w-[240px] md:min-w-[280px] shadow-2xl relative group/box ring-1 ring-white/5">
                      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover/box:opacity-100 transition-opacity rounded-[2.5rem] md:rounded-[3.5rem]"></div>
                      
                      <div className="flex flex-col items-center relative z-10 text-center">
                        <div className="text-white font-[1000] text-6xl md:text-7xl lg:text-8xl tracking-tighter mb-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] leading-none">
                          {match?.time || preMatchInfo?.time || formatTime(match?.date || preMatchInfo?.date)}
                        </div>
                        {match?.stadium && (
                          <span className="text-[#00ccff] text-[10px] md:text-xs font-black uppercase tracking-[0.2em] block mb-2 px-4 max-w-[200px] md:max-w-xs mx-auto">
                            {match.stadium}
                          </span>
                        )}
                        {match?.category && (
                          <span className="text-white/20 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] block">
                            {match.category}
                          </span>
                        )}
                      </div>
                      
                      {!id.startsWith('f') && !id.startsWith('c') && (
                        <>
                          <div className="w-12 h-px bg-white/20 my-4 md:my-6 relative z-10"></div>

                          <div className="flex items-center gap-6 md:gap-8 relative z-10">
                            <div className="flex flex-col items-center">
                              <span className="text-white/40 text-[9px] md:text-[10px] font-black uppercase mb-1 md:mb-2">Poz.</span>
                              <span className="text-blue-400 font-black text-lg md:text-2xl tracking-tight drop-shadow-[0_0_10px_rgba(96,165,250,0.3)]">#{homePosition}</span>
                            </div>
                            <div className="w-px h-8 md:h-10 bg-white/20"></div>
                            <div className="flex flex-col items-center">
                              <span className="text-white/40 text-[9px] md:text-[10px] font-black uppercase mb-1 md:mb-2">Poz.</span>
                              <span className="text-blue-400 font-black text-lg md:text-2xl tracking-tight drop-shadow-[0_0_10px_rgba(96,165,250,0.3)]">#{awayPosition}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="w-px h-32 md:h-40 bg-white/10 hidden md:block opacity-20 mx-2 lg:mx-4"></div>

                  {/* Away Team */}
                  <div className="flex items-center gap-4 md:gap-6 lg:gap-10 flex-1 justify-center md:justify-start group w-full">
                    <div className="shrink-0 relative">
                      <div className="absolute -inset-6 md:-inset-10 bg-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      {awayTeam.logo && (
                        <Image
                          src={awayTeam.logo}
                          alt={awayTeam.name}
                          width={180}
                          height={180}
                          className="w-20 h-20 md:w-32 lg:w-40 md:h-32 lg:h-40 object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.15)] relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6"
                        />
                      )}
                    </div>

                    <div className="flex flex-col items-center md:items-start">
                      <h2 className="text-white text-3xl md:text-5xl lg:text-6xl font-[1000] uppercase tracking-tighter leading-[0.8] md:leading-[0.85] text-center md:text-left transition-transform group-hover:scale-105">
                        {awayTeam.name.split(' ').map((word: string, i: number) => (
                          <div key={i} className="whitespace-nowrap">{word}</div>
                        ))}
                      </h2>
                      <span className="text-blue-400/60 text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] mt-3 md:mt-4">GOŚĆ</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Navigation */}
                <div className="flex items-center justify-between mt-12 md:mt-16 pt-8 md:pt-10 border-t border-white/10 relative z-10 w-full px-2 md:px-12">
                  <div className="flex items-center gap-4 group cursor-pointer opacity-20 hover:opacity-100 transition-all duration-500">
                    <div className="relative">
                      <div className="absolute -inset-2 bg-blue-500/10 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      {homeTeam.logo && (
                        <Image src={homeTeam.logo} alt="" width={40} height={40} className="relative z-10 grayscale brightness-200 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-500" />
                      )}
                    </div>
                    <div className="hidden lg:flex flex-col">
                      <span className="text-white text-[10px] font-black uppercase tracking-widest">{homeTeam.shortName || homeTeam.name}</span>
                      <span className="text-white/40 text-[8px] font-bold uppercase tracking-widest">GOSPODARZ</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 md:gap-12">
                    <button 
                      onClick={() => setActiveTab('relacja')}
                      className={`text-[11px] font-black uppercase tracking-[0.4em] transition-colors ${
                        activeTab === 'relacja' ? 'text-blue-400' : 'text-white/30 hover:text-blue-400'
                      }`}
                    >
                      Centrum
                    </button>
                    <div className="relative group/pff cursor-pointer">
                      <div className="absolute -inset-4 bg-blue-500/10 blur-xl opacity-0 group-hover/pff:opacity-100 transition-opacity"></div>
                      <Image 
                        src="https://i.ibb.co/xbrWSnb/Przezroczyste-PFF.png" 
                        alt="PFF" 
                        width={100} 
                        height={40} 
                        className="relative z-10 grayscale brightness-200 opacity-30 group-hover/pff:opacity-100 group-hover/pff:grayscale-0 group-hover/pff:brightness-100 transition-all duration-700 h-8 md:h-10 w-auto" 
                      />
                    </div>
                    <button 
                      onClick={() => setActiveTab('składy')}
                      className={`text-[11px] font-black uppercase tracking-[0.4em] transition-colors ${
                        activeTab === 'składy' ? 'text-blue-400' : 'text-white/30 hover:text-blue-400'
                      }`}
                    >
                      Składy
                    </button>
                  </div>

                  <div className="flex items-center gap-4 group cursor-pointer opacity-20 hover:opacity-100 transition-all duration-500">
                    <div className="hidden lg:flex flex-col items-end text-right">
                      <span className="text-white text-[10px] font-black uppercase tracking-widest">{awayTeam.shortName || awayTeam.name}</span>
                      <span className="text-white/40 text-[8px] font-bold uppercase tracking-widest">GOŚĆ</span>
                    </div>
                    <div className="relative">
                      <div className="absolute -inset-2 bg-blue-500/10 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      {awayTeam.logo && (
                        <Image src={awayTeam.logo} alt="" width={40} height={40} className="relative z-10 grayscale brightness-200 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Tab Content for non-active matches */}
                {activeTab === 'składy' && (
                  <div className="w-full mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
                      {/* Reuse the existing lineups logic but adapted for this layout if needed, 
                          or just show a message if no data */}
                      <div className="bg-[#0a101f]/60 backdrop-blur-xl rounded-[30px] p-8 border border-white/10 w-full max-w-4xl mx-auto text-center">
                        <p className="text-white/30 italic">Składy zostaną ogłoszone przed rozpoczęciem meczu</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Discord Redirect Section */}
              <div className="mt-8 w-full max-w-6xl mx-auto">
                <Link 
                  href="https://discord.gg/R7y6ZnczP4" 
                  target="_blank" 
                  className="group relative flex items-center justify-center gap-4 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/20 rounded-3xl p-6 transition-all duration-300 backdrop-blur-xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#5865F2]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-12 h-12 bg-[#5865F2] rounded-2xl flex items-center justify-center shadow-lg shadow-[#5865F2]/20 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.572.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.249-.192.37-.291a.072.072 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.072.072 0 0 1 .078.01c.12.098.246.196.373.291a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z"/>
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#5865F2] text-[10px] font-black uppercase tracking-[0.3em] mb-1">Live Stream</span>
                    <span className="text-white text-2xl font-black uppercase tracking-tight italic">OGLĄDAJ NA DISCORD</span>
                  </div>
                  <div className="ml-auto flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl group-hover:bg-white/10 transition-colors">
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Kliknij aby dołączyć</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

function StatBar({ label, valA, valB, suffix = '' }: { label: string, valA: number, valB: number, suffix?: string }) {
  const total = valA + valB || 1;
  const percA = (valA / total) * 100;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end px-2">
        <div className="flex flex-col items-start">
          <span className="text-2xl font-black text-white tracking-tighter tabular-nums">{valA}{suffix}</span>
        </div>
        <span className="text-blue-400/60 font-black text-[10px] md:text-xs tracking-[0.3em] uppercase mb-1">{label}</span>
        <div className="flex flex-col items-end">
          <span className="text-2xl font-black text-white tracking-tighter tabular-nums">{valB}{suffix}</span>
        </div>
      </div>
      <div className="h-3 bg-white/5 rounded-full overflow-hidden flex border border-white/5 p-0.5 shadow-inner">
        <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000 relative rounded-full" style={{ width: `${percA}%` }}>
          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
        <div className="h-full transition-all duration-1000" style={{ width: `${100 - percA}%` }}></div>
      </div>
    </div>
  );
}
