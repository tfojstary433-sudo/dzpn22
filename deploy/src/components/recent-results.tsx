'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { matches as scheduledMatches, teams as localTeams } from '@/lib/data';
import { useMatchStats } from '@/lib/useMatchStats';

export function RecentResults() {
  const { finishedMatches } = useMatchStats();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const finishedMatchesArray = Object.entries(finishedMatches)
    .map(([matchId, result]) => {
      const match = scheduledMatches.find(m => m.id === matchId);
      if (!match) return null;
      
      return {
        id: matchId,
        match,
        result
      };
    })
    .filter(Boolean)
    .slice(-3)
    .reverse();

  if (finishedMatchesArray.length === 0) return null;

  return (
    <section className="py-12 bg-[#0a0e17] text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-black uppercase tracking-wider mb-8 text-center">
          RECENT RESULTS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {finishedMatchesArray.map((item: any) => {
            const { match, result } = item;
            
            return (
              <div
                key={item.id}
                className="bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    FT • FINISHED
                  </span>
                  <button className="text-[10px] font-bold uppercase tracking-wider hover:text-blue-200 transition-colors">
                    DETAILS →
                  </button>
                </div>

                {/* Match Score */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    {/* Home Team */}
                    <div className="flex flex-col items-center gap-3 flex-1">
                      <div className="w-12 h-12 bg-[#1e293b] rounded-full flex items-center justify-center p-2">
                        <Image
                          src={match.homeTeam.logo}
                          alt={match.homeTeam.name}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-black uppercase tracking-tight">
                          {match.homeTeam.shortName}
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-2 px-6">
                      <span className="text-4xl font-black">{result.homeScore}</span>
                      <span className="text-2xl font-black text-gray-500">-</span>
                      <span className="text-4xl font-black">{result.awayScore}</span>
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center gap-3 flex-1">
                      <div className="w-12 h-12 bg-[#1e293b] rounded-full flex items-center justify-center p-2">
                        <Image
                          src={match.awayTeam.logo}
                          alt={match.awayTeam.name}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-black uppercase tracking-tight">
                          {match.awayTeam.shortName}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Match Info */}
                  <div className="text-center pt-4 border-t border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                      DRUGA POŁOWA
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
