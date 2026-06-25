'use client';

import { MainNavbar } from '@/components/main-navbar';
import { Footer } from '@/components/footer';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Activity, Users, Shield } from 'lucide-react';
import Image from 'next/image';

interface Team {
  id: number;
  name: string;
  short_name: string;
  logo_url: string;
  city: string | null;
  players: any[];
}

export default function KlubyPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeams() {
      try {
        const response = await fetch(`https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/teams?season_id=1`);
        if (response.ok) {
          const data = await response.json();
          setTeams(data);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTeams();
  }, []);

  return (
    <main className="bg-[#020617] min-h-screen text-white relative overflow-hidden">
      <MainNavbar />
      
      {/* Background Section */}
      <div className="fixed inset-0 z-0">
        <Image
          src="https://i.ibb.co/YCB7X52/obraz-2026-06-13-150303737.png"
          alt="Stadium Background"
          fill
          className="object-cover brightness-[0.7]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
        
        {/* Blue/Red Splashes based on new logo */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 pt-44 pb-32 relative z-10">
        <div className="mb-20 text-center">
          <h1 className="text-6xl sm:text-8xl font-black italic uppercase tracking-tighter mb-6 drop-shadow-2xl">
            NASZE <span className="text-blue-500">DRUŻYNY</span>
          </h1>
          <p className="text-white/40 font-black text-xs uppercase tracking-[0.5em]">Oficjalna lista klubów 1 Ligi Działdowskiej</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-40">
            <Activity className="w-16 h-16 text-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {teams.map((team) => (
              <Link
                key={team.id}
                href={`/klub/${team.id}`}
                className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 backdrop-blur-2xl hover:bg-white/[0.05] hover:border-blue-500/30 transition-all group flex flex-col items-center relative overflow-hidden"
              >
                {/* ID Background */}
                <div className="absolute -top-4 -right-4 text-9xl font-black text-white/[0.02] italic group-hover:text-blue-500/[0.05] transition-colors select-none">
                  {team.id}
                </div>

                <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                   <div className="absolute inset-0 bg-blue-600/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                   <img 
                     src={team.logo_url} 
                     alt={team.name}
                     className="max-w-full max-h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-700"
                   />
                </div>
                
                <h2 className="text-2xl font-black text-center uppercase italic tracking-tighter mb-2 group-hover:text-blue-500 transition-colors">
                  {team.name}
                </h2>
                <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-8">{team.city || 'DZIAŁDOWO'}</div>

                <div className="w-full pt-8 border-t border-white/5 flex justify-between items-center">
                   <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500/50" />
                      <span className="text-xs font-black text-white/40 uppercase">{team.players?.length || 0} GRACZY</span>
                   </div>
                   <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <Shield className="w-4 h-4 text-white/30 group-hover:text-white" />
                   </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
