'use client';

import { MainNavbar } from '@/components/main-navbar';
import { Footer } from '@/components/footer';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Activity, ChevronLeft, Calendar } from 'lucide-react';
import Image from 'next/image';

interface Match {
  match_id: number;
  date: string;
  round: number;
  side: 'home' | 'away';
  opponent_name: string;
  opponent_logo: string;
  home_score: number | null;
  away_score: number | null;
  status: string;
  match_type?: string;
}

export default function TerminarzPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [matches, setMatches] = useState<Match[]>([]);
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(true);

  const getLeagueLogo = (matchType?: string) => {
    if (matchType === 'champions_cup') return 'https://i.ibb.co/4wpcgDRj/IMG-4837-2.png';
    if (matchType === 'county_cup') return 'https://i.ibb.co/qMzPb2kp/IMG-4837-3.png';
    return 'https://i.ibb.co/rK2KV1FN/IMG-4837-1.png'; // league
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [teamsRes, allMatchesRes] = await Promise.all([
          fetch(`https://league-builder.replit.app/api/teams?season_id=1`),
          fetch(`https://league-builder.replit.app/api/matches?season_id=1`)
        ]);

        const teams = await teamsRes.json();
        const allMatches = await allMatchesRes.json();

        const currentTeam = teams.find((t: any) => 
          t.id?.toString() === id || 
          t.short_name?.toLowerCase() === id.toLowerCase() ||
          (t.name && t.name.toLowerCase().replace(/\s+/g, '-') === id.toLowerCase()) ||
          (t.name && t.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-') === id.toLowerCase())
        );

        if (currentTeam) {
          const teamId = currentTeam.id.toString();
          setTeamName(currentTeam.name);
          
          const teamMatches = allMatches.filter((m: any) => 
            m.home_team_id?.toString() === teamId || m.away_team_id?.toString() === teamId
          ).map((m: any) => {
            const side = m.home_team_id?.toString() === teamId ? 'home' : 'away';
            const oppId = side === 'home' ? m.away_team_id : m.home_team_id;
            const opponent = teams.find((t: any) => t.id === oppId);
            
            return {
              match_id: m.id || m.match_id,
              date: m.scheduled_at || m.date || (m.home_score !== null ? 'MAJ 2026' : 'CZER 2026'),
              round: m.round,
              side,
              opponent_name: (side === 'home' ? m.away_team_name : m.home_team_name) || opponent?.name || 'OCZEKIWANIE',
              opponent_logo: opponent?.logo_url || (side === 'home' ? m.away_team_logo : m.home_team_logo) || 'https://i.ibb.co/TB027G07/czarnepff-1.png',
              home_score: m.home_score,
              away_score: m.away_score,
              status: m.status,
              match_type: m.match_type
            };
          });
          
          setMatches(teamMatches.sort((a: any, b: any) => {
            if (!a.date || a.date.includes('MAJ')) return -1;
            if (!b.date || b.date.includes('MAJ')) return 1;
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) return <div className="bg-[#020617] min-h-screen flex items-center justify-center"><Activity className="animate-spin text-blue-500 w-12 h-12" /></div>;

  return (
    <main className="bg-[#020617] min-h-screen text-white">
      <MainNavbar />
      <div className="fixed inset-0 z-0">
        <Image
          src="https://i.ibb.co/YCB7X52/obraz-2026-06-13-150303737.png"
          alt=""
          fill
          className="object-cover brightness-[0.7] scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#020617]" />
        
        {/* Animated Glows */}
        <div className="absolute top-1/4 -left-20 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 pt-36 pb-20 relative z-10">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-blue-400 mb-10 uppercase font-black text-xs tracking-widest hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" /> Wróć do klubu
        </button>

        <h1 className="text-5xl font-black italic uppercase mb-16 tracking-tighter">PEŁNY TERMINARZ: <span className="text-blue-500">{teamName}</span></h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {matches.map((match) => (
            <div key={match.match_id} className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 backdrop-blur-xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
              <div className="flex justify-between items-start mb-8">
                <div className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-widest">
                  KOLEJKA {match.round}
                </div>
                <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">{match.date}</div>
              </div>

              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 bg-white/5 rounded-2xl p-4 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                  <img src={match.opponent_logo} alt="" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 relative opacity-80">
                       <img src={getLeagueLogo(match.match_type)} alt="" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                    </div>
                    <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{match.side === 'home' ? 'DOM' : 'WYJAZD'} VS</div>
                  </div>
                  <div className="text-2xl font-black italic uppercase leading-tight">{match.opponent_name}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-white/40 font-black text-xs uppercase tracking-widest">
                  <Calendar className="w-4 h-4" /> TERMIN: {match.date}
                </div>
                {match.home_score !== null && (
                  <div className="text-2xl font-black italic text-blue-500">{match.home_score}:{match.away_score}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
