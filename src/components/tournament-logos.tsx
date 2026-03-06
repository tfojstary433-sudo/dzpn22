'use client';

import Image from 'next/image';
import Link from 'next/link';

export function TournamentLogos() {
  const tournaments = [
    {
      name: 'Puchar Polski',
      logo: 'https://i.ibb.co/N6MvSMh1/PUCHAR-POLSKI.png',
      href: '/turnieje?type=puchar',
      color: 'hover:bg-red-600/10'
    },
    {
      name: 'Mecze Towarzyskie',
      logo: 'https://i.ibb.co/9960T9N2/obraz-2026-01-13-020503777.png',
      href: '/turnieje?type=towarzyskie',
      color: 'hover:bg-blue-600/10'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl md:text-5xl font-black uppercase tracking-[0.2em] text-center mb-12 text-white">
        Turnieje
      </h2>
      <div className="flex flex-wrap justify-center gap-8 md:gap-16">
        {tournaments.map((tournament) => (
          <Link 
            key={tournament.name}
            href={tournament.href}
            className={`group relative flex flex-col items-center p-8 rounded-[2rem] border border-white/5 bg-white/5 backdrop-blur-sm transition-all duration-500 hover:scale-110 ${tournament.color} hover:border-white/20 shadow-2xl overflow-hidden`}
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative w-32 h-32 md:w-48 md:h-48 mb-6">
              <Image
                src={tournament.logo}
                alt={tournament.name}
                fill
                className="object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:drop-shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all duration-500"
                suppressHydrationWarning={true}
              />
            </div>
            
            <span className="text-sm md:text-lg font-black uppercase tracking-[0.3em] text-white/60 group-hover:text-white transition-colors">
              {tournament.name}
            </span>

            {/* Accent Line */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-white/40 group-hover:w-1/2 transition-all duration-500" />
          </Link>
        ))}
      </div>
    </div>
  );
}
