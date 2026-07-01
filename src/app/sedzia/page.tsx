'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { 
  Trophy, 
  Clock, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertCircle, 
  LogOut, 
  User, 
  Users, 
  MessageSquare,
  Plus, 
  Trash2, 
  ChevronRight,
  Shield,
  Loader2,
  Timer,
  Settings,
  BellRing,
  Activity,
  History,
  Send,
  Calendar,
  X
} from 'lucide-react';
import { MainNavbar } from '@/components/main-navbar';
import { Footer } from '@/components/footer';

const API_BASE = "https://league-builder.replit.app/teams/api";
const CZAS_POLOWY = 35;
const TEMATY = [
  "Prośba o nałożenie kary",
  "Naruszenie regulaminu",
  "Incydent z zawodnikiem",
  "Niesportowe zachowanie",
  "Wniosek o walkower",
  "Informacja po meczu",
  "Inne",
];

interface Referee {
  id: number;
  name: string;
  token: string;
}

interface Match {
  id: number;
  home_team_id: number;
  home_team_name: string;
  away_team_id: number;
  away_team_name: string;
  home_score: number;
  away_score: number;
  status: 'scheduled' | 'live' | 'finished' | 'postponed';
  period: 'first_half' | 'halftime' | 'second_half' | null;
  scheduled_at: string;
  round: number;
  referee_id: number;
  start_timestamp: string | null;
  second_half_at: string | null;
  extra_time_first?: number;
  extra_time_second?: number;
  lineup_locked?: boolean;
  lineup_submitted?: boolean;
}

interface LineupPlayer {
  player_id: number;
  role: 'goalkeeper' | 'starter' | 'substitute' | 'reserve' | 'none';
  is_captain: boolean;
  sort_order: number;
  first_name: string;
  last_name: string;
  jersey_number: number;
  photo_url: string | null;
}

interface MatchLineup {
  id: number; // lineup_id
  team_id: number;
  team_name: string;
  is_locked: boolean;
  notes: string;
  players: LineupPlayer[];
}

interface AdminLineupResponse {
  match_id: number;
  home_team: { id: number; name: string; logo_url: string | null };
  away_team: { id: number; name: string; logo_url: string | null };
  lineups: MatchLineup[];
}

interface Player {
  id: number;
  first_name: string;
  last_name: string;
  jersey_number: number | null;
  position: string;
}

interface MatchEvent {
  id: number;
  match_id: number;
  type: 'goal' | 'penalty_goal' | 'penalty_missed' | 'yellow_card' | 'red_card' | 'substitution' | 'assist' | 'info';
  minute: number;
  player_id: number | null;
  player_name: string | null;
  team_id: number | null;
  team_name: string | null;
  description: string | null;
}

interface Reply {
  id: number;
  text: string;
  sender: 'referee' | 'organizer';
  created_at: string;
}

interface RefereeMessage {
  id: number;
  subject: string;
  message: string;
  match_id?: number;
  referee_id: number;
  created_at: string;
  replies: Reply[];
}

