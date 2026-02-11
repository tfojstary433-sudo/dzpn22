'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import Image from 'next/image';
import Link from 'next/link';

export default function HistoriaPage() {
  const pucharPolskiLogo = "https://i.ibb.co/N6MvSMh1/PUCHAR-POLSKI.png";

  const history = [
    { year: '2024/25', winner: 'Unia Skierniewice', runnerUp: 'Lechia Gdańsk', score: '2:1', stadium: 'PGE Narodowy' },
    { year: '2023/24', winner: 'Legia Warszawa', runnerUp: 'Lech Poznań', score: '1:0', stadium: 'PGE Narodowy' },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        {/* Hero */}
        <div className="relative h-[40vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#B21118]/20 to-transparent">
          <div className="relative z-10 flex flex-col items-center">
            <Image
              src={pucharPolskiLogo}
              alt="Puchar Polski"
              width={200}
              height={200}
              className="opacity-50 grayscale"
            />
            <h1 className="mt-6 text-5xl font-black italic tracking-tighter uppercase">Historia Rozgrywek</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-10 relative z-20">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex gap-2">
            <Link href="/turnieje" className="flex-1">
                <button className="w-full py-4 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-black uppercase tracking-tighter transition-all">
                Drabinka & Terminarz
                </button>
            </Link>
            <Link href="/#aktualnosci" className="flex-1">
                <button className="w-full py-4 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-black uppercase tracking-tighter transition-all">
                Aktualności
                </button>
            </Link>
            <button className="flex-1 py-4 px-6 rounded-xl bg-gradient-to-br from-[#B21118] to-[#800c11] text-white font-black uppercase tracking-tighter shadow-lg shadow-[#B21118]/20 transition-all">
                Historia
            </button>
            </div>
        </div>

        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-6">
              {history.map((item, index) => (
                <div key={index} className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/[0.08] transition-all group">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                      <span className="text-[#D4AF37] font-bold tracking-widest uppercase text-sm">{item.year}</span>
                      <h2 className="text-3xl font-black uppercase tracking-tighter mt-1">{item.winner}</h2>
                      <p className="text-white/40 mt-2 italic">{item.stadium}</p>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="text-4xl font-black italic bg-[#B21118] px-6 py-2 rounded-xl shadow-lg">
                        {item.score}
                      </div>
                      <span className="text-[10px] font-bold text-white/20 mt-3 uppercase tracking-[0.3em]">Finał</span>
                    </div>

                    <div className="text-center md:text-right">
                      <span className="text-white/20 font-bold tracking-widest uppercase text-sm">Finalista</span>
                      <h3 className="text-2xl font-black text-white/60 uppercase tracking-tighter mt-1">{item.runnerUp}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-20 text-center p-12 rounded-[2rem] border border-white/5 bg-white/[0.02]">
                <p className="text-white/40 italic">Więcej historycznych danych zostanie dodanych wkrótce...</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
