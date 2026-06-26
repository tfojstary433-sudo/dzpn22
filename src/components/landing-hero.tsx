'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Users, Trophy, Calendar, Heart, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';

export function LandingHero() {
  const [stats, setStats] = useState({
    teams: '10',
    players: '48',
    rounds: '3',
    matches: '48'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('https://league-builder.replit.app/api/public/stats.json');
        if (response.ok) {
          const data = await response.json();
          setStats({
            teams: data.teams?.toString() || '14',
            players: data.players?.toString() || '182',
            rounds: data.venues?.toString() || '3',
            matches: data.matches?.total?.toString() || '182'
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-20 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
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

      <div className="container mx-auto px-4 relative z-10 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side: Content */}
          <div className="flex flex-col gap-6 text-center lg:text-left">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <h1 className="text-white font-league text-6xl md:text-9xl lg:text-[11rem] leading-[0.8] md:leading-[0.75] tracking-[-0.04em] uppercase italic drop-shadow-2xl">
                  TWOJE BOISKO,
                </h1>
                <h1 className="text-blue-500 font-league text-6xl md:text-9xl lg:text-[11rem] leading-[0.8] md:leading-[0.75] tracking-[-0.04em] uppercase italic drop-shadow-2xl">
                  TWOJA LIGA!
                </h1>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-4 mt-2">
                <div className="h-px w-8 md:w-12 bg-blue-500/50 hidden sm:block" />
                <p className="text-[8px] md:text-[10px] font-black tracking-[0.3em] md:tracking-[0.4em] text-white/40 uppercase italic px-4 md:px-0">
                  Istniejemy od 2024 roku • 10.04.2026 wznowiono prace nad ligą
                </p>
              </div>
            </div>
            
            <p className="text-gray-200 text-lg md:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium px-4 md:px-0">
              Emocje, rywalizacja i pasja – wszystko, co kochasz w piłce nożnej, 
              znajdziesz właśnie tutaj. <span className="text-red-500 font-black cursor-pointer hover:text-red-400 transition-colors border-b-2 border-red-500 pb-0.5">Dołącz do gry!</span>
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mt-6 px-4 md:px-0">
              <Link 
                href="https://docs.google.com/forms/d/1HS7HHptyLKqg-4zKCB86upFlCNDP-QoFU0_Z1wEz3yw/edit#response=ACYDBNisR6-x5AAYQ3c_V4Ihs5qIakoKW4cGODIKdlkyCZUviG7U_VG4jJFgn1IVLthOFAItutaj" 
                target="_blank"
                className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 md:px-10 py-4 md:py-5 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 uppercase tracking-tighter shadow-[0_10px_30px_rgba(37,99,235,0.4)]"
              >
                <Calendar className="w-5 h-5 md:w-6 md:h-6" />
                ZAPISZ DRUŻYNĘ
              </Link>
              <button className="bg-transparent border-2 border-white/30 hover:bg-white hover:text-black text-white font-black px-8 md:px-10 py-4 md:py-5 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 uppercase tracking-tighter backdrop-blur-sm">
                <div className="w-0 h-0 border-t-[5px] md:border-t-[6px] border-t-transparent border-l-[8px] md:border-l-[10px] border-l-current border-b-[5px] md:border-b-[6px] border-b-transparent ml-1" />
                ZOBACZ WIĘCEJ
              </button>
            </div>
          </div>

          {/* Right Side: Large Logo */}
          <div className="flex justify-center items-center relative">
            <div className="relative w-[320px] h-[320px] md:w-[500px] md:h-[500px] animate-float">
               {/* Outer Glow */}
               <div className="absolute inset-0 bg-blue-600/25 rounded-full blur-[80px]" />
               <Image
                 src="https://i.ibb.co/Rkz8MRSy/IMG-4837.png"
                 alt="1 Liga Działdowska Logo"
                 fill
                 className="object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
               />
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-24 mb-12">
          <StatCard 
            icon={loading ? <Activity className="w-10 h-10 text-blue-500 animate-spin" /> : <Users className="w-10 h-10 text-blue-500" />}
            value={stats.teams}
            label="DRUŻYN"
            description="Najlepsze zespoły z całego powiatu"
          />
          <StatCard 
            icon={loading ? <Activity className="w-10 h-10 text-blue-500 animate-spin" /> : <Users className="w-10 h-10 text-blue-500" />}
            value={stats.players}
            label="ZAWODNIKÓW"
            description="Liczba zarejestrowanych piłkarzy"
          />
          <StatCard 
            icon={loading ? <Activity className="w-10 h-10 text-blue-500 animate-spin" /> : <Calendar className="w-10 h-10 text-blue-500" />}
            value={stats.rounds}
            label="KOLEJKI"
            description="Rozegrane serie spotkań"
          />
          <StatCard 
            icon={loading ? <Activity className="w-10 h-10 text-blue-500 animate-spin" /> : <Calendar className="w-10 h-10 text-blue-500" />}
            value={stats.matches}
            label="MECZÓW"
            description="Emocjonujące spotkania każdego sezonu"
          />
          <StatCard 
            icon={<Heart className="w-10 h-10 text-red-500" />}
            value="100%"
            label="PASJI"
            description="Jedna liga, jedna wspólna miłość"
          />
        </div>
      </div>

      {/* Bottom Banner - Updated to Blue/Red theme */}
      <div className="w-full bg-blue-600 py-6 mt-auto relative z-20 transform -skew-y-1 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
        <div className="container mx-auto px-4 transform skew-y-1 flex items-center justify-center gap-4">
          <span className="text-white font-black text-xl md:text-3xl uppercase tracking-tighter text-center italic">
            ★ DOŁĄCZ DO 1 LIGI DZIAŁDOWSKIEJ – GRAJ, RYWALIZUJ, ZDOBYWAJ TROFEA! ★
          </span>
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, value, label, description }: { icon: React.ReactNode; value: string; label: string; description: string }) {
  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/5 p-10 rounded-[2rem] flex flex-col items-center text-center group hover:bg-white/[0.06] hover:border-white/10 transition-all duration-500 hover:-translate-y-1 shadow-2xl">
      <div className="mb-8 p-4 rounded-2xl bg-blue-600/5 border border-blue-500/10 group-hover:scale-110 group-hover:bg-blue-600/10 transition-all duration-500">
        {icon}
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center gap-3">
          <span className="text-5xl font-black text-white italic tracking-tighter drop-shadow-lg">{value}</span>
          <span className="text-xl font-black text-blue-500 uppercase tracking-tighter">{label}</span>
        </div>
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest leading-relaxed max-w-[200px]">
          {description}
        </p>
      </div>
    </div>
  );
}
