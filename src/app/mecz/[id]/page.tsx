"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { teams, extraTeams, findMatchById } from '@/lib/data';
import { REPLIT_API_BASE_URL } from '@/lib/constants';
import { MainNavbar } from '@/components/main-navbar';
import { Footer } from '@/components/footer';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sun, ChevronLeft, BarChart2, Users, Table as TableIcon, MapPin, Flag, Trophy, MessageSquare, Newspaper, Calendar, Star, Video, Plus, X, Shield } from 'lucide-react';

const shieldPlaceholder = 'https://i.ibb.co/Rkz8MRSy/IMG-4837.png'; 
const playerPlaceholder = 'https://i.ibb.co/S7RD8ZHj/images-removebg-preview-1.png'; 
const leagueLogo = 'https://i.ibb.co/Rkz8MRSy/IMG-4837.png';

const getSafeTeamLogo = (teamId: any, fallback?: string, apiTeams?: any[]) => {
    if (fallback && !fallback.includes('league-builder.replit.app')) return fallback;
    if (!teamId) return shieldPlaceholder;
    return `${REPLIT_API_BASE_URL}/api/teams/${teamId}/logo`;
};

const getSafePlayerPhoto = (player: any) => {
    if (!player?.photo_url || player.photo_url.includes('imgbb.com') || player.photo_url.includes('ibb.co')) return 'https://i.ibb.co/S7RD8ZHj/images-removebg-preview-1.png';
    return player.photo_url;
};

const normalizeTeamName = (name: string) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '');
};

interface Goal {
  minute: number;
  player: string;
  team: string;
  isPenalty: boolean;
}

interface Card {
  minute: number;
  player: string;
  team: string;
  type: 'yellow' | 'red';
}

interface Substitution {
  minute: number;
  team: string;
  playerOut: string;
  playerIn: string;
}

interface MatchEvents {
  goals: Goal[];
  cards: Card[];
  substitutions: Substitution[];
}

interface MatchApiData {
  id: number;
  home_team_name: string;
  away_team_name: string;
  home_score: number;
  away_score: number;
  status: string;
  round: number;
  scheduled_at: string;
  period?: string;
  referee_name?: string;
  venue_name?: string;
  isActive?: boolean;
  minute?: string;
  home_team?: { id: number; name: string; logo_url: string };
  away_team?: { id: number; name: string; logo_url: string };
  date_formatted?: string;
  time_formatted?: string;
  home_team_logo?: string;
  away_team_logo?: string;
}

const formatMatchDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const [day, month, year] = dateStr.split('.');
  if (!day || !month || !year) return dateStr;
  const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
};

const PlayerNode = ({ name, number, photo, color = 'blue', yellow, goal, isCaptain }: any) => (
  <div className="flex flex-col items-center gap-2 group relative">
    <div className="relative">
      {/* Player Avatar with Glow */}
      <div className={`relative w-14 h-14 md:w-20 md:h-20 rounded-full border-2 overflow-hidden z-10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${
        color === 'blue' ? 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 
        (color === 'red' ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 
        (color === 'yellow' ? 'border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 
        'border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)]'))
      } bg-[#1a2333]`}>
        <img src={getSafePlayerPhoto({ photo_url: photo })} alt="" className="w-full h-full object-cover" />
      </div>

      {/* Captain Badge */}
      {isCaptain && (
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-600 rounded-full border-2 border-[#0a0f1d] z-20 flex items-center justify-center shadow-lg">
          <span className="text-[9px] font-black text-white italic">C</span>
        </div>
      )}

      {/* Events */}
      {yellow && (
        <div className="absolute top-0 -left-2 w-3 h-4 bg-yellow-500 rounded-sm border border-black/50 z-30 shadow-glow animate-bounce"></div>
      )}
      {goal && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full border border-black/50 z-30 flex items-center justify-center shadow-2xl">
          <div className="w-4 h-4 bg-black rounded-full"></div>
        </div>
      )}
    </div>
    
    {/* Name Label - Updated to match requested style */}
    <div className="flex flex-col items-center">
      <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-4 py-1 flex items-center gap-2 transform transition-all group-hover:bg-blue-600/40 group-hover:border-blue-500/50">
        <span className="text-blue-400 text-[10px] font-black italic">{number}</span>
        <span className="text-white text-[10px] font-black uppercase tracking-wider whitespace-nowrap drop-shadow-md">
          {name}
        </span>
      </div>
    </div>
  </div>
);

