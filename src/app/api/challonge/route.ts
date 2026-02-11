
import { NextResponse } from 'next/server';

const CHALLONGE_API_KEY = '0878262ae4ddf16bc9afcb753a245c190cfcf035cc1fcde2';
const CHALLONGE_CLIENT_ID = '8094747f7a7e59694a22d492b66531bc2fc02b77930b1cd110483b0c69f800e7';
const CHALLONGE_CLIENT_SECRET = '4af9723fd1a8d723b4545abc9d4126e0d6bbb9acc2f67cb8387566f69c9b5553';
const TOURNAMENT_SLUG = 'pff24';

export async function GET() {
  try {
    // Fetch main tournament info with participants and matches
    const mainUrl = `https://api.challonge.com/v1/tournaments/${TOURNAMENT_SLUG}.json?api_key=${CHALLONGE_API_KEY}&include_participants=1&include_matches=1`;
    const mainResponse = await fetch(mainUrl, { cache: 'no-store' });
    
    if (!mainResponse.ok) {
      throw new Error(`Challonge API error: ${mainResponse.statusText}`);
    }

    const mainData = await mainResponse.json();
    const tournament = mainData.tournament;
    
    const participants = tournament.participants?.map((p: any) => p.participant) || [];
    let matches = tournament.matches?.map((m: any) => m.match) || [];

    // If it's a two-stage tournament, group stage matches are often in sub-tournaments
    // We can try to fetch sub-tournaments if group_stages_enabled is true
    // In V1, sub-tournaments are usually reachable via tournaments/SLUG/groups.json
    // But this is often not documented well. A more reliable way is to fetch 
    // all tournaments and filter by parent_id if available, or just use the main one if it's enough.
    
    // Let's try to fetch sub-tournaments if we don't have enough matches/participants assigned to groups
    const subTournamentsUrl = `https://api.challonge.com/v1/tournaments.json?api_key=${CHALLONGE_API_KEY}`;
    const subResponse = await fetch(subTournamentsUrl, { cache: 'no-store' });
    
    if (subResponse.ok) {
      const allTournaments = await subResponse.json();
      const subTournaments = allTournaments.filter((t: any) => t.tournament.parent_id === tournament.id);
      
      if (subTournaments.length > 0) {
        // Sort sub-tournaments to ensure Group A is usually first
        subTournaments.sort((a: any, b: any) => a.tournament.id - b.tournament.id);

        for (let i = 0; i < subTournaments.length; i++) {
          const sub = subTournaments[i];
          const subDetailUrl = `https://api.challonge.com/v1/tournaments/${sub.tournament.id}.json?api_key=${CHALLONGE_API_KEY}&include_participants=1&include_matches=1`;
          const subDetailResponse = await fetch(subDetailUrl, { cache: 'no-store' });
          
          if (subDetailResponse.ok) {
            const subData = await subDetailResponse.json();
            const subMatches = subData.tournament.matches?.map((m: any) => m.match) || [];
            const subParticipants = subData.tournament.participants?.map((p: any) => p.participant) || [];
            
            matches = [...matches, ...subMatches];
            
            const clean = (name: string) => name ? name.split('[')[0].trim().toLowerCase() : '';

            subParticipants.forEach((sp: any) => {
              // Try to find the participant in the main tournament list
              const mainP = participants.find((p: any) => 
                clean(p.name) === clean(sp.name) || 
                (p.challonge_username && p.challonge_username === sp.challonge_username)
              );

              if (mainP) {
                // Attach stats and group info from the sub-tournament
                mainP.group_id = sub.tournament.id;
                mainP.group_name = `Grupa ${String.fromCharCode(65 + i)}`;
                mainP.rank = sp.final_rank;
                mainP.points = sp.points_for;
                mainP.matches_won = sp.matches_won;
                mainP.matches_lost = sp.matches_lost;
                mainP.matches_tied = sp.matches_tied;
              } else {
                // If not in main list for some reason, add them
                participants.push({
                  ...sp,
                  group_id: sub.tournament.id,
                  group_name: `Grupa ${String.fromCharCode(65 + i)}`,
                  rank: sp.final_rank,
                  points: sp.points_for,
                  matches_won: sp.matches_won,
                  matches_lost: sp.matches_lost,
                  matches_tied: sp.matches_tied
                });
              }
            });
          }
        }
      }
    }

    return NextResponse.json({
      name: tournament.name,
      participants,
      matches,
      state: tournament.state,
      tournament_type: tournament.tournament_type,
      groups_count: tournament.groups_count || 0
    });
  } catch (error: any) {
    console.error('Challonge API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
