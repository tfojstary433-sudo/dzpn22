'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Hide after 2 seconds (simulating load)
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    // Remove from DOM after transition
    const removeTimer = setTimeout(() => {
      setShouldRender(false);
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0a] transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="relative mb-6 animate-pulse">
        <Image 
          src="https://i.ibb.co/TMvjW970/logo.png" 
          alt="Loading Logo" 
          width={120} 
          height={120}
          className="object-contain"
          priority
        />
      </div>
      
      <div className="flex gap-2">
        <div className="w-2 h-2 bg-[#00337C] rounded-full animate-[bounce_1s_infinite_0ms]"></div>
        <div className="w-2 h-2 bg-[#00337C] rounded-full animate-[bounce_1s_infinite_200ms]"></div>
        <div className="w-2 h-2 bg-[#00337C] rounded-full animate-[bounce_1s_infinite_400ms]"></div>
      </div>
    </div>
  );
}
