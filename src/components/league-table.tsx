'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { standings as defaultStandings, teams } from '@/lib/data';
import { useMatchStats } from '@/lib/useMatchStats';
import { API_ENDPOINTS, TEAM_ID_MAPPING } from '@/lib/constants';

// Centralized helper functions for team logos and colors to ensure consistency
function getConsistentTeamLogo(teamId: string, teamName?: string): string {
  if (teamName) {
    const normalizedName = teamName.toLowerCase();
    
    // First try exact match
    const exactMatch = teams.find(t => 
      t.name.toLowerCase() === normalizedName || 
      t.shortName.toLowerCase() === normalizedName
    );
    if (exactMatch) return exactMatch.logo;

    // Then try partial match
    const teamByName = teams.find(t => {
      const tName = t.name.toLowerCase();
      const tShort = t.shortName.toLowerCase();
      return normalizedName.includes(tName) || 
             tName.includes(normalizedName);
    });
    if (teamByName) return teamByName.logo;
  }
  
  // Use mapping or direct ID
  const shortName = TEAM_ID_MAPPING[teamId] || teamId;
  const team = teams.find(t => t.id === shortName || t.shortName === shortName);
  return team?.logo || 'https://i.ibb.co/zgFJ7yt/obraz-2026-02-14-195348653.png';
}

function getConsistentTeamColor(teamId: string, teamName?: string): string {
  if (teamName) {
    const normalizedName = teamName.toLowerCase();

    // First try exact match
    const exactMatch = teams.find(t => 
      t.name.toLowerCase() === normalizedName || 
      t.shortName.toLowerCase() === normalizedName
    );
    if (exactMatch) return exactMatch.color || '#3b82f6';

    // Then try partial match
    const teamByName = teams.find(t => {
      const tName = t.name.toLowerCase();
      const tShort = t.shortName.toLowerCase();
      return normalizedName.includes(tName) || 
             tName.includes(normalizedName);
    });
    if (teamByName) return teamByName.color || '#3b82f6';
  }

  const shortName = TEAM_ID_MAPPING[teamId] || teamId;
  const team = teams.find(t => t.id === shortName || t.shortName === shortName);
  return team?.color || '#3b82f6';
}

