'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { newsArticles as staticNews } from '@/lib/data';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ArrowRight, Search, Filter, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getNews, deleteNews } from '@/lib/firebase';
import { CreateNewsModal } from '@/components/create-news-modal';

const MEDIA_ROLE_IDS = ['1447302327349416051'];

export default function NewsListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Wszystkie');
  const [news, setNews] = useState<any[]>([]);
  const [isMedia, setIsMedia] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check role
    const userStr = localStorage.getItem('discord_user') || localStorage.getItem('user');
    const robloxId = localStorage.getItem('roblox_id');

    if (userStr) {
      const user = JSON.parse(userStr);
      const roles = user.discordRoles || user.roles || [];
      console.log('User roles:', roles); // Diagnostyka ról
      
      const hasMediaRole = roles.some((roleId: string) => MEDIA_ROLE_IDS.includes(String(roleId)));
      if (hasMediaRole) {
        setIsMedia(true);
      }
    }

    // Check club membership if not already media
    if (robloxId) {
      fetch(`https://wlpn-roblox-default-rtdb.europe-west1.firebasedatabase.app/users_clubs/${robloxId}.json`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            setIsMedia(true);
          }
        })
        .catch(err => console.error('Error checking club membership:', err));
    }

    // Fetch news
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setIsLoading(true);
    const firebaseNews = await getNews();
    // Combine static and firebase news, avoiding duplicates if any
    const combined = [...firebaseNews, ...staticNews.filter(sn => !firebaseNews.find(fn => fn.title === sn.title))];
    
    // Sort by date (descending)
    combined.sort((a, b) => {
      const dateA = new Date(a.date?.split(',')[0].split('.').reverse().join('-') || 0).getTime();
      const dateB = new Date(b.date?.split(',')[0].split('.').reverse().join('-') || 0).getTime();
      return dateB - dateA;
    });

    setNews(combined);
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć ten artykuł?')) {
      const success = await deleteNews(id);
      if (success) fetchNews();
    }
  };

  const categories = ['Wszystkie', ...Array.from(new Set(news.map(a => a.category)))];

  const filteredArticles = news.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         article.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'Wszystkie' || article.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredArticle = filteredArticles[0];
  const otherArticles = filteredArticles.slice(1);

  return (
    <div className="min-h-screen text-white selection:bg-blue-500 selection:text-white relative overflow-hidden">
      {/* Abstract Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-screen pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-blue-400/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-[10%] left-[20%] w-[25%] h-[25%] bg-blue-500/5 blur-[80px] rounded-full" />
      </div>
      <Navbar />

      <main className="pt-32 pb-40 relative z-10">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-1 bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)]" />
                <span className="text-sm font-black uppercase tracking-[0.4em] text-blue-500">Centrum Informacji</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.85] mb-8 drop-shadow-2xl">
                Aktualności <span className="text-white/10">PFF</span>
              </h1>
              <p className="text-white/40 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
                Bądź na bieżąco z najważniejszymi wydarzeniami, wynikami i zapowiedziami z serca Polskiej Federacji Futbolu.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
              <div className="relative group w-full md:w-80">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Szukaj artykułów..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl pl-16 pr-8 py-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all w-full"
                />
              </div>
              {isMedia && (
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="w-full md:w-auto px-8 py-5 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(37,99,235,0.3)] whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Dodaj Post
                </button>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap items-center gap-3 mb-16 overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex items-center gap-3 px-6 py-4 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl mr-4">
              <Filter className="w-4 h-4 text-white/40" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Filtruj:</span>
            </div>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                  activeCategory === category 
                  ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)]' 
                  : 'bg-white/[0.03] backdrop-blur-xl border-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {filteredArticles.length > 0 ? (
            <div className="space-y-20">
              {/* Featured Article */}
              {activeCategory === 'Wszystkie' && searchTerm === '' && featuredArticle && (
                <Link 
                  href={`/aktualnosc/${featuredArticle.id}`}
                  className="group relative grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-[56px] overflow-hidden border border-white/5 bg-white/[0.03] backdrop-blur-xl hover:border-blue-500/30 transition-all shadow-2xl"
                >
                  <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto overflow-hidden">
                    <Image 
                      src={featuredArticle.image}
                      alt={featuredArticle.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                  </div>
                  <div className="lg:col-span-5 p-10 md:p-20 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-8">
                      <span className="px-5 py-2 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest">Wyróżnione</span>
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{featuredArticle.category}</span>
                      {isMedia && typeof featuredArticle.id === 'string' && (
                        <button 
                          onClick={(e) => { e.preventDefault(); handleDelete(featuredArticle.id as string); }}
                          className="ml-auto p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none mb-8 group-hover:text-blue-400 transition-colors">
                      {featuredArticle.title}
                    </h2>
                    <p className="text-white/40 text-lg mb-12 line-clamp-3 leading-relaxed">
                      {featuredArticle.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-black uppercase tracking-widest text-white/20">{featuredArticle.date || '10.01.2026'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-blue-500 group-hover:translate-x-2 transition-transform">
                        <span className="text-xs font-black uppercase tracking-widest">Czytaj artykuł</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Grid of Articles */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {(activeCategory === 'Wszystkie' && searchTerm === '' ? otherArticles : filteredArticles).map((article) => (
                  <Link 
                    key={article.id}
                    href={`/aktualnosc/${article.id}`}
                    className="group flex flex-col bg-white/[0.03] backdrop-blur-xl border border-white/5 rounded-[48px] overflow-hidden hover:border-blue-500/20 hover:bg-white/[0.05] transition-all"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image 
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                        <span className="px-5 py-2 bg-black/60 backdrop-blur-xl rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 group-hover:bg-blue-600 group-hover:border-blue-400 transition-all">
                          {article.category}
                        </span>
                        {isMedia && typeof article.id === 'string' && (
                          <button 
                            onClick={(e) => { e.preventDefault(); handleDelete(article.id as string); }}
                            className="p-2 bg-red-500/20 backdrop-blur-xl text-red-500 border border-red-500/30 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="p-10 flex flex-col flex-1">
                      <div className="flex items-center gap-3 mb-6">
                        <Calendar className="w-4 h-4 text-white/20" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{article.date || '10.01.2026'}</span>
                      </div>
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-[1.1] mb-6 group-hover:text-blue-400 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-white/40 text-sm mb-10 line-clamp-3 leading-relaxed">
                        {article.description}
                      </p>
                      <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between text-blue-500">
                        <span className="text-[10px] font-black uppercase tracking-widest">Czytaj więcej</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-40 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-10 border border-white/10">
                <Search className="w-10 h-10 text-white/20" />
              </div>
              <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4">Nie znaleziono artykułów</h3>
              <p className="text-white/40 max-w-md">Spróbuj zmienić słowa kluczowe lub kategorię wyszukiwania.</p>
              <button 
                onClick={() => {setSearchTerm(''); setActiveCategory('Wszystkie');}}
                className="mt-10 px-8 py-4 bg-white text-black font-black uppercase italic tracking-widest rounded-2xl hover:scale-105 transition-all"
              >
                Resetuj filtry
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <CreateNewsModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchNews}
      />
    </div>
  );
}
