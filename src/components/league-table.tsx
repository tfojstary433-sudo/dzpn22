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
  return team?.logo || 'https://i.ibb.co/TB027G07/czarnepff-1.png';
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
              const teamId = (item.id || item.team_id || item.teamId)?.toString() || `team_${index}`;
              const shortName = item.short_name || TEAM_ID_MAPPING[teamId] || item.name?.substring(0, 3).toUpperCase() || 'UNK';

              return {
                position: index + 1,
                team: {
                  id: teamId,
                  name: item.name || `Team ${index + 1}`,
                  shortName: shortName,
                  logo: item.team_logo_url || item.logo_url || getConsistentTeamLogo(teamId, item.name),
                  color: item.color || getConsistentTeamColor(teamId, item.name)
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
      <div className={`w-full mx-auto ${compact ? 'space-y-2' : 'space-y-3'}`}>
        {standings.map((standing, index) => {
          return (
            <Link
              href={standing.team ? `/klub/${standing.team.id}` : '#'}
              key={`standing-${standing.position}`}
              className={`block ${standing.team ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div
              className={`relative overflow-hidden rounded-2xl border border-white/10 ${
                standing.team?.id === highlightId || standing.team?.shortName === highlightId
                ? 'bg-blue-600/30 border-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]' 
                : 'bg-[#0b1629]/80 hover:bg-[#152440] transition-all duration-300'
              } ${compact ? 'p-3' : 'p-4'} shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-md group hover:translate-y-[-2px] hover:border-white/20`}
            >
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4 sm:gap-6 flex-1">
                  {/* Position Circle */}
                  <div className={`flex items-center justify-center ${compact ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-lg'} rounded-full font-black shrink-0 shadow-lg ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black shadow-yellow-500/20' : 
                    index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-black shadow-slate-400/20' : 
                    index === 2 ? 'bg-gradient-to-br from-orange-700 to-orange-900 text-white shadow-orange-800/20' : 
                    'bg-[#1a2b4b] text-white/40 border border-white/5'
                  }`}>
                    {standing.position}
                  </div>

                  {standing.team ? (
                    <>
                      <div className="shrink-0 group-hover:scale-110 transition-transform duration-500">
                        <Image
                          src={standing.team.logo}
                          alt={standing.team.name}
                          width={compact ? 36 : 48}
                          height={compact ? 36 : 48}
                          className="relative z-10 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className={`font-black text-white ${compact ? 'text-sm sm:text-base' : 'text-lg sm:text-2xl'} tracking-tight truncate leading-none`}>
                          {standing.team.name}
                        </h3>
                      </div>
                    </>
                  ) : null}
                </div>

                {standing.team && (
                  <div className="flex items-center gap-4 sm:gap-10">
                    <div className="flex items-center gap-0">
                      <div className="flex flex-col items-center w-8 sm:w-10">
                        <span className="text-[7px] text-white/20 font-bold uppercase tracking-widest mb-1">M</span>
                        <span className="text-xs sm:text-sm font-bold text-white leading-none">{standing.played}</span>
                      </div>
                      {!compact && (
                        <>
                          <div className="flex flex-col items-center w-8 sm:w-10 border-l border-white/5">
                            <span className="text-[7px] text-white/20 font-bold uppercase tracking-widest mb-1">W</span>
                            <span className="text-xs sm:text-sm font-bold text-green-500 leading-none">{standing.won}</span>
                          </div>
                          <div className="flex flex-col items-center w-8 sm:w-10 border-l border-white/5">
                            <span className="text-[7px] text-white/20 font-bold uppercase tracking-widest mb-1">R</span>
                            <span className="text-xs sm:text-sm font-bold text-yellow-500 leading-none">{standing.drawn}</span>
                          </div>
                          <div className="flex flex-col items-center w-8 sm:w-10 border-l border-white/5">
                            <span className="text-[7px] text-white/20 font-bold uppercase tracking-widest mb-1">P</span>
                            <span className="text-xs sm:text-sm font-bold text-red-500 leading-none">{standing.lost}</span>
                          </div>
                          <div className="flex flex-col items-center w-10 sm:w-14 border-l border-white/5">
                            <span className="text-[7px] text-white/20 font-bold uppercase tracking-widest mb-1">+/-</span>
                            <span className={`text-xs sm:text-sm font-bold leading-none ${
                              standing.goalDifference > 0 ? 'text-green-500' : 
                              standing.goalDifference < 0 ? 'text-red-500' : 'text-white'
                            }`}>
                              {standing.goalDifference > 0 ? `+${standing.goalDifference}` : standing.goalDifference}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="bg-[#1a2b4b] border border-white/20 rounded-xl px-4 py-2 sm:py-3 flex flex-col items-center min-w-[55px] sm:min-w-[80px] shadow-lg shadow-black/40 group-hover:bg-blue-600 transition-colors duration-500">
                      <span className="text-xl sm:text-3xl font-black text-white leading-none tracking-tighter italic">{standing.points}</span>
                      <span className="text-[8px] sm:text-[10px] text-white/40 font-bold uppercase tracking-widest leading-none mt-1">PKT</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Link>
        );
      })}
</div>
<div className="mt-4 flex flex-wrap gap-4 px-2">
  <div className="flex items-center gap-2">
    <div className="w-3 h-1 bg-yellow-500 rounded-full" />
    <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">MISTRZ</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-3 h-1 bg-slate-400 rounded-full" />
    <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">WICEMISTRZ</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-3 h-1 bg-orange-800 rounded-full" />
    <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">3. MIEJSCE</span>
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
