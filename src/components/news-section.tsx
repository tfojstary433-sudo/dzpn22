'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { newsArticles as staticNews } from '@/lib/data';
import { getNews } from '@/lib/firebase';
import { Calendar, ArrowRight } from 'lucide-react';

interface Article {
  id: string | number;
  category: string;
  title: string;
  image: string;
  description?: string;
  date?: string;
}

function NewsCard({ article, large = false }: { article: Article; large?: boolean }) {
  if (large) {
    return (
      <Link
        href={`/aktualnosc/${article.id}`}
        className="group relative flex flex-col lg:flex-row bg-[#0d1526]/40 backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden hover:border-blue-500/30 transition-all duration-500 shadow-2xl"
      >
        <div className="relative w-full lg:w-[55%] aspect-video lg:aspect-auto overflow-hidden">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover transition-all duration-1000 group-hover:scale-105"
            suppressHydrationWarning={true}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        </div>
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-4 py-1.5 bg-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              WYRÓŻNIONE
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
              {article.category}
            </span>
          </div>
          <h3 className="text-3xl md:text-5xl font-black text-white mb-6 leading-[1.1] uppercase italic tracking-tighter group-hover:text-blue-400 transition-colors duration-300">
            {article.title}
          </h3>
          {article.description && (
            <p className="text-white/40 text-sm md:text-base leading-relaxed font-medium line-clamp-3 mb-10 group-hover:text-white/60 transition-colors">
              {article.description}
            </p>
          )}
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/20">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold uppercase tracking-widest">{article.date || '10.01.2026'}</span>
            </div>
            <div className="flex items-center gap-2 text-blue-500 group-hover:translate-x-2 transition-transform duration-300">
              <span className="text-xs font-black uppercase tracking-widest">Czytaj artykuł</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/aktualnosc/${article.id}`}
      className="group flex flex-col bg-[#0d1526]/40 backdrop-blur-xl border border-white/5 rounded-[32px] overflow-hidden hover:border-blue-500/20 transition-all duration-500 shadow-2xl"
    >
      <div className="relative w-full aspect-[16/10] overflow-hidden">
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover transition-all duration-1000 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <span className="px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-xl text-[10px] font-black text-white tracking-widest uppercase border border-white/10 group-hover:bg-blue-600 transition-colors">
            {article.category}
          </span>
        </div>
      </div>
      <div className="p-8 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-4 text-white/20">
          <Calendar className="w-4 h-4 text-blue-500/50" />
          <span className="text-[10px] font-bold uppercase tracking-widest">{article.date || '10.01.2026'}</span>
        </div>
        <h3 className="text-xl font-black text-white leading-[1.2] uppercase italic tracking-tighter mb-4 group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
          {article.title}
        </h3>
        {article.description && (
          <p className="text-white/40 text-xs leading-relaxed font-medium line-clamp-3 mb-8 group-hover:text-white/60 transition-colors">
            {article.description}
          </p>
        )}
        <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest group-hover:translate-x-1 transition-transform">Czytaj więcej</span>
          <ArrowRight className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

export function NewsSection() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      const firebaseNews = await getNews();
      const combined = [...firebaseNews, ...staticNews.filter(sn => !firebaseNews.find(fn => fn.title === sn.title))];
      
      // Sort by date (already handled in getNews, but just in case for static news)
      combined.sort((a, b) => {
        const parseDate = (dateStr: string | undefined) => {
          if (!dateStr) return 0;
          if (dateStr.includes('-')) return new Date(dateStr).getTime();
          const [datePart] = dateStr.split(',');
          const [day, month, year] = datePart.trim().split('.');
          return new Date(`${year}-${month}-${day}`).getTime();
        };
        return parseDate(b.date) - parseDate(a.date);
      });

      setArticles(combined);
      setIsLoading(false);
    }
    fetchNews();
  }, []);

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const featuredArticle = articles[0];
  const otherArticles = articles.slice(1, 4);

  return (
    <section id="aktualnosci" className="py-20 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-400/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="flex flex-col items-center mb-20">
          <div className="relative">
            <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase italic text-center">
              Aktualności <span className="text-white/10">PFF</span>
            </h2>
            <div className="w-24 h-2 bg-blue-600 mx-auto mt-6 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)]" />
          </div>
        </div>

        <div className="space-y-12">
          {featuredArticle && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <NewsCard article={featuredArticle} large />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherArticles.map((article, index) => (
              <div key={article.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
                <NewsCard article={article} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex justify-center">
          <Link 
            href="/aktualnosci"
            className="group relative px-12 py-5 bg-white/5 border border-white/10 rounded-2xl font-black tracking-widest uppercase transition-all overflow-hidden hover:bg-blue-600 hover:border-blue-400 shadow-xl"
          >
            <span className="relative z-10 text-white flex items-center gap-3">
              ZOBACZ WSZYSTKIE WPISY
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
