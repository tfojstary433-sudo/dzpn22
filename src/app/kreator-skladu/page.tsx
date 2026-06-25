'use client';

import { useState, useEffect, useRef } from 'react';
import { MainNavbar } from '@/components/main-navbar';
import { Footer } from '@/components/footer';
import { getTeamLogo, getTeamName } from '@/lib/useMatchStats';
import { Search, X, Users, Save, Layout, Shield, User, Download, ChevronDown } from 'lucide-react';
import { toPng } from 'html-to-image';
import Image from 'next/image';

interface Player {
  userId: string;
  username: string;
  clubId: string;
  clubName: string;
  position: string;
  avatarUrl?: string;
  country?: string;
}

const FORMATIONS = {
  '4-4-2': [
    { pos: 'ST', top: '15%', left: '35%' }, { pos: 'ST', top: '15%', left: '65%' },
    { pos: 'LM', top: '45%', left: '15%' }, { pos: 'CM', top: '45%', left: '40%' }, { pos: 'CM', top: '45%', left: '60%' }, { pos: 'RM', top: '45%', left: '85%' },
    { pos: 'LB', top: '75%', left: '15%' }, { pos: 'CB', top: '75%', left: '40%' }, { pos: 'CB', top: '75%', left: '60%' }, { pos: 'RB', top: '75%', left: '85%' },
    { pos: 'BR', top: '90%', left: '50%' }
  ],
  '4-3-3': [
    { pos: 'LW', top: '15%', left: '20%' }, { pos: 'ST', top: '10%', left: '50%' }, { pos: 'RW', top: '15%', left: '80%' },
    { pos: 'CM', top: '45%', left: '25%' }, { pos: 'CDM', top: '55%', left: '50%' }, { pos: 'CM', top: '45%', left: '75%' },
    { pos: 'LB', top: '75%', left: '15%' }, { pos: 'CB', top: '75%', left: '40%' }, { pos: 'CB', top: '75%', left: '60%' }, { pos: 'RB', top: '75%', left: '85%' },
    { pos: 'BR', top: '90%', left: '50%' }
  ],
  '3-5-2': [
    { pos: 'ST', top: '15%', left: '35%' }, { pos: 'ST', top: '15%', left: '65%' },
    { pos: 'LM', top: '45%', left: '15%' }, { pos: 'CM', top: '50%', left: '35%' }, { pos: 'CAM', top: '40%', left: '50%' }, { pos: 'CM', top: '50%', left: '65%' }, { pos: 'RM', top: '45%', left: '85%' },
    { pos: 'CB', top: '75%', left: '25%' }, { pos: 'CB', top: '75%', left: '50%' }, { pos: 'CB', top: '75%', left: '75%' },
    { pos: 'BR', top: '90%', left: '50%' }
  ]
};

const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`glass-effect rounded-[24px] border border-white/5 overflow-hidden shadow-2xl ${className}`}>
    {children}
  </div>
);

