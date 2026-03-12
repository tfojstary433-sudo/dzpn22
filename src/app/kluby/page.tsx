'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import Link from 'next/link';
import { teams } from '@/lib/data';
import { useState, useEffect, useMemo } from 'react';

export default function KlubyPage() {
  const filteredTeams = useMemo(() => teams.filter(team =>
    team.id !== 'SED'
  ), []);

  const [playerCounts, setPlayerCounts] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    // Fetch player counts for all teams
    const fetchPlayerCounts = async () => {
      const counts: { [key: string]: number } = {};

      for (const team of filteredTeams) {
        try {
          const response = await fetch(`/api/club/players/${team.id}`);
          if (!response.ok) continue;
          const data = await response.json();
          counts[team.id] = Array.isArray(data) ? data.length : (data.players ? data.players.length : 0);
        } catch (error) {
          console.error('Error fetching players for', team.id, ':', error);
          counts[team.id] = 0;
        }
      }

      setPlayerCounts(prev => ({ ...prev, ...counts }));
    };

    if (filteredTeams.length > 0) {
      fetchPlayerCounts();
    }
  }, [filteredTeams]);

  return (
    <>
      <Navbar />
      
      <div 
        className="relative min-h-screen bg-transparent py-16"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] bg-blue-600/20 blur-[180px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-400/10 blur-[150px] pointer-events-none -z-10" />
        <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] pointer-events-none -z-10" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-12 flex justify-center">
            <div className="relative group">
              <img
                src="https://i.ibb.co/MyfXtGLH/ekstraklasabaner-removebg-preview.png"
                alt="7U7 Ekstraklasa"
                className="h-20 md:h-32 w-auto object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTeams.map((team) => (
              <Link
                key={team.id}
                href={`/klub/${team.id}`}
                className="bg-white/10 hover:bg-white/20 rounded-2xl p-8 border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105 shadow-xl flex flex-col items-center justify-center min-h-[250px] backdrop-blur-2xl group"
              >
                <div className="mb-8 relative w-32 h-32 flex items-center justify-center mx-auto">
                  <div className="w-24 h-24 relative flex items-center justify-center">
                    <img 
                      src={team.logo} 
                      alt={team.name}
                      className="max-w-full max-h-full object-contain drop-shadow-2xl transform group-hover:scale-110 transition-all duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-logo.png';
                      }}
                    />
                  </div>
                </div>
                
                <h2 className="text-white font-black text-xl text-center uppercase tracking-tight mb-2 group-hover:text-blue-400 transition-colors">
                  {team.name}
                </h2>

                <div className="w-12 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent mb-3"></div>

                <div className="text-center">
                  <div className="text-gray-400 text-xs font-bold tracking-widest uppercase">
                    {playerCounts[team.id] !== undefined ? (
                      <span>{playerCounts[team.id]} ZAWODNIKÓW</span>
                    ) : (
                      <span>Ładowanie...</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
