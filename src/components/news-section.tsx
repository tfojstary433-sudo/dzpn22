'use client';

import Image from 'next/image';
import Link from 'next/link';
import { newsArticles, sneakPeeks } from '@/lib/data';

interface Article {
  id: number;
  category: string;
  title: string;
  image: string;
  description?: string;
}

function NewsCard({ article, large = false, index = 0 }: { article: Article; large?: boolean; index?: number }) {
  if (large) {
    return (
      <Link
        href={`/aktualnosc/${article.id}`}
        className="group flex flex-col md:flex-row glass overflow-hidden rounded-xl transition-all duration-500 hover:border-[#00ccff]/50 max-w-5xl mx-auto shadow-2xl hover-lift shine-effect"
      >
        <div className="relative w-full md:w-2/5 aspect-[4/3] md:aspect-auto md:h-[300px] overflow-hidden">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
            suppressHydrationWarning={true}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30 opacity-50" />
          <div className="absolute bottom-4 left-4 px-3 py-1 bg-[#00ccff]/20 backdrop-blur-md rounded-full border border-[#00ccff]/30">
            <span className="text-xs font-black text-[#00ccff] tracking-wider uppercase">
              {article.category}
            </span>
          </div>
        </div>
        <div className="flex-1 p-6 md:p-10 flex flex-col justify-center bg-transparent backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ccff]/5 rounded-full blur-3xl" />
          <h3 className="text-2xl font-black text-white mb-4 leading-tight tracking-normal uppercase group-hover:text-[#00ccff] transition-colors duration-300">
            {article.title}
          </h3>
          {article.description && (
            <p className="text-gray-400 text-sm leading-relaxed font-medium line-clamp-4 group-hover:text-gray-300 transition-colors">
              {article.description}
            </p>
          )}
          <div className="mt-4 flex items-center gap-2 text-[#00ccff] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-sm font-black uppercase tracking-wider">Czytaj więcej</span>
            <svg className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" suppressHydrationWarning={true}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/aktualnosc/${article.id}`}
      className="group flex flex-col glass overflow-hidden rounded-xl transition-all duration-500 hover:border-[#00ccff]/50 shadow-2xl hover-lift"
    >
      <div className="relative w-full aspect-video overflow-hidden">
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover transition-all duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />
        <div className="absolute top-3 left-3 px-2 py-1 bg-[#00ccff]/20 backdrop-blur-md rounded-full border border-[#00ccff]/30">
          <span className="text-[10px] font-black text-[#00ccff] tracking-wider uppercase">
            {article.category}
          </span>
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-[#00ccff]/0 group-hover:bg-[#00ccff]/10 transition-colors duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" suppressHydrationWarning={true}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1 bg-gradient-to-b from-transparent to-[#0a0a0a]/50">
        <h3 className="text-base font-black text-white leading-snug tracking-normal uppercase line-clamp-3 group-hover:text-[#00ccff] transition-colors duration-300">
          {article.title}
        </h3>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">5 min czytania</span>
          <span className="text-[#00ccff] text-xs font-black opacity-0 group-hover:opacity-100 transition-opacity">→</span>
        </div>
      </div>
    </Link>
  );
}

export function NewsSection() {
  const largeArticles = newsArticles.slice(0, 2);
  const smallArticles = newsArticles.slice(2, 6);

  return (
    <section id="aktualnosci" className="py-20 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#00ccff]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#0066ff]/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="flex flex-col items-center mb-20">
          <div className="gradient-border px-16 py-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center relative overflow-hidden bg-transparent backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#00ccff] to-transparent" />
            <h2 className="relative z-10 text-4xl md:text-6xl font-black text-white tracking-tighter uppercase">
              Aktualności
            </h2>
            <div className="relative z-10 w-24 h-1.5 bg-gradient-to-r from-[#00ccff] to-[#0066ff] mt-4 transform -skew-x-12 shadow-[0_0_15px_rgba(0,204,255,0.5)]" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main content */}
          <div className="lg:col-span-4">
            {/* Large articles grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              {largeArticles.map((article, index) => (
                <NewsCard key={article.id} article={article} large index={index} />
              ))}
            </div>

            {/* Small articles grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {smallArticles.map((article, index) => (
                <NewsCard key={article.id} article={article} index={index + 2} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 flex justify-center">
          <Link 
            href="/aktualnosci"
            className="relative group px-12 py-4 rounded-xl font-black tracking-tighter uppercase transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#00ccff] to-[#0066ff] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-white/5 group-hover:bg-transparent transition-colors" />
            <div className="absolute inset-[1px] bg-[#0a0a0a] rounded-[10px] group-hover:bg-transparent transition-colors duration-300" />
            <span className="relative z-10 text-white group-hover:text-white transition-colors flex items-center gap-3">
              WIĘCEJ AKTUALNOŚCI
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
