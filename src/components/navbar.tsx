'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon, Search, X as CloseIcon, ChevronRight } from 'lucide-react';
import { teams } from '@/lib/data';
import { RobloxAvatar } from './roblox-avatar';
import { getTeamLogo, getTeamName, getTeamColor } from '@/lib/useMatchStats';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [refreshingRoles, setRefreshingRoles] = useState(false);
  const [balance, setBalance] = useState({ balance: 0, items: {} });
  const [logoutCountdown, setLogoutCountdown] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState<'Wszyscy' | 'Drużyny' | 'Ligi' | 'Gracze' | 'Mecze'>('Wszyscy');
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const savedRecent = localStorage.getItem('recent_searches');
    if (savedRecent) {
      try {
        setRecentSearches(JSON.parse(savedRecent));
      } catch (e) {
        console.error('Error parsing recent searches', e);
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addToRecent = (item: any) => {
    const newRecent = [item, ...recentSearches.filter(r => r.href !== item.href)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('recent_searches', JSON.stringify(newRecent));
  };

  const removeFromRecent = (href: string) => {
    const newRecent = recentSearches.filter(r => r.href !== href);
    setRecentSearches(newRecent);
    localStorage.setItem('recent_searches', JSON.stringify(newRecent));
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent_searches');
  };

  const SearchItemIcon = ({ item }: { item: any }) => {
    if (item.type === 'team') {
      return <img src={item.logo || item.clubLogo} className="w-8 h-8 rounded-lg object-contain bg-white/5 p-1" alt={item.name} />;
    }
    if (item.type === 'league') {
      return (
        <div className="w-8 h-8 rounded-lg bg-[#00ccff]/10 border border-[#00ccff]/20 flex items-center justify-center p-1.5">
          <svg className="w-full h-full text-[#00ccff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      );
    }
    if (item.type === 'match') {
      return (
        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center p-1.5">
          <svg className="w-full h-full text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      );
    }
    if (item.isReferee) {
      return (
        <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center overflow-hidden p-1">
          <img 
            src="https://i.ibb.co/5hYr57Mr/obraz-2026-02-01-142942311.png" 
            alt="Referee" 
            className="w-full h-full object-contain"
          />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-black flex-shrink-0">
        <RobloxAvatar username={item.name} className="w-full h-full object-cover" />
      </div>
    );
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('discord_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);

      fetch(`/api/user/tokens?id=${userData.id}`)
        .then(res => res.json())
        .then(data => {
          setBalance(data);
        })
        .catch(err => console.error('Error fetching tokens:', err));
    }
  }, []);

  useEffect(() => {
    const syncRoles = async () => {
      const savedUser = localStorage.getItem('discord_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        if (userData.username) {
          try {
            const lastCheck = localStorage.getItem('last_roles_check');
            const now = Date.now();
            if (lastCheck && now - parseInt(lastCheck) < 5 * 60 * 1000) return;

            const response = await fetch(`https://league-builder.replit.app/api/players/${userData.username}`);
            if (response.ok) {
              const freshData = await response.json();
              const updatedRoles = freshData.discordRoles || [];
              const updatedUser = { ...userData, discordRoles: updatedRoles };
              localStorage.setItem('discord_user', JSON.stringify(updatedUser));
              localStorage.setItem('last_roles_check', now.toString());
              setUser(updatedUser);
            }
          } catch (err) {
            console.error('Error syncing roles:', err);
          }
        }
      }
    };

    syncRoles();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownOpen && !(event.target as Element).closest('.user-dropdown')) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen]);

  useEffect(() => {
    if (logoutCountdown === null) return;

    if (logoutCountdown > 0) {
      const timer = setTimeout(() => setLogoutCountdown(logoutCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      localStorage.removeItem('discord_user');
      localStorage.removeItem('roblox_id');
      setUser(null);
      setUserDropdownOpen(false);
      setLogoutCountdown(null);
    }
  }, [logoutCountdown]);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    const fetchSearchResults = async () => {
      const results: any[] = [];
      const leagues = [
        { name: 'CLJ', logo: 'https://i.ibb.co/qMnRc6nx/image.png', href: '/liga/CLJ' },
        { name: 'Ekstraklasa', logo: 'https://i.ibb.co/gFB3FXr4/image.png', href: '/liga/2' },
        { name: 'Mecze Towarzyskie 2026', logo: 'https://i.ibb.co/xShtkfph/image.png', href: '/liga/Mecze+Towarzyskie+2026' }
      ];

      leagues.forEach(league => {
        if (league.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push({
            type: 'league',
            id: league.name,
            name: league.name,
            logo: league.logo,
            color: '#3b82f6',
            href: league.href
          });
        }
      });

      const matchingTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.shortName?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3);

      matchingTeams.forEach(team => {
        results.push({
          type: 'team',
          id: team.id,
          name: team.name,
          logo: team.logo,
          color: team.color || '#ffffff',
          href: `/klub/${team.id}`
        });
      });

      try {
        const playerResponse = await fetch(`/api/players/search?q=${encodeURIComponent(searchQuery)}`);
        if (playerResponse.ok) {
          const players = await playerResponse.json();
          const historyRes = await fetch('https://league-builder.replit.app/players-history.json').catch(() => null);
          const historyData = historyRes && historyRes.ok ? await historyRes.json() : null;

          players.forEach((player: any) => {
            if (results.some(r => r.type === 'player' && r.name === player.username)) return;

            let clubName = player.clubName || player.clubId || '---';
            let clubId = player.clubId || player.clubName;
            
            if ((!clubName || clubName === '---') && historyData && historyData.players && historyData.players[player.userId]) {
              const hPlayer = historyData.players[player.userId];
              const matches = hPlayer.matches || (hPlayer.matchHistory ? Object.values(hPlayer.matchHistory) : []);
              if (matches.length > 0) {
                const sortedMatches = [...matches].sort((a: any, b: any) => {
                  const dateA = new Date(a.date || a.timestamp || 0).getTime();
                  const dateB = new Date(b.date || b.timestamp || 0).getTime();
                  return dateB - dateA;
                });
                clubId = sortedMatches[0].playerTeam || sortedMatches[0].teamId || clubId;
                clubName = getTeamName(clubId);
              }
            }

            const isReferee = clubId === 'REFEREE' || clubId === 'SED' || 
                             String(clubName).toUpperCase() === 'REFEREE' || 
                             String(clubId).toUpperCase() === 'KOLEGIUM SĘDZIOWSKIE' ||
                             String(clubId).toUpperCase().includes('SĘDZIA');
            
            const resolvedClubName = isReferee ? 'Sędzia PFF' : (clubName !== '---' ? clubName : getTeamName(clubId));
            const resolvedClubLogo = isReferee ? null : getTeamLogo(clubId, resolvedClubName);
            const resolvedClubColor = isReferee ? '#ef4444' : getTeamColor(clubId, resolvedClubName);
            const isFreeAgent = !isReferee && (!clubId || clubId === '---' || resolvedClubName === '---' || resolvedClubName === 'Nieznany Klub' || resolvedClubName === 'FREE AGENT' || !resolvedClubName);

            results.push({
              type: 'player',
              id: player.userId,
              name: player.username,
              club: isFreeAgent ? 'FREE AGENT' : resolvedClubName,
              clubLogo: resolvedClubLogo,
              clubColor: resolvedClubColor,
              isFreeAgent: isFreeAgent,
              isReferee: isReferee,
              avatarUrl: player.avatarUrl,
              href: `/gracz/${player.username}`
            });
          });
        }
      } catch (error) {
        console.error('Error searching players:', error);
      }

      const uniqueResults = Array.from(new Map(results.map(item => [`${item.type}-${item.name}`, item])).values());
      setSearchResults(uniqueResults);
      if (searchQuery.length >= 2) {
        setSearchOpen(true);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const navLinks = [
    { href: '/', label: 'Start' },
    { href: '/kluby', label: 'Kluby' },
    { href: '/sklep', label: 'Sklep' },
    { href: '/o-nas', label: 'O nas' },
  ];

  return (
    <div className={`w-full sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/[0.01] backdrop-blur-[20px] border-b border-white/5 shadow-2xl' : 'bg-transparent'}`}>
      <div className={`transition-all duration-500 ${scrolled ? 'py-2' : 'py-4'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-8">
            {/* Left: Logo & Search */}
            <div className="flex-1 flex items-center gap-6">
              <Link href="/" className="group flex items-center shrink-0">
                <img
                  src="https://i.ibb.co/TB027G07/czarnepff-1.png"
                  alt="PFF Logo"
                  className={`w-auto relative z-10 transition-all duration-500 ${scrolled ? 'h-10' : 'h-16'}`}
                />
              </Link>

              <div className="hidden lg:flex items-center relative w-64 xl:w-80" ref={searchRef}>
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Szukaj"
                    value={searchQuery}
                    onFocus={() => setSearchOpen(true)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-10 py-2 bg-white/[0.02] border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/5 transition-all duration-300 text-xs italic font-medium"
                  />
                  <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-gray-400" />

                  {searchOpen && (
                    <div className="absolute top-full mt-3 w-[600px] left-0 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-4 flex gap-1.5 border-b border-white/5 bg-white/5 overflow-x-auto no-scrollbar">
                        {(['Wszyscy', 'Drużyny', 'Ligi', 'Gracze', 'Mecze'] as const).map((f) => (
                          <button
                            key={f}
                            onClick={(e) => { e.stopPropagation(); setSearchFilter(f); }}
                            className={`px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase italic tracking-tight transition-all flex-shrink-0 ${
                              searchFilter === f 
                                ? 'bg-white text-black' 
                                : 'text-white/40 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>

                      <div className="max-h-[500px] overflow-y-auto no-scrollbar p-2">
                        {searchQuery.length >= 2 && searchResults.length > 0 ? (
                          searchResults.map((result, idx) => (
                            <Link
                              key={idx}
                              href={result.href}
                              onClick={() => {
                                addToRecent(result);
                                setSearchQuery('');
                                setSearchOpen(false);
                              }}
                              className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 rounded-2xl transition-all group"
                            >
                              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden border border-white/5">
                                <SearchItemIcon item={result} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-black italic uppercase tracking-tight text-white group-hover:text-[#00ccff] transition-colors">{result.name}</span>
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-0.5 italic">{result.subtitle || result.type.toUpperCase()}</span>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div className="py-20 text-center">
                            <Search className="w-10 h-10 text-white/5 mx-auto mb-4" />
                            <p className="text-white/20 text-xs font-black uppercase italic">Zacznij pisać, aby szukać...</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Center: Navigation */}
            <nav className="hidden md:flex items-center justify-center gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative text-sm font-black uppercase italic tracking-tighter transition-all duration-300 ${
                      isActive ? 'text-white' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-white rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Actions & User */}
            <div className="flex-1 flex items-center justify-end gap-4">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all"
              >
                {mounted && (theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />)}
              </button>

              <div className="hidden lg:block relative">
                <select className="appearance-none px-4 py-2 bg-white/5 text-white border border-white/10 rounded-xl text-[10px] font-black italic uppercase hover:bg-white/10 transition-all cursor-pointer focus:outline-none">
                  <option className="bg-[#050b14]">2025/2026</option>
                  <option className="bg-[#050b14]">2024/2025</option>
                </select>
              </div>

              {user ? (
                <div className="relative user-dropdown">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-3 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all shadow-lg"
                  >
                    <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden bg-black">
                      <RobloxAvatar username={user.username} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col text-left hidden sm:flex">
                      <span className="text-white font-black text-xs uppercase italic leading-none">{user.username}</span>
                      <span className="text-[#00ccff] font-black text-[9px] uppercase tracking-widest mt-1">{balance.balance} PFF</span>
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute top-full right-0 mt-3 w-64 bg-white/[0.03] backdrop-blur-[40px] border border-white/10 rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-4 border-b border-white/5 bg-white/5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl border border-white/10 overflow-hidden bg-black">
                            <RobloxAvatar username={user.username} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-white font-black text-sm uppercase italic">{user.username}</p>
                            <p className="text-[10px] text-white/40 font-medium">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1 bg-white/5 rounded-xl p-2 border border-white/5">
                            <p className="text-[8px] text-white/20 uppercase font-black mb-0.5">Saldo</p>
                            <p className="text-[#00ccff] font-black text-xs">{balance.balance} PFF</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <Link href="/profil" className="flex items-center gap-3 px-4 py-2.5 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                          <span className="text-xs font-black uppercase italic">Mój Profil</span>
                        </Link>
                        <button 
                          onClick={() => setLogoutCountdown(3)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500/60 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
                        >
                          <span className="text-xs font-black uppercase italic">
                            {logoutCountdown !== null ? `Wylogowywanie... ${logoutCountdown}` : 'Wyloguj się'}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    const clientId = "8976718339232083701";
                    const origin = window.location.origin.replace(/\/$/, "");
                    const redirectUri = encodeURIComponent(origin + "/robloxcallback");
                    window.location.href = `https://authorize.roblox.com/?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid+profile&state=roblox&step=accountConfirm`;
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black font-black text-xs uppercase italic rounded-xl hover:scale-105 transition-all shadow-xl"
                >
                  Zaloguj się
                </button>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${
        mobileMenuOpen ? 'max-h-[80vh] opacity-100 border-t border-white/5' : 'max-h-0 opacity-0'
      }`}>
        <div className="container mx-auto px-4 py-6 space-y-6 bg-white/[0.02] backdrop-blur-[30px]">
          <input
            type="text"
            placeholder="Szukaj..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 text-sm italic"
          />
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-5 py-4 rounded-2xl font-black uppercase italic tracking-tight transition-all ${
                    isActive ? 'bg-[#00ccff]/10 text-[#00ccff]' : 'text-white/60 hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
