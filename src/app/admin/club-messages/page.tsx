'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { 
  Shield, 
  Send, 
  Trash2, 
  MessageSquare, 
  ChevronRight, 
  Loader2, 
  Users, 
  Plus,
  LogOut,
  History,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { MainNavbar } from '@/components/main-navbar';
import { Footer } from '@/components/footer';

const API_BASE = "https://league-builder.replit.app/teams/api";

interface Reply {
  id: number;
  message_id: number;
  sender: 'organizer' | 'club';
  text: string;
  created_at: string;
}

interface ClubMessage {
  id: number;
  team_id: number;
  team_name: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  replies: Reply[];
}

interface Team {
  id: number;
  name: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ClubMessage[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Form states
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) setToken(savedToken);
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/admin/club-messages`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Error fetching admin messages:", err);
    }
  }, [token]);

  const fetchTeams = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/teams`);
      if (res.ok) {
        const data = await res.json();
        setTeams(data);
      }
    } catch (err) {
      console.error("Error fetching teams:", err);
    }
  }, []);

  useEffect(() => {
    if (token) {
      setLoading(true);
      Promise.all([fetchMessages(), fetchTeams()]).finally(() => setLoading(false));
      
      const interval = setInterval(fetchMessages, 10000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [token, fetchMessages, fetchTeams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      // Admin login usually requires special handling, 
      // but the user didn't specify a login endpoint for admin.
      // I'll assume they might use the club login or a manual token for now,
      // or I'll just let them enter the token directly.
      if (adminPassword.startsWith("token_")) {
        const t = adminPassword.replace("token_", "");
        localStorage.setItem('admin_token', t);
        setToken(t);
      } else {
        setAuthError("Wpisz token administratora (np. token_xyz)");
      }
    } catch (err) {
      setAuthError("Błąd logowania");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedTeamId || !newTitle.trim() || !newMessage.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/admin/club-messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          team_id: parseInt(selectedTeamId),
          title: newTitle,
          message: newMessage
        })
      });

      if (res.ok) {
        setShowNewModal(false);
        setNewTitle("");
        setNewMessage("");
        setSelectedTeamId("");
        fetchMessages();
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const deleteMessage = async (id: number) => {
    if (!confirm("Czy na pewno chcesz usunąć tę wiadomość?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/club-messages/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchMessages();
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  const handleReply = async (id: number) => {
    const text = replyText[id];
    if (!token || !text?.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/admin/club-messages/${id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });

      if (res.ok) {
        setReplyText(prev => ({ ...prev, [id]: "" }));
        fetchMessages();
      }
    } catch (err) {
      console.error("Error replying to message:", err);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-black relative flex flex-col items-center justify-center p-4">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <Image
            src="https://i.ibb.co/YCB7X52/obraz-2026-06-13-150303737.png"
            alt="Stadium Background"
            fill
            className="object-cover brightness-[0.7]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
            <div className="flex flex-col items-center mb-10">
              <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/20">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter text-center">Panel Admina</h1>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2">Wiadomości do klubów</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Token Administratora</label>
                <input 
                  type="password" 
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="token_..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-red-500/50 transition-all placeholder:text-white/10"
                  required
                />
              </div>

              {authError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-500 text-xs font-bold uppercase">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {authError}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isAuthLoading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white font-black py-5 rounded-2xl transition-all shadow-lg shadow-red-500/20 uppercase tracking-tighter flex items-center justify-center gap-3"
              >
                {isAuthLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Zaloguj się"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-black min-h-screen text-white font-sans selection:bg-red-500/30 relative">
      <MainNavbar />
      
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="https://i.ibb.co/YCB7X52/obraz-2026-06-13-150303737.png"
          alt="Stadium Background"
          fill
          className="object-cover brightness-[0.7]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
      </div>

      <div className="container mx-auto px-4 pt-44 pb-32 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 sticky top-44">
              <div className="flex flex-col items-center mb-10">
                <div className="w-20 h-20 rounded-2xl bg-red-600/10 flex items-center justify-center border border-red-500/20 mb-4 shadow-xl">
                  <Shield className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-xl font-black text-white italic uppercase tracking-tighter text-center leading-tight">Admin</h2>
                <span className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2">Zarządzanie Wiadomościami</span>
              </div>

              <div className="space-y-2">
                <button 
                  onClick={() => setShowNewModal(true)}
                  className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-red-600 text-white hover:bg-red-700 transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-red-500/20"
                >
                  <Plus className="w-5 h-5" />
                  Nowa Wiadomość
                </button>
                
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
          <div className="flex-1 space-y-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Skrzynka Odbiorcza</h3>
              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 italic">
                {messages.length} wiadomości
              </div>
            </div>

            {loading ? (
              <div className="h-[400px] flex items-center justify-center bg-white/5 border border-white/10 rounded-[2.5rem]">
                <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="h-[400px] flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-[2.5rem] text-center">
                <MessageSquare className="w-16 h-16 text-white/5 mb-4" />
                <p className="text-white/20 font-black uppercase tracking-widest italic">Brak wiadomości.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map(m => (
                  <div key={m.id} className={`bg-white/5 border rounded-[2.5rem] transition-all overflow-hidden ${expandedId === m.id ? 'border-red-500/30 ring-1 ring-red-500/20' : 'border-white/10 hover:bg-white/[0.08]'}`}>
                    <div className="p-8">
                      <div className="flex items-start gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                          <Users className="w-6 h-6 text-white/40" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-4 mb-2">
                            <div className="flex items-center gap-3">
                              <h4 className="text-white font-black text-xl uppercase italic tracking-tighter">{m.title}</h4>
                              <span className="px-2 py-0.5 bg-red-600/20 border border-red-500/30 text-red-500 text-[8px] font-black rounded-full uppercase tracking-widest">{m.team_name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{new Date(m.created_at).toLocaleDateString()}</span>
                              <button onClick={() => deleteMessage(m.id)} className="p-2 text-white/10 hover:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => setExpandedId(expandedId === m.id ? null : m.id)} className="p-2 text-white/20 hover:text-white transition-colors">
                                <ChevronRight className={`w-6 h-6 transition-transform ${expandedId === m.id ? 'rotate-90 text-red-500' : ''}`} />
                              </button>
                            </div>
                          </div>
                          <p className="text-white/60 text-sm italic font-medium leading-relaxed line-clamp-2">{m.message}</p>
                        </div>
                      </div>

                      {expandedId === m.id && (
                        <div className="mt-8 pt-8 border-t border-white/5 space-y-6 animate-in slide-in-from-top-4 duration-500">
                          <div className="space-y-4">
                            <div className="bg-red-600/5 border border-red-500/10 p-5 rounded-2xl">
                               <div className="text-[8px] font-black text-red-400 uppercase tracking-widest mb-1">Ty (Organizator)</div>
                               <p className="text-white/80 text-xs italic font-black uppercase tracking-tight">{m.message}</p>
                            </div>

                            {m.replies.map(r => (
                              <div key={r.id} className={`p-5 rounded-2xl border transition-all ${r.sender === 'organizer' ? 'bg-red-600/5 border-red-500/10' : 'bg-white/5 border-white/10 ml-12'}`}>
                                <div className={`text-[8px] font-black uppercase tracking-widest mb-1 flex items-center gap-2 ${r.sender === 'organizer' ? 'text-red-400' : 'text-blue-400'}`}>
                                  {r.sender === 'organizer' ? 'TY (ORGANIZATOR)' : m.team_name} · {new Date(r.created_at).toLocaleString()}
                                </div>
                                <p className="text-white/90 text-xs font-bold uppercase tracking-tight italic">{r.text}</p>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-4 items-end">
                            <div className="flex-1 space-y-2">
                               <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-4">Twoja odpowiedź</label>
                               <textarea 
                                 value={replyText[m.id] || ""}
                                 onChange={(e) => setReplyText(prev => ({ ...prev, [m.id]: e.target.value }))}
                                 placeholder="Napisz odpowiedź do klubu..."
                                 className="w-full bg-[#0a0f1d] border border-white/10 rounded-2xl px-6 py-4 text-white text-xs font-bold focus:outline-none focus:border-red-500/50 transition-all placeholder:text-white/10 min-h-[100px]"
                               />
                            </div>
                            <button 
                              onClick={() => handleReply(m.id)}
                              disabled={!replyText[m.id]?.trim()}
                              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 px-8 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-500/20 h-[56px] flex items-center justify-center gap-2"
                            >
                              <Send className="w-4 h-4" />
                              Wyślij
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Message Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0a0f1d] border border-white/10 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-10">
              <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                  <Plus className="w-6 h-6" />
                </div>
                Nowa Wiadomość
              </h3>

              <form onSubmit={sendMessage} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Wybierz Klub</label>
                  <select 
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-red-500/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#0a0f1d]">Wybierz drużynę...</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id} className="bg-[#0a0f1d]">{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Tytuł</label>
                  <input 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    placeholder="np. Informacja o terminie meczu"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-red-500/50 transition-all placeholder:text-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Treść</label>
                  <textarea 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    required
                    rows={6}
                    placeholder="Wpisz treść wiadomości..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-red-500/50 transition-all placeholder:text-white/10"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-2xl transition-all shadow-lg shadow-red-500/20 uppercase tracking-tighter flex items-center justify-center gap-3">
                    <Send className="w-5 h-5" />
                    Wyślij wiadomość
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowNewModal(false)}
                    className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white font-black rounded-2xl transition-all uppercase text-xs tracking-widest"
                  >
                    Anuluj
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