export default function RefereePanelPage() {
  const [referee, setReferee] = useState<Referee | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'match' | 'messages' | 'lineups'>('match');
  const [refereeMessages, setRefereeMessages] = useState<RefereeMessage[]>([]);
  const [lineups, setLineups] = useState<{ [key: string]: MatchLineup | null }>({ home: null, away: null });
  const [lineupsLoading, setLineupsLoading] = useState(false);
  const [expandedMessageId, setExpandedMessageId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});

  // New states for extra time and messages
  const [isExtraTimeModalOpen, setIsExtraTimeModalOpen] = useState(false);
  const [extraTimeHalf, setExtraTimeHalf] = useState<'first' | 'second'>('first');
  const [extraTimeMinutes, setExtraTimeMinutes] = useState<number>(0);
  
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [msgSubject, setMsgSubject] = useState('Prośba o nałożenie kary');
  const [msgCustomSubject, setMsgCustomSubject] = useState('');
  const [msgBody, setMsgBody] = useState('');

  // Login state
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  // Matches state
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [liveData, setLiveData] = useState<any>(null);
  
  // Players and events state
  const [homePlayers, setHomePlayers] = useState<Player[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<Player[]>([]);
  const [homeLogo, setHomeLogo] = useState<string | null>(null);
  const [awayLogo, setAwayLogo] = useState<string | null>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  
  // Event form state
  const [eventType, setEventType] = useState<string>('goal');
  const [eventTeamId, setEventTeamId] = useState<number | null>(null);
  const [eventPlayerId, setEventPlayerId] = useState<number | null>(null);
  const [eventDescription, setEventDescription] = useState('');
  const [eventMinute, setEventMinute] = useState<number>(0);

  const obliczMinute = useCallback((mecz: Match) => {
    if (liveData?.minute !== undefined) return liveData.minute;
    
    const now = Date.now();
    if (mecz.period === "first_half" && mecz.start_timestamp) {
      const min = Math.floor((now - new Date(mecz.start_timestamp).getTime()) / 60000);
      const extra = mecz.extra_time_first || 0;
      return Math.min(min, CZAS_POLOWY + extra);
    }
    if (mecz.period === "second_half" && mecz.second_half_at) {
      const elapsed = Math.floor((now - new Date(mecz.second_half_at).getTime()) / 60000);
      const extra = mecz.extra_time_second || 0;
      return CZAS_POLOWY + elapsed;
    }
    return CZAS_POLOWY;
  }, [liveData]);

  useEffect(() => {
    if (activeMatch && activeMatch.status === 'live') {
      setEventMinute(obliczMinute(activeMatch));
    }
  }, [activeMatch, obliczMinute]);

  useEffect(() => {
    const savedToken = localStorage.getItem('referee_token');
    const savedId = localStorage.getItem('referee_id');
    const savedName = localStorage.getItem('referee_name');

    if (savedToken && savedId && savedName) {
      setReferee({
        id: parseInt(savedId),
        name: savedName,
        token: savedToken
      });
    }
    setLoading(false);
  }, []);

  const fetchRefereeMessages = useCallback(async () => {
    if (!referee) return;
    try {
      const res = await fetch(`${API_BASE}/referee/messages`, {
        headers: { "Authorization": `Bearer ${referee.token}` }
      });
      if (res.ok) {
        setRefereeMessages(await res.json());
      }
    } catch (err) {
      console.error("Error fetching referee messages:", err);
    }
  }, [referee]);

  useEffect(() => {
    if (referee && activeTab === 'messages') {
      fetchRefereeMessages();
      const interval = setInterval(fetchRefereeMessages, 10000);
      return () => clearInterval(interval);
    }
  }, [referee, activeTab, fetchRefereeMessages]);

  const handleReplyMessage = async (msgId: number) => {
    if (!referee || !replyText[msgId]?.trim()) return;
    
    try {
      const res = await fetch(`${API_BASE}/referee/messages/${msgId}/reply`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${referee.token}`
        },
        body: JSON.stringify({ text: replyText[msgId] })
      });

      if (res.ok) {
        setReplyText(prev => ({ ...prev, [msgId]: '' }));
        fetchRefereeMessages();
      } else {
        setError("Błąd podczas wysyłania odpowiedzi");
      }
    } catch (err) {
      setError("Błąd połączenia");
    }
  };

  const fetchMatches = useCallback(async () => {
    if (!referee) return;
    try {
      const res = await fetch(`${API_BASE}/matches`);
      if (res.ok) {
        const allMatches = await res.json();
        const myMatches = allMatches.filter((m: any) => 
          m.referee_id === referee.id && m.home_team_id && m.away_team_id
        );
        setMatches(myMatches);
        
        // Update active match if selected
        if (selectedMatchId) {
          const updated = myMatches.find((m: any) => m.id === selectedMatchId);
          if (updated) setActiveMatch(updated);
        }
      }
    } catch (err) {
      console.error("Error fetching matches:", err);
    }
  }, [referee, selectedMatchId]);

  const fetchMatchDetails = useCallback(async (matchId: number) => {
    try {
      const match = matches.find(m => m.id === matchId);
      if (!match) return;

      // Fetch players and team info for both teams
      const [homeRes, awayRes, homeTeamRes, awayTeamRes, eventsRes, liveRes] = await Promise.all([
        fetch(`${API_BASE}/teams/${match.home_team_id}/players`),
        fetch(`${API_BASE}/teams/${match.away_team_id}/players`),
        fetch(`${API_BASE}/teams?id=${match.home_team_id}`), // Fallback or direct fetch
        fetch(`${API_BASE}/teams?id=${match.away_team_id}`),
        fetch(`${API_BASE}/matches/${matchId}/events`),
        fetch(`${API_BASE}/public/matches/${matchId}/live.json`)
      ]);

      if (homeRes.ok) setHomePlayers(await homeRes.json());
      if (awayRes.ok) setAwayPlayers(await awayRes.json());
      
      if (liveRes.ok) {
        const lData = await liveRes.json();
        setLiveData(lData);
      }
      
      // Attempt to get logos from teams list if direct id fetch not supported well
      // Usually fetch(`${API_BASE}/teams`) and find is safer if direct id not supported
      const teamsRes = await fetch(`${API_BASE}/teams`);
      if (teamsRes.ok) {
        const allTeams = await teamsRes.json();
        const hTeam = allTeams.find((t: any) => t.id === match.home_team_id);
        const aTeam = allTeams.find((t: any) => t.id === match.away_team_id);
        if (hTeam) setHomeLogo(hTeam.logo_url);
        if (aTeam) setAwayLogo(aTeam.logo_url);
      }

      if (eventsRes.ok) setEvents(await eventsRes.json());
    } catch (err) {
      console.error("Error fetching match details:", err);
    }
  }, [matches]);

  const fetchLineups = useCallback(async (matchId: number | string) => {
    if (!referee) return;
    setLineupsLoading(true);
    try {
      // Try admin endpoint first
      const adminRes = await fetch(`${API_BASE}/admin/lineups/match/${matchId}`);
      
      if (adminRes.ok) {
        const data: AdminLineupResponse = await adminRes.json();
        const homeLineup = data.lineups.find(l => String(l.team_id) === String(data.home_team.id)) || null;
        const awayLineup = data.lineups.find(l => String(l.team_id) === String(data.away_team.id)) || null;
        setLineups({ home: homeLineup, away: awayLineup });
      } else {
        // Fallback to public lineups /all.json which is more reliable in this env
        const lineupsRes = await fetch(`https://league-builder.replit.app/api/public/lineups/all.json`);
        const allLineupsData = await lineupsRes.json();
        const matchEntry = Array.isArray(allLineupsData) 
          ? allLineupsData.find((m: any) => String(m.match_id) === String(matchId))
          : (allLineupsData.matches?.find((m: any) => String(m.match_id) === String(matchId)));

        if (matchEntry) {
          const m = matches.find(m => String(m.id) === String(matchId));
          const hL = matchEntry.lineups.find((l: any) => 
            String(l.team?.id) === String(m?.home_team_id) || 
            l.team_name?.includes(m?.home_team_name || '')
          );
          const aL = matchEntry.lineups.find((l: any) => 
            String(l.team?.id) === String(m?.away_team_id) || 
            l.team_name?.includes(m?.away_team_name || '')
          );

          const formatLineup = (l: any): MatchLineup | null => {
            if (!l) return null;
            return {
              id: l.id || 0,
              team_id: l.team?.id || 0,
              team_name: l.team?.name || l.team_name,
              is_locked: l.is_locked || false,
              notes: l.notes || "",
              players: [
                ...(l.goalkeeper || []).map((p: any) => ({ ...p, role: 'goalkeeper' })),
                ...(l.starters || []).map((p: any) => ({ ...p, role: 'starter' })),
                ...(l.substitutes || []).map((p: any) => ({ ...p, role: 'substitute' })),
                ...(l.reserves || []).map((p: any) => ({ ...p, role: 'reserve' }))
              ]
            } as MatchLineup;
          };

          setLineups({ 
            home: formatLineup(hL), 
            away: formatLineup(aL) 
          });
        }
      }
    } catch (err) {
      console.error("Error fetching lineups:", err);
    } finally {
      setLineupsLoading(false);
    }
  }, [referee, matches]);

  const handleLockLineup = async (lineupId: number, matchId: number, isCurrentlyLocked: boolean) => {
    if (!referee || !confirm(`Czy na pewno ${isCurrentlyLocked ? 'cofnąć zatwierdzenie' : 'zatwierdzić'} skład?`)) return;
    
    try {
      const res = await fetch(`${API_BASE}/admin/lineups/${lineupId}/lock`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${referee.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ is_locked: !isCurrentlyLocked })
      });
      
      if (res.ok) {
        setSuccessMessage(isCurrentlyLocked ? "Zatwierdzenie zostało cofnięte" : "Skład został zatwierdzony");
        fetchLineups(matchId);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Błąd podczas zmiany statusu składu");
      }
    } catch (err) {
      setError("Błąd połączenia");
    }
  };

  useEffect(() => {
    if (referee) {
      fetchMatches();
      const interval = setInterval(fetchMatches, 10000);
      return () => clearInterval(interval);
    }
  }, [referee, fetchMatches]);

  useEffect(() => {
    if (selectedMatchId) {
      fetchMatchDetails(selectedMatchId);
      const interval = setInterval(() => fetchMatchDetails(selectedMatchId), 10000);
      return () => clearInterval(interval);
    }
  }, [selectedMatchId, fetchMatchDetails]);

  useEffect(() => {
    if (selectedMatchId && activeTab === 'lineups') {
      fetchLineups(selectedMatchId);
    }
  }, [selectedMatchId, activeTab, fetchLineups]);

  // Audio/Vibration alert logic
  useEffect(() => {
    if (activeMatch && activeMatch.status === 'live') {
      const minute = obliczMinute(activeMatch);
      if (minute === 34) {
        // Vibrate
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([500, 200, 500]);
        }
        // Beep (simple implementation)
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log("Audio play failed", e));
      }
    }
  }, [activeMatch, obliczMinute]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/referees/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: login.toLowerCase(), password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('referee_token', data.token);
        localStorage.setItem('referee_id', data.referee_id.toString());
        localStorage.setItem('referee_name', data.name);
        setReferee({
          id: data.referee_id,
          name: data.name,
          token: data.token
        });
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || 'Błędny login lub hasło');
      }
    } catch (err) {
      setError('Błąd połączenia z serwerem');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('referee_token');
    localStorage.removeItem('referee_id');
    localStorage.removeItem('referee_name');
    setReferee(null);
    setSelectedMatchId(null);
    setActiveMatch(null);
  };

  const getStartBlockReason = () => {
    if (!activeMatch) return null;
    
    const reasons = [];
    const now = Date.now();
    const matchTime = new Date(activeMatch.scheduled_at).getTime();
    // Strict rule: 30 minutes before the match start time
    const deadline = matchTime - (30 * 60 * 1000); 

    const homeLineup = lineups.home;
    const awayLineup = lineups.away;

    if (!homeLineup) {
      reasons.push(`${activeMatch.home_team_name}: Nie wysłano składu`);
    } else if (!homeLineup.is_locked) {
      reasons.push(`${activeMatch.home_team_name}: Skład oczekuje na zatwierdzenie`);
    }
    
    if (!awayLineup) {
      reasons.push(`${activeMatch.away_team_name}: Nie wysłano składu`);
    } else if (!awayLineup.is_locked) {
      reasons.push(`${activeMatch.away_team_name}: Skład oczekuje na zatwierdzenie`);
    }

    // Strict time limit check - 30 minutes before match
    if (now > deadline) {
      if (!homeLineup || !homeLineup.is_locked) {
        reasons.push(`ALARM: Przekroczono termin dla ${activeMatch.home_team_name} (30 min przed meczem!)`);
      }
      if (!awayLineup || !awayLineup.is_locked) {
        reasons.push(`ALARM: Przekroczono termin dla ${activeMatch.away_team_name} (30 min przed meczem!)`);
      }
    }

    return reasons.length > 0 ? reasons : null;
  };

  const matchAction = async (action: 'start' | 'halftime' | 'second_half' | 'finish') => {
    if (!selectedMatchId) return;

    // Check if both lineups are submitted and locked before starting
    if (action === 'start') {
      const blockReasons = getStartBlockReason();
      if (blockReasons) {
        setError(`Nie można rozpocząć meczu: ${blockReasons.join(", ")}`);
        setTimeout(() => setError(null), 5000);
        return;
      }
    }

    if (action === 'finish' && !confirm("Czy na pewno zakończyć mecz?")) return;
    
    try {
      const res = await fetch(`${API_BASE}/matches/${selectedMatchId}/${action}`, {
        method: "POST"
      });

      if (res.ok) {
        setSuccessMessage(`Mecz: akcja ${action} wykonana`);
        await fetchMatches();
        await fetchMatchDetails(selectedMatchId);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || `Błąd serwera (Status: ${res.status})`);
      }
    } catch (err) {
      setError("Błąd połączenia z serwerem");
    }
  };

  const handleExtraTime = async () => {
    if (!selectedMatchId || !referee) return;
    try {
      const res = await fetch(`${API_BASE}/referee/matches/${selectedMatchId}/extra-time`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${referee.token}`
        },
        body: JSON.stringify({
          half: extraTimeHalf,
          minutes: extraTimeMinutes
        })
      });
      if (res.ok) {
        setSuccessMessage(`Doliczono czas: +${extraTimeMinutes} min`);
        fetchMatches();
        setIsExtraTimeModalOpen(false);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError("Błąd podczas doliczania czasu");
      }
    } catch (err) {
      setError("Błąd połączenia");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referee) return;
    
    const subject = msgSubject === 'Inne' ? msgCustomSubject : msgSubject;
    if (!subject || !msgBody) {
      setError("Podaj temat i treść wiadomości");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/referee/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${referee.token}`
        },
        body: JSON.stringify({
          subject,
          message: msgBody,
          match_id: selectedMatchId
        })
      });
      if (res.ok) {
        setSuccessMessage("Wiadomość wysłana do organizatora");
        setIsMessageModalOpen(false);
        setMsgBody('');
        setMsgCustomSubject('');
        fetchRefereeMessages();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError("Błąd podczas wysyłania wiadomości");
      }
    } catch (err) {
      setError("Błąd połączenia");
    }
  };

  const respondToPostpone = async (requestId: number, response: 'confirmed' | 'rejected', message?: string) => {
    if (!referee) return;
    if (response === 'rejected' && !message) {
      setError("Podaj powód odrzucenia");
      return;
    }
    // ... logic for postpone response if sędzia has it
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchId || !eventTeamId || !activeMatch) return;

    // Calculate current minute based on match timer
    const calculatedMinute = obliczMinute(activeMatch);

    const body: any = {
      type: eventType,
      minute: calculatedMinute,
      team_id: eventTeamId,
      player_id: eventPlayerId,
      description: eventDescription
    };

    try {
      const res = await fetch(`${API_BASE}/matches/${selectedMatchId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setSuccessMessage("Zdarzenie dodane");
        fetchMatchDetails(selectedMatchId);
        // Reset form
        setEventPlayerId(null);
        setEventDescription('');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError("Błąd dodawania zdarzenia");
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!selectedMatchId || !confirm("Czy na pewno usunąć to zdarzenie?")) return;
    try {
      const res = await fetch(`${API_BASE}/matches/${selectedMatchId}/events/${eventId}`, {
        method: "DELETE"
      });
      if (res.status === 204 || res.ok) {
        setSuccessMessage("Zdarzenie usunięte");
        fetchMatchDetails(selectedMatchId);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError("Błąd usuwania zdarzenia");
    }
  };

  function formatExtraTime(mecz: Match) {
    if (mecz.period === 'first_half' && mecz.extra_time_first && mecz.extra_time_first > 0) {
      return ` (+${mecz.extra_time_first}')`;
    }
    if (mecz.period === 'second_half' && mecz.extra_time_second && mecz.extra_time_second > 0) {
      return ` (+${mecz.extra_time_second}')`;
    }
    return '';
  }

  const PlayerRow = ({ player }: { player: LineupPlayer }) => (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
            {player.photo_url ? (
              <img src={player.photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-black text-white/20">
                {player.first_name[0]}{player.last_name[0]}
              </span>
            )}
          </div>
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 border-2 border-[#0f172a] rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-[8px] font-black text-white">#{player.jersey_number}</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black uppercase italic tracking-tight text-white group-hover:text-blue-400 transition-colors">
              {player.first_name} {player.last_name}
            </span>
            {player.is_captain && (
              <span className="bg-amber-500 text-black text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest flex items-center gap-0.5">
                <Shield className="w-2 h-2" fill="currentColor" /> C
              </span>
            )}
            {player.role === 'goalkeeper' && (
              <span className="bg-blue-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest flex items-center gap-0.5">
                BK
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!referee) {
    return (
      <div className="min-h-screen bg-[#05080f] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background elements */}
        <div className="fixed inset-0 z-0 pointer-events-none">
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

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
            <div className="flex flex-col items-center mb-10">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                <Timer className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter text-center">Panel Sędziego</h1>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2">Zaloguj się, aby zarządzać meczem</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Login</label>
                <input 
                  type="text" 
                  value={login}
                  onChange={(e) => {
                    setLogin(e.target.value);
                    setError(null);
                  }}
                  placeholder="imię.nazwisko"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/10 !normal-case"
                  style={{ textTransform: 'none' }}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Hasło</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/10"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-500 text-xs font-bold uppercase">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={authLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-black py-5 rounded-2xl transition-all shadow-lg shadow-blue-500/20 uppercase tracking-tighter flex items-center justify-center gap-3"
              >
                {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Zaloguj się"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-black min-h-screen text-white font-sans selection:bg-blue-500/30 relative overflow-x-hidden">
      <MainNavbar />
      
      {/* Background elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
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

      <div className="container mx-auto px-4 pt-32 pb-32 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Matches List */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 sticky top-32">
              <div className="flex items-center gap-4 mb-8 px-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-tight italic">{referee.name}</h2>
                  <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest">Sędzia Główny</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-8">
                <button 
                  onClick={() => setActiveTab('match')}
                  className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${
                    activeTab === 'match' 
                    ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-600/20 text-white' 
                    : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  Panel Meczu
                </button>
                <button 
                  onClick={() => setActiveTab('messages')}
                  className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${
                    activeTab === 'messages' 
                    ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-600/20 text-white' 
                    : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                  }`}
                >
                  <div className="relative">
                    <MessageSquare className="w-4 h-4" />
                    {refereeMessages.some(m => (m.replies || []).some(r => r.sender === 'organizer')) && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </div>
                  Wiadomości
                </button>
                <button 
                  onClick={() => setActiveTab('lineups')}
                  className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${
                    activeTab === 'lineups' 
                    ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-600/20 text-white' 
                    : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Składy
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-4 mb-2">Twoje Mecze</h3>
                {matches.length === 0 ? (
                  <div className="p-4 text-center text-white/20 text-xs italic font-bold uppercase tracking-widest">
                    Brak przypisanych meczów
                  </div>
                ) : (
                  matches.map(m => (
                    <button 
                      key={m.id}
                      onClick={() => {
                        setSelectedMatchId(m.id);
                        setActiveMatch(m);
                        if (typeof setEventMinute === 'function') {
                          setEventMinute(obliczMinute(m));
                        }
                      }}
                      className={`w-full text-left p-4 rounded-2xl transition-all border ${
                        selectedMatchId === m.id 
                        ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-600/20' 
                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border ${
                          m.status === 'live' ? 'bg-red-500 border-red-400 text-white animate-pulse' : 'bg-white/10 border-white/10 text-white/40'
                        }`}>
                          {m.status === 'live' ? 'LIVE' : m.status}
                        </span>
                        <span className="text-[8px] text-white/40 font-black uppercase">Kolejka {m.round}</span>
                      </div>
                      <div className="text-[11px] font-black uppercase italic leading-tight mb-1">
                        {m.home_team_name}
                      </div>
                      <div className="text-[11px] font-black uppercase italic leading-tight text-white/40">
                        vs {m.away_team_name}
                      </div>
                      {m.status === 'live' && (
                        <div className="mt-2 flex items-center gap-2 text-[10px] font-black text-white animate-pulse">
                           <Clock className="w-3 h-3" />
                           {m.home_score} : {m.away_score}
                        </div>
                      )}
                    </button>
                  ))
                )}
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-6 py-4 mt-8 rounded-2xl text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all text-xs font-black uppercase tracking-widest border border-red-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  Wyloguj panel
                </button>
              </div>
            </div>
          </div>

          {/* Main Console */}
          <div className="flex-1">
            {successMessage && (
              <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-2xl p-6 flex items-center gap-4 text-green-500 text-sm font-black uppercase italic tracking-tight animate-in fade-in slide-in-from-top-4">
                <CheckCircle className="w-6 h-6" />
                {successMessage}
              </div>
            )}

            {activeTab === 'messages' ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* New Message Form */}
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10">
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-8 flex items-center gap-4">
                    <Send className="w-8 h-8 text-blue-500" />
                    Wyślij wiadomość do organizatora
                  </h3>
                  <form onSubmit={handleSendMessage} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Temat</label>
                        <select 
                          value={msgSubject}
                          onChange={(e) => setMsgSubject(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
                        >
                          {TEMATY.map(t => (
                            <option key={t} value={t} className="bg-[#0a0f1d]">{t}</option>
                          ))}
                        </select>
                      </div>
                      {msgSubject === 'Inne' && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-left-4">
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Własny temat</label>
                          <input 
                            value={msgCustomSubject}
                            onChange={(e) => setMsgCustomSubject(e.target.value)}
                            placeholder="Wpisz temat..."
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50"
                            required
                          />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Treść wiadomości</label>
                      <textarea 
                        rows={4}
                        value={msgBody}
                        onChange={(e) => setMsgBody(e.target.value)}
                        placeholder="Opisz sprawę szczegółowo..."
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50 resize-none"
                        required
                      />
                    </div>
                    <div className="flex justify-end">
                      <button 
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-black px-12 py-5 rounded-2xl uppercase tracking-tighter shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-3"
                      >
                        <Send className="w-5 h-5" />
                        Wyślij do organizatora
                      </button>
                    </div>
                  </form>
                </div>

                {/* Messages List */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-4 ml-4">
                    <History className="w-8 h-8 text-white/20" />
                    Twoje wiadomości ({refereeMessages.length})
                  </h3>
                  
                  {refereeMessages.length === 0 ? (
                    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-20 text-center">
                       <MessageSquare className="w-16 h-16 text-white/5 mx-auto mb-6" />
                       <p className="text-white/20 font-black uppercase tracking-widest text-sm italic">Brak wysłanych wiadomości.</p>
                    </div>
                  ) : (
                    refereeMessages.map((msg) => {
                      const hasNewReply = (msg.replies || []).some(r => r.sender === 'organizer');
                      const isExpanded = expandedMessageId === msg.id;

                      return (
                        <div key={msg.id} className={`bg-white/5 backdrop-blur-2xl border rounded-[2.5rem] overflow-hidden transition-all duration-500 ${hasNewReply ? 'border-blue-500/30' : 'border-white/10'}`}>
                          {/* Thread Header */}
                          <button 
                            onClick={() => setExpandedMessageId(isExpanded ? null : msg.id)}
                            className={`w-full text-left p-10 flex items-center justify-between transition-colors ${isExpanded ? 'bg-white/5' : 'hover:bg-white/[0.02]'}`}
                          >
                            <div className="flex items-center gap-8">
                               <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${hasNewReply ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-white/20 border border-white/10'}`}>
                                  <MessageSquare className="w-8 h-8" />
                               </div>
                               <div>
                                  <div className="flex items-center gap-4 mb-2">
                                     {hasNewReply && (
                                       <span className="bg-blue-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
                                          NOWA ODPOWIEDŹ
                                       </span>
                                     )}
                                     <h4 className="text-xl font-black uppercase italic tracking-tighter text-white/90">{msg.subject}</h4>
                                  </div>
                                  <div className="text-[10px] text-white/20 font-black uppercase tracking-widest flex items-center gap-3">
                                     <Clock className="w-3 h-3" />
                                     {new Date(msg.created_at).toLocaleDateString("pl-PL")} · {(msg.replies || []).length} odpowiedzi
                                  </div>
                               </div>
                            </div>
                            <ChevronRight className={`w-8 h-8 text-white/10 transition-transform duration-500 ${isExpanded ? 'rotate-90 text-blue-500' : ''}`} />
                          </button>

                          {/* Thread Content */}
                          {isExpanded && (
                            <div className="border-t border-white/5 animate-in slide-in-from-top-4 duration-500">
                               {/* Original Message */}
                               <div className="p-10 bg-black/20 border-b border-white/5">
                                  <div className="flex items-center gap-3 mb-4">
                                     <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-500 flex items-center justify-center">
                                        <Activity className="w-4 h-4" />
                                     </div>
                                     <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Twoje zgłoszenie · {new Date(msg.created_at).toLocaleString("pl-PL")}</span>
                                  </div>
                                  <p className="text-white/80 font-medium leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                               </div>

                               {/* Replies */}
                               <div className="space-y-1">
                                  {(msg.replies || []).map((rep) => (
                                    <div key={rep.id} className={`p-10 border-b border-white/5 ${rep.sender === 'organizer' ? 'bg-blue-600/[0.03]' : 'bg-transparent'}`}>
                                       <div className="flex items-center gap-3 mb-4">
                                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${rep.sender === 'organizer' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white/10 text-white/40'}`}>
                                             {rep.sender === 'organizer' ? <Settings className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                                          </div>
                                          <span className={`text-[10px] font-black uppercase tracking-widest ${rep.sender === 'organizer' ? 'text-blue-400' : 'text-white/40'}`}>
                                             {rep.sender === 'organizer' ? 'Organizator Ligi' : 'Ty'} · {new Date(rep.created_at).toLocaleString("pl-PL")}
                                          </span>
                                       </div>
                                       <p className="text-white/80 font-medium leading-relaxed whitespace-pre-wrap">{rep.text}</p>
                                    </div>
                                  ))}
                               </div>

                               {/* Quick Reply Form */}
                               <div className="p-8 bg-white/5 flex gap-4">
                                  <input 
                                    type="text"
                                    value={replyText[msg.id] || ''}
                                    onChange={(e) => setReplyText(prev => ({ ...prev, [msg.id]: e.target.value }))}
                                    onKeyDown={(e) => e.key === 'Enter' && handleReplyMessage(msg.id)}
                                    placeholder="Napisz odpowiedź do organizatora..."
                                    className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50"
                                  />
                                  <button 
                                    onClick={() => handleReplyMessage(msg.id)}
                                    disabled={!replyText[msg.id]?.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                                  >
                                    <Send className="w-5 h-5" />
                                  </button>
                               </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : activeTab === 'lineups' ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {!selectedMatchId ? (
                  <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-20 text-center">
                    <Users className="w-16 h-16 text-white/5 mx-auto mb-6" />
                    <p className="text-white/20 font-black uppercase tracking-widest text-sm italic">Wybierz mecz z listy, aby zobaczyć składy.</p>
                  </div>
                ) : lineupsLoading ? (
                  <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-20 text-center">
                    <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-6" />
                    <p className="text-white/20 font-black uppercase tracking-widest text-sm italic">Pobieranie składów...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Home Team Lineup */}
                    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">
                            {activeMatch?.home_team_name}
                          </h3>
                          <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Gospodarze</p>
                        </div>
                        {lineups.home ? (
                          <div className="flex items-center gap-3">
                            {lineups.home.is_locked ? (
                              <div className="flex items-center gap-2">
                                <span className="bg-green-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                                  <CheckCircle className="w-2 h-2" /> Zatwierdzony
                                </span>
                                <button 
                                  onClick={() => handleLockLineup(lineups.home!.id, selectedMatchId!, true)}
                                  className="bg-white/10 hover:bg-white/20 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest transition-all"
                                >
                                  Cofnij
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => handleLockLineup(lineups.home!.id, selectedMatchId!, false)}
                                className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-green-500/20"
                              >
                                Zatwierdź skład
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="bg-white/5 text-white/20 text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/10">
                            Skład nie złożony
                          </span>
                        )}
                      </div>

                      {lineups.home && (
                        <div className="space-y-6">
                          {/* Goalkeeper */}
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                              <span className="w-2 h-2 bg-blue-500 rounded-full" /> Bramkarz
                            </h4>
                            {lineups.home.players.filter(p => p.role === 'goalkeeper').map((p, idx) => (
                              <PlayerRow key={idx} player={p} />
                            ))}
                          </div>

                          {/* Starters */}
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full" /> W polu
                            </h4>
                            {lineups.home.players.filter(p => p.role === 'starter').map((p, idx) => (
                              <PlayerRow key={idx} player={p} />
                            ))}
                          </div>

                          {/* Substitutes */}
                          {lineups.home.players.some(p => p.role === 'substitute') && (
                            <div className="space-y-3">
                              <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 bg-amber-600 rounded-full" /> Rezerwa
                              </h4>
                              {lineups.home.players.filter(p => p.role === 'substitute').map((p, idx) => (
                                <PlayerRow key={idx} player={p} />
                              ))}
                            </div>
                          )}

                          {/* Reserves */}
                          {lineups.home.players.some(p => p.role === 'reserve') && (
                            <div className="space-y-3">
                              <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 bg-white/20 rounded-full" /> Trybuna
                              </h4>
                              {lineups.home.players.filter(p => p.role === 'reserve').map((p, idx) => (
                                <PlayerRow key={idx} player={p} />
                              ))}
                            </div>
                          )}
                          
                          {lineups.home.notes && (
                            <div className="mt-8 p-6 bg-black/20 rounded-3xl border border-white/5">
                              <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-3">Uwagi trenera:</p>
                              <p className="text-sm text-white/80 italic font-medium leading-relaxed">{lineups.home.notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Away Team Lineup */}
                    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">
                            {activeMatch?.away_team_name}
                          </h3>
                          <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Goście</p>
                        </div>
                        {lineups.away ? (
                          <div className="flex items-center gap-3">
                            {lineups.away.is_locked ? (
                              <div className="flex items-center gap-2">
                                <span className="bg-green-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                                  <CheckCircle className="w-2 h-2" /> Zatwierdzony
                                </span>
                                <button 
                                  onClick={() => handleLockLineup(lineups.away!.id, selectedMatchId!, true)}
                                  className="bg-white/10 hover:bg-white/20 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest transition-all"
                                >
                                  Cofnij
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => handleLockLineup(lineups.away!.id, selectedMatchId!, false)}
                                className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-green-500/20"
                              >
                                Zatwierdź skład
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="bg-white/5 text-white/20 text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/10">
                            Skład nie złożony
                          </span>
                        )}
                      </div>

                      {lineups.away && (
                        <div className="space-y-6">
                          {/* Goalkeeper */}
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                              <span className="w-2 h-2 bg-blue-500 rounded-full" /> Bramkarz
                            </h4>
                            {lineups.away.players.filter(p => p.role === 'goalkeeper').map((p, idx) => (
                              <PlayerRow key={idx} player={p} />
                            ))}
                          </div>

                          {/* Starters */}
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full" /> W polu
                            </h4>
                            {lineups.away.players.filter(p => p.role === 'starter').map((p, idx) => (
                              <PlayerRow key={idx} player={p} />
                            ))}
                          </div>

                          {/* Substitutes */}
                          {lineups.away.players.some(p => p.role === 'substitute') && (
                            <div className="space-y-3">
                              <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 bg-amber-600 rounded-full" /> Rezerwa
                              </h4>
                              {lineups.away.players.filter(p => p.role === 'substitute').map((p, idx) => (
                                <PlayerRow key={idx} player={p} />
                              ))}
                            </div>
                          )}

                          {/* Reserves */}
                          {lineups.away.players.some(p => p.role === 'reserve') && (
                            <div className="space-y-3">
                              <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 bg-white/20 rounded-full" /> Trybuna
                              </h4>
                              {lineups.away.players.filter(p => p.role === 'reserve').map((p, idx) => (
                                <PlayerRow key={idx} player={p} />
                              ))}
                            </div>
                          )}
                          
                          {lineups.away.notes && (
                            <div className="mt-8 p-6 bg-black/20 rounded-3xl border border-white/5">
                              <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-3">Uwagi trenera:</p>
                              <p className="text-sm text-white/80 italic font-medium leading-relaxed">{lineups.away.notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : activeMatch ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Match Header / Score */}
                <div className="bg-[#0a1121]/90 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 md:p-12 mb-8 relative overflow-hidden shadow-2xl">
                   <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.05] to-transparent opacity-50"></div>
                   
                   <div className="relative z-10">
                      <div className="text-center text-blue-500/60 text-[9px] font-black uppercase tracking-[0.5em] mb-8 italic">
                        LIGA ORLIK • KOLEJKA {activeMatch.round}
                      </div>

                      <div className="flex items-center justify-center gap-6 md:gap-12">
                         <div className="flex flex-col items-center flex-1">
                            <div className="relative w-10 h-10 md:w-14 md:h-14 shrink-0 transition-transform hover:scale-105">
                               {homeLogo ? (
                                 <Image src={homeLogo} alt="" fill className="object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]" />
                               ) : (
                                 <Shield className="w-full h-full text-white/10" />
                               )}
                            </div>
                            <h3 className="mt-4 text-[10px] md:text-sm font-black uppercase italic tracking-tighter text-center leading-tight max-w-[100px]">{activeMatch.home_team_name}</h3>
                         </div>

                         <div className="flex flex-col items-center">
                            {activeMatch.status === 'scheduled' ? (
                               <div className="text-4xl md:text-5xl font-black text-blue-500 tracking-tighter italic opacity-80">VS</div>
                            ) : (
                               <div className="text-4xl md:text-6xl font-black text-white tracking-tighter italic tabular-nums leading-none">
                                 {liveData?.score ? `${liveData.score.home}:${liveData.score.away}` : `${activeMatch.home_score}:${activeMatch.away_score}`}
                               </div>
                            )}
                            <div className="mt-4 flex flex-col items-center">
                               <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-2 ${
                                 activeMatch.status === 'live' ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'bg-white/10 text-white/40'
                               }`}>
                                 {activeMatch.status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                                 {activeMatch.status === 'live' ? `LIVE • ${liveData?.time_display || obliczMinute(activeMatch) + "'"}` : activeMatch.status === 'scheduled' ? 'Planowany' : 'Zakończony'}
                               </span>
                            </div>
                         </div>

                         <div className="flex flex-col items-center flex-1">
                            <div className="relative w-10 h-10 md:w-14 md:h-14 shrink-0 transition-transform hover:scale-105">
                               {awayLogo ? (
                                 <Image src={awayLogo} alt="" fill className="object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]" />
                               ) : (
                                 <Shield className="w-full h-full text-white/10" />
                               )}
                            </div>
                            <h3 className="mt-4 text-[10px] md:text-sm font-black uppercase italic tracking-tighter text-center leading-tight max-w-[100px]">{activeMatch.away_team_name}</h3>
                         </div>
                      </div>

                      <div className="mt-8 flex justify-center gap-8 text-[9px] text-white/20 font-black uppercase tracking-widest border-t border-white/5 pt-6">
                         <div className="flex items-center gap-2">
                            <span>📅</span>
                            {new Date(activeMatch.scheduled_at).toLocaleDateString("pl-PL")}
                         </div>
                         <div className="flex items-center gap-2">
                            <span>⏰</span>
                            {new Date(activeMatch.scheduled_at).toLocaleTimeString("pl-PL", { hour: '2-digit', minute: '2-digit' })}
                         </div>
                      </div>
                   </div>
                </div>

                {/* Team Lineup Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {/* Home Team Card */}
                   <div className="bg-[#0c162d]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 shadow-xl ring-1 ring-white/5 relative group transition-all hover:bg-[#0c162d]/80">
                      <div className="flex items-center justify-between mb-4">
                         <div>
                            <h4 className="text-base font-black text-white uppercase italic tracking-tighter leading-none mb-1">{activeMatch.home_team_name}</h4>
                            <p className="text-[8px] text-white/30 font-black uppercase tracking-[0.2em]">Gospodarze</p>
                         </div>
                         {lineups.home ? (
                            lineups.home.is_locked ? (
                               <span className="bg-green-600/10 text-green-500 border border-green-500/20 text-[7px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest flex items-center gap-1 shadow-[0_0_15px_rgba(34,197,94,0.05)]">✅ ZATWIERDZONY</span>
                            ) : (
                               <span className="bg-blue-600/10 text-blue-500 border border-blue-500/20 text-[7px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest flex items-center gap-1 shadow-[0_0_15px_rgba(59,130,246,0.05)] animate-pulse">⏳ OCZEKUJE</span>
                            )
                         ) : (
                            <span className="bg-red-600/10 text-red-500 border border-red-500/20 text-[7px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest">❌ BRAK SKŁADU</span>
                         )}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                         {lineups.home ? (
                            <>
                               {!lineups.home.is_locked && (
                                  <button 
                                     onClick={() => handleLockLineup(lineups.home!.id, activeMatch.id, false)}
                                     className="w-full bg-green-600 hover:bg-green-700 text-white text-[9px] font-black py-3 rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-green-500/20 active:scale-95"
                                  >
                                     Zatwierdź skład
                                  </button>
                               )}
                               <button 
                                  onClick={() => setActiveTab('lineups')}
                                  className="w-full bg-white/[0.03] hover:bg-white/[0.08] text-white/50 text-[8px] font-black py-2.5 rounded-lg uppercase tracking-widest transition-all border border-white/5"
                               >
                                  Podgląd zawodników
                               </button>
                            </>
                         ) : (
                            <div className="text-[8px] text-white/10 font-black uppercase tracking-widest italic text-center py-4 border border-dashed border-white/5 rounded-xl">
                               Brak protokołu meczowego
                            </div>
                         )}
                      </div>
                   </div>

                   {/* Away Team Card */}
                   <div className="bg-[#0c162d]/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-6 shadow-xl ring-1 ring-white/5 relative group transition-all hover:bg-[#0c162d]/80">
                      <div className="flex items-center justify-between mb-4">
                         <div>
                            <h4 className="text-base font-black text-white uppercase italic tracking-tighter leading-none mb-1">{activeMatch.away_team_name}</h4>
                            <p className="text-[8px] text-white/30 font-black uppercase tracking-[0.2em]">Goście</p>
                         </div>
                         {lineups.away ? (
                            lineups.away.is_locked ? (
                               <span className="bg-green-600/10 text-green-500 border border-green-500/20 text-[7px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest flex items-center gap-1 shadow-[0_0_15px_rgba(34,197,94,0.05)]">✅ ZATWIERDZONY</span>
                            ) : (
                               <span className="bg-blue-600/10 text-blue-500 border border-blue-500/20 text-[7px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest flex items-center gap-1 shadow-[0_0_15px_rgba(59,130,246,0.05)] animate-pulse">⏳ OCZEKUJE</span>
                            )
                         ) : (
                            <span className="bg-red-600/10 text-red-500 border border-red-500/20 text-[7px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest">❌ BRAK SKŁADU</span>
                         )}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                         {lineups.away ? (
                            <>
                               {!lineups.away.is_locked && (
                                  <button 
                                     onClick={() => handleLockLineup(lineups.away!.id, activeMatch.id, false)}
                                     className="w-full bg-green-600 hover:bg-green-700 text-white text-[9px] font-black py-3 rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-green-500/20 active:scale-95"
                                  >
                                     Zatwierdź skład
                                  </button>
                               )}
                               <button 
                                  onClick={() => setActiveTab('lineups')}
                                  className="w-full bg-white/[0.03] hover:bg-white/[0.08] text-white/50 text-[8px] font-black py-2.5 rounded-lg uppercase tracking-widest transition-all border border-white/5"
                               >
                                  Podgląd zawodników
                               </button>
                            </>
                         ) : (
                            <div className="text-[8px] text-white/10 font-black uppercase tracking-widest italic text-center py-4 border border-dashed border-white/5 rounded-xl">
                               Brak protokołu meczowego
                            </div>
                         )}
                      </div>
                   </div>
                </div>

                {/* Match Controls */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  {activeMatch.status === 'scheduled' && getStartBlockReason() && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 animate-in fade-in slide-in-from-top-2 shadow-xl">
                      <div className="flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                        <div className="space-y-2">
                          <p className="text-xs text-red-500 font-black uppercase tracking-widest">Mecz zablokowany - wymagane działania</p>
                          <ul className="space-y-1">
                            {getStartBlockReason()?.map((reason, idx) => (
                              <li key={idx} className="text-[10px] text-white/60 font-black uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1 h-1 bg-red-500 rounded-full" />
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {activeMatch.status === 'scheduled' && (
                      <ControlBtn 
                        onClick={() => matchAction('start')} 
                        color="blue" 
                        icon={<Play />}
                        disabled={!!getStartBlockReason()}
                      >
                        Rozpocznij mecz
                      </ControlBtn>
                    )}
                    {activeMatch.status === 'live' && activeMatch.period === 'first_half' && (
                      <ControlBtn onClick={() => matchAction('halftime')} color="yellow" icon={<Pause />}>Ogłoś przerwę</ControlBtn>
                    )}
                    {activeMatch.status === 'live' && activeMatch.period === 'halftime' && (
                      <ControlBtn onClick={() => matchAction('second_half')} color="blue" icon={<Play />}>Wznów (2. Połowa)</ControlBtn>
                    )}
                    {activeMatch.status === 'live' && activeMatch.period === 'second_half' && (
                      <ControlBtn onClick={() => matchAction('finish')} color="red" icon={<CheckCircle />}>Zakończ mecz</ControlBtn>
                    )}
                    
                    {activeMatch.status === 'live' && (
                      <ControlBtn onClick={() => setIsExtraTimeModalOpen(true)} color="yellow" icon={<Clock />}>Dolicz czas</ControlBtn>
                    )}
                    
                    <ControlBtn onClick={() => setIsMessageModalOpen(true)} color="blue" icon={<MessageSquare className="w-5 h-5" />}>Wiadomość</ControlBtn>

                    {activeMatch.status === 'finished' && (
                      <div className="col-span-full bg-green-500/10 border border-green-500/20 p-6 rounded-3xl text-center text-green-500 font-black uppercase tracking-widest text-sm">
                        Mecz zakończony • Wynik zweryfikowany
                      </div>
                    )}
                  </div>
                </div>

                {/* Event Form */}
                {activeMatch.status === 'live' && (
                  <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10">
                     <h4 className="text-xl font-black uppercase italic tracking-tighter mb-8 flex items-center gap-3 text-blue-500">
                        <Plus className="w-6 h-6" />
                        Dodaj zdarzenie
                     </h4>
                     
                     <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-4">Typ</label>
                           <select 
                              value={eventType} 
                              onChange={(e) => setEventType(e.target.value)}
                              className="w-full bg-[#0a0f1d] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50 transition-all appearance-none"
                           >
                              <option value="goal">Gol ⚽</option>
                              <option value="penalty_goal">Karny ⚽ (G)</option>
                              <option value="penalty_missed">Karny ❌ (P)</option>
                              <option value="yellow_card">Żółta kartka 🟨</option>
                              <option value="red_card">Czerwona kartka 🟥</option>
                              <option value="substitution">Zmiana 🔄</option>
                              <option value="assist">Asysta 🅰️</option>
                              <option value="info">Info ℹ️</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-4">Drużyna</label>
                           <select 
                              value={eventTeamId || ''} 
                              onChange={(e) => {
                                 setEventTeamId(parseInt(e.target.value));
                                 setEventPlayerId(null);
                              }}
                              className="w-full bg-[#0a0f1d] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50 transition-all appearance-none"
                              required
                           >
                              <option value="">Wybierz...</option>
                              <option value={activeMatch.home_team_id}>{activeMatch.home_team_name}</option>
                              <option value={activeMatch.away_team_id}>{activeMatch.away_team_name}</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-4">Zawodnik</label>
                           <select 
                              value={eventPlayerId || ''} 
                              onChange={(e) => setEventPlayerId(parseInt(e.target.value))}
                              className="w-full bg-[#0a0f1d] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50 transition-all appearance-none"
                           >
                              <option value="">Wybierz...</option>
                              {(eventTeamId === activeMatch.home_team_id ? homePlayers : awayPlayers).map(p => (
                                 <option key={p.id} value={p.id}>#{p.jersey_number} {p.first_name} {p.last_name}</option>
                              ))}
                           </select>
                        </div>
                        <div className="flex items-end">
                           <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all uppercase tracking-tighter">
                              Dodaj
                           </button>
                        </div>
                        {eventType === 'substitution' && (
                          <div className="col-span-full space-y-2">
                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-4">Zawodnik schodzący</label>
                            <select 
                               value={eventDescription.replace('Za: ', '')}
                               onChange={(e) => setEventDescription(e.target.value ? `Za: ${e.target.value}` : '')}
                               className="w-full bg-[#0a0f1d] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
                               required
                            >
                               <option value="">Wybierz zawodnika schodzącego...</option>
                               {(eventTeamId === activeMatch.home_team_id ? homePlayers : awayPlayers)
                                 .filter(p => p.id !== eventPlayerId)
                                 .map(p => (
                                   <option key={p.id} value={`${p.first_name} ${p.last_name}`}>
                                     #{p.jersey_number} {p.first_name} {p.last_name}
                                   </option>
                                 ))
                               }
                            </select>
                          </div>
                        )}
                     </form>
                  </div>
                )}

                {/* Timeline / Events */}
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10">
                   <h4 className="text-xl font-black uppercase italic tracking-tighter mb-8 flex items-center gap-3">
                      <Timer className="w-6 h-6 text-white/20" />
                      Przebieg meczu
                   </h4>
                   
                   <div className="space-y-3">
                      {events.length === 0 ? (
                        <div className="text-center py-12 text-white/10 font-black uppercase tracking-widest text-xs italic">
                           Brak zarejestrowanych zdarzeń
                        </div>
                      ) : (
                        [...events].sort((a,b) => b.minute - a.minute).map(ev => (
                          <div key={ev.id} className="flex items-center gap-6 p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-white/[0.04] transition-all">
                             <div className="w-12 text-center shrink-0">
                                <span className="text-lg font-black text-blue-500 italic tracking-tighter">{ev.minute}'</span>
                             </div>
                             
                             <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shrink-0 shadow-inner">
                                {ev.type === 'goal' || ev.type === 'penalty_goal' ? '⚽' : 
                                 ev.type === 'yellow_card' ? '🟨' : 
                                 ev.type === 'red_card' ? '🟥' : 
                                 ev.type === 'substitution' ? '🔄' : 
                                 ev.type === 'assist' ? '🅰️' : 'ℹ️'}
                             </div>
                             
                             <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-0.5 truncate">
                                   {ev.team_name}
                                </div>
                                <div className="text-sm font-black uppercase italic tracking-tight text-white/90 truncate">
                                   {ev.player_name || 'Błąd zawodnika'} 
                                   <span className="ml-2 text-white/40 font-medium normal-case italic text-[11px]">{ev.description}</span>
                                </div>
                             </div>

                             {activeMatch.status === 'live' && (
                               <button 
                                 onClick={() => handleDeleteEvent(ev.id)}
                                 className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shrink-0 shadow-lg"
                               >
                                  <Trash2 className="w-4 h-4" />
                               </button>
                             )}
                          </div>
                        )
                      ))}
                   </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem]">
                 <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mb-8 border border-white/10">
                    <Timer className="w-12 h-12 text-white/10" />
                 </div>
                 <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4">Wybierz mecz z listy</h3>
                 <p className="text-white/40 text-xs font-bold uppercase tracking-widest max-w-xs leading-relaxed">
                    Wybierz mecz po lewej stronie, aby rozpocząć zarządzanie jego przebiegiem i czasem na żywo.
                 </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Extra Time Modal */}
      {isExtraTimeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsExtraTimeModalOpen(false)} />
          <div className="bg-[#0a0f1d] border border-white/10 w-full max-w-md rounded-[2.5rem] p-10 relative z-10 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-8">Dolicz czas</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Połowa</label>
                <select 
                  value={extraTimeHalf}
                  onChange={(e) => setExtraTimeHalf(e.target.value as any)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50 appearance-none"
                >
                  <option value="first" className="bg-[#0a0f1d]">1. Połowa</option>
                  <option value="second" className="bg-[#0a0f1d]">2. Połowa</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Liczba minut (0-30)</label>
                <input 
                  type="number"
                  min="0"
                  max="30"
                  value={extraTimeMinutes}
                  onChange={(e) => setExtraTimeMinutes(parseInt(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setIsExtraTimeModalOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white/40 font-black py-4 rounded-2xl uppercase tracking-widest text-[10px]"
                >
                  Anuluj
                </button>
                <button 
                  onClick={handleExtraTime}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl uppercase tracking-tighter shadow-lg shadow-blue-500/20"
                >
                  Zatwierdź
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {isMessageModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMessageModalOpen(false)} />
          <div className="bg-[#0a0f1d] border border-white/10 w-full max-w-xl rounded-[2.5rem] p-10 relative z-10 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-8">Wiadomość do organizatora</h3>
            <form onSubmit={handleSendMessage} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Temat</label>
                <select 
                  value={msgSubject}
                  onChange={(e) => setMsgSubject(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50 appearance-none"
                >
                  <option value="Prośba o nałożenie kary" className="bg-[#0a0f1d]">Prośba o nałożenie kary</option>
                  <option value="Naruszenie regulaminu" className="bg-[#0a0f1d]">Naruszenie regulaminu</option>
                  <option value="Incydent z zawodnikiem" className="bg-[#0a0f1d]">Incydent z zawodnikiem</option>
                  <option value="Niesportowe zachowanie" className="bg-[#0a0f1d]">Niesportowe zachowanie</option>
                  <option value="Wniosek o walkower" className="bg-[#0a0f1d]">Wniosek o walkower</option>
                  <option value="Informacja po meczu" className="bg-[#0a0f1d]">Informacja po meczu</option>
                  <option value="inne" className="bg-[#0a0f1d]">Inne (wpisz własny)</option>
                </select>
                {msgSubject === 'inne' && (
                  <input 
                    value={msgCustomSubject}
                    onChange={(e) => setMsgCustomSubject(e.target.value)}
                    placeholder="Wpisz temat..."
                    className="w-full mt-2 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50"
                    required
                  />
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Treść wiadomości</label>
                <textarea 
                  rows={5}
                  value={msgBody}
                  onChange={(e) => setMsgBody(e.target.value)}
                  placeholder="Opisz sprawę szczegółowo..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50 resize-none"
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsMessageModalOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white/40 font-black py-4 rounded-2xl uppercase tracking-widest text-[10px]"
                >
                  Anuluj
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl uppercase tracking-tighter shadow-lg shadow-blue-500/20"
                >
                  Wyślij
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}

function ControlBtn({ children, icon, color, onClick, disabled }: any) {
  const colors = {
    blue: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20',
    red: 'bg-red-600 hover:bg-red-700 shadow-red-500/20',
    yellow: 'bg-yellow-500 hover:bg-yellow-600 text-black shadow-yellow-500/20'
  };

  return (
    <button 
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-3 py-5 px-6 rounded-3xl font-black uppercase tracking-tighter italic transition-all shadow-xl ${disabled ? 'bg-white/10 text-white/60 border border-white/20 cursor-not-allowed opacity-80 saturate-[0.8]' : colors[color as keyof typeof colors]}`}
    >
      <span className="w-5 h-5">{icon}</span>
      {children}
    </button>
  );
}
