'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useParams } from 'next/navigation';
import { newsArticles } from '@/lib/data';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, ArrowLeft, Share2, MessageCircle } from 'lucide-react';

export default function NewsDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const article = newsArticles.find(a => a.id === parseInt(id)) as any;

  if (!article) {
    return (
      <div className="min-h-screen text-white relative">
        <Navbar />
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
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white selection:bg-blue-500 selection:text-white relative overflow-hidden">
      {/* Abstract Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-screen pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-blue-400/5 blur-[100px] rounded-full" />
      </div>

      <Navbar />
      
      <article className="relative z-10">
        {/* Hero Section */}
        <div className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent z-10 opacity-70 md:opacity-80" />
          
          {article.image && !article.isVertical && (
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover scale-105 animate-slow-zoom opacity-40"
              priority
            />
          )}
          {article.image && article.isVertical && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-black/30 z-0" />
          )}
          
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 z-10 pointer-events-none" />
          
          <div className="absolute inset-0 z-20 container mx-auto px-4 flex flex-col justify-end pb-20 md:pb-32">
            <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <Link 
                href="/aktualnosci" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all mb-12 group backdrop-blur-xl shadow-2xl"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Powrót do aktualności
              </Link>
              
              <div className="flex items-center gap-4 mb-8">
                <span className="px-5 py-2 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(37,99,235,0.5)] border border-blue-400/30">
                  {article.category}
                </span>
                <div className="h-px w-12 bg-white/20" />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Artykuł • 5 min czytania</span>
              </div>
              
              <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.95] md:leading-[0.85] uppercase italic tracking-tighter mb-10 max-w-5xl drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center gap-8 md:gap-16">
                <div className="flex items-center gap-5">
                  <div className="relative group">
                    <div className="absolute -inset-2 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-1 backdrop-blur-md relative z-10">
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-700 rounded-xl flex items-center justify-center font-black italic text-xl shadow-lg text-white">P</div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Autor publikacji</p>
                    <p className="text-base font-black uppercase italic tracking-tight text-white/90">{article.author || 'Redakcja PFF'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
                    <Calendar className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Opublikowano</p>
                    <p className="text-base font-black uppercase italic tracking-tight text-white/90">{article.date || '10.01.2026'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 -mt-24 relative z-30 pb-40">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              {/* Main Content */}
              <div className="lg:col-span-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
                <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[56px] p-10 md:p-20 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full -mr-64 -mt-64 group-hover:bg-blue-600/10 transition-colors duration-1000" />
                  
                  <div className="prose prose-invert prose-2xl max-w-none relative z-10">
                    {article.isVertical && article.image && (
                      <div className="float-right ml-12 mb-12 w-full md:w-1/2 lg:w-[400px] relative aspect-[3/4] rounded-3xl overflow-hidden border border-white/10 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700 group/img">
                        <div className="absolute inset-0 bg-blue-500/10 z-10 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                        <Image
                          src={article.image}
                          alt={article.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="space-y-12 text-white/70 leading-[1.7] font-medium tracking-tight">
                      {article.content ? (
                        article.content.split('\n\n').map((paragraph: string, idx: number) => (
                          <p 
                            key={idx} 
                            className={`text-2xl md:text-3xl leading-[1.55] transition-colors duration-500 hover:text-white/90 ${idx === 0 ? 'first-letter:text-9xl first-letter:font-black first-letter:text-blue-500 first-letter:mr-6 first-letter:float-left first-letter:leading-[0.8] first-letter:mt-4 first-letter:uppercase first-letter:italic first-letter:drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]' : ''}`}
                          >
                            {paragraph}
                          </p>
                        ))
                      ) : (
                        <p className="text-2xl md:text-3xl leading-[1.55]">
                          {article.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-24 pt-12 border-t border-white/5 flex flex-wrap items-center justify-between gap-10">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mr-4">Tematy:</span>
                      {['PFF', 'Ekstraklasa', 'Sezon 1', 'Roblox', 'Esport'].map(tag => (
                        <span key={tag} className="px-5 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase text-white/40 border border-white/5 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/20 transition-all cursor-pointer">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <button className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/40 hover:text-white group">
                        <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Udostępnij</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-4 space-y-10 animate-in fade-in slide-in-from-right-12 duration-1000 delay-500">
                {/* Related Articles */}
                <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[48px] p-10 shadow-2xl">
                  <h3 className="text-xs font-black uppercase italic tracking-[0.3em] text-white/30 mb-10 flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    Polecane treści
                  </h3>
                  
                  <div className="space-y-10">
                    {newsArticles.filter(a => a.id !== article.id).slice(0, 3).map((relatedArticle) => (
                      <Link
                        key={relatedArticle.id}
                        href={`/aktualnosc/${relatedArticle.id}`}
                        className="group flex flex-col gap-5 p-5 -m-5 rounded-[32px] hover:bg-white/[0.03] transition-all"
                      >
                        <div className="relative aspect-[16/10] rounded-3xl overflow-hidden border border-white/5 group-hover:border-blue-500/30 transition-all shadow-lg">
                          <Image
                            src={relatedArticle.image}
                            alt={relatedArticle.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-1000"
                          />
                          <div className="absolute top-4 left-4">
                            <span className="px-4 py-1.5 bg-black/70 backdrop-blur-xl rounded-xl text-[8px] font-black uppercase tracking-[0.2em] border border-white/10">
                              {relatedArticle.category}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xl font-black uppercase italic tracking-tight text-white/80 group-hover:text-blue-400 transition-colors line-clamp-2 leading-[1.1]">
                            {relatedArticle.title}
                          </h4>
                          <div className="flex items-center justify-between mt-4">
                            <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest group-hover:text-blue-500/50 transition-colors">Odkryj historię</p>
                            <ArrowLeft className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 rotate-180 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <Link 
                    href="/aktualnosci"
                    className="mt-12 w-full flex items-center justify-center py-5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white/30 hover:bg-white/5 hover:text-white transition-all"
                  >
                    Zobacz wszystkie
                  </Link>
                </div>

                {/* Newsletter Box */}
                <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-3xl rounded-[48px] p-10 shadow-[0_30px_60px_rgba(37,99,235,0.1)] relative overflow-hidden group border border-white/10">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/20 blur-[60px] rounded-full -ml-16 -mb-16" />
                  
                  <MessageCircle className="w-12 h-12 text-blue-500 mb-6 group-hover:rotate-12 transition-transform duration-500" />
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-6 relative z-10 leading-none">Bądź częścią społeczności</h3>
                  <p className="text-white/80 text-sm font-bold leading-relaxed mb-8 relative z-10">Zapisz się, aby otrzymywać powiadomienia o najważniejszych wydarzeniach w świecie PFF.</p>
                  
                  <div className="relative z-10 space-y-4">
                    <input 
                      type="email" 
                      placeholder="Adres e-mail" 
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-sm font-bold placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-white"
                    />
                    <button className="w-full bg-blue-600 text-white font-black uppercase italic tracking-[0.2em] py-5 rounded-2xl hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl text-xs">
                      Subskrybuj
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
