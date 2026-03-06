'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { teams, friendlyMatchesData, extraTeams, cupMatchesData } from '@/lib/data';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

function TurniejeContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  
  const [activeTournament, setActiveTournament] = useState<'puchar' | 'towarzyskie'>(
    type === 'towarzyskie' ? 'towarzyskie' : 'puchar'
  );
  
  const [challongeData, setChallongeData] = useState<any>(null);
  const [tableData, setTableData] = useState<any>(null);
  const [scorersData, setScorersData] = useState<any>(null);
  const [knockoutData, setKnockoutData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      if (activeTournament === 'towarzyskie') {
        setLoading(true);
        try {
          const endpoints = [
            'https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/api/tournament/1.json',
            'https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/api/tournament/1/knockout.json',
            'https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/api/tournament/1/table.json',
            'https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/api/tournament/1/scorers.json'
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
  let groupA = allStandings.filter(s => s.groupId === 'A');
  let groupB = allStandings.filter(s => s.groupId === 'B');

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
      
      {/* Tournament Selector Panel */}
      <div className="bg-[#050505] border-b border-white/5 sticky top-[72px] z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-center md:justify-start gap-4 py-3">
            <button 
              onClick={() => setActiveTournament('puchar')}
              className={`px-6 py-2.5 rounded-xl font-bold uppercase tracking-tight transition-all duration-300 text-sm ${
                activeTournament === 'puchar' 
                  ? 'bg-[#B21118] text-white shadow-lg shadow-[#B21118]/20' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              PUCHAR POLSKI
            </button>
            <button 
              onClick={() => setActiveTournament('towarzyskie')}
              className={`px-6 py-2.5 rounded-xl font-bold uppercase tracking-tight transition-all duration-300 text-sm ${
                activeTournament === 'towarzyskie' 
                  ? 'bg-[#00ccff] text-white shadow-lg shadow-[#00ccff]/20' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              MECZE TOWARZYSKIE
            </button>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden min-h-screen">
        {/* Textured Dynamic Background */}
        <div className="fixed inset-0 z-0 pointer-events-none transition-colors duration-1000">
          <div className={`absolute inset-0 bg-gradient-to-br transition-colors duration-1000 ${
            activeTournament === 'puchar' 
              ? 'from-[#1a0000] via-[#050000] to-[#2a0000]' 
              : 'from-[#000a1a] via-[#000000] to-[#001a2a]'
          }`} />
          <div 
            className="absolute inset-0 opacity-20 transition-all duration-1000" 
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, ${activeTournament === 'puchar' ? '#B21118' : '#00ccff'} 0, ${activeTournament === 'puchar' ? '#B21118' : '#00ccff'} 2px, transparent 0, transparent 40px)`,
            }}
          />
          <div className={`absolute top-1/4 -left-1/4 w-1/2 h-1/2 blur-[150px] rounded-full transition-all duration-1000 ${
            activeTournament === 'puchar' ? 'bg-[#B21118]/10' : 'bg-[#00ccff]/10'
          }`} />
          <div className={`absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 blur-[150px] rounded-full transition-all duration-1000 ${
            activeTournament === 'puchar' ? 'bg-[#B21118]/10' : 'bg-[#00ccff]/10'
          }`} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
        </div>

        <div className="relative z-10">
          {activeTournament === 'puchar' ? (
            <div key="puchar-section">
              {/* Hero Section */}
              <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-[#DC143C]/20 to-transparent z-0" />
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#B21118]/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#D4AF37]/5 blur-[120px] rounded-full" />
                
                <div className="relative z-10 container mx-auto px-4">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                      <h1 className="text-8xl md:text-[10rem] font-[1000] italic tracking-tighter text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.3)] leading-[0.85]">
                        PUCHAR<br />POLSKI
                      </h1>
                      <div className="mt-10 flex items-center gap-6">
                        <span className="h-px w-16 bg-[#D4AF37]" />
                        <span className="text-[#D4AF37] font-black tracking-[0.4em] uppercase text-2xl drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]">SEZON 2025/26</span>
                      </div>
                    </div>
                    <div className="flex-1 flex justify-center md:justify-end">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-white/20 blur-[100px] group-hover:bg-white/30 transition-all duration-500 rounded-full" />
                        <Image
                          src={pucharPolskiLogo}
                          alt="Puchar Polski"
                          width={600}
                          height={600}
                          className="relative drop-shadow-[0_0_80px_rgba(255,255,255,0.2)] animate-float w-full max-w-[400px] md:max-w-[600px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Internal Nav */}
              <div className="container mx-auto px-4 -mt-10 relative z-20">
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex gap-2">
                  <button className="flex-1 py-4 px-6 rounded-xl bg-gradient-to-br from-[#B21118] to-[#800c11] text-white font-black uppercase tracking-tight shadow-lg shadow-[#B21118]/20 transition-all">
                    Drabinka & Terminarz
                  </button>
                  <Link href="/#aktualnosci" className="flex-1">
                    <button className="w-full py-4 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-black uppercase tracking-tight transition-all">
                      Aktualności
                    </button>
                  </Link>
                  <Link href="/turnieje/historia" className="flex-1">
                    <button className="w-full py-4 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-black uppercase tracking-tight transition-all">
                      Historia
                    </button>
                  </Link>
                </div>
              </div>

              {/* Bracket Area */}
              <div className="container mx-auto px-4 py-16 overflow-x-auto">
                <div className="min-w-[1000px] flex justify-between gap-8 pb-12">
                  {cupMatches.map((round, roundIdx) => (
                    <div key={roundIdx} className="flex-1 flex flex-col">
                      <div className="flex items-center gap-4 mb-12 px-2">
                        <div className="w-1.5 h-6 bg-[#B21118] rounded-full" />
                        <h2 className="text-xl font-black uppercase tracking-tight italic whitespace-nowrap">{round.round}</h2>
                      </div>
                      <div className="flex flex-col justify-around flex-1 gap-8">
                        {round.matches.map((match) => (
                          <div key={match.id} className="relative group">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.08] transition-all duration-300 relative z-10 w-full group/card">
                              <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {match.homeTeam ? (
                                      <>
                                        <Image src={match.homeTeam.logo} alt="" width={24} height={24} className="w-6 h-6 object-contain" />
                                        <span className="text-sm font-bold uppercase tracking-tight truncate max-w-[120px] group-hover/card:text-[#B21118] transition-colors">{match.homeTeam.name}</span>
                                      </>
                                    ) : (
                                      <span className="text-sm font-black text-white/10 italic">TBD</span>
                                    )}
                                  </div>
                                  <span className="text-sm font-black text-white/40">-</span>
                                </div>
                                <div className="h-px bg-white/5 w-full" />
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {match.awayTeam ? (
                                      <>
                                        <Image src={match.awayTeam.logo} alt="" width={24} height={24} className="w-6 h-6 object-contain" />
                                        <span className="text-sm font-bold uppercase tracking-tight truncate max-w-[120px] group-hover/card:text-[#B21118] transition-colors">{match.awayTeam.name}</span>
                                      </>
                                    ) : (
                                      <span className="text-sm font-black text-white/10 italic">TBD</span>
                                    )}
                                  </div>
                                  <span className="text-sm font-black text-white/40">-</span>
                                </div>
                                
                                {match.homeTeam && match.awayTeam && (match as any).stadium && (
                                  <div className="mt-2 pt-2 border-t border-white/5 flex flex-col gap-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest truncate">{(match as any).stadium}</span>
                                    <span className="text-[7px] font-bold text-[#B21118] uppercase tracking-[0.2em]">{(match as any).category}</span>
                                  </div>
                                )}
                              </div>
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#B21118] text-[10px] font-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                {match.date} @ {match.time}
                              </div>
                            </div>
                            {roundIdx < cupMatches.length - 1 && (
                              <div className="hidden lg:block absolute left-full top-1/2 w-8 h-px bg-white/10 -translate-y-1/2" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-4 mb-12 px-2">
                      <div className="w-1.5 h-6 bg-gradient-to-b from-[#B21118] to-[#D4AF37] rounded-full" />
                      <h2 className="text-xl font-black uppercase tracking-tight italic whitespace-nowrap">FINAŁ</h2>
                    </div>
                    <div className="flex flex-col justify-around flex-1">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-[#D4AF37]/5 blur-2xl rounded-full" />
                        <div className="relative bg-gradient-to-br from-[#D4AF37]/20 to-black/40 border border-[#D4AF37]/30 rounded-2xl p-8 text-center">
                          <Image src={pucharPolskiLogo} alt="Trophy" width={60} height={60} className="mx-auto mb-4 opacity-50 grayscale" />
                          <span className="block text-[#D4AF37] text-xs font-black uppercase tracking-widest mb-1">PGE Narodowy</span>
                          <span className="block text-white font-black italic">MAJ 2026</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Finals Banner */}
                <div className="mt-20 relative rounded-[2rem] overflow-hidden border border-[#D4AF37]/30 bg-gradient-to-br from-[#400609] to-[#0a0a0a] p-12 text-center">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                  <div className="relative z-10">
                    <Image src={pucharPolskiLogo} alt="Final" width={150} height={150} className="mx-auto mb-6 opacity-50 grayscale contrast-125" />
                    <h3 className="text-[#D4AF37] font-bold tracking-[0.3em] uppercase mb-2">Wielki Finał</h3>
                    <h2 className="text-5xl font-black italic uppercase tracking-tight mb-6">PGE NARODOWY</h2>
                    <div className="inline-block px-8 py-3 rounded-full border border-white/20 bg-white/5 font-black uppercase text-xl">
                      2 MAJA 2026
                    </div>
                  </div>
                  <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#B21118]/20 blur-[100px] rounded-full" />
                  <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#D4AF37]/10 blur-[100px] rounded-full" />
                </div>
              </div>
            </div>
          ) : (
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

              <div className="container mx-auto px-4">
                {friendlyTab === 'schedule' ? (
                  <>
                    {/* Featured Next Match */}
                    <div className="mb-20 relative z-20">
                      {activeFriendlyMatches[0]?.matches[0] ? (
                        <Link href={`/mecz/${activeFriendlyMatches[0].matches[0].id}`}>
                          <div className="bg-gradient-to-br from-[#00ccff]/20 to-black border border-[#00ccff]/30 rounded-[2.5rem] p-8 md:p-12 overflow-hidden group hover:border-[#00ccff]/60 transition-all duration-500">
                            <div className="absolute top-0 right-0 p-8">
                              <div className="px-4 py-1 bg-[#00ccff] text-black font-black italic rounded-full text-sm animate-pulse">
                                NAJBLIŻSZY MECZ
                              </div>
                            </div>
                            
                            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                              <div className="flex-1 flex flex-col items-center gap-4">
                                <div className="relative">
                                  <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  <Image src={activeFriendlyMatches[0].matches[0].homeTeam.logo} alt="" width={150} height={150} className="relative w-32 h-32 md:w-40 md:h-40 object-contain" />
                                </div>
                                <span className="text-2xl font-black uppercase tracking-tight">{activeFriendlyMatches[0].matches[0].homeTeam.name}</span>
                              </div>
                              
                              <div className="flex flex-col items-center gap-6">
                                <div className="flex flex-col items-center">
                                  <span className="text-white/40 font-bold uppercase tracking-widest text-sm mb-2">{activeFriendlyMatches[0].matches[0].date}</span>
                                  <div className="text-6xl md:text-7xl font-[1000] italic text-white bg-white/5 px-10 py-4 rounded-3xl border border-white/10">
                                    {activeFriendlyMatches[0].matches[0].status === 'finished' ? (
                                      <div className="flex items-center gap-4">
                                        <span className="text-[#00ccff]">{activeFriendlyMatches[0].matches[0].homeScore}</span>
                                        <span className="text-white/20">-</span>
                                        <span className="text-[#00ccff]">{activeFriendlyMatches[0].matches[0].awayScore}</span>
                                      </div>
                                    ) : (
                                      activeFriendlyMatches[0].matches[0].time
                                    )}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <span className="block text-[#00ccff] font-black uppercase tracking-tighter mb-1">{activeFriendlyMatches[0].matches[0].stadium}</span>
                                  <span className="text-white/20 font-bold uppercase text-xs">{activeFriendlyMatches[0].matches[0].category}</span>
                                </div>
                              </div>

                              <div className="flex-1 flex flex-col items-center gap-4">
                                <div className="relative">
                                  <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  <Image src={activeFriendlyMatches[0].matches[0].awayTeam.logo} alt="" width={150} height={150} className="relative w-32 h-32 md:w-40 md:h-40 object-contain" />
                                </div>
                                <span className="text-2xl font-black uppercase tracking-tight">{activeFriendlyMatches[0].matches[0].awayTeam.name}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-[2.5rem]">
                          <span className="text-white/20 font-black uppercase tracking-[0.3em]">Brak zaplanowanych meczów</span>
                        </div>
                      )}
                    </div>

                    {/* All Upcoming Friendlies */}
                    <div className="space-y-20">
                      {activeFriendlyMatches.map((round, idx) => (
                        <div key={idx}>
                          <div className="flex items-center gap-6 mb-12">
                            <div className="w-2 h-10 bg-[#00ccff] rounded-full shadow-[0_0_20px_rgba(0,204,255,0.5)]" />
                            <h2 className="text-4xl font-black uppercase tracking-tighter italic">{round.round}</h2>
                            <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent" />
                          </div>
                          
                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {round.matches.map((match: any) => (
                              <Link key={match.id} href={`/mecz/${match.id}`} className="group relative block bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 hover:border-[#00ccff]/30 transition-all duration-500 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#00ccff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="relative flex items-center justify-between gap-6">
                                  <div className="flex-1 flex items-center gap-6">
                                    <Image src={match.homeTeam.logo} alt="" width={64} height={64} className="w-16 h-16 object-contain" />
                                    <div className="flex flex-col">
                                      <span className="text-xl font-black uppercase tracking-tight leading-none mb-1">{match.homeTeam.name}</span>
                                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Gospodarz</span>
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-center shrink-0 px-8 border-x border-white/5 min-w-[100px]">
                                    {match.status === 'finished' ? (
                                      <div className="flex items-center gap-3">
                                        <span className="text-3xl font-[1000] italic text-[#00ccff]">{match.homeScore}</span>
                                        <span className="text-white/20 font-black text-xl">-</span>
                                        <span className="text-3xl font-[1000] italic text-[#00ccff]">{match.awayScore}</span>
                                      </div>
                                    ) : (
                                      <>
                                        <span className="text-xs font-black text-[#00ccff] italic mb-1 uppercase">{match.time}</span>
                                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{match.date}</span>
                                      </>
                                    )}
                                  </div>

                                  <div className="flex-1 flex items-center justify-end gap-6 text-right">
                                    <div className="flex flex-col">
                                      <span className="text-xl font-black uppercase tracking-tight leading-none mb-1">{match.awayTeam.name}</span>
                                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Gość</span>
                                    </div>
                                    <Image src={match.awayTeam.logo} alt="" width={64} height={64} className="w-16 h-16 object-contain" />
                                  </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-black text-white/60 uppercase tracking-widest mb-0.5">{match.stadium}</span>
                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{match.category}</span>
                                  </div>
                                  <div className="px-6 py-2 bg-white/5 group-hover:bg-[#00ccff] group-hover:text-black transition-all rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 group-hover:border-transparent">
                                    SZCZEGÓŁY
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : friendlyTab === 'table' ? (
                  <div className="max-w-7xl mx-auto space-y-12">
                      {loading ? (
                        <div className="flex flex-col items-center py-20">
                          <div className="w-12 h-12 border-4 border-[#00ccff] border-t-transparent rounded-full animate-spin mb-4" />
                          <span className="text-[#00ccff] font-black uppercase tracking-widest">Pobieranie danych...</span>
                        </div>
                      ) : !challongeData ? (
                        <div className="flex flex-col items-center py-20 bg-white/5 rounded-3xl border border-white/10">
                          <span className="text-red-500 font-black uppercase tracking-widest mb-4 text-center px-4">Błąd połączenia z bazą danych Replit</span>
                          <button 
                            onClick={() => {
                              setActiveTournament('towarzyskie'); // Trigger reload
                              window.location.reload();
                            }}
                            className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
                          >
                            Spróbuj ponownie
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-12">
                          {/* Grupa A */}
                          {groupA.length > 0 && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between px-2">
                                <h2 className="text-xl font-black uppercase tracking-tight text-white/90">GROUP A</h2>
                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">TOP 2 QUALIFY</span>
                              </div>
                              <div className="bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="border-b border-white/5 bg-white/[0.02]">
                                      <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/30">#</th>
                                      <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/30">TEAM</th>
                                      <th className="py-5 px-4 text-[11px] font-black uppercase tracking-widest text-white/30 text-center">MP</th>
                                      <th className="py-5 px-4 text-[11px] font-black uppercase tracking-widest text-white/30 text-center">W</th>
                                      <th className="py-5 px-4 text-[11px] font-black uppercase tracking-widest text-white/30 text-center">D</th>
                                      <th className="py-5 px-4 text-[11px] font-black uppercase tracking-widest text-white/30 text-center">L</th>
                                      <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/30 text-right">PTS</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {groupA.map((row, i) => (
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

                          {/* Fallback Table */}
                          {groupA.length === 0 && groupB.length === 0 && allStandings.length > 0 && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between px-2">
                                <h2 className="text-xl font-black uppercase tracking-tight text-white/90">TABELA</h2>
                              </div>
                              <div className="bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="border-b border-white/5 bg-white/[0.02]">
                                      <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/30">#</th>
                                      <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/30">TEAM</th>
                                      <th className="py-5 px-4 text-[11px] font-black uppercase tracking-widest text-white/30 text-center">MP</th>
                                      <th className="py-5 px-4 text-[11px] font-black uppercase tracking-widest text-white/30 text-center">W</th>
                                      <th className="py-5 px-4 text-[11px] font-black uppercase tracking-widest text-white/30 text-center">D</th>
                                      <th className="py-5 px-4 text-[11px] font-black uppercase tracking-widest text-white/30 text-center">L</th>
                                      <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/30 text-right">PTS</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {allStandings.map((row, i) => (
                                      <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                                        <td className="py-4 px-6">
                                          <span className="text-sm font-bold text-white/20">{i + 1}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                          <div className="flex items-center gap-4">
                                            <Image src={row.team.logo} alt="" width={24} height={24} className="w-6 h-6 object-contain" />
                                            <span className="text-sm font-black uppercase tracking-tight group-hover:text-white transition-colors text-white/90">{row.team.name}</span>
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
                                          <span className="text-sm font-black text-white">{row.pts}</span>
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
                                <h2 className="text-xl font-black uppercase tracking-tight text-white/90">GROUP B</h2>
                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">TOP 2 QUALIFY</span>
                              </div>
                              <div className="bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="border-b border-white/5 bg-white/[0.02]">
                                      <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/30">#</th>
                                      <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/30">TEAM</th>
                                      <th className="py-5 px-4 text-[11px] font-black uppercase tracking-widest text-white/30 text-center">MP</th>
                                      <th className="py-5 px-4 text-[11px] font-black uppercase tracking-widest text-white/30 text-center">W</th>
                                      <th className="py-5 px-4 text-[11px] font-black uppercase tracking-widest text-white/30 text-center">D</th>
                                      <th className="py-5 px-4 text-[11px] font-black uppercase tracking-widest text-white/30 text-center">L</th>
                                      <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/30 text-right">PTS</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {groupB.map((row, i) => (
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

                          <div className="mt-8 flex items-center gap-8 justify-center">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-[#00ccff] rounded-full shadow-[0_0_8px_rgba(0,204,255,0.6)]" />
                              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Awans do fazy pucharowej</span>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                ) : friendlyTab === 'knockout' ? (
                  <div className="container mx-auto px-4 py-16 overflow-x-auto scrollbar-hide">
                    {knockoutRounds.length > 0 ? (
                      <div className="min-w-[1000px] flex justify-between gap-12 pb-12 relative">
                        {knockoutRounds.map((round, ridx) => (
                          <div key={ridx} className="flex-1 flex flex-col">
                            {/* Round Header */}
                            <div className="flex items-center gap-4 mb-12 px-2">
                              <div className="w-1.5 h-6 bg-[#00ccff] rounded-full shadow-[0_0_10px_rgba(0,204,255,0.5)]" />
                              <h2 className="text-xl font-black uppercase tracking-tight italic text-white/90 whitespace-nowrap">{round.name}</h2>
                            </div>

                            {/* Matches Container */}
                            <div className={`flex flex-col flex-1 gap-8 ${ridx === 1 ? 'justify-center' : 'justify-around'}`}>
                              {round.matches.map((match, midx) => (
                                <div key={midx} className="relative group">
                                  <Link href={`/mecz/${match.id}`}>
                                    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 hover:border-[#00ccff]/50 transition-all duration-300 relative z-10 w-full group/card shadow-2xl">
                                      {/* Match Status/Round Badge */}
                                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#0a0a0a] border border-white/10 rounded-full z-20 transition-colors group-hover/card:border-[#00ccff]/30">
                                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest whitespace-nowrap group-hover/card:text-[#00ccff]">
                                          {match.round || match.stage}
                                        </span>
                                      </div>

                                      <div className="flex flex-col gap-4">
                                        {/* Home Team */}
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            <Image src={match.homeTeam.logo} alt="" width={28} height={28} className="w-7 h-7 object-contain" />
                                            <span className="text-sm font-black uppercase tracking-tight text-white/90 group-hover/card:text-white transition-colors truncate max-w-[140px]">
                                              {match.homeTeam.name}
                                            </span>
                                          </div>
                                          <span className={`text-lg font-black ${match.status === 'finished' ? 'text-[#00ccff]' : 'text-white/10'}`}>
                                            {match.status === 'finished' ? match.homeScore : '-'}
                                          </span>
                                        </div>

                                        <div className="h-px bg-white/5 w-full" />

                                        {/* Away Team */}
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            <Image src={match.awayTeam.logo} alt="" width={28} height={28} className="w-7 h-7 object-contain" />
                                            <span className="text-sm font-black uppercase tracking-tight text-white/90 group-hover/card:text-white transition-colors truncate max-w-[140px]">
                                              {match.awayTeam.name}
                                            </span>
                                          </div>
                                          <span className={`text-lg font-black ${match.status === 'finished' ? 'text-[#00ccff]' : 'text-white/10'}`}>
                                            {match.status === 'finished' ? match.awayScore : '-'}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Match Info Footer */}
                                      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex flex-col">
                                          <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{match.date}</span>
                                          <span className="text-[9px] font-black text-[#00ccff] uppercase italic">{match.time}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                          <span className="text-[8px] font-black text-[#00ccff] uppercase tracking-widest">SZCZEGÓŁY</span>
                                          <div className="w-1 h-1 bg-[#00ccff] rounded-full animate-pulse" />
                                        </div>
                                      </div>
                                    </div>
                                  </Link>

                                  {/* Connector Lines (Purely visual/decorative) */}
                                  {ridx < knockoutRounds.length - 1 && (
                                    <div className="hidden lg:block absolute left-full top-1/2 w-12 h-px bg-white/10 -translate-y-1/2 z-0" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-20 bg-white/5 rounded-[2.5rem] border border-white/10">
                        <div className="w-16 h-16 bg-[#00ccff]/10 rounded-full flex items-center justify-center mb-6">
                          <div className="w-8 h-8 border-2 border-[#00ccff]/30 border-t-[#00ccff] rounded-full animate-spin" />
                        </div>
                        <span className="text-white/20 font-black uppercase tracking-[0.3em] italic text-center">Faza pucharowa jeszcze się nie rozpoczęła</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto space-y-8 pb-20">
                    <div className="flex items-center gap-4 px-2">
                      <div className="w-1.5 h-6 bg-[#00ccff] rounded-full shadow-[0_0_10px_rgba(0,204,255,0.5)]" />
                      <h2 className="text-xl font-black uppercase tracking-tight italic text-white/90">RANKING STRZELCÓW</h2>
                    </div>

                    <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="py-6 px-8 text-[11px] font-black uppercase tracking-widest text-white/30">POZ</th>
                            <th className="py-6 px-8 text-[11px] font-black uppercase tracking-widest text-white/30">ZAWODNIK</th>
                            <th className="py-6 px-8 text-[11px] font-black uppercase tracking-widest text-white/30">KLUB</th>
                            <th className="py-6 px-8 text-[11px] font-black uppercase tracking-widest text-white/30 text-right">GOLE</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                          {topScorers.length > 0 ? (
                            topScorers.map((player, idx) => (
                              <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="py-5 px-8">
                                  <span className={`text-lg font-black italic ${idx === 0 ? 'text-[#00ccff]' : 'text-white/20'}`}>
                                    {idx + 1}.
                                  </span>
                                </td>
                                <td className="py-5 px-8">
                                  <div className="flex flex-col">
                                    <span className="text-base font-black uppercase tracking-tight text-white group-hover:text-[#00ccff] transition-colors">{player.name}</span>
                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">NAPASTNIK</span>
                                  </div>
                                </td>
                                <td className="py-5 px-8">
                                  <div className="flex items-center gap-3">
                                    <Image src={player.team.logo} alt="" width={24} height={24} className="w-6 h-6 object-contain" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-white/40">{player.team.name}</span>
                                  </div>
                                </td>
                                <td className="py-5 px-8 text-right">
                                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 group-hover:border-[#00ccff]/30 transition-all">
                                    <span className="text-lg font-black text-[#00ccff]">{player.goals || 0}</span>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="py-20 text-center">
                                <span className="text-white/10 font-black uppercase tracking-[0.2em] italic">Brak zarejestrowanych bramek</span>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
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
