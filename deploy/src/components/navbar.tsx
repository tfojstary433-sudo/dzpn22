'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RobloxAvatar } from './roblox-avatar';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [balance, setBalance] = useState({ balance: 0, items: {} });
  const pathname = usePathname();

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
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Aktualności' },
    { href: '/terminarz', label: 'Terminarz' },
    { href: '/tabela', label: 'Tabela' },
    { href: '/statystyki', label: 'Statystyki' },
    { href: '/kluby', label: 'Kluby' },
    { href: '/turnieje', label: 'Turnieje' },
    { href: '/sklep', label: 'Sklep' },
    { href: '/o-nas', label: 'O nas' },
  ];

  return (
    <div className={`w-full sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'py-0' : 'py-2'}`}>
      {/* Main Navigation */}
      <div className={`transition-all duration-500 ${
        scrolled
          ? 'bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-[#00ccff]/10 shadow-[0_4px_30px_rgba(0,204,255,0.1)]'
          : 'bg-black/60 backdrop-blur-md border-b border-white/5 shadow-2xl'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="py-2 group relative">
              <div className="absolute inset-0 bg-[#00ccff]/0 group-hover:bg-[#00ccff]/10 rounded-xl transition-colors duration-300 blur-xl" />
              <Image
                src="https://i.ibb.co/TB027G07/czarnepff-1.png"
                alt="PFF Logo"
                width={200}
                height={80}
                className={`w-auto brightness-0 invert opacity-90 group-hover:opacity-100 transition-all duration-300 ${
                  scrolled ? 'h-14' : 'h-20'
                }`}
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-5 py-3 text-lg font-black tracking-tighter uppercase transition-all duration-300 group ${
                      isActive ? 'text-[#00ccff]' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    <span className="relative z-10">{link.label}</span>
                    {/* Hover background */}
                    <div className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-[#00ccff]/10'
                        : 'bg-white/0 group-hover:bg-white/5'
                    }`} />
                    {/* Active indicator */}
                    <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-[#00ccff] to-[#0066ff] transition-all duration-300 ${
                      isActive ? 'w-1/2' : 'w-0 group-hover:w-1/4'
                    }`} />
                    {/* Glow effect */}
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-4 bg-[#00ccff]/30 blur-md" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-4">
              {/* Login Button or User Dropdown */}
              {user ? (
                <div className="relative user-dropdown">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-[#00ccff]/50 bg-black flex-shrink-0">
                      {user.discordAvatar ? (
                        <img
                          src={`https://cdn.discordapp.com/avatars/${user.discordId || user.id}/${user.discordAvatar}.png`}
                          alt="Discord Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <RobloxAvatar 
                          username={user.username} 
                          className="w-full h-full object-cover scale-110"
                        />
                      )}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-white font-black text-xs uppercase tracking-tight truncate max-w-[100px]">{user.global_name || user.username}</div>
                      <div className="text-[#00ccff] text-[10px] font-black uppercase tracking-widest">{balance.balance} PFF</div>
                    </div>
                    <svg className={`w-4 h-4 text-white/40 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-3 border-b border-white/5 mb-2">
                        <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Status konta</div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-white/60 text-xs">Roblox ID:</span>
                            <span className="text-white font-mono text-xs truncate max-w-[100px]">{user.robloxId || 'Niepołączone'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-white/60 text-xs">Tokeny:</span>
                            <span className="text-[#00ccff] font-black text-sm">{balance.balance}</span>
                          </div>
                          {user.discordRoles && user.discordRoles.length > 0 && (
                            <div className="flex flex-col gap-1 pt-1">
                              <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Rangi Discord</span>
                              <div className="flex flex-wrap gap-1">
                                {user.discordRoles.slice(0, 2).map((roleId: string) => (
                                  <span key={roleId} className="px-1.5 py-0.5 bg-[#5865F2]/20 text-[#5865F2] text-[9px] font-bold rounded border border-[#5865F2]/30 truncate max-w-[80px]">
                                    {roleId === '1447302326971793520' ? 'Użytkownik' : `Rola ${roleId.slice(-4)}`}
                                  </span>
                                ))}
                                {user.discordRoles.length > 2 && (
                                  <span className="text-white/40 text-[9px] font-bold self-center">+{user.discordRoles.length - 2}</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {!user.discordId && (
                        <button
                          onClick={() => {
                            const clientId = "1448788697653973082";
                            const origin = window.location.origin.replace(/\/$/, "");
                            const redirectUri = encodeURIComponent(origin + "/callback");
                            window.location.href = `https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=identify+email+guilds+guilds.members.read&state=discord`;
                          }}
                          className="w-full flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-black py-2.5 rounded-xl transition-all mb-2 text-xs"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495a18.2739 18.2739 0 00-5.4877 0 11.7496 11.7496 0 00-.6172-1.2495.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1971.3728.2914a.077.077 0 01-.0066.1277 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.095 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.095 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                          </svg>
                          Połącz z Discordem
                        </button>
                      )}

                      <button
                        onClick={() => {
                          localStorage.removeItem('discord_user');
                          setUser(null);
                          setUserDropdownOpen(false);
                        }}
                        className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 font-black py-2.5 rounded-xl transition-colors text-sm uppercase tracking-tight"
                      >
                        Wyloguj się
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    const clientId = "8976718339232083701";
                    const origin = window.location.origin.replace(/\/$/, "");
                    const redirectUri = encodeURIComponent(origin + "/callback");
                    window.location.href = `https://apis.roblox.com/oauth/v1/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid+profile&state=roblox`;
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-white/10 border border-white/10 text-white font-black text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] active:scale-95"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.5 4L20 18.5L5.5 20L4 5.5L18.5 4ZM14.5 10.5H9.5V14.5H14.5V10.5Z" />
                  </svg>
                  <span className="hidden sm:inline">Zaloguj się przez Roblox</span>
                  <span className="sm:hidden">Zaloguj się</span>
                </button>
              )}

              {/* Season selector */}
              <div className="relative group">
                <select className="appearance-none px-5 py-2.5 pr-10 bg-white/5 text-white border border-white/10 rounded-xl text-sm font-black hover:bg-white/10 hover:border-[#00ccff]/30 transition-all cursor-pointer focus:outline-none focus:border-[#00ccff]/50">
                  <option>2025/2026</option>
                  <option>2024/2025</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-[#00ccff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
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

        {/* Mobile Navigation */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="container mx-auto px-4 py-4 space-y-4">
            {user ? (
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#00ccff] bg-black flex-shrink-0">
                    {user.discordAvatar ? (
                      <img
                        src={`https://cdn.discordapp.com/avatars/${user.discordId || user.id}/${user.discordAvatar}.png`}
                        alt="Discord Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <RobloxAvatar username={user.username} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <div className="text-white font-black uppercase tracking-tight">{user.global_name || user.username}</div>
                    <div className="text-[#00ccff] text-[10px] font-black uppercase tracking-widest">{balance.balance} PFF</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem('discord_user');
                    setUser(null);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-red-500/20 text-red-400 font-black py-3 rounded-xl uppercase text-sm"
                >
                  Wyloguj się
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  const clientId = "8976718339232083701";
                  const origin = window.location.origin.replace(/\/$/, "");
                  const redirectUri = encodeURIComponent(origin + "/robloxcallback");
                  window.location.href = `https://authorize.roblox.com/?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid+profile&state=roblox&step=accountConfirm`;
                }}
                className="w-full flex items-center justify-center gap-3 bg-black border border-white/10 text-white font-black py-4 rounded-2xl uppercase text-sm shadow-xl"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.5 4L20 18.5L5.5 20L4 5.5L18.5 4ZM14.5 10.5H9.5V14.5H14.5V10.5Z" />
                </svg>
                Zaloguj się przez Roblox
              </button>
            )}

            <nav className="flex flex-col gap-2">
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
  );
}
