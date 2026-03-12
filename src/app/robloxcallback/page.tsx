'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { XCircle, ShieldAlert, MessageCircle, AlertTriangle } from 'lucide-react';

export default function RobloxCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state') || 'roblox';

    if (code) {
      const apiPath = state === 'discord' ? '/api/auth/callback' : '/api/auth/roblox/callback';
      fetch(`${apiPath}?code=${code}`)
        .then((res) => res.json())
        .then((data) => {
          // Remove code from URL to prevent reuse on refresh
          window.history.replaceState({}, '', '/robloxcallback');

          if (data.error) {
            setError(data.error);
          } else {
            // Save user info to localStorage
            if (state !== 'discord') {
              // Save roblox_id for future Discord connections
              localStorage.setItem('roblox_id', data.robloxId);
              
              // Format data for Roblox user
              const userData = {
                id: data.robloxId,
                username: data.robloxUsername,
                global_name: data.robloxUsername,
                robloxId: data.robloxId,
                robloxUsername: data.robloxUsername,
                avatar: null // Will be handled by RobloxAvatar component
              };
              localStorage.setItem('discord_user', JSON.stringify(userData));
            } else {
              const savedRobloxId = localStorage.getItem('roblox_id');
              const userData = { ...data, robloxId: savedRobloxId || null };
              localStorage.setItem('discord_user', JSON.stringify(userData));
            }

            // Start 5-second countdown before redirect
            setCountdown(5);
          }
        })
        .catch((err) => {
          console.error('Callback error:', err);
          setError('Wystąpił błąd podczas logowania.');
          // Remove code from URL even on error
          window.history.replaceState({}, '', '/robloxcallback');
        });
    } else if (!window.location.search.includes('code=')) {
        // Only show error if no code is present and we're not in the middle of a process
        // setError('Brak kodu autoryzacyjnego.');
    }
  }, [router]);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      router.push('/sklep');
    }
  }, [countdown, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-transparent text-white font-sans relative">
        <div className="fixed inset-0 z-0 bg-transparent">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105"
            style={{ backgroundImage: 'url(https://i.ibb.co/mCNVZdMn/osr-4.png)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-red-900/40 via-red-900/20 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          
          <main className="container mx-auto px-4 flex-grow flex items-center justify-center py-24 text-center">
            <div className="max-w-2xl mx-auto space-y-12">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 blur-[100px] rounded-full scale-150 animate-pulse" />
                <div className="relative bg-red-500/10 border border-red-500/30 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-12 animate-in zoom-in duration-500">
                  <XCircle className="w-16 h-16 text-red-400" />
                </div>
              </div>

              <div className="space-y-6">
                <h1 className="text-6xl font-black uppercase tracking-tighter">
                  Błąd <span className="text-red-400">Logowania!</span>
                </h1>
                <p className="text-xl text-white/60 leading-relaxed font-medium">
                  {error}
                </p>
                {error.includes('multikonto') && (
                  <p className="text-lg text-red-400/80 font-bold uppercase tracking-wide animate-pulse">
                    Wykryto próbę połączenia z innym kontem Roblox!
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12 text-left">
                <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl space-y-4">
                  <div className="bg-red-500/10 w-12 h-12 rounded-2xl flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-tight">Blokada Logowania</h3>
                  <p className="text-white/40 text-sm leading-relaxed">
                    Jeśli ta informacja się pojawiła, możliwe że dostałeś bana i twoje logowanie jest zablokowane na stałe lub tymczasowo.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl space-y-4">
                  <div className="bg-blue-500/10 w-12 h-12 rounded-2xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-tight">Wsparcie Techniczne</h3>
                  <p className="text-white/40 text-sm leading-relaxed">
                    Jeśli uważasz, że to błąd, stwórz ticketa na naszym serwerze Discord:
                    <a 
                      href="https://discord.gg/hMNfcmwEkj" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block mt-2 text-blue-400 hover:text-blue-300 font-bold underline transition-colors"
                    >
                      discord.gg/hMNfcmwEkj
                    </a>
                  </p>
                </div>
              </div>

              <div className="pt-12">
                <button 
                  onClick={() => router.push('/sklep')}
                  className="bg-white hover:bg-white/90 text-black font-black px-12 py-5 rounded-2xl uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                >
                  Powrót do sklepu
                </button>
              </div>
            </div>
          </main>

          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white font-sans relative">
      <div className="fixed inset-0 z-0 bg-transparent">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105"
          style={{ backgroundImage: 'url(https://i.ibb.co/mCNVZdMn/osr-4.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 via-blue-900/20 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        
        <main className="container mx-auto px-4 flex-grow flex items-center justify-center py-24 text-center">
          <div className="max-w-2xl mx-auto space-y-12">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full scale-150 animate-pulse" />
              <div className="relative bg-blue-500/10 border border-blue-500/30 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-12 animate-in zoom-in duration-500">
                <div className="w-16 h-16 border-4 border-[#00ccff] border-t-transparent rounded-full animate-spin" />
              </div>
            </div>

            <div className="space-y-6">
              <h1 className="text-6xl font-black uppercase tracking-tighter">
                {countdown !== null ? 'Pomyślnie' : 'Proces'} <span className="text-[#00ccff]">{countdown !== null ? 'Zalogowano!' : 'Logowania...'}</span>
              </h1>
              <p className="text-xl text-white/60 leading-relaxed font-medium">
                {countdown !== null ? `Przekierowanie do sklepu za ${countdown} sekund...` : 'Proszę czekać, łączymy z systemem Roblox i Discord.'}
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
