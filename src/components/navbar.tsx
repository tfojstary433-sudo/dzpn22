'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { teams } from '@/lib/data';
import { RobloxAvatar } from './roblox-avatar';
import { getTeamLogo, getTeamName, getTeamColor } from '@/lib/useMatchStats';

export function Navbar() {
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const [scrolled, setScrolled] = useState(false);
   const [user, setUser] = useState<any>(null);
   const [userDropdownOpen, setUserDropdownOpen] = useState(false);
   const [balance, setBalance] = useState({ balance: 0, items: {} });
   const [logoutCountdown, setLogoutCountdown] = useState<number | null>(null);
   const [searchQuery, setSearchQuery] = useState('');
   const [searchResults, setSearchResults] = useState<any[]>([]);
   const [searchOpen, setSearchOpen] = useState(false);
   const [showEmail, setShowEmail] = useState(false);
   const pathname = usePathname();
   const router = useRouter();

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

      // Fetch balance
      fetch(`/api/user/tokens?id=${userData.id}`)
        .then(res => res.json())
        .then(data => {
          setBalance(data);
        })
        .catch(err => console.error('Error fetching tokens:', err));
    }
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
      // Logout
      localStorage.removeItem('discord_user');
      localStorage.removeItem('roblox_id');
      setUser(null);
      setUserDropdownOpen(false);
      setLogoutCountdown(null);
    }
  }, [logoutCountdown]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    const fetchSearchResults = async () => {
      const results: any[] = [];

      // Search teams
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

      // Search players
      try {
        const playerResponse = await fetch(`/api/players/search?q=${encodeURIComponent(searchQuery)}`);
        if (playerResponse.ok) {
          const players = await playerResponse.json();
          
          // Fetch history to find the latest club for each player
          const historyRes = await fetch('https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/players-history.json').catch(() => null);
          const historyData = historyRes && historyRes.ok ? await historyRes.json() : null;

          players.forEach((player: any) => {
            // Deduplicate: check if player already exists in results
            if (results.some(r => r.type === 'player' && r.name === player.username)) return;

            let clubId = player.clubId || player.clubName;
            
            // Try to find the latest club from history if available
            if (historyData && historyData.players && historyData.players[player.userId]) {
              const hPlayer = historyData.players[player.userId];
              const matches = hPlayer.matches || (hPlayer.matchHistory ? Object.values(hPlayer.matchHistory) : []);
              if (matches.length > 0) {
                const sortedMatches = [...matches].sort((a: any, b: any) => {
                  const dateA = new Date(a.date || a.timestamp || 0).getTime();
                  const dateB = new Date(b.date || b.timestamp || 0).getTime();
                  return dateB - dateA;
                });
                clubId = sortedMatches[0].playerTeam || sortedMatches[0].teamId || clubId;
              }
            }

            const isReferee = clubId === 'REFEREE' || clubId === 'SED' || 
                             String(player.clubName).toUpperCase() === 'REFEREE' || 
                             String(clubId).toUpperCase() === 'KOLEGIUM SĘDZIOWSKIE' ||
                             String(clubId).toUpperCase().includes('SĘDZIA');
            
            const resolvedClubName = isReferee ? 'Sędzia PFF' : getTeamName(clubId);
            const resolvedClubLogo = isReferee ? null : getTeamLogo(clubId, resolvedClubName);
            const resolvedClubColor = isReferee ? '#ef4444' : getTeamColor(clubId, resolvedClubName);
            const isFreeAgent = !isReferee && (!clubId || clubId === '---' || resolvedClubName === clubId || resolvedClubName === 'Nieznany Klub');

            results.push({
              type: 'player',
              id: player.userId,
              name: player.username,
              club: isFreeAgent ? 'FREE Agent' : resolvedClubName,
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

      // Remove duplicates by type and name (to be safer if IDs vary)
      const uniqueResults = Array.from(new Map(results.map(item => [`${item.type}-${item.name}`, item])).values());
      setSearchResults(uniqueResults);
      setSearchOpen(uniqueResults.length > 0);
    };

    const debounceTimer = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const navLinks = [
    { href: '/', label: 'Start' },
    { href: '/aktualnosci', label: 'Aktualności' },
    { href: '/terminarz', label: 'Terminarz' },
    { href: '/tabela', label: 'Tabela' },
    { href: '/statystyki', label: 'Statystyki' },
    { href: '/transfery', label: 'Transfery' },
    { href: '/kluby', label: 'Kluby' },
    { href: '/turnieje', label: 'Turnieje' },
    { href: '/sklep', label: 'Sklep' },
    { href: '/o-nas', label: 'O nas' },
  ];

  return (
    <div className={`w-full sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'bg-transparent backdrop-blur-xl border-b border-white/5 shadow-2xl' : 'bg-transparent'}`}>
      {/* Main Navigation */}
      <div className={`transition-all duration-500 ${scrolled ? 'py-1' : 'py-2'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="py-2 group relative">
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 rounded-xl transition-colors duration-300 blur-xl" />
              <Image
                src="https://i.ibb.co/TB027G07/czarnepff-1.png"
                alt="PFF Logo"
                width={200}
                height={80}
                className={`w-auto brightness-0 invert opacity-90 group-hover:opacity-100 transition-all duration-300 ${scrolled ? 'h-16' : 'h-20'}`}
                suppressHydrationWarning={true}
              />
            </Link>

            {/* Search Bar */}
            <div className="hidden md:block relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Szukaj klubów i zawodników..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-72 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/5 transition-all duration-300"
                />
                <div className="absolute right-3 top-2.5 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning={true}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Search Results Dropdown */}
              {searchOpen && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <Link
                      key={index}
                      href={result.href}
                      onClick={() => {
                        setSearchQuery('');
                        setSearchOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
                    >
                      {result.type === 'team' ? (
                        <>
                          <div className="w-10 h-10 bg-white/5 rounded-lg p-1.5 flex items-center justify-center">
                            <img
                              src={result.logo}
                              alt={result.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder-logo.png';
                              }}
                            />
                          </div>
                          <div>
                            <div className="text-white font-black italic uppercase text-sm tracking-tight border-b-2 border-transparent group-hover:border-white/20 transition-all inline-block" style={{ borderBottomColor: result.color + '40' }}>{result.name}</div>
                            <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-0.5">Klub</div>
                          </div>
                        </>
                      ) : (
                        <>
                          {result.isReferee ? (
                            <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center shrink-0 border border-red-500/20 shadow-lg overflow-hidden p-1.5">
                              <img 
                                src="https://i.ibb.co/5hYr57Mr/obraz-2026-02-01-142942311.png" 
                                alt="Referee" 
                                className="w-full h-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 bg-black flex-shrink-0 group-hover:border-blue-500/50 transition-all">
                              <RobloxAvatar
                                username={result.name}
                                className="w-full h-full object-cover scale-110"
                              />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <div className="text-white font-black italic uppercase text-sm tracking-tight border-b-2 transition-all w-fit" 
                                 style={{ borderBottomColor: result.isReferee ? '#ef4444' : '#3b82f6' }}>
                              {result.name}
                            </div>
                            <div className="flex flex-col mt-0.5">
                              <span className={`${result.isReferee ? 'text-red-500' : 'text-blue-400'} text-[9px] font-black uppercase tracking-[0.2em] leading-tight drop-shadow-[0_0_8px_rgba(96,165,250,0.3)] border-b border-current/20 w-fit italic`}>
                                {result.isReferee ? 'Sędzia' : 'Zawodnik'}
                              </span>
                              <div className="flex items-center gap-2 mt-2 group/club">
                                {!result.isFreeAgent && !result.isReferee && result.clubLogo && (
                                  <div className="w-6 h-6 bg-white/5 rounded-lg p-1 flex items-center justify-center shrink-0 border border-white/10 shadow-lg group-hover/club:border-white/20 transition-all">
                                    <img 
                                      src={result.clubLogo} 
                                      alt={result.club} 
                                      className="w-full h-full object-contain brightness-125" 
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://i.ibb.co/TB027G07/czarnepff-1.png';
                                      }}
                                    />
                                  </div>
                                )}
                                <span 
                                  className={`text-[11px] font-black uppercase tracking-tighter italic ${result.isFreeAgent ? 'text-white/30' : ''} group-hover/club:brightness-125 transition-all`}
                                  style={{ color: !result.isFreeAgent ? result.clubColor : undefined }}
                                >
                                  {result.club}
                                </span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-5 py-2.5 text-[15px] font-black tracking-tight uppercase transition-all duration-300 group ${
                      isActive ? 'text-white' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <span className="relative z-10">{link.label}</span>
                    {/* Hover/Active background */}
                    <div className={`absolute inset-0 rounded-lg transition-all duration-500 ${
                      isActive
                        ? 'bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                        : 'bg-white/0 group-hover:bg-white/5'
                    }`} />
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-4">
              {/* Season selector */}
              <div className="relative group">
                <select className="appearance-none px-4 py-2 pr-10 bg-white/5 text-white border border-white/10 rounded-xl text-sm font-black hover:bg-white/10 hover:border-white/30 transition-all cursor-pointer focus:outline-none focus:border-white/40">
                  <option className="bg-[#050b14]">2025/2026</option>
                  <option className="bg-[#050b14]">2024/2025</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" suppressHydrationWarning={true}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* User auth */}
              {user ? (
                <div className="relative user-dropdown">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all duration-300 shadow-lg"
                  >
                    {user.discordAvatar ? (
                      <img
                        src={`https://cdn.discordapp.com/avatars/${user.discordId || user.id}/${user.discordAvatar}.png`}
                        alt="Discord Avatar"
                        className="w-8 h-8 rounded-full border-2 border-white/20"
                      />
                    ) : user.avatar ? (
                      <img
                        src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                        alt="Discord Avatar"
                        className="w-8 h-8 rounded-full border-2 border-white/20"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full border-2 border-white/20 overflow-hidden">
                        <RobloxAvatar username={user.username} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex flex-col text-left">
                      <span className="text-white font-black text-sm">{user.username}</span>
                      <span className="text-white/60 text-xs">Roblox ID: {user.robloxId || 'Not set'}</span>
                    </div>
                    <svg className={`w-4 h-4 text-white/60 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" suppressHydrationWarning={true}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50">
                      <div className="p-4">
                        <div className="flex items-center gap-3 mb-4">
                          {user.discordAvatar ? (
                            <img
                              src={`https://cdn.discordapp.com/avatars/${user.discordId || user.id}/${user.discordAvatar}.png`}
                              alt="Discord Avatar"
                              className="w-12 h-12 rounded-full border-2 border-white/20"
                            />
                          ) : user.avatar ? (
                            <img
                              src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                              alt="Discord Avatar"
                              className="w-12 h-12 rounded-full border-2 border-white/20"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden">
                              <RobloxAvatar username={user.username} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-white font-black text-lg">{user.discordUsername || user.global_name || user.username}</h3>
                            <p className="text-white/60 text-sm">@{user.discordUsername || user.username}</p>
                          </div>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between">
                            <span className="text-white/60 text-sm">Roblox ID:</span>
                            <span className="text-white font-mono text-sm">{user.robloxId || 'Niepołączone'}</span>
                          </div>
                          {user.discordRoles && user.discordRoles.length > 0 && (
                            <div className="flex flex-col gap-1">
                              <span className="text-white/60 text-sm">Rangi Discord:</span>
                              <div className="flex flex-wrap gap-1">
                                {user.discordRoles
                                  .filter((roleId: string) => {
                                    // Pokaż tylko role, które są w clubs.json (kluby/sedziowie) 
                                    // lub ranga Użytkownik
                                    const clubRoles = [
                                      "1447302327349416052", "1447302327349416051", "1449381689750061147", 
                                      "1449386669605392460", "1449382695124729947", "1449780537727258745", 
                                      "1449781246728077494", "1449781524206715010", "1449881324142854319", 
                                      "1449780990510764112", "1454997406205739231", "1457078530939687053", 
                                      "1457419935952408602", "1460380847042728059", "1460381439571787826", 
                                      "1461485432100491369", "1465757839468396800", "1465766911500488866",
                                      "1447302326971793520" // Użytkownik
                                    ];
                                    return clubRoles.includes(roleId);
                                  })
                                  .map((roleId: string) => (
                                    <span key={roleId} className="px-2 py-0.5 bg-[#5865F2]/20 text-[#5865F2] text-[10px] font-bold rounded-md border border-[#5865F2]/30">
                                      {user.discordRoleNames?.[roleId] || (roleId === '1447302326971793520' ? 'Użytkownik' : roleId)}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          )}
                          {user.email && (
                            <div className="flex justify-between items-center">
                              <span className="text-white/60 text-sm">Email:</span>
                              <span 
                                onClick={() => setShowEmail(!showEmail)}
                                className="text-white text-sm truncate max-w-[150px] cursor-pointer hover:text-[#00ccff] transition-colors"
                                title={showEmail ? "Kliknij aby ukryć" : "Kliknij aby pokazać"}
                              >
                                {showEmail ? user.email : '••••••••••••'}
                              </span>
                            </div>
                          )}
                          {user.discordRoles && user.discordRoles.length > 0 && (
                            <div className="space-y-1 mb-3">
                              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Rangi Discord:</p>
                              <div className="flex flex-wrap gap-1">
                                {user.discordRoles.slice(0, 3).map((roleId: string) => (
                                  <span key={roleId} className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] font-black text-blue-400 truncate max-w-[80px]">
                                    {user.discordRoleNames?.[roleId] || `Rola ${roleId.slice(-4)}`}
                                  </span>
                                ))}
                                {user.discordRoles.length > 3 && (
                                  <span className="text-[10px] font-black text-white/20">+{user.discordRoles.length - 3}</span>
                                )}
                              </div>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-white/60 text-sm">Roblox ID:</span>
                            <span className="text-white font-black text-sm">{user.robloxId || user.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60 text-sm">Tokeny:</span>
                            <span className="text-white font-black text-sm">{balance.balance}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60 text-sm">Ostrzeżenia:</span>
                            <span className="text-yellow-400 text-sm">0</span>
                          </div>
                        </div>

                        {!user.discordId && (
                          <button
                            onClick={() => {
                              const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || "1448788697653973082";
                              const origin = window.location.origin.replace(/\/$/, "");
                              const redirectUri = encodeURIComponent(origin + "/callback");
                              const robloxId = user?.robloxId || localStorage.getItem('roblox_id') || "";
                              window.location.href = `https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=identify+email+guilds+guilds.members.read&state=discord:${robloxId}`;
                            }}
                            className="w-full flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-black py-2 rounded-lg transition-colors mb-3"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495a18.2739 18.2739 0 00-5.4877 0 11.7496 11.7496 0 00-.6172-1.2495.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1971.3728.2914a.077.077 0 01-.0066.1277 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.095 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.095 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                            </svg>
                            Połącz z Discordem
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (logoutCountdown === null) {
                              setLogoutCountdown(5);
                            }
                          }}
                          disabled={logoutCountdown !== null}
                          className="w-full bg-red-500/20 hover:bg-red-500/30 disabled:bg-gray-500/20 text-red-400 disabled:text-gray-400 font-black py-2 rounded-lg transition-colors"
                        >
                          {logoutCountdown !== null ? `Wylogowywanie... ${logoutCountdown}s` : 'Wyloguj się'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    const clientId = process.env.NEXT_PUBLIC_ROBLOX_CLIENT_ID || "8976718339232083701";
                    const origin = window.location.origin.replace(/\/$/, "");
                    const redirectUri = encodeURIComponent(origin + "/robloxcallback");
                    window.location.href = `https://authorize.roblox.com/?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid+profile&state=roblox&step=accountConfirm`;
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-white/10 border border-white/10 text-white font-black text-sm rounded-xl transition-colors shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.5 4L20 18.5L5.5 20L4 5.5L18.5 4ZM14.5 10.5H9.5V14.5H14.5V10.5Z" />
                  </svg>
                  Zaloguj się przez Roblox
                </button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" suppressHydrationWarning={true}>
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

        {/* Mobile Navigation */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Search Bar Mobile */}
            <div className="relative">
              <input
                type="text"
                placeholder="Szukaj..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
              />
              <div className="absolute right-3 top-3.5 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning={true}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Mobile Search Results */}
              {searchOpen && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <Link
                      key={index}
                      href={result.href}
                      onClick={() => {
                        setSearchQuery('');
                        setSearchOpen(false);
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-b-0"
                    >
                      {result.type === 'team' ? (
                        <img src={result.logo} className="w-8 h-8 rounded-lg object-contain" />
                      ) : result.isReferee ? (
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center overflow-hidden p-1">
                          <img 
                            src="https://i.ibb.co/5hYr57Mr/obraz-2026-02-01-142942311.png" 
                            alt="Referee" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-black flex-shrink-0">
                          <RobloxAvatar username={result.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="text-sm font-bold text-white uppercase italic">{result.name}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg font-black uppercase tracking-tighter transition-all ${
                      isActive
                        ? 'bg-[#00ccff]/10 text-[#00ccff] border-l-2 border-[#00ccff]'
                        : 'text-white/80 hover:bg-white/5 hover:text-white'
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
    </div>
  );
}
