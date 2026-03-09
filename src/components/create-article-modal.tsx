'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface CreateArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateArticleModal({ isOpen, onClose, onSuccess }: CreateArticleModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    imageUrl: '',
    category: 'AKTUALNOŚCI'
  });

  useEffect(() => {
    if (isOpen) {
      const savedUser = localStorage.getItem('discord_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setFormData(prev => ({ ...prev, author: userData.username }));
      }
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Wystąpił błąd podczas tworzenia artykułu.');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
        onClose();
        setFormData({
          title: '',
          content: '',
          author: formData.author,
          imageUrl: '',
          category: 'AKTUALNOŚCI'
        });
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Błąd połączenia z API.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-400" />
        
        <div className="p-8 md:p-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">Utwórz Artykuł</h2>
              <p className="text-white/40 text-sm font-medium mt-1">Dodaj nową gazetkę do systemu PFF</p>
            </div>
            <button 
              onClick={onClose}
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {success ? (
            <div className="py-20 flex flex-col items-center justify-center text-center animate-in fade-in scale-in duration-500">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-2">Artykuł utworzony!</h3>
              <p className="text-white/40">Zostaniesz przekierowany za chwilę...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Tytuł artykułu</label>
                <input
                  required
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Wprowadź tytuł..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Kategoria</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="AKTUALNOŚCI">Aktualności</option>
                    <option value="TRANSFERY">Transfery</option>
                    <option value="WYNIKI">Wyniki</option>
                    <option value="PORADNIKI">Poradniki</option>
                    <option value="NEWS">News</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Autor</label>
                  <input
                    required
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    placeholder="Twój nick..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Link do obrazka (URL)</label>
                <div className="relative">
                  <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://i.ibb.co/..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-16 pr-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Treść artykułu (HTML obsługiwany)</label>
                <textarea
                  required
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Treść artykułu tutaj..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-3xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                />
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold animate-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-blue-600 text-white font-black uppercase italic tracking-[0.2em] py-5 rounded-2xl hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 group"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    Opublikuj Artykuł
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function CreateArticleButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const REQUIRED_ROLE_ID = '1447302327349416051';

  useEffect(() => {
    const checkPermission = () => {
      const savedUser = localStorage.getItem('discord_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        const roles = userData.discordRoles || [];
        setHasPermission(roles.includes(REQUIRED_ROLE_ID));
      } else {
        setHasPermission(false);
      }
    };

    checkPermission();
    // Watch for login changes
    window.addEventListener('storage', checkPermission);
    return () => window.removeEventListener('storage', checkPermission);
  }, []);

  if (!hasPermission) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-black uppercase italic tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] group"
      >
        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
        Utwórz Artykuł
      </button>

      <CreateArticleModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onSuccess={() => {
          // Could refresh data here
          window.location.reload();
        }}
      />
    </>
  );
}