const FootballPitch = ({ lineupData, homeTeam, awayTeam, apiData, liveData }: any) => {
  const lineups = useMemo(() => {
    return Array.isArray(lineupData) ? lineupData : (lineupData?.lineups || []);
  }, [lineupData]);

  const isOfficial = useMemo(() => {
    if (!apiData?.scheduled_at) return false;
    const matchTime = new Date(apiData.scheduled_at).getTime();
    const now = Date.now();
    const diffMins = (matchTime - now) / (1000 * 60);
    // If match is in progress or finished, it's definitely official
    if (apiData.status === 'active' || apiData.status === 'live' || apiData.status === 'finished') return true;
    return diffMins <= 20;
  }, [apiData?.scheduled_at, apiData?.status]);

  if (lineups.length === 0) {
    return (
      <div className="bg-[#0c162d]/40 backdrop-blur-3xl border border-white/5 rounded-[48px] p-24 flex flex-col items-center justify-center text-center shadow-2xl min-h-[600px]">
        <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-8 border border-blue-500/20">
          <Users className="w-10 h-10 text-blue-500 animate-pulse" />
        </div>
        <h3 className="text-white font-black text-xl md:text-2xl uppercase tracking-[0.2em] mb-4 italic text-center leading-relaxed">
          Brak informacji o składach,<br />wkrótce się pojawi.
        </h3>
      </div>
    );
  }

  const getTeamLineup = (team: any) => {
    return lineups.find((l: any) => 
      String(l.team?.id) === String(team.id) ||
      normalizeTeamName(l.team?.name || l.team_name) === normalizeTeamName(team.name) || 
      normalizeTeamName(l.team?.short_name || l.team_name) === normalizeTeamName(team.name)
    );
  };

  const homeLineup = getTeamLineup(homeTeam);
  const awayLineup = getTeamLineup(awayTeam);

  const renderTeamOnPitch = (lineup: any, side: 'left' | 'right') => {
    if (!lineup) return null;

    const gk = lineup.goalkeeper?.[0] || null;
    const starters = lineup.starters || [];

    const events = liveData?.events || [];
    const getPlayerEvents = (player: any) => {
      if (!player) return {};
      const playerEvents = events.filter((e: any) => 
        normalizeTeamName(e.player?.name) === normalizeTeamName(`${player.first_name} ${player.last_name}`) ||
        normalizeTeamName(e.player?.name) === normalizeTeamName(player.last_name)
      );
      return {
        goal: playerEvents.some((e: any) => e.type === 'goal'),
        yellow: playerEvents.some((e: any) => e.type === 'yellow_card'),
        red: playerEvents.some((e: any) => e.type === 'red_card'),
      };
    };

    // Distribution for 2-1-2 Formation (5 field players)
    // 1 GK
    // 2 Defs (FIXO)
    // 1 Mid (PIVOT)
    // 2 Fwds (ALA)

    const positions = {
      gk: gk,
      def: starters.slice(0, 2),
      mid: starters.slice(2, 3),
      fwd: starters.slice(3, 5)
    };

    return (
      <div className={`absolute inset-y-0 w-1/2 ${side === 'left' ? 'left-0 border-r border-white/10' : 'right-0'}`}>
        {/* Team Name Label on Pitch */}
        <div className={`absolute top-6 ${side === 'left' ? 'left-8 text-left' : 'right-8 text-right'} z-30`}>
          <div className="flex flex-col gap-0.5">
            <span className="text-white/30 text-[7px] font-black uppercase tracking-[0.3em] italic">{side === 'left' ? 'GOSPODARZE' : 'GOŚCIE'}</span>
            <h4 className="text-white font-black text-lg uppercase tracking-tighter italic drop-shadow-lg leading-none">{side === 'left' ? homeTeam.name : awayTeam.name}</h4>
          </div>
        </div>

        {/* Goalkeeper */}
        <div className="absolute top-1/2 -translate-y-1/2" style={{ [side]: '8%' }}>
          {positions.gk && (
            <PlayerNode 
              name={positions.gk.last_name} 
              number={positions.gk.jersey_number} 
              photo={positions.gk.photo_url} 
              color="yellow" 
              isCaptain={positions.gk.is_captain} 
              {...getPlayerEvents(positions.gk)}
            />
          )}
        </div>

        {/* Defenders (FIXO) */}
        <div className="absolute inset-y-0 flex flex-col justify-around py-24" style={{ [side]: '32%' }}>
          {positions.def.map((p: any, i: number) => (
            <PlayerNode 
              key={i} 
              name={p.last_name} 
              number={p.jersey_number} 
              photo={p.photo_url} 
              color={side === 'left' ? 'blue' : 'red'} 
              isCaptain={p.is_captain} 
              {...getPlayerEvents(p)}
            />
          ))}
        </div>

        {/* Midfielder (PIVOT) */}
        <div className="absolute top-1/2 -translate-y-1/2" style={{ [side]: '58%' }}>
          {positions.mid.map((p: any, i: number) => (
            <PlayerNode 
              key={i} 
              name={p.last_name} 
              number={p.jersey_number} 
              photo={p.photo_url} 
              color={side === 'left' ? 'blue' : 'red'} 
              isCaptain={p.is_captain} 
              {...getPlayerEvents(p)}
            />
          ))}
        </div>

        {/* Forwards (ALA) */}
        <div className="absolute inset-y-0 flex flex-col justify-around py-24" style={{ [side]: '82%' }}>
          {positions.fwd.map((p: any, i: number) => (
            <PlayerNode 
              key={i} 
              name={p.last_name} 
              number={p.jersey_number} 
              photo={p.photo_url} 
              color={side === 'left' ? 'blue' : 'red'} 
              isCaptain={p.is_captain} 
              {...getPlayerEvents(p)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col items-center gap-4">
        <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.6em] italic animate-pulse">
          {isOfficial ? 'Oficjalne Składy' : 'Prawdopodobne Składy'}
        </span>
        <div className="h-px w-64 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
      </div>

      <div className="relative aspect-[16/9] md:aspect-[21/9] min-h-[600px] w-full bg-[#080c1a] rounded-[4rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.6)] overflow-hidden ring-1 ring-white/5 group/pitch">
        {/* Professional Pitch Lines */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        
        {/* Grass Pattern Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 via-transparent to-red-900/10"></div>

        {/* Outer Border */}
        <div className="absolute inset-10 border-2 border-white/10 rounded-[3rem]"></div>
        
        {/* Halfway Line */}
        <div className="absolute inset-y-10 left-1/2 -translate-x-1/2 w-0.5 bg-white/10"></div>
        
        {/* Center Circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 border-2 border-white/10 rounded-full flex items-center justify-center">
           <div className="w-2 h-2 bg-white/20 rounded-full"></div>
        </div>
        
        {/* Penalty Areas */}
        <div className="absolute inset-y-[20%] left-10 w-32 border-2 border-l-0 border-white/10 rounded-r-[3rem] bg-white/[0.01]"></div>
        <div className="absolute inset-y-[20%] right-10 w-32 border-2 border-r-0 border-white/10 rounded-l-[3rem] bg-white/[0.01]"></div>

        {/* Players Layer */}
        <div className="absolute inset-10 z-10">
          {renderTeamOnPitch(homeLineup, 'left')}
          {renderTeamOnPitch(awayLineup, 'right')}
        </div>
      </div>

      {/* Substitutes Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {[
           { lineup: homeLineup, name: homeTeam.name, color: 'blue' },
           { lineup: awayLineup, name: awayTeam.name, color: 'red' }
         ].map((team, idx) => (
           <div key={idx} className="bg-[#0a1121]/80 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-12 shadow-2xl transition-all hover:bg-[#0c162d]/90 hover:border-white/10">
             <div className="flex items-center justify-between mb-10">
               <div className="flex items-center gap-4">
                 <div className={`w-2 h-8 rounded-full ${team.color === 'blue' ? 'bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`}></div>
                 <h4 className="text-white font-black text-xl uppercase tracking-[0.2em] italic">{team.name}</h4>
               </div>
               <span className="text-white/20 font-black text-[10px] uppercase tracking-[0.4em]">REZERWOWI</span>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {team.lineup?.substitutes?.length > 0 ? team.lineup.substitutes.map((p: any, i: number) => (
                 <div key={i} className="flex items-center gap-4 bg-black/40 border border-white/5 rounded-2xl p-4 transition-all hover:border-blue-500/30 group/sub">
                    <div className="w-12 h-12 rounded-xl overflow-hidden relative border border-white/10 shrink-0 bg-[#1a2333]">
                      <Image src={getSafePlayerPhoto(p)} alt="" fill className="object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-black text-[12px] uppercase tracking-tight">{p.first_name} {p.last_name}</span>
                        {p.is_captain && <span className="bg-yellow-600 text-black text-[8px] font-black px-1.5 py-0.5 rounded italic">CAP</span>}
                      </div>
                      <span className={`${team.color === 'blue' ? 'text-blue-500' : 'text-red-500'} font-black text-[11px] tracking-[0.2em] italic`}>#{p.jersey_number}</span>
                    </div>
                 </div>
               )) : (
                 <div className="col-span-full py-8 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-3xl">
                   <Users className="w-8 h-8 text-white/5 mb-3" />
                   <span className="text-white/10 text-[10px] font-black uppercase tracking-[0.4em] italic text-center">Brak rezerwowych w protokole</span>
                 </div>
               )}
             </div>
           </div>
         ))}
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1">
    <span className="text-blue-500 text-[8px] font-black uppercase tracking-[0.3em] opacity-60">{label}</span>
    <span className="text-white font-black text-sm tracking-tight">{value}</span>
  </div>
);

const StatBox = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col items-center p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
    <div className="text-white font-black text-xl">{value}</div>
    <div className="text-white/20 text-[7px] font-black text-center leading-tight mt-1 tracking-widest uppercase">{label}</div>
  </div>
);

const CompareStat = ({ label, val1, val2, color1 = 'bg-blue-600', color2 = 'bg-blue-400' }: any) => {
  const v1 = Number(val1) || 0;
  const v2 = Number(val2) || 0;
  const total = v1 + v2 || 1;
  const p1 = (v1 / total) * 100;
  const p2 = (v2 / total) * 100;

  return (
    <div className="space-y-4 group">
      <div className="flex justify-between items-center px-2">
        <span className="text-white font-black text-xl italic tabular-nums drop-shadow-lg transition-transform group-hover:scale-110">{val1}</span>
        <span className="text-white/30 text-[9px] font-black tracking-[0.4em] uppercase group-hover:text-blue-500/60 transition-colors">{label}</span>
        <span className="text-white font-black text-xl italic tabular-nums drop-shadow-lg transition-transform group-hover:scale-110">{val2}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-white/[0.03] rounded-full overflow-hidden flex justify-end ring-1 ring-white/5">
            <div className={`h-full ${color1} rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(37,99,235,0.4)]`} style={{ width: `${p1}%` }}></div>
        </div>
        <div className="w-1.5 h-1.5 bg-white/10 rounded-full group-hover:bg-blue-500/40 transition-colors shadow-glow"></div>
        <div className="flex-1 h-1.5 bg-white/[0.03] rounded-full overflow-hidden ring-1 ring-white/5">
            <div className={`h-full ${color2} rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(96,165,250,0.4)]`} style={{ width: `${p2}%` }}></div>
        </div>
      </div>
    </div>
  );
};

const FooterInfoItem = ({ icon: Icon, label, value }: any) => (
  <div className="flex items-start gap-3">
    <Icon className="w-5 h-5 text-blue-500/40" />
    <div className="flex flex-col gap-1">
      <span className="text-white/20 text-[7px] font-black uppercase tracking-widest">{label}</span>
      <span className="text-white font-black text-[10px] leading-tight whitespace-pre-line">{value}</span>
    </div>
  </div>
);

const MatchRelacja = ({ liveData, allPlayers }: any) => {
  const events = liveData?.events || [];
  
  if (events.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
        <MessageSquare className="w-12 h-12 text-white/5 mb-6" />
        <span className="text-white/20 text-xs font-black uppercase tracking-[0.4em] italic text-center px-12 leading-relaxed">
          Brak komentarzy do tego meczu.<br />Relacja rozpocznie się wraz z gwizdkiem sędziego.
        </span>
      </div>
    );
  }

  const findPlayerData = (eventPlayer: any) => {
    if (!eventPlayer) return null;
    if (typeof eventPlayer === 'object' && eventPlayer.photo_url && eventPlayer.name) return eventPlayer;
    
    const searchName = (eventPlayer.name || eventPlayer.player_name || (typeof eventPlayer === 'string' ? eventPlayer : '')).toLowerCase().trim();
    if (!searchName) return eventPlayer;

    const found = allPlayers?.find((p: any) => {
      const fullName = `${p.first_name} ${p.last_name}`.toLowerCase().trim();
      return fullName === searchName || p.last_name.toLowerCase().trim() === searchName;
    });

    if (found) {
      return {
        ...eventPlayer,
        name: `${found.first_name} ${found.last_name}`,
        photo_url: found.photo_url,
        jersey_number: found.jersey_number
      };
    }
    return eventPlayer;
  };

  return (
    <div className="space-y-12 max-w-2xl mx-auto pb-20">
      {events.map((event: any, i: number) => {
        const isSubstitution = event.type === 'substitution';
        const rawPlayerIn = event.player_in || (isSubstitution ? event.player : null);
        const rawPlayerOut = event.player_out;
        
        const playerIn = findPlayerData(rawPlayerIn);
        const playerOut = findPlayerData(rawPlayerOut);
        const eventPlayer = findPlayerData(event.player);

        return (
          <div key={i} className="relative">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full shadow-lg">
                 <span className="text-white font-black text-sm italic tabular-nums">{event.minute}'</span>
              </div>
              <h4 className="text-white font-black text-lg uppercase italic tracking-wider drop-shadow-md">{event.type_label}</h4>
            </div>

            <div className="bg-[#1a2333]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden group hover:bg-[#1a2333] transition-all duration-500">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-6 flex-1">
                  {/* Team Logo on Left */}
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 shrink-0 bg-[#0c162d] shadow-2xl transition-transform group-hover:scale-105">
                    {event.team?.logo_url ? (
                      <img src={event.team.logo_url} alt="" className="w-full h-full object-contain p-2" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/5">
                        <Shield className="w-6 h-6 text-white/10" />
                      </div>
                    )}
                  </div>
                  
                  {isSubstitution ? (
                    <div className="flex flex-col gap-6 flex-1">
                      <div className="flex items-center gap-4 bg-green-500/5 rounded-2xl p-3 border border-green-500/10">
                        <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-green-500/30 bg-[#0c162d] shrink-0 shadow-lg">
                          <Image src={getSafePlayerPhoto(playerIn)} alt="" fill className="object-cover" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-black text-xl uppercase italic leading-none">{playerIn?.name || playerIn?.player_name || 'Wchodzi'}</span>
                          <span className="text-green-500 text-[10px] font-black uppercase tracking-widest mt-1.5 flex items-center gap-2">
                            <Plus className="w-3 h-3" /> WCHODZI
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 bg-red-500/5 rounded-2xl p-3 border border-red-500/10 opacity-80">
                        <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-red-500/30 bg-[#0c162d] shrink-0 shadow-lg">
                          <Image src={getSafePlayerPhoto(playerOut)} alt="" fill className="object-cover" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white/60 font-black text-xl uppercase italic leading-none">{playerOut?.name || playerOut?.player_name || 'Schodzi'}</span>
                          <span className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1.5 flex items-center gap-2">
                            <X className="w-3 h-3" /> SCHODZI
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3">
                        {eventPlayer?.jersey_number && (
                          <span className="text-blue-500 font-black text-base italic">#{eventPlayer.jersey_number}</span>
                        )}
                        <span className="text-white font-black text-xl md:text-2xl uppercase tracking-tighter italic leading-none">
                          {eventPlayer?.name || 'Zawodnik'}
                        </span>
                      </div>
                      <span className="text-white/40 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mt-1 italic">
                        {eventPlayer?.position_label || 'ZAWODNIK'}
                      </span>
                    </div>
                  )}
                </div>

                {!isSubstitution && (
                  <div className="relative">
                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-white/10 bg-[#0c162d] flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.4)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-2">
                       {eventPlayer?.photo_url ? (
                         <Image src={eventPlayer.photo_url} alt="" fill className="object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center bg-white/5">
                           <Users className="w-10 h-10 text-white/10" />
                         </div>
                       )}
                    </div>
                    
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-[#1a2333] shadow-2xl flex items-center justify-center z-20 overflow-hidden transform transition-transform group-hover:scale-110">
                       {event.type === 'goal' && (
                         <div className="w-full h-full bg-white flex items-center justify-center">
                            <div className="w-5 h-5 md:w-6 md:h-6 bg-black rounded-full flex items-center justify-center border border-black">
                               <div className="w-3 h-3 md:w-4 md:h-4 bg-white rounded-full opacity-10"></div>
                            </div>
                         </div>
                       )}
                       {event.type === 'yellow_card' && (
                         <div className="w-full h-full bg-yellow-500 flex items-center justify-center">
                            <div className="w-4 h-6 bg-yellow-400 border border-black/20 rounded-sm"></div>
                         </div>
                       )}
                       {event.type === 'red_card' && (
                         <div className="w-full h-full bg-red-600 flex items-center justify-center">
                            <div className="w-4 h-6 bg-red-500 border border-black/20 rounded-sm"></div>
                         </div>
                       )}
                    </div>
                  </div>
                )}

                {isSubstitution && (
                  <div className="flex flex-col items-center justify-center bg-blue-600/20 border border-blue-500/30 rounded-2xl p-4 shadow-2xl gap-3">
                     <Plus className="w-5 h-5 text-green-500 animate-pulse" />
                     <div className="w-px h-6 bg-white/10"></div>
                     <X className="w-5 h-5 text-red-500" />
                  </div>
                )}
              </div>
              
              <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-20 -z-0 transition-opacity group-hover:opacity-40 ${
                event.type === 'goal' ? 'bg-blue-500' : (event.type === 'red_card' ? 'bg-red-500' : (event.type === 'yellow_card' ? 'bg-yellow-500' : 'bg-green-500'))
              }`}></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const MVPSection = ({ liveData }: any) => {
  const scorers = liveData?.goals || [];
  // Get unique players with goals/assists, limit to 4
  const mvpCandidates = useMemo(() => {
    const candidates: any[] = [];
    scorers.forEach((g: any) => {
      if (g.player && !candidates.find(c => c.name === g.player.name)) {
        candidates.push({ ...g.player, goals: scorers.filter((goal: any) => goal.player?.name === g.player.name).length });
      }
    });
    return candidates.slice(0, 4);
  }, [scorers]);

  if (mvpCandidates.length === 0) return null;

  return (
    <div className="bg-[#0c162d]/60 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-10 mt-12 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <h3 className="text-white font-black text-xl uppercase tracking-widest mb-10 text-center italic">
        KTO BYŁ ZAWODNIKIEM MECZU?
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mvpCandidates.map((p, i) => (
          <div key={i} className="bg-black/40 border border-white/5 p-6 rounded-[2.5rem] flex flex-col items-center gap-4 group hover:border-blue-500/30 transition-all hover:bg-black/60 cursor-pointer">
            <div className="relative w-20 h-20 rounded-[2rem] overflow-hidden border border-white/10 group-hover:scale-105 transition-transform">
              {p.photo_url ? (
                <Image src={p.photo_url} alt="" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/5">
                  <Users className="w-8 h-8 text-white/10" />
                </div>
              )}
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-white font-black text-sm uppercase italic tracking-tight mb-1">{p.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-blue-500 text-[9px] font-black uppercase tracking-widest">{p.goals} GOLE</span>
                <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                <div className="text-white/20 text-[9px] font-black uppercase tracking-widest">GŁOSUJ</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LiveView = ({ activeTab, homeTeam, awayTeam, apiData, eventsData, lineupData, liveData, allPlayers }: any) => {
  const hasLineups = lineupData?.lineups && lineupData.lineups.length > 0;
  const isMatchFinished = apiData?.status === 'finished' || apiData?.status === 'Zakończony';

  return (
    <div className="space-y-8">
      {activeTab === 'składy' && (
        hasLineups ? (
          <FootballPitch lineupData={lineupData} homeTeam={homeTeam} awayTeam={awayTeam} apiData={apiData} liveData={liveData} />
        ) : (
          <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[4rem] bg-white/[0.01] animate-in fade-in zoom-in duration-700">
            <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center mb-8 relative">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
              <Users className="w-10 h-10 text-blue-500/40 relative z-10" />
            </div>
            <h3 className="text-white/40 font-black text-xl md:text-2xl uppercase tracking-[0.4em] italic text-center px-12 leading-relaxed">
              Brak informacji o składach,<br />wkrótce się pojawi.
            </h3>
          </div>
        )
      )}

      {activeTab === 'relacja' && (
        <div className="space-y-12">
          <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl">
            <h3 className="text-white font-black text-xl uppercase tracking-widest italic mb-12">PRZEBIEG MECZU</h3>
            <div className="relative pt-12 pb-4">
              <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 rounded-full"></div>
              <div className="flex justify-between relative">
                {['0\'', '15\'', '23\'', '30\'', '45\'', '60\'', '67\'', '75\'', '90\''].map((t, i) => (
                  <div key={i} className="relative flex flex-col items-center">
                    <div className="absolute -top-[14px] w-2 h-2 rounded-full bg-white/20"></div>
                    <span className="text-white/20 text-[10px] font-black mt-2 tracking-tighter">{t}</span>
                  </div>
                ))}
              </div>
              <div className="absolute top-0 left-0 right-0 h-0">
                 {/* Real events on timeline */}
                 {(liveData?.events || []).map((event: any, i: number) => {
                   const pos = Math.min((event.minute / 90) * 100, 100);
                   return (
                     <div key={i} className="absolute -top-4 flex flex-col items-center gap-2" style={{ left: `${pos}%` }}>
                       {event.type === 'goal' && (
                         <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center border-2 border-[#0a0f1d] z-10 shadow-lg animate-bounce">
                           <div className="w-3 h-3 bg-black rounded-full"></div>
                         </div>
                       )}
                       {event.type === 'yellow_card' && (
                         <div className="w-4 h-5 rounded-sm bg-yellow-500 border border-black z-10 shadow-lg animate-pulse"></div>
                       )}
                       {event.type === 'red_card' && (
                         <div className="w-4 h-5 rounded-sm bg-red-600 border border-black z-10 shadow-lg animate-pulse"></div>
                       )}
                       <span className="text-white font-black text-[10px] tabular-nums">{event.minute}'</span>
                     </div>
                   );
                 })}
              </div>
            </div>
          </div>
          
          {isMatchFinished && <MVPSection liveData={liveData} />}
        </div>
      )}

      {activeTab === 'komentarz' && (
        <MatchRelacja liveData={liveData} allPlayers={allPlayers} />
      )}
    </div>
  );
};

const UpcomingView = ({ activeTab, homeTeam, awayTeam, apiTeams, apiData, refereeData, allMatches, lineupData, liveData }: any) => {
  const hasLineups = lineupData?.lineups && lineupData.lineups.length > 0;
  const homeTeamData = apiTeams?.find((t: any) => normalizeTeamName(t.name) === normalizeTeamName(homeTeam.name) || normalizeTeamName(t.short_name) === normalizeTeamName(homeTeam.name));
  const awayTeamData = apiTeams?.find((t: any) => normalizeTeamName(t.name) === normalizeTeamName(awayTeam.name) || normalizeTeamName(t.short_name) === normalizeTeamName(awayTeam.name));

  const getStats = (teamData: any) => {
    if (!teamData) return null;
    const played = teamData.played_matches || [];
    const won = played.filter((m: any) => m.result === 'W').length;
    const drawn = played.filter((m: any) => m.result === 'D' || m.result === 'R').length;
    const lost = played.filter((m: any) => m.result === 'L').length;
    const goals_for = played.reduce((acc: number, m: any) => acc + (m.side === 'home' ? (m.home_score || 0) : (m.away_score || 0)), 0);
    const goals_against = played.reduce((acc: number, m: any) => acc + (m.side === 'home' ? (m.away_score || 0) : (m.home_score || 0)), 0);
    const points = won * 3 + drawn;

    const players = teamData.players || [];
    const foreign = players.filter((p: any) => p.nationality && normalizeTeamName(p.nationality) !== 'polska').length;
    const polish = players.length - foreign;
    const avg_age = players.length > 0 ? (players.reduce((acc: number, p: any) => {
        if (!p.birth_date) return acc + 24;
        const age = new Date().getFullYear() - new Date(p.birth_date).getFullYear();
        return acc + age;
    }, 0) / players.length).toFixed(1) : '24.5';

    const getTeamLogo = (teamId: any, fallback: string) => getSafeTeamLogo(teamId, fallback, apiTeams);
    const getPlayerPhoto = (player: any) => getSafePlayerPhoto(player);

    const topScorer = players.length > 0 ? players[0] : null;

    return {
        played: played.length,
        won,
        drawn,
        lost,
        goals_for,
        goals_against,
        points,
        squad_count: players.length,
        polish_players: polish,
        foreign_players: foreign,
        avg_age,
        top_scorer_name: topScorer ? `${topScorer.first_name || ''} ${topScorer.last_name || ''}`.trim() : 'N/A',
        top_scorer_pos: topScorer?.position || 'N/A',
        top_scorer_photo: getPlayerPhoto(topScorer),
        top_scorer_goals: topScorer?.goals_count || topScorer?.goals || 0,
        recent_matches: played.slice(0, 5).map((m: any) => {
            const opponentName = m.opponent_name || m.opponent?.name || '';
            const team = apiTeams?.find?.((t: any) => normalizeTeamName(t.name) === normalizeTeamName(opponentName));
            
            return {
                date: m.date || '?',
                opponent: opponentName || '?',
                opponent_logo: getTeamLogo(team?.id, shieldPlaceholder),
                league_logo: m.match_type === 'county_cup' ? 'https://i.ibb.co/qMzPb2kp/IMG-4837-3.png' : leagueLogo,
                score: `${m.home_score || 0}:${m.away_score || 0}`,
                result: m.result || '?'
            };
        })
    };
  };

  const hStats = getStats(homeTeamData);
  const aStats = getStats(awayTeamData);

  const h2hMatches = useMemo(() => {
    const getTeamLogo = (teamId: any, fallback: string) => getSafeTeamLogo(teamId, fallback, apiTeams);

    return allMatches?.filter((m: any) => {
      const mHomeName = m.home_team_name || m.home_team?.name || '';
      const mAwayName = m.away_team_name || m.away_team?.name || '';
      const currentHomeName = homeTeam.name || '';
      const currentAwayName = awayTeam.name || '';

      return ((normalizeTeamName(mHomeName) === normalizeTeamName(currentHomeName) && normalizeTeamName(mAwayName) === normalizeTeamName(currentAwayName)) ||
              (normalizeTeamName(mHomeName) === normalizeTeamName(currentAwayName) && normalizeTeamName(mAwayName) === normalizeTeamName(currentHomeName))) &&
              String(m.id) !== String(apiData?.id);
    }).map((m: any) => {
      const hName = m.home_team_name || m.home_team?.name || 'TBD';
      const aName = m.away_team_name || m.away_team?.name || 'TBD';
      const hTeam = apiTeams?.find?.((t: any) => normalizeTeamName(t.name) === normalizeTeamName(hName) || normalizeTeamName(t.short_name) === normalizeTeamName(hName));
      const aTeam = apiTeams?.find?.((t: any) => normalizeTeamName(t.name) === normalizeTeamName(aName) || normalizeTeamName(t.short_name) === normalizeTeamName(aName));

      // Prefer ID from any available source
      const homeId = m.home_team?.id || m.home_team_id || hTeam?.id;
      const awayId = m.away_team?.id || m.away_team_id || aTeam?.id;

      return {
        ...m,
        home_team_name: hName,
        away_team_name: aName,
        home_team_logo: getSafeTeamLogo(homeId, m.home_team?.logo_url || m.home_team_logo),
        away_team_logo: getSafeTeamLogo(awayId, m.away_team?.logo_url || m.away_team_logo),
        league_logo: m.match_type === 'county_cup' ? 'https://i.ibb.co/qMzPb2kp/IMG-4837-3.png' : leagueLogo,
        home_score: m.home_score ?? m.score?.home ?? 0,
        away_score: m.away_score ?? m.score?.away ?? 0,
        date_formatted: m.date_formatted || (m.scheduled_at ? new Date(m.scheduled_at).toLocaleDateString("pl-PL") : '')
      };
    }) || [];
  }, [allMatches, homeTeam.name, awayTeam.name, apiData?.id, apiTeams]);

  const pastH2H = useMemo(() => h2hMatches.filter((m: any) => m.status === 'finished' || m.status === 'Zakończony'), [h2hMatches]);
  const futureH2H = useMemo(() => h2hMatches.filter((m: any) => m.status === 'scheduled' || m.status === 'Zaplanowany' || !m.status), [h2hMatches]);

  return (
    <div className="space-y-12 pb-24">
      {activeTab === 'składy' && (
        hasLineups ? (
          <FootballPitch lineupData={lineupData} homeTeam={homeTeam} awayTeam={awayTeam} apiData={apiData} liveData={liveData} />
        ) : (
          <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[4rem] bg-white/[0.01] animate-in fade-in zoom-in duration-700">
            <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center mb-8 relative">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
              <Users className="w-10 h-10 text-blue-500/40 relative z-10" />
            </div>
            <h3 className="text-white/40 font-black text-xl md:text-2xl uppercase tracking-[0.4em] italic text-center px-12 leading-relaxed">
              Brak informacji o składach,<br />wkrótce się pojawi.
            </h3>
          </div>
        )
      )}

      {activeTab === 'zapowiedź' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Lewa kolumna: Gospodarze */}
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
              <div className="bg-[#0c162d]/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-10 shadow-2xl ring-1 ring-white/5">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">OSTATNIE MECZE</h3>
                  <div className="w-8 h-px bg-blue-500/30"></div>
                </div>
                <h4 className="text-white font-black text-2xl uppercase tracking-tighter mb-8 italic">{homeTeam.name}</h4>
                <div className="space-y-5">
                  {hStats?.recent_matches?.map((m: any, i: number) => (
                    <div key={i} className="flex items-center justify-between group p-3 rounded-2xl hover:bg-white/[0.02] transition-all relative overflow-hidden">
                      <div className="flex items-center gap-4 relative z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shadow-xl shrink-0 ${
                          m.result === 'W' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : (m.result === 'L' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30')
                        }`}>{m.result}</div>
                        <span className="text-white font-black text-sm tabular-nums tracking-tighter italic">{m.score}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 flex-1 px-4 justify-center relative z-10">
                        <span className="text-white/60 text-[11px] font-black uppercase tracking-tight truncate max-w-[100px] group-hover:text-white transition-colors text-right">{m.opponent}</span>
                        <div className="relative w-24 h-24 shrink-0 shadow-2xl transition-transform group-hover:scale-110">
                          <img src={m.opponent_logo} alt="" className="w-full h-full object-contain" />
                        </div>
                        <div className="relative w-12 h-12 shrink-0 opacity-80">
                          <img src={m.league_logo} alt="" className="w-full h-full object-contain" />
                        </div>
                      </div>

                      <div className="text-right relative z-10">
                        <span className="text-white/20 text-[8px] font-black tracking-widest whitespace-nowrap">{m.date}</span>
                      </div>
                    </div>
                  )) || <div className="text-white/10 text-xs font-black uppercase text-center py-4 italic">Brak danych historycznych</div>}
                </div>
              </div>

              <div className="bg-[#0c162d]/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-10 shadow-2xl ring-1 ring-white/5 group hover:bg-[#0c162d]/80 transition-all">
                <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] mb-10">LIDER STRZELCÓW</h3>
                <div className="flex items-center gap-8">
                   <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-600/20 to-transparent overflow-hidden relative border border-white/10 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                      <Image src={hStats?.top_scorer_photo || playerPlaceholder} alt="" fill className="object-cover scale-110" />
                   </div>
                   <div className="flex-1">
                      <div className="text-white font-black text-xl uppercase italic tracking-tighter leading-none mb-2">{hStats?.top_scorer_name || 'BRAK DANYCH'}</div>
                      <div className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em]">{hStats?.top_scorer_pos || 'NAPASTNIK'}</div>
                   </div>
                   <div className="text-right">
                      <div className="text-4xl font-black text-white italic tracking-tighter drop-shadow-lg leading-none">{hStats?.top_scorer_name === 'N/A' ? 'N/A' : (hStats?.top_scorer_goals || 0)}</div>
                      <div className="text-white/20 text-[8px] font-black uppercase tracking-widest mt-1">GOLE</div>
                   </div>
                </div>
              </div>
            </div>

            {/* Środkowa kolumna: Porównanie */}
            <div className="bg-[#0c162d]/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-12 shadow-2xl ring-1 ring-white/5 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.03] to-transparent"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-16">
                  {homeTeam.logo && <div className="relative w-16 h-16 transition-transform hover:scale-110"><img src={homeTeam.logo} alt="" className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]" /></div>}
                  <div className="flex flex-col items-center">
                    <span className="text-white/20 text-[9px] font-black uppercase tracking-[0.5em] mb-2">PORÓWNANIE</span>
                    <h3 className="text-blue-500 font-black text-xs uppercase tracking-[0.3em] text-center italic">SEZON 2026/27</h3>
                  </div>
                  {awayTeam.logo && <div className="relative w-16 h-16 transition-transform hover:scale-110"><img src={awayTeam.logo} alt="" className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]" /></div>}
                </div>
                <div className="space-y-10">
                  <CompareStat label="MECZE" val1={hStats?.played || 0} val2={aStats?.played || 0} />
                  <CompareStat label="ZWYCIĘSTWA" val1={hStats?.won || 0} val2={aStats?.won || 0} color1="bg-blue-600" color2="bg-blue-400" />
                  <CompareStat label="REMISY" val1={hStats?.drawn || 0} val2={aStats?.drawn || 0} color1="bg-gray-600" color2="bg-gray-400" />
                  <CompareStat label="PORAŻKI" val1={hStats?.lost || 0} val2={aStats?.lost || 0} color1="bg-red-600" color2="bg-red-400" />
                  <CompareStat label="BRAMKI STRZELONE" val1={hStats?.goals_for || 0} val2={aStats?.goals_for || 0} color1="bg-blue-500" color2="bg-cyan-400" />
                  <CompareStat label="BRAMKI STRACONE" val1={hStats?.goals_against || 0} val2={aStats?.goals_against || 0} color1="bg-indigo-600" color2="bg-purple-500" />
                  <CompareStat label="PUNKTY" val1={hStats?.points || 0} val2={aStats?.points || 0} color1="bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]" color2="bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.4)]" />
                </div>
              </div>
            </div>

            {/* Prawa kolumna: Goście */}
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
              <div className="bg-[#0c162d]/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-10 shadow-2xl ring-1 ring-white/5">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">OSTATNIE MECZE</h3>
                  <div className="w-8 h-px bg-blue-500/30"></div>
                </div>
                <h4 className="text-white font-black text-2xl uppercase tracking-tighter mb-8 italic">{awayTeam.name}</h4>
                <div className="space-y-5">
                  {aStats?.recent_matches?.map((m: any, i: number) => (
                    <div key={i} className="flex items-center justify-between group p-3 rounded-2xl hover:bg-white/[0.02] transition-all relative overflow-hidden">
                      <div className="flex items-center gap-4 relative z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shadow-xl shrink-0 ${
                          m.result === 'W' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : (m.result === 'L' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30')
                        }`}>{m.result}</div>
                        <span className="text-white font-black text-sm tabular-nums tracking-tighter italic">{m.score}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 flex-1 px-4 justify-center relative z-10">
                        <span className="text-white/60 text-[11px] font-black uppercase tracking-tight truncate max-w-[100px] group-hover:text-white transition-colors text-right">{m.opponent}</span>
                        <div className="relative w-24 h-24 shrink-0 shadow-2xl transition-transform group-hover:scale-110">
                          <img src={m.opponent_logo} alt="" className="w-full h-full object-contain" />
                        </div>
                        <div className="relative w-12 h-12 shrink-0 opacity-80">
                          <img src={m.league_logo} alt="" className="w-full h-full object-contain" />
                        </div>
                      </div>

                      <div className="text-right relative z-10">
                        <span className="text-white/20 text-[8px] font-black tracking-widest whitespace-nowrap">{m.date}</span>
                      </div>
                    </div>
                  )) || <div className="text-white/10 text-xs font-black uppercase text-center py-4 italic">Brak danych historycznych</div>}
                </div>
              </div>

              <div className="bg-[#0c162d]/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-10 shadow-2xl ring-1 ring-white/5 group hover:bg-[#0c162d]/80 transition-all">
                <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] mb-10 text-right">LIDER STRZELCÓW</h3>
                <div className="flex items-center gap-8 flex-row-reverse">
                   <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-600/20 to-transparent overflow-hidden relative border border-white/10 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                      <Image src={aStats?.top_scorer_photo || playerPlaceholder} alt="" fill className="object-cover scale-110" />
                   </div>
                   <div className="flex-1 text-right">
                      <div className="text-white font-black text-xl uppercase italic tracking-tighter leading-none mb-2">{aStats?.top_scorer_name || 'BRAK DANYCH'}</div>
                      <div className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em]">{aStats?.top_scorer_pos || 'NAPASTNIK'}</div>
                   </div>
                   <div className="text-left">
                      <div className="text-4xl font-black text-white italic tracking-tighter drop-shadow-lg leading-none">{aStats?.top_scorer_name === 'N/A' ? 'N/A' : (aStats?.top_scorer_goals || 0)}</div>
                      <div className="text-white/20 text-[8px] font-black uppercase tracking-widest mt-1">GOLE</div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0c162d]/60 backdrop-blur-2xl border border-white/5 rounded-[3rem] p-10 mt-12 shadow-2xl ring-1 ring-white/5 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h3 className="text-white/20 text-[10px] font-black uppercase tracking-[0.8em] mb-12 text-center ml-[0.8em]">INFORMACJE O MECZU</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-2xl mx-auto">
              <FooterInfoItem icon={Flag} label="SĘDZIA GŁÓWNY" value={refereeData?.referee?.name || apiData?.referee_name || "NIEOKREŚLONY"} />
              <FooterInfoItem icon={Sun} label="POGODA" value={`Działdowo: 22°C\nSłonecznie`} />
            </div>
          </div>
        </>
      )}

      {activeTab === 'h2h' && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Historia Gospodarzy */}
            <div className="bg-[#0c162d]/60 backdrop-blur-2xl border border-white/5 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h3 className="text-white font-black text-xl uppercase tracking-widest mb-10 flex items-center gap-6 italic relative z-10">
                <div className="w-1.5 h-8 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                HISTORIA MECZÓW: {homeTeam.name}
              </h3>
              <div className="space-y-5 relative z-10">
                {hStats?.recent_matches?.map((m: any, i: number) => (
                  <div key={i} className="flex items-center justify-between group p-3 rounded-2xl hover:bg-white/[0.02] transition-all relative overflow-hidden">
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shadow-xl shrink-0 ${
                        m.result === 'W' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : (m.result === 'L' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30')
                      }`}>{m.result}</div>
                      <span className="text-white font-black text-sm tabular-nums tracking-tighter italic">{m.score}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-1 px-4 justify-center relative z-10">
                      <span className="text-white/60 text-[11px] font-black uppercase tracking-tight truncate max-w-[100px] group-hover:text-white transition-colors text-right">{m.opponent}</span>
                      <div className="relative w-10 h-10 shrink-0 shadow-2xl transition-transform group-hover:scale-110">
                        <img src={m.opponent_logo} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div className="relative w-6 h-6 shrink-0 opacity-80">
                        <img src={m.league_logo} alt="" className="w-full h-full object-contain" />
                      </div>
                    </div>

                    <div className="text-right relative z-10">
                      <span className="text-white/20 text-[8px] font-black tracking-widest whitespace-nowrap">{m.date}</span>
                    </div>
                  </div>
                )) || <div className="text-white/10 text-xs font-black uppercase text-center py-8 italic">Brak danych</div>}
              </div>
            </div>

            {/* Historia Gości */}
            <div className="bg-[#0c162d]/60 backdrop-blur-2xl border border-white/5 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <h3 className="text-white font-black text-xl uppercase tracking-widest mb-10 flex items-center gap-6 italic relative z-10">
                <div className="w-1.5 h-8 bg-blue-400 rounded-full shadow-[0_0_15px_rgba(96,165,250,0.5)]"></div>
                HISTORIA MECZÓW: {awayTeam.name}
              </h3>
              <div className="space-y-5 relative z-10">
                {aStats?.recent_matches?.map((m: any, i: number) => (
                  <div key={i} className="flex items-center justify-between group p-3 rounded-2xl hover:bg-white/[0.02] transition-all relative overflow-hidden">
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shadow-xl shrink-0 ${
                        m.result === 'W' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : (m.result === 'L' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30')
                      }`}>{m.result}</div>
                      <span className="text-white font-black text-sm tabular-nums tracking-tighter italic">{m.score}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-1 px-4 justify-center relative z-10">
                      <span className="text-white/60 text-[11px] font-black uppercase tracking-tight truncate max-w-[100px] group-hover:text-white transition-colors text-right">{m.opponent}</span>
                      <div className="relative w-10 h-10 shrink-0 shadow-2xl transition-transform group-hover:scale-110">
                        <img src={m.opponent_logo} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div className="relative w-6 h-6 shrink-0 opacity-80">
                        <img src={m.league_logo} alt="" className="w-full h-full object-contain" />
                      </div>
                    </div>

                    <div className="text-right relative z-10">
                      <span className="text-white/20 text-[8px] font-black tracking-widest whitespace-nowrap">{m.date}</span>
                    </div>
                  </div>
                )) || <div className="text-white/10 text-xs font-black uppercase text-center py-8 italic">Brak danych</div>}
              </div>
            </div>
          </div>

          <div className="bg-[#0c162d]/60 backdrop-blur-2xl border border-white/5 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.02] to-transparent"></div>
            <h3 className="text-white font-black text-2xl uppercase tracking-widest mb-12 flex items-center gap-6 italic relative z-10">
              <div className="w-2 h-10 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.4)]"></div>
              BEZPOŚREDNIE STARCIA (H2H)
            </h3>
            <div className="space-y-6 relative z-10">
              {[...pastH2H, ...futureH2H].length > 0 ? [...pastH2H, ...futureH2H].map((m: any, i: number) => (
                <div key={i} className="bg-[#0a1121]/60 border border-white/10 p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between group hover:bg-[#0a1121]/80 transition-all relative overflow-hidden shadow-xl ring-1 ring-white/5 gap-6 md:gap-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex items-center gap-4 md:gap-6 relative z-10 w-full md:w-1/5 justify-between md:justify-start">
                    <div className="relative w-10 h-10 md:w-12 md:h-12 shrink-0 drop-shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                      <Image 
                        src={m.league_logo} 
                        alt="" 
                        fill 
                        className="object-contain" 
                      />
                    </div>
                    <span className="text-blue-500 font-black text-[9px] md:text-[11px] uppercase italic tracking-widest whitespace-nowrap">KOLEJKA {m.round}</span>
                    <span className="md:hidden text-white/40 text-[9px] font-black uppercase tracking-[0.2em] italic">{m.date_formatted}</span>
                  </div>

                  <div className="flex items-center justify-center gap-4 md:gap-10 flex-1 relative z-10 w-full px-0 md:px-8">
                    <div className="flex flex-col-reverse md:flex-row items-center gap-2 md:gap-6 justify-end w-[40%] md:w-[42%] text-center md:text-right group-hover:-translate-x-1 md:group-hover:-translate-x-2 transition-transform duration-500">
                       <span className="text-white font-black text-[10px] md:text-sm uppercase tracking-tighter truncate w-full drop-shadow-lg">{m.home_team_name}</span>
                       <div className="relative w-14 h-14 md:w-24 md:h-24 shrink-0 drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-transform group-hover:scale-110"><img src={m.home_team_logo} alt="" className="w-full h-full object-contain" /></div>
                    </div>
                    
                    <div className="flex flex-col items-center px-2 md:px-4 min-w-[60px] md:min-w-[100px]">
                      <span className="text-blue-500/40 text-[7px] md:text-[8px] font-black tracking-[0.3em] md:tracking-[0.4em] mb-0.5 md:mb-1 uppercase italic">VS</span>
                      {(m.status === 'finished' || m.status === 'Zakończony') ? (
                        <span className="text-white font-black text-xl md:text-4xl tabular-nums italic drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">{m.home_score || 0}:{m.away_score || 0}</span>
                      ) : (
                        <div className="text-blue-500 font-black text-lg md:text-2xl italic tracking-tighter drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">VS</div>
                      )}
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 justify-start w-[40%] md:w-[42%] text-center md:text-left group-hover:translate-x-1 md:group-hover:translate-x-2 transition-transform duration-500">
                       <div className="relative w-14 h-14 md:w-24 md:h-24 shrink-0 drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-transform group-hover:scale-110"><img src={m.away_team_logo} alt="" className="w-full h-full object-contain" /></div>
                       <span className="text-white font-black text-[10px] md:text-sm uppercase tracking-tighter truncate w-full drop-shadow-lg">{m.away_team_name}</span>
                    </div>
                  </div>

                  <div className="hidden md:block text-right w-1/5 relative z-10">
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] italic">{m.date_formatted}</span>
                  </div>
                </div>
              )) : <div className="text-white/20 italic uppercase text-xs font-black tracking-widest text-center py-12 bg-white/[0.02] rounded-[2rem] border border-white/5">Brak wspólnej historii meczów</div>}
            </div>
          </div>
        </div>
      )}
                  
    </div>
  );
};

export default function MatchPage() {
  const params = useParams();
  const id = params.id as string;
  const matchLocal = findMatchById(id);
  
  const [apiData, setApiData] = useState<MatchApiData | null>(null);
  const [apiTeams, setApiTeams] = useState<any[]>([]);
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [allMatches, setAllMatches] = useState<any[]>([]);
  const [refereeData, setRefereeData] = useState<any>(null);
  const [lineupData, setLineupData] = useState<any>(null);
  const [liveData, setLiveData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'zapowiedź' | 'składy' | 'relacja' | 'h2h' | 'komentarz'>('zapowiedź');
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [liveTimer, setLiveTimer] = useState({ minutes: 0, seconds: 0 });
  
  const isMatchActive = apiData?.status === 'active' || apiData?.status === 'live' || apiData?.status === 'W trakcie' || apiData?.isActive === true || liveData?.status === 'live' || liveData?.status === 'active';
  const isMatchFinished = apiData?.status === 'finished' || apiData?.status === 'Zakończony' || liveData?.status === 'finished';
  const isPreMatch = !isMatchActive && !isMatchFinished && (apiData?.status === 'scheduled' || apiData?.status === 'Zaplanowany' || !apiData?.status);

  const calculateMatchTime = useCallback(() => {
    const data = liveData || apiData;
    if (!data) return null;
    
    if (data.period === 'halftime' || data.status === 'halftime' || data.period === 'break' || data.status === 'break') {
      return 'PRZERWA';
    }

    if (data.minute) return `${data.minute}'`;

    const now = new Date().getTime();
    
    if (data.period === 'second_half' && data.second_half_at) {
      const secondHalfStart = new Date(data.second_half_at).getTime();
      const diff = Math.floor((now - secondHalfStart) / 60000);
      const minute = 45 + diff;
      return minute > 90 ? `90+${minute - 90}'` : `${minute}'`;
    }
    
    if (data.start_timestamp) {
      const start = new Date(data.start_timestamp).getTime();
      const diff = Math.floor((now - start) / 60000);
      const minute = diff + 1;
      
      if (data.period === 'first_half' && minute > 45) {
        return `45+${minute - 45}'`;
      }
      
      return minute > 90 ? `90+${minute - 90}'` : `${minute < 1 ? 1 : minute}'`;
    }
    
    return liveTimer.minutes > 0 ? `${liveTimer.minutes}'` : '1\'';
  }, [liveData, apiData, liveTimer]);

  // Live Timer Effect
  useEffect(() => {
    const isHalftime = apiData?.status === 'halftime' || apiData?.period === 'halftime' || liveData?.status === 'halftime' || liveData?.period === 'halftime';
    if (!isMatchActive || isHalftime) return;
    
    // Sync with API minute if it changes
    const startMin = parseInt(apiData?.minute || liveData?.minute || '0');
    setLiveTimer(prev => {
      // Avoid resetting seconds if the minute is still the same (polling sync)
      if (prev.minutes === startMin && (prev.minutes !== 0 || prev.seconds !== 0)) return prev;
      return { minutes: startMin, seconds: 0 };
    });

    const interval = setInterval(() => {
      setLiveTimer(prev => {
        if (prev.seconds >= 59) {
          return { minutes: prev.minutes + 1, seconds: 0 };
        }
        return { ...prev, seconds: prev.seconds + 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isMatchActive, apiData?.minute]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [scheduleRes, lineupsRes, teamsRes, liveRes, playersRes] = await Promise.all([
          fetch(`${REPLIT_API_BASE_URL}/api/public/schedule?season_id=1`).catch(() => null),
          fetch(`https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/public/lineups/all.json`).catch(() => null),
          fetch(`${REPLIT_API_BASE_URL}/api/teams?season_id=1`).catch(() => null),
          fetch(`${REPLIT_API_BASE_URL}/api/public/matches/${id}/live.json`).catch(() => null),
          fetch(`https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/players`).catch(() => null)
        ]);

        if (playersRes?.ok) {
          setAllPlayers(await playersRes.json());
        }

        if (liveRes?.ok) {
          const lData = await liveRes.json();
          setLiveData(lData);
        }

        let tData = [];
        if (teamsRes?.ok) {
          tData = await teamsRes.json();
          setApiTeams(tData);
        }

        let scheduleMatches = [];
        if (scheduleRes?.ok) {
          const sData = await scheduleRes.json();
          scheduleMatches = sData.matches || [];
          setAllMatches(scheduleMatches);
        }

        if (lineupsRes?.ok) {
          const allLineupsData = await lineupsRes.json();
          // The API returns an array directly, not an object with matches property
          const matchEntry = Array.isArray(allLineupsData) 
            ? allLineupsData.find((m: any) => String(m.match_id) === String(id))
            : (allLineupsData.matches?.find((m: any) => String(m.match_id) === String(id)));
          
          if (matchEntry) {
            setLineupData(matchEntry);
          }
        }

        const matchSchedule = scheduleMatches.find((m: any) => String(m.id) === String(id));
        
        if (matchSchedule) {
          const hId = matchSchedule.home_team?.id;
          const aId = matchSchedule.away_team?.id;
          
          const hLogo = matchSchedule.home_team?.logo_url || tData?.find?.((t: any) => String(t.id) === String(hId))?.logo_url;
          const aLogo = matchSchedule.away_team?.logo_url || tData?.find?.((t: any) => String(t.id) === String(aId))?.logo_url;

          const finalApiData = {
            ...matchSchedule,
            home_team_name: matchSchedule.home_team?.name || 'TBD',
            away_team_name: matchSchedule.away_team?.name || 'TBD',
            home_team_logo: hLogo || `${REPLIT_API_BASE_URL}/api/teams/${hId}/logo`,
            away_team_logo: aLogo || `${REPLIT_API_BASE_URL}/api/teams/${aId}/logo`,
            home_score: matchSchedule.score?.home ?? 0,
            away_score: matchSchedule.score?.away ?? 0,
            date_formatted: matchSchedule.scheduled?.date,
            time_formatted: matchSchedule.scheduled?.time,
            venue_name: matchSchedule.venue?.name,
            scheduled_at: matchSchedule.scheduled?.datetime_local
          };
          setApiData(finalApiData);
        } else if (matchLocal) {
          setApiData({
            ...matchLocal,
            home_team_name: matchLocal.homeTeam?.name,
            away_team_name: matchLocal.awayTeam?.name,
            home_team_logo: matchLocal.homeTeam?.logo,
            away_team_logo: matchLocal.awayTeam?.logo,
          } as any);
        }
      } catch (err) {
        console.error('Error loading match data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
    const interval = setInterval(fetchAllData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [id, matchLocal]);

  useEffect(() => {
    if (isPreMatch) setActiveTab('zapowiedź');
    else setActiveTab('składy');
  }, [isPreMatch]);

  useEffect(() => {
    if (!isPreMatch || !apiData?.scheduled_at) return;
    const timer = setInterval(() => {
      const targetDate = new Date(apiData.scheduled_at).getTime();
      const distance = targetDate - Date.now();
      if (distance < 0) {
        clearInterval(timer);
        return;
      }
      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPreMatch, apiData?.scheduled_at]);

  const homeTeam = useMemo(() => {
    return { 
      name: apiData?.home_team_name || apiData?.home_team?.name || 'TBD', 
      logo: getSafeTeamLogo(apiData?.home_team?.id, apiData?.home_team_logo, apiTeams),
      id: apiData?.home_team?.id 
    };
  }, [apiData, apiTeams]);

  const awayTeam = useMemo(() => {
    return { 
      name: apiData?.away_team_name || apiData?.away_team?.name || 'TBD', 
      logo: getSafeTeamLogo(apiData?.away_team?.id, apiData?.away_team_logo, apiTeams),
      id: apiData?.away_team?.id
    };
  }, [apiData, apiTeams]);

  if (loading && !apiData) {
    return (
      <div className="flex flex-col min-h-screen bg-black relative overflow-hidden">
        <MainNavbar />
        <div className="fixed inset-0 z-0">
          <Image src="https://i.ibb.co/YCB7X52/obraz-2026-06-13-150303737.png" alt="Stadium Background" fill className="object-cover brightness-[0.7]" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-600/20 rounded-full blur-[120px]" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-6 relative z-10">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white/40 font-black uppercase tracking-[0.3em] text-xs">Ładowanie danych...</span>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <MainNavbar />
      <main className="min-h-screen pt-44 pb-20 px-4 md:px-8 relative overflow-hidden bg-black selection:bg-blue-500/30">
        <div className="fixed inset-0 z-0">
          <Image src="https://i.ibb.co/YCB7X52/obraz-2026-06-13-150303737.png" alt="Stadium Background" fill className="object-cover brightness-[0.7]" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-600/20 rounded-full blur-[120px]" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <Link href="/terminarz" className="inline-flex items-center gap-2 text-blue-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-12 group">
             <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
             WRÓĆ DO TERMINARZA
          </Link>

          <div className="bg-[#0a1121]/90 backdrop-blur-3xl border border-white/5 rounded-[48px] p-8 md:p-16 mb-12 relative overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.05] to-transparent opacity-50"></div>
            <div className="relative z-10">
              <div className="text-center text-blue-500/60 text-[10px] font-black uppercase tracking-[0.6em] mb-12 italic flex items-center justify-center gap-4">
                <span className="w-12 h-px bg-blue-500/20"></span>
                1 LIGA DZIAŁDOWSKA • KOLEJKA {apiData?.round || '?'}
                <span className="w-12 h-px bg-blue-500/20"></span>
              </div>
              
              <div className="flex items-center justify-center max-w-6xl mx-auto gap-8 md:gap-24">
                <div className="flex flex-col items-center group">
                  <div className="relative w-16 h-16 md:w-24 md:h-24 shrink-0 transition-all duration-700 group-hover:scale-110 group-hover:rotate-3">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {homeTeam.logo && <img src={homeTeam.logo} alt="" className="w-full h-full object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.2)] relative z-10" />}
                  </div>
                  <h2 className="mt-6 text-white text-[10px] md:text-sm font-black uppercase tracking-[0.2em] italic group-hover:text-blue-500 transition-colors text-center max-w-[120px]">{homeTeam.name}</h2>
                </div>

                <div className="shrink-0 flex flex-col items-center">
                  {isPreMatch ? (
                    <div className="text-4xl md:text-[4rem] font-black text-blue-500 tracking-tighter italic opacity-90 select-none drop-shadow-[0_0_40px_rgba(59,130,246,0.4)] animate-pulse-slow">VS</div>
                  ) : (
                    <div className="flex flex-col items-center gap-6">
                      <div className="bg-[#0c162d]/80 border border-white/10 px-8 py-4 md:px-10 md:py-6 rounded-[3rem] flex flex-col items-center shadow-2xl backdrop-blur-2xl ring-1 ring-white/5 relative">
                        {isMatchActive && !(liveData?.status === 'halftime' || liveData?.period === 'halftime' || apiData?.period === 'halftime' || apiData?.status === 'halftime') && (
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.4)] border border-red-400/30 flex items-center justify-center animate-bounce-slow">
                            <span className={cn("text-sm font-black italic tracking-widest tabular-nums", calculateMatchTime() === 'PRZERWA' ? 'text-yellow-400' : '')}>
                              {calculateMatchTime()}
                            </span>
                          </div>
                        )}
                        <div className="text-4xl md:text-[4.5rem] font-black text-white tracking-tighter tabular-nums leading-none italic drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                          {liveData?.score ? `${liveData.score.home}:${liveData.score.away}` : `${apiData?.home_score ?? 0}:${apiData?.away_score ?? 0}`}
                        </div>
                        {isMatchActive && (
                           <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-5 py-2 rounded-full flex items-center gap-3 shadow-[0_0_30px_rgba(220,38,38,0.5)] border border-red-400/30 ring-4 ring-black/40">
                             <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]"></div>
                             <span className="text-[11px] font-black tracking-widest italic uppercase tabular-nums whitespace-nowrap">
                               LIVE • <span className={calculateMatchTime() === 'PRZERWA' ? 'text-yellow-500 animate-pulse' : ''}>{calculateMatchTime()}</span>
                             </span>
                           </div>
                        )}
                      </div>
                      {isMatchActive && (
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.5em] italic animate-pulse">NA ŻYWO</span>
                          <span className="text-white/20 text-[8px] font-black uppercase tracking-[0.2em]">{liveData?.period_label || (apiData?.period === 'first_half' ? '1. POŁOWA' : (apiData?.period === 'halftime' ? 'PRZERWA' : '2. POŁOWA'))}</span>
                        </div>
                      )}
                      {isMatchFinished && (
                        <span className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em] italic">ZAKOŃCZONY</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center group">
                  <div className="relative w-16 h-16 md:w-24 md:h-24 shrink-0 transition-all duration-700 group-hover:scale-110 group-hover:-rotate-3">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {awayTeam.logo && <img src={awayTeam.logo} alt="" className="w-full h-full object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.2)] relative z-10" />}
                  </div>
                  <h2 className="mt-6 text-white text-[10px] md:text-sm font-black uppercase tracking-[0.2em] italic group-hover:text-blue-500 transition-colors text-center max-w-[120px]">{awayTeam.name}</h2>
                </div>
              </div>

              <div className="flex flex-col items-center mt-20 gap-14">
                <div className="flex flex-wrap justify-center items-center gap-12 text-blue-400/80 text-[11px] font-black uppercase tracking-[0.4em] border border-white/5 py-8 px-20 rounded-[3rem] bg-white/[0.02] backdrop-blur-2xl shadow-2xl ring-1 ring-white/5">
                  <div className="flex items-center gap-4 group hover:text-white transition-all cursor-default">
                    <Calendar className="w-4 h-4 text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    {apiData?.date_formatted ? `${formatMatchDate(apiData.date_formatted)}, ${apiData.time_formatted || '18:00'}` : (apiData?.scheduled_at ? `${new Date(apiData.scheduled_at).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}, 18:00` : 'ZAPLANOWANY')}
                  </div>
                  <div className="w-px h-6 bg-white/5"></div>
                  <div className="flex items-center gap-4 group hover:text-white transition-all cursor-default">
                    <MapPin className="w-4 h-4 text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    {apiData?.venue_name || 'STADION MIEJSKI, DZIAŁDOWO'}
                  </div>
                </div>

                {isPreMatch && (
                  <div className="flex flex-col items-center w-full max-w-4xl">
                    <div className="text-white/10 text-[10px] font-black uppercase tracking-[1em] mb-12 ml-[1em]">DO ROZPOCZĘCIA MECZU POZOSTAŁO</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
                      {[
                        { val: countdown.days, label: 'DNI' },
                        { val: countdown.hours, label: 'GODZ.' },
                        { val: countdown.minutes, label: 'MIN.' },
                        { val: countdown.seconds, label: 'SEK.' }
                      ].map((t, i) => (
                        <div key={i} className="flex flex-col items-center bg-[#0c162d]/60 border border-white/5 rounded-[2.5rem] px-12 py-10 shadow-2xl group hover:bg-[#0c162d]/80 transition-all relative overflow-hidden backdrop-blur-xl ring-1 ring-white/5">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <span className="text-6xl md:text-7xl font-black text-white tracking-tighter mb-2 italic drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">{String(t.val).padStart(2, '0')}</span>
                          <div className="h-px w-8 bg-blue-500/30 mb-2"></div>
                          <span className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">{t.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-center mt-24 border-t border-white/5 pt-12">
              <div className="flex items-center gap-4 md:gap-16 flex-wrap justify-center">
                {(isPreMatch 
                  ? [
                    { id: 'zapowiedź', label: 'ZAPOWIEDŹ', icon: Calendar },
                    { id: 'składy', label: 'SKŁADY', icon: Users },
                    { id: 'h2h', label: 'H2H', icon: Trophy }
                  ]
                  : [
                    { id: 'składy', label: 'SKŁADY', icon: Users },
                    { id: 'relacja', label: 'PRZEBIEG MECZU', icon: Trophy },
                    { id: 'komentarz', label: 'KOMENTARZ', icon: MessageSquare }
                  ]
                ).map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-3 px-8 py-4 transition-all relative group rounded-2xl ${activeTab === tab.id ? 'text-white bg-blue-600/20 border border-blue-500/30' : 'text-white/30 hover:text-white'}`}>
                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-500' : 'text-white/20'}`} />
                    <span className="font-black text-[10px] uppercase tracking-[0.25em]">{tab.label}</span>
                    {activeTab === tab.id && <div className="absolute -bottom-[50px] left-0 right-0 h-1 bg-blue-500 rounded-full"></div>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {isPreMatch ? (
              <UpcomingView activeTab={activeTab} homeTeam={homeTeam} awayTeam={awayTeam} apiTeams={apiTeams} apiData={apiData} refereeData={refereeData} allMatches={allMatches} lineupData={lineupData} liveData={liveData} />
            ) : (
              <LiveView activeTab={activeTab} homeTeam={homeTeam} awayTeam={awayTeam} apiData={apiData} eventsData={{ goals: [], cards: [], substitutions: [] }} lineupData={lineupData} liveData={liveData} allPlayers={allPlayers} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
