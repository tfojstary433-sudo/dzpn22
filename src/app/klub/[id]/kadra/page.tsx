'use client';

import { MainNavbar } from '@/components/main-navbar';
import { Footer } from '@/components/footer';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ChevronLeft, User, Activity } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function KadraPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [teamData, setTeamData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeam() {
      try {
        const res = await fetch(`https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/teams?season_id=1`);
        const allTeams = await res.json();
        const currentTeam = allTeams.find((t: any) => 
          t.id?.toString() === id || 
          t.short_name?.toLowerCase() === id.toLowerCase() ||
          (t.name && t.name.toLowerCase().replace(/\s+/g, '-') === id.toLowerCase())
        );
        setTeamData(currentTeam);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchTeam();
  }, [id]);

  if (loading) {
    return (
      <main className="bg-[#020617] min-h-screen flex items-center justify-center text-white">
        <Activity className="w-16 h-16 text-blue-500 animate-spin" />
      </main>
    );
  }

  if (!teamData) {
    return (
      <main className="bg-[#020617] min-h-screen flex items-center justify-center text-white">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter">Klub nie znaleziony</h1>
      </main>
    );
  }

  return (
    <main className="bg-[#020617] min-h-screen text-white font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      <MainNavbar />
      
      <div className="fixed inset-0 z-0">
        <Image
          src="https://i.ibb.co/YCB7X52/obraz-2026-06-13-150303737.png"
          alt="Stadium Background"
          fill
          className="object-cover brightness-[0.7]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
      </div>

      <div className="container mx-auto px-4 pt-36 pb-32 relative z-10">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-3 text-blue-400 font-black text-sm uppercase tracking-[0.2em] mb-12 hover:text-white transition-all group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Wróć do profilu klubu
        </button>

        <div className="mb-20">
           <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter leading-[0.8] mb-4 uppercase">KADRA ZESPOŁU</h1>
           <p className="text-blue-500 font-black text-xl md:text-2xl uppercase italic tracking-widest">{teamData.name}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
           {teamData.players?.map((player: any) => {
              const fullName = `${player.first_name} ${player.last_name}`.trim();
              const playerUrl = `/gracz/${fullName.replace(/\s+/g, '-').toLowerCase()}`;
              
              return (
                <Link key={player.id} href={playerUrl} className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-blue-500/40 transition-all relative block shadow-2xl">
                   <div className="aspect-[3/4.5] relative overflow-hidden">
                      <img 
                        src={player.photo_url || "https://i.ibb.co/S7RD8ZHj/images-removebg-preview-1.png"} 
                        alt="" 
                        className={`w-full h-full transition-all duration-1000 brightness-90 group-hover:brightness-110 ${
                          !player.photo_url ? "object-contain object-bottom scale-[0.85] opacity-90" : "object-cover group-hover:scale-110"
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-80" />
                      <div className="absolute top-4 right-6 text-5xl font-black text-white/10 group-hover:text-blue-500/20 transition-colors italic tracking-tighter">
                        {player.jersey_number || ""}
                      </div>
                   </div>
                   <div className="p-6 relative z-10 -mt-12">
                      <h4 className="text-lg font-black text-white uppercase truncate mb-1 italic tracking-tight">{player.last_name}</h4>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">{player.position || 'ZAWODNIK'}</p>
                   </div>
                </Link>
              );
           })}
           {(!teamData.players || teamData.players.length === 0) && (
              <div className="col-span-full py-40 flex flex-col items-center justify-center bg-white/[0.01] border border-white/5 rounded-[3rem] text-white/10">
                 <User className="w-20 h-20 mb-6 opacity-5" />
                 <span className="text-xs font-black uppercase tracking-[0.5em]">BRAK DANYCH O ZAWODNIKACH</span>
              </div>
           )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
