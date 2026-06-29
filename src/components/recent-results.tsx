'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { teams as localTeams } from '@/lib/data';
import { API_ENDPOINTS, TEAM_ID_MAPPING } from '@/lib/constants';
import { getTeamLogo, getTeamName } from '@/lib/useMatchStats';

function getTeamFromName(teamName: string, teamId?: string, apiLogo?: string) {
  // If we have an ID, use it with the central helper
  if (teamId) {
    return {
      id: teamId,
      name: teamName,
      shortName: teamName.substring(0, 3).toUpperCase(),
      logo: getTeamLogo(teamId, teamName, apiLogo),
      color: '#3b82f6'
    };
  }

  // Fallback to name search
  const normalizedName = teamName.toLowerCase();
  const foundTeam = localTeams.find(t => 
    t.name.toLowerCase() === normalizedName || 
    t.shortName.toLowerCase() === normalizedName
  );

  if (foundTeam) {
    return {
      id: foundTeam.id,
      name: foundTeam.name,
      shortName: foundTeam.shortName,
      logo: foundTeam.logo,
      color: foundTeam.color || '#3b82f6'
    };
  }

  return {
    id: 'UNK',
    name: teamName,
    shortName: teamName.substring(0, 3).toUpperCase(),
    logo: apiLogo || `https://league-builder.replit.app/api/clubs/${teamName}/logo`,
    color: '#3b82f6'
  };
}

export function RecentResults() {
  const [finishedMatches, setFinishedMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.SCHEDULE);
        if (response.ok) {
          const data = await response.json();
          const fixtures = Array.isArray(data) ? data : (data.fixtures || []);
          
          const finished = fixtures
            .filter((f: any) => f.status === 'played' || f.status === 'finished' || f.isFinished || (f.scoreA > 0 || f.scoreB > 0))
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5)
            .map((f: any) => ({
              id: f.id,
              homeTeam: getTeamFromName(f.teamA, f.homeTeamId || f.teamAId, f.homeTeamLogo || f.teamALogo),
              awayTeam: getTeamFromName(f.teamB, f.awayTeamId || f.teamBId, f.awayTeamLogo || f.teamBLogo),
              homeScore: f.scoreA,
              awayScore: f.scoreB,
              date: f.date,
              round: f.round
            }));
          
          setFinishedMatches(finished);
        }
      } catch (error) {
        console.error('Failed to fetch recent results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading || finishedMatches.length === 0) return null;

  return (
    <section className="py-12 bg-black/40 backdrop-blur-md text-white border-y border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-10">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-[0.2em] text-center text-white">
            Ostatnie Mecze
          </h2>
          <div className="w-20 h-1 bg-[#00ccff] mt-4" />
        </div>

        <div className="flex flex-wrap justify-center gap-6 max-w-7xl mx-auto">
          {finishedMatches.map((match) => (
            <div
              key={match.id}
              className="bg-[#0a0a0a]/80 border border-white/10 rounded-2xl overflow-hidden hover:border-[#00ccff]/50 transition-all duration-300 w-full md:w-[380px] group shadow-2xl"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#1a1a1a] to-black px-4 py-2 flex items-center justify-between border-b border-white/5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00ccff]">
                  KONIEC MECZU • KOLEJKA {match.round}
                </span>
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                  {new Date(match.date).toLocaleDateString('pl-PL')}
                </span>
              </div>

              {/* Match Score */}
              <div className="p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00ccff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-center justify-between relative z-10">
                  {/* Home Team */}
                  <div className="flex flex-col items-center gap-3 flex-1">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center p-3 border border-white/5 group-hover:border-[#00ccff]/30 transition-all">
                      <Image
                        src={match.homeTeam.logo}
                        alt={match.homeTeam.name}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-black uppercase tracking-tight text-white/80 group-hover:text-white transition-colors">
                        {match.homeTeam.shortName}
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex flex-col items-center gap-1 px-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-black tabular-nums">{match.homeScore}</span>
                      <span className="text-2xl font-black text-[#00ccff]">:</span>
                      <span className="text-4xl font-black tabular-nums">{match.awayScore}</span>
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className="flex flex-col items-center gap-3 flex-1">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center p-3 border border-white/5 group-hover:border-[#00ccff]/30 transition-all">
                      <Image
                        src={match.awayTeam.logo}
                        alt={match.awayTeam.name}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-black uppercase tracking-tight text-white/80 group-hover:text-white transition-colors">
                        {match.awayTeam.shortName}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

