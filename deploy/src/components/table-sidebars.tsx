'use client';

import Image from 'next/image';
import { matches as scheduledMatches } from '@/lib/data';
import { useMatchStats } from '@/lib/useMatchStats';
import { useState, useEffect } from 'react';

export function RecentResultsSidebar() {
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
      return { id: matchId, match, result };
    })
    .filter(Boolean)
    .slice(-5)
    .reverse();

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 flex items-center gap-2">
        <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
        Wyniki
      </h3>
      {finishedMatchesArray.length > 0 ? (
        finishedMatchesArray.map((item: any) => (
          <div key={item.id} className="bg-black/40 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col items-center gap-1 flex-1">
                <Image src={item.match.homeTeam.logo} alt="" width={24} height={24} className="object-contain" />
                <span className="text-[10px] font-bold text-white uppercase truncate w-full text-center">{item.match.homeTeam.shortName}</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-600/20 px-3 py-1 rounded-lg border border-blue-500/30">
                <span className="text-lg font-black text-white">{item.result.homeScore}</span>
                <span className="text-blue-400 font-bold">:</span>
                <span className="text-lg font-black text-white">{item.result.awayScore}</span>
              </div>
              <div className="flex flex-col items-center gap-1 flex-1">
                <Image src={item.match.awayTeam.logo} alt="" width={24} height={24} className="object-contain" />
                <span className="text-[10px] font-bold text-white uppercase truncate w-full text-center">{item.match.awayTeam.shortName}</span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-gray-500 text-sm italic p-4 text-center bg-black/20 rounded-xl border border-white/5">
          Brak ostatnich wyników
        </div>
      )}
    </div>
  );
}

export function SponsorsSidebar() {
  const sponsors = [
    { src: "https://i.ibb.co/gL0mLH1m/Clash-MMALogo.png", alt: "Clash MMA" },
    { src: "https://i.ibb.co/XxHbj8Cd/04be6464-9300-4243-b4ee-6054050870e7.png", alt: "Sponsor 2" },
    { src: "https://i.ibb.co/MxFqjSYj/7u7logo-1.png", alt: "7u7" },
    { src: "https://i.ibb.co/xbrWSnb/Przezroczyste-PFF.png", alt: "PFF" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 flex items-center gap-2">
        <span className="w-1 h-6 bg-yellow-500 rounded-full"></span>
        Sponsorzy
      </h3>
      <div className="grid grid-cols-1 gap-4">
        {sponsors.map((sponsor, index) => (
          <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-center hover:bg-white/10 transition-all group">
            <Image 
              src={sponsor.src} 
              alt={sponsor.alt} 
              width={120} 
              height={60} 
              className="h-12 w-auto object-contain filter brightness-90 group-hover:brightness-110 transition-all" 
            />
          </div>
        ))}
      </div>
    </div>
  );
}
