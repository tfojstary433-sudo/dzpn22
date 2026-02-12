'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { teams as localTeams } from '@/lib/data';
import { API_ENDPOINTS } from '@/lib/constants';

function getTeamFromName(teamName: string) {
  const teamMapping: Record<string, any> = {
    'Zagłębie Lubin': { id: '4', name: 'Zagłębie Lubin', shortName: 'ZAG', logo: 'https://i.ibb.co/7xBP97MW/dvyf-Zx2g-Ykwr8-Dur.png', color: '#f97316' },
    'Legia Warszawa': { id: '2', name: 'Legia Warszawa', shortName: 'LEG', logo: 'https://ext.same-assets.com/1250577607/695801781.png', color: '#dc2626' },
    'Arka Gdynia': { id: '1', name: 'Arka Gdynia', shortName: 'ARK', logo: 'https://ext.same-assets.com/1250577607/451783410.png', color: '#FFD700' },
    'Lech Poznań': { id: '3', name: 'Lech Poznań', shortName: 'LEC', logo: 'https://ext.same-assets.com/1250577607/3317158738.png', color: '#1e40af' },
    'Lechia Gdańsk': { id: '5', name: 'Lechia Gdańsk', shortName: 'LGD', logo: 'https://i.ibb.co/nqBHgwK2/obraz-2026-01-22-143911384.png', color: '#3b82f6' },
    'Zawisza Bydgoszcz': { id: '12', name: 'Zawisza Bydgoszcz', shortName: 'ZAW', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Herb_Zawiszy_Bydgoszcz.png', color: '#f97316' },
    'Wisła Kraków': { id: '13', name: 'Wisła Kraków', shortName: 'WIS', logo: 'https://upload.wikimedia.org/wikipedia/en/1/15/Wis%C5%82a_Krak%C3%B3w_logo.svg', color: '#dc2626' },
    'Motor Lublin': { id: '9', name: 'Motor Lublin', shortName: 'MOT', logo: 'https://i.ibb.co/bgRJrvnj/Motor-Lublin-S-A-Oficjalny-Herb.png', color: '#facc15' },
    'Pogoń Szczecin': { id: '10', name: 'Pogoń Szczecin', shortName: 'POG', logo: 'https://ext.same-assets.com/1250577607/3079565559.png', color: '#1e3a8a' },
    'Olimpia Elbląg': { id: '8', name: 'Olimpia Elbląg', shortName: 'OLI', logo: 'https://i.ibb.co/RGsNqf6G/olimpia-elblag.png', color: '#00ccff' },
    'Chojniczanka Chojnice': { id: '11', name: 'Chojniczanka Chojnice', shortName: 'CHO', logo: 'https://i.ibb.co/m5RzsvnS/obraz-2026-01-22-143945160.png', color: '#3b82f6' },
    'Grom Nowy Staw': { id: '6', name: 'Grom Nowy Staw', shortName: 'GRO', logo: 'https://i.ibb.co/V0rcs98Q/obraz-2026-01-04-213027745-removebg-preview-4.png', color: '#15803d' },
    'Sokół Olsztyn': { id: '14', name: 'Sokół Olsztyn', shortName: 'SOK', logo: 'https://i.ibb.co/r2KwDw8h/obraz-2026-01-05-231417131.png', color: '#00ccff' },
    'Unia Skierniewice': { id: '7', name: 'Unia Skierniewice', shortName: 'UNI', logo: 'https://i.ibb.co/Vp3YY8FY/unia-logo-300x300.png', color: '#facc15' }
  };

  return teamMapping[teamName] || {
    id: 'UNK',
    name: teamName,
    shortName: teamName.substring(0, 3).toUpperCase(),
    logo: 'https://i.ibb.co/7d4R0vZH/obraz-2026-02-04-222253347-removebg-preview-1.png',
    color: '#3b82f6'
  };
}

export function RecentResults() {
  const [finishedMatches, setFinishedMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.SCHEDULE);
        if (response.ok) {
          const data = await response.json();
          const fixtures = Array.isArray(data) ? data : (data.fixtures || []);
          
          const finished = fixtures
            .filter((f: any) => f.status === 'played' || f.status === 'finished' || f.isFinished || (f.scoreA > 0 || f.scoreB > 0))
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5)
            .map((f: any) => ({
              id: f.id,
              homeTeam: getTeamFromName(f.teamA),
              awayTeam: getTeamFromName(f.teamB),
              homeScore: f.scoreA,
              awayScore: f.scoreB,
              date: f.date,
              round: f.round
            }));
          
          setFinishedMatches(finished);
        }
      } catch (error) {
        console.error('Failed to fetch recent results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading || finishedMatches.length === 0) return null;

  return (
    <section className="py-12 bg-black/40 backdrop-blur-md text-white border-y border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-10">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-[0.2em] text-center text-white">
            Ostatnie Mecze
          </h2>
          <div className="w-20 h-1 bg-[#00ccff] mt-4" />
        </div>

        <div className="flex flex-wrap justify-center gap-6 max-w-7xl mx-auto">
          {finishedMatches.map((match) => (
            <div
              key={match.id}
              className="bg-[#0a0a0a]/80 border border-white/10 rounded-2xl overflow-hidden hover:border-[#00ccff]/50 transition-all duration-300 w-full md:w-[380px] group shadow-2xl"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#1a1a1a] to-black px-4 py-2 flex items-center justify-between border-b border-white/5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00ccff]">
                  KONIEC MECZU • KOLEJKA {match.round}
                </span>
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                  {new Date(match.date).toLocaleDateString('pl-PL')}
                </span>
              </div>

              {/* Match Score */}
              <div className="p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00ccff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-center justify-between relative z-10">
                  {/* Home Team */}
                  <div className="flex flex-col items-center gap-3 flex-1">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center p-3 border border-white/5 group-hover:border-[#00ccff]/30 transition-all">
                      <Image
                        src={match.homeTeam.logo}
                        alt={match.homeTeam.name}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-black uppercase tracking-tight text-white/80 group-hover:text-white transition-colors">
                        {match.homeTeam.shortName}
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex flex-col items-center gap-1 px-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-black tabular-nums">{match.homeScore}</span>
                      <span className="text-2xl font-black text-[#00ccff]">:</span>
                      <span className="text-4xl font-black tabular-nums">{match.awayScore}</span>
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className="flex flex-col items-center gap-3 flex-1">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center p-3 border border-white/5 group-hover:border-[#00ccff]/30 transition-all">
                      <Image
                        src={match.awayTeam.logo}
                        alt={match.awayTeam.name}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-black uppercase tracking-tight text-white/80 group-hover:text-white transition-colors">
                        {match.awayTeam.shortName}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

