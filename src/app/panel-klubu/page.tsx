'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { 
  Users, 
  Trophy, 
  Calendar, 
  Clock, 
  FileText, 
  Send, 
  History, 
  LogOut, 
  Plus, 
  UserPlus, 
  MessageSquare,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronRight,
  Shield,
  MapPin,
  User,
  ExternalLink,
  Layout as LayoutIcon,
  Trash2,
  Save,
  RefreshCw,
  Activity,
  Award
} from 'lucide-react';
import { MainNavbar } from '@/components/main-navbar';
import { Footer } from '@/components/footer';

const API_BASE = "https://league-builder.replit.app/api";

const COUNTRIES = [
  "Polska", "Afganistan", "Albania", "Algieria", "Andora", "Angola", "Antigua i Barbuda", "Arabia Saudyjska", "Argentyna", "Armenia", "Australia", "Austria", "Azerbejdżan",
  "Bahamy", "Bahrajn", "Bangladesz", "Barbados", "Belgia", "Belize", "Benin", "Bhutan", "Białoruś", "Boliwia", "Bośnia i Hercegowina", "Botswana", "Brazylia", "Brunei", "Bułgaria", "Burkina Faso", "Burundi",
  "Chile", "Chiny", "Chorwacja", "Cypr", "Czad", "Czarnogóra", "Czechy",
  "Dania", "Demokratyczna Republika Konga", "Dominika", "Dominikana", "Dżibuti",
  "Egipt", "Ekwador", "Erytrea", "Estonia", "Eswatini", "Etiopia",
  "Fidżi", "Filipiny", "Finlandia", "Francja",
  "Gabon", "Gambia", "Ghana", "Grecja", "Grenada", "Gruzja", "Gujana", "Gwatemala", "Gwinea", "Gwinea Bissau", "Gwinea Równikowa",
  "Haiti", "Hiszpania", "Holandia", "Honduras",
  "Indie", "Indonezja", "Irak", "Iran", "Irlandia", "Islandia", "Izrael",
  "Jamajka", "Japonia", "Jemen", "Jordania",
  "Kambodża", "Kamerun", "Kanada", "Katar", "Kazachstan", "Kenia", "Kirgistan", "Kiribati", "Kolumbia", "Komory", "Kongo", "Korea Południowa", "Korea Północna", "Kostaryka", "Kuba", "Kuwejt",
  "Laos", "Lesotho", "Liban", "Liberia", "Libia", "Liechtenstein", "Litwa", "Luksemburg",
  "Łotwa",
  "Macedonia Północna", "Madagaskar", "Malawi", "Malediwy", "Malezja", "Mali", "Malta", "Maroko", "Mauretania", "Mauritius", "Meksyk", "Mikronezja", "Birma", "Mołdawia", "Monako", "Mongolia", "Mozambik",
  "Namibia", "Nauru", "Nepal", "Niemcy", "Niger", "Nigeria", "Nikaragua", "Norwegia", "Nowa Zelandia",
  "Oman",
  "Pakistan", "Palau", "Panama", "Papua-Nowa Gwinea", "Paragwaj", "Peru", "Portugalia",
  "Republika Środkowoafrykańska", "Republika Południowej Afryki", "Republika Zielonego Przylądka", "Rosja", "Rumunia", "Rwanda",
  "Saint Kitts i Nevis", "Saint Lucia", "Saint Vincent i Grenadyny", "Salwador", "Samoa", "San Marino", "Senegal", "Serbia", "Seszele", "Sierra Leone", "Singapur", "Słowacja", "Słowenia", "Somalia", "Sri Lanka", "Sudan", "Sudan Południowy", "Surinam", "Syria", "Szwajcaria", "Szwecja",
  "Tadżykistan", "Tajlandia", "Tanzania", "Togo", "Tonga", "Trynidad i Tobago", "Tunezja", "Turcja", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraina", "Urugwaj", "USA", "Uzbekistan",
  "Vanuatu", "Watykan", "Wenezuela", "Węgry", "Wielka Brytania", "Wietnam", "Włochy", "Wybrzeże Kości Słoniowej", "Wyspy Marshalla", "Wyspy Salomona", "Wyspy Świętego Tomasza i Książęca",
  "Zambia", "Zimbabwe", "Zjednoczone Emiraty Arabskie"
];

interface Player {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  jersey_number: number | null;
  nationality: string | null;
  photo_url: string | null;
}

interface Match {
  id: number;
  home_team_name: string;
  away_team_name: string;
  scheduled_at: string;
  status: string;
}

interface Request {
  id: number;
  type: 'player_add' | 'postpone' | 'appeal' | 'player_remove' | 'contact' | 'player_release';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_note: string | null;
  other_team_name?: string | null;
  other_team_response?: 'pending' | 'confirmed' | 'rejected' | null;
  other_team_message?: string | null;
  unread_for_club?: boolean;
  metadata?: any;
  created_at: string;
}

interface Announcement {
  id: number;
  title: string;
  body: string;
  pinned: boolean;
  created_at: string;
}

interface Message {
  id: number;
  message: string;
  sender_type: 'admin' | 'club' | 'other_team';
  sender_team_name: string | null;
  created_at: string;
}

interface Reply {
  id: number;
  text: string;
  sender: 'club' | 'organizer';
  created_at: string;
}

interface OrganizerMessage {
  id: number;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  replies: Reply[];
}

interface Penalty {
  id: number;
  points: number;
  reason: string;
  match_date: string | null;
  created_at: string;
}

