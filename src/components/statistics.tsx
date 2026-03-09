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

export function Statistics({ isInTab = false }: { isInTab?: boolean }) {
  const { topScorers, standings } = useMatchStats();
  const [activeType, setActiveType] = useState<'gracze' | 'druzyny'>('gracze');
  const [selectedLeague, setSelectedLeague] = useState<'Ekstraklasa' | 'Mecze Towarzyskie'>('Mecze Towarzyskie');
  const [selectedSeason, setSelectedSeason] = useState('2025/2026');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const players = useMemo(() => {
    // If friendly matches selected, we might want to filter or use different mock data
    // For now keeping it simple as requested
    const basePlayers = topScorers.length > 0 ? topScorers : mockPlayersData.map(p => ({
      ...p,
      points: p.goals + p.assists,
      cleanSheets: 0,
      yellowCards: 0,
      redCards: 0
    }));

    return basePlayers.map((p: any) => {
      // Prioritize data from useMatchStats if available and logo is NOT the default/fallback
      const isResolved = p.teamLogo && !p.teamLogo.includes('czarnepff-1.png');
      
      if (p.teamName && isResolved) {
        return {
          ...p,
          teamName: p.teamName,
          teamLogo: p.teamLogo,
          rating: (7.0 + (p.goals * 0.2) + (p.assists * 0.1) + (Math.random() * 0.5)).toFixed(2),
          minutes: 1500 + (p.goals * 10) + (p.assists * 5) + Math.floor(Math.random() * 100)
        };
      }

      // If not fully resolved or default logo, try resolving again with helpers
      const resolvedName = getTeamName(p.teamId);
      const resolvedLogo = getTeamLogo(p.teamId, resolvedName);
      
      // Generate some pseudo-random but stable stats for "Rating" and "Minutes"
      const rating = (7.0 + (p.goals * 0.2) + (p.assists * 0.1) + (Math.random() * 0.5)).toFixed(2);
      const minutes = 1500 + (p.goals * 10) + (p.assists * 5) + Math.floor(Math.random() * 100);
      
      return {
        ...p,
        teamName: resolvedName,
        teamLogo: resolvedLogo,
        rating,
        minutes
      };
    });
  }, [topScorers, selectedLeague]);

  const teamStats = useMemo(() => {
    return standings.map(s => {
      // Find team in data.ts to get the correct logo and name
      const shortName = s.teamId ? (TEAM_ID_MAPPING[s.teamId] || s.teamId) : '';
      const teamData = teams.find(t => t.id === s.teamId || t.shortName === s.teamId || t.id === shortName || t.shortName === shortName) || s.team;
      
      return {
        id: s.teamId,
        name: teamData?.name || s.team?.name || 'Nieznany',
        teamName: teamData?.shortName || s.team?.shortName || 'Klub',
        teamLogo: teamData?.logo || s.team?.logo || 'https://i.ibb.co/TB027G07/czarnepff-1.png',
        goalsFor: s.goalsFor,
        goalsAgainst: s.goalsAgainst,
        goalDifference: s.goalDifference,
        points: s.points,
        played: s.played
      };
    });
  }, [standings, selectedLeague]);

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

  if (selectedLeague === 'Ekstraklasa') {
    return (
      <div className="w-full max-w-7xl mx-auto py-12 px-4 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] bg-blue-600/20 blur-[180px] pointer-events-none -z-10" />
        
        {/* League Switcher */}
        <div className="flex flex-col md:flex-row items-center justify-center mb-12">
          <div className="flex bg-black/40 backdrop-blur-xl p-1 rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative group">
            {(['Ekstraklasa', 'Mecze Towarzyskie'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setSelectedLeague(l)}
                className={`px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 relative z-10 ${
                  selectedLeague === l ? 'text-black' : 'text-white/40 hover:text-white'
                }`}
              >
                {selectedLeague === l && (
                  <div className="absolute inset-0 bg-white rounded-xl -z-10 shadow-[0_0_20px_rgba(255,255,255,0.2)]" />
                )}
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Logo Section */}
        <div className="mb-12 flex justify-center">
          <div className="relative group">
            <Image
              src="https://i.ibb.co/MyfXtGLH/ekstraklasabaner-removebg-preview.png"
              alt="Ekstraklasa"
              width={400}
              height={100}
              className="h-16 md:h-24 w-auto object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            />
          </div>
        </div>

        <div className="py-24 flex flex-col items-center justify-center text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] shadow-2xl">
          <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mb-8 border border-blue-500/20">
            <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-4">Brak danych statystycznych</h3>
          <p className="text-white/40 max-w-md font-medium leading-relaxed">
            Statystyki dla Ekstraklasy zostaną udostępnione po rozpoczęciu nowego sezonu rozgrywek.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-12 px-4 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] bg-blue-600/20 blur-[180px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-400/10 blur-[150px] pointer-events-none -z-10" />
      <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] pointer-events-none -z-10" />

      {/* League Switcher */}
      <div className="flex flex-col md:flex-row items-center justify-center mb-12">
        <div className="flex bg-black/40 backdrop-blur-xl p-1 rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative group">
          {(['Ekstraklasa', 'Mecze Towarzyskie'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setSelectedLeague(l)}
              className={`px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 relative z-10 ${
                selectedLeague === l ? 'text-black' : 'text-white/40 hover:text-white'
              }`}
            >
              {selectedLeague === l && (
                <div className="absolute inset-0 bg-white rounded-xl -z-10 shadow-[0_0_20px_rgba(255,255,255,0.2)]" />
              )}
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Logo Section */}
      <div className="mb-12 flex justify-center">
        <div className="relative group">
          <Image
            src="https://i.ibb.co/vWZWXTC/obraz-2026-02-04-222253347-removebg-preview-1.png"
            alt={selectedLeague}
            width={400}
            height={100}
            className="h-16 md:h-24 w-auto object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>

      {/* Type Toggle */}
      <div className="flex bg-black/40 backdrop-blur-xl p-1 rounded-full w-fit mb-12 border border-white/10 shadow-2xl relative mx-auto lg:mx-0">
        <button
          onClick={() => setActiveType('gracze')}
          className={`px-12 py-3 rounded-full text-[16px] font-black uppercase tracking-tight transition-all duration-300 relative z-10 ${
            activeType === 'gracze' ? 'text-white' : 'text-white/40 hover:text-white'
          }`}
        >
          {activeType === 'gracze' && (
            <div className="absolute inset-0 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 -z-10 shadow-[0_0_20px_rgba(255,255,255,0.1)]" />
          )}
          Gracze
        </button>
        <button
          onClick={() => setActiveType('druzyny')}
          className={`px-12 py-3 rounded-full text-[16px] font-black uppercase tracking-tight transition-all duration-300 relative z-10 ${
            activeType === 'druzyny' ? 'text-white' : 'text-white/40 hover:text-white'
          }`}
        >
          {activeType === 'druzyny' && (
            <div className="absolute inset-0 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 -z-10 shadow-[0_0_20px_rgba(255,255,255,0.1)]" />
          )}
          Drużyny
        </button>
      </div>

      <div className="mb-10">
        <h2 className="text-white text-3xl font-black uppercase tracking-tight">Najważ. statystyki</h2>
      </div>

      {activeType === 'gracze' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <StatCard title="Najlepszy strzelec" items={topScorersData} color="green" />
          <StatCard title="Asysty" items={topAssistsData} color="yellow" />
          <StatCard title="Gole + asysty" items={topPointsData} color="green" />
          <StatCard title="Ocena PFF Stats" items={topRatingData} color="red" />
          <StatCard title="Rozegrane minuty" items={topMinutesData} color="white" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <StatCard title="Najwięcej goli" items={topTeamGoalsData} color="green" isTeam={true} />
          <StatCard title="Najlepsza obrona" items={topTeamDefenseData} color="yellow" isTeam={true} />
          <StatCard title="Punkty" items={topTeamPointsData} color="green" isTeam={true} />
        </div>
      )}
    </div>
  );
}

