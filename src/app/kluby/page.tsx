'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import Link from 'next/link';
import { teams } from '@/lib/data';
import { useState, useEffect, useMemo } from 'react';

export default function KlubyPage() {
  const displayTeams = useMemo(() => [
    'Zawisza Bydgoszcz',
    'Arka Gdynia',
    'Legia Warszawa',
    'Lech Poznań',
    'Pogoń Szczecin',
    'Zagłębie Lubin',
    'Lechia Gdańsk',
    'Wisła Kraków',
    'Sokół Olsztyn',
    'Grom Nowy Staw',
    'Motor Lublin',
    'Chojniczanka Chojnice',
    'Jagiellonia Białystok',
    'Wisła Płock',
    'Górnik Zabrze',
    'Widzew Łódź'
  ], []);

  const filteredTeams = useMemo(() => teams.filter(team =>
    displayTeams.includes(team.name)
  ), [displayTeams]);

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
          counts[team.id] = data.players ? data.players.length : 0;
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
                <div className="mb-6 relative">
                  <div 
                    className="absolute inset-0 blur-2xl opacity-20 scale-150 rounded-full"
                    style={{ backgroundColor: team.color }}
                  ></div>
                  <img 
                    src={team.logo} 
                    alt={team.name}
                    className="relative z-10 w-24 h-24 object-contain drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-logo.png';
                    }}
                  />
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
