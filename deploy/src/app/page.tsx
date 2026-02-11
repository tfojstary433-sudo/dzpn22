'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { ClubLogosBar } from '@/components/club-logos-bar';
import { Hero } from '@/components/hero';
import { DiscordBanner } from '@/components/discord-banner';
import { TournamentLogos } from '@/components/tournament-logos';
import { CompactMatchCountdown } from '@/components/compact-match-countdown';
import { ScheduleTableOverlay } from '@/components/schedule-table-overlay';
import { NewsSection } from '@/components/news-section';
import { Footer } from '@/components/footer';

export default function Home() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'terminarz' | 'tabela' | 'live' | 'statystyki'>('terminarz');

  return (
    <>
      <Navbar />
      <Hero setActiveTab={setActiveTab} setIsMinimized={setIsMinimized} />
      <TournamentLogos />
      <DiscordBanner />
      <CompactMatchCountdown isMinimized={isMinimized} />
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
