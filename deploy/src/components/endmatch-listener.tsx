'use client';

import { useEffect, useRef } from 'react';
import { useMatchStats } from '@/lib/useMatchStats';
import { matches } from '@/lib/data';

function normalizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

export function EndMatchListener() {
  const { saveMatchResult } = useMatchStats();
  const isCheckingRef = useRef(false);

  useEffect(() => {
    const checkForNewMatches = async () => {
      if (isCheckingRef.current) {
        console.log('⏸️ Już sprawdzam, pomijam...');
        return;
      }
      
      isCheckingRef.current = true;

      try {
        console.log('🔍 Sprawdzam API /api/matches...');
        const response = await fetch('/api/matches', {
          headers: { 'Accept': 'application/json' },
          cache: 'no-store'
        });
        const apiMatches = await response.json();
        
        if (!Array.isArray(apiMatches)) {
          console.error('API /api/matches returned non-array:', apiMatches);
          isCheckingRef.current = false;
          return;
        }
        
        const finishedMatches = apiMatches.filter((m: any) => m.status === 'finished');
        console.log('✅ Zakończonych meczów w API:', finishedMatches.length);
        
        const storedFinished = JSON.parse(localStorage.getItem('matchStats') || '{}');
        console.log('💾 Już zapisanych meczów:', Object.keys(storedFinished).length);

        for (const apiMatch of finishedMatches) {
          const normalizedTeamA = normalizeTeamName(apiMatch.teamA);
          const normalizedTeamB = normalizeTeamName(apiMatch.teamB);
          
          console.log(`🔎 Szukam meczu: ${apiMatch.teamA} vs ${apiMatch.teamB}`);
          console.log(`   Normalized: ${normalizedTeamA} vs ${normalizedTeamB}`);
          
          const scheduledMatch = matches.find(sm => {
            const homeNames = [
              normalizeTeamName(sm.homeTeam.name),
              normalizeTeamName(sm.homeTeam.shortName),
              normalizeTeamName(sm.homeTeam.id)
            ];
            const awayNames = [
              normalizeTeamName(sm.awayTeam.name),
              normalizeTeamName(sm.awayTeam.shortName),
              normalizeTeamName(sm.awayTeam.id)
            ];
            
            const homeMatch = homeNames.some(n => n === normalizedTeamA || normalizedTeamA.includes(n) || n.includes(normalizedTeamA));
            const awayMatch = awayNames.some(n => n === normalizedTeamB || normalizedTeamB.includes(n) || n.includes(normalizedTeamB));
            
            if (homeMatch && awayMatch) {
              console.log(`   ✅ DOPASOWANO: ${sm.homeTeam.name} vs ${sm.awayTeam.name}`);
            }
            
            return homeMatch && awayMatch;
          });

          if (!scheduledMatch) {
            console.warn('⚠️ NIE znaleziono meczu w terminarzu dla:', apiMatch.teamA, 'vs', apiMatch.teamB);
            continue;
          }

          if (storedFinished[scheduledMatch.id]) {
            console.log('⏭️ Mecz już zapisany, pomijam:', scheduledMatch.id);
            continue;
          }

          console.log('🆕 NOWY mecz do zapisania:', scheduledMatch.id, scheduledMatch.homeTeam.name, 'vs', scheduledMatch.awayTeam.name, `${apiMatch.scoreA}-${apiMatch.scoreB}`);
          
          try {
            const detailsResponse = await fetch(`/api/matches/${apiMatch.uuid}`, {
              headers: { 'Accept': 'application/json' },
              cache: 'no-store'
            });
            const details = await detailsResponse.json();

            const scorers = details.events?.goals?.map((goal: any) => {
              console.log('⚽ Gol:', goal.player, 'playerId:', goal.playerId, 'team:', goal.team);
              return {
                playerName: goal.player,
                playerId: goal.playerId || 0,
                teamId: goal.team === 'home' ? scheduledMatch.homeTeam.id : scheduledMatch.awayTeam.id,
                goals: 1,
                avatarUrl: `https://tr.rbxcdn.com/30DAY-AvatarHeadshot-${goal.playerId || 0}-150x150-Png-00.png`
              };
            }) || [];

            const groupedScorers: any[] = [];
            scorers.forEach((scorer: any) => {
              const existing = groupedScorers.find(s => s.playerId === scorer.playerId && s.teamId === scorer.teamId);
              if (existing) {
                existing.goals += 1;
              } else {
                groupedScorers.push({ ...scorer });
              }
            });

            console.log('💾 Zapisuję mecz:', scheduledMatch.id, 'Strzelcy:', groupedScorers);

            await saveMatchResult({
              matchId: scheduledMatch.id,
              homeTeamId: scheduledMatch.homeTeam.id,
              awayTeamId: scheduledMatch.awayTeam.id,
              homeScore: apiMatch.scoreA ?? 0,
              awayScore: apiMatch.scoreB ?? 0,
              scorers: groupedScorers
            });

            console.log('✅ Mecz zapisany!');
          } catch (detailsError) {
            console.error('❌ Błąd pobierania szczegółów:', detailsError);
          }
        }
      } catch (error) {
        console.error('❌ Błąd sprawdzania meczów:', error);
      } finally {
        isCheckingRef.current = false;
      }
    };

    const interval = setInterval(checkForNewMatches, 15000);
    checkForNewMatches();
    
    return () => clearInterval(interval);
  }, [saveMatchResult]);

  return null;
}
