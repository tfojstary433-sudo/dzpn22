'use client';

import { useState, useEffect } from 'react';
import { MainNavbar } from '@/components/main-navbar';
import { Footer } from '@/components/footer';
import { DateBar } from '@/components/date-bar';
import { RobloxAvatar } from '@/components/roblox-avatar';
import { API_ENDPOINTS } from '@/lib/constants';
import { teams, Team } from '@/lib/data';
import { mapPositionToPolish } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

interface Transfer {
  id: string;
  player: string;
  position: string;
  from: string;
  to: string;
  fromLogo: string;
  toLogo: string;
  robloxUsername: string;
  date: string;
  timestamp: number;
}

export default function TransferyPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [freeAgents, setFreeAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'incoming' | 'outgoing' | 'loans' | 'free_agents'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes, contractsRes] = await Promise.all([
          fetch(API_ENDPOINTS.PLAYERS_HISTORY),
          fetch('https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/api/contracts')
        ]);

        if (historyRes.ok) {
          const data = await historyRes.json();
          const allTransfers: Transfer[] = [];
          const allPlayersInHistory: any[] = [];

          if (data.players) {
            Object.entries(data.players).forEach(([userId, player]: [string, any]) => {
              allPlayersInHistory.push({ ...player, userId });
              if (player.matches && player.matches.length > 0) {
                // Sort matches by date ascending
                const sortedMatches = [...player.matches].sort((a: any, b: any) => 
                  new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime()
                );

                let lastTeamName = '';
                
                sortedMatches.forEach((match: any) => {
                  const currentTeamName = match.playerTeam;
                  
                  if (lastTeamName && currentTeamName !== lastTeamName) {
                    const fromTeam = teams.find(t => t.name === lastTeamName || t.id === lastTeamName);
                    const toTeam = teams.find(t => t.name === currentTeamName || t.id === currentTeamName);

                    allTransfers.push({
                      id: `${userId}-${match.playedAt}`,
                      player: player.name || 'Nieznany',
                      position: mapPositionToPolish(player.position || match.position || '---'),
                      from: fromTeam?.name || lastTeamName,
                      to: toTeam?.name || currentTeamName,
                      fromLogo: fromTeam?.logo || 'https://i.ibb.co/TB027G07/czarnepff-1.png',
                      toLogo: toTeam?.logo || 'https://i.ibb.co/TB027G07/czarnepff-1.png',
                      robloxUsername: player.name,
                      date: match.playedAt ? new Date(match.playedAt).toLocaleDateString('pl-PL') : '---',
                      timestamp: new Date(match.playedAt).getTime()
                    });
                  }
                  lastTeamName = currentTeamName;
                });
              }
            });
          }

          // Sort all transfers by timestamp descending
          setTransfers(allTransfers.sort((a, b) => b.timestamp - a.timestamp));

          // Free Agents logic
          if (contractsRes.ok) {
            const contractsData = await contractsRes.json();
            const activeContracts = contractsData.contracts?.all || [];
            
            // Get current time
            const now = new Date();

            const agents = allPlayersInHistory.filter(player => {
              // A player is a free agent if they don't have an active contract in the API
              // or their contract has expired
              const playerContract = activeContracts.find((c: any) => 
                c.player_name?.toLowerCase().trim() === player.name?.toLowerCase().trim()
              );
              
              if (!playerContract) return true;
              
              const expiryDate = new Date(playerContract.end_date);
              return expiryDate < now;
            }).map(player => {
              const latestMatch = player.matches ? [...player.matches].sort((a: any, b: any) => 
                new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()
              )[0] : null;

              return {
                id: player.userId,
                name: player.name,
                position: mapPositionToPolish(player.position || latestMatch?.position || '---'),
                lastTeam: latestMatch?.playerTeam || 'Brak danych'
              };
            });
            
            setFreeAgents(agents);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredTransfers = transfers.filter(transfer => {
    if (activeTab === 'all') return true;
    if (activeTab === 'incoming') return true; // Most are incoming to a team
    if (activeTab === 'outgoing') return true; // Most are outgoing from a team
    if (activeTab === 'loans') return false;   // No loan data currently
    return true;
  });

  return (
    <main className="bg-[#020617] min-h-screen text-white font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
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

      <div className="relative z-10 pt-44">
          {/* Centered Logo Section */}
          <div className="mb-12 flex justify-center">
            <div className="relative group">
              <img
                src="https://i.ibb.co/MyfXtGLH/ekstraklasabaner-removebg-preview.png"
                alt="7U7 Ekstraklasa"
                className="h-12 md:h-20 w-auto object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Transfer tabs */}
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-12 justify-center lg:justify-start">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-2.5 text-sm font-black uppercase tracking-tight rounded-full transition-all duration-300 ${
                  activeTab === 'all'
                    ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                Wszystkie
              </button>
              <button
                onClick={() => setActiveTab('incoming')}
                className={`px-6 py-2.5 text-sm font-black uppercase tracking-tight rounded-full transition-all duration-300 ${
                  activeTab === 'incoming'
                    ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                Gracze przychodzący
              </button>
              <button
                onClick={() => setActiveTab('outgoing')}
                className={`px-6 py-2.5 text-sm font-black uppercase tracking-tight rounded-full transition-all duration-300 ${
                  activeTab === 'outgoing'
                    ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                Gracze odchodzący
              </button>
              <button
                onClick={() => setActiveTab('loans')}
                className={`px-6 py-2.5 text-sm font-black uppercase tracking-tight rounded-full transition-all duration-300 ${
                  activeTab === 'loans'
                    ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                Wypożyczenia
              </button>
              <button
                onClick={() => setActiveTab('free_agents')}
                className={`px-6 py-2.5 text-sm font-black uppercase tracking-tight rounded-full transition-all duration-300 ${
                  activeTab === 'free_agents'
                    ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                Wolni Zawodnicy
              </button>
            </div>

            {/* Transfer list header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 mb-4 text-[11px] font-black uppercase tracking-[0.2em] text-white/40 italic">
              <div className="col-span-4">Gracz</div>
              <div className="col-span-4 text-center">
                {activeTab === 'free_agents' ? 'Ostatni Klub' : (activeTab === 'incoming' ? 'Z:' : activeTab === 'outgoing' ? 'Do:' : 'Transfer')}
              </div>
              <div className="col-span-2 text-center">Pozycja</div>
              <div className="col-span-2 text-right">{activeTab === 'free_agents' ? 'Status' : 'Data'}</div>
            </div>

            {/* Transfer list container */}
            <div className="bg-white/10 border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-2xl shadow-2xl">
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : activeTab === 'free_agents' ? (
                <div className="divide-y divide-white/5">
                  {freeAgents.length > 0 ? (
                    freeAgents.map((agent) => (
                      <Link 
                        key={agent.id} 
                        href={`/gracz/${encodeURIComponent(agent.name)}`}
                        className="p-6 sm:p-10 hover:bg-white/5 transition-all group block"
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                          {/* Player info */}
                          <div className="col-span-4 flex items-center gap-6">
                            <div className="relative flex-shrink-0">
                              <RobloxAvatar
                                username={agent.name}
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-white/10 group-hover:border-white/30 transition-all shadow-2xl"
                              />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-white font-black text-2xl sm:text-3xl uppercase tracking-tight italic truncate group-hover:text-blue-400 transition-colors">
                                {agent.name}
                              </h3>
                              <div className="text-white/30 text-xs font-black uppercase tracking-widest mt-1">Zawodnik</div>
                            </div>
                          </div>

                          {/* Last Club */}
                          <div className="col-span-4 flex items-center justify-center gap-8">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/5 rounded-2xl p-2.5 flex items-center justify-center border border-white/10 shadow-xl group-hover:scale-110 transition-transform">
                                <img src="https://i.ibb.co/DfpFSTgc/image.png" alt="Free Agent" className="w-full h-full object-contain brightness-125" />
                              </div>
                            </div>
                          </div>

                          {/* Position */}
                          <div className="col-span-2 flex justify-center">
                            <div className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-[14px] font-black uppercase tracking-tight italic shadow-lg group-hover:bg-white/10 transition-colors">
                              {agent.position}
                            </div>
                          </div>

                          {/* Status */}
                          <div className="col-span-2 text-center lg:text-right">
                            <div className="text-blue-400 font-black text-xl sm:text-2xl uppercase tracking-tight italic">Wolny Agent</div>
                            <div className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Dostępny</div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-20">
                      <p className="text-white/40 font-black uppercase tracking-widest text-sm italic">Brak wolnych zawodników</p>
                    </div>
                  )}
                </div>
              ) : filteredTransfers.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {filteredTransfers.map((transfer) => (
                    <Link 
                      key={transfer.id} 
                      href={`/gracz/${encodeURIComponent(transfer.robloxUsername)}`}
                      className="p-6 sm:p-10 hover:bg-white/5 transition-all group block"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        {/* Player info */}
                        <div className="col-span-4 flex items-center gap-6">
                          <div className="relative flex-shrink-0">
                            <RobloxAvatar
                              username={transfer.robloxUsername}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-white/10 group-hover:border-white/30 transition-all shadow-2xl"
                            />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-white font-black text-2xl sm:text-3xl uppercase tracking-tight italic truncate group-hover:text-blue-400 transition-colors">
                              {transfer.player}
                            </h3>
                            <div className="text-white/30 text-xs font-black uppercase tracking-widest mt-1">Zawodnik</div>
                          </div>
                        </div>

                        {/* Transfer details */}
                        <div className="col-span-4 flex items-center justify-center gap-8 sm:gap-12">
                          {activeTab === 'outgoing' ? (
                            <>
                              <div className="flex flex-col items-center gap-3">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/5 rounded-2xl p-2.5 flex items-center justify-center border border-white/10 shadow-xl group-hover:scale-110 transition-transform">
                                  <img src={transfer.toLogo} alt={transfer.to} className="w-full h-full object-contain brightness-125" />
                                </div>
                                <span className="text-xs text-white/40 font-black uppercase italic truncate max-w-[100px]">{transfer.to}</span>
                              </div>
                              
                              <div className="text-3xl sm:text-5xl text-red-500 font-light group-hover:scale-150 transition-transform drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]">←</div>

                              <div className="flex flex-col items-center gap-3">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/5 rounded-2xl p-2.5 flex items-center justify-center border border-white/10 shadow-xl group-hover:scale-110 transition-transform">
                                  <img src={transfer.fromLogo} alt={transfer.from} className="w-full h-full object-contain brightness-125" />
                                </div>
                                <span className="text-xs text-white/40 font-black uppercase italic truncate max-w-[100px]">{transfer.from}</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex flex-col items-center gap-3">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/5 rounded-2xl p-2.5 flex items-center justify-center border border-white/10 shadow-xl group-hover:scale-110 transition-transform">
                                  <img src={transfer.fromLogo} alt={transfer.from} className="w-full h-full object-contain brightness-125" />
                                </div>
                                <span className="text-xs text-white/40 font-black uppercase italic truncate max-w-[100px]">{transfer.from}</span>
                              </div>
                              
                              <div className="text-3xl sm:text-5xl text-green-400 font-light group-hover:scale-150 transition-transform drop-shadow-[0_0_15px_rgba(74,222,128,0.3)]">→</div>

                              <div className="flex flex-col items-center gap-3">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/5 rounded-2xl p-2.5 flex items-center justify-center border border-white/10 shadow-xl group-hover:scale-110 transition-transform">
                                  <img src={transfer.toLogo} alt={transfer.to} className="w-full h-full object-contain brightness-125" />
                                </div>
                                <span className="text-xs text-white/40 font-black uppercase italic truncate max-w-[100px]">{transfer.to}</span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Position */}
                        <div className="col-span-2 flex justify-center">
                          <div className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-[14px] font-black uppercase tracking-tight italic shadow-lg group-hover:bg-white/10 transition-colors">
                            {transfer.position}
                          </div>
                        </div>

                        {/* Date */}
                        <div className="col-span-2 text-center lg:text-right">
                          <div className="text-white font-black text-xl sm:text-2xl uppercase tracking-tight italic">{transfer.date}</div>
                          <div className="text-blue-400/60 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Potwierdzone</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-white/40 font-black uppercase tracking-widest text-sm italic">Brak transferów w tej kategorii</p>
                </div>
              )}
            </div>
          </div>
      </div>

      <DateBar />
      <Footer />
    </main>
  );
}