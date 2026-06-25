'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Youtube, Menu, X, Search, Trophy, Users as UsersIcon, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '../lib/utils';

export function MainNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ teams: any[], players: any[] }>({ teams: [], players: [] });
  const [searching, setSearching] = useState(false);
  const [showCup, setShowCup] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    const checkCupTime = () => {
      const drawDate = new Date('2026-06-30T17:00:00');
      const isFinished = localStorage.getItem('county_cup_draw_finished') === 'true';
      setShowCup(new Date() >= drawDate || isFinished);
    };

    window.addEventListener('scroll', handleScroll);
    checkCupTime();
    const interval = setInterval(checkCupTime, 10000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults({ teams: [], players: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const [teamsRes, playersRes] = await Promise.all([
          fetch(`https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/tables?season_id=1`),
          fetch(`https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/players`)
        ]);
        
        const teamsData = await teamsRes.json();
        const playersData = await playersRes.json();

        if (Array.isArray(teamsData) && Array.isArray(playersData)) {
          const filteredTeams = teamsData.filter(t => 
            t.team_name.toLowerCase().includes(searchQuery.toLowerCase())
          ).slice(0, 3);

          const filteredPlayers = playersData.filter(p => {
            const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
            return fullName.includes(searchQuery.toLowerCase());
          }).slice(0, 5);

          setSearchResults({ teams: filteredTeams, players: filteredPlayers });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const navLinks = [
    { href: '/', label: 'STRONA GŁÓWNA' },
    { href: '/tabela', label: 'TABELA' },
    { href: '/terminarz', label: 'TERMINARZ' },
    { href: '/tabela?tab=champions_cup', label: 'PUCHAR MISTRZÓW' },
    ...(showCup ? [{ href: '/tabela?tab=county_cup', label: 'PUCHAR POWIATU' }] : []),
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
      scrolled ? 'bg-white/5 backdrop-blur-lg py-2 shadow-2xl border-b border-white/10' : 'bg-transparent py-6'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="relative w-20 h-20 md:w-32 md:h-32 shrink-0 group">
             <Image
               src="https://i.ibb.co/Rkz8MRSy/IMG-4837.png"
               alt="1 Liga Działdowska Logo"
               fill
               className="object-contain transition-transform group-hover:scale-110"
             />
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden xl:flex items-center gap-6 2xl:gap-8">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link 
                  href={link.href}
                  className="text-white font-bold text-sm tracking-tighter hover:text-blue-500 transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8 relative">
             <div className="relative w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="SZUKAJ DRUŻYNY LUB ZAWODNIKA..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-full py-3 pl-12 pr-6 text-[10px] font-bold text-white placeholder:text-white/20 focus:outline-none focus:bg-white/[0.08] focus:border-blue-500/50 transition-all uppercase tracking-widest"
                />
                
                {/* Search Results Dropdown */}
                {searchOpen && (searchQuery.length >= 2) && (
                  <div className="absolute top-[calc(100%+10px)] left-0 right-0 bg-[#0b1629]/95 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-4 shadow-2xl z-[110] animate-in fade-in slide-in-from-top-2 duration-300">
                    {searching ? (
                      <div className="py-8 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                      </div>
                    ) : (searchResults.teams.length === 0 && searchResults.players.length === 0) ? (
                      <div className="py-8 text-center text-white/20 text-[10px] font-bold uppercase tracking-widest">
                         Brak wyników
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {searchResults.teams.length > 0 && (
                          <div className="flex flex-col gap-2">
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] px-2 mb-1">DRUŻYNY</span>
                            {searchResults.teams.map((t) => (
                              <Link 
                                key={t.team_id}
                                href={`/klub/${t.team_id}`}
                                onClick={() => setSearchOpen(false)}
                                className="flex items-center gap-3 p-2 hover:bg-white/[0.05] rounded-xl transition-colors group"
                              >
                                <div className="w-10 h-10 rounded-lg bg-white/[0.03] p-1.5 flex items-center justify-center border border-white/5 group-hover:border-blue-500/30 transition-colors">
                                  <img src={t.team_logo_url} alt="" className="w-full h-full object-contain" />
                                </div>
                                <span className="text-[11px] font-black text-white/80 tracking-tighter">{t.team_name}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                        
                        {searchResults.players.length > 0 && (
                          <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] px-2 mb-1">ZAWODNICY</span>
                            {searchResults.players.map((p) => {
                              const fullName = `${p.first_name} ${p.last_name}`.trim();
                              return (
                                <Link 
                                  key={p.id}
                                  href={`/gracz/${fullName.replace(/\s+/g, '-').toLowerCase()}`}
                                  onClick={() => setSearchOpen(false)}
                                  className="flex items-center gap-3 p-2 hover:bg-white/[0.05] rounded-xl transition-colors group"
                                >
                                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 relative shadow-inner">
                                    <Image 
                                      src={p.photo_url || "https://i.ibb.co/S7RD8ZHj/images-removebg-preview-1.png"} 
                                      alt="" 
                                      fill
                                      className={cn(
                                        "object-cover",
                                        !p.photo_url ? "scale-110 translate-y-1 brightness-110" : "scale-150 translate-y-1"
                                      )}
                                    />
                                  </div>
                                  <div className="flex flex-col">
                                     <span className="text-[11px] font-black text-white/80 uppercase tracking-tighter">{fullName}</span>
                                     <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{p.current_team_name || 'Wolny Agent'}</span>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
             </div>
          </div>

          {/* Social Icons & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              <Link href="https://www.facebook.com/profile.php?id=61573191964716" target="_blank" className="text-white hover:text-blue-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="https://www.instagram.com/dlpn_1liga/" target="_blank" className="text-white hover:text-blue-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
            </div>

            <button 
              className="xl:hidden text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 bg-black z-[101] flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
          <button 
            className="absolute top-6 right-6 text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-10 h-10" />
          </button>
          <ul className="flex flex-col items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white font-black text-2xl hover:text-yellow-500 transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-8 mt-12">
            <Link href="#" className="text-white hover:text-yellow-500 transition-colors">
              <Facebook className="w-8 h-8" />
            </Link>
            <Link href="#" className="text-white hover:text-yellow-500 transition-colors">
              <Instagram className="w-8 h-8" />
            </Link>
            <Link href="#" className="text-white hover:text-yellow-500 transition-colors">
              <Youtube className="w-10 h-10" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
