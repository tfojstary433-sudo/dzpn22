'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useParams } from 'next/navigation';
import { teams, newsArticles } from '@/lib/data';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function KlubPage() {
  const params = useParams();
  const id = params.id as string;
  const team = teams.find(t => t.id === id);
  const [activeTab, setActiveTab] = useState<'o-klubie' | 'zespół' | 'statystyki'>('o-klubie');

  if (!team) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white text-2xl">Klub nie został znaleziony</div>
      </div>
    );
  }

  const teamColor = team.color || '#003087';
  
  // Dynamic news filtering based on tags or mentions in title/description
  const clubNews = newsArticles.filter(article => {
    const isRelatedById = (article as any).relatedTeamIds?.includes(team.id);
    
    const searchText = `${article.title} ${article.description || ''}`.toLowerCase();
    const isMentionedByName = team.name && searchText.includes(team.name.toLowerCase());
    const isMentionedByShortName = team.shortName && searchText.includes(team.shortName.toLowerCase());
    
    return isRelatedById || isMentionedByName || isMentionedByShortName;
  });

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <div 
        className="relative py-20 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${teamColor}dd 0%, ${teamColor}88 50%, #000000 100%)`
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 40px)`
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative">
              <div 
                className="absolute inset-0 blur-3xl opacity-50"
                style={{ backgroundColor: teamColor }}
              ></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
                <img 
                  src={team.logo} 
                  alt={team.name}
                  className="w-32 h-32 object-contain drop-shadow-2xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-logo.png';
                  }}
                />
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-5xl md:text-6xl font-black text-white mb-3 uppercase tracking-tight drop-shadow-lg">
                {team.name}
              </h1>
              <p className="text-white/80 text-lg font-bold tracking-wide">POLSKA FEDERACJA FUTBOLU</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-black border-b-4" style={{ borderColor: teamColor }}>
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('o-klubie')}
              className={`px-6 py-3 font-black text-sm uppercase transition-all ${
                activeTab === 'o-klubie'
                  ? 'text-white'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
              style={{ backgroundColor: activeTab === 'o-klubie' ? teamColor : undefined }}
            >
              O KLUBIE
            </button>
            <button
              onClick={() => setActiveTab('zespół')}
              className={`px-6 py-3 font-black text-sm uppercase transition-all ${
                activeTab === 'zespół'
                  ? 'text-white'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
              style={{ backgroundColor: activeTab === 'zespół' ? teamColor : undefined }}
            >
              ZESPÓŁ
            </button>
            <button
              onClick={() => setActiveTab('statystyki')}
              className={`px-6 py-3 font-black text-sm uppercase transition-all ${
                activeTab === 'statystyki'
                  ? 'text-white'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
              style={{ backgroundColor: activeTab === 'statystyki' ? teamColor : undefined }}
            >
              STATYSTYKI
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div 
        className="relative min-h-[60vh] py-16"
        style={{
          backgroundImage: 'url(https://i.ibb.co/G4rD13m6/tlo.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/80"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          {activeTab === 'o-klubie' && (
            <div>
              <h2 className="text-3xl font-black text-white mb-8 uppercase border-l-4 pl-4" style={{ borderColor: teamColor }}>INFORMACJE O KLUBIE</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                <div className="bg-gradient-to-br from-gray-900/90 to-black/90 p-6 rounded-xl border border-white/10 backdrop-blur-sm group hover:border-white/20 transition-all">
                  <h3 className="text-xs font-black mb-3 uppercase tracking-wider opacity-60" style={{ color: teamColor }}>Data Powstania Klubu</h3>
                  <p className="text-white text-3xl font-black">{team.founded || '-'}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-900/90 to-black/90 p-6 rounded-xl border border-white/10 backdrop-blur-sm group hover:border-white/20 transition-all">
                  <h3 className="text-xs font-black mb-3 uppercase tracking-wider opacity-60" style={{ color: teamColor }}>Prezes</h3>
                  <p className="text-white text-xl font-bold uppercase">{team.president || 'MLODYPIKEL'}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-900/90 to-black/90 p-6 rounded-xl border border-white/10 backdrop-blur-sm group hover:border-white/20 transition-all">
                  <h3 className="text-xs font-black mb-3 uppercase tracking-wider opacity-60" style={{ color: teamColor }}>Trener</h3>
                  <p className="text-white text-xl font-bold uppercase">{team.coach || 'MLODYPIKEL'}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-900/90 to-black/90 p-6 rounded-xl border border-white/10 backdrop-blur-sm group hover:border-white/20 transition-all">
                  <h3 className="text-xs font-black mb-3 uppercase tracking-wider opacity-60" style={{ color: teamColor }}>Zarząd Klubu</h3>
                  <p className="text-white text-xl font-bold uppercase">{team.spokesperson || '.PAKO7U7'}</p>
                </div>
              </div>

              {team.achievements && (
                <div>
                  <h2 className="text-3xl font-black text-white mb-8 uppercase border-l-4 pl-4" style={{ borderColor: teamColor }}>SUKCESY KLUBU</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {team.achievements.titles && team.achievements.titles.count > 0 && (
                      <div className="bg-gradient-to-br from-white/5 to-black/90 p-8 rounded-2xl border-2 backdrop-blur-sm transition-all hover:scale-105" style={{ borderColor: `${teamColor}44` }}>
                        <div className="text-7xl font-black mb-4 drop-shadow-lg" style={{ color: teamColor }}>{team.achievements.titles.count}×</div>
                        <p className="text-white text-xl font-black mb-2">MISTRZ POLSKI</p>
                        <p className="text-gray-400 text-sm font-bold">{team.achievements.titles.years}</p>
                      </div>
                    )}
                    
                    {team.achievements.viceTitles && team.achievements.viceTitles.count > 0 && (
                      <div className="bg-gradient-to-br from-white/5 to-black/90 p-8 rounded-2xl border-2 backdrop-blur-sm transition-all hover:scale-105" style={{ borderColor: 'rgba(156, 163, 175, 0.3)' }}>
                        <div className="text-7xl font-black text-gray-300 mb-4 drop-shadow-lg">{team.achievements.viceTitles.count}×</div>
                        <p className="text-white text-xl font-black mb-2">WICEMISTRZ POLSKI</p>
                        <p className="text-gray-400 text-sm font-bold">{team.achievements.viceTitles.years}</p>
                      </div>
                    )}
                    
                    {team.achievements.cups && team.achievements.cups.count > 0 && (
                      <div className="bg-gradient-to-br from-white/5 to-black/90 p-8 rounded-2xl border-2 backdrop-blur-sm transition-all hover:scale-105" style={{ borderColor: 'rgba(249, 115, 22, 0.3)' }}>
                        <div className="text-7xl font-black text-orange-500 mb-4 drop-shadow-lg">{team.achievements.cups.count}×</div>
                        <p className="text-white text-xl font-black mb-2">PUCHAR POLSKI</p>
                        <p className="text-gray-400 text-sm font-bold">{team.achievements.cups.years}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'zespół' && (
            <div>
              <h2 className="text-3xl font-black text-white mb-8 uppercase border-l-4 pl-4" style={{ borderColor: teamColor }}>SKŁAD ZESPOŁU</h2>
              <div className="bg-gradient-to-br from-gray-900/90 to-black/90 p-8 rounded-xl border border-white/10 backdrop-blur-sm">
                <p className="text-gray-400 text-lg">Brak danych o składzie</p>
              </div>
            </div>
          )}

          {activeTab === 'statystyki' && (
            <div>
              <h2 className="text-3xl font-black text-white mb-8 uppercase border-l-4 pl-4" style={{ borderColor: teamColor }}>STATYSTYKI DRUŻYNY</h2>
              <div className="bg-gradient-to-br from-gray-900/90 to-black/90 p-8 rounded-xl border border-white/10 backdrop-blur-sm">
                <p className="text-gray-400 text-lg">Brak dostępnych statystyk</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Club News Section */}
      <div className="bg-black py-20 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Aktualności Klubu</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>

          {clubNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {clubNews.map(article => (
                <Link 
                  key={article.id} 
                  href={`/aktualnosc/${article.id}`}
                  className="group block bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden transition-all hover:border-white/20"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <Image 
                      src={article.image} 
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="text-[10px] font-black px-2 py-1 rounded-full text-white uppercase tracking-widest" style={{ backgroundColor: teamColor }}>
                        {article.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-black text-white uppercase leading-tight group-hover:text-[#00ccff] transition-colors mb-3">
                      {article.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2">
                      {article.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 rounded-2xl p-12 text-center border border-dashed border-white/10">
              <p className="text-gray-500 font-bold uppercase tracking-widest">Brak aktualności dla tego klubu</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
