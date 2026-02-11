'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { matches } from '@/lib/data';

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
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!mounted) {
    return (
      <div className="flex justify-center gap-4 text-5xl font-bold text-white">
        <div className="flex flex-col items-center">
          <span>--</span>
          <span className="text-sm text-gray-400">DNI</span>
        </div>
        <span>:</span>
        <div className="flex flex-col items-center">
          <span>--</span>
          <span className="text-sm text-gray-400">GODZ</span>
        </div>
        <span>:</span>
        <div className="flex flex-col items-center">
          <span>--</span>
          <span className="text-sm text-gray-400">MIN</span>
        </div>
        <span>:</span>
        <div className="flex flex-col items-center">
          <span>--</span>
          <span className="text-sm text-gray-400">SEK</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-4 text-5xl font-bold text-white">
      <div className="flex flex-col items-center">
        <span>{String(timeLeft.days).padStart(2, '0')}</span>
        <span className="text-sm text-gray-400">DNI</span>
      </div>
      <span>:</span>
      <div className="flex flex-col items-center">
        <span>{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="text-sm text-gray-400">GODZ</span>
      </div>
      <span>:</span>
      <div className="flex flex-col items-center">
        <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="text-sm text-gray-400">MIN</span>
      </div>
      <span>:</span>
      <div className="flex flex-col items-center">
        <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="text-sm text-gray-400">SEK</span>
      </div>
    </div>
  );
}

export function NextMatchCountdown() {
  const nextMatch = matches.find(m => m.status === 'upcoming');

  if (!nextMatch) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-blue-700 to-blue-900">
      <div className="container mx-auto px-4">
        <div className="bg-gray-900 rounded-lg p-8 border-t-4 border-b-4 border-blue-600">
          <div className="text-center mb-8">
            <p className="text-gray-400 mb-6 text-sm font-semibold">DO NAJBLISZEGO MECZU POZOSTAŁO:</p>
            <p className="text-gray-400 mb-4 text-lg">
              {new Date(nextMatch.date).toLocaleDateString('pl-PL', {
                weekday: 'long',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              }).toUpperCase()}
            </p>
            <CountdownTimer targetDate={nextMatch.date} />
          </div>

          <div className="flex items-center justify-between px-8 gap-8">
            <div className="flex items-center gap-6 flex-1">
              <Image
                src={nextMatch.homeTeam.logo}
                alt={nextMatch.homeTeam.name}
                width={80}
                height={80}
              />
              <div className="text-white">
                <p className="text-xs text-gray-400">{nextMatch.homeTeam.shortName.substring(0, 4).toUpperCase()}</p>
                <p className="text-2xl font-bold">{nextMatch.homeTeam.shortName.toUpperCase()}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 flex-1 justify-end">
              <div className="text-white text-right">
                <p className="text-xs text-gray-400">{nextMatch.awayTeam.shortName.substring(0, 4).toUpperCase()}</p>
                <p className="text-2xl font-bold">{nextMatch.awayTeam.shortName.toUpperCase()}</p>
              </div>
              <Image
                src={nextMatch.awayTeam.logo}
                alt={nextMatch.awayTeam.name}
                width={80}
                height={80}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
