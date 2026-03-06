'use client';

import { useEffect, useState } from 'react';

export function DateBar() {
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const date = new Date();
    const formattedDate = date.toLocaleDateString('pl-PL', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    
    // Capitalize the first letter of the weekday
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    setCurrentDate(capitalizedDate);
  }, []);

  return (
    <div className="relative py-8 bg-[#0a0a0a] overflow-hidden">
      {/* Decorative lines */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00ccff]/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00ccff]/30 to-transparent"></div>
      
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto relative group">
          {/* Outer glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#00ccff]/20 via-[#0066ff]/20 to-[#00ccff]/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition duration-1000"></div>
          
          <div className="relative flex items-center justify-center gap-6 bg-white/5 border border-white/10 backdrop-blur-md py-4 px-8 rounded-2xl shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00ccff]/10 border border-[#00ccff]/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#00ccff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00ccff]/60 mb-0.5">Aktualna Data</span>
                <p className="text-xl font-black text-white uppercase tracking-tighter leading-none">
                  {currentDate || '...'}
                </p>
              </div>
            </div>

            <div className="w-[1px] h-8 bg-white/10 hidden sm:block"></div>

            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00ccff] animate-pulse shadow-[0_0_8px_rgba(0,204,255,0.8)]"></div>
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Live System</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
