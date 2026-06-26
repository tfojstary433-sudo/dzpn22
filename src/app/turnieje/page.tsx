'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { teams, friendlyMatchesData, extraTeams, cupMatchesData } from '@/lib/data';
import { MainNavbar } from '@/components/main-navbar';
import { Footer } from '@/components/footer';

function TurniejeContent() {
  const [activeTournament, setActiveTournament] = useState<'towarzyskie' | 'puchar'>('towarzyskie');
  const [isLocked, setIsLocked] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawResult, setDrawResult] = useState<any[]>([]);

  const lockDate = new Date('2026-06-30T17:00:00');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (now >= lockDate) {
        setIsLocked(false);
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const startDraw = () => {
    setIsDrawing(true);
    // Simulate drawing animation
    setTimeout(() => {
      const shuffled = [...teams].filter(t => t.id !== 'SED').sort(() => 0.5 - Math.random());
      const pairs = [];
      for (let i = 0; i < shuffled.length; i += 2) {
        if (shuffled[i + 1]) {
          pairs.push({
            home: shuffled[i],
            away: shuffled[i + 1]
          });
        }
      }
      setDrawResult(pairs);
      setIsDrawing(false);
    }, 5000);
  };
  
  const [challongeData, setChallongeData] = useState<any>(null);
  const [tableData, setTableData] = useState<any>(null);
  const [scorersData, setScorersData] = useState<any>(null);
  const [knockoutData, setKnockoutData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
        setLoading(true);
        try {
          const endpoints = [
            'https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/public/cup/matches.json',
            'https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/brackets/1?type=county_cup',
            'https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/tables?season_id=1',
            'https://673a6e75-fccb-4a62-b06b-9bd2ff7d356c-00-pyt4y8q7wly0.kirk.replit.dev/api/public/cup/stats/players.json'
          ];

          // Use a faster proxy or direct fetch if possible, fallback to allorigins
          const fetchWithProxy = async (url: string) => {
            try {
              const res = await fetch(url, { cache: 'no-store' });
              if (res.ok) return await res.json();
            } catch (e) {
              const proxyRes = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}&ts=${Date.now()}`);
              if (proxyRes.ok) {
                const wrapper = await proxyRes.json();
                return JSON.parse(wrapper.contents);
              }
            }
            return null;
          };

          const [main, knockout, table, scorers] = await Promise.all(endpoints.map(fetchWithProxy));

          if (main) setChallongeData(main);
          if (knockout) setKnockoutData(knockout);
          if (table) setTableData(table);
          if (scorers) setScorersData(scorers);
        } catch (err) {
          console.error('Fetch error details:', err);
        } finally {
          setLoading(false);
        }
    };

    fetchTeams();
  }, [activeTournament]);

  const [friendlyTab, setFriendlyTab] = useState<'schedule' | 'table' | 'scorers' | 'knockout'>('schedule');
  const pucharPolskiLogo = "https://i.ibb.co/N6MvSMh1/PUCHAR-POLSKI.png";
  
  const friendlyMatches = friendlyMatchesData;
  const cupMatches = cupMatchesData;

  // Process API matches for the schedule tab
  const getFriendlyMatchesFromChallonge = () => {
    if (!challongeData) {
      return [];
    }

    // New API format (fixtures)
    if (challongeData.fixtures && Array.isArray(challongeData.fixtures)) {
      const mappedMatches = challongeData.fixtures.map((m: any) => {
        const mapTeam = (name: string) => {
          return teams.find(t => t.name.toLowerCase() === name.toLowerCase()) || {
            id: name,
            name: name,
            logo: 'https://i.ibb.co/TB027G07/czarnepff-1.png'
          };
        };

        const [datePart, timePart] = m.date.split(' ');

        return {
          id: m.uuid || m.matchUuid || m.id.toString(),
          homeTeam: mapTeam(m.teamA),
          awayTeam: mapTeam(m.teamB),
          homeScore: m.scoreA,
          awayScore: m.scoreB,
          date: datePart,
          time: timePart,
          timestamp: 0,
          round: m.stage || m.group || 'MECZE TOWARZYSKIE',
          status: m.status === 'played' || m.status === 'finished' ? 'finished' : (m.status === 'in_progress' ? 'finished' : 'upcoming'),
          stadium: 'OŚRODEK TRENINGOWY PFF',
          category: m.stage ? 'FAZA PUCHAROWA' : 'MECZ TOWARZYSKI'
        };
      });

      // Group by group name (round)
      const groupedByRound: { [key: string]: any[] } = {};
      mappedMatches.forEach((m: any) => {
        const roundName = m.round;
        if (!groupedByRound[roundName]) {
          groupedByRound[roundName] = [];
        }
        groupedByRound[roundName].push(m);
      });

      // Custom order for rounds
      const roundOrder = ['GRUPA A', 'GRUPA B', 'PÓŁFINAŁ', 'MECZ O 3. MIEJSCE', 'FINAŁ'];
      
      return Object.entries(groupedByRound)
        .sort(([a], [b]) => {
          const indexA = roundOrder.indexOf(a);
          const indexB = roundOrder.indexOf(b);
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return a.localeCompare(b);
        })
        .map(([round, matches]) => ({
          round,
          matches
        }));
    }

    if (!challongeData.matches || !Array.isArray(challongeData.matches)) {
      return [];
    }

    // Fallback for old Challonge format
    const mappedMatches = challongeData.matches.map((m: any) => {
      const homeParticipant = challongeData.participants.find((p: any) => p.id === m.player1_id);
      const awayParticipant = challongeData.participants.find((p: any) => p.id === m.player2_id);

      const cleanName = (name: string) => name ? name.split('[')[0].trim().toLowerCase() : '';

      const homeTeam = teams.find(t => t.name.toLowerCase() === cleanName(homeParticipant?.name)) || {
        id: homeParticipant?.id.toString(),
        name: homeParticipant?.name || 'TBD',
        logo: 'https://i.ibb.co/TB027G07/czarnepff-1.png'
      };

      const awayTeam = teams.find(t => t.name.toLowerCase() === cleanName(awayParticipant?.name)) || {
        id: awayParticipant?.id.toString(),
        name: awayParticipant?.name || 'TBD',
        logo: 'https://i.ibb.co/TB027G07/czarnepff-1.png'
      };

      const matchDate = m.underway_at || m.scheduled_start_time || m.created_at;

      return {
        id: m.id.toString(),
        homeTeam,
        awayTeam,
        homeScore: m.scores_csv ? Number(m.scores_csv.split('-')[0]) : undefined,
        awayScore: m.scores_csv ? Number(m.scores_csv.split('-')[1]) : undefined,
        date: matchDate ? new Date(matchDate).toLocaleDateString('pl-PL') : 'TBD',
        time: matchDate ? new Date(matchDate).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }) : 'TBD',
        timestamp: matchDate ? new Date(matchDate).getTime() : 0,
        round: m.round,
        status: m.state === 'complete' ? 'finished' : 'upcoming',
        stadium: 'OŚRODEK TRENINGOWY PFF',
        category: 'MECZ TOWARZYSKI'
      };
    });

    // Sort matches by date
    mappedMatches.sort((a: any, b: any) => a.timestamp - b.timestamp);

    // Group by rounds
    const groupedByRound: { [key: string]: any[] } = {};
    mappedMatches.forEach((m: any) => {
      const roundName = `RUNDA ${m.round || 1}`;
      if (!groupedByRound[roundName]) {
        groupedByRound[roundName] = [];
      }
      groupedByRound[roundName].push(m);
    });

    return Object.entries(groupedByRound).map(([round, matches]) => ({
      round,
      matches
    }));
  };

  const activeFriendlyMatches = getFriendlyMatchesFromChallonge();

  const getFriendlyScorers = () => {
    if (scorersData && scorersData.scorers && Array.isArray(scorersData.scorers)) {
      return scorersData.scorers.map((p: any) => {
        const teamName = p.team;
        const localTeam = teams.find(team => team.name.toLowerCase() === teamName.toLowerCase()) || {
          id: teamName,
          name: teamName,
          logo: 'https://i.ibb.co/TB027G07/czarnepff-1.png'
        };
        return {
          ...p,
          team: localTeam
        };
      });
    }

    if (!challongeData || !challongeData.groups) return [];
    
    const allPlayers: any[] = [];
    challongeData.groups.forEach((g: any) => {
      const teamsData = g.teams || g.table || [];
      teamsData.forEach((t: any) => {
        if (t.players && Array.isArray(t.players)) {
          const teamName = t.name || t.team;
          const localTeam = teams.find(team => team.name.toLowerCase() === teamName.toLowerCase()) || {
            id: teamName,
            name: teamName,
            logo: 'https://i.ibb.co/TB027G07/czarnepff-1.png'
          };

          t.players.forEach((p: any) => {
            allPlayers.push({
              ...p,
              team: localTeam
            });
          });
        }
      });
    });

    return allPlayers.sort((a, b) => (b.goals || 0) - (a.goals || 0));
  };

  const getFriendlyKnockout = () => {
    const mapTeam = (name: string) => {
      return teams.find(t => t.name.toLowerCase() === name.toLowerCase()) || {
        id: name,
        name: name,
        logo: 'https://i.ibb.co/TB027G07/czarnepff-1.png'
      };
    };

    const mapMatch = (m: any) => ({
      id: m.uuid || m.matchUuid || m.id.toString(),
      homeTeam: mapTeam(m.teamA),
      awayTeam: mapTeam(m.teamB),
      homeScore: m.scoreA,
      awayScore: m.scoreB,
      date: m.date ? m.date.split(' ')[0] : 'TBD',
      time: m.date ? m.date.split(' ')[1] : 'TBD',
      status: m.status === 'played' || m.status === 'finished' || m.status === 'complete' ? 'finished' : (m.status === 'in_progress' ? 'finished' : 'upcoming'),
      stadium: 'OŚRODEK TRENINGOWY PFF',
      category: 'FAZA PUCHAROWA',
      round: m.round,
      stage: m.stage || (m.round === 'PF1' || m.round === 'PF2' ? 'PÓŁFINAŁ' : (m.round === '3RD' ? 'MECZ O 3. MIEJSCE' : (m.round === 'FINAL' ? 'FINAŁ' : '')))
    });

    const rounds = [];
    let knockoutMatches: any[] = [];

    // Prioritize knockoutData if it has matches
    if (knockoutData) {
      if (knockoutData.semifinals && Array.isArray(knockoutData.semifinals)) {
        knockoutMatches = [...knockoutMatches, ...knockoutData.semifinals];
      }
      if (knockoutData.thirdPlace && knockoutData.thirdPlace.id) {
        knockoutMatches.push(knockoutData.thirdPlace);
      }
      if (knockoutData.final && knockoutData.final.id) {
        knockoutMatches.push(knockoutData.final);
      }
    }

    // Fallback to friendlyMatchesData for historical matches
    if (knockoutMatches.length === 0 && friendlyMatchesData.length > 0) {
      return friendlyMatchesData;
    }

    // Fallback to fixtures if still empty
    if (knockoutMatches.length === 0 && challongeData?.fixtures) {
      knockoutMatches = challongeData.fixtures.filter((f: any) => f.stage || ['PF1', 'PF2', '3RD', 'FINAL'].includes(f.round));
    }

    if (knockoutMatches.length > 0) {
      const mapped = knockoutMatches.map(mapMatch);
      
      const semiMatches = mapped.filter(m => m.stage === 'PÓŁFINAŁ' || m.round === 'PF1' || m.round === 'PF2');
      if (semiMatches.length > 0) {
        rounds.push({ name: 'PÓŁFINAŁY', matches: semiMatches });
      }

      const thirdPlaceMatch = mapped.find(m => m.stage === 'MECZ O 3. MIEJSCE' || m.round === '3RD');
      if (thirdPlaceMatch) {
        rounds.push({ name: 'MECZ O 3. MIEJSCE', matches: [thirdPlaceMatch] });
      }

      const finalMatch = mapped.find(m => m.stage === 'FINAŁ' || m.round === 'FINAL');
      if (finalMatch) {
        rounds.push({ name: 'FINAŁ', matches: [finalMatch] });
      }
    }

    return rounds;
  };

  const knockoutRounds = getFriendlyKnockout();
  const topScorers = getFriendlyScorers();

  // Process API data into standings
  const getFriendlyStandings = () => {
    if (tableData) {
      const all: any[] = [];
      
      const mapTeam = (name: string) => {
        return teams.find(t => t.name.toLowerCase() === name.toLowerCase()) || {
          id: name,
          name: name,
          logo: 'https://i.ibb.co/TB027G07/czarnepff-1.png'
        };
      };

      if (tableData.grupaa) {
        tableData.grupaa.forEach((t: any) => {
          all.push({
            team: mapTeam(t.team),
            groupId: 'A',
            groupName: 'GRUPA A',
            played: t.played,
            won: t.won,
            drawn: t.drawn,
            lost: t.lost,
            gf: t.goalsFor,
            ga: t.goalsAgainst,
            pts: t.points,
            rank: t.position
          });
        });
      }

      if (tableData.grupab) {
        tableData.grupab.forEach((t: any) => {
          all.push({
            team: mapTeam(t.team),
            groupId: 'B',
            groupName: 'GRUPA B',
            played: t.played,
            won: t.won,
            drawn: t.drawn,
            lost: t.lost,
            gf: t.goalsFor,
            ga: t.goalsAgainst,
            pts: t.points,
            rank: t.position
          });
        });
      }

      if (all.length > 0) return all;
    }

    if (!challongeData) return [];

    const allTeams: any[] = [];

    // Format z grupami (nowy API)
    if (challongeData.groups && Array.isArray(challongeData.groups)) {
      challongeData.groups.forEach((g: any) => {
        const teamsData = g.teams || g.table || [];
        teamsData.forEach((t: any) => {
          const teamName = t.name || t.team;
          const localTeam = teams.find(team => team.name.toLowerCase() === teamName.toLowerCase()) || {
            id: teamName,
            name: teamName,
            logo: 'https://i.ibb.co/TB027G07/czarnepff-1.png'
          };

          const gid = g.name.toUpperCase().includes('GRUPA A') || g.name.toUpperCase().includes('GROUP A') ? 'A' : 
                    (g.name.toUpperCase().includes('GRUPA B') || g.name.toUpperCase().includes('GROUP B') ? 'B' : 
                    (t.group || g.name));

          allTeams.push({
            team: localTeam,
            groupId: gid,
            groupName: g.name,
            played: t.played || 0,
            won: t.won || 0,
            drawn: t.drawn || 0,
            lost: t.lost || 0,
            gf: t.goalsFor || 0,
            ga: t.goalsAgainst || 0,
            pts: t.points !== undefined ? t.points : (t.pts !== undefined ? t.pts : 0),
            rank: t.position || 0
          });
        });
      });
      return allTeams;
    }

    // Format z płaską listą drużyn (np. turniej.json)
    if (challongeData.teams && Array.isArray(challongeData.teams)) {
      return challongeData.teams.map((t: any) => {
        const localTeam = teams.find(team => team.name.toLowerCase() === t.name.toLowerCase()) || {
          id: t.name,
          name: t.name,
          logo: t.logoUrl || 'https://i.ibb.co/TB027G07/czarnepff-1.png'
        };

        const gid = t.group === '1' || t.group === 1 || t.group === 'A' ? 'A' : (t.group === '2' || t.group === 2 || t.group === 'B' ? 'B' : t.group);

        return {
          team: localTeam,
          groupId: gid,
          groupName: gid ? `GRUPA ${gid}` : 'Inne',
          played: t.played || 0,
          won: t.won || 0,
          drawn: t.drawn || 0,
          lost: t.lost || 0,
          gf: t.goalsFor || 0,
          ga: t.goalsAgainst || 0,
          pts: t.points !== undefined ? t.points : (t.pts !== undefined ? t.pts : 0)
        };
      });
    }

    // If data is from the new API (array of teams)
    if (Array.isArray(challongeData)) {
      return challongeData.map((t: any) => {
        const localTeam = teams.find(team => team.name.toLowerCase() === t.name.toLowerCase()) || {
          id: t.id?.toString() || t.name,
          name: t.name,
          logo: t.logoUrl || 'https://i.ibb.co/TB027G07/czarnepff-1.png'
        };

        return {
          team: localTeam,
          groupId: t.group,
          groupName: t.group ? `GRUPA ${t.group}` : 'Inne',
          played: t.played || 0,
          won: t.won || 0,
          drawn: t.drawn || 0,
          lost: t.lost || 0,
          gf: t.goalsFor || 0,
          ga: t.goalsAgainst || 0,
          pts: t.points || 0
        };
      });
    }

    if (!challongeData.participants) return [];

    const standingsMap = new Map();

    // Initialize standings for all participants
    challongeData.participants.forEach((p: any) => {
      const cleanName = (name: string) => name ? name.split('[')[0].trim().toLowerCase() : '';
      
      const localTeam = teams.find(t => t.name.toLowerCase() === cleanName(p.name)) || {
        id: p.id.toString(),
        name: p.name,
        logo: 'https://i.ibb.co/TB027G07/czarnepff-1.png'
      };

      const gid = p.group_id === 'A' || p.group_id === 1 || p.group_id === '1' ? 'A' : (p.group_id === 'B' || p.group_id === 2 || p.group_id === '2' ? 'B' : p.group_id);

      standingsMap.set(p.id, {
        team: localTeam,
        groupId: gid,
        groupName: p.group_name || (gid ? `GRUPA ${gid}` : 'Inne'),
        rank: p.rank || 0,
        played: (p.matches_won || 0) + (p.matches_lost || 0) + (p.matches_tied || 0),
        won: p.matches_won || 0,
        drawn: p.matches_tied || 0,
        lost: p.matches_lost || 0,
        gf: 0, // Goals are harder to get from V1 directly without parsing matches
        ga: 0,
        pts: p.points || 0
      });
    });

    // We still process matches to get goals if they are not in the participants object
    if (challongeData.matches) {
      challongeData.matches.forEach((m: any) => {
        if (m.state === 'complete' && m.scores_csv) {
          try {
            const scores = m.scores_csv.split('-').map(Number);
            const p1Id = m.player1_id;
            const p2Id = m.player2_id;
            const s1 = scores[0];
            const s2 = scores[1];

            const t1 = standingsMap.get(p1Id);
            const t2 = standingsMap.get(p2Id);

            if (t1 && t2) {
              t1.gf += s1;
              t1.ga += s2;
              t2.gf += s2;
              t2.ga += s1;
              
              // If played is 0 (meaning API didn't provide stats), calculate them
              if (t1.pts === 0 && t1.won === 0 && t1.drawn === 0 && t1.lost === 0) {
                t1.played++;
                t2.played++;
                if (s1 > s2) { t1.won++; t1.pts += 3; t2.lost++; }
                else if (s1 < s2) { t2.won++; t2.pts += 3; t1.lost++; }
                else { t1.drawn++; t2.drawn++; t1.pts += 1; t2.pts += 1; }
              }
            }
          } catch (err) {
            console.error('Error parsing match scores:', m.scores_csv, err);
          }
        }
      });
    }

    return Array.from(standingsMap.values());
  };

  const allStandings = getFriendlyStandings();
  
  // Group by actual groupId from Challonge
  const standingsByGroup: { [key: string]: any[] } = {};
  allStandings.forEach((s: any) => {
    const gid = s.groupId || 'unassigned';
    if (!standingsByGroup[gid]) standingsByGroup[gid] = [];
    standingsByGroup[gid].push(s);
  });

  // Filter and split teams by group
  let groupA = allStandings.filter((s: any) => s.groupId === 'A');
  let groupB = allStandings.filter((s: any) => s.groupId === 'B');

  // If filtering resulted in empty groups (e.g. old data format), fallback to slicing
  if (groupA.length === 0 && groupB.length === 0 && allStandings.length > 0) {
    groupA = allStandings.slice(0, 8);
    groupB = allStandings.slice(8, 16);
  }

  // Sort groups primarily by rank from Challonge if available, else by points
  const sortStandings = (a: any, b: any) => {
    if (a.rank && b.rank && a.rank !== b.rank) return a.rank - b.rank;
    if (b.pts !== a.pts) return b.pts - a.pts;
    const gdA = a.gf - a.ga;
    const gdB = b.gf - b.ga;
    if (gdB !== gdA) return gdB - gdA;
    return b.gf - a.gf;
  };

  groupA.sort(sortStandings);
  groupB.sort(sortStandings);

  const friendlyStandings = allStandings; // Fallback for old code

  return (
    <div className="bg-[#050000] text-white min-h-screen">
      <Navbar />
      
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
      
      {/* Tournament Selector Panel removed */}
      
      <div className="relative overflow-hidden min-h-screen">
        {/* Textured Dynamic Background */}
        <div className="fixed inset-0 z-0 pointer-events-none transition-colors duration-1000">
          <div className="absolute inset-0 bg-gradient-to-br transition-colors duration-1000 from-[#000a1a] via-[#000000] to-[#001a2a]" />
          <div 
            className="absolute inset-0 opacity-20 transition-all duration-1000" 
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, #00ccff 0, #00ccff 2px, transparent 0, transparent 40px)`,
            }}
          />
          <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 blur-[150px] rounded-full transition-all duration-1000 bg-[#00ccff]/10" />
          <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 blur-[150px] rounded-full transition-all duration-1000 bg-[#00ccff]/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
        </div>

        <div className="relative z-10">
            <div className="container mx-auto px-4 pt-32 pb-8">
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => setActiveTournament('towarzyskie')}
                  className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${
                    activeTournament === 'towarzyskie' 
                      ? 'bg-[#00ccff] text-black shadow-[0_0_20px_rgba(0,204,255,0.4)]' 
                      : 'bg-white/5 text-white/40 hover:bg-white/10'
                  }`}
                >
                  Mecze Towarzyskie
                </button>
                <button 
                  onClick={() => setActiveTournament('puchar')}
                  className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${
                    activeTournament === 'puchar' 
                      ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' 
                      : 'bg-white/5 text-white/40 hover:bg-white/10'
                  }`}
                >
                  Puchar Powiatu
                </button>
              </div>
            </div>

            {activeTournament === 'towarzyskie' ? (
              <div key="friendly-section" className="pb-20">
              {/* Friendly Hero */}
              <div className="relative h-[50vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-[#00ccff]/10 to-transparent z-0" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#00ccff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                </div>
                
                <div className="relative z-10 container mx-auto px-4">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
                    {/* Left Side Text */}
                    <div className="hidden md:flex flex-col items-end text-right">
                      <span className="text-[#00ccff] text-4xl lg:text-5xl font-black italic uppercase tracking-tighter leading-none mb-2 drop-shadow-[0_0_20px_rgba(0,204,255,0.5)]">PRZYGOTOWANIA</span>
                      <span className="text-white/50 text-xs lg:text-sm font-black uppercase tracking-[0.5em]">DO SEZONU 2026</span>
                    </div>

                    {/* Central Logo */}
                    <div className="flex flex-col items-center gap-6">
                      <div className="relative group shrink-0">
                        <div className="absolute inset-0 bg-[#00ccff]/20 blur-[50px] rounded-full scale-110 opacity-40 group-hover:opacity-80 transition-opacity duration-700" />
                        <Image 
                          src="https://i.ibb.co/9960T9N2/obraz-2026-01-13-020503777.png" 
                          alt="Mecze Towarzyskie" 
                          width={600} 
                          height={200} 
                          className="relative w-full max-w-[240px] md:max-w-[380px] lg:max-w-[450px] h-auto drop-shadow-[0_0_20px_rgba(0,204,255,0.3)] transition-transform duration-500 hover:scale-105"
                          priority
                        />
                      </div>
                      
                      {/* Previous Season Winner Info */}
                      <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md animate-float">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#00ccff]/20 to-transparent rounded-xl flex items-center justify-center border border-[#00ccff]/20">
                          <Image 
                            src="https://i.ibb.co/N6MvSMh1/PUCHAR-POLSKI.png" 
                            alt="Puchar" 
                            width={24} 
                            height={24} 
                            className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(0,204,255,0.5)]"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] leading-tight">Zwycięzca Sezonu 25/26</span>
                          <span className="text-white font-black uppercase tracking-tight text-sm">
                            <span className="text-[#00ccff]">Zawisza Bydgoszcz</span> 
                            <span className="mx-2 text-white/20">vs</span> 
                            <span className="text-white/60">Arka Gdynia</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side Text */}
                    <div className="hidden md:flex flex-col items-start text-left">
                      <span className="text-[#00ccff] text-4xl lg:text-5xl font-black italic uppercase tracking-tighter leading-none mb-2 drop-shadow-[0_0_20px_rgba(0,204,255,0.5)]">NOWE TALENTY</span>
                      <span className="text-white/50 text-xs lg:text-sm font-black uppercase tracking-[0.5em]">SPRAWDZIANY FORMY</span>
                    </div>
                  </div>

                  {/* Mobile Only Subtitle */}
                  <div className="md:hidden mt-8 text-center bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                    <p className="text-[#00ccff] font-black uppercase tracking-widest text-sm mb-1">Przygotowania do sezonu</p>
                    <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-xs">Nowe talenty • Sprawdziany formy</p>
                  </div>
                </div>
              </div>

              <div className="container mx-auto px-4 -mt-10 relative z-20 mb-12">
                {/* Tournament Summary Section */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                  <div className="lg:col-span-3 bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ccff]/5 blur-[100px] -mr-32 -mt-32 transition-all group-hover:bg-[#00ccff]/10" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-[#00ccff]/10 rounded-2xl border border-[#00ccff]/20">
                          <svg className="w-6 h-6 text-[#00ccff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Podsumowanie Sezonu 25/26</h3>
                          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Kluczowe statystyki turnieju</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-[#00ccff] text-3xl font-black italic tracking-tighter">134</span>
                          <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Gole Ogółem</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-white text-3xl font-black italic tracking-tighter">18</span>
                          <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Mecze Rozegrane</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[#00ccff] text-3xl font-black italic tracking-tighter">7.44</span>
                          <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Średnia Goli</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-white text-3xl font-black italic tracking-tighter">142</span>
                          <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Zawodników</span>
                        </div>
                      </div>

                      <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-[#00ccff] text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-[#00ccff] rounded-full animate-pulse" />
                            Najlepsi Strzelcy
                          </h4>
                          <div className="space-y-3">
                            {[
                              { name: 'kozak_21', team: 'Arka Gdynia', goals: 8 },
                              { name: 'cytruseqzjarany', team: 'Zawisza Bydgoszcz', goals: 6 },
                              { name: 'XAYONXD', team: 'Arka Gdynia', goals: 6 },
                            ].map((s, idx) => (
                              <div key={idx} className="flex items-center justify-between group/item">
                                <div className="flex items-center gap-3">
                                  <span className="text-white/20 font-black italic text-sm italic">#{idx+1}</span>
                                  <div className="flex flex-col">
                                    <span className="text-white font-black uppercase tracking-tight text-xs group-hover/item:text-[#00ccff] transition-colors">{s.name}</span>
                                    <span className="text-white/30 text-[9px] font-bold uppercase tracking-widest">{s.team}</span>
                                  </div>
                                </div>
                                <span className="text-white font-black italic">{s.goals} <small className="text-[10px] text-white/30 uppercase not-italic">GOLI</small></span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-[#00ccff] text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-[#00ccff] rounded-full animate-pulse" />
                            Najlepszy Bramkarz
                          </h4>
                          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 group/gk hover:border-[#00ccff]/30 transition-all">
                            <div className="w-12 h-12 bg-[#00ccff]/10 rounded-xl flex items-center justify-center border border-[#00ccff]/20">
                              <svg className="w-6 h-6 text-[#00ccff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-white font-black uppercase tracking-tight text-sm group-hover/gk:text-[#00ccff] transition-colors">Pan_Jacus2</span>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">2 Czyste konta</span>
                                <div className="w-1 h-1 bg-white/10 rounded-full" />
                                <span className="text-[#00ccff] text-[10px] font-black uppercase tracking-widest">MVP OBRONY</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-[#00ccff] to-[#0088aa] p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 opacity-20 transform rotate-12 group-hover:scale-110 transition-transform">
                       <Image 
                         src="https://i.ibb.co/N6MvSMh1/PUCHAR-POLSKI.png" 
                         alt="" 
                         width={128} 
                         height={128} 
                         className="w-full h-full object-contain"
                       />
                    </div>

                    <div className="relative z-10">
                      <span className="bg-black/20 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full backdrop-blur-md">Mistrz Turnieju</span>
                      <div className="mt-4">
                        <h4 className="text-black text-2xl font-black uppercase tracking-tighter leading-none">Zawisza<br/>Bydgoszcz</h4>
                        <p className="text-black/60 text-[10px] font-black uppercase tracking-widest mt-2">Pokonali Arkę Gdynia 3:0 w finale</p>
                      </div>
                    </div>

                    <div className="relative z-10 mt-8 pt-6 border-t border-black/10">
                      <div className="flex items-center justify-between text-black font-black uppercase tracking-widest text-[10px]">
                        <span>Porażki</span>
                        <span>0</span>
                      </div>
                      <div className="flex items-center justify-between text-black font-black uppercase tracking-widest text-[10px] mt-2">
                        <span>Zwycięstwa</span>
                        <span>Wszystkie</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex gap-2 max-w-2xl mx-auto">
                  <button 
                    onClick={() => setFriendlyTab('schedule')}
                    className={`flex-1 py-4 px-6 rounded-xl font-black uppercase tracking-tight transition-all ${
                      friendlyTab === 'schedule' 
                        ? 'bg-gradient-to-br from-[#00ccff] to-[#0088aa] text-black shadow-lg shadow-[#00ccff]/20' 
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Mecze
                  </button>
                  <button 
                    onClick={() => setFriendlyTab('knockout')}
                    className={`flex-1 py-4 px-6 rounded-xl font-black uppercase tracking-tight transition-all ${
                      friendlyTab === 'knockout' 
                        ? 'bg-gradient-to-br from-[#00ccff] to-[#0088aa] text-black shadow-lg shadow-[#00ccff]/20' 
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Drabinka
                  </button>
                  <button 
                    onClick={() => setFriendlyTab('table')}
                    className={`flex-1 py-4 px-6 rounded-xl font-black uppercase tracking-tight transition-all ${
                      friendlyTab === 'table' 
                        ? 'bg-gradient-to-br from-[#00ccff] to-[#0088aa] text-black shadow-lg shadow-[#00ccff]/20' 
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Tabela
                  </button>
                  <button 
                    onClick={() => setFriendlyTab('scorers')}
                    className={`flex-1 py-4 px-6 rounded-xl font-black uppercase tracking-tight transition-all ${
                      friendlyTab === 'scorers' 
                        ? 'bg-gradient-to-br from-[#00ccff] to-[#0088aa] text-black shadow-lg shadow-[#00ccff]/20' 
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Strzelcy
                  </button>
                </div>
              </div>

              {/* Tab Content Rendering */}
              {friendlyTab === 'schedule' && (
                <div className="container mx-auto px-4 space-y-16">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                      <div className="w-16 h-16 border-4 border-[#00ccff]/20 border-t-[#00ccff] rounded-full animate-spin" />
                      <p className="text-[#00ccff] font-black uppercase tracking-widest animate-pulse">Pobieranie terminarza...</p>
                    </div>
                  ) : activeFriendlyMatches.length > 0 ? (
                    activeFriendlyMatches.map((round: any, roundIdx: number) => (
                      <section key={roundIdx} className="relative">
                        <div className="flex items-center gap-6 mb-10">
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#00ccff]/30" />
                          <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-[#00ccff] drop-shadow-[0_0_15px_rgba(0,204,255,0.4)]">
                            {round.round}
                          </h2>
                          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#00ccff]/30" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {round.matches.map((match: any) => (
                            <div key={match.id} className="group relative bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/[0.08] hover:border-[#00ccff]/40 transition-all duration-500 overflow-hidden">
                              {/* Background Glow */}
                              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ccff]/5 blur-3xl -mr-16 -mt-16 group-hover:bg-[#00ccff]/10 transition-colors" />
                              
                              <div className="relative z-10 flex flex-col gap-6">
                                {/* Teams */}
                                <div className="flex flex-col gap-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 bg-black/40 rounded-xl p-2 border border-white/5 group-hover:scale-110 transition-transform">
                                        <Image src={match.homeTeam.logo} alt="" width={40} height={40} className="w-full h-full object-contain" />
                                      </div>
                                      <span className="font-black uppercase tracking-tight text-lg group-hover:text-[#00ccff] transition-colors truncate max-w-[150px]">{match.homeTeam.name}</span>
                                    </div>
                                    <span className="text-2xl font-black italic text-white/40">{match.homeScore !== undefined ? match.homeScore : '-'}</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 bg-black/40 rounded-xl p-2 border border-white/5 group-hover:scale-110 transition-transform">
                                        <Image src={match.awayTeam.logo} alt="" width={40} height={40} className="w-full h-full object-contain" />
                                      </div>
                                      <span className="font-black uppercase tracking-tight text-lg group-hover:text-[#00ccff] transition-colors truncate max-w-[150px]">{match.awayTeam.name}</span>
                                    </div>
                                    <span className="text-2xl font-black italic text-white/40">{match.awayScore !== undefined ? match.awayScore : '-'}</span>
                                  </div>
                                </div>

                                {/* Footer Stats */}
                                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest italic">{match.date} @ {match.time}</span>
                                    <span className="text-[10px] font-black text-[#00ccff] uppercase tracking-widest">{match.category}</span>
                                  </div>
                                  <Link href={`/mecz/${match.id}`}>
                                    <button className="px-4 py-2 bg-white/5 hover:bg-[#00ccff] hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                      Szczegóły
                                    </button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    ))
                  ) : (
                    <div className="text-center py-32">
                      <h3 className="text-3xl font-black uppercase text-white/20 italic tracking-tighter">Brak zaplanowanych meczów</h3>
                    </div>
                  )}
                </div>
              )}

              {/* Redundant table section removed */}

              {friendlyTab === 'scorers' && (
                <div className="container mx-auto px-4 max-w-4xl">
                  {topScorers.length > 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
                      <div className="p-10 border-b border-white/10 bg-white/5">
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-[#00ccff]">KRÓL STRZELCÓW</h2>
                      </div>
                      <div className="divide-y divide-white/5">
                        {topScorers.map((p: any, idx: number) => (
                          <div key={idx} className="p-8 flex items-center gap-8 hover:bg-white/[0.03] transition-all group">
                            <div className="w-12 text-center">
                              <span className={`text-3xl font-black italic ${idx === 0 ? 'text-[#D4AF37]' : idx === 1 ? 'text-white/60' : idx === 2 ? 'text-[#CD7F32]' : 'text-white/20'}`}>
                                {idx + 1}
                              </span>
                            </div>
                            <div className="flex-1 flex items-center gap-6">
                              <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/5 p-2 group-hover:scale-110 transition-transform">
                                <Image src={p.team.logo} alt="" width={48} height={48} className="w-full h-full object-contain" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xl font-black uppercase tracking-tight group-hover:text-[#00ccff] transition-colors">{p.name}</span>
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{p.team.name}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-5xl font-black italic text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                {p.goals}
                              </span>
                              <span className="block text-[8px] font-black text-[#00ccff] uppercase tracking-[0.3em] mt-1">BRAMEK</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-32 opacity-20">
                      <h3 className="text-3xl font-black uppercase italic tracking-tighter">Brak danych strzelców</h3>
                    </div>
                  )}
                </div>
              )}

              {friendlyTab === 'knockout' && (
                <div className="container mx-auto px-4 pb-20">
                  {knockoutRounds.length > 0 ? (
                    <div className="flex flex-col gap-20">
                      {knockoutRounds.map((round: any, roundIdx: number) => (
                        <section key={roundIdx}>
                          <div className="flex items-center gap-6 mb-12 justify-center">
                            <div className="h-px w-24 bg-gradient-to-r from-transparent to-[#00ccff]/50" />
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                              {round.name}
                            </h2>
                            <div className="h-px w-24 bg-gradient-to-l from-transparent to-[#00ccff]/50" />
                          </div>
                          
                          <div className={`grid grid-cols-1 ${round.matches.length > 1 ? 'md:grid-cols-2' : ''} gap-12 max-w-5xl mx-auto`}>
                            {round.matches.map((match: any) => (
                              <div key={match.id} className="relative group">
                                <div className="absolute inset-0 bg-[#00ccff]/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative bg-black/40 border border-white/10 rounded-[2rem] p-10 hover:border-[#00ccff]/40 transition-all duration-500 backdrop-blur-xl">
                                  <div className="flex items-center justify-between gap-8 mb-8">
                                    <div className="flex-1 flex flex-col items-center text-center gap-4">
                                      <div className="w-24 h-24 bg-black/60 rounded-3xl p-4 border border-white/5 group-hover:scale-110 transition-transform shadow-2xl">
                                        <Image src={match.homeTeam.logo} alt="" width={80} height={80} className="w-full h-full object-contain" />
                                      </div>
                                      <span className="font-black uppercase tracking-tight text-sm line-clamp-1">{match.homeTeam.name}</span>
                                    </div>

                                    <div className="flex flex-col items-center gap-2">
                                      <div className="flex items-center gap-4">
                                        <span className="text-5xl font-black italic text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                          {match.homeScore !== undefined ? match.homeScore : '-'}
                                        </span>
                                        <span className="text-2xl font-black text-white/20">:</span>
                                        <span className="text-5xl font-black italic text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                          {match.awayScore !== undefined ? match.awayScore : '-'}
                                        </span>
                                      </div>
                                      {match.status === 'finished' && (
                                        <span className="px-3 py-1 bg-[#00ccff]/10 border border-[#00ccff]/20 rounded-lg text-[8px] font-black text-[#00ccff] uppercase tracking-widest">
                                          ZAKOŃCZONO
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex-1 flex flex-col items-center text-center gap-4">
                                      <div className="w-24 h-24 bg-black/60 rounded-3xl p-4 border border-white/5 group-hover:scale-110 transition-transform shadow-2xl">
                                        <Image src={match.awayTeam.logo} alt="" width={80} height={80} className="w-full h-full object-contain" />
                                      </div>
                                      <span className="font-black uppercase tracking-tight text-sm line-clamp-1">{match.awayTeam.name}</span>
                                    </div>
                                  </div>

                                  <div className="text-center pt-6 border-t border-white/5">
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] italic">
                                      {match.date} @ {match.time} • {match.stadium}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-32 opacity-20">
                      <h3 className="text-3xl font-black uppercase italic tracking-tighter">Brak danych fazy pucharowej</h3>
                    </div>
                  )}
                </div>
              )}

              {friendlyTab === 'table' && (
                <div className="container mx-auto px-4 max-w-7xl space-y-12">
                  {loading ? (
                    <div className="flex flex-col items-center py-20">
                      <div className="w-12 h-12 border-4 border-[#00ccff] border-t-transparent rounded-full animate-spin mb-4" />
                      <span className="text-[#00ccff] font-black uppercase tracking-widest">Pobieranie danych...</span>
                    </div>
                  ) : !challongeData ? (
                    <div className="flex flex-col items-center py-20 bg-white/5 rounded-3xl border border-white/10">
                      <span className="text-red-500 font-black uppercase tracking-widest mb-4 text-center px-4">Błąd połączenia z bazą danych</span>
                      <button 
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
                      >
                        Spróbuj ponownie
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-12 pb-20">
                      {/* Grupa A */}
                      {groupA.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between px-2">
                            <h2 className="text-xl font-black uppercase tracking-tight text-white/90">GRUPA A</h2>
                          </div>
                          <div className="bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                  <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/30">#</th>
                                  <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/30">DRUŻYNA</th>
                                  <th className="py-5 px-4 text-[11px] font-black uppercase tracking-widest text-white/30 text-center">M</th>
                                  <th className="py-5 px-4 text-[11px] font-black uppercase tracking-widest text-white/30 text-center">W</th>
                                  <th className="py-5 px-4 text-[11px] font-black uppercase tracking-widest text-white/30 text-center">R</th>
                                  <th className="py-5 px-4 text-[11px] font-black uppercase tracking-widest text-white/30 text-center">P</th>
                                  <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/30 text-right">PKT</th>
                                </tr>
                              </thead>
                              <tbody>
                                {groupA.map((row: any, i: number) => (
                                  <tr key={i} className={`border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group ${i < 2 ? "bg-[#00ccff]/5" : ""}`}>
                                    <td className="py-4 px-6">
                                      <span className={`text-sm font-bold ${i < 2 ? "text-[#00ccff]" : "text-white/20"}`}>{i + 1}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                      <div className="flex items-center gap-4">
                                        <Image src={row.team.logo} alt="" width={24} height={24} className="w-6 h-6 object-contain" />
                                        <span className={`text-sm font-black uppercase tracking-tight group-hover:text-white transition-colors ${i < 2 ? "text-[#00ccff]" : "text-white/90"}`}>{row.team.name}</span>
                                      </div>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                      <span className="text-sm font-bold text-white/40">{row.played}</span>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                      <span className="text-sm font-bold text-[#10b981]">{row.won}</span>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                      <span className="text-sm font-bold text-[#facc15]">{row.drawn}</span>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                      <span className="text-sm font-bold text-[#ef4444]">{row.lost}</span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                      <span className={`text-sm font-black ${i < 2 ? "text-[#00ccff]" : "text-white"}`}>{row.pts}</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Grupa B */}
                      {groupB.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between px-2">
                            <h2 className="text-xl font-black uppercase tracking-tight text-white/90">GRUPA B</h2>
                          </div>
                          <div className="bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                  <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/30">#</th>
                                  <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/30">DRUŻYNA</th>
                                  <th className="py-5 px-4 text-[11px] font-black uppercase tracking-widest text-white/30 text-center">M</th>
                                  <th className="py-5 px-4 text-[11px] font-black uppercase tracking-widest text-white/30 text-center">W</th>
                                  <th className="py-5 px-4 text-[11px] font-black uppercase tracking-widest text-white/30 text-center">R</th>
                                  <th className="py-5 px-4 text-[11px] font-black uppercase tracking-widest text-white/30 text-center">P</th>
                                  <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/30 text-right">PKT</th>
                                </tr>
                              </thead>
                              <tbody>
                                {groupB.map((row: any, i: number) => (
                                  <tr key={i} className={`border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group ${i < 2 ? "bg-[#00ccff]/5" : ""}`}>
                                    <td className="py-4 px-6">
                                      <span className={`text-sm font-bold ${i < 2 ? "text-[#00ccff]" : "text-white/20"}`}>{i + 1}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                      <div className="flex items-center gap-4">
                                        <Image src={row.team.logo} alt="" width={24} height={24} className="w-6 h-6 object-contain" />
                                        <span className={`text-sm font-black uppercase tracking-tight group-hover:text-white transition-colors ${i < 2 ? "text-[#00ccff]" : "text-white/90"}`}>{row.team.name}</span>
                                      </div>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                      <span className="text-sm font-bold text-white/40">{row.played}</span>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                      <span className="text-sm font-bold text-[#10b981]">{row.won}</span>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                      <span className="text-sm font-bold text-[#facc15]">{row.drawn}</span>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                      <span className="text-sm font-bold text-[#ef4444]">{row.lost}</span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                      <span className={`text-sm font-black ${i < 2 ? "text-[#00ccff]" : "text-white"}`}>{row.pts}</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            ) : (
              <div key="puchar-section" className="container mx-auto px-4 py-20">
                <div className="relative h-[40vh] flex flex-col items-center justify-center overflow-hidden mb-12 rounded-[4rem] border border-white/10 bg-gradient-to-br from-red-600/20 to-black/60 shadow-2xl">
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.1)_0%,transparent_70%)]" />
                   <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-white mb-4 drop-shadow-[0_0_30px_rgba(220,38,38,0.5)]">
                     PUCHAR POWIATU
                   </h1>
                   <p className="text-white/40 font-black uppercase tracking-[0.5em] text-xs">Sezon 2026 • Turniej Główny</p>
                </div>

                {isLocked ? (
                  <div className="flex flex-col items-center justify-center py-32 bg-white/[0.02] border border-white/5 rounded-[4rem] backdrop-blur-xl">
                    <div className="w-24 h-24 bg-red-600/10 rounded-full flex items-center justify-center mb-8 relative">
                       <div className="absolute inset-0 bg-red-600/20 rounded-full blur-2xl animate-pulse" />
                       <svg className="w-10 h-10 text-red-600 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                       </svg>
                    </div>
                    <h3 className="text-white font-black text-2xl md:text-4xl uppercase italic tracking-tighter mb-4">TURNIEJ ZABLOKOWANY</h3>
                    <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-center max-w-md px-8">
                      Oficjalne losowanie par Pucharu Powiatu odbędzie się<br/>
                      <span className="text-red-500 font-black">30 czerwca 2026 o godzinie 17:00</span>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-12">
                    {drawResult.length === 0 && !isDrawing && (
                      <div className="flex justify-center">
                        <button 
                          onClick={startDraw}
                          className="px-12 py-6 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all transform hover:scale-105 shadow-[0_10px_30px_rgba(220,38,38,0.4)]"
                        >
                          ROZPOCZNIJ LOSOWANIE
                        </button>
                      </div>
                    )}

                    {isDrawing && (
                      <div className="flex flex-col items-center justify-center py-32 gap-8">
                        <div className="relative w-32 h-32">
                          <div className="absolute inset-0 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin" />
                          <div className="absolute inset-0 border-4 border-red-600/10 border-b-red-600 rounded-full animate-spin-reverse" />
                        </div>
                        <div className="text-center">
                          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white animate-pulse">TRWA LOSOWANIE...</h2>
                          <p className="text-white/40 font-bold uppercase tracking-[0.3em] mt-2">Maszyna losująca wybiera pary</p>
                        </div>
                      </div>
                    )}

                    {drawResult.length > 0 && !isDrawing && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        {drawResult.map((pair, idx) => (
                          <div key={idx} className="bg-white/[0.03] border border-white/10 p-8 rounded-[3rem] group hover:bg-white/[0.06] hover:border-red-600/30 transition-all flex items-center justify-between">
                             <div className="flex flex-col items-center gap-4 flex-1">
                                <div className="w-16 h-16 bg-black/40 rounded-2xl p-3 border border-white/5 group-hover:scale-110 transition-transform">
                                  <Image src={pair.home.logo} alt="" width={64} height={64} className="w-full h-full object-contain" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-tight text-center">{pair.home.name}</span>
                             </div>

                             <div className="px-8 flex flex-col items-center">
                                <span className="text-red-600 font-black text-2xl italic">VS</span>
                                <span className="text-white/20 text-[8px] font-black uppercase tracking-widest mt-2">1/8 FINAŁU</span>
                             </div>

                             <div className="flex flex-col items-center gap-4 flex-1">
                                <div className="w-16 h-16 bg-black/40 rounded-2xl p-3 border border-white/5 group-hover:scale-110 transition-transform">
                                  <Image src={pair.away.logo} alt="" width={64} height={64} className="w-full h-full object-contain" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-tight text-center">{pair.away.name}</span>
                             </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
      </div>
      <Footer />
    </div>
  );
}

export default function TurniejePage() {
  return (
    <Suspense fallback={
      <div className="bg-[#050000] text-white min-h-screen flex items-center justify-center">
        <div className="text-2xl font-black animate-pulse">ŁADOWANIE...</div>
      </div>
    }>
      <TurniejeContent />
    </Suspense>
  );
}
