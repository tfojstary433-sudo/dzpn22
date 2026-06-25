'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Newspaper, Calendar, ArrowRight } from 'lucide-react';
import { newsArticles as staticNewsArticles } from '@/lib/data';

interface RelatedNewsProps {
  searchTerm: string;
  limit?: number;
  title?: string;
}

export function RelatedNews({ searchTerm, limit = 5, title = "Ostatnie newsy" }: RelatedNewsProps) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev/api/articles');
        let allArticles = [];
        
        if (response.ok) {
          const data = await response.json();
          const mappedArticles = data.map((a: any) => ({
            id: a.id,
            title: a.title,
            content: a.content,
            image: a.imageUrl || 'https://i.ibb.co/TB027G07/czarnepff-1.png',
            category: a.category || 'News',
            date: new Date(a.publishedAt || a.createdAt).toLocaleDateString('pl-PL'),
            author: a.author
          }));
          allArticles = [...mappedArticles, ...staticNewsArticles];
        } else {
          allArticles = staticNewsArticles;
        }

        // Filtrowanie po słowie kluczowym (zawodnik lub klub)
        const filtered = allArticles.filter(article => {
          const searchLower = searchTerm.toLowerCase().trim();
          const titleLower = article.title.toLowerCase();
          const contentLower = (article.content || '').toLowerCase();
          
          // Podstawowe dopasowanie (cały nick)
          if (titleLower.includes(searchLower) || contentLower.includes(searchLower)) return true;
          
          // Elastyczne dopasowanie (np. Pako7u7lol -> Pako)
          // Wyciągamy rdzeń nazwy (usuwamy cyfry i znaki specjalne z końca)
          const nameCore = searchLower.replace(/[^a-z]+.*$/i, '');
          if (nameCore.length >= 3) {
            if (titleLower.includes(nameCore) || contentLower.includes(nameCore)) return true;
          }
          
          return false;
        });

        setArticles(filtered.slice(0, limit));
      } catch (error) {
        console.error('Error fetching related news:', error);
        // Fallback to static articles if API fails
        const filtered = (staticNewsArticles as any[]).filter(article => {
          const searchLower = searchTerm.toLowerCase().trim();
          const titleLower = article.title.toLowerCase();
          const contentLower = (article.content || '').toLowerCase();
          
          if (titleLower.includes(searchLower) || contentLower.includes(searchLower)) return true;
          
          const nameCore = searchLower.replace(/[^a-z]+.*$/i, '');
          if (nameCore.length >= 3) {
            if (titleLower.includes(nameCore) || contentLower.includes(nameCore)) return true;
          }
          
          return false;
        });
        setArticles(filtered.slice(0, limit));
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [searchTerm, limit]);

  if (loading) {
    return (
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/5 rounded-[32px] p-8 animate-pulse">
        <div className="h-6 w-32 bg-white/10 rounded-lg mb-8" />
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-4">
              <div className="w-20 h-20 bg-white/10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-full bg-white/10 rounded" />
                <div className="h-3 w-20 bg-white/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (articles.length === 0) return null;

  return (
    <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/5 rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[50px] rounded-full -mr-16 -mt-16" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-sm font-black uppercase italic tracking-[0.2em] text-white/40 flex items-center gap-3">
            <Newspaper className="w-4 h-4 text-blue-500" />
            {title}
          </h3>
        </div>

        <div className="space-y-8">
          {articles.map((article) => (
            <Link 
              key={article.id} 
              href={`/aktualnosc/${article.id}`}
              className="group flex gap-5 items-start p-3 -m-3 rounded-2xl hover:bg-white/[0.03] transition-all duration-300"
            >
              <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-white/5 shadow-lg">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <h4 className="text-sm md:text-base font-black uppercase italic tracking-tight text-white/80 group-hover:text-blue-400 transition-colors line-clamp-2 leading-[1.1]">
                  {article.title}
                </h4>
                <div className="flex items-center gap-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                  <span>{article.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link 
          href="/aktualnosci"
          className="mt-8 w-full flex items-center justify-center gap-3 py-4 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:bg-white/5 hover:text-white transition-all group/btn"
        >
          Wszystkie aktualności
          <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
