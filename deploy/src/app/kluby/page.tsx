'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import Link from 'next/link';
import { teams } from '@/lib/data';

export default function KlubyPage() {
  const displayTeams = [
    'Zawisza Bydgoszcz',
    'Arka Gdynia',
    'Unia Skierniewice',
    'Legia Warszawa',
    'Lech Poznań',
    'Pogoń Szczecin',
    'Zagłębie Lubin',
    'Lechia Gdańsk',
    'Wisła Kraków',
    'Sokół Olsztyn',
    'Grom Nowy Staw',
    'Motor Lublin',
    'Olimpia Elbląg'
  ];

  const filteredTeams = teams.filter(team => 
    displayTeams.includes(team.name)
  );

  return (
    <>
      <Navbar />
      
      <div className="relative py-10 overflow-hidden bg-[#003087]">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `
              linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%),
              repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)
            `
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-900/30 via-blue-800/40 to-blue-900/30 rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-1 h-16 bg-gradient-to-b from-transparent via-white to-transparent rounded-full"></div>
                <img 
                  src="https://i.ibb.co/MyfXtGLH/ekstraklasabaner-removebg-preview.png" 
                  alt="Logo" 
                  className="h-14 w-auto"
                />
              </div>
              
              <h1 className="text-4xl font-black text-white tracking-tight uppercase">
                KLUBY 2025/2026
              </h1>
              
              <div className="w-1 h-16 bg-gradient-to-b from-transparent via-white to-transparent rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <div 
        className="relative min-h-screen bg-cover bg-center py-16"
        style={{
          backgroundImage: 'url(https://i.ibb.co/G4rD13m6/tlo.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredTeams.map((team) => (
              <Link
                key={team.id}
                href={`/klub/${team.id}`}
                className="group relative overflow-hidden rounded-2xl border border-white/10 hover:border-blue-400 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                <div 
                  className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity"
                  style={{
                    background: `linear-gradient(135deg, ${team.color || '#003087'}44 0%, #000000 100%)`
                  }}
                ></div>
                
                <div className="relative bg-gradient-to-b from-gray-900/80 to-black/90 p-10 flex flex-col items-center justify-center min-h-[280px] backdrop-blur-sm">
                  <div className="mb-6 relative">
                    <div 
                      className="absolute inset-0 blur-2xl opacity-40 scale-150"
                      style={{ backgroundColor: team.color }}
                    ></div>
                    <img 
                      src={team.logo} 
                      alt={team.name}
                      className="relative z-10 w-28 h-28 object-contain drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-logo.png';
                      }}
                    />
                  </div>
                  
                  <h2 className="text-white font-black text-2xl text-center uppercase tracking-tight mb-1">
                    {team.name}
                  </h2>
                  
                  <div className="w-12 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent mb-4"></div>
                  
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>ZOBACZ PROFIL</span>
                    <span>→</span>
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
