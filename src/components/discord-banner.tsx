'use client';

import { useEffect, useState } from 'react';

export function DiscordBanner() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="container mx-auto px-4 -mt-8 mb-12 relative z-20">
      <a 
        href="https://discord.gg/R7y6ZnczP4" 
        target="_blank" 
        rel="noopener noreferrer"
        className="group relative block overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(255,255,255,0.05)]"
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xl group-hover:bg-black/50 transition-colors duration-500" />
        
        {/* Discord-style background patterns (abstract) */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.02]">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,0 L100,0 L100,100 Z" fill="white" />
          </svg>
        </div>

        {/* Glow effects */}
        <div className="absolute -inset-1 bg-gradient-to-r from-white/5 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10 rounded-2xl">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 group-hover:rotate-[10deg] transition-transform duration-500 shadow-xl">
              <svg className="w-10 h-10 md:w-12 md:h-12 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.572.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.125-.094.249-.192.37-.291a.072.072 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.072.072 0 0 1 .078.01c.12.098.246.196.373.291a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2 italic">
                Dołącz do naszej społeczności!
              </h2>
              <p className="text-white/40 font-black text-[10px] md:text-xs uppercase tracking-[0.2em]">
                Wbijaj na oficjalny serwer Discord PFF i bądź na bieżąco.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 text-white/80 px-8 py-4 rounded-xl font-black uppercase tracking-wider border border-white/10 group-hover:bg-white/10 group-hover:text-white transition-all duration-300 shadow-lg">
            <span>Dołącz teraz</span>
            <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </a>
    </div>
  );
}
