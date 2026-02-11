'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { matches, standings } from '@/lib/data';

function CompactCountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const calculateTimeLeft = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!mounted) {
    return (
      <div className="flex justify-center gap-2 text-3xl font-bold text-white">
        <div className="flex flex-col items-center">
          <span>--</span>
          <span className="text-xs text-gray-400">DNI</span>
        </div>
        <span>:</span>
        <div className="flex flex-col items-center">
          <span>--</span>
          <span className="text-xs text-gray-400">GODZ</span>
        </div>
        <span>:</span>
        <div className="flex flex-col items-center">
          <span>--</span>
          <span className="text-xs text-gray-400">MIN</span>
        </div>
        <span>:</span>
        <div className="flex flex-col items-center">
          <span>--</span>
          <span className="text-xs text-gray-400">SEK</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-2 text-3xl font-bold text-white">
      <div className="flex flex-col items-center">
        <span>{String(timeLeft.days).padStart(2, '0')}</span>
        <span className="text-xs text-gray-400">DNI</span>
      </div>
      <span>:</span>
      <div className="flex flex-col items-center">
        <span>{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="text-xs text-gray-400">GODZ</span>
      </div>
      <span>:</span>
      <div className="flex flex-col items-center">
        <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="text-xs text-gray-400">MIN</span>
      </div>
      <span>:</span>
      <div className="flex flex-col items-center">
        <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="text-xs text-gray-400">SEK</span>
      </div>
    </div>
  );
}

export function HomeCountdownSchedule() {
  const [activeTab, setActiveTab] = useState<'terminarz' | 'tabela'>('terminarz');
  const [roundIndex, setRoundIndex] = useState(0);

  const nextMatch = matches.find(m => m.status === 'upcoming');
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

  if (!nextMatch) return null;

  return (
    <section className="py-16 bg-gray-900 relative pb-0">
      <div className="container mx-auto px-4">
        <div className="flex gap-8 relative z-10">
          {/* Left side - Compact Countdown */}
          <div className="flex-1 max-w-md">
            <div className="bg-gray-800 rounded-lg p-6 border-t-4 border-b-4 border-blue-600">
              <div className="text-center mb-4">
                <p className="text-gray-300 mb-2 text-xs font-semibold">
                  {formatDate(nextMatch.date)}
                </p>
                <CompactCountdownTimer targetDate={nextMatch.date} />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <Image
                    src={nextMatch.homeTeam.logo}
                    alt={nextMatch.homeTeam.name}
                    width={40}
                    height={40}
                  />
                  <div className="text-white">
                    <p className="text-xs text-gray-300">{nextMatch.homeTeam.shortName.substring(0, 4).toUpperCase()}</p>
                    <p className="text-sm font-bold">{nextMatch.homeTeam.shortName.toUpperCase()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-1 justify-end">
                  <div className="text-white text-right">
                    <p className="text-xs text-gray-300">{nextMatch.awayTeam.shortName.substring(0, 4).toUpperCase()}</p>
                    <p className="text-sm font-bold">{nextMatch.awayTeam.shortName.toUpperCase()}</p>
                  </div>
                  <Image
                    src={nextMatch.awayTeam.logo}
                    alt={nextMatch.awayTeam.name}
                    width={40}
                    height={40}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Schedule/Table */}
          <div className="absolute right-4 top-8 w-96">
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
                    </tr>
                  </thead>
                  <tbody>
                    {standings.slice(0, 11).map((standing) => (
                      <tr
                        key={`standing-${standing.position}`}
                        className={`border-b ${
                          standing.team && standing.position === 1 ? 'bg-yellow-100' : ''
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="h-96" />
    </section>
  );
}
