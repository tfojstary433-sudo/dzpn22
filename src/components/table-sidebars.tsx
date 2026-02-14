'use client';

import Image from 'next/image';
import { matches as scheduledMatches } from '@/lib/data';
import { useMatchStats } from '@/lib/useMatchStats';
import { useState, useEffect, memo } from 'react';

// Helper function for team logos
function getTeamLogo(teamId: string): string {
  const teamLogos: Record<string, string> = {
    'ARK': 'https://ext.same-assets.com/1250577607/451783410.png',
    'LEG': 'https://ext.same-assets.com/1250577607/695801781.png',
    'LEC': 'https://ext.same-assets.com/1250577607/3317158738.png',
    'LGD': 'https://i.ibb.co/nqBHgwK2/obraz-2026-01-22-143911384.png',
    'POG': 'https://ext.same-assets.com/1250577607/3079565559.png',
    'ZAW': 'https://upload.wikimedia.org/wikipedia/commons/5/55/Herb_Zawiszy_Bydgoszcz.png',
    'OLI': 'https://i.ibb.co/RGsNqf6G/olimpia-elblag.png',
    'UNI': 'https://i.ibb.co/Vp3YY8FY/unia-logo-300x300.png',
    'MOT': 'https://i.ibb.co/bgRJrvnj/Motor-Lublin-S-A-Oficjalny-Herb.png',
    'SOK': 'https://i.ibb.co/r2KwDw8h/obraz-2026-01-05-231417131.png',
    'WIS': 'https://upload.wikimedia.org/wikipedia/en/1/15/Wis%C5%82a_Krak%C3%B3w_logo.svg',
    'GRO': 'https://i.ibb.co/V0rcs98Q/obraz-2026-01-04-213027745-removebg-preview-4.png',
    'RAK': 'https://i.ibb.co/b5q4tsmh/obraz-2026-02-13-230749363.png',
    'ZAG': 'https://i.ibb.co/7xBP97MW/dvyf-Zx2g-Ykwr8-Dur.png',
    'LEC_0': 'https://i.ibb.co/nqBHgwK2/obraz-2026-01-22-143911384.png', // Lechia Gdańsk
    'LEC_3': 'https://i.ibb.co/nqBHgwK2/obraz-2026-01-22-143911384.png', // Lechia Gdańsk
    'LEC_1': 'https://i.ibb.co/7d4R0vZH/obraz-2026-02-04-222253347-removebg-preview-1.png' // Placeholder
  };
  return teamLogos[teamId] || 'https://i.ibb.co/7d4R0vZH/obraz-2026-02-04-222253347-removebg-preview-1.png';
}

export const RecentResultsSidebar = memo(function RecentResultsSidebar() {
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
          <div key={item.id} className="bg-transparent border border-white/5 rounded-xl p-3 backdrop-blur-sm">
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
});

export const SponsorsSidebar = memo(function SponsorsSidebar() {
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
          <div key={index} className="bg-transparent border border-white/5 rounded-xl p-4 flex items-center justify-center hover:bg-white/5 transition-all group">
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
});
