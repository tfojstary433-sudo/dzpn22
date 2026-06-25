'use client';

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Image from 'next/image';

export function PageLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show loader on mount (simulating initial load)
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div className="relative w-32 h-32 md:w-48 md:h-48 animate-pulse">
        <Image
          src="https://i.ibb.co/Rkz8MRSy/IMG-4837.png"
          alt="Liga Logo"
          fill
          className="object-contain"
        />
      </div>
      <div className="mt-8 flex flex-col items-center gap-2">
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 animate-loading-bar" />
        </div>
        <span className="text-blue-500 font-black text-xs uppercase tracking-[0.3em] animate-pulse">
          ŁADOWANIE...
        </span>
      </div>
    </div>
  );
}
