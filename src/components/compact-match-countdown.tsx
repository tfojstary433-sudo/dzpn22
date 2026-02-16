'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { matches, Match } from '@/lib/data';

function CountdownTimer({ targetDate }: { targetDate: string }) {
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
    // Update every 10 seconds for better performance, or every second if less than 1 hour remaining
    const target = new Date(targetDate).getTime();
    const now = new Date().getTime();
    const difference = target - now;
    const interval = difference < (1000 * 60 * 60) ? 1000 : 10000; // 1s if < 1h, 10s otherwise
    const timer = setInterval(calculateTimeLeft, interval);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="text-3xl font-bold text-white tracking-wider">
          --:--:--:--
        </div>
        <div className="flex justify-center gap-6 text-xs text-gray-400 font-semibold mt-1">
          <span>DNI</span>
          <span>GODZ</span>
          <span>MIN</span>
          <span>SEK</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-3xl font-bold text-white tracking-wider">
        {String(timeLeft.days).padStart(2, '0')}:{String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </div>
      <div className="flex justify-center gap-6 text-xs text-gray-400 font-semibold mt-1">
        <span>DNI</span>
        <span>GODZ</span>
        <span>MIN</span>
        <span>SEK</span>
      </div>
    </div>
  );
}

export function CompactMatchCountdown({ isMinimized = false }: { isMinimized?: boolean }) {
  const [displayMatch, setDisplayMatch] = useState<Match | null>(null);
  const [selectedRound, setSelectedRound] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasLiveMatch, setHasLiveMatch] = useState(false);

  const allRounds = [...new Set(matches.map(m => m.round))].sort((a, b) => Number(a) - Number(b));

  useEffect(() => {
    const checkLiveMatches = async () => {
      try {
        const response = await fetch('/api/matches', {
          headers: { 'Accept': 'application/json' },
          cache: 'no-store'
        });
        const apiMatches = await response.json();
        
        if (Array.isArray(apiMatches)) {
          const hasActive = apiMatches.some((m: any) => 
            m.isActive === true || 
            (['active', 'live', 'playing'].includes(m.status) && m.status !== 'scheduled' && m.status !== 'finished')
          );
          setHasLiveMatch(hasActive);
        } else {
          setHasLiveMatch(false);
        }
      } catch {
        setHasLiveMatch(false);
      }
    };

    checkLiveMatches();
    const liveInterval = setInterval(checkLiveMatches, 5000);

    const updateNextMatch = () => {
      const now = new Date();
      
      const validMatches = matches
        .filter(m => {
          try {
            const matchDate = new Date(m.date);
            return matchDate instanceof Date && matchDate.getTime() > now.getTime();
          } catch {
            return false;
          }
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      if (validMatches.length > 0) {
        setDisplayMatch(validMatches[0]);
        const round = validMatches[0].round;
        setSelectedRound(typeof round === 'string' ? Number(round) || 1 : round);
      } else {
        setDisplayMatch(null);
      }
      setLoading(false);
    };

    updateNextMatch();
    const interval = setInterval(updateNextMatch, 1000);
    return () => {
      clearInterval(interval);
      clearInterval(liveInterval);
    };
  }, []);

  if (loading || hasLiveMatch || isMinimized) {
    if (loading) return <div className="fixed right-8 top-96 w-80 h-48 bg-black/10 rounded-xl" />;
    return null;
  }

  if (!displayMatch) {
    return (
      <div className="fixed right-8 top-96 w-96 z-40">
        <div className="bg-gray-800 rounded-lg p-8 border-t-4 border-b-4 border-blue-600">
          <div className="text-center">
            <p className="text-gray-300 text-sm font-semibold">Brak zaplanowanych spotkań</p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
    return `${days[date.getDay()]}, ${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`.toUpperCase();
  };

  const handlePrevRound = () => {
    const currentIndex = allRounds.indexOf(selectedRound);
    if (currentIndex > 0) {
      setSelectedRound(Number(allRounds[currentIndex - 1]));
    }
  };

  const handleNextRound = () => {
    const currentIndex = allRounds.indexOf(selectedRound);
    if (currentIndex < allRounds.length - 1) {
      setSelectedRound(Number(allRounds[currentIndex + 1]));
    }
  };

  const roundMatches = matches.filter(m => m.round === selectedRound);
  const roundMatch = roundMatches.length > 0 ? roundMatches[0] : displayMatch;

  return (
    <div className="fixed right-8 top-96 w-80 z-40">
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl p-4 shadow-lg border border-blue-500">
        <p className="text-center text-gray-200 text-xs font-semibold mb-3">
          {formatDate(roundMatch.date)}
        </p>

        <div className="mb-3">
          <CountdownTimer targetDate={roundMatch.date} />
        </div>

        <div className="flex items-center justify-between gap-2 px-2">
          <div className="flex items-center gap-2">
            <Image
              src={roundMatch.homeTeam!.logo}
              alt={roundMatch.homeTeam!.name}
              width={40}
              height={40}
            />
            <div className="text-white text-center flex-1">
              <p className="text-xs font-semibold leading-tight">{roundMatch.homeTeam!.shortName.substring(0, 3).toUpperCase()}</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center flex-shrink-0">
            <span className="text-gray-100 text-[10px] font-bold">VS</span>
            {roundMatch.stadium && (
              <span className="text-[7px] text-blue-200 font-black uppercase tracking-tighter text-center max-w-[40px] truncate leading-none mt-1 opacity-60">
                {roundMatch.stadium.split(' ')[0]}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="text-white text-center flex-1">
              <p className="text-xs font-semibold leading-tight">{roundMatch.awayTeam!.shortName.substring(0, 3).toUpperCase()}</p>
            </div>
            <Image
              src={roundMatch.awayTeam!.logo}
              alt={roundMatch.awayTeam!.name}
              width={40}
              height={40}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-1 mt-3 bg-blue-800 rounded-lg p-2 relative group/cat">
          <button
            onClick={handlePrevRound}
            disabled={allRounds.indexOf(selectedRound) === 0}
            className="px-2 py-1 text-white text-xs font-bold hover:opacity-80 disabled:opacity-30"
          >
            ←
          </button>
          <div className="flex flex-col items-center flex-1">
            <span className="text-white text-xs font-bold">{selectedRound}. KOLEJKA</span>
            {roundMatch.category && (
              <span className="text-[6px] font-black text-blue-300 uppercase tracking-widest opacity-0 group-hover/cat:opacity-100 transition-opacity absolute -top-1 px-1 bg-blue-800 rounded">
                {roundMatch.category}
              </span>
            )}
          </div>
          <button
            onClick={handleNextRound}
            disabled={allRounds.indexOf(selectedRound) === allRounds.length - 1}
            className="px-2 py-1 text-white text-xs font-bold hover:opacity-80 disabled:opacity-30"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
