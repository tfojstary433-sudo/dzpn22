import { REPLIT_API_BASE_URL } from '@/lib/constants';
import { getLiveMatch } from '@/lib/firebase';
import { fetchWithTimeout } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1) Try Replit detailed endpoint by ID/UUID first
    try {
      const res = await fetchWithTimeout(`${REPLIT_API_BASE_URL}/api/matches/${id}`, { cache: 'no-store', headers: { 'Accept': 'application/json' }, timeout: 3000 });
      if (res.ok) {
        const m = await res.json();

        const teamAName = m.match?.teamA || m.teamA || m.homeTeam || 'Team A';
        const teamBName = m.match?.teamB || m.teamB || m.awayTeam || 'Team B';

        const toMinute = (val: any): number | null => {
          if (val === 0) return 0;
          if (typeof val === 'number' && !Number.isNaN(val)) return val;
          if (typeof val === 'string') {
            const s = val.trim();
            // e.g., "45+2"
            if (s.includes('+')) {
              const [a, b] = s.split('+');
              const ai = parseInt(a, 10);
              const bi = parseInt(b, 10);
              if (!Number.isNaN(ai) && !Number.isNaN(bi)) return ai + bi;
            }
            // e.g., "12:34"
            if (s.includes(':')) {
              const ai = parseInt(s.split(':')[0], 10);
              if (!Number.isNaN(ai)) return ai;
            }
            // remove non-digits and parse
            const digits = s.replace(/[^0-9]/g, '');
            if (digits) {
              const ai = parseInt(digits, 10);
              if (!Number.isNaN(ai)) return ai;
            }
          }
          return null;
        };

        const mapTeam = (t: any): 'home' | 'away' => {
          const v = String(t || '').toLowerCase().trim();
          if (v === 'home' || v === 'a' || v === 'teama' || v === 'gospodarz') return 'home';
          if (v === 'away' || v === 'b' || v === 'teamb' || v === 'gosc' || v === 'gość') return 'away';
          // fallback by name match
          const vn = v.replace(/\s+/g, '');
          const a = teamAName.toLowerCase().replace(/\s+/g, '');
          const b = teamBName.toLowerCase().replace(/\s+/g, '');
          if (vn === a || a.includes(vn) || vn.includes(a)) return 'home';
          return 'away';
        };

        const srcEvents = m.events || { goals: [], cards: [], substitutions: [] };
        const goals = (srcEvents.goals || []).map((g: any) => ({
          minute: toMinute(g.minute ?? g.time ?? g.min ?? g.ts),
          player: g.player || g.name || g.scorer || 'Zawodnik',
          team: mapTeam(g.team ?? g.side ?? g.for),
          isPenalty: Boolean(g.isPenalty || g.penalty),
          number: g.number
        }));
        const cards = (srcEvents.cards || []).map((c: any) => ({
          minute: toMinute(c.minute ?? c.time ?? c.min ?? c.ts),
          player: c.player || c.name || 'Zawodnik',
          team: mapTeam(c.team ?? c.side ?? c.for),
          type: (c.type === 'yellow' || c.type === 'red') ? c.type : (String(c.type || '').toLowerCase().includes('red') ? 'red' : 'yellow'),
          number: c.number
        }));
        const substitutions = (srcEvents.substitutions || []).map((s: any) => ({
          minute: toMinute(s.minute ?? s.time ?? s.min ?? s.ts),
          team: mapTeam(s.team ?? s.side ?? s.for),
          playerOut: s.playerOut || s.out || 'Zawodnik',
          playerIn: s.playerIn || s.in || 'Zawodnik',
          numberOut: s.numberOut,
          numberIn: s.numberIn
        }));

        return Response.json({
          match: {
            uuid: m.match?.uuid || m.uuid || id,
            isActive: m.match?.isActive ?? m.isActive ?? (m.match?.status === 'active' || m.status === 'active'),
            status: m.match?.status || m.status || 'active',
            teamA: teamAName,
            teamB: teamBName,
            scoreA: m.match?.scoreA ?? m.scoreA ?? 0,
            scoreB: m.match?.scoreB ?? m.scoreB ?? 0,
            timer: m.match?.timer || m.timer || '0:00',
            period: m.match?.period || m.period || 'Pierwsza połowa',
            stats: m.match?.stats || m.stats || {
              possessionA: 50, possessionB: 50, shotsA: 0, shotsB: 0
            },
            lineupA: m.match?.lineupA || m.lineupA,
            lineupB: m.match?.lineupB || m.lineupB
          },
          events: { goals, cards, substitutions },
          timeline: m.timeline || []
        });
      }
    } catch (e) {
      // ignore and fallback
    }

    // 2) Fallback to Firebase live match
    const liveMatch = await getLiveMatch();
    if (liveMatch && liveMatch.active) {
      return Response.json({
        match: {
          uuid: id,
          isActive: true,
          status: 'active',
          teamA: liveMatch.teamA?.nazwa || 'Team A',
          teamB: liveMatch.teamB?.nazwa || 'Team B',
          scoreA: liveMatch.teamA?.score || 0,
          scoreB: liveMatch.teamB?.score || 0,
          timer: liveMatch.timer || '0:00',
          period: liveMatch.period || 'Pierwsza połowa',
          stats: liveMatch.stats || {
            possessionA: 50,
            possessionB: 50,
            shotsA: 0,
            shotsB: 0
          }
        },
        events: liveMatch.events || {
          goals: [],
          cards: [],
          substitutions: []
        }
      });
    }

    return Response.json({ error: 'Match not found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching match details:', error);
    return Response.json(
      { error: 'Failed to fetch match details' },
      { status: 500 }
    );
  }
}
