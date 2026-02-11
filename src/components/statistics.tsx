'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { teams, mockPlayersData } from '@/lib/data';
import { TEAM_ID_MAPPING } from '@/lib/constants';
import { useMatchStats, getTeamLogo, getTeamName } from '@/lib/useMatchStats';
import { RobloxAvatar } from './roblox-avatar';

interface StatItem {
  id: string | number;
  name: string;
  teamName: string;
  teamLogo: string;
  value: string | number;
  avatarUrl?: string;
}

const StatCard = ({ title, items, color = "green", isTeam = false }: { title: string, items: StatItem[], color?: string, isTeam?: boolean }) => {
  return (
    <div className="bg-white/15 backdrop-blur-2xl rounded-[32px] p-8 border border-white/20 flex flex-col h-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:bg-white/20 transition-all duration-500 group/card relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 rounded-full group-hover/card:bg-white/20 transition-all duration-500" />
      
      <div className="flex items-center justify-between mb-10 group cursor-pointer relative z-10">
        <h3 className="text-white font-black text-2xl tracking-tighter uppercase italic drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">{title}</h3>
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/20 transition-all">
          <svg className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      <div className="space-y-8 relative z-10">
        {items.map((item, idx) => (
          <div key={`${item.id}-${idx}`} className="flex items-center justify-between group/item">
            <div className="flex items-center gap-5">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-black/20 border border-white/10 shrink-0 flex items-center justify-center p-2 group-hover/item:scale-110 group-hover/item:border-white/30 transition-all duration-500 shadow-xl">
                {isTeam ? (
                  <div className="relative w-full h-full">
                    <img 
                      src={item.teamLogo} 
                      alt={item.name} 
                      className="w-full h-full object-contain drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://i.ibb.co/TB027G07/czarnepff-1.png';
                      }}
                    />
                  </div>
                ) : (
                  <RobloxAvatar
                    username={item.name}
                    className="w-full h-full object-cover scale-150 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                  />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-white font-black text-[18px] truncate uppercase tracking-tighter italic group-hover/item:text-blue-400 transition-colors">{item.name}</span>
                <div className="flex items-center gap-2 mt-1">
                  {!isTeam && (
                    <div className="w-10 h-10 bg-white/5 rounded-md p-1.5 flex items-center justify-center shrink-0 border border-white/10 shadow-sm">
                      <img 
                        src={item.teamLogo} 
                        alt={item.teamName} 
                        className="w-full h-full object-contain brightness-125" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://i.ibb.co/TB027G07/czarnepff-1.png';
                        }}
                      />
                    </div>
                  )}
                  <span className="text-white/40 text-[11px] truncate font-black uppercase tracking-[0.1em] italic">{item.teamName}</span>
                </div>
              </div>
            </div>
            <div className={`px-5 py-2 rounded-xl min-w-[56px] text-center shrink-0 shadow-[0_10px_20px_rgba(0,0,0,0.2)] border border-white/10 ${
              color === 'green' ? 'bg-[#22c55e] text-white' : 
              color === 'yellow' ? 'bg-[#eab308] text-white' : 
              color === 'red' ? 'bg-[#ef4444] text-white' : 
              'bg-white/10 backdrop-blur-md text-white'
            }`}>
              <span className="text-[18px] font-black italic">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export function Statistics() {
  const { topScorers, standings } = useMatchStats();
  const [activeType, setActiveType] = useState<'gracze' | 'druzyny'>('gracze');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const players = useMemo(() => {
    return []; // Zmiana na życzenie: wyzerowanie statystyk graczy
  }, [topScorers]);

  const teamStats = useMemo(() => {
    return []; // Zmiana na życzenie: wyzerowanie statystyk drużyn
  }, [standings]);

  if (!mounted) return null;

  // Player Data
  const topScorersData = [...players].sort((a, b) => b.goals - a.goals).slice(0, 3).map(p => ({
    id: p.playerId,
    name: p.name,
    teamName: p.teamName,
    teamLogo: p.teamLogo,
    value: p.goals
  }));

  const topAssistsData = [...players].sort((a, b) => b.assists - a.assists).slice(0, 3).map(p => ({
    id: p.playerId,
    name: p.name,
    teamName: p.teamName,
    teamLogo: p.teamLogo,
    value: p.assists
  }));

  const topPointsData = [...players].sort((a, b) => b.points - a.points).slice(0, 3).map(p => ({
    id: p.playerId,
    name: p.name,
    teamName: p.teamName,
    teamLogo: p.teamLogo,
    value: p.points
  }));

  const topRatingData = [...players].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating)).slice(0, 3).map(p => ({
    id: p.playerId,
    name: p.name,
    teamName: p.teamName,
    teamLogo: p.teamLogo,
    value: p.rating
  }));

  const topMinutesData = [...players].sort((a, b) => b.minutes - a.minutes).slice(0, 3).map(p => ({
    id: p.playerId,
    name: p.name,
    teamName: p.teamName,
    teamLogo: p.teamLogo,
    value: p.minutes
  }));

  // Team Data
  const topTeamGoalsData = [...teamStats].sort((a, b) => b.goalsFor - a.goalsFor).slice(0, 3).map(t => ({
    id: t.id,
    name: t.name,
    teamName: t.teamName,
    teamLogo: t.teamLogo,
    value: t.goalsFor
  }));

  const topTeamDefenseData = [...teamStats].sort((a, b) => a.goalsAgainst - b.goalsAgainst).slice(0, 3).map(t => ({
    id: t.id,
    name: t.name,
    teamName: t.teamName,
    teamLogo: t.teamLogo,
    value: t.goalsAgainst
  }));

  const topTeamPointsData = [...teamStats].sort((a, b) => b.points - a.points).slice(0, 3).map(t => ({
    id: t.id,
    name: t.name,
    teamName: t.teamName,
    teamLogo: t.teamLogo,
    value: t.points
  }));

  return (
    <div className="w-full max-w-7xl mx-auto py-12 px-4 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] bg-blue-600/20 blur-[180px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-400/10 blur-[150px] pointer-events-none -z-10" />
      <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] pointer-events-none -z-10" />

      {/* Logo Section */}
      <div className="mb-12 flex justify-center">
        <div className="relative group">
          <Image
            src="https://i.ibb.co/MyfXtGLH/ekstraklasabaner-removebg-preview.png"
            alt="7U7 Ekstraklasa"
            width={400}
            height={100}
            className="h-16 md:h-24 w-auto object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-[40px] p-20 border border-white/10 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-cyan-600/10 opacity-50" />
        <div className="relative z-10">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform duration-500">
            <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic mb-4 drop-shadow-2xl">
            Liga nie została zaczęta
          </h3>
          <p className="text-white/40 font-bold uppercase tracking-[0.3em] text-sm">
            Statystyki pojawią się po pierwszym gwizdku
          </p>
        </div>
      </div>
    </div>
  );
}

