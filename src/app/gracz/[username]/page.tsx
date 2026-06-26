'use client';

import { MainNavbar } from '@/components/main-navbar';
import { Footer } from '@/components/footer';
import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { teams } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';

import { 
  ChevronRight, 
  Star, 
  Target,
  Calendar,
  Users,
  Trophy,
  MapPin,
  TrendingUp,
  Activity,
  Zap,
  MousePointer2,
  PieChart,
  ArrowLeft,
  CircleDot
} from 'lucide-react';
import { mapPositionToPolish, cn } from '@/lib/utils';

interface PlayerData {
  id: number;
  first_name: string;
  last_name: string;
  birth_date: string;
  position: string;
  jersey_number: number | null;
  nationality: string | null;
  height: number | null;
  preferred_foot: string | null;
  photo_url: string | null;
  current_team_id: number | null;
  current_team_name: string | null;
  career: Array<{
    team_id: number;
    team_name: string;
    team_logo_url: string;
    joined_at: string;
    left_at: string | null;
  }>;
  goals: number;
  yellow_cards: number;
  red_cards: number;
  assists?: number;
  matches_played?: number;
}

export default function GraczPage() {
  const params = useParams();
  const username = params.username as string;
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiTeams, setApiTeams] = useState<any[]>([]);

  useEffect(() => {
    async function fetchPlayerData() {
      try {
        setLoading(true);
        const decodedUsername = decodeURIComponent(username)
          .replace(/-/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .toLowerCase();
        
        const [playersRes, statsRes, teamsRes] = await Promise.all([
          fetch('https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/players'),
          fetch('https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/stats/players?season_id=1'),
          fetch('https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/teams')
        ]);

        if (teamsRes.ok) {
          setApiTeams(await teamsRes.json());
        }

        if (playersRes.ok) {
          const players = await playersRes.json();
          const stats = statsRes.ok ? await statsRes.json() : [];

          const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
          const target = normalize(decodedUsername);

          const foundPlayer = players.find((p: any) => {
            const first = normalize(p.first_name || '');
            const last = normalize(p.last_name || '');
            const full = `${first} ${last}`.trim();
            const lastFirst = `${last} ${first}`.trim();
            
            return full === target || 
                   lastFirst === target || 
                   last === target ||
                   full.replace(/\s+/g, '-') === username.toLowerCase() ||
                   last.replace(/\s+/g, '-') === username.toLowerCase();
          });

          if (foundPlayer) {
            const playerStats = stats.find((s: any) => s.player_id === foundPlayer.id);
            setPlayer({
              ...foundPlayer,
              assists: playerStats?.assists || 0,
              matches_played: playerStats?.matches_played || 0,
              goals: playerStats?.goals || foundPlayer.goals 
            });
          }
        }
      } catch (err) {
        console.error('Error fetching player data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlayerData();
  }, [username]);

  const attributes = useMemo(() => {
    if (!player) return null;
    const seed = player.id;
    const getAttr = (offset: number) => 60 + (Math.abs(Math.sin(seed + offset)) * 35);
    
    return [
      { name: 'Tempo', value: Math.round(getAttr(1)), color: 'bg-orange-500' },
      { name: 'Strzały', value: Math.round(getAttr(2)), color: 'bg-yellow-500' },
      { name: 'Podania', value: Math.round(getAttr(3)), color: 'bg-green-500' },
      { name: 'Drybling', value: Math.round(getAttr(4)), color: 'bg-lime-500' },
      { name: 'Obrona', value: Math.round(getAttr(5)), color: 'bg-blue-500' },
      { name: 'Fizyczne', value: Math.round(getAttr(6)), color: 'bg-sky-500' },
    ];
  }, [player]);

  const getTeamLogo = (teamId: number | null) => {
    if (!teamId || player?.current_team_name?.toLowerCase().includes('wolny')) {
      return 'https://i.ibb.co/60WkYd2m/IMG-4837-4.png';
    }
    const team = apiTeams.find(t => t.id === teamId);
    if (team?.logo_url) return team.logo_url;
    
    // Fallback to local teams if not found in API teams
    const localTeam = teams.find(t => parseInt(t.id) === teamId);
    return localTeam ? localTeam.logo : 'https://i.ibb.co/60WkYd2m/IMG-4837-4.png';
  };

  if (loading) {
    return (
      <main className="bg-[#020617] min-h-screen flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-6">
           <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
           <h1 className="text-xl font-black uppercase italic tracking-widest text-white/40">ŁADOWANIE PROFILU...</h1>
        </div>
      </main>
    );
  }

  if (!player) {
    return (
      <main className="bg-[#020617] min-h-screen text-white flex items-center justify-center relative overflow-hidden">
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
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-600/20 rounded-full blur-[120px]" />
        </div>

        <div className="text-center z-10">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-4 drop-shadow-2xl">Zawodnik nie znaleziony</h1>
          <Link href="/tabela" className="text-blue-400 hover:text-blue-300 flex items-center gap-2 justify-center font-black uppercase text-[10px] tracking-widest transition-colors">
            <ArrowLeft className="w-4 h-4" /> Powrót do tabeli
          </Link>
        </div>
      </main>
    );
  }

  const age = player.birth_date ? new Date().getFullYear() - new Date(player.birth_date).getFullYear() : '---';

  const mapFootToPolish = (foot: string | null) => {
    if (!foot) return '---';
    const map: { [key: string]: string } = {
      'right': 'PRAWA',
      'left': 'LEWA',
      'both': 'OBIE'
    };
    return map[foot.toLowerCase()] || foot.toUpperCase();
  };

  const getFlagUrl = (nationality: string | null) => {
    if (!nationality) return 'https://flagcdn.com/w40/pl.png';
    
    const countryMap: { [key: string]: string } = {
      // Europe
      'polska': 'pl', 'poland': 'pl',
      'albania': 'al',
      'niemcy': 'de', 'germany': 'de',
      'anglia': 'gb', 'england': 'gb',
      'hiszpania': 'es', 'spain': 'es',
      'francja': 'fr', 'france': 'fr',
      'włochy': 'it', 'italy': 'it',
      'portugalia': 'pt', 'portugal': 'pt',
      'holandia': 'nl', 'netherlands': 'nl',
      'belgia': 'be', 'belgium': 'be',
      'finlandia': 'fi', 'finland': 'fi',
      'szwecja': 'se', 'sweden': 'se',
      'norwegia': 'no', 'norway': 'no',
      'dania': 'dk', 'denmark': 'dk',
      'islandia': 'is', 'iceland': 'is',
      'szwajcaria': 'ch', 'switzerland': 'ch',
      'austria': 'at',
      'turcja': 'tr', 'turkey': 'tr',
      'grecja': 'gr', 'greece': 'gr',
      'chorwacja': 'hr', 'croatia': 'hr',
      'serbia': 'rs',
      'słowenia': 'si', 'slovenia': 'si',
      'słowacja': 'sk', 'slovakia': 'sk',
      'czechy': 'cz', 'czech republic': 'cz',
      'węgry': 'hu', 'hungary': 'hu',
      'rumunia': 'ro', 'romania': 'ro',
      'bułgaria': 'bg', 'bulgaria': 'bg',
      'ukraina': 'ua', 'ukraine': 'ua',
      'białoruś': 'by', 'belarus': 'by',
      'litwa': 'lt', 'lithuania': 'lt',
      'łotwa': 'lv', 'latvia': 'lv',
      'estonia': 'ee',
      'mołdawia': 'md', 'moldova': 'md',
      'gruzja': 'ge', 'georgia': 'ge',
      'armenia': 'am',
      'azerbejdżan': 'az', 'azerbaijan': 'az',

      // Americas
      'brazylia': 'br', 'brazil': 'br',
      'argentyna': 'ar', 'argentina': 'ar',
      'usa': 'us', 'united states': 'us',
      'kanada': 'ca', 'canada': 'ca',
      'meksyk': 'mx', 'mexico': 'mx',
      'kolumbia': 'co', 'colombia': 'co',
      'urugwaj': 'uy', 'urugway': 'uy',
      'chile': 'cl',

      // Africa
      'senegal': 'sn',
      'nigeria': 'ng',
      'maroko': 'ma', 'morocco': 'ma',
      'algieria': 'dz', 'algeria': 'dz',
      'tunezja': 'tn', 'tunisia': 'tn',
      'egipt': 'eg', 'egypt': 'eg',
      'wybrzeże kości słoniowej': 'ci', 'ivory coast': 'ci',
      'ghana': 'gh',
      'kamerun': 'cm', 'cameroon': 'cm',

      // Asia & Oceania
      'japonia': 'jp', 'japan': 'jp',
      'korea południowa': 'kr', 'south korea': 'kr',
      'chiny': 'cn', 'china': 'cn',
      'australia': 'au'
    };

    const code = countryMap[nationality.toLowerCase().trim()] || 'un';
    return `https://flagcdn.com/w40/${code}.png`;
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
          className="object-cover brightness-[0.7]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
        
        {/* Blue/Red Splashes based on new logo */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 pt-44 pb-24 relative z-10">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
           <Link href="/tabela" className="group flex items-center gap-2 text-white/40 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Wróć do listy zawodników
           </Link>
        </div>

        {/* Header Profile Section */}
        <div className="flex flex-col lg:flex-row items-center lg:items-end gap-12 mb-12 relative">
            {/* Background Number - Large Cutout Behind */}
            <div className="absolute top-1/2 -translate-y-[55%] left-[-15%] text-[55rem] font-black text-white/[0.04] italic leading-none select-none pointer-events-none z-0 hidden lg:block uppercase tracking-tighter">
                {player.jersey_number || player.id}
            </div>

            {/* Player Photo - Cutout Style (No border) */}
            <div className="relative shrink-0 z-10 w-80 h-[36rem] sm:w-[550px] sm:h-[48rem] -mb-12 lg:-ml-32 flex items-end justify-center">
                <Image 
                    src={player.photo_url || "https://i.ibb.co/S7RD8ZHj/images-removebg-preview-1.png"} 
                    alt={player.last_name}
                    fill
                    className={cn(
                        "object-contain object-bottom drop-shadow-[0_20px_60px_rgba(0,0,0,0.6)]",
                        !player.photo_url 
                          ? "scale-100 opacity-90 brightness-125 filter drop-shadow-[0_0_40px_rgba(59,130,246,0.3)]" 
                          : "scale-110"
                    )}
                    priority
                />
            </div>

            {/* Name and Basic Info */}
            <div className="flex-1 text-center lg:text-left z-10 pb-12 lg:pl-10">
                <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-12">
                    <div className="flex-1">
                        <div className="mb-8">
                            <h2 className="text-5xl sm:text-7xl font-light text-white/70 uppercase tracking-tighter mb-[-12px] drop-shadow-2xl">{player.first_name}</h2>
                            <h1 className="text-8xl sm:text-[11rem] font-black text-white uppercase italic tracking-tighter leading-[0.75] drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                                {player.last_name}
                            </h1>
                        </div>

                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 mb-12">
                            <div className="bg-yellow-500 text-black px-8 py-3 rounded-xl text-2xl font-black uppercase italic tracking-widest shadow-[0_10px_30px_rgba(234,179,8,0.4)]">#{player.jersey_number || player.id}</div>
                            <div className="bg-blue-600/40 text-blue-100 border-2 border-blue-500/30 px-8 py-3 rounded-xl text-lg font-black uppercase tracking-[0.25em] shadow-2xl backdrop-blur-md">
                                {mapPositionToPolish(player.position || 'Pomocnik')}
                            </div>
                        </div>

                        {/* Info Pills */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl">
                            <InfoPill icon={<Calendar className="w-6 h-6" />} label="Data urodzenia" value={`${player.birth_date || '24.03.2001'} (${age} LATA)`} />
                            <InfoPill icon={<TrendingUp className="w-6 h-6" />} label="Wzrost" value={player.height ? `${player.height} CM` : '--- CM'} />
                            <InfoPill icon={<Zap className="w-6 h-6" />} label="Noga" value={mapFootToPolish(player.preferred_foot)} />
                            <InfoPill icon={<MapPin className="w-6 h-6" />} label="Narodowość" value={player.nationality?.toUpperCase() || 'POLSKA'} flag={getFlagUrl(player.nationality)} />
                        </div>
                    </div>

                    {/* Moved Club Panel to Header */}
                    <div className="shrink-0 w-full xl:w-[400px]">
                        <Card title="Aktualny Klub" className="bg-white/[0.06] border-white/20">
                            <div className="flex items-center gap-8 mb-12">
                                <div className="w-32 h-32 rounded-[2rem] bg-white/[0.05] border-2 border-white/10 p-6 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform">
                                    <img src={getTeamLogo(player.current_team_id)} alt="" className="w-full h-full object-contain drop-shadow-lg" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-4xl font-black uppercase tracking-tight mb-2 text-white drop-shadow-md">
                                        {(!player.current_team_id || player.current_team_name?.toLowerCase().includes('wolny')) ? 'Wolny Zawodnik' : (player.current_team_name || 'FC Działdowo')}
                                    </h4>
                                    <p className="text-[13px] text-white/50 uppercase font-black tracking-[0.25em] italic">
                                        {(!player.current_team_id || player.current_team_name?.toLowerCase().includes('wolny')) ? 'BEZ KLUBU' : '1 LIGA DZIAŁDOWSKA'}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2rem] text-center shadow-inner">
                                    <p className="text-[11px] text-white/40 uppercase font-black tracking-widest mb-3">OD</p>
                                    <p className="text-xl font-black uppercase tracking-widest text-blue-400">
                                        {(!player.current_team_id || player.current_team_name?.toLowerCase().includes('wolny'))
                                            ? '---'
                                            : (player.career && player.career.length > 0 
                                                ? new Date(player.career.find(c => c.team_id === player.current_team_id)?.joined_at || player.career[0].joined_at).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' }).toUpperCase() 
                                                : 'MAJA 2026')}
                                    </p>
                                </div>
                                <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2rem] text-center shadow-inner">
                                    <p className="text-[11px] text-white/40 uppercase font-black tracking-widest mb-3">NUMER</p>
                                    <p className="text-3xl font-black uppercase tracking-widest text-white">{player.jersey_number || '---'}</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>

        {/* Top Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 relative z-20">
            <HeaderStat icon={<CircleDot />} label="MECZE" value={player.matches_played || 0} />
            <HeaderStat icon={<Trophy />} label="BRAMKI" value={player.goals} />
            <HeaderStat icon={<Zap />} label="ASYSTY" value={player.assists || 0} />
            <HeaderStat icon={<Activity />} label="MINUTY" value={(player.matches_played || 0) * 85} />
        </div>

        {/* Grid Layout based on Screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 relative z-10">
            
        {/* Column 1: Career History & Achievements */}
            <div className="lg:col-span-4 flex flex-col gap-8">
                <Card title="Historia klubów">
                    <div className="space-y-10 relative before:absolute before:left-[24px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                        {/* Current Club - Only show if NOT a free agent */}
                        {(!player.current_team_id || player.current_team_name?.toLowerCase().includes('wolny')) ? null : (
                            <div className="relative pl-16 group/item">
                                <div className="absolute left-0 top-1 w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 p-2 flex items-center justify-center z-10 shadow-[0_0_25px_rgba(37,99,235,0.2)] transition-transform group-hover/item:scale-110 overflow-hidden">
                                    <div className="absolute inset-0 bg-blue-600 opacity-20" />
                                    <img src={getTeamLogo(player.current_team_id)} alt="" className="w-full h-full object-contain relative z-10" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black uppercase tracking-widest text-white group-hover/item:text-blue-400 transition-colors">
                                        {player.current_team_name || 'FC Działdowo'}
                                    </h4>
                                    <p className="text-[11px] text-blue-400 font-black uppercase tracking-[0.2em] mt-1 italic">AKTUALNY KLUB</p>
                                    <p className="text-[11px] text-white/40 font-bold uppercase tracking-widest mt-3 italic">
                                        OD {player.career && player.career.length > 0 
                                            ? new Date(player.career.find(c => c.team_id === player.current_team_id)?.joined_at || player.career[0].joined_at).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' }).toUpperCase() 
                                            : 'MAJA 2026'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Past Clubs from API */}
                        {player.career && player.career.filter(c => c.team_id !== player.current_team_id && !c.team_name.toLowerCase().includes('wolny')).length > 0 ? (
                            player.career.filter(c => c.team_id !== player.current_team_id && !c.team_name.toLowerCase().includes('wolny')).map((entry, idx) => (
                                <div key={idx} className="relative pl-16 group/item">
                                    <div className="absolute left-1.5 top-1.5 w-9 h-9 rounded-xl bg-white/5 border border-white/10 p-2 flex items-center justify-center z-10 transition-all group-hover/item:bg-white/10 shadow-lg">
                                        <img src={entry.team_logo_url || getTeamLogo(entry.team_id)} alt="" className="w-full h-full object-contain opacity-60 group-hover/item:opacity-100 transition-opacity" />
                                    </div>
                                    <div>
                                        <h4 className="text-[15px] font-black uppercase tracking-widest text-white/70 group-hover/item:text-white transition-colors">
                                            {entry.team_name}
                                        </h4>
                                        <p className="text-[11px] text-white/30 font-bold uppercase tracking-widest mt-2 italic">
                                            {new Date(entry.joined_at).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' }).toUpperCase()} 
                                            {entry.left_at ? ` — ${new Date(entry.left_at).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' }).toUpperCase()}` : ' — KONIEC KONTRAKTU'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                           (!player.current_team_id || player.current_team_name?.toLowerCase().includes('wolny')) ? (
                              <div className="relative pl-16">
                                  <div className="absolute left-2 top-2 w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center z-10">
                                      <Users className="w-4 h-4 text-white/10" />
                                  </div>
                                  <p className="text-xs text-white/20 font-black uppercase tracking-widest italic pt-3">BRAK POPRZEDNICH KLUBÓW</p>
                              </div>
                           ) : null
                        )}
                    </div>
                </Card>

                <Card title="Osiągnięcia">
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6 opacity-20">
                            <Trophy className="w-8 h-8" />
                        </div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Brak zdobytych trofeum</h4>
                    </div>
                </Card>
            </div>

            {/* Column 2: Season Stats */}
            <div className="lg:col-span-8 flex flex-col gap-8">
                <Card title={`Statystyki sezonu`} 
                    extra={
                        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 px-4 py-1.5 rounded-lg">
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">SEZON:</span>
                            <select className="bg-transparent text-[10px] font-black text-blue-400 uppercase tracking-widest outline-none border-none cursor-pointer">
                                <option className="bg-[#020617]">2026/2027</option>
                            </select>
                        </div>
                    }
                >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-12 gap-x-4 py-6">
                        <StatNum label="WYSTĘPY" val={player.matches_played || 0} />
                        <StatNum label="BRAMKI" val={player.goals} />
                        <StatNum label="ASYSTY" val={player.assists || 0} />
                        <StatNum label="ŻÓŁTE KARTKI" val={player.yellow_cards} />
                        <StatNum label="CZERWONE KARTKI" val={player.red_cards} />
                        <StatNum label="MINUTY" val={(player.matches_played || 0) * 85} />
                        <StatNum label="MVP MECZU" val={Math.floor(player.goals / 2)} />
                    </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card title="Ostatnie mecze">
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6 opacity-20">
                                <Activity className="w-8 h-8" />
                            </div>
                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">BRAK DANYCH O MECZACH</h4>
                            <p className="text-[9px] text-white/10 font-bold uppercase tracking-widest">HISTORIA SPOTKAŃ JEST AKTUALIZOWANA</p>
                        </div>
                        <button disabled className="w-full mt-10 py-4 bg-white/[0.01] border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/10 cursor-not-allowed">
                            ZOBACZ WSZYSTKIE MECZE
                        </button>
                    </Card>

                    <Card title="Wydajność w sezonie">
                        <div className="flex flex-col gap-10 py-4">
                            <div className="text-center group">
                                <div className="text-[4rem] font-black italic tracking-tighter text-blue-400 mb-1 group-hover:scale-110 transition-transform drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">{(player.matches_played || 0) * 85}</div>
                                <p className="text-[11px] text-white/60 uppercase font-black tracking-widest">ROZEGRANYCH MINUT</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-10">
                                <div className="text-center group border-r border-white/5">
                                    <div className="text-[3rem] font-black italic tracking-tighter text-white mb-1 group-hover:scale-110 transition-transform">{player.goals}</div>
                                    <p className="text-[10px] text-white/60 uppercase font-black tracking-widest">BRAMKI</p>
                                </div>
                                <div className="text-center group">
                                    <div className="text-[3rem] font-black italic tracking-tighter text-white/60 mb-1 group-hover:scale-110 transition-transform">{player.matches_played || 0}</div>
                                    <p className="text-[10px] text-white/60 uppercase font-black tracking-widest">WYSTĘPY</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

function HeaderStat({ icon, label, value, color = "text-white" }: { icon: React.ReactNode, label: string, value: any, color?: string }) {
    return (
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] text-center group hover:bg-white/[0.06] transition-all duration-500 shadow-xl">
            <div className={cn("w-6 h-6 mx-auto mb-5 opacity-40 group-hover:opacity-100 transition-opacity flex items-center justify-center text-blue-500")}>
                {icon}
            </div>
            <p className="text-5xl font-black mb-1 italic tracking-tighter">{value}</p>
            <p className="text-[11px] text-white/60 uppercase font-black tracking-widest">{label}</p>
        </div>
    );
}

function Card({ title, children, className, extra }: { title: string, children: React.ReactNode, className?: string, extra?: React.ReactNode }) {
  return (
    <div className={cn("bg-white/[0.04] backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] relative overflow-hidden group hover:bg-white/[0.06] transition-all duration-500 h-full", className)}>
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-5">
            <div className="w-1.5 h-7 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]" />
            <h3 className="text-[16px] font-black uppercase tracking-[0.3em] text-white group-hover:text-blue-400 transition-colors drop-shadow-lg">{title}</h3>
        </div>
        {extra}
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

function InfoPill({ icon, label, value, flag }: { icon: any, label: string, value: string, flag?: string }) {
    return (
        <div className="flex flex-col items-center lg:items-start gap-1 bg-white/[0.04] backdrop-blur-sm border border-white/10 p-5 rounded-3xl group hover:bg-white/[0.08] transition-all shadow-xl">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-500 opacity-60 group-hover:opacity-100 transition-opacity">{icon}</span>
                <p className="text-[11px] text-white/60 uppercase font-black tracking-[0.1em]">{label}</p>
            </div>
            <p className="text-[13px] font-black tracking-widest flex items-center gap-2">
                {flag && <Image src={flag} width={20} height={14} alt="" className="rounded shadow-sm" />}
                {value}
            </p>
        </div>
    );
}

function AchItem({ title, sub, date }: { title: string, sub: string, date: string }) {
    return (
        <div className="flex flex-col items-center text-center group">
            <div className="relative w-16 h-16 mb-5">
                <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all" />
                <div className="relative w-full h-full rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-transparent" />
                    <Trophy className="w-7 h-7 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.4)]" />
                </div>
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-1 leading-tight text-white">{title}</h4>
            <p className="text-[8px] text-white/40 font-bold uppercase tracking-widest mb-0.5">{sub}</p>
            <p className="text-[8px] text-blue-400/60 font-black uppercase tracking-widest">{date}</p>
        </div>
    );
}

function StatNum({ label, val }: { label: string, val: any }) {
    return (
        <div className="text-center group">
            <p className="text-[3.5rem] font-black italic tracking-tighter mb-2 group-hover:scale-110 transition-transform duration-500 drop-shadow-xl text-white">{val}</p>
            <p className="text-[12px] text-white/60 uppercase font-black tracking-[0.15em] leading-tight px-2">{label}</p>
        </div>
    );
}

function InfoRow({ label, val }: { label: string, val: string }) {
    return (
        <div className="flex items-center justify-between py-5 border-b border-white/5 last:border-0 hover:bg-white/[0.01] transition-colors">
            <span className="text-[11px] text-white/40 font-bold uppercase tracking-[0.15em]">{label}</span>
            <span className="text-[12px] font-black uppercase tracking-widest text-right ml-6">{val}</span>
        </div>
    );
}

function CircleStat({ label, val }: { label: string, val: number }) {
    return (
        <div className="text-center group">
            <div className="relative w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90 group-hover:scale-105 transition-transform duration-500">
                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-blue-500" strokeDasharray={226.2} strokeDashoffset={226.2 * (1 - val / 100)} strokeLinecap="round" />
                </svg>
                <span className="absolute text-lg font-black italic tracking-tighter drop-shadow-lg">{val}%</span>
            </div>
            <p className="text-[9px] text-white/30 uppercase font-black tracking-widest leading-tight">{label}</p>
        </div>
    );
}

function MatchRow({ date, opp, score, rate, col, logo }: { date: string, opp: string, score: string, rate: number, col: string, logo: string }) {
    return (
        <div className="flex items-center justify-between group py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] px-2 rounded-lg transition-colors">
            <span className="text-[11px] text-white/40 font-bold tabular-nums shrink-0">{date}</span>
            <div className="flex items-center gap-4 flex-1 mx-6 min-w-0">
               <div className="w-7 h-7 rounded-lg bg-white/5 p-1.5 flex-shrink-0 shadow-lg">
                  <img src={logo} alt="" className="w-full h-full object-contain" />
               </div>
               <span className="text-[12px] font-black uppercase tracking-widest truncate group-hover:text-blue-400 transition-colors">{opp}</span>
            </div>
            <div className="flex items-center gap-5 shrink-0">
                <span className="text-[13px] font-black tabular-nums tracking-tighter italic">{score}</span>
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black shadow-2xl italic", col)}>
                    {rate}
                </div>
            </div>
        </div>
    );
}
