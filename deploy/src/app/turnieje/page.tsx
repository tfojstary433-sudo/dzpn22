'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { teams, friendlyMatchesData, extraTeams, cupMatchesData } from '@/lib/data';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

function TurniejeContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  
  const [activeTournament, setActiveTournament] = useState<'puchar' | 'towarzyskie'>(
    type === 'towarzyskie' ? 'towarzyskie' : 'puchar'
  );
  
  useEffect(() => {
    if (type === 'towarzyskie') {
      setActiveTournament('towarzyskie');
    } else if (type === 'puchar') {
      setActiveTournament('puchar');
    }
  }, [type]);

  const [friendlyTab, setFriendlyTab] = useState<'schedule' | 'table'>('schedule');
  const pucharPolskiLogo = "https://i.ibb.co/N6MvSMh1/PUCHAR-POLSKI.png";
  
  const friendlyMatches = friendlyMatchesData;
  const cupMatches = cupMatchesData;

  const friendlyStandings = teams.map(team => ({
    team,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gf: 0,
    ga: 0,
    pts: 0
  }));

  return (
    <div className="bg-[#050000] text-white min-h-screen">
      <Navbar />
      
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
      
      {/* Tournament Selector Panel */}
      <div className="bg-[#050505] border-b border-white/5 sticky top-[72px] z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-center md:justify-start gap-4 py-3">
            <button 
              onClick={() => setActiveTournament('puchar')}
              className={`px-6 py-2.5 rounded-xl font-bold uppercase tracking-tight transition-all duration-300 text-sm ${
                activeTournament === 'puchar' 
                  ? 'bg-[#B21118] text-white shadow-lg shadow-[#B21118]/20' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              PUCHAR POLSKI
            </button>
            <button 
              onClick={() => setActiveTournament('towarzyskie')}
              className={`px-6 py-2.5 rounded-xl font-bold uppercase tracking-tight transition-all duration-300 text-sm ${
                activeTournament === 'towarzyskie' 
                  ? 'bg-[#00ccff] text-white shadow-lg shadow-[#00ccff]/20' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              MECZE TOWARZYSKIE
            </button>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden min-h-screen">
        {/* Textured Dynamic Background */}
        <div className="fixed inset-0 z-0 pointer-events-none transition-colors duration-1000">
          <div className={`absolute inset-0 bg-gradient-to-br transition-colors duration-1000 ${
            activeTournament === 'puchar' 
              ? 'from-[#1a0000] via-[#050000] to-[#2a0000]' 
              : 'from-[#000a1a] via-[#000000] to-[#001a2a]'
          }`} />
          <div 
            className="absolute inset-0 opacity-20 transition-all duration-1000" 
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, ${activeTournament === 'puchar' ? '#B21118' : '#00ccff'} 0, ${activeTournament === 'puchar' ? '#B21118' : '#00ccff'} 2px, transparent 0, transparent 40px)`,
            }}
          />
          <div className={`absolute top-1/4 -left-1/4 w-1/2 h-1/2 blur-[150px] rounded-full transition-all duration-1000 ${
            activeTournament === 'puchar' ? 'bg-[#B21118]/10' : 'bg-[#00ccff]/10'
          }`} />
          <div className={`absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 blur-[150px] rounded-full transition-all duration-1000 ${
            activeTournament === 'puchar' ? 'bg-[#B21118]/10' : 'bg-[#00ccff]/10'
          }`} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
        </div>

        <div className="relative z-10">
          {activeTournament === 'puchar' ? (
            <div key="puchar-section">
              {/* Hero Section */}
              <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-[#DC143C]/20 to-transparent z-0" />
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#B21118]/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#D4AF37]/5 blur-[120px] rounded-full" />
                
                <div className="relative z-10 container mx-auto px-4">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                      <h1 className="text-8xl md:text-[10rem] font-[1000] italic tracking-tighter text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.3)] leading-[0.85]">
                        PUCHAR<br />POLSKI
                      </h1>
                      <div className="mt-10 flex items-center gap-6">
                        <span className="h-px w-16 bg-[#D4AF37]" />
                        <span className="text-[#D4AF37] font-black tracking-[0.4em] uppercase text-2xl drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]">SEZON 2025/26</span>
                      </div>
                    </div>
                    <div className="flex-1 flex justify-center md:justify-end">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-white/20 blur-[100px] group-hover:bg-white/30 transition-all duration-500 rounded-full" />
                        <Image
                          src={pucharPolskiLogo}
                          alt="Puchar Polski"
                          width={600}
                          height={600}
                          className="relative drop-shadow-[0_0_80px_rgba(255,255,255,0.2)] animate-float w-full max-w-[400px] md:max-w-[600px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Internal Nav */}
              <div className="container mx-auto px-4 -mt-10 relative z-20">
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex gap-2">
                  <button className="flex-1 py-4 px-6 rounded-xl bg-gradient-to-br from-[#B21118] to-[#800c11] text-white font-black uppercase tracking-tight shadow-lg shadow-[#B21118]/20 transition-all">
                    Drabinka & Terminarz
                  </button>
                  <Link href="/#aktualnosci" className="flex-1">
                    <button className="w-full py-4 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-black uppercase tracking-tight transition-all">
                      Aktualności
                    </button>
                  </Link>
                  <Link href="/turnieje/historia" className="flex-1">
                    <button className="w-full py-4 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-black uppercase tracking-tight transition-all">
                      Historia
                    </button>
                  </Link>
                </div>
              </div>

              {/* Bracket Area */}
              <div className="container mx-auto px-4 py-16 overflow-x-auto">
                <div className="min-w-[1000px] flex justify-between gap-8 pb-12">
                  {cupMatches.map((round, roundIdx) => (
                    <div key={roundIdx} className="flex-1 flex flex-col">
                      <div className="flex items-center gap-4 mb-12 px-2">
                        <div className="w-1.5 h-6 bg-[#B21118] rounded-full" />
                        <h2 className="text-xl font-black uppercase tracking-tight italic whitespace-nowrap">{round.round}</h2>
                      </div>
                      <div className="flex flex-col justify-around flex-1 gap-8">
                        {round.matches.map((match) => (
                          <div key={match.id} className="relative group">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.08] transition-all duration-300 relative z-10 w-full group/card">
                              <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {match.homeTeam ? (
                                      <>
                                        <Image src={match.homeTeam.logo} alt="" width={24} height={24} className="w-6 h-6 object-contain" />
                                        <span className="text-sm font-bold uppercase tracking-tight truncate max-w-[120px] group-hover/card:text-[#B21118] transition-colors">{match.homeTeam.name}</span>
                                      </>
                                    ) : (
                                      <span className="text-sm font-black text-white/10 italic">TBD</span>
                                    )}
                                  </div>
                                  <span className="text-sm font-black text-white/40">-</span>
                                </div>
                                <div className="h-px bg-white/5 w-full" />
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {match.awayTeam ? (
                                      <>
                                        <Image src={match.awayTeam.logo} alt="" width={24} height={24} className="w-6 h-6 object-contain" />
                                        <span className="text-sm font-bold uppercase tracking-tight truncate max-w-[120px] group-hover/card:text-[#B21118] transition-colors">{match.awayTeam.name}</span>
                                      </>
                                    ) : (
                                      <span className="text-sm font-black text-white/10 italic">TBD</span>
                                    )}
                                  </div>
                                  <span className="text-sm font-black text-white/40">-</span>
                                </div>
                                
                                {match.homeTeam && match.awayTeam && (match as any).stadium && (
                                  <div className="mt-2 pt-2 border-t border-white/5 flex flex-col gap-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest truncate">{(match as any).stadium}</span>
                                    <span className="text-[7px] font-bold text-[#B21118] uppercase tracking-[0.2em]">{(match as any).category}</span>
                                  </div>
                                )}
                              </div>
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#B21118] text-[10px] font-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                {match.date} @ {match.time}
                              </div>
                            </div>
                            {roundIdx < cupMatches.length - 1 && (
                              <div className="hidden lg:block absolute left-full top-1/2 w-8 h-px bg-white/10 -translate-y-1/2" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-4 mb-12 px-2">
                      <div className="w-1.5 h-6 bg-gradient-to-b from-[#B21118] to-[#D4AF37] rounded-full" />
                      <h2 className="text-xl font-black uppercase tracking-tight italic whitespace-nowrap">FINAŁ</h2>
                    </div>
                    <div className="flex flex-col justify-around flex-1">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-[#D4AF37]/5 blur-2xl rounded-full" />
                        <div className="relative bg-gradient-to-br from-[#D4AF37]/20 to-black/40 border border-[#D4AF37]/30 rounded-2xl p-8 text-center">
                          <Image src={pucharPolskiLogo} alt="Trophy" width={60} height={60} className="mx-auto mb-4 opacity-50 grayscale" />
                          <span className="block text-[#D4AF37] text-xs font-black uppercase tracking-widest mb-1">PGE Narodowy</span>
                          <span className="block text-white font-black italic">MAJ 2026</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Finals Banner */}
                <div className="mt-20 relative rounded-[2rem] overflow-hidden border border-[#D4AF37]/30 bg-gradient-to-br from-[#400609] to-[#0a0a0a] p-12 text-center">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                  <div className="relative z-10">
                    <Image src={pucharPolskiLogo} alt="Final" width={150} height={150} className="mx-auto mb-6 opacity-50 grayscale contrast-125" />
                    <h3 className="text-[#D4AF37] font-bold tracking-[0.3em] uppercase mb-2">Wielki Finał</h3>
                    <h2 className="text-5xl font-black italic uppercase tracking-tight mb-6">PGE NARODOWY</h2>
                    <div className="inline-block px-8 py-3 rounded-full border border-white/20 bg-white/5 font-black uppercase text-xl">
                      2 MAJA 2026
                    </div>
                  </div>
                  <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#B21118]/20 blur-[100px] rounded-full" />
                  <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#D4AF37]/10 blur-[100px] rounded-full" />
                </div>
              </div>
            </div>
          ) : (
            <div key="friendly-section" className="pb-20">
              {/* Friendly Hero */}
              <div className="relative h-[50vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-[#00ccff]/10 to-transparent z-0" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#00ccff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                </div>
                
                <div className="relative z-10 container mx-auto px-4">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
                    {/* Left Side Text */}
                    <div className="hidden md:flex flex-col items-end text-right">
                      <span className="text-[#00ccff] text-4xl lg:text-5xl font-black italic uppercase tracking-tighter leading-none mb-2 drop-shadow-[0_0_20px_rgba(0,204,255,0.5)]">PRZYGOTOWANIA</span>
                      <span className="text-white/50 text-xs lg:text-sm font-black uppercase tracking-[0.5em]">DO SEZONU 2026</span>
                    </div>

                    {/* Central Logo */}
                    <div className="relative group shrink-0">
                      <div className="absolute inset-0 bg-[#00ccff]/20 blur-[50px] rounded-full scale-110 opacity-40 group-hover:opacity-80 transition-opacity duration-700" />
                      <Image 
                        src="https://i.ibb.co/9960T9N2/obraz-2026-01-13-020503777.png" 
                        alt="Mecze Towarzyskie" 
                        width={600} 
                        height={200} 
                        className="relative w-full max-w-[240px] md:max-w-[380px] lg:max-w-[450px] h-auto drop-shadow-[0_0_20px_rgba(0,204,255,0.3)] transition-transform duration-500 hover:scale-105"
                        priority
                      />
                    </div>

                    {/* Right Side Text */}
                    <div className="hidden md:flex flex-col items-start text-left">
                      <span className="text-[#00ccff] text-4xl lg:text-5xl font-black italic uppercase tracking-tighter leading-none mb-2 drop-shadow-[0_0_20px_rgba(0,204,255,0.5)]">NOWE TALENTY</span>
                      <span className="text-white/50 text-xs lg:text-sm font-black uppercase tracking-[0.5em]">SPRAWDZIANY FORMY</span>
                    </div>
                  </div>

                  {/* Mobile Only Subtitle */}
                  <div className="md:hidden mt-8 text-center bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                    <p className="text-[#00ccff] font-black uppercase tracking-widest text-sm mb-1">Przygotowania do sezonu</p>
                    <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-xs">Nowe talenty • Sprawdziany formy</p>
                  </div>
                </div>
              </div>

              {/* Internal Nav Tabs */}
              <div className="container mx-auto px-4 -mt-10 relative z-20 mb-12">
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex gap-2 max-w-md mx-auto">
                  <button 
                    onClick={() => setFriendlyTab('schedule')}
                    className={`flex-1 py-4 px-6 rounded-xl font-black uppercase tracking-tight transition-all ${
                      friendlyTab === 'schedule' 
                        ? 'bg-gradient-to-br from-[#00ccff] to-[#0088aa] text-black shadow-lg shadow-[#00ccff]/20' 
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Terminarz
                  </button>
                  <button 
                    onClick={() => setFriendlyTab('table')}
                    className={`flex-1 py-4 px-6 rounded-xl font-black uppercase tracking-tight transition-all ${
                      friendlyTab === 'table' 
                        ? 'bg-gradient-to-br from-[#00ccff] to-[#0088aa] text-black shadow-lg shadow-[#00ccff]/20' 
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Tabela
                  </button>
                </div>
              </div>

              <div className="container mx-auto px-4">
                {friendlyTab === 'schedule' ? (
                  <>
                    {/* Featured Next Match */}
                    <div className="mb-20 relative z-20">
                      <Link href={`/mecz/${friendlyMatches[0].matches[0].id}`}>
                        <div className="bg-gradient-to-br from-[#00ccff]/20 to-black border border-[#00ccff]/30 rounded-[2.5rem] p-8 md:p-12 overflow-hidden group hover:border-[#00ccff]/60 transition-all duration-500">
                          <div className="absolute top-0 right-0 p-8">
                            <div className="px-4 py-1 bg-[#00ccff] text-black font-black italic rounded-full text-sm animate-pulse">
                              NAJBLIŻSZY MECZ
                            </div>
                          </div>
                          
                          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                            <div className="flex-1 flex flex-col items-center gap-4">
                              <div className="relative">
                                <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Image src={friendlyMatches[0].matches[0].homeTeam.logo} alt="" width={150} height={150} className="relative w-32 h-32 md:w-40 md:h-40 object-contain" />
                              </div>
                              <span className="text-2xl font-black uppercase tracking-tight">{friendlyMatches[0].matches[0].homeTeam.name}</span>
                            </div>
                            
                            <div className="flex flex-col items-center gap-6">
                              <div className="flex flex-col items-center">
                                <span className="text-white/40 font-bold uppercase tracking-widest text-sm mb-2">{friendlyMatches[0].matches[0].date}</span>
                                <div className="text-6xl md:text-7xl font-[1000] italic text-white bg-white/5 px-10 py-4 rounded-3xl border border-white/10">
                                  {friendlyMatches[0].matches[0].time}
                                </div>
                              </div>
                              <div className="text-center">
                                <span className="block text-[#00ccff] font-black uppercase tracking-tighter mb-1">{friendlyMatches[0].matches[0].stadium}</span>
                                <span className="text-white/20 font-bold uppercase text-xs">{friendlyMatches[0].matches[0].category}</span>
                              </div>
                            </div>

                            <div className="flex-1 flex flex-col items-center gap-4">
                              <div className="relative">
                                <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Image src={friendlyMatches[0].matches[0].awayTeam.logo} alt="" width={150} height={150} className="relative w-32 h-32 md:w-40 md:h-40 object-contain" />
                              </div>
                              <span className="text-2xl font-black uppercase tracking-tight">{friendlyMatches[0].matches[0].awayTeam.name}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>

                    {/* All Upcoming Friendlies */}
                    <div className="space-y-20">
                      {friendlyMatches.map((round, idx) => (
                        <div key={idx}>
                          <div className="flex items-center gap-6 mb-12">
                            <div className="w-2 h-10 bg-[#00ccff] rounded-full shadow-[0_0_20px_rgba(0,204,255,0.5)]" />
                            <h2 className="text-4xl font-black uppercase tracking-tighter italic">{round.round}</h2>
                            <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent" />
                          </div>
                          
                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {round.matches.map((match) => (
                              <div key={match.id} className="group relative bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 hover:border-[#00ccff]/30 transition-all duration-500 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#00ccff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="relative flex items-center justify-between gap-6">
                                  <div className="flex-1 flex items-center gap-6">
                                    <Image src={match.homeTeam.logo} alt="" width={64} height={64} className="w-16 h-16 object-contain" />
                                    <div className="flex flex-col">
                                      <span className="text-xl font-black uppercase tracking-tight leading-none mb-1">{match.homeTeam.name}</span>
                                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Gospodarz</span>
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-center shrink-0 px-8 border-x border-white/5">
                                    <span className="text-xs font-black text-[#00ccff] italic mb-1 uppercase">{match.time}</span>
                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{match.date}</span>
                                  </div>

                                  <div className="flex-1 flex items-center justify-end gap-6 text-right">
                                    <div className="flex flex-col">
                                      <span className="text-xl font-black uppercase tracking-tight leading-none mb-1">{match.awayTeam.name}</span>
                                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Gość</span>
                                    </div>
                                    <Image src={match.awayTeam.logo} alt="" width={64} height={64} className="w-16 h-16 object-contain" />
                                  </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-black text-white/60 uppercase tracking-widest mb-0.5">{match.stadium}</span>
                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{match.category}</span>
                                  </div>
                                  <Link href={`/mecz/${match.id}`}>
                                    <button className="px-6 py-2 bg-white/5 hover:bg-[#00ccff] hover:text-black transition-all rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 hover:border-transparent">
                                      SZCZEGÓŁY
                                    </button>
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="max-w-5xl mx-auto">
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#00ccff]/10 border-b border-white/10">
                            <th className="py-6 px-8 text-xs font-black uppercase tracking-widest text-[#00ccff]">Poz</th>
                            <th className="py-6 px-8 text-xs font-black uppercase tracking-widest text-[#00ccff]">Drużyna</th>
                            <th className="py-6 px-4 text-xs font-black uppercase tracking-widest text-[#00ccff] text-center">M</th>
                            <th className="py-6 px-4 text-xs font-black uppercase tracking-widest text-[#00ccff] text-center">W</th>
                            <th className="py-6 px-4 text-xs font-black uppercase tracking-widest text-[#00ccff] text-center">R</th>
                            <th className="py-6 px-4 text-xs font-black uppercase tracking-widest text-[#00ccff] text-center">P</th>
                            <th className="py-6 px-4 text-xs font-black uppercase tracking-widest text-[#00ccff] text-center">G+</th>
                            <th className="py-6 px-4 text-xs font-black uppercase tracking-widest text-[#00ccff] text-center">G-</th>
                            <th className="py-6 px-8 text-xs font-black uppercase tracking-widest text-[#00ccff] text-center">Pkt</th>
                          </tr>
                        </thead>
                        <tbody>
                          {friendlyStandings.map((row, i) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                              <td className="py-5 px-8">
                                <span className={`text-lg font-black italic ${i < 3 ? 'text-[#00ccff]' : 'text-white/40'}`}>
                                  {(i + 1).toString().padStart(2, '0')}
                                </span>
                              </td>
                              <td className="py-5 px-8">
                                <div className="flex items-center gap-4">
                                  <Image src={row.team.logo} alt="" width={32} height={32} className="w-8 h-8 object-contain" />
                                  <span className="font-black uppercase tracking-tight group-hover:text-[#00ccff] transition-colors">{row.team.name}</span>
                                </div>
                              </td>
                              <td className="py-5 px-4 text-center font-bold text-white/60">{row.played}</td>
                              <td className="py-5 px-4 text-center font-bold text-green-500/80">{row.won}</td>
                              <td className="py-5 px-4 text-center font-bold text-white/40">{row.drawn}</td>
                              <td className="py-5 px-4 text-center font-bold text-red-500/80">{row.lost}</td>
                              <td className="py-5 px-4 text-center font-bold text-white/40">{row.gf}</td>
                              <td className="py-5 px-4 text-center font-bold text-white/40">{row.ga}</td>
                              <td className="py-5 px-8 text-center">
                                <span className="text-xl font-black italic text-[#00ccff] drop-shadow-[0_0_10px_rgba(0,204,255,0.3)]">
                                  {row.pts}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-8 flex items-center gap-8 justify-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500/80 rounded-full" />
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Wygrane</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-white/40 rounded-full" />
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Remisy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500/80 rounded-full" />
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Porażki</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default function TurniejePage() {
  return (
    <Suspense fallback={
      <div className="bg-[#050000] text-white min-h-screen flex items-center justify-center">
        <div className="text-2xl font-black animate-pulse">ŁADOWANIE...</div>
      </div>
    }>
      <TurniejeContent />
    </Suspense>
  );
}