export default function TeamPanelPage() {
  const [token, setToken] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [teamName, setTeamName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [loginTeamId, setLoginTeamId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [availableTeams, setAvailableTeams] = useState<{id: number, name: string}[]>([]);

  // Data states
  const [players, setPlayers] = useState<Player[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [inbox, setInbox] = useState<Request[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [teamLogo, setTeamLogo] = useState<string>('');

  // UI state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'announcements' | 'squad' | 'requests' | 'history' | 'inbox' | 'org_messages' | 'penalties' | 'protocol'>('dashboard');
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [organizerMessages, setOrganizerMessages] = useState<OrganizerMessage[]>([]);
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [inboxCleanedAt, setInboxCleanedAt] = useState<number>(0);
  const [announcementsCleanedAt, setAnnouncementsCleanedAt] = useState<number>(0);
  const [requestType, setRequestType] = useState<'player_add' | 'postpone' | 'appeal' | 'player_remove' | 'contact'>('player_add');

  const filteredOrganizerMessages = useMemo(() => {
    return organizerMessages.filter(m => {
      const titleLower = m.title.toLowerCase();
      const msgLower = m.message.toLowerCase();
      return !titleLower.includes('kara') && 
             !titleLower.includes('odliczenie') && 
             !msgLower.includes('odliczenie punktów');
    });
  }, [organizerMessages]);

  const penaltiesFromMessages = useMemo(() => {
    return organizerMessages
      .filter(m => {
        const titleLower = m.title.toLowerCase();
        const msgLower = m.message.toLowerCase();
        return titleLower.includes('kara') || 
               titleLower.includes('odliczenie') || 
               msgLower.includes('odliczenie punktów');
      })
      .map(m => {
        // Try to extract points from message if possible (e.g. "-1 PKT")
        let points = 1;
        const pointsMatch = m.message.match(/-(\d+)\s*PKT/i) || m.title.match(/-(\d+)\s*PKT/i);
        if (pointsMatch) points = parseInt(pointsMatch[1]);
        
        return {
          id: m.id,
          points,
          reason: m.message,
          match_date: null,
          created_at: m.created_at,
          isFromMessage: true
        };
      });
  }, [organizerMessages]);

  const allPenalties = useMemo(() => {
    // Combine official penalties and messages that are penalties
    // Use a map to avoid duplicates if ID is the same
    const map = new Map();
    penalties.forEach(p => map.set(p.id, p));
    penaltiesFromMessages.forEach(p => {
      if (!map.has(p.id)) map.set(p.id, p);
    });
    return Array.from(map.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [penalties, penaltiesFromMessages]);

  useEffect(() => {
    setInboxCleanedAt(parseInt(localStorage.getItem('inbox_cleaned_at') || '0'));
    setAnnouncementsCleanedAt(parseInt(localStorage.getItem('announcements_cleaned_at') || '0'));
  }, []);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    const now = Date.now();
    if (tab === 'inbox') {
      setInboxCleanedAt(now);
      localStorage.setItem('inbox_cleaned_at', now.toString());
    }
    if (tab === 'announcements') {
      setAnnouncementsCleanedAt(now);
      localStorage.setItem('announcements_cleaned_at', now.toString());
    }
    if (tab === 'history') {
      // Clear unreadRequestsCount by potentially setting another timestamp if needed
    }
  };
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('club_token');
    const savedTeamId = localStorage.getItem('team_id');
    const savedTeamName = localStorage.getItem('team_name');

    // Always fetch teams to be sure we have them for the login list
    const fetchTeams = async () => {
      try {
        const res = await fetch(`${API_BASE}/teams`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setAvailableTeams(data.map((t: any) => ({ id: t.id, name: t.name })));
          }
        }
      } catch (err) {
        console.error("Error fetching teams for login:", err);
      } finally {
        setLoading(false);
      }
    };

    if (savedToken && savedTeamId) {
      setToken(savedToken);
      setTeamId(Number(savedTeamId));
      setTeamName(savedTeamName || '');
      setLoading(false);
    } else {
      fetchTeams();
    }
  }, []);

  useEffect(() => {
    if (token && teamId) {
      fetchTeamData();
      fetchRequests();
      fetchInbox();
      fetchOrganizerMessages();
      fetchPenalties();

      // Add polling for all club management data
      const pollInterval = setInterval(() => {
        fetchRequests();
        fetchInbox();
        fetchOrganizerMessages();
        fetchPenalties();
      }, 10000); // Update every 10 seconds

      return () => clearInterval(pollInterval);
    }
  }, [token, teamId, fetchTeamData, fetchRequests, fetchInbox, fetchOrganizerMessages, fetchPenalties]);

  useEffect(() => {
    fetchAnnouncements();
    
    // Poll announcements every 30 seconds to catch new ones
    const annInterval = setInterval(fetchAnnouncements, 30000);
    return () => clearInterval(annInterval);
  }, [fetchAnnouncements]);

  const fetchOrganizerMessages = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/clubs/messages?team_id=${teamId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrganizerMessages(Array.isArray(data) ? data : (data.messages || []));
      }
    } catch (err) {
      console.error('Error fetching organizer messages:', err);
    }
  }, [token, teamId]);

  const markMessageRead = useCallback(async (id: number) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/clubs/messages/${id}/read?team_id=${teamId}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchOrganizerMessages();
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  }, [token, teamId, fetchOrganizerMessages]);

  const handleReplyOrganizer = useCallback(async (id: number, text: string) => {
    if (!token || !text.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/clubs/messages/${id}/reply?team_id=${teamId}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ text })
      });
      if (res.ok) fetchOrganizerMessages();
    } catch (err) {
      console.error('Error replying to organizer message:', err);
    }
  }, [token, teamId, fetchOrganizerMessages]);

  const fetchPenalties = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/clubs/penalties?team_id=${teamId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPenalties(Array.isArray(data) ? data : (data.penalties || []));
      }
    } catch (err) {
      console.error('Error fetching penalties:', err);
    }
  }, [token, teamId]);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/announcements`);
      if (res.ok) {
        const data = await res.json();
        
        // Alert if new announcement arrived (only if not first load)
        if (announcements.length > 0 && data.length > announcements.length) {
          const newAnn = data[0]; // Assuming newest is first
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
             new Notification("Ogłoszenie od DLPN 1 Liga", { body: newAnn.title });
          }
        }
        
        setAnnouncements(data);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
    }
  }, [announcements.length]);

  const fetchTeamData = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/teams`);
      if (res.status === 401) return handleLogout();
      const allTeams = await res.json();
      const myTeam = allTeams.find((t: any) => Number(t.id) === Number(teamId));
      if (myTeam) {
        setPlayers(myTeam.players || []);
        setTeamLogo(myTeam.logo_url || '');
      }
        
      // Use authorized endpoint for matches
      const matchesRes = await fetch(`${API_BASE}/clubs/matches`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (matchesRes.ok) {
        const teamMatches = await matchesRes.json();
        setUpcomingMatches(teamMatches
          .filter((m: any) => m.status === 'scheduled')
          .sort((a: any, b: any) => 
            new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
          )
        );
      }
    } catch (err) {
      console.error('Error fetching team data:', err);
    }
  }, [token, teamId]);

  const fetchRequests = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/clubs/requests?team_id=${teamId}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.status === 401) return handleLogout();
      if (res.ok) {
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : (data.requests || []));
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  }, [token, teamId]);

  const fetchInbox = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/clubs/inbox?team_id=${teamId}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.status === 401) return handleLogout();
      if (res.ok) {
        const data = await res.json();
        setInbox(Array.isArray(data) ? data : (data.inbox || []));
      }
    } catch (err) {
      console.error('Error fetching inbox:', err);
    }
  }, [token, teamId]);

  const fetchMessages = useCallback(async (requestId: number) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/clubs/requests/${requestId}/messages?team_id=${teamId}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.status === 401) return handleLogout();
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : (data.messages || []));
        // Refresh both requests and inbox to update unread badges everywhere
        fetchRequests();
        fetchInbox();
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  }, [token, teamId, fetchRequests, fetchInbox]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedRequestId || !newMessage.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/clubs/requests/${selectedRequestId}/messages?team_id=${teamId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ message: newMessage }),
      });
      if (res.status === 401) return handleLogout();
      if (res.ok) {
        setNewMessage('');
        fetchMessages(selectedRequestId);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const respondToPostpone = async (requestId: number, response: 'confirmed' | 'rejected', message?: string) => {
    if (!token) return;
    setSubmittingId(requestId);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/clubs/postpone/${requestId}/respond?team_id=${teamId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ response, message }),
      });
      if (res.status === 401) return handleLogout();
      if (res.ok) {
        setSuccessMessage('Odpowiedź została wysłana');
        await fetchInbox();
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || 'Błąd podczas wysyłania odpowiedzi');
      }
    } catch (err) {
      console.error('Error responding to postpone:', err);
      setError('Błąd połączenia z serwerem');
    } finally {
      setSubmittingId(null);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isChatOpen && selectedRequestId) {
      fetchMessages(selectedRequestId);
      interval = setInterval(() => {
        fetchMessages(selectedRequestId);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isChatOpen, selectedRequestId, fetchMessages]);

  const handleReleasePlayer = async (player: Player) => {
    const reason = prompt(`Czy na pewno chcesz zwolnić zawodnika ${player.first_name} ${player.last_name}?\n\nPodaj uzasadnienie (opcjonalne):`);
    if (reason === null) return;

    setAuthLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/clubs/requests?team_id=${teamId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          team_id: teamId,
          type: "player_release",
          title: `Zwolnienie zawodnika: ${player.first_name} ${player.last_name}`,
          description: reason || "Proszę o wykreślenie zawodnika ze składu.",
          metadata: {
            player_id: player.id
          }
        }),
      });

      if (res.ok) {
        setSuccessMessage(`Wniosek o zwolnienie ${player.first_name} ${player.last_name} został wysłany`);
        fetchRequests();
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setError('Błąd podczas wysyłania wniosku');
      }
    } catch (err) {
      setError('Błąd połączenia');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/clubs/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team_id: Number(loginTeamId), password: loginPassword }),
      });

      if (res.ok) {
        const data = await res.json();
        // Snippet uses team_id/team_name, but we support fallback to id/name
        const token = data.token;
        const finalTeamId = data.team_id || data.id;
        const finalTeamName = data.team_name || data.name;

        if (token && finalTeamId) {
          localStorage.setItem('club_token', token);
          localStorage.setItem('team_id', finalTeamId.toString());
          localStorage.setItem('team_name', finalTeamName || '');
          setToken(token);
          setTeamId(Number(finalTeamId));
          setTeamName(finalTeamName || '');
        } else {
          setError('Błąd autoryzacji: brak danych w odpowiedzi');
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || 'Błędny ID drużyny lub hasło');
      }
    } catch (err) {
      setError('Wystąpił błąd połączenia');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('club_token');
    localStorage.removeItem('team_id');
    localStorage.removeItem('team_name');
    setToken(null);
    setTeamId(null);
    setTeamName('');
    
    // Re-fetch teams for login after logout
    fetch(`${API_BASE}/teams?season_id=1`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAvailableTeams(data.map((t: any) => ({ id: t.id, name: t.name })));
        }
      });
  };

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setSuccessMessage(null);
    setAuthLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const type = formData.get('type') as string;
    const title = formData.get('title') as string;
    
    const body: any = {
      type,
      title: title || '',
      description: formData.get('description'),
    };

    if (type === 'player_add') {
      const pName = formData.get('player_name');
      const bDate = formData.get('birth_date');
      const jNum = formData.get('jersey_number');
      const country = formData.get('country');
      const height = formData.get('height');
      const foot = formData.get('preferred_foot');
      const pos = formData.get('position');

      body.title = `Zgłoszenie zawodnika: ${pName}`;
      body.description = `Imię i nazwisko: ${pName}\nData urodzenia: ${bDate}\nNumer na koszulce: ${jNum}\nKraj pochodzenia: ${country}\nPozycja: ${pos}\nWzrost: ${height} cm\nLepsza noga: ${foot === 'right' ? 'Prawa' : (foot === 'left' ? 'Lewa' : 'Obie')}`;
      
      body.metadata = {
        player_name: pName,
        birth_date: bDate,
        jersey_number: parseInt(jNum as string),
        country: country,
        position: pos,
        height: parseInt(height as string),
        preferred_foot: foot,
        photo_base64: photoBase64,
        photo_filename: photoName
      };
    } else if (type === 'postpone') {
      const match = upcomingMatches.find((m: any) => m.id.toString() === formData.get('match_id'));
      const newDate = formData.get('new_date');
      body.title = `Prośba o przełożenie: ${match?.home_team_name} vs ${match?.away_team_name}`;
      body.description = `Mecz: ${match?.home_team_name} vs ${match?.away_team_name}\nObecny termin: ${new Date(match?.scheduled_at || '').toLocaleString()}\nProponowany nowy termin: ${newDate}\nPowód: ${formData.get('description')}`;
      body.metadata = {
        match_id: formData.get('match_id'),
        new_date: newDate,
        reason: formData.get('description'),
      };
    } else if (type === 'player_remove') {
      const pId = formData.get('player_id');
      const player = players.find(p => p.id.toString() === pId);
      body.title = `Zwolnienie zawodnika: ${player?.first_name} ${player?.last_name}`;
      body.description = `Wniosek o zwolnienie zawodnika: ${player?.first_name} ${player?.last_name} (ID: ${pId})\nPowód: ${formData.get('description')}`;
      body.metadata = {
        player_id: pId,
        player_name: `${player?.first_name} ${player?.last_name}`,
        reason: formData.get('description'),
      };
    } else if (type === 'appeal') {
      body.title = `Odwołanie od kary: ${formData.get('title')}`;
    } else if (type === 'contact') {
      body.title = `Kontakt: ${formData.get('title')}`;
    }

    try {
      const res = await fetch(`${API_BASE}/clubs/requests?team_id=${teamId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSuccessMessage('Wniosek został wysłany pomyślnie');
        setPhotoBase64(null);
        setPhotoName(null);
        fetchRequests();
        setTimeout(() => setSuccessMessage(null), 5000);
        (e.target as HTMLFormElement).reset();
        setActiveTab('dashboard');
      } else {
        setError('Błąd podczas wysyłania wniosku');
      }
    } catch (err) {
      setError('Błąd połączenia');
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-black relative flex flex-col items-center justify-center p-4">
        {/* Background elements to match home page */}
        <div className="fixed inset-0 z-0 pointer-events-none">
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

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
            <div className="flex flex-col items-center mb-10">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter text-center">Panel Drużyny</h1>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2">Zaloguj się do swojego klubu</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">ID Drużyny</label>
                <div className="relative group">
                  <select 
                    value={loginTeamId}
                    onChange={(e) => setLoginTeamId(e.target.value)}
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
                    required
                  >
                    <option value="" className="bg-[#0a0f1d] text-white">Wybierz swój klub</option>
                    {availableTeams.sort((a,b) => a.name.localeCompare(b.name)).map(team => (
                      <option key={team.id} value={team.id} className="bg-[#0a0f1d] text-white">
                        {team.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 group-hover:text-blue-500 transition-colors">
                    <ChevronRight className="w-5 h-5 rotate-90" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Hasło</label>
                <input 
                  type="password" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/10"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-500 text-xs font-bold uppercase">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  BŁĘDNY ID DRUŻYNY LUB HASŁO
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
          
          <p className="text-center text-white/20 text-[10px] font-bold uppercase tracking-widest mt-8">
            Wsparcie techniczne: kontakt@pff24.pl
          </p>
        </div>
      </div>
    );
  }

  const unreadRequestsCount = requests.filter(r => r.unread_for_club).length;
  const unreadInboxCount = inbox.filter(r => r.unread_for_club && new Date(r.created_at).getTime() > inboxCleanedAt).length;
  const unreadAnnouncementsCount = announcements.filter(a => 
    new Date(a.created_at).getTime() > announcementsCleanedAt && 
    new Date(a.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000
  ).length;

  return (
    <main className="bg-black min-h-screen text-white font-sans selection:bg-blue-500/30 relative">
      <MainNavbar />
      
      {/* Background elements to match home page */}
      <div className="fixed inset-0 z-0 pointer-events-none">
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

      <div className="container mx-auto px-4 pt-44 pb-32 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 sticky top-44">
              <div className="flex flex-col items-center mb-10">
                <div className="w-24 h-24 rounded-full bg-white/10 p-4 border border-white/10 mb-6 shadow-xl relative overflow-hidden">
                  {teamLogo ? (
                    <img src={teamLogo} alt={teamName} className="w-full h-full object-contain relative z-10" />
                  ) : (
                    <Shield className="w-full h-full text-white/10" />
                  )}
                </div>
                <h2 className="text-xl font-black text-white italic uppercase tracking-tighter text-center leading-tight">{teamName}</h2>
                <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest mt-2">Panel Autoryzowany</span>
              </div>

              <div className="space-y-2">
                <NavButton active={activeTab === 'dashboard'} onClick={() => handleTabChange('dashboard')} icon={<LayoutIcon className="w-5 h-5" />}>Dashboard</NavButton>
                <NavButton 
                  active={activeTab === 'announcements'} 
                  onClick={() => handleTabChange('announcements')} 
                  icon={<MessageSquare className="w-5 h-5" />}
                  badge={unreadAnnouncementsCount > 0 ? unreadAnnouncementsCount : null}
                >
                  Ogłoszenia
                </NavButton>
                <NavButton 
                  active={activeTab === 'org_messages'} 
                  onClick={() => handleTabChange('org_messages')} 
                  icon={<Send className="w-5 h-5" />}
                  badge={filteredOrganizerMessages.filter(m => !m.read).length || null}
                >
                  Wiadomości
                </NavButton>
                <NavButton 
                  active={activeTab === 'penalties'} 
                  onClick={() => handleTabChange('penalties')} 
                  icon={<AlertCircle className="w-5 h-5" />}
                  badge={allPenalties.length || null}
                >
                  Kary
                </NavButton>
                <NavButton 
                  active={activeTab === 'history'} 
                  onClick={() => handleTabChange('history')} 
                  icon={<FileText className="w-5 h-5" />}
                  badge={unreadRequestsCount > 0 ? unreadRequestsCount : null}
                >
                  Moje Wnioski
                </NavButton>
                <NavButton 
                  active={activeTab === 'inbox'} 
                  onClick={() => handleTabChange('inbox')} 
                  icon={<History className="w-5 h-5" />}
                  badge={unreadInboxCount > 0 ? unreadInboxCount : null}
                >
                  Inbox
                </NavButton>
                <NavButton active={activeTab === 'squad'} onClick={() => handleTabChange('squad')} icon={<Users className="w-5 h-5" />}>Skład Drużyny</NavButton>
                <NavButton active={activeTab === 'protocol'} onClick={() => handleTabChange('protocol')} icon={<FileText className="w-5 h-5 text-green-500" />}>Protokół Meczowy</NavButton>
                <NavButton active={activeTab === 'requests'} onClick={() => handleTabChange('requests')} icon={<Send className="w-5 h-5" />}>Złóż Wniosek</NavButton>
                
                <div className="pt-8 mt-8 border-t border-white/5">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all text-sm font-black uppercase tracking-widest"
                  >
                    <LogOut className="w-5 h-5" />
                    Wyloguj
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {(successMessage || error) && (
              <div className="mb-8 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                {successMessage && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 flex items-center gap-4 text-green-500 text-sm font-black uppercase italic tracking-tight">
                    <CheckCircle className="w-6 h-6 shrink-0" />
                    {successMessage}
                  </div>
                )}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-center gap-4 text-red-500 text-sm font-black uppercase italic tracking-tight">
                    <AlertCircle className="w-6 h-6 shrink-0" />
                    {error}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'dashboard' && <Dashboard teamName={teamName} upcomingMatches={upcomingMatches} playersCount={players.length} requests={requests} announcements={announcements} />}
            {activeTab === 'announcements' && <AnnouncementsList announcements={announcements} />}
            {activeTab === 'squad' && <Squad players={players} requests={requests} onRelease={handleReleasePlayer} />}
            {activeTab === 'requests' && (
              <RequestForm 
                upcomingMatches={upcomingMatches} 
                players={players}
                requestType={requestType} 
                setRequestType={setRequestType} 
                onSubmit={submitRequest}
                onCancel={() => setActiveTab('dashboard')}
                successMessage={successMessage}
                error={error}
                onPhotoChange={handlePhotoChange}
                photoBase64={photoBase64}
                photoName={photoName}
              />
            )}
            {activeTab === 'history' && <RequestHistory requests={requests} onSelectRequest={(id) => { setSelectedRequestId(id); setIsChatOpen(true); }} />}
            {activeTab === 'inbox' && <InboxList inbox={inbox} onRespond={respondToPostpone} onSelectRequest={(id) => { setSelectedRequestId(id); setIsChatOpen(true); }} submittingId={submittingId} inboxCleanedAt={inboxCleanedAt} />}
            {activeTab === 'org_messages' && <OrganizerMessagesList messages={filteredOrganizerMessages} onMarkRead={markMessageRead} onReply={handleReplyOrganizer} />}
            {activeTab === 'penalties' && <PenaltiesList penalties={allPenalties} />}
            {activeTab === 'protocol' && (
              <LineupProtocol 
                token={token} 
                teamId={teamId} 
                teamName={teamName} 
                onLogout={handleLogout} 
              />
            )}
          </div>
        </div>
      </div>
      
      {isChatOpen && selectedRequestId && (
        <ChatWindow 
          requestId={selectedRequestId} 
          messages={messages} 
          newMessage={newMessage} 
          setNewMessage={setNewMessage} 
          onSendMessage={sendMessage} 
          onClose={() => setIsChatOpen(false)}
          requestTitle={requests.find(r => r.id === selectedRequestId)?.title || inbox.find(r => r.id === selectedRequestId)?.title || 'Wątek wiadomości'}
        />
      )}
      
      <Footer />
    </main>
  );
}

function NavButton({ children, icon, active, onClick, badge }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all text-sm font-black uppercase tracking-widest relative ${
        active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      {children}
      {badge && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full min-w-[1.25rem] text-center shadow-lg shadow-red-500/20">
          {badge}
        </span>
      )}
    </button>
  );
}

function Dashboard({ teamName, upcomingMatches, playersCount, requests, announcements }: any) {
  const nextMatch = upcomingMatches[0];
  const [now, setNow] = useState(new Date());
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = new Date();
      setNow(currentTime);
      
      if (nextMatch) {
        const target = new Date(nextMatch.scheduled_at).getTime();
        const diff = target - currentTime.getTime();
        
        if (diff > 0) {
          setTimeLeft({
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000)
          });
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [nextMatch]);

  const recentAnnouncements = [...announcements]
    .sort((a,b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Twoja Kadra" value={playersCount} icon={<Users className="w-6 h-6" />} color="blue" />
        <StatCard label="Wnioski" value={requests.length} icon={<FileText className="w-6 h-6" />} color="blue" />
        <StatCard label="Następny Mecz" value={nextMatch ? `ZA ${timeLeft.days}D ${timeLeft.hours}H` : 'BRAK'} icon={<Trophy className="w-6 h-6" />} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10">
          <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-8 flex items-center gap-3">
            <Clock className="w-6 h-6 text-blue-500" />
            Aktualny Czas
          </h3>
          <div className="space-y-4">
            <div className="text-5xl font-black text-white italic tracking-tighter tabular-nums">
              {now.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-white/40 font-black uppercase tracking-widest text-sm">
              {now.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        {nextMatch && (
          <div className="bg-blue-600 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl shadow-blue-600/20">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Trophy className="w-32 h-32" />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">Najbliższy Mecz</span>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mt-2 leading-none">
                  {nextMatch.home_team_name} vs {nextMatch.away_team_name}
                </h3>
                <div className="flex gap-4 mt-4">
                   <TimeBlock value={timeLeft.days} label="DNI" />
                   <TimeBlock value={timeLeft.hours} label="GODZ" />
                   <TimeBlock value={timeLeft.minutes} label="MIN" />
                   <TimeBlock value={timeLeft.seconds} label="SEK" />
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between">
                <div>
                  <div className="text-white font-black text-lg uppercase tracking-tight italic">
                    {new Date(nextMatch.scheduled_at).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}
                  </div>
                  <div className="text-white/60 text-[10px] font-black uppercase tracking-widest">
                    {new Date(nextMatch.scheduled_at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })} • Działdowo
                  </div>
                </div>
                <div className="bg-white text-blue-600 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest italic">
                  Zapowiedź
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10">
        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-8">Informacje i Ogłoszenia</h3>
        <div className="space-y-4">
           {recentAnnouncements.length > 0 ? (
             recentAnnouncements.map(a => (
               <div key={a.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl group">
                 <div className="flex items-start gap-4">
                   <div className={`w-1 h-10 rounded-full flex-shrink-0 ${a.pinned ? 'bg-red-500 shadow-lg shadow-red-500/50' : 'bg-blue-600'}`} />
                   <div>
                     <div className="flex items-center gap-3 mb-1">
                       <h4 className="text-xs font-black uppercase tracking-widest text-white italic">
                         {a.pinned && <span className="mr-2">📌</span>}
                         {a.title}
                       </h4>
                       <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">
                         Organizator DLPN
                       </span>
                     </div>
                     <p className="text-[11px] text-white/70 uppercase font-black tracking-tight line-clamp-2">
                       {a.body}
                     </p>
                     <div className="mt-2 flex items-center gap-3">
                        <div className="text-[8px] text-white/20 font-bold uppercase tracking-widest">
                          Nadano: {new Date(a.created_at).toLocaleDateString()} • DLPN 1 Liga
                        </div>
                        {new Date(a.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000 && (
                          <span className="bg-red-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase animate-pulse">NOWE</span>
                        )}
                     </div>
                   </div>
                 </div>
               </div>
             ))
           ) : (
             <div className="text-white/20 text-xs font-black uppercase tracking-widest py-10 text-center italic">Brak nowych ogłoszeń</div>
           )}
        </div>
      </div>
    </div>
  );
}

function AnnouncementsList({ announcements }: { announcements: Announcement[] }) {
  const sorted = [...announcements].sort((a,b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Ogłoszenia</h3>
      <div className="grid grid-cols-1 gap-6">
        {sorted.map(a => (
          <div key={a.id} className={`bg-white/5 backdrop-blur-2xl border rounded-[2rem] p-8 transition-all ${a.pinned ? 'border-red-500/30 bg-red-500/[0.02]' : 'border-white/10'}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${a.pinned ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                {a.pinned ? <AlertCircle className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
              </div>
              <div>
                <h4 className="text-white font-black text-xl uppercase italic tracking-tight leading-none">
                  {a.pinned && <span className="mr-2">📌</span>}
                  {a.title}
                </h4>
                <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest mt-1 flex items-center gap-3">
                  Ogłoszenie od DLPN 1 Liga • {new Date(a.created_at).toLocaleString('pl-PL')}
                  {new Date(a.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000 && (
                    <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase animate-pulse">NOWE</span>
                  )}
                </p>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line font-bold uppercase tracking-tight">
              {a.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Squad({ players, requests, onRelease }: { players: Player[], requests: Request[], onRelease: (player: Player) => void }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Twoja Kadra</h3>
        <div className="bg-blue-600/10 border border-blue-500/20 px-6 py-2 rounded-full text-[10px] font-black text-blue-500 uppercase tracking-widest">
          {players.length} ZAWODNIKÓW
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.map(p => {
          const fullName = `${p.first_name} ${p.last_name}`;
          const pendingRelease = requests.find(r => {
            if (r.status !== 'pending') return false;
            if (r.type !== 'player_release' && r.type !== 'player_remove') return false;
            
            // 1. Sprawdź metadata (obsługa obiektu i stringa)
            let mData = r.metadata;
            if (typeof mData === 'string') {
              try { mData = JSON.parse(mData); } catch(e) { mData = {}; }
            }
            
            const matchId = mData?.player_id?.toString() === p.id.toString();
            
            // 2. Fallback: Sprawdź czy nazwisko lub opis zawiera dane
            const matchTitle = r.title.toLowerCase().includes(p.last_name.toLowerCase()) || 
                               r.title.toLowerCase().includes(p.first_name.toLowerCase());
            const matchDesc = r.description?.toLowerCase().includes(p.last_name.toLowerCase());
            
            return matchId || matchTitle || matchDesc;
          });
          
          return (
            <div key={p.id} className={`bg-white/5 backdrop-blur-2xl border rounded-3xl p-6 group hover:bg-white/[0.08] transition-all relative overflow-hidden ${pendingRelease ? 'border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.2)]' : 'border-white/10'}`}>
              {pendingRelease && (
                <div className="absolute top-0 left-0 right-0 bg-red-600 text-white py-1 flex items-center justify-center gap-2 z-[60] shadow-lg">
                  <AlertCircle className="w-3 h-3 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Wniosek w toku</span>
                </div>
              )}
              
              <div className={`flex items-center gap-5 ${pendingRelease ? 'mt-8' : ''}`}>
                <div className="w-16 h-16 rounded-2xl bg-white/10 overflow-hidden border border-white/10 shadow-lg shrink-0 relative">
                  {p.photo_url ? (
                    <img src={p.photo_url} alt={fullName} className="w-full h-full object-cover" />
                  ) : (
                    <img src="https://i.ibb.co/S7RD8ZHj/images-removebg-preview-1.png" alt="Placeholder" className="w-full h-full object-contain opacity-80 scale-125" />
                  )}
                  
                  {/* BARDZO WIDOCZNA KROPKA */}
                  {pendingRelease && (
                    <div className="absolute -top-1 -right-1 z-[70] flex h-5 w-5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-5 w-5 bg-red-600 border-2 border-white items-center justify-center">
                        <span className="text-[8px] text-white font-bold">!</span>
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-black text-lg uppercase italic tracking-tight group-hover:text-blue-400 transition-colors leading-tight truncate">
                      {fullName}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest">{p.position}</span>
                    <span className="text-white/20 text-[10px]">•</span>
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">NR {p.jersey_number || '-'}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                {pendingRelease ? (
                  <div className="flex items-center gap-2 text-yellow-500 font-black text-[10px] uppercase tracking-widest italic bg-yellow-500/10 px-3 py-1.5 rounded-lg w-full justify-center">
                    <Clock className="w-3 h-3" />
                    Wniosek w toku
                  </div>
                ) : (
                  <button 
                    onClick={() => onRelease(p)}
                    className="w-full bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 transition-all py-2 rounded-xl text-[10px] font-black uppercase tracking-widest italic flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-3 h-3 rotate-45" />
                    Zwolnij zawodnika
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RequestForm({ upcomingMatches, players, requestType, setRequestType, onSubmit, onCancel, successMessage, error, onPhotoChange, photoBase64, photoName }: any) {
  return (
    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-10">Złóż nowy wniosek</h3>
      
      <div className="space-y-2 mb-10">
        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Typ wniosku</label>
        <div className="relative group">
          <select 
            value={requestType}
            onChange={(e) => setRequestType(e.target.value as any)}
            className="w-full bg-[#0a0f1d] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
          >
            <option value="player_add" className="bg-[#0a0f1d] text-white">Zgłoszenie zawodnika</option>
            <option value="player_remove" className="bg-[#0a0f1d] text-white">Zwolnienie zawodnika</option>
            <option value="postpone" className="bg-[#0a0f1d] text-white">Prośba o przełożenie meczu</option>
            <option value="appeal" className="bg-[#0a0f1d] text-white">Odwołanie od kary</option>
            <option value="contact" className="bg-[#0a0f1d] text-white">Kontakt z organizatorami</option>
          </select>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 group-hover:text-blue-500 transition-colors">
            <ChevronRight className="w-5 h-5 rotate-90" />
          </div>
        </div>
        <div className="mt-4 px-6 py-3 bg-white/[0.02] border border-white/5 rounded-xl">
           <p className="text-white/30 text-[10px] font-medium tracking-tight">
             {requestType === 'player_add' && "Wypełnij dane zawodnika, który ma zostać zgłoszony do rozgrywek."}
             {requestType === 'player_remove' && "Wybierz zawodnika z kadry, którego chcesz zwolnić z klubu."}
             {requestType === 'postpone' && "Wybierz mecz, który chcesz przełożyć, podaj proponowany nowy termin i powód."}
             {requestType === 'appeal' && "Opisz szczegółowo odwołanie — podaj numer meczu, zawodnika oraz uzasadnienie."}
             {requestType === 'contact' && "Wyślij wiadomość bezpośrednio do organizatorów ligi."}
           </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        <input type="hidden" name="type" value={requestType} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {requestType === 'player_add' && (
             <>
               <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Imię i nazwisko</label>
                <input name="player_name" required placeholder="np. Jan Kowalski" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Data urodzenia</label>
                <input type="date" name="birth_date" required placeholder="dd.mm.rrrr" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50 transition-all [color-scheme:dark] placeholder:text-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Numer na koszulce</label>
                <input type="number" name="jersey_number" required placeholder="np. 10" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Pozycja</label>
                <select name="position" className="w-full bg-[#0a0f1d] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer">
                  <option value="" className="bg-[#0a0f1d] text-white">Wybierz</option>
                  <option value="GK" className="bg-[#0a0f1d] text-white">Bramkarz</option>
                  <option value="DEF" className="bg-[#0a0f1d] text-white">Obrońca</option>
                  <option value="MID" className="bg-[#0a0f1d] text-white">Pomocnik</option>
                  <option value="ATT" className="bg-[#0a0f1d] text-white">Napastnik</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Kraj pochodzenia</label>
                <select name="country" required className="w-full bg-[#0a0f1d] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer">
                  <option value="" className="bg-[#0a0f1d] text-white">Wybierz kraj...</option>
                  {COUNTRIES.map(country => (
                    <option key={country} value={country} className="bg-[#0a0f1d] text-white">
                      {country.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-1 md:col-span-2 space-y-4">
                 <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4 flex items-center gap-2">
                   <Clock className="w-3 h-3" />
                   Zdjęcie zawodnika (opcjonalnie)
                 </label>
                 <label className="flex flex-col items-center justify-center gap-4 p-10 bg-white/[0.01] border-2 border-dashed border-white/5 hover:border-blue-500/30 rounded-3xl cursor-pointer transition-all group">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-600/10 transition-colors">
                       {photoBase64 ? (
                         <img src={photoBase64} alt="Preview" className="w-full h-full object-cover rounded-full" />
                       ) : (
                         <LayoutIcon className="w-8 h-8 text-white/20 group-hover:text-blue-500" />
                       )}
                    </div>
                    <div className="text-center">
                       <p className="text-white font-bold text-sm group-hover:text-blue-400 transition-colors">Kliknij aby dodać zdjęcie</p>
                       <p className="text-white/20 text-[10px] uppercase font-black tracking-widest mt-1">JPG, PNG, WEBP • maks. 5 MB</p>
                    </div>
                    <input type="file" accept="image/*" onChange={onPhotoChange} className="hidden" />
                 </label>
                 <p className="text-white/20 text-[10px] font-medium italic">Zdjęcie zostanie załączone do wniosku i udostępnione do pobrania dla administratora ligi.</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Wzrost (cm)</label>
                <input type="number" name="height" placeholder="np. 175" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/10" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Lepsza noga</label>
                <select name="preferred_foot" className="w-full bg-[#0a0f1d] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer">
                  <option value="" className="bg-[#0a0f1d] text-white">Wybierz</option>
                  <option value="right" className="bg-[#0a0f1d] text-white">Prawa</option>
                  <option value="left" className="bg-[#0a0f1d] text-white">Lewa</option>
                  <option value="both" className="bg-[#0a0f1d] text-white">Obie</option>
                </select>
              </div>
             </>
          )}

          {requestType === 'player_remove' && (
             <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Wybierz zawodnika</label>
                <select name="player_id" required className="w-full bg-[#0a0f1d] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer">
                  <option value="" className="bg-[#0a0f1d] text-white">Wybierz zawodnika z listy...</option>
                  {players.sort((a:any, b:any) => a.last_name.localeCompare(b.last_name)).map((p: any) => (
                    <option key={p.id} value={p.id} className="bg-[#0a0f1d] text-white">
                      {p.first_name} {p.last_name} (NR {p.jersey_number || '-'})
                    </option>
                  ))}
                </select>
             </div>
          )}

          {requestType === 'postpone' && (
            <>
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Mecz do przełożenia</label>
                <select name="match_id" required className="w-full bg-[#0a0f1d] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer">
                  <option value="" className="bg-[#0a0f1d] text-white">Wybierz mecz...</option>
                  {upcomingMatches.map((m: any) => (
                    <option key={m.id} value={m.id} className="bg-[#0a0f1d] text-white">
                      {m.home_team_name} vs {m.away_team_name} ({new Date(m.scheduled_at).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Proponowany nowy termin</label>
                <input type="datetime-local" name="new_date" required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50 transition-all [color-scheme:dark]" />
              </div>
            </>
          )}

          {(requestType === 'appeal' || requestType === 'contact') && (
             <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Tytuł wiadomości</label>
                <input name="title" required placeholder={requestType === 'appeal' ? "np. Odwołanie od kary mecz nr 14" : "np. Zapytanie o regulamin"} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/10" />
              </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">
            {requestType === 'player_add' ? 'Dodatkowe uwagi' : 
             requestType === 'player_remove' ? 'Powód zwolnienia' :
             requestType === 'postpone' ? 'Powód zmiany terminu' : 
             requestType === 'appeal' ? 'Treść odwołania' : 'Treść wiadomości'}
          </label>
          <textarea 
            name="description" 
            required={requestType !== 'player_add'} 
            rows={requestType === 'appeal' || requestType === 'contact' ? 6 : 4} 
            placeholder={
              requestType === 'player_add' ? 'Opcjonalne uwagi do zgłoszenia...' : 
              requestType === 'player_remove' ? 'Opisz powód zwolnienia zawodnika...' :
              requestType === 'postpone' ? 'Opisz przyczynę prośby o przełożenie meczu...' : 
              requestType === 'appeal' ? 'np. Odwołanie dotyczy czerwonej kartki dla zawodnika Jana Kowalskiego w meczu nr 5 z dnia 10.06...' : 
              'Wpisz treść wiadomości do organizatorów...'
            } 
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/10" 
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-500 text-xs font-bold uppercase">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3 text-green-500 text-xs font-bold uppercase">
            <CheckCircle className="w-4 h-4" />
            {successMessage}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-black px-12 py-5 rounded-2xl transition-all shadow-lg shadow-blue-500/20 uppercase tracking-tighter flex items-center justify-center gap-3">
            <Send className="w-5 h-5" />
            Wyślij wniosek
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            className="px-8 py-5 text-white/40 hover:text-white font-black uppercase tracking-widest transition-all"
          >
            Anuluj
          </button>
        </div>
      </form>
    </div>
  );
}

function RequestHistory({ requests, onSelectRequest }: { requests: Request[], onSelectRequest: (id: number) => void }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
       <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Moje Wnioski</h3>
       
       <div className="space-y-4">
         {requests.length === 0 ? (
           <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center">
             <p className="text-white/20 font-black uppercase tracking-widest text-xs italic">Brak wysłanych wniosków</p>
           </div>
         ) : (
           [...requests].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(r => (
             <div 
               key={r.id} 
               onClick={() => onSelectRequest(r.id)}
               className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 hover:bg-white/[0.08] transition-all cursor-pointer relative overflow-hidden group"
             >
               {r.unread_for_club && (
                 <div className="absolute top-0 right-0 bg-blue-600 text-white text-[8px] font-black px-4 py-1 uppercase tracking-widest shadow-lg">
                   Nowa wiadomość
                 </div>
               )}
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div className="flex items-start gap-6">
                   <div className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center border shadow-lg ${
                     r.status === 'approved' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                     r.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                     'bg-blue-500/10 border-blue-500/20 text-blue-500'
                   }`}>
                     {r.type === 'player_add' ? <UserPlus className="w-6 h-6" /> : 
                      r.type === 'player_remove' ? <User className="w-6 h-6" /> :
                      r.type === 'postpone' ? <Calendar className="w-6 h-6" /> : 
                      r.type === 'appeal' ? <Shield className="w-6 h-6" /> :
                      <MessageSquare className="w-6 h-6" />}
                   </div>
                   <div>
                     <div className="flex items-center gap-3 mb-1">
                       <h4 className="text-white font-black text-xl uppercase italic tracking-tight leading-none group-hover:text-blue-400 transition-colors">{r.title}</h4>
                       <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border ${
                         r.status === 'approved' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                         r.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                         'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                       }`}>
                         {r.status === 'approved' ? 'Zatwierdzony' : r.status === 'rejected' ? 'Odrzucony' : 'W trakcie'}
                       </span>
                     </div>
                     <div className="flex items-center gap-4 text-white/40 text-[10px] font-black uppercase tracking-widest mb-4">
                       <span>{new Date(r.created_at).toLocaleDateString()}</span>
                       {r.other_team_name && (
                         <>
                           <span>•</span>
                           <span className="text-blue-500/60">PRZECIWNIK: {r.other_team_name}</span>
                         </>
                       )}
                       {r.other_team_response && (
                         <>
                           <span>•</span>
                           <span className={
                             r.other_team_response === 'confirmed' ? 'text-green-500' : 
                             r.other_team_response === 'rejected' ? 'text-red-500' : 'text-yellow-500'
                           }>
                             REAKCJA: {r.other_team_response === 'confirmed' ? 'POTWIERDZONO' : r.other_team_response === 'rejected' ? 'ODRZUCONO' : 'OCZEKUJE'}
                           </span>
                         </>
                       )}
                     </div>
                     <p className="text-white/60 text-sm leading-relaxed max-w-2xl line-clamp-2">{r.description}</p>
                     
                     {r.admin_note && (
                       <div className="mt-4 p-4 bg-red-500/5 border-l-2 border-red-500 rounded-r-xl">
                         <span className="text-[9px] font-black text-red-500 uppercase tracking-widest block mb-1">Powód odrzucenia (Admin)</span>
                         <p className="text-white/80 text-xs italic">{r.admin_note}</p>
                       </div>
                     )}

                     {r.other_team_message && r.other_team_response === 'rejected' && (
                       <div className="mt-4 p-4 bg-red-500/5 border-l-2 border-red-500 rounded-r-xl">
                         <span className="text-[9px] font-black text-red-500 uppercase tracking-widest block mb-1">Powód odrzucenia (Przeciwnik)</span>
                         <p className="text-white/80 text-xs italic">{r.other_team_message}</p>
                       </div>
                     )}
                   </div>
                 </div>
                 <div className="flex items-center gap-2 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-black uppercase tracking-widest">Otwórz czat</span>
                    <ChevronRight className="w-4 h-4" />
                 </div>
               </div>
             </div>
           ))
         )}
       </div>
    </div>
  );
}

function InboxList({ inbox, onRespond, onSelectRequest, submittingId, inboxCleanedAt }: { inbox: Request[], onRespond: (id: number, resp: 'confirmed' | 'rejected', msg: string) => void, onSelectRequest: (id: number) => void, submittingId: number | null, inboxCleanedAt: number }) {
  const [responseMessages, setResponseMessages] = useState<{[key: number]: string}>({});

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
       <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Inbox (Prośby od innych)</h3>
       
       <div className="space-y-6">
         {inbox.length === 0 ? (
           <div className="p-20 bg-white/[0.02] border border-white/5 rounded-[2rem] text-center flex flex-col items-center gap-6">
             <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-white/10">
               <History className="w-10 h-10" />
             </div>
             <div>
               <h4 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">Brak nowych próśb</h4>
               <p className="text-white/40 text-xs font-bold uppercase tracking-widest">W tej chwili nie masz żadnych wniosków do rozpatrzenia</p>
             </div>
           </div>
         ) : (
           inbox.map(r => (
             <div key={r.id} className={`bg-white/5 border rounded-[2rem] p-8 transition-all hover:bg-white/[0.08] ${r.unread_for_club && new Date(r.created_at).getTime() > inboxCleanedAt ? 'border-blue-500/50 shadow-lg shadow-blue-500/10' : 'border-white/10'}`}>
               <div className="space-y-8">
                 <div className="flex items-start gap-6 cursor-pointer group" onClick={() => onSelectRequest(r.id)}>
                   <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0 shadow-lg">
                     <Calendar className="w-6 h-6" />
                   </div>
                   <div className="flex-1">
                     <div className="flex items-center gap-3 mb-1">
                       <h4 className="text-white font-black text-xl uppercase italic tracking-tight leading-none group-hover:text-blue-400 transition-colors">{r.title}</h4>
                       {(!r.other_team_response || r.other_team_response === 'pending' || r.other_team_response === null) && (
                         <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-blue-500/20 text-blue-500">Oczekuje na Twoją decyzję</span>
                       )}
                     </div>
                     <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-4">
                       WYSŁANE PRZEZ: <span className="text-white">{r.other_team_name}</span> • {new Date(r.created_at).toLocaleDateString()}
                     </p>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                           <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block mb-2">Mecz do przełożenia</span>
                           <p className="text-sm font-black text-white italic uppercase">{r.metadata?.match_name || 'Nieokreślony'}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                           <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block mb-2">Proponowany Nowy Termin</span>
                           <p className="text-sm font-black text-blue-400 italic uppercase">{r.metadata?.new_date ? new Date(r.metadata.new_date).toLocaleString('pl-PL') : 'Nieokreślony'}</p>
                        </div>
                        <div className="md:col-span-2 bg-white/5 p-4 rounded-xl border border-white/5">
                           <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block mb-2">Powód zmiany</span>
                           <p className="text-sm font-medium text-white/70 italic leading-relaxed">{r.description || 'Brak uzasadnienia'}</p>
                        </div>
                     </div>
                   </div>
                   <div className="flex items-center gap-2 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity self-start mt-4">
                      <span className="text-[10px] font-black uppercase tracking-widest">Czat</span>
                      <ChevronRight className="w-4 h-4" />
                   </div>
                 </div>

                 {(!r.other_team_response || r.other_team_response === 'pending' || r.other_team_response === null) ? (
                   <div className="border-t border-white/5 pt-6 space-y-4">
                     <div className="space-y-2">
                       <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-4">
                         Twój komentarz {!(responseMessages[r.id]?.trim()) && <span className="text-red-500 opacity-50 ml-2">(Wymagany przy odrzuceniu)</span>}
                       </label>
                       <textarea 
                          value={responseMessages[r.id] || ''}
                          onChange={(e) => setResponseMessages({...responseMessages, [r.id]: e.target.value})}
                          disabled={submittingId === r.id}
                          placeholder="Zgadzamy się na ten termin / Niestety nam nie pasuje..."
                          className="w-full bg-[#05080f] border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-blue-500/50 transition-all text-sm placeholder:text-white/10 disabled:opacity-50"
                          rows={2}
                       />
                     </div>
                     <div className="flex gap-4">
                       <button 
                          onClick={() => onRespond(r.id, 'confirmed', responseMessages[r.id] || '')}
                          disabled={submittingId !== null}
                          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white font-black py-5 rounded-2xl transition-all shadow-lg shadow-green-500/20 uppercase tracking-tighter flex items-center justify-center gap-3 active:scale-95"
                       >
                         {submittingId === r.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                         Zatwierdzam
                       </button>
                       <button 
                          onClick={() => {
                            if (!responseMessages[r.id]?.trim()) {
                              alert("Musisz podać powód odrzucenia wniosku!");
                              return;
                            }
                            onRespond(r.id, 'rejected', responseMessages[r.id] || '');
                          }}
                          disabled={submittingId !== null}
                          className={`flex-1 font-black py-5 rounded-2xl transition-all uppercase tracking-tighter flex items-center justify-center gap-3 active:scale-95 shadow-lg ${
                            responseMessages[r.id]?.trim() 
                              ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20' 
                              : 'bg-red-600/10 border border-red-500/20 text-red-500/40 cursor-not-allowed'
                          }`}
                       >
                         {submittingId === r.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                         Odrzucam
                       </button>
                     </div>
                   </div>
                 ) : (
                   <div className="border-t border-white/5 pt-6">
                     <div className={`p-8 rounded-[1.5rem] flex items-center justify-between ${
                       r.other_team_response === 'confirmed' ? 'bg-green-500/5 border border-green-500/10 text-green-500' : 'bg-red-500/5 border border-red-500/10 text-red-500'
                     }`}>
                       <div className="flex items-center gap-5">
                         {r.other_team_response === 'confirmed' ? (
                            <div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center">
                               <CheckCircle className="w-6 h-6" />
                            </div>
                         ) : (
                            <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center">
                               <XCircle className="w-6 h-6" />
                            </div>
                         )}
                         <div>
                           <span className="text-[10px] font-black uppercase tracking-widest block opacity-50 mb-1">Twoja Decyzja</span>
                           <span className="text-lg font-black uppercase italic tracking-tight">
                             {r.other_team_response === 'confirmed' ? 'Wniosek Zatwierdzony' : 'Wniosek Odrzucony'}
                           </span>
                         </div>
                       </div>
                       {r.other_team_message && (
                         <div className="text-right max-w-sm">
                           <span className="text-[10px] font-black uppercase tracking-widest block opacity-50 mb-2">Twój komentarz</span>
                           <p className="text-white/80 text-sm font-bold italic tracking-tight leading-relaxed bg-white/5 px-6 py-3 rounded-xl border border-white/5 inline-block">
                              "{r.other_team_message}"
                           </p>
                         </div>
                       )}
                     </div>
                   </div>
                 )}
               </div>
             </div>
           ))
         )}
       </div>
    </div>
  );
}

function ChatWindow({ requestId, messages, newMessage, setNewMessage, onSendMessage, onClose, requestTitle }: any) {
  useEffect(() => {
    const el = document.getElementById('chat-messages');
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-[#0a0f1d] border border-white/10 w-full max-w-2xl h-[80vh] rounded-[2.5rem] flex flex-col relative z-10 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-white/10 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter leading-none">{requestTitle}</h3>
            <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest mt-2">Wątek wiadomości • Polling 5s</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div id="chat-messages" className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/20">
              <MessageSquare className="w-12 h-12 mb-4" />
              <p className="font-black uppercase tracking-widest text-xs italic">Brak wiadomości w tym wątku</p>
            </div>
          ) : (
            messages.map((m: any) => (
              <div key={m.id} className={`flex flex-col ${m.sender_type === 'club' ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1 px-2">
                   <span className="text-[8px] font-black uppercase tracking-widest text-white/40">
                     {m.sender_type === 'admin' ? 'ORGANIZATOR' : (m.sender_type === 'other_team' ? m.sender_team_name : 'TY')}
                   </span>
                   <span className="text-[8px] text-white/10">•</span>
                   <span className="text-[8px] text-white/20">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className={`max-w-[80%] p-4 rounded-3xl text-sm font-bold uppercase tracking-tight ${
                  m.sender_type === 'club' 
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-600/20' 
                    : 'bg-white/5 border border-white/10 text-white/80 rounded-tl-none'
                }`}>
                  {m.message}
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={onSendMessage} className="p-8 border-t border-white/10 shrink-0">
          <div className="relative">
            <input 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Napisz wiadomość..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 pr-16 text-white font-bold focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-white/10"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="absolute right-2 top-2 bottom-2 px-4 bg-blue-600 rounded-xl text-white hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 flex items-center gap-6 hover:bg-white/[0.08] transition-all">
      <div className="w-14 h-14 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">{label}</div>
        <div className="text-3xl font-black text-white italic tracking-tighter leading-none">{value}</div>
      </div>
    </div>
  );
}


function Announcement({ title, date, content, type }: any) {
  return (
    <div className="flex gap-6 p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all relative overflow-hidden group">
      <div className={`w-1.5 h-auto rounded-full ${type === 'warning' ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]'}`} />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h4 className="text-white font-black text-lg uppercase tracking-tight italic group-hover:text-blue-400 transition-colors">{title}</h4>
            {new Date(date).getTime() > Date.now() - 24 * 60 * 60 * 1000 && (
              <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">Nowe</span>
            )}
          </div>
          <span className="text-white/20 text-[10px] font-black uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg">{new Date(date).toLocaleDateString()}</span>
        </div>
        <p className="text-white/60 text-sm leading-relaxed mb-6 whitespace-pre-line">{content}</p>
        
        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/20">
                 <Shield className="w-3 h-3 text-blue-500" />
              </div>
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Organizator: <span className="text-blue-500">DLPN 1 Liga</span></span>
           </div>
           <div className="text-[9px] font-black text-white/10 uppercase tracking-[0.2em] italic">Oficjalny Komunikat</div>
        </div>
      </div>
    </div>
  );
}

function TypeButton({ children, icon, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest border ${
        active ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function calculateDays(date: string) {
  const diff = new Date(date).getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 min-w-[60px] border border-white/10 shadow-lg">
      <div className="text-xl font-black text-white italic tracking-tighter tabular-nums leading-none mb-1">
        {value.toString().padStart(2, '0')}
      </div>
      <div className="text-[7px] font-black text-white/40 uppercase tracking-widest leading-none">
        {label}
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-0.5">{label}</div>
        <div className="text-white font-black text-sm uppercase italic tracking-tight">{value}</div>
      </div>
    </div>
  );
}

function PenaltiesList({ penalties }: { penalties: Penalty[] }) {
  if (!penalties.length) {
    return (
      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 relative h-[400px]">
        <div className="absolute top-10 right-10 text-white/20 font-black uppercase tracking-widest text-[10px] italic">
          BRAK NAŁOŻONYCH KAR PUNKTOWYCH.
        </div>
        <div className="h-full flex flex-col items-center justify-center text-center">
           <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-white/5 mb-6">
              <AlertCircle className="w-10 h-10" />
           </div>
           <h4 className="text-xl font-black text-white/10 italic uppercase tracking-tighter">Brak Kar</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Kary Punktowe</h3>
      <div className="space-y-6">
        {penalties.map(k => (
          <div key={k.id} className="bg-[#0a0f1d]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-transparent to-red-600 opacity-30" />
            <div className="flex items-start gap-8">
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                <div className="w-10 h-10 rounded-full bg-red-600/10 flex items-center justify-center border border-red-500/20">
                   <Send className="w-5 h-5 text-red-500" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-white font-black text-2xl uppercase italic tracking-tighter leading-none">
                    ⚠️ ODLICZENIE PUNKTÓW KARNE: -{k.points} PKT
                  </h4>
                </div>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-8">
                  ORGANIZATOR LIGI NAŁOŻYŁ KARĘ PUNKTOWĄ NA WASZĄ DRUŻYNĘ.
                </p>

                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
                    <span className="text-white/30 min-w-[140px]">ODJĘTE PUNKTY:</span>
                    <span className="text-white text-sm">{k.points}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="text-white/30 min-w-[140px]">POWÓD:</span>
                    <span className="text-white text-sm italic">{k.reason}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="text-white/30 min-w-[140px]">DATA MECZU:</span>
                    <span className="text-white text-sm">{k.match_date || new Date(k.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest">
                    <LayoutIcon className="w-4 h-4 text-blue-500" />
                    <span className="text-white/30 min-w-[140px]">UWAGI:</span>
                    <span className="text-white text-sm italic">{(k as any).notes || '1.6'}</span>
                  </div>
                </div>

                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest italic mb-2">
                  W RAZIE PYTAŃ SKONTAKTUJ SIĘ Z ORGANIZATOREM.
                </p>

                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="text-[9px] text-white/10 font-black uppercase tracking-[0.2em]">
                    DLPN 1 LIGA • {new Date(k.created_at).toLocaleDateString("pl-PL")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineupProtocol({ token, teamId, teamName, onLogout }: any) {
  const [matches, setMatches] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [lineupRoles, setLineupRoles] = useState<Record<number, string>>({});
  const [captainId, setCaptainId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [existingLineup, setExistingLineup] = useState(false);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [matchesRes, playersRes] = await Promise.all([
        fetch(`${API_BASE}/clubs/matches`, {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/clubs/players`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
      ]);

      if (matchesRes.status === 401) return onLogout();
      
      const matchesData = await matchesRes.json();
      const playersData = await playersRes.json();

      setMatches(matchesData.filter((m: any) => m.status === 'scheduled' || m.status === 'live'));
      setPlayers(playersData.sort((a: any, b: any) => (a.jersey_number || 0) - (b.jersey_number || 0)));
    } catch (err) {
      setError("Błąd podczas ładowania danych");
    } finally {
      setLoading(false);
    }
  }, [token, onLogout]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const loadExistingLineup = useCallback(async (matchId: number) => {
    try {
      const res = await fetch(`${API_BASE}/clubs/lineups/match/${matchId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        const roles: Record<number, string> = {};
        let capId: number | null = null;
        
        data.players.forEach((p: any) => {
          roles[p.player_id] = p.role;
          if (p.is_captain) capId = p.player_id;
        });

        setLineupRoles(roles);
        setCaptainId(capId);
        setNotes(data.notes || "");
        setExistingLineup(true);
      } else {
        setLineupRoles({});
        setCaptainId(null);
        setNotes("");
        setExistingLineup(false);
      }
    } catch (err) {
      console.error("Error loading lineup:", err);
    }
  }, [token]);

  useEffect(() => {
    if (selectedMatchId) {
      loadExistingLineup(selectedMatchId);
    } else {
      setLineupRoles({});
      setCaptainId(null);
      setNotes("");
      setExistingLineup(false);
    }
  }, [selectedMatchId, loadExistingLineup]);

  const setRole = (playerId: number, role: string | null) => {
    setLineupRoles(prev => {
      const next = { ...prev };
      if (role === null) {
        delete next[playerId];
        if (captainId === playerId) setCaptainId(null);
      } else {
        next[playerId] = role;
      }
      return next;
    });
  };

  const toggleCaptain = (playerId: number) => {
    if (lineupRoles[playerId]) {
      setCaptainId(captainId === playerId ? null : playerId);
    }
  };

  const validate = () => {
    const rolesArr = Object.values(lineupRoles);
    const gkCount = rolesArr.filter(r => r === 'goalkeeper').length;
    const stCount = rolesArr.filter(r => r === 'starter').length;

    if (gkCount !== 1) return "Wymagany jest dokładnie jeden bramkarz (BK)";
    if (stCount > 5) return "Możesz wybrać maksymalnie 5 zawodników w polu";
    if (!captainId || !lineupRoles[captainId]) return "Wymagany jest kapitan w składzie";
    
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const payload = {
        match_id: selectedMatchId,
        notes,
        players: Object.entries(lineupRoles).map(([pid, role], index) => ({
          player_id: parseInt(pid),
          role,
          is_captain: parseInt(pid) === captainId,
          sort_order: index
        }))
      };

      const res = await fetch(`${API_BASE}/clubs/lineups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccess(existingLineup ? "Skład został zaktualizowany" : "Skład został wysłany");
        setExistingLineup(true);
      } else {
        const data = await res.json();
        setError(data.error || "Błąd podczas zapisywania składu");
      }
    } catch (err) {
      setError("Błąd połączenia z serwerem");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMatchId || !confirm("Czy na pewno chcesz usunąć ten skład?")) return;

    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/clubs/lineups/match/${selectedMatchId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        setLineupRoles({});
        setCaptainId(null);
        setNotes("");
        setExistingLineup(false);
        setSuccess("Skład został usunięty");
      } else {
        setError("Błąd podczas usuwania składu");
      }
    } catch (err) {
      setError("Błąd połączenia z serwerem");
    } finally {
      setSubmitting(false);
    }
  };

  const stats = useMemo(() => {
    const roles = Object.values(lineupRoles);
    return {
      gk: roles.filter(r => r === 'goalkeeper').length,
      st: roles.filter(r => r === 'starter').length,
      sub: roles.filter(r => r === 'substitute').length
    };
  }, [lineupRoles]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none mb-3">Protokół Meczowy</h2>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest italic">Zgłoś skład na nadchodzący mecz</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
               <Shield className="w-5 h-5 text-blue-500" />
               <span className="text-white font-black uppercase italic tracking-tight text-sm">{teamName}</span>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Wybierz Mecz</label>
            <select 
              value={selectedMatchId || ""} 
              onChange={(e) => setSelectedMatchId(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-black uppercase italic tracking-tight focus:outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
            >
              <option value="" className="bg-slate-900">Wybierz nadchodzący mecz...</option>
              {matches.map(m => (
                <option key={m.id} value={m.id} className="bg-slate-900">
                  {m.match_type === 'league' ? 'LIGA' : 'PUCHAR'} · {m.home_team?.name} vs {m.away_team?.name} · {new Date(m.scheduled_at).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          {selectedMatchId && (
            <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 pt-6">
              <div className="bg-blue-600/10 border border-blue-500/20 rounded-3xl p-6 flex flex-wrap items-center justify-center gap-8 shadow-xl">
                 <div className="flex items-center gap-3">
                   <div className={`w-3 h-3 rounded-full ${stats.gk === 1 ? 'bg-blue-500' : 'bg-red-500'} animate-pulse`} />
                   <span className="text-xs font-black uppercase tracking-widest text-white italic">Bramkarz: <span className={stats.gk === 1 ? 'text-blue-400' : 'text-red-400'}>{stats.gk}/1</span></span>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className={`w-3 h-3 rounded-full ${stats.st <= 5 && stats.st > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                   <span className="text-xs font-black uppercase tracking-widest text-white italic">W polu: <span className={stats.st <= 5 && stats.st > 0 ? 'text-green-400' : 'text-red-400'}>{stats.st}/5</span></span>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full bg-orange-500" />
                   <span className="text-xs font-black uppercase tracking-widest text-white italic">Rezerwowi: <span className="text-orange-400">{stats.sub}</span></span>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className={`w-3 h-3 rounded-full ${captainId ? 'bg-yellow-500' : 'bg-white/10'}`} />
                   <span className="text-xs font-black uppercase tracking-widest text-white italic">Kapitan: <span className={captainId ? 'text-yellow-400' : 'text-white/20'}>{captainId ? 'WYBRANY' : 'BRAK'}</span></span>
                 </div>
              </div>

              {(error || success) && (
                <div className={`p-6 rounded-2xl flex items-center gap-4 text-xs font-black uppercase tracking-widest italic animate-in zoom-in-95 duration-300 ${error ? 'bg-red-500/10 border border-red-500/20 text-red-500' : 'bg-green-500/10 border border-green-500/20 text-green-500'}`}>
                  {error ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                  {error || success}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                {players.map(p => {
                  const currentRole = lineupRoles[p.id];
                  const isCaptain = captainId === p.id;
                  
                  return (
                    <div key={p.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.04] transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden border border-white/10 shrink-0 relative group-hover:scale-105 transition-transform">
                          {p.photo_url ? (
                            <Image src={p.photo_url} alt="" fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/10 font-black italic">
                              {p.first_name[0]}{p.last_name[0]}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                             <span className="text-white/40 font-black italic text-xs">#{p.jersey_number || '??'}</span>
                             <span className="text-sm font-black text-white uppercase italic tracking-tight">{p.first_name} {p.last_name}</span>
                             {isCaptain && <Award className="w-4 h-4 text-yellow-500 animate-pulse" />}
                          </div>
                          <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">{p.position}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button 
                          onClick={() => toggleCaptain(p.id)}
                          disabled={!currentRole}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
                            isCaptain ? 'bg-yellow-500 border-yellow-400 text-black shadow-lg shadow-yellow-500/20' : 
                            currentRole ? 'bg-white/5 border-white/10 text-white/40 hover:text-yellow-500/60' : 'opacity-20 cursor-not-allowed text-white/10 border-white/5'
                          }`}
                          title="Kapitan"
                        >
                          <Award className="w-5 h-5" />
                        </button>

                        <div className="h-8 w-px bg-white/5 mx-1 hidden sm:block" />

                        <RoleButton 
                          active={currentRole === 'goalkeeper'} 
                          onClick={() => setRole(p.id, 'goalkeeper')}
                          label="BK"
                          activeClass="bg-blue-600 border-blue-500 text-white"
                        />
                        <RoleButton 
                          active={currentRole === 'starter'} 
                          onClick={() => setRole(p.id, 'starter')}
                          label="POLE"
                          activeClass="bg-green-600 border-green-500 text-white"
                        />
                        <RoleButton 
                          active={currentRole === 'substitute'} 
                          onClick={() => setRole(p.id, 'substitute')}
                          label="REZ"
                          activeClass="bg-orange-600 border-orange-500 text-white"
                        />
                        <RoleButton 
                          active={currentRole === 'reserve'} 
                          onClick={() => setRole(p.id, 'reserve')}
                          label="TRYB"
                          activeClass="bg-slate-600 border-slate-500 text-white"
                        />
                        
                        <button 
                          onClick={() => setRole(p.id, null)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            !currentRole ? 'bg-red-500/20 border border-red-500/40 text-red-500' : 'bg-white/5 border border-white/10 text-white/10 hover:text-red-500 hover:bg-red-500/5'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2 pt-6">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Uwagi do sędziego</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Np. zawodnik testowy, spóźnienie, kolory strojów..."
                  className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-6 text-white font-black uppercase italic text-xs placeholder:text-white/10 focus:outline-none focus:border-blue-500/50 transition-all min-h-[120px]"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <button 
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-2xl py-5 text-sm font-black uppercase italic tracking-widest transition-all shadow-xl shadow-green-500/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {existingLineup ? "Aktualizuj Skład" : "Zatwierdź Protokół"}
                </button>
                {existingLineup && (
                  <button 
                    onClick={handleDelete}
                    disabled={submitting}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl px-10 py-5 text-sm font-black uppercase italic tracking-widest transition-all border border-red-500/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    <Trash2 className="w-5 h-5" />
                    Usuń Skład
                  </button>
                )}
                <button 
                  onClick={() => {
                    setLineupRoles({});
                    setCaptainId(null);
                    setNotes("");
                  }}
                  className="bg-white/5 hover:bg-white/10 text-white/40 rounded-2xl px-10 py-5 text-sm font-black uppercase italic tracking-widest transition-all flex items-center justify-center gap-3"
                >
                  <RefreshCw className="w-5 h-5" />
                  Wyczyść
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center">
             <Shield className="w-6 h-6 text-blue-500" />
           </div>
           <div>
             <h4 className="text-white font-black uppercase italic tracking-tight leading-none">Status Zgłoszenia</h4>
             <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-1 italic">Protokół jest wymagany przed rozpoczęciem meczu</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest italic ${existingLineup ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
             {existingLineup ? 'SKŁAD ZŁOŻONY' : 'OCZEKUJE NA SKŁAD'}
           </div>
        </div>
      </div>
    </div>
  );
}

function RoleButton({ active, onClick, label, activeClass }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all border ${
        active ? `${activeClass} shadow-lg` : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  );
}

function OrganizerMessagesList({ messages, onMarkRead, onReply }: { messages: OrganizerMessage[], onMarkRead: (id: number) => void, onReply: (id: number, text: string) => void }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});

  if (!messages.length) {
    return (
      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 text-center h-[400px] flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-white/5 mb-6">
           <MessageSquare className="w-10 h-10" />
        </div>
        <p className="text-white/20 font-black uppercase tracking-widest text-sm italic">Brak nowych wiadomości.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Wiadomości od Organizatora</h3>
      <div className="grid grid-cols-1 gap-6">
        {messages.map(m => {
          const isExpanded = expandedId === m.id;
          const hasReplies = (m.replies || []).length > 0;
          
          return (
            <div key={m.id} className={`bg-[#0a0f1d]/60 backdrop-blur-2xl border rounded-[2.5rem] transition-all relative overflow-hidden group ${!m.read ? 'border-blue-500/30 bg-blue-500/[0.02]' : 'border-white/10'}`}>
              {!m.read && (
                <div className="absolute top-0 right-0 px-6 py-2 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest rounded-bl-2xl shadow-lg z-10">
                  NOWA WIADOMOŚĆ
                </div>
              )}
              <div className="p-10">
                <div className="flex items-start gap-8">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${!m.read ? 'bg-blue-600/10 text-blue-600 border border-blue-500/20 shadow-lg shadow-blue-500/10' : 'bg-white/5 text-white/20 border border-white/10'}`}>
                    <Send className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <h4 className="text-white font-black text-2xl uppercase italic tracking-tighter leading-none">
                        {m.title}
                      </h4>
                      <button 
                        onClick={() => {
                          setExpandedId(isExpanded ? null : m.id);
                          if (!m.read) onMarkRead(m.id);
                        }}
                        className="text-white/20 hover:text-white transition-colors"
                      >
                        <ChevronRight className={`w-8 h-8 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-blue-500' : ''}`} />
                      </button>
                    </div>
                    <p className="text-white/80 text-sm font-black uppercase italic tracking-tight leading-relaxed mb-6 whitespace-pre-line">
                      {m.message}
                    </p>
                    
                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-[9px] text-white/10 font-black uppercase tracking-[0.2em]">
                          DLPN 1 LIGA • {new Date(m.created_at).toLocaleDateString("pl-PL")}
                        </div>
                        {hasReplies && (
                          <div className="bg-white/5 px-3 py-1 rounded-full text-[8px] font-black text-white/40 uppercase tracking-widest">
                            {m.replies.length} odpowiedzi
                          </div>
                        )}
                      </div>
                      <div className="flex gap-4">
                        {!m.read && (
                          <button 
                            onClick={() => onMarkRead(m.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                          >
                            Oznacz jako przeczytaną
                          </button>
                        )}
                        <button 
                          onClick={() => setExpandedId(isExpanded ? null : m.id)}
                          className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isExpanded ? 'bg-white/10 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                        >
                          {isExpanded ? 'Zwiń wątek' : 'Odpowiedz'}
                        </button>
                      </div>
                    </div>

                    {/* Thread Section */}
                    {isExpanded && (
                      <div className="mt-10 pt-10 border-t border-white/5 space-y-6 animate-in slide-in-from-top-4 duration-500">
                        {/* Thread Bubbles */}
                        <div className="space-y-4">
                          {/* Original Message Copy for Context in Thread */}
                          <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-2xl relative overflow-hidden">
                             <div className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Shield className="w-3 h-3" /> Organizator · {new Date(m.created_at).toLocaleString("pl-PL")}
                             </div>
                             <p className="text-white/90 text-xs font-black uppercase italic leading-relaxed">{m.message}</p>
                          </div>

                          {(m.replies || []).map(r => (
                            <div key={r.id} className={`p-6 rounded-2xl border transition-all ${r.sender === 'organizer' ? 'bg-blue-600/10 border-blue-500/20' : 'bg-white/5 border-white/10 ml-12'}`}>
                              <div className={`text-[8px] font-black uppercase tracking-widest mb-2 flex items-center gap-2 ${r.sender === 'organizer' ? 'text-blue-400' : 'text-green-400'}`}>
                                {r.sender === 'organizer' ? <Shield className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                                {r.sender === 'organizer' ? 'Organizator' : 'Twój Klub'} · {new Date(r.created_at).toLocaleString("pl-PL")}
                              </div>
                              <p className="text-white/90 text-xs font-black uppercase italic leading-relaxed">{r.text}</p>
                            </div>
                          ))}
                        </div>

                        {/* Reply Input */}
                        <div className="flex gap-4 bg-black/40 p-4 rounded-2xl border border-white/5">
                          <input 
                            type="text"
                            value={replyText[m.id] || ''}
                            onChange={(e) => setReplyText(prev => ({ ...prev, [m.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && replyText[m.id]?.trim()) {
                                onReply(m.id, replyText[m.id]);
                                setReplyText(prev => ({ ...prev, [m.id]: '' }));
                              }
                            }}
                            placeholder="Napisz odpowiedź do organizatora..."
                            className="flex-1 bg-transparent border-none text-white font-black uppercase italic text-xs placeholder:text-white/10 focus:outline-none"
                          />
                          <button 
                            onClick={() => {
                              if (replyText[m.id]?.trim()) {
                                onReply(m.id, replyText[m.id]);
                                setReplyText(prev => ({ ...prev, [m.id]: '' }));
                              }
                            }}
                            disabled={!replyText[m.id]?.trim()}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-blue-500/20"
                          >
                            <Send className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
