'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { teams } from '@/lib/data';
import { useMatchStats } from '@/lib/useMatchStats';

export function TopScorersCard() {
  const { topScorers } = useMatchStats();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || topScorers.length === 0) {
    return null;
  }

  const topThree = topScorers.slice(0, 3);
  const topScorer = topThree[0];

  if (!topScorer) return null;

  const getTeam = (teamId: string) => teams.find(t => t.id === teamId);

  return (
    <section className="py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-black text-white mb-12 text-center uppercase tracking-wider">
          Król Strzelców
        </h2>

        <div className="max-w-5xl mx-auto">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 rounded-2xl transform rotate-1"></div>
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border-4 border-yellow-500 shadow-2xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-black px-6 py-2 rounded-full font-black text-sm uppercase tracking-wider shadow-lg">
                  Top Scorer
                </div>
              </div>

              <div className="flex items-center gap-8 mt-4">
                <div className="relative">
                  <div className="w-40 h-40 rounded-xl overflow-hidden border-4 border-yellow-500 shadow-lg bg-gray-800">
                    <Image
                      src={`https://tr.rbxcdn.com/30DAY-AvatarHeadshot-${topScorer.playerId}-150x150-Png-00.png`}
                      alt={topScorer.name}
                      width={160}
                      height={160}
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="absolute -bottom-3 -right-3 bg-yellow-500 text-black rounded-full w-16 h-16 flex items-center justify-center border-4 border-gray-900 shadow-lg">
                    <div className="text-center">
                      <div className="text-xs font-bold uppercase">Goals</div>
                      <div className="text-2xl font-black">{topScorer.goals}</div>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    {getTeam(topScorer.teamId) && (
                      <>
                        <Image
                          src={getTeam(topScorer.teamId)!.logo}
                          alt={getTeam(topScorer.teamId)!.name}
                          width={40}
                          height={40}
                        />
                        <div className="text-gray-400 text-sm font-semibold uppercase">
                          Team
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-4xl font-black text-white">{topScorer.name}</h3>
                    {topScorer.country && (
                      <img 
                        src={`https://flagcdn.com/w40/${topScorer.country.toLowerCase()}.png`} 
                        alt={topScorer.country} 
                        className="w-8 h-5 object-cover rounded shadow-lg border border-white/10"
                      />
                    )}
                  </div>
                  {getTeam(topScorer.teamId) && (
                    <p className="text-yellow-500 text-xl font-bold">
                      {getTeam(topScorer.teamId)!.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {topThree.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topThree.slice(1).map((player, index) => {
                const team = getTeam(player.teamId);
                return (
                  <div
                    key={player.playerId}
                    className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-600 bg-gray-900">
                          <Image
                            src={`https://tr.rbxcdn.com/30DAY-AvatarHeadshot-${player.playerId}-150x150-Png-00.png`}
                            alt={player.name}
                            width={80}
                            height={80}
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-gray-700 text-white rounded-full w-10 h-10 flex items-center justify-center border-2 border-gray-900 text-lg font-bold">
                          {player.goals}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {team && (
                            <Image
                              src={team.logo}
                              alt={team.name}
                              width={24}
                              height={24}
                            />
                          )}
                          <span className="text-gray-500 text-xs font-semibold uppercase">
                            {team?.shortName || 'Team'}
                          </span>
                          {player.country && (
                            <img 
                              src={`https://flagcdn.com/w20/${player.country.toLowerCase()}.png`} 
                              alt={player.country} 
                              className="w-4 h-3 object-cover rounded-sm border border-white/10"
                            />
                          )}
                        </div>
                        <p className="text-white text-lg font-bold">{player.name}</p>
                      </div>

                      <div className="text-gray-400 text-3xl font-black opacity-20">
                        #{index + 2}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
