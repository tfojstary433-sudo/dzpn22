'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { teams } from '@/lib/data';
import { RobloxAvatar, seedAvatarCache } from '@/components/roblox-avatar';
import { ChevronLeft, ChevronRight, Star, Bell, LayoutDashboard, Table as TableIcon, Calendar, BarChart2, ArrowRightLeft, History, Newspaper } from 'lucide-react';
import Link from 'next/link';

interface LeagueData {
  id: string;
  name: string;
  country: string;
  logo: string;
  season: string;
}

export default function LeaguePage() {
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState('przegląd');
  const [tableFilter, setTableFilter] = useState('Wszyscy');
  const [matchFilter, setMatchFilter] = useState('Według daty');
  const [table, setTable] = useState<any[]>([]);
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [freeAgents, setFreeAgents] = useState<any[]>([]);
  const [selectedRound, setSelectedRound] = useState(1);
  const [loading, setLoading] = useState(true);
  const [tournamentData, setTournamentData] = useState<any>(null);
  const [achievements, setAchievements] = useState<any>(null);

  const leagueInfo: LeagueData = useMemo(() => {
    const decodedId = decodeURIComponent(id);
    if (decodedId === '2' || decodedId === 'Ekstraklasa') {
      return {
        id: '2',
        name: 'Ekstraklasa',
        country: 'Polska',
        logo: 'https://i.ibb.co/gFB3FXr4/image.png',
        season: '2025/2026'
      };
    }
    if (decodedId === 'CLJ') {
      return {
        id: 'CLJ',
        name: 'CLJ',
        country: 'Polska',
        logo: 'https://i.ibb.co/qMnRc6nx/image.png',
        season: '2025/2026'
      };
    }
    if (decodedId === 'Mecze Towarzyskie 2026' || decodedId === 'Mecze+Towarzyskie+2026' || decodedId === '1') {
      return {
        id: '1',
        name: 'Mecze Towarzyskie 2026',
        country: 'PFF',
        logo: 'https://i.ibb.co/xShtkfph/image.png',
        season: '2025/2026'
      };
    }
    return {
      id: id,
      name: decodedId,
      country: 'Polska',
      logo: 'https://i.ibb.co/xShtkfph/image.png',
      season: '2025/2026'
    };
  }, [id]);

  const [expandedStats, setExpandedStats] = useState<string[]>([]);

  const ZAWISZA_LINEUP = useMemo(() => [
    { n: 'FEARLESSSA01', x: '50%', y: '10%' },
    { n: 'PAZDAN_22', x: '20%', y: '22%' },
    { n: 'MICHAL134XD', x: '40%', y: '22%' },
    { n: 'CYTRUSEQZJARANY', x: '60%', y: '22%' },
    { n: 'KAJTEK_11', x: '80%', y: '22%' },
    { n: 'AGRIK', x: '30%', y: '35%' },
    { n: 'PROSPATR', x: '50%', y: '35%' },
    { n: 'NEYMAR_10', x: '70%', y: '35%' },
    { n: 'LEWY_09', x: '25%', y: '48%' },
    { n: 'KRAKS2343', x: '50%', y: '48%' },
    { n: 'KLUSECZKAANTEKME', x: '75%', y: '48%' }
  ], []);

  const ARKA_LINEUP = useMemo(() => [
    { n: 'PESZKO_10', x: '25%', y: '52%' },
    { n: 'BLASZCZYK_16', x: '50%', y: '52%' },
    { n: 'GROSIK_11', x: '75%', y: '52%' },
    { n: 'ZIZU_05', x: '30%', y: '65%' },
    { n: 'XAYONXD', x: '50%', y: '65%' },
    { n: 'WMPIR483', x: '70%', y: '65%' },
    { n: 'KOZAK_21', x: '20%', y: '78%' },
    { n: 'RAFA_04', x: '40%', y: '78%' },
    { n: 'MATI_07', x: '60%', y: '78%' },
    { n: 'RADZIO1921', x: '80%', y: '78%' },
    { n: 'LUKI_01', x: '50%', y: '90%' }
  ], []);

  useEffect(() => {
    if (leagueInfo.id === '1') {
      const allPlayers = [...ZAWISZA_LINEUP.map(p => p.n), ...ARKA_LINEUP.map(p => p.n)];
      seedAvatarCache(allPlayers);
    }
  }, [leagueInfo.id, ZAWISZA_LINEUP, ARKA_LINEUP]);

  const toggleStatExpansion = (title: string) => {
    setExpandedStats(prev => 
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const rounds = useMemo(() => {
    const r = Array.from(new Set(fixtures.map(f => f.round))).filter(Boolean).sort((a, b) => (a as number) - (b as number));
    return r.length > 0 ? r : [1];
  }, [fixtures]);

  useEffect(() => {
    if (fixtures.length > 0) {
      const finishedMatches = fixtures.filter(f => f.status === 'finished' || f.status === 'FT');
      if (finishedMatches.length > 0) {
        const currentRound = Math.max(...finishedMatches.map(f => f.round || 0));
        setSelectedRound(currentRound);
      } else {
        setSelectedRound(rounds[0] || 1);
      }
    }
  }, [fixtures, rounds]);

  const filteredFixtures = useMemo(() => {
    return fixtures.filter(f => f.round === selectedRound);
  }, [fixtures, selectedRound]);

  const groupedFixtures = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    const matchesToGroup = leagueInfo.id === '1' ? fixtures : filteredFixtures;
    
    matchesToGroup.forEach(f => {
      let d = new Date(f.date || f.playedAt || Date.now());
      
      // Extract date from matchUuid if in format tf-...-DDMM
      if (f.matchUuid && /-\d{4}$/.test(f.matchUuid)) {
        const datePart = f.matchUuid.split('-').pop();
        if (datePart && datePart.length === 4) {
          const day = parseInt(datePart.substring(0, 2));
          const month = parseInt(datePart.substring(2, 4)) - 1; // 0-indexed month
          const year = d.getFullYear() || 2026;
          d = new Date(year, month, day);
        }
      }

      const dateStr = d.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(f);
    });

    return Object.entries(groups).sort((a, b) => {
      const getMatchDate = (m: any) => {
        const d = new Date(m.date || m.playedAt || Date.now());
        if (m.matchUuid && /-\d{4}$/.test(m.matchUuid)) {
          const datePart = m.matchUuid.split('-').pop();
          if (datePart && datePart.length === 4) {
            const day = parseInt(datePart.substring(0, 2));
            const month = parseInt(datePart.substring(2, 4)) - 1;
            const year = d.getFullYear() || 2026;
            return new Date(year, month, day).getTime();
          }
        }
        return d.getTime();
      };
      return getMatchDate(a[1][0]) - getMatchDate(b[1][0]);
    });
  }, [filteredFixtures, fixtures, leagueInfo.id]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const tournamentId = leagueInfo.id;
        let currentTable = [];
        let currentFixtures = [];
        
        // Fetch Tournament Full Data
        try {
          const tournamentRes = await fetch(`https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/api/tournament/${tournamentId}/`);
          if (tournamentRes.ok) {
            const tData = await tournamentRes.json();
            setTournamentData(tData);
            if (tData.groups) {
              currentTable = tData.groups.flatMap((g: any) => g.teams);
              setTable(currentTable);
            }
            if (tData.fixtures) {
              currentFixtures = tData.fixtures;
              setFixtures(currentFixtures);
            }
          }
        } catch (e) { console.error('Tournament fetch error', e); }

        // Fetch Table (only if not already set by tournament data)
        if (currentTable.length === 0) {
          try {
            const tableRes = await fetch(`https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/api/tournaments/${tournamentId}/table`);
            if (tableRes.ok) {
              const tableData = await tableRes.json();
              currentTable = Array.isArray(tableData) ? (tableData[0]?.teams || []) : (tableData.table || []);
              setTable(currentTable);
            }
          } catch (e) { console.error('Table fetch error', e); }
        }

        // Fetch Fixtures (only if not already set by tournament data)
        if (currentFixtures.length === 0) {
          try {
            const fixturesRes = await fetch(`https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/api/tournaments/${tournamentId}/fixtures`);
            if (fixturesRes.ok) {
              currentFixtures = await fixturesRes.json();
              setFixtures(currentFixtures);
            }
          } catch (e) { console.error('Fixtures fetch error', e); }
        }

        // Fetch Stats
        try {
          const statsRes = await fetch(`https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/api/tournament/${tournamentId}/scorers.json`);
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            setStats(statsData);
            if (statsData.scorers) {
              seedAvatarCache(statsData.scorers.map((s: any) => s.name));
            }
          }
        } catch (e) { console.error('Stats fetch error', e); }
        
        // Fetch Achievements
        try {
          const achievementsRes = await fetch('https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/api/achievements');
          if (achievementsRes.ok) {
            const achData = await achievementsRes.json();
            setAchievements(achData);
          }
        } catch (e) { console.error('Achievements fetch error', e); }

        // Fetch News
        try {
          const newsRes = await fetch('https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/api/articles');
          if (newsRes.ok) {
            const newsData = await newsRes.json();
            const filteredNews = newsData.filter((a: any) => {
              const content = ((a.title || '') + (a.content || '') + (a.tags?.join(' ') || '')).toLowerCase();
              const lName = leagueInfo.name.toLowerCase();
              return content.includes(lName) || 
                     (lName.includes('ekstraklasa') && content.includes('ekstraklasa')) ||
                     currentTable.some((t: any) => {
                       const tName = t.name.toLowerCase();
                       const shortTName = tName.replace('ks ', '').replace('ts ', '').split(' ')[0];
                       return content.includes(tName) || (shortTName.length > 3 && content.includes(shortTName));
                     });
            });
            setNews(filteredNews);
          }
        } catch (e) { console.error('News fetch error', e); }

        // Fetch Transfers (Contracts as requested)
        try {
          const [contractsRes, verifiedRes, historyRes] = await Promise.all([
            fetch('https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/api/contracts'),
            fetch('https://wlpn-roblox-default-rtdb.europe-west1.firebasedatabase.app/VerifiedPlayers.json'),
            fetch('https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/players-history.json')
          ]);

          if (contractsRes.ok && verifiedRes.ok && historyRes.ok) {
            const contractsData = await contractsRes.json();
            const verifiedData = await verifiedRes.json();
            const historyData = await historyRes.json();
            
            const allContracts = contractsData.contracts?.all || [];
            const apiTransfers = contractsData.transfers || [];
            const playersHistory = historyData.players || {};

            const cleanClubName = (name: string) => {
              if (!name || name.toLowerCase().includes('free agent') || name.toLowerCase().includes('wolny agent')) return 'WOLNY AGENT';
              return name.replace('◂ ', '').split(' | ')[0].trim();
            };

            const formatCurrency = (val: string | number) => {
              const num = typeof val === 'string' ? parseInt(val) : val;
              if (isNaN(num) || num === 0) return '0 €';
              return new Intl.NumberFormat('de-DE').format(num) + ' €';
            };

            const leagueTeamNames = currentTable.map((t: any) => t.name.toLowerCase());

            const isTeamInLeague = (clubName: string) => {
              if (!clubName) return false;
              const normalized = clubName.toLowerCase();
              return leagueTeamNames.some((name: string) => normalized.includes(name) || name.includes(normalized.replace(/◂|\| pff/g, '').trim()));
            };

            const contractTransfers = apiTransfers.filter((t: any) => {
              return isTeamInLeague(t.to_club) || isTeamInLeague(t.from_club);
            }).map((t: any) => {
              let robloxId = null;
              let robloxName = t.player_name; 

              const verifiedEntry = Object.entries(verifiedData).find(([uid, data]: [string, any]) => 
                data.discordId === t.player_id
              );

              if (verifiedEntry) {
                robloxId = verifiedEntry[0];
                const historyEntry = playersHistory[robloxId];
                if (historyEntry) {
                  robloxName = historyEntry.name;
                }
              }

              const contract = allContracts.find((c: any) => c.id === t.contract_id);

              const formatDate = (dateStr: string) => {
                if (!dateStr) return 'BRAK';
                const d = new Date(dateStr);
                if (isNaN(d.getTime())) return dateStr.toUpperCase();
                return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();
              };

              const formatDuration = (dateStr: string) => {
                if (!dateStr) return 'BRAK';
                const d = new Date(dateStr);
                if (isNaN(d.getTime())) return 'BRAK';
                return d.toLocaleDateString('pl-PL', { month: 'short', year: 'numeric' }).toUpperCase();
              };

              return {
                player: robloxName,
                robloxId: robloxId,
                from: cleanClubName(t.from_club),
                to: cleanClubName(t.to_club),
                fee: t.type === 'signed' ? 'KONTRAKT' : t.type.toUpperCase(),
                position: contract?.position || 'POZ',
                country: 'Polska',
                duration: contract ? `${formatDuration(contract.start_date)} - ${formatDuration(contract.end_date)}` : 'BRAK',
                value: formatCurrency(t.transfer_fee),
                date: formatDate(t.transfer_date)
              };
            });
            setTransfers(contractTransfers);

            // Fetch history for Free Agents
            try {
              const historyRes = await fetch('https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/players-history.json');
              if (historyRes.ok) {
                const historyData = await historyRes.json();
                const players = historyData.players || historyData;
                
                const agents = Object.values(players).filter((p: any) => {
                  const rId = p.robloxId || p.userId;
                  // Map robloxId to discordId to check if they have a contract
                  const vEntry = verifiedData[rId];
                  const dId = vEntry?.discordId;
                  return !allContracts.some((c: any) => c.player_id === dId);
                }).map((p: any) => ({
                  player: p.name || p.username,
                  robloxId: p.robloxId || p.userId,
                  position: 'POZ'
                }));
                setFreeAgents(agents);
              }
            } catch (e) { console.error('Free Agents fetch error', e); }
          }
        } catch (e) { console.error('Transfers fetch error', e); }

      } catch (err) {
        console.error('Error fetching league data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [leagueInfo, id]);

  const getTeamLogo = (teamName: string) => {
    const cleanName = teamName.split(' | ')[0].trim().toLowerCase();
    const team = teams.find(t => 
      t.name.toLowerCase() === cleanName || 
      t.name.toLowerCase().includes(cleanName) ||
      t.id.toLowerCase() === cleanName.toLowerCase() || 
      t.shortName.toLowerCase() === cleanName.toLowerCase()
    );
    return team?.logo || 'https://i.ibb.co/TB027G07/czarnepff-1.png';
  };

  const getNextOpponent = (teamName: string) => {
    const now = new Date();
    const nextMatch = fixtures.find(f => {
      const isTeamInvolved = f.teamA === teamName || f.teamB === teamName;
      const matchDate = new Date(f.date || f.playedAt);
      return isTeamInvolved && matchDate > now;
    });

    if (!nextMatch) return null;
    return nextMatch.teamA === teamName ? nextMatch.teamB : nextMatch.teamA;
  };

  return (
    <div className="min-h-screen bg-transparent text-white font-sans selection:bg-white selection:text-black relative">
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100 scale-100"
          style={{ backgroundImage: 'url("https://i.ibb.co/mCNVZdMn/osr-4.png")' }}
        />
        <div className="absolute inset-0" />
      </div>

      <Navbar />
      
      <main className="relative z-10 max-w-[1400px] mx-auto px-4 pt-32 pb-20 space-y-8">
        {/* League Header */}
        <div className="bg-white/[0.03] border border-white/5 backdrop-blur-xl shadow-2xl overflow-hidden relative group rounded-[40px]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/[0.05] via-transparent to-transparent opacity-50" />
          
          <div className="relative z-10 p-8 md:p-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="flex flex-col lg:flex-row items-center gap-10">
                <div className="relative group">
                  <div className="absolute inset-0 bg-blue-600/30 blur-[60px] rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="w-32 h-32 md:w-40 md:h-40 bg-white/10 backdrop-blur-xl rounded-[32px] border border-white/20 flex items-center justify-center p-6 shadow-2xl transform transition-transform group-hover:scale-105 duration-700 relative z-10">
                    <img src={leagueInfo.logo} alt={leagueInfo.name} className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" />
                  </div>
                </div>

                <div className="text-center lg:text-left space-y-4">
                  <div className="space-y-1">
                    <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                      {leagueInfo.name}
                    </h1>
                    <p className="text-lg font-black text-white/40 uppercase tracking-[0.2em] italic">{leagueInfo.country}</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                    <div className="bg-white/10 border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3">
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Sezon</span>
                      <span className="text-sm font-black text-white italic">{leagueInfo.season}</span>
                      <ChevronRight className="w-4 h-4 text-white/20 rotate-90" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-2 bg-white/[0.02] border border-white/10 rounded-full sticky top-24 z-40 backdrop-blur-[20px] shadow-2xl overflow-x-auto no-scrollbar">
          {(leagueInfo.id === '1' ? ['przegląd', 'mecze', 'statystyki', 'sezony', 'newsy'] : ['przegląd', 'tabela', 'mecze', 'statystyki', 'transfery', 'sezony', 'newsy']).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-3 px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)] scale-105' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'przegląd' && <LayoutDashboard className="w-4 h-4" />}
              {tab === 'tabela' && <TableIcon className="w-4 h-4" />}
              {tab === 'mecze' && <Calendar className="w-4 h-4" />}
              {tab === 'statystyki' && <BarChart2 className="w-4 h-4" />}
              {tab === 'transfery' && <ArrowRightLeft className="w-4 h-4" />}
              {tab === 'sezony' && <History className="w-4 h-4" />}
              {tab === 'newsy' && <Newspaper className="w-4 h-4" />}
              {tab}
            </button>
          ))}
        </div>

        {(activeTab === 'przegląd' || activeTab === 'tabela') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Table/Puchar Column */}
            <div className={`${activeTab === 'tabela' ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-6`}>
              {activeTab === 'przegląd' && leagueInfo.id === '1' && (
                <div className="bg-gradient-to-br from-yellow-500/20 to-amber-600/20 backdrop-blur-xl rounded-[40px] border border-yellow-500/20 p-8 flex items-center justify-between shadow-2xl mb-8">
                  <div className="flex items-center gap-8">
                    <div className="w-24 h-24 bg-yellow-500/10 rounded-3xl border border-yellow-500/20 flex items-center justify-center p-4">
                      <img src={getTeamLogo('Zawisza Bydgoszcz')} className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]" alt="" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Zawisza Bydgoszcz</h3>
                      </div>
                      <p className="text-yellow-500 font-black uppercase tracking-[0.3em] italic text-xs">Zwycięzca Turnieju</p>
                    </div>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-white/20 font-black uppercase italic text-[10px] tracking-widest mb-1">Status Turnieju</p>
                    <p className="text-white font-black uppercase italic text-lg tracking-tight">Zakończony</p>
                  </div>
                </div>
              )}

              {activeTab === 'tabela' && (
                <div className="flex flex-wrap items-center justify-between gap-4 bg-white/[0.03] p-4 rounded-3xl backdrop-blur-xl border border-white/5 mb-6">
                   <div className="flex gap-2">
                      {['Wszyscy', 'U siebie', 'Wyjazd', '5 ostatnich meczów', 'xG'].map((f) => (
                         <button 
                           key={f} 
                           onClick={() => setTableFilter(f)}
                           className={`px-6 py-2 rounded-xl font-black uppercase text-[10px] transition-all ${tableFilter === f ? 'bg-white text-black shadow-lg scale-105' : 'text-white/40 hover:text-white'}`}
                         >
                            {f}
                         </button>
                      ))}
                   </div>
                   <div className="hidden md:block">
                      <span className="text-[10px] font-black uppercase italic text-white/20 tracking-widest">Czym jest tabela xG?</span>
                   </div>
                </div>
              )}

              {(activeTab === 'przegląd' && leagueInfo.id === '1') && tournamentData?.groups ? (
                <div className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {tournamentData.groups.map((group: any, gIdx: number) => {
                      const sortedTeams = [...group.teams].sort((a: any, b: any) => {
                        if (b.points !== a.points) return b.points - a.points;
                        const aGD = a.goalsFor - a.goalsAgainst;
                        const bGD = b.goalsFor - b.goalsAgainst;
                        if (bGD !== aGD) return bGD - aGD;
                        return b.goalsFor - a.goalsFor;
                      });

                      return (
                        <div key={gIdx} className="space-y-6">
                          <div className="flex items-center justify-between px-6">
                            <h3 className="text-2xl font-black italic uppercase tracking-tight text-white">{group.name}</h3>
                            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-6" />
                          </div>
                          <div className="bg-white/[0.03] backdrop-blur-xl rounded-[40px] border border-white/5 shadow-2xl overflow-hidden">
                            {sortedTeams.map((entry: any, i: number) => (
                              <div key={i} className="group cursor-pointer">
                                <div className="flex items-center justify-between p-6 hover:bg-white/[0.05] transition-all border-b border-white/5 last:border-0 relative overflow-hidden">
                                  {i < 2 && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                                  )}
                                  <div className="flex items-center gap-6 relative z-10">
                                    <span className={`text-sm font-black italic w-6 ${i < 2 ? 'text-blue-400' : 'text-white/20'}`}>{i + 1}</span>
                                    <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl border border-white/10 group-hover:scale-110 transition-transform shadow-lg">
                                        <img src={getTeamLogo(entry.name)} className="w-7 h-7 object-contain" alt="" />
                                      </div>
                                      <span className="text-sm font-black uppercase italic tracking-tight group-hover:text-blue-400 transition-colors">{entry.name}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-6 relative z-10">
                                    <div className="text-center w-8">
                                      <p className="text-[9px] font-bold text-white/40 uppercase tracking-tighter mb-0.5">M</p>
                                      <p className="font-bold text-base text-white/60">{entry.played}</p>
                                    </div>
                                    <div className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2 min-w-[70px] text-center">
                                      <p className="text-xl font-black text-white">{entry.points}</p>
                                      <p className="text-[8px] font-black text-white/30 uppercase tracking-widest leading-none">PKT</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-12 py-10">
                    <div className="flex items-center justify-between px-6">
                      <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">Faza Pucharowa</h3>
                      <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-10" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 relative">
                      <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-px bg-white/10" />
                      <div className="space-y-8">
                        <h4 className="text-xs font-black uppercase tracking-[0.4em] text-white/30 italic text-center mb-10">Półfinały</h4>
                        <div className="grid grid-cols-1 gap-6">
                          {[
                            { t1: "Arka Gdynia", t2: "Lechia Gdańsk", s1: 0, s2: 0, status: "played", winner: "Arka Gdynia" },
                            { t1: "Sokół Olsztyn", t2: "Zawisza Bydgoszcz", s1: 0, s2: 0, status: "played", winner: "Zawisza Bydgoszcz" }
                          ].map((match, idx) => (
                            <div key={idx} className="bg-white/[0.03] backdrop-blur-xl rounded-3xl border border-white/5 p-6 space-y-4 hover:bg-white/10 transition-all group">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <img src={getTeamLogo(match.t1)} className="w-8 h-8 object-contain" alt="" />
                                  <span className={`text-sm font-black uppercase italic ${match.winner === match.t1 ? 'text-white' : 'text-white/40'}`}>{match.t1}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-xl font-black text-white">{match.s1}</span>
                                  {match.winner === match.t1 && <span className="text-blue-400 font-black italic text-[10px]">AWANS</span>}
                                </div>
                              </div>
                              <div className="h-px bg-white/5" />
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <img src={getTeamLogo(match.t2)} className="w-8 h-8 object-contain" alt="" />
                                  <span className={`text-sm font-black uppercase italic ${match.winner === match.t2 ? 'text-white' : 'text-white/40'}`}>{match.t2}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-xl font-black text-white">{match.s2}</span>
                                  {match.winner === match.t2 && <span className="text-blue-400 font-black italic text-[10px]">AWANS</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-8">
                        <h4 className="text-xs font-black uppercase tracking-[0.4em] text-yellow-500 italic text-center mb-10">Finał</h4>
                        <div className="bg-gradient-to-br from-yellow-500/10 to-amber-600/10 backdrop-blur-2xl rounded-[40px] border border-yellow-500/20 p-10 shadow-2xl relative overflow-hidden group">
                          <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="relative z-10 space-y-8">
                            <div className="flex items-center justify-between gap-6">
                              <div className="flex flex-col items-center gap-4 flex-1">
                                <div className="w-20 h-20 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center p-4">
                                  <img src={getTeamLogo("Arka Gdynia")} className="w-full h-full object-contain" alt="" />
                                </div>
                                <span className="text-sm font-black uppercase italic text-center text-white/40">Arka Gdynia</span>
                                <span className="text-4xl font-black text-white/40">0</span>
                              </div>
                              <div className="text-4xl font-black italic text-white/10">VS</div>
                              <div className="flex flex-col items-center gap-4 flex-1">
                                <div className="w-20 h-20 bg-yellow-500/10 rounded-3xl border border-yellow-500/30 flex items-center justify-center p-4 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                                  <img src={getTeamLogo("Zawisza Bydgoszcz")} className="w-full h-full object-contain" alt="" />
                                </div>
                                <span className="text-sm font-black uppercase italic text-center text-yellow-500">Zawisza Bydgoszcz</span>
                                <span className="text-4xl font-black text-yellow-500">3</span>
                              </div>
                            </div>
                            <div className="bg-yellow-500 py-3 rounded-2xl text-center shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                              <span className="text-black font-black uppercase italic text-xs tracking-[0.2em]">Zwycięzca: Zawisza Bydgoszcz</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-6">
                      <h3 className="text-2xl font-black italic uppercase tracking-tight text-white">Zdjęcie Zwycięzców</h3>
                      <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-6" />
                    </div>
                    <div className="bg-white/[0.03] backdrop-blur-xl rounded-[40px] border border-white/5 shadow-2xl overflow-hidden p-4">
                      <div className="relative aspect-video w-full rounded-[32px] overflow-hidden">
                        <img 
                          src="https://i.ibb.co/f6zCy4G/image.png" 
                          className="absolute inset-0 w-full h-full object-contain" 
                          alt="Zwycięzcy Zawisza Bydgoszcz" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (activeTab === 'przegląd' || activeTab === 'tabela') && (
                <div className="space-y-4">
                  {table.slice(0, activeTab === 'przegląd' ? 18 : undefined).map((entry, idx) => (
                    <div key={idx} className="bg-white/[0.03] border border-white/5 backdrop-blur-xl p-5 flex items-center justify-between group hover:bg-white/10 transition-all shadow-xl rounded-[32px]">
                      <div className="flex items-center gap-6">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                          idx === 0 ? 'bg-yellow-500 text-white shadow-[0_0_15px_rgba(234,179,8,0.4)]' :
                          idx === 1 ? 'bg-slate-400 text-white shadow-[0_0_15px_rgba(148,163,184,0.4)]' :
                          idx === 2 ? 'bg-amber-700 text-white shadow-[0_0_15px_rgba(180,83,9,0.4)]' :
                          'bg-white/10 text-white/60'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 flex items-center justify-center">
                            <img src={getTeamLogo(entry.name)} className="w-full h-full object-contain filter drop-shadow-md" alt="" />
                          </div>
                          <span className="text-xl font-black uppercase tracking-tight text-white">{entry.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-10">
                        <div className="flex items-center gap-6">
                          <div className="text-center w-8">
                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-tighter mb-0.5">M</p>
                            <p className="font-bold text-base text-white">{entry.played}</p>
                          </div>
                          <div className="text-center w-8">
                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-tighter mb-0.5">W</p>
                            <p className="font-bold text-base text-green-400">{entry.won}</p>
                          </div>
                          <div className="text-center w-8">
                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-tighter mb-0.5">R</p>
                            <p className="font-bold text-base text-yellow-400">{entry.drawn}</p>
                          </div>
                          <div className="text-center w-8">
                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-tighter mb-0.5">P</p>
                            <p className="font-bold text-base text-red-400">{entry.lost}</p>
                          </div>
                          <div className="text-center w-12">
                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-tighter mb-0.5">+/-</p>
                            <p className="font-bold text-base text-white/80">{entry.goalsFor}-{entry.goalsAgainst}</p>
                          </div>
                        </div>
                        <div className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-2 min-w-[70px] text-center">
                          <p className="text-xl font-black text-white">{entry.points}</p>
                          <p className="text-[8px] font-black text-white/30 uppercase tracking-widest leading-none">PKT</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {activeTab === 'przegląd' && (
              <div className="lg:col-span-4 space-y-8">
                {leagueInfo.id === '1' ? (
                  <div className="bg-white/[0.03] backdrop-blur-xl rounded-[40px] border border-white/5 shadow-2xl p-8 space-y-8">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black italic uppercase tracking-tight">Składy Finałowe</h3>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Wielki Finał • 21.03</p>
                    </div>
                    
                    <div className="relative aspect-[3/4] bg-[#0f0f0f] rounded-[32px] border border-white/5 overflow-hidden p-4 shadow-inner">
                      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-50" />
                      
                      {/* Pitch Lines */}
                      <div className="relative w-full h-full border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white" />
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-[1.5px] border-white/5 rounded-full" />
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[18%] border-[1px] border-t-0 border-white" />
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30%] h-[7%] border-[1px] border-t-0 border-white" />
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[18%] border-[1px] border-b-0 border-white" />
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[30%] h-[7%] border-[1px] border-b-0 border-white" />
                        </div>

                        {/* Zawisza Bydgoszcz (Top Half) */}
                        <div className="absolute top-4 left-4 flex items-center gap-2 opacity-50">
                          <img src={getTeamLogo('Zawisza Bydgoszcz')} className="w-5 h-5 object-contain" alt="" />
                          <span className="text-[10px] font-black uppercase italic text-yellow-500">Zawisza</span>
                        </div>
                        {ZAWISZA_LINEUP.map((p, i) => (
                          <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group/player" style={{ left: p.x, top: p.y }}>
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-yellow-500/50 bg-black/40 shadow-[0_0_15px_rgba(234,179,8,0.3)] group-hover/player:scale-110 transition-transform">
                              <RobloxAvatar username={p.n} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[7px] font-black text-white/60 uppercase tracking-tighter truncate w-12 text-center group-hover/player:text-yellow-500 transition-colors">{p.n}</span>
                          </div>
                        ))}

                        {/* Arka Gdynia (Bottom Half) */}
                        <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-50">
                          <span className="text-[10px] font-black uppercase italic text-white/40">Arka Gdynia</span>
                          <img src={getTeamLogo('Arka Gdynia')} className="w-5 h-5 object-contain" alt="" />
                        </div>
                        {ARKA_LINEUP.map((p, i) => (
                          <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group/player" style={{ left: p.x, top: p.y }}>
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-black/40 shadow-xl group-hover/player:scale-110 transition-transform">
                              <RobloxAvatar username={p.n} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[7px] font-black text-white/40 uppercase tracking-tighter truncate w-12 text-center group-hover/player:text-white transition-colors">{p.n}</span>
                          </div>
                        ))}

                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/[0.03] backdrop-blur-xl rounded-[40px] border border-white/5 shadow-2xl p-8 space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-xl font-black italic uppercase tracking-tight">Drużyna tygodnia</h3>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Kolejka {selectedRound}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2.5 bg-white/[0.03] rounded-xl border border-white/5 hover:bg-white/10 transition-all text-white/40 hover:text-white"><ChevronLeft className="w-4 h-4" /></button>
                        <button className="p-2.5 bg-white/[0.03] rounded-xl border border-white/5 hover:bg-white/10 transition-all text-white/40 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
                      </div>
                    </div>
                    
                    <div className="relative aspect-[3/4] bg-[#0f0f0f] rounded-[32px] border border-white/5 overflow-hidden p-4 shadow-inner group/field">
                      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-50" />
                      
                        {/* Pitch Lines */}
                      <div className="relative w-full h-full border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white" />
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-[1.5px] border-white/5 rounded-full flex flex-col items-center justify-center p-6">
                            <img src="https://i.ibb.co/kVC8bKr1/LOGO-PFF.png" alt="" className="w-28 h-auto opacity-10 mb-3" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 italic">Brak danych</span>
                          </div>
                          
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[18%] border-[1px] border-t-0 border-white" />
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[30%] h-[7%] border-[1px] border-t-0 border-white" />
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[18%] border-[1px] border-b-0 border-white" />
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[30%] h-[7%] border-[1px] border-b-0 border-white" />
                          <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-16 h-8 border-[1px] border-t-0 border-white rounded-b-full" />
                          <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 w-16 h-8 border-[1px] border-b-0 border-white rounded-t-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Next Round - Hide for ID 1 as it's finished */}
                {leagueInfo.id !== '1' && (
                  <div className="bg-white/[0.03] backdrop-blur-xl rounded-[40px] border border-white/5 shadow-2xl p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black italic uppercase tracking-tight">Następna kolejka</h3>
                      <div className="flex gap-2 text-[10px] font-black uppercase text-white/40 italic">
                        <span>Kolejka 1</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {fixtures.slice(0, 5).map((match, i) => (
                        <Link 
                          key={i} 
                          href={`/mecz/${match.matchUuid || match.id || i}`}
                          className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5 hover:bg-white/10 transition-all shadow-lg group/match"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <img src={getTeamLogo(match.teamA)} className="w-6 h-6 object-contain" alt="" />
                            <span className="text-xs font-black uppercase italic tracking-tight truncate group-hover/match:text-blue-400 transition-colors">{match.teamA}</span>
                          </div>
                          <div className="flex flex-col items-center px-4 min-w-[80px]">
                            <span className="text-[10px] font-black italic">18:30</span>
                            <span className="text-[8px] font-black text-white/20 uppercase">21.03</span>
                          </div>
                          <div className="flex items-center gap-3 flex-1 justify-end text-right">
                            <span className="text-xs font-black uppercase italic tracking-tight truncate group-hover/match:text-blue-400 transition-colors">{match.teamB}</span>
                            <img src={getTeamLogo(match.teamB)} className="w-6 h-6 object-contain" alt="" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'przegląd' && news.length > 0 && (
          <div className="bg-white/[0.03] border border-white/5 backdrop-blur-xl rounded-[40px] p-10 shadow-2xl">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-black uppercase italic tracking-tight">Newsy</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {news.slice(0, 8).map((article, idx) => (
                <div key={idx} className="flex items-center justify-between gap-6 group cursor-pointer pb-8 border-b border-white/5 last:border-0 md:[&:nth-last-child(2)]:border-0">
                  <div className="flex-1 space-y-2">
                    <h4 className="text-base font-black uppercase italic leading-tight group-hover:text-blue-400 transition-colors line-clamp-2">
                      {article.title}
                    </h4>
                    <div className="flex flex-col text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      <span>{article.date || 'przedwczoraj'}</span>
                    </div>
                  </div>
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-white/10">
                    <img src={article.imageUrl || 'https://i.ibb.co/TB027G07/czarnepff-1.png'} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-10">
              <button 
                onClick={() => setActiveTab('newsy')}
                className="px-12 py-4 bg-white/[0.03] border border-white/5 rounded-2xl font-black uppercase italic text-xs hover:bg-white/10 transition-all tracking-widest text-white/60"
              >
                Zobacz więcej
              </button>
            </div>
          </div>
        )}

        {activeTab === 'mecze' && (
          <div className="space-y-8">
             <div className="flex flex-wrap gap-4 items-center justify-between bg-white/[0.03] p-4 rounded-3xl backdrop-blur-xl border border-white/5">
                <div className="flex gap-2">
                   {['Według daty', 'Według rundy', 'Według drużyny'].map((f) => (
                      <button 
                        key={f} 
                        onClick={() => setMatchFilter(f)}
                        className={`px-6 py-2 rounded-xl font-black uppercase text-[10px] transition-all ${matchFilter === f ? 'bg-white text-black shadow-lg scale-105' : 'text-white/40 hover:text-white'}`}
                      >
                         {f}
                      </button>
                   ))}
                </div>
                {leagueInfo.id !== '1' && (
                  <div className="flex items-center gap-8">
                    <button 
                      onClick={() => setSelectedRound(prev => Math.max(rounds[0], prev - 1))}
                      className="text-white/20 hover:text-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-xs font-black uppercase italic tracking-widest text-white/60">{selectedRound}. KOLEJKA</span>
                    <button 
                      onClick={() => setSelectedRound(prev => Math.min(rounds[rounds.length - 1], prev + 1))}
                      className="text-white/20 hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
             </div>

             <div className="space-y-10">
                {groupedFixtures.length > 0 ? groupedFixtures.map(([date, dayMatches]: any, i: number) => (
                   <div key={i} className="space-y-4">
                      <h3 className="px-6 text-[10px] font-black uppercase italic tracking-[0.2em] text-white/30">{date}</h3>
                      <div className="space-y-2">
                         {dayMatches.map((match: any, idx: number) => {
                            const isFinished = match.status === 'played' || match.status === 'finished' || match.status === 'FT';
                            const matchDate = new Date(match.date || match.playedAt);
                            const matchTime = matchDate.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
                            
                            return (
                            <Link 
                               key={idx} 
                               href={`/mecz/${match.matchUuid || match.id || idx}`}
                               className="bg-white/[0.03] border border-white/5 backdrop-blur-xl p-4 flex items-center justify-between group hover:bg-white/[0.05] transition-all rounded-xl"
                            >
                               <div className="flex items-center gap-4 w-[40%]">
                                  <span className="text-[9px] font-black text-white/20 w-8">{isFinished ? 'FT' : ''}</span>
                                  <div className="flex items-center gap-3 ml-auto">
                                     <span className="text-sm font-black uppercase italic text-white/80 group-hover:text-white transition-colors truncate">{match.teamA}</span>
                                     <img src={getTeamLogo(match.teamA)} className="w-8 h-8 object-contain" alt="" />
                                  </div>
                               </div>
                               <div className="bg-white/[0.03] border border-white/5 px-4 py-1.5 rounded-xl font-black text-sm italic tracking-tighter w-24 text-center group-hover:bg-white/10 transition-all flex items-center justify-center min-h-[40px]">
                                  {isFinished ? `${match.scoreA}:${match.scoreB}` : matchTime}
                               </div>
                               <div className="flex items-center gap-4 w-[40%]">
                                  <div className="flex items-center gap-3">
                                     <img src={getTeamLogo(match.teamB)} className="w-8 h-8 object-contain" alt="" />
                                     <span className="text-sm font-black uppercase italic text-white/80 group-hover:text-white transition-colors truncate">{match.teamB}</span>
                                  </div>
                               </div>
                            </Link>
                            );
                         })}
                      </div>
                   </div>
                )) : (
                   <div className="py-20 text-center opacity-20">
                      <p className="font-black uppercase italic tracking-widest text-sm">Brak nadchodzących meczów</p>
                   </div>
                )}
             </div>
          </div>
        )}

        {activeTab === 'statystyki' && (
          <div className="space-y-12">
             <div className="flex gap-4 p-2 bg-white/[0.03] rounded-2xl w-fit">
                <button className="px-6 py-2 bg-white text-black rounded-xl font-black uppercase text-xs">Gracze</button>
                <button className="px-6 py-2 text-white/40 hover:text-white font-black uppercase text-xs transition-all">Drużyny</button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Categorized Stats Cards */}
                {[
                   { title: 'Najlepszy strzelec', data: stats?.scorers || [], key: 'goals', color: 'bg-green-500' },
                   { title: 'Asysty', data: [], key: 'assists', color: 'bg-yellow-500' },
                   { title: 'Gole + asysty', data: [], key: 'points', color: 'bg-green-600' },
                   { title: 'Ocena FotMob', data: [], key: 'rating', color: 'bg-green-500' },
                   { title: 'Rozegrane minuty', data: [], key: 'minutes', color: 'bg-blue-600' },
                   { title: 'Liczba goli na 90', data: [], key: 'goals90', color: 'bg-white/10' },
                   { title: 'Oczekiwane gole (xG)', data: [], key: 'xg', color: 'bg-green-600' },
                   { title: 'xG na 90', data: [], key: 'xg90', color: 'bg-green-500' }
                ].map((cat, i) => (
                   <div key={i} className="bg-white/[0.03] backdrop-blur-xl rounded-[32px] border border-white/5 p-8 shadow-2xl group hover:bg-white/[0.05] transition-all">
                      <div className="flex items-center justify-between mb-8">
                         <h3 className="text-sm font-black uppercase italic tracking-widest text-white">{cat.title}</h3>
                         <ChevronRight className="w-4 h-4 text-white/40 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <div className="space-y-6">
                         {cat.data.length > 0 ? (expandedStats.includes(cat.title) ? cat.data : cat.data.slice(0, 3)).map((p: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between group/item">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full overflow-hidden bg-black border border-white/5 group-hover/item:border-blue-500/50 transition-all">
                                     <RobloxAvatar username={p.name} className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                     <p className="text-[13px] font-black uppercase italic text-white leading-none truncate w-32">{p.name}</p>
                                     <p className="text-[9px] font-bold text-white/30 uppercase mt-1">{p.team}</p>
                                  </div>
                               </div>
                               <div className={`${cat.color} px-3 py-1 rounded-full text-[11px] font-black text-white shadow-lg`}>
                                  {p[cat.key] || '0'}
                               </div>
                            </div>
                         )) : (
                            <div className="py-10 text-center opacity-10">
                               <p className="text-[10px] font-black uppercase italic tracking-widest">Brak danych</p>
                            </div>
                         )}
                      </div>
                      {cat.data.length > 3 && (
                        <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
                          <button 
                            onClick={() => toggleStatExpansion(cat.title)}
                            className="text-[10px] font-black uppercase italic tracking-widest text-white/20 hover:text-white transition-colors"
                          >
                            {expandedStats.includes(cat.title) ? 'Zwiń' : 'Wyświetl wszystkich'}
                          </button>
                        </div>
                      )}
                   </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'sezony' && (
          <div className="space-y-12">
            {/* Club Achievements */}
            <div className="space-y-8">
              <div className="flex items-center justify-between px-6">
                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Historia Mistrzów</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-10" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {achievements?.clubs?.map((club: any, idx: number) => (
                  <div key={idx} className={`relative group ${club.place === 1 ? 'scale-105' : ''}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${
                      club.place === 1 ? 'from-yellow-500/20 to-amber-600/20' :
                      club.place === 2 ? 'from-slate-400/20 to-slate-500/20' :
                      'from-amber-700/20 to-amber-900/20'
                    } blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                    
                    <div className="relative bg-white/[0.03] backdrop-blur-xl rounded-[40px] border border-white/5 p-8 flex flex-col items-center text-center space-y-6 shadow-2xl">
                      <div className="relative">
                        <div className={`w-24 h-24 rounded-3xl flex items-center justify-center p-4 ${
                          club.place === 1 ? 'bg-yellow-500/10 border border-yellow-500/20' :
                          club.place === 2 ? 'bg-slate-400/10 border border-slate-400/20' :
                          'bg-amber-700/10 border border-amber-700/20'
                        }`}>
                          <img src={getTeamLogo(club.team)} className="w-full h-full object-contain" alt="" />
                        </div>
                        <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                          club.place === 1 ? 'bg-yellow-500 text-black' :
                          club.place === 2 ? 'bg-slate-400 text-white' :
                          'bg-amber-700 text-white'
                        }`}>
                          {club.place}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xl font-black uppercase italic tracking-tight">{club.team}</h4>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">{club.tournament_name}</p>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">SEZON {club.season}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Player Achievements */}
            <div className="space-y-8">
              <div className="flex items-center justify-between px-6">
                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Wyróżnieni Zawodnicy</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-10" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {achievements?.players?.map((player: any, idx: number) => (
                  <div key={idx} className="bg-white/[0.03] backdrop-blur-xl rounded-3xl border border-white/5 p-6 flex flex-col items-center text-center space-y-4 group hover:bg-white/10 transition-all cursor-pointer">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 group-hover:scale-110 transition-transform">
                      <RobloxAvatar username={player.roblox_name} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black uppercase italic truncate w-full">{player.roblox_name}</p>
                      <div className="flex items-center justify-center gap-2">
                        <img src={getTeamLogo(player.team)} className="w-4 h-4 object-contain" alt="" />
                        <span className="text-[8px] font-bold text-white/40 uppercase">{player.team}</span>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${
                      player.place === 1 ? 'bg-yellow-500/20 text-yellow-500' :
                      player.place === 2 ? 'bg-slate-400/20 text-slate-400' :
                      'bg-amber-700/20 text-amber-700'
                    }`}>
                      {player.place === 1 ? 'Mistrz' : player.place === 2 ? 'Wicemistrz' : '3. Miejsce'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {(!achievements || achievements.clubs.length === 0) && (
              <div className="bg-white/[0.03] border border-white/5 backdrop-blur-xl rounded-[40px] p-20 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <History className="w-12 h-12 text-white/20" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase italic tracking-widest text-white/60">Brak archiwalnych danych</h3>
                  <p className="text-white/20 font-black uppercase italic text-xs tracking-widest">Historia tego turnieju dopiero się tworzy.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'transfery' && (
          <div className="bg-white/[0.03] border border-white/5 backdrop-blur-xl shadow-2xl p-10 overflow-x-auto rounded-[40px]">
             <table className="w-full min-w-[1000px] border-separate border-spacing-y-4">
                <thead>
                   <tr className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 italic">
                      <th className="px-6 text-left pb-4">Gracz</th>
                      <th className="px-6 text-left pb-4">Opłata</th>
                      <th className="px-6 text-left pb-4">Z:</th>
                      <th className="px-6 text-center pb-4">Pozycja</th>
                      <th className="px-6 text-left pb-4">Kontrakt</th>
                      <th className="px-6 text-right pb-4">Wartość transferu</th>
                      <th className="px-6 text-right pb-4">Data</th>
                   </tr>
                </thead>
                <tbody>
                   {transfers.length > 0 ? transfers.map((t, idx) => (
                      <tr key={idx} className="bg-white/[0.03] hover:bg-white/[0.08] transition-all group cursor-pointer shadow-lg">
                         <td className="px-6 py-4 rounded-l-2xl">
                            <Link href={`/gracz/${encodeURIComponent(t.player)}`} className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-full overflow-hidden border border-white/5 bg-black">
                                  <RobloxAvatar username={t.player} className="w-full h-full object-cover" />
                               </div>
                               <div className="flex flex-col">
                                  <span className="font-black uppercase italic text-sm text-white group-hover:text-blue-400 transition-colors">{t.player}</span>
                                  <div className="flex items-center gap-1.5 mt-0.5 opacity-40">
                                     <span className="text-[14px] leading-none">🇵🇱</span>
                                     <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">{t.country}</span>
                                  </div>
                               </div>
                            </Link>
                         </td>
                         <td className="px-6 py-4">
                            <span className="font-black uppercase italic text-[10px] text-white/80 leading-tight">{t.fee}</span>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 bg-white/5 rounded-lg p-1.5 flex items-center justify-center border border-white/5">
                                  <img src={getTeamLogo(t.to)} className="w-full h-full object-contain" alt="" />
                               </div>
                               <div className="flex flex-col">
                                  <span className="font-black uppercase italic text-[10px] text-white/40 leading-none mb-1">Z: {t.from}</span>
                                  <span className="font-black uppercase italic text-sm text-white/80">DO: {t.to}</span>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-4 text-center">
                            <span className="px-3 py-1 bg-white/10 border border-white/5 rounded-lg text-[9px] font-black uppercase italic text-white/40">{t.position}</span>
                         </td>
                         <td className="px-6 py-4">
                            <span className="font-black uppercase italic text-xs text-white/80">{t.duration}</span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <span className="font-black uppercase italic text-sm text-white">{t.value}</span>
                         </td>
                         <td className="px-6 py-4 text-right rounded-r-2xl">
                            <div className="flex flex-col items-end">
                               <span className="font-black uppercase italic text-sm text-white">{t.date}</span>
                            </div>
                         </td>
                      </tr>
                   )) : (
                      <tr>
                         <td colSpan={7} className="text-center py-40 opacity-20">
                            <p className="font-black uppercase italic tracking-widest text-sm">Brak danych o transferach</p>
                         </td>
                      </tr>
                   )}
                </tbody>
             </table>
          </div>
        )}

        {activeTab === 'newsy' && (
          <div className="space-y-8">
             {news.length > 0 ? (
                <>
                   {/* Featured Row */}
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Large Featured */}
                      <Link 
                        href={`/aktualnosc/${news[0].id}`}
                        className="lg:col-span-7 bg-white/[0.03] backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden group relative min-h-[400px]"
                      >
                         <img src={news[0].imageUrl || 'https://i.ibb.co/TB027G07/czarnepff-1.png'} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                         <div className="absolute inset-x-0 bottom-0 p-8 pt-20 bg-gradient-to-t from-red-600/90 to-transparent">
                            <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white leading-none mb-4">
                               {news[0].title}
                            </h3>
                            <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-white/80 italic">
                               {news[0].date || 'przedwczoraj'}
                            </div>
                         </div>
                      </Link>

                      {/* Small List */}
                      <div className="lg:col-span-5 flex flex-col gap-4">
                         {news.slice(1, 5).map((article, idx) => (
                            <Link 
                              key={idx}
                              href={`/aktualnosc/${article.id}`}
                              className="bg-white/[0.03] backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden hover:bg-white/10 transition-all group flex h-32"
                            >
                               <div className="p-5 flex-1 flex flex-col justify-between min-w-0">
                                  <h3 className="text-sm font-black uppercase italic tracking-tight line-clamp-2 group-hover:text-blue-400 transition-colors leading-tight">
                                     {article.title}
                                  </h3>
                                  <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                                     {article.date || '3 dni temu'}
                                  </div>
                               </div>
                               <div className="w-32 relative shrink-0">
                                  <img src={article.imageUrl || 'https://i.ibb.co/TB027G07/czarnepff-1.png'} alt="" className="w-full h-full object-cover" />
                               </div>
                            </Link>
                         ))}
                      </div>
                   </div>

                   {/* Secondary Grid */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                      {news.slice(5).map((article, idx) => (
                         <Link 
                           key={idx}
                           href={`/aktualnosc/${article.id}`}
                           className="bg-white/[0.03] backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden hover:bg-white/10 transition-all group flex h-40"
                         >
                            <div className="p-6 flex-1 flex flex-col justify-between min-w-0">
                               <h3 className="text-base font-black uppercase italic tracking-tight line-clamp-2 group-hover:text-blue-400 transition-colors leading-tight">
                                  {article.title}
                               </h3>
                               <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                                  {article.date || '3 dni temu'}
                               </div>
                            </div>
                            <div className="w-40 relative shrink-0">
                               <img src={article.imageUrl || 'https://i.ibb.co/TB027G07/czarnepff-1.png'} alt="" className="w-full h-full object-cover" />
                            </div>
                         </Link>
                      ))}
                   </div>
                   
                   <div className="flex justify-center mt-12">
                      <button className="px-10 py-4 bg-white/[0.03] border border-white/5 rounded-2xl font-black uppercase italic text-xs hover:bg-white/10 transition-all tracking-widest text-white/60">
                         Zobacz więcej
                      </button>
                   </div>
                </>
             ) : (
                <div className="py-40 flex flex-col items-center justify-center opacity-20">
                   <Newspaper className="w-20 h-20 mb-6" />
                   <p className="font-black uppercase italic tracking-widest text-sm">Brak aktualności powiązanych z tą ligą</p>
                </div>
             )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}


