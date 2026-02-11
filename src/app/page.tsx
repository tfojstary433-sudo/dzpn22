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
      // Fallback for some browsers
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    scrollToTop();
    
    // Multiple attempts to ensure it works after various components load
    const timeouts = [
      setTimeout(scrollToTop, 100),
      setTimeout(scrollToTop, 500),
      setTimeout(scrollToTop, 1000)
    ];
    
    return () => timeouts.forEach(t => clearTimeout(t));
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
      <NewsSection />
      <Footer />
    </>
  );
}
