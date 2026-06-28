'use client';

import { MainNavbar } from '@/components/main-navbar';
import { Footer } from '@/components/footer';
import { useParams } from 'next/navigation';
import { newsArticles as staticNewsArticles } from '@/lib/data';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, ArrowLeft, Share2, MessageCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function NewsDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [otherArticles, setOtherArticles] = useState<any[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchArticleData = async () => {
      try {
        const response = await fetch('https://league-builder.replit.app/api/articles');
        if (response.ok) {
          const data = await response.json();
          const mappedArticles = data.map((a: any) => ({
            id: a.id,
            title: a.title,
            description: a.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...',
            content: a.content,
            image: a.imageUrl || 'https://i.ibb.co/TB027G07/czarnepff-1.png',
            category: a.category || 'News',
            date: new Date(a.publishedAt || a.createdAt).toLocaleDateString('pl-PL'),
            author: a.author
          }));

          const allArticles = [...mappedArticles, ...(staticNewsArticles as any[])];
          const found = allArticles.find(a => String(a.id) === id);
          setArticle(found);
          setOtherArticles(allArticles.filter(a => String(a.id) !== id).slice(0, 3));
        } else {
          const found = (staticNewsArticles as any[]).find(a => String(a.id) === id);
          setArticle(found);
          setOtherArticles((staticNewsArticles as any[]).filter(a => String(a.id) !== id).slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching article:', error);
        const found = (staticNewsArticles as any[]).find(a => String(a.id) === id);
        setArticle(found);
        setOtherArticles((staticNewsArticles as any[]).filter(a => String(a.id) !== id).slice(0, 3));
      } finally {
        setLoading(false);
      }
    };

    fetchArticleData();
  }, [id]);

  const formatContent = (content: string) => {
    if (!content) return null;
    
    // Usuń tagi HTML, jeśli są
    const plainText = content.replace(/<[^>]*>?/gm, '');
    
    // Podziel na zdania
    const sentences = plainText.match(/[^.!?]+[.!?]+/g) || [plainText];
    
    // Połącz w akapity po 2-4 zdania
    const paragraphs: string[] = [];
    for (let i = 0; i < sentences.length; i += 3) {
      paragraphs.push(sentences.slice(i, i + 3).join(' '));
    }
    
    return paragraphs.map((p, idx) => (
      <p key={idx} className="mb-10 text-[1.15rem] leading-[2.1] text-white/80 font-medium tracking-tight">
        {p.trim()}
      </p>
    ));
  };

  if (loading) {
    return (
      <main className="bg-[#020617] min-h-screen text-white relative">
        <MainNavbar />
        <div className="flex flex-col items-center justify-center py-60 px-4 relative z-10">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className="text-white/40 font-black uppercase tracking-widest text-xs">Ładowanie artykułu...</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (!article) {
    return (
      <main className="bg-[#020617] min-h-screen text-white relative">
        <MainNavbar />
        <div className="flex flex-col items-center justify-center py-40 px-4 relative z-10">
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20 backdrop-blur-xl">
            <ArrowLeft className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-4">Artykuł nie został znaleziony</h1>
          <p className="text-white/40 mb-10 text-center max-w-md">Przepraszamy, ale strona której szukasz nie istnieje lub została przeniesiona.</p>
          <Link 
            href="/" 
            className="px-8 py-4 bg-white text-black font-black uppercase italic tracking-widest rounded-2xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            Powrót do strony głównej
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="bg-[#020617] min-h-screen text-white selection:bg-blue-500 selection:text-white relative overflow-x-hidden">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[100] bg-white/5 backdrop-blur-md">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <MainNavbar />
      
      {/* Background Section */}
      <div className="fixed inset-0 z-0">
        <Image
          src="https://i.ibb.co/YCB7X52/obraz-2026-06-13-150303737.png"
          alt="Stadium Background"
          fill
          className="object-cover brightness-[0.4] scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/80 via-[#020617]/40 to-[#020617]/90" />
        
        {/* Animated Glows */}
        <div className="absolute top-1/4 -left-20 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <article className="relative z-10 pt-44">
        {/* Abstract Background Decoration for Hero */}
        <div className="absolute top-0 left-0 w-full h-[600px] pointer-events-none z-0 overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent" />
           <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />
        </div>

        {/* Header Section (from Image) */}
        <div className="container mx-auto px-4 mb-20 relative z-10">
          <div className="max-w-6xl mx-auto">
            <Link 
              href="/aktualnosci" 
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all mb-12 group backdrop-blur-xl"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              POWRÓT DO AKTUALNOŚCI
            </Link>

            <div className="flex items-center gap-4 mb-8">
              <span className="px-5 py-2 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(37,99,235,0.4)] border border-blue-400/30">
                {article.category}
              </span>
              <div className="h-px w-10 bg-white/20" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">ARTYKUŁ • 5 MIN CZYTANIA</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.95] md:leading-[0.85] uppercase italic tracking-tighter mb-12 max-w-4xl drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-5 bg-white/[0.03] border border-white/5 rounded-3xl p-4 pr-10 backdrop-blur-xl shadow-2xl">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center font-black italic text-2xl shadow-lg border border-blue-400/50">P</div>
                <div>
                  <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-1">Autor publikacji</p>
                  <p className="text-base font-black uppercase italic tracking-tight text-white/90">{article.author || 'Redakcja PFF'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-5 bg-white/[0.03] border border-white/5 rounded-3xl p-4 pr-10 backdrop-blur-xl shadow-2xl">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
                  <Calendar className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-1">Opublikowano</p>
                  <p className="text-base font-black uppercase italic tracking-tight text-white/90">{article.date || '17.03.2026'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="container mx-auto px-4 pb-40 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Main Glass Container */}
              <div className="lg:col-span-8">
                <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[56px] p-8 md:p-16 shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full -mr-64 -mt-64 group-hover:bg-blue-600/10 transition-colors duration-1000 pointer-events-none" />
                  
                  <div className="relative z-10">
                    {article.image && (
                      <div className="mb-16 w-full relative aspect-[16/10] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl bg-black/40">
                        <Image
                          src={article.image}
                          alt={article.title}
                          fill
                          className="object-cover scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />
                      </div>
                    )}
                    
                    <div className="text-white selection:bg-blue-500/30 text-lg leading-[1.8] font-medium tracking-tight">
                      {formatContent(article.content || article.description)}
                    </div>

                    <div className="mt-24 pt-12 border-t border-white/5 flex flex-wrap items-center justify-between gap-10">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mr-4">Tematy:</span>
                        {['PFF', 'Ekstraklasa', 'Sezon 1', 'Transfery'].map(tag => (
                          <span key={tag} className="px-6 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-[10px] font-black uppercase text-white/30 hover:bg-blue-600/10 hover:text-blue-400 hover:border-blue-500/20 transition-all cursor-pointer">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      
                      <button className="flex items-center gap-4 px-8 py-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/10 transition-all text-white/30 hover:text-white group">
                        <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">UDOSTĘPNIJ ARTYKUŁ</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Glass Container */}
              <div className="lg:col-span-4 sticky top-32">
                <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-[0_30px_80px_rgba(0,0,0,0.4)] relative overflow-hidden group">
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 blur-[60px] rounded-full -ml-16 -mb-16 group-hover:bg-blue-500/10 transition-colors duration-1000" />
                  
                  <h3 className="text-xs font-black uppercase italic tracking-[0.3em] text-white/30 mb-10 flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
                    POLECANE TREŚCI
                  </h3>
                  
                  <div className="space-y-12">
                    {otherArticles.map((relatedArticle) => (
                      <Link
                        key={relatedArticle.id}
                        href={`/aktualnosc/${relatedArticle.id}`}
                        className="group block"
                      >
                        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/10 group-hover:border-blue-500/30 transition-all shadow-xl mb-5">
                          <Image
                            src={relatedArticle.image}
                            alt={relatedArticle.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-1000"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-lg text-[8px] font-black uppercase tracking-[0.2em] border border-white/10">
                              {relatedArticle.category}
                            </span>
                          </div>
                        </div>
                        <h4 className="text-lg font-black uppercase italic tracking-tight text-white/80 group-hover:text-blue-400 transition-colors line-clamp-2 leading-[1.1] mb-4">
                          {relatedArticle.title}
                        </h4>
                        <div className="flex items-center justify-between">
                           <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] group-hover:text-white/40 transition-colors">ODKRYJ HISTORIĘ</span>
                           <ArrowLeft className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 rotate-180 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                        </div>
                      </Link>
                    ))}
                  </div>

                  <Link 
                    href="/aktualnosci"
                    className="mt-12 w-full flex items-center justify-center py-5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] text-white/20 hover:bg-white/10 hover:text-white transition-all shadow-xl"
                  >
                    ZOBACZ WSZYSTKIE
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}
