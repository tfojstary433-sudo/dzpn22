'use client';

import Image from 'next/image';
import Link from 'next/link';
import { teams } from '@/lib/data';

export function ClubLogosBar() {
  // Multiply teams for a seamless infinite scroll
  const duplicatedTeams = [...teams, ...teams, ...teams, ...teams];

  return (
    <div className="w-full py-8 bg-black/80 backdrop-blur-xl border-y border-white/5 overflow-hidden group">
      <div className="flex items-center gap-12 md:gap-20 flex-nowrap min-w-max animate-scroll hover:[animation-play-state:paused] cursor-pointer">
        {duplicatedTeams.map((team, index) => (
          <Link 
            key={`${team.id}-${index}`} 
            href={`/klub/${team.id}`}
            className="group/item transition-all duration-300 hover:scale-125 flex-shrink-0"
          >
            <div className="relative w-16 h-16 md:w-24 md:h-24">
              <Image
                src={team.logo}
                alt={team.name}
                fill
                className="object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover/item:drop-shadow-[0_0_25px_rgba(255,255,255,0.5)]"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
