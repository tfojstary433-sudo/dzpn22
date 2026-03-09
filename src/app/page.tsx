'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Hero } from '@/components/hero';
import { DiscordBanner } from '@/components/discord-banner';
import { TournamentLogos } from '@/components/tournament-logos';
import { ScheduleTableOverlay } from '@/components/schedule-table-overlay';
import { NewsSection } from '@/components/news-section';
import { Footer } from '@/components/footer';

export default function Home() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'terminarz' | 'tabela' | 'live'>('terminarz');

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    scrollToTop();
    
    // Attempt once more after a small delay to handle component mounting
    const timeout = setTimeout(scrollToTop, 100);
    
    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <Navbar />
      <Hero setActiveTab={setActiveTab} setIsMinimized={setIsMinimized} />
      <TournamentLogos />
      <DiscordBanner />
      <ScheduleTableOverlay 
        isMinimized={isMinimized} 
        setIsMinimized={setIsMinimized} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <Footer />
    </>
  );
}