export function LeagueTable({ isInTab = false, compact = false, highlightId }: { isInTab?: boolean; compact?: boolean; highlightId?: string } = {}) {
   const { standings: realStandings } = useMatchStats();
   const [localStandings, setLocalStandings] = useState<any[]>([]);
   const [apiStandings, setApiStandings] = useState<any[]>([]);
   const [loadingTable, setLoadingTable] = useState(true);

  useEffect(() => {
    const loadLocal = () => {
      const data = localStorage.getItem('standings');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.length > 0) {
          setLocalStandings(parsed.map((s: any, idx: number) => {
            const teamId = s.teamId?.toString() || (s.team?.id)?.toString();
            const shortName = TEAM_ID_MAPPING[teamId] || teamId;
            
            return {
              ...s,
              position: idx + 1,
              team: s.team || teams.find(t => t.id === shortName) || {
                id: shortName,
                name: s.teamId,
                shortName: shortName.substring(0, 3),
                logo: getConsistentTeamLogo(teamId),
                color: getConsistentTeamColor(teamId)
              }
            };
          }));
        }
      }
    };

    loadLocal();

    const handleStorageChange = () => {
      loadLocal();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const fetchTable = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.TABLE);
        if (response.ok) {
          const data = await response.json();
          console.log('Table data:', data);
          // The API returns data directly as an array
          const tableData = Array.isArray(data) ? data : (data.table || data.standings || []);
          if (Array.isArray(tableData) && tableData.length > 0) {
            const mappedTable = tableData.map((item: any, index: number) => {
              const teamId = item.id?.toString() || item.teamId?.toString() || `team_${index}`;
              const shortName = TEAM_ID_MAPPING[teamId] || item.name?.substring(0, 3).toUpperCase() || 'UNK';

              return {
                position: index + 1,
                team: {
                  id: shortName,
                  name: item.name || `Team ${index + 1}`,
                  shortName: shortName,
                  logo: getConsistentTeamLogo(teamId, item.name),
                  color: getConsistentTeamColor(teamId, item.name)
                },
                played: item.played || 0,
                won: item.won || 0,
                drawn: item.drawn || 0,
                lost: item.lost || 0,
                goalsFor: item.goalsFor || 0,
                goalsAgainst: item.goalsAgainst || 0,
                goalDifference: item.goalDifference || (item.goalsFor - item.goalsAgainst) || 0,
                points: item.points || 0
              };
            });
            setApiStandings(mappedTable);
          }
        } else {
          console.error('Failed to fetch table');
        }
      } catch (error) {
        console.error('Error fetching table:', error);
      } finally {
        setLoadingTable(false);
      }
    };

    fetchTable();
  }, []);

  const allStandings = apiStandings.length > 0 ? apiStandings : (localStandings.length > 0 ? localStandings : (realStandings.length > 0 ? realStandings.map((s, idx) => {
    const teamId = s.teamId?.toString();
    const shortName = TEAM_ID_MAPPING[teamId] || teamId;
    return {
      ...s,
      position: idx + 1,
      team: s.team || teams.find(t => t.id === shortName) || {
        id: shortName,
        name: s.teamId, // Fallback name
        shortName: shortName.substring(0, 3),
        logo: getConsistentTeamLogo(teamId),
        color: getConsistentTeamColor(teamId)
      }
    };
  }) : defaultStandings.map((s, idx) => ({
    ...s,
    team: {
      ...s.team,
      logo: getConsistentTeamLogo(s.team.id, s.team.name),
      color: getConsistentTeamColor(s.team.id, s.team.name)
    }
  }))));

  const standings = allStandings;

  if (loadingTable && apiStandings.length === 0) {
    return (
      <div className="text-center py-20 bg-transparent rounded-lg">
        <p className="text-gray-400">Ładowanie tabeli...</p>
      </div>
    );
  }

  const content = (
    <>
      <div className={`w-full mx-auto ${compact ? 'space-y-1.5' : 'space-y-3'}`}>
        {/* Header - only if not compact or if we want labels */}
        <div className={`flex items-center gap-5 ${compact ? 'px-3 py-1' : 'px-6 py-2'} text-gray-400 font-bold text-xs uppercase tracking-wider`}>
          <div className={`${compact ? 'w-8' : 'w-12'} text-center`}>#</div>
          <div className="flex-1">Drużyna</div>
          <div className="flex items-center gap-2 md:gap-4 text-center mr-2">
            <div className="w-8">M</div>
            {!compact && (
              <>
                <div className="w-8 hidden sm:block">Z</div>
                <div className="w-8 hidden sm:block">R</div>
                <div className="w-8 hidden sm:block">P</div>
                <div className="w-12 hidden md:block">Gole</div>
              </>
            )}
            <div className="w-10 text-white">Pkt</div>
          </div>
        </div>

        {standings.map((standing, index) => {
          let gradientColor = '#3b82f6';
          if (standing.position === 1) {
            gradientColor = '#FFD700'; // Złoty
          } else if (standing.position === 2) {
            gradientColor = '#C0C0C0'; // Srebrny
          } else if (standing.position === 3) {
            gradientColor = '#CD7F32'; // Brązowy
          } else if (standing.position >= 11) {
            gradientColor = '#ef4444'; // Czerwony dla spadku
          }


          const isHighlighted = 
            standing.team?.id === highlightId || 
            standing.team?.shortName === highlightId ||
            (standing.team?.name && highlightId && 
             (standing.team.name.toLowerCase().includes(highlightId.toLowerCase()) || 
              highlightId.toLowerCase().includes(standing.team.name.toLowerCase())));

          return (
            <Link
              href={standing.team ? `/klub/${standing.team.id}` : '#'}
              key={`standing-${standing.position}`}
              className={`block ${standing.team ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div
                className={`relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.01] border-l-4 ${
                  isHighlighted
                  ? 'border-blue-500 bg-blue-600/30 shadow-[0_0_25px_rgba(59,130,246,0.3)]' 
                  : 'border-white/5 bg-black/40'
                } ${compact ? 'py-2' : 'py-3'} backdrop-blur-md hover:bg-black/60`}
              >
                <div className={`relative z-10 ${compact ? 'px-3' : 'px-6'} flex items-center gap-5`}>
                  <div className={`flex items-center justify-center ${compact ? 'w-8 h-8' : 'w-12 h-12'} rounded-full font-black ${compact ? 'text-xs' : 'text-xl'} shrink-0 ${
                    standing.position === 1 ? 'bg-yellow-500/80 text-white' :
                    standing.position === 2 ? 'bg-gray-400/80 text-white' :
                    standing.position === 3 ? 'bg-orange-700/80 text-white' :
                    standing.position >= 11 ? 'bg-red-500/80 text-white' :
                    'bg-white/10 text-white'
                  }`}>
                    {standing.position}
                  </div>

                  {standing.team ? (
                    <>
                      <div className="relative shrink-0">
                        {/* Team color glow removed */}
                        <Image
                          src={standing.team.logo}
                          alt={standing.team.name}
                          width={compact ? 32 : 44}
                          height={compact ? 32 : 44}
                          className="relative z-10"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className={`font-black text-white ${compact ? 'text-[10px] sm:text-sm' : 'text-lg'} uppercase tracking-tight truncate`}>
                          {standing.team.name}
                        </h3>
                      </div>

                      <div className={`flex items-center gap-2 md:gap-4 text-center font-bold ${compact ? 'text-xs' : 'text-sm'} shrink-0 mr-2`}>
                        <div className="w-8 text-white/70">{standing.played}</div>
                        {!compact && (
                          <>
                            <div className="w-8 text-green-400/70 hidden sm:block">{standing.won}</div>
                            <div className="w-8 text-yellow-400/70 hidden sm:block">{standing.drawn}</div>
                            <div className="w-8 text-red-400/70 hidden sm:block">{standing.lost}</div>
                            <div className="w-12 text-white/50 hidden md:block">{standing.goalsFor}:{standing.goalsAgainst}</div>
                          </>
                        )}
                        <div className={`w-10 ${compact ? 'text-sm' : 'text-xl'} font-black text-white`}>{standing.points}</div>
                      </div>
                    </>
                  ) : (
                    <span className="text-gray-600 text-sm font-bold">-</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
<div className="mt-6 flex items-center justify-center gap-6 text-xs flex-wrap">
<div className="flex items-center gap-2">
<div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center font-black text-white text-sm">1</div>
<span className="text-white font-bold">Mistrz</span>
</div>
<div className="flex items-center gap-2">
<div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center font-black text-white text-sm">2</div>
<span className="text-white font-bold">Wicemistrz</span>
</div>
<div className="flex items-center gap-2">
<div className="w-8 h-8 bg-orange-700 rounded-full flex items-center justify-center font-black text-white text-sm">3</div>
<span className="text-white font-bold">3. miejsce</span>
</div>
<div className="flex items-center gap-2">
<div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center font-black text-white text-sm">11</div>
<span className="text-white font-bold">Spadek</span>
</div>
</div>
    </>
  );

  if (isInTab) {
    return <div className="">{content}</div>;
  }

  return (
    <section id="tabela" className="py-16">
      <div className="container mx-auto px-4">
        {content}
      </div>
    </section>
  );
}
