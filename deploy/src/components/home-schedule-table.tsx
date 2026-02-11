'use client';

import { useState } from 'react';
import Image from 'next/image';
import { matches, standings } from '@/lib/data';

export function HomeScheduleTable() {
  const [activeTab, setActiveTab] = useState<'terminarz' | 'tabela'>('terminarz');
  const [roundIndex, setRoundIndex] = useState(0);

  const allRounds = [...new Set(matches.map(m => m.round))].sort((a, b) => Number(a) - Number(b));
  const currentRound = allRounds[roundIndex];
  const roundMatches = matches.filter(m => m.round === currentRound).slice(0, 4);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex gap-8">
          {/* Main content area */}
          <div className="flex-1" />

          {/* Right sidebar */}
          <div className="w-96">
            {/* Tab headers */}
            <div className="flex gap-0 mb-0 border-b-4 border-blue-600">
              <button
                onClick={() => setActiveTab('terminarz')}
                className={`flex-1 py-3 text-sm font-bold text-center transition-colors ${
                  activeTab === 'terminarz'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                TERMINARZ
              </button>
              <button
                onClick={() => setActiveTab('tabela')}
                className={`flex-1 py-3 text-sm font-bold text-center transition-colors ${
                  activeTab === 'tabela'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                TABELA
              </button>
            </div>

            {/* Tab content */}
            {activeTab === 'terminarz' && (
              <div className="bg-gray-900 text-white">
                {/* Round selector */}
                <div className="flex items-center justify-between bg-blue-600 px-4 py-3">
                  <button
                    onClick={() => setRoundIndex(Math.max(0, roundIndex - 1))}
                    disabled={roundIndex === 0}
                    className="text-white text-xl disabled:opacity-30"
                  >
                    ←
                  </button>
                  <span className="font-bold text-lg">{currentRound}. KOLEJKA</span>
                  <button
                    onClick={() => setRoundIndex(Math.min(allRounds.length - 1, roundIndex + 1))}
                    disabled={roundIndex === allRounds.length - 1}
                    className="text-white text-xl disabled:opacity-30"
                  >
                    →
                  </button>
                </div>

                {/* Matches */}
                <div className="space-y-0">
                  {roundMatches.map((match) => (
                    <div key={match.id}>
                      <div className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold">
                        {formatDate(match.date)} {formatTime(match.date)}
                      </div>
                      <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <Image
                            src={match.homeTeam.logo}
                            alt={match.homeTeam.name}
                            width={24}
                            height={24}
                          />
                          <span className="text-xs font-semibold">{match.homeTeam.shortName.substring(0, 3).toUpperCase()}</span>
                        </div>
                        <div className="px-3 py-1 bg-blue-600 rounded font-bold text-sm">-:-</div>
                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <span className="text-xs font-semibold">{match.awayTeam.shortName.substring(0, 3).toUpperCase()}</span>
                          <Image
                            src={match.awayTeam.logo}
                            alt={match.awayTeam.name}
                            width={24}
                            height={24}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'tabela' && (
              <div className="bg-white">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-200 border-b">
                      <th className="py-2 px-2 text-left font-bold">POS</th>
                      <th className="py-2 px-2 text-left font-bold">DRUŻYNA</th>
                      <th className="py-2 px-1 text-center font-bold">PKT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.slice(0, 11).map((standing) => (
                      <tr
                        key={`standing-${standing.position}`}
                        className={`border-b ${
                          standing.team && standing.position === 1 ? 'bg-yellow-100' : 
                          standing.team && standing.position >= 9 ? 'bg-red-100' : ''
                        } hover:bg-gray-50`}
                      >
                        <td className="py-2 px-2 font-bold text-sm">{standing.position}</td>
                        <td className="py-2 px-2">
                          {standing.team ? (
                            <div className="flex items-center gap-2">
                              <Image
                                src={standing.team.logo}
                                alt={standing.team.name}
                                width={20}
                                height={20}
                              />
                              <span className="font-semibold text-xs">{standing.team.shortName}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-2 px-1 text-center font-bold text-sm">
                          {standing.team ? standing.points : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