export default function SquadBuilderPage() {
  const [formation, setFormation] = useState<keyof typeof FORMATIONS>('4-4-2');
  const [squad, setSquad] = useState<(Player | null)[]>(Array(11).fill(null));
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [displayMode, setDisplayMode] = useState<'club' | 'position' | 'number' | 'country'>('club');
  const [loading, setLoading] = useState(false);

  const captureRef = useRef<HTMLDivElement>(null);

  const getAvatarBase64 = async (username: string) => {
    try {
      const response = await fetch(`/api/roblox/avatar?username=${encodeURIComponent(username)}`);
      if (response.ok) {
        const { avatarUrl } = await response.json();
        // Convert to base64 to avoid CORS issues with html-to-image
        const imgRes = await fetch(avatarUrl);
        const blob = await imgRes.blob();
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }
    } catch (err) {
      console.error('Error getting avatar base64', err);
    }
    return null;
  };

  const saveAsImage = async () => {
    if (captureRef.current === null) return;
    
    try {
      const dataUrl = await toPng(captureRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `moj-sklad-pff-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('oops, something went wrong!', err);
    }
  };

  // Player Search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const searchPlayers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/players/search?q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          // Add random country for now if not present
          const mappedData = data.map((p: any) => ({
            ...p,
            country: p.country || 'PL'
          }));
          setSearchResults(mappedData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(searchPlayers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const addToSquad = async (player: Player) => {
    if (activeSlot !== null) {
      // Check if player is already in squad (excluding the active slot if it's the same player)
      if (squad.some((p, idx) => p?.userId === player.userId && idx !== activeSlot)) {
        alert('Ten zawodnik jest już w Twoim składzie!');
        return;
      }

      setLoading(true);
      const base64 = await getAvatarBase64(player.username);
      const newSquad = [...squad];
      newSquad[activeSlot] = { ...player, avatarUrl: base64 || player.avatarUrl };
      setSquad(newSquad);
      setActiveSlot(null);
      setSearchQuery('');
      setLoading(false);
    }
  };

  const removeFromSquad = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSquad = [...squad];
    newSquad[idx] = null;
    setSquad(newSquad);
  };

  const getPositionAbbreviation = (pos: string) => {
    const mapping: Record<string, string> = {
      'Bramkarz': 'GK',
      'Obrońca': 'DF',
      'Pomocnik': 'MF',
      'Napastnik': 'FW',
      'GK': 'GK', 'BR': 'GK',
      'CB': 'CB', 'LB': 'LB', 'RB': 'RB',
      'CM': 'CM', 'CDM': 'CDM', 'CAM': 'CAM', 'LM': 'LM', 'RM': 'RM',
      'ST': 'ST', 'LW': 'LW', 'RW': 'RW'
    };
    return mapping[pos] || pos;
  };

  const renderSlot = (idx: number, config: any) => {
    const player = squad[idx];
    const isActive = activeSlot === idx;

    return (
      <div 
        key={idx}
        onClick={() => setActiveSlot(idx)}
        style={{ top: config.top, left: config.left }}
        className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 cursor-pointer group transition-all duration-300 ${isActive ? 'scale-110 z-30' : 'hover:scale-105 z-10'}`}
      >
        <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full border-2 flex items-center justify-center transition-all duration-500 overflow-visible relative
          ${isActive ? 'border-blue-400 bg-blue-400/20 shadow-[0_0_30px_rgba(59,130,246,0.6)]' : 'border-white/10 bg-black/40 hover:border-white/30'}`}
        >
          {player ? (
            <>
              <div className="w-full h-full rounded-full overflow-hidden relative">
                <img 
                  src={player.avatarUrl || `https://www.roblox.com/headshot-thumbnail/image?userId=${player.userId}&width=150&height=150&format=png`} 
                  alt={player.username} 
                  className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              
              {/* Badge Overlay (Flag/Club/Position/Number) */}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-2 border-white/20 overflow-hidden bg-black/80 backdrop-blur-sm z-20 flex items-center justify-center shadow-lg">
                 {displayMode === 'club' ? (
                   <img src={getTeamLogo(player.clubId)} alt="" className="w-5 h-5 object-contain" />
                 ) : displayMode === 'position' ? (
                   <span className="text-[10px] font-black text-white">{getPositionAbbreviation(player.position)}</span>
                 ) : displayMode === 'number' ? (
                   <span className="text-[11px] font-black text-blue-400">#{Math.floor(Math.random() * 99) + 1}</span>
                 ) : (
                   <span className={`fi fi-${(player.country || 'PL').toLowerCase()} scale-[2] rounded-full`}></span>
                 )}
              </div>

              <button 
                onClick={(e) => removeFromSquad(idx, e)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-30 hover:scale-110 shadow-lg"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1 opacity-20 group-hover:opacity-40 transition-opacity">
              <Users className="w-8 h-8 text-white" />
              <span className="text-[10px] font-black text-white">{config.pos}</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] md:text-[12px] font-black text-white border border-white/10 uppercase tracking-tighter whitespace-nowrap min-w-[90px] text-center shadow-2xl">
            {player ? player.username : config.pos}
          </div>
          {player && (
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {displayMode === 'club' ? getTeamName(player.clubId) : 
               displayMode === 'position' ? player.position : 
               displayMode === 'country' ? 'Polska' : 
               ''}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="bg-[#020617] min-h-screen text-white font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      <MainNavbar />
      
      {/* Background Section */}
      <div className="fixed inset-0 z-0">
        <Image
          src="https://i.ibb.co/YCB7X52/obraz-2026-06-13-150303737.png"
          alt="Stadium Background"
          fill
          className="object-cover brightness-[0.4] scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/80 via-[#020617]/40 to-[#020617]/90" />
        
        {/* Animated Glows */}
        <div className="absolute top-1/4 -left-20 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
      
      {/* Flag icons CSS */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.0.0/css/flag-icons.min.css" />
      <style>{`
        .fi {
          border-radius: 50% !important;
          background-size: cover !important;
          background-position: center !important;
        }
      `}</style>

      <main className="container mx-auto px-4 py-32 max-w-[1600px]">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Pitch Visualization */}
          <div className="flex-1 w-full" ref={captureRef}>
            <GlassCard className="aspect-[4/3] relative overflow-hidden bg-green-900/10 border-green-500/20 w-full">
              {/* Pitch Background Image */}
              <div className="absolute inset-0 bg-[url('https://i.ibb.co/mCNVZdMn/osr-4.png')] bg-cover bg-center opacity-40 mix-blend-overlay" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-900/5 to-green-900/20" />

              {/* Pitch Markings */}
              <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[15%] border-x border-b border-white" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[15%] border-x border-t border-white" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-[5%] border-x border-b border-white" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/4 h-[5%] border-x border-t border-white" />
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white/50" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20%] aspect-square border-2 border-white rounded-full" />
                <div className="absolute inset-8 border-2 border-white/20 rounded-[2rem]" />
              </div>

              {/* Player Slots */}
              <div className="relative z-10 h-full w-full">
                {FORMATIONS[formation].map((config, idx) => renderSlot(idx, config))}
              </div>

              {/* Formation Label */}
              <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl">
                <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Formacja: {formation}</span>
              </div>

              {/* Logo Overlay */}
              <div className="absolute bottom-6 right-6 opacity-20 grayscale">
                <img src="https://i.ibb.co/TB027G07/czarnepff-1.png" alt="PFF" className="h-12 w-auto" crossOrigin="anonymous" />
              </div>
            </GlassCard>
          </div>

          {/* Sidebar Controls */}
          <div className="w-full lg:w-[400px] flex flex-col gap-6 shrink-0">
            <GlassCard className="p-8 bg-black/40 backdrop-blur-3xl">
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2 italic">Kreator Składu</h1>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">Zbuduj swoją wymarzoną jedenastkę PFF. Kliknij w pozycję na boisku, aby dodać zawodnika.</p>

              <div className="flex flex-col gap-8">
                {/* Formation Selection */}
                <div className="flex flex-col gap-3">
                  <label className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 opacity-60">
                    <ChevronDown className="w-3 h-3" />
                    Wybierz formację
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.keys(FORMATIONS).map(f => (
                      <button 
                        key={f}
                        onClick={() => {
                          setFormation(f as keyof typeof FORMATIONS);
                          // Reset squad if positions differ significantly? Or just keep
                        }}
                        className={`py-3 rounded-xl text-[11px] font-black transition-all border ${formation === f ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Display Mode Toggle */}
                <div className="flex flex-col gap-3">
                  <label className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 opacity-60">
                    <Layout className="w-3 h-3" />
                    Wyświetlaj pod nazwiskiem
                  </label>
                  <div className="grid grid-cols-4 gap-1 bg-white/5 p-1 rounded-xl">
                    {(['club', 'position', 'number', 'country'] as const).map(mode => (
                      <button 
                        key={mode} 
                        onClick={() => setDisplayMode(mode)} 
                        className={`py-2.5 text-[10px] font-black uppercase rounded-lg transition-all ${displayMode === mode ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                      >
                        {mode === 'club' ? 'Klub' : mode === 'position' ? 'Pozycja' : mode === 'number' ? 'Numer' : 'Kraj'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Player Search */}
                <div className="flex flex-col gap-3">
                  <label className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 opacity-60">
                    <Search className="w-3 h-3" />
                    Wyszukaj zawodnika
                  </label>
                  <div className="relative group">
                    <input 
                      type="text" 
                      placeholder={activeSlot !== null ? `Szukaj dla pozycji ${FORMATIONS[formation][activeSlot].pos}...` : "Najpierw wybierz pozycję..."} 
                      disabled={activeSlot === null}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed group-hover:border-white/20"
                    />
                    <Search className={`absolute right-5 top-4.5 w-4 h-4 transition-colors ${activeSlot !== null ? 'text-blue-500' : 'text-gray-600'}`} />
                  </div>

                  {/* Search Results */}
                  <div className="bg-black/40 rounded-3xl border border-white/5 overflow-hidden flex flex-col min-h-[350px] max-h-[450px] shadow-2xl">
                    {activeSlot === null ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-6">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
                          <Users className="w-10 h-10 text-white/10" />
                        </div>
                        <p className="text-gray-500 text-xs italic max-w-[200px] leading-relaxed uppercase tracking-tighter font-bold">Wybierz miejsce na boisku, aby przypisać zawodnika</p>
                      </div>
                    ) : (
                      <>
                        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Wyniki wyszukiwania</span>
                          {loading && <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
                          {searchResults.length > 0 ? (
                            searchResults.map(player => (
                              <button 
                                key={player.userId} 
                                onClick={() => addToSquad(player)} 
                                className="flex items-center gap-4 w-full p-3 hover:bg-white/5 rounded-2xl transition-all group border border-transparent hover:border-white/10 text-left"
                              >
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-white/5 border border-white/10 shrink-0">
                                  <img 
                                    src={`https://www.roblox.com/headshot-thumbnail/image?userId=${player.userId}&width=150&height=150&format=png`} 
                                    alt="" 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                                    onError={(e) => {
                                       const target = e.target as HTMLImageElement;
                                       target.src = `https://www.roblox.com/headshot-thumbnail/image?userId=1&width=150&height=150&format=png`;
                                    }}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-black text-white group-hover:text-blue-400 transition-colors truncate">{player.username}</div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`fi fi-${(player.country || 'PL').toLowerCase()} w-3 h-2 rounded-sm shrink-0 opacity-60`}></span>
                                    <div className="text-[10px] text-gray-500 truncate uppercase tracking-wider font-bold">
                                      {player.clubName}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 gap-4 opacity-20">
                              <User className="w-12 h-12 text-white" />
                              <p className="text-white text-xs font-black uppercase tracking-tighter">{searchQuery.length < 2 ? 'Wpisz nick gracza' : 'Nie znaleziono'}</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <button 
                  onClick={saveAsImage}
                  className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-black uppercase rounded-[2rem] transition-all shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-3 group"
                >
                  <Download className="w-5 h-5 group-hover:bounce transition-transform" />
                  Pobierz grafikę składu
                </button>
              </div>
            </GlassCard>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
