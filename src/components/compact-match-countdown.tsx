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
          const hasActive = apiMatches.some((m: any) => m.isActive || m.status === 'active');
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
    if (loading) return null;
    return null;
  }

  if (!displayMatch) {
    return null;
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
    <div className="fixed right-4 md:right-8 bottom-8 md:bottom-auto md:top-96 w-[calc(100%-2rem)] md:w-80 z-[60] animate-in slide-in-from-right duration-500">
      <div className="bg-[#0a101f]/90 backdrop-blur-2xl rounded-2xl p-4 shadow-2xl border border-white/10 ring-1 ring-white/5">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Najbliższy Mecz</span>
          <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">
            {formatDate(roundMatch.date)}
          </p>
        </div>

        <div className="mb-4 bg-white/5 rounded-xl py-3 border border-white/5">
          <CountdownTimer targetDate={roundMatch.date} />
        </div>

        <div className="flex items-center justify-between gap-4 px-2 mb-4">
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="w-12 h-12 bg-white/5 rounded-xl p-2 border border-white/10 flex items-center justify-center shadow-lg">
              <Image
                src={roundMatch.homeTeam!.logo}
                alt={roundMatch.homeTeam!.name}
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <p className="text-[10px] font-black text-white uppercase tracking-tight truncate w-full text-center">{roundMatch.homeTeam!.shortName.toUpperCase()}</p>
          </div>

          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-1">
              <span className="text-blue-400 text-[10px] font-black tracking-tighter">VS</span>
            </div>
            {roundMatch.category && (
              <span className="text-[7px] text-white/20 font-black uppercase tracking-widest text-center">
                {roundMatch.category}
              </span>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="w-12 h-12 bg-white/5 rounded-xl p-2 border border-white/10 flex items-center justify-center shadow-lg">
              <Image
                src={roundMatch.awayTeam!.logo}
                alt={roundMatch.awayTeam!.name}
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <p className="text-[10px] font-black text-white uppercase tracking-tight truncate w-full text-center">{roundMatch.awayTeam!.shortName.toUpperCase()}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-1 bg-white/5 rounded-xl p-1.5 border border-white/5">
          <button
            onClick={handlePrevRound}
            disabled={allRounds.indexOf(selectedRound) === 0}
            className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all disabled:opacity-10"
          >
            ←
          </button>
          <div className="flex flex-col items-center flex-1">
            <span className="text-white text-[10px] font-black uppercase tracking-widest">{selectedRound}. KOLEJKA</span>
          </div>
          <button
            onClick={handleNextRound}
            disabled={allRounds.indexOf(selectedRound) === allRounds.length - 1}
            className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all disabled:opacity-10"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
