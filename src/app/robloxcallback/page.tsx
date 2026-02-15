'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
      console.log('Fetching from:', apiPath, 'with code:', code.slice(0, 5) + '...');
      
      fetch(`${apiPath}?code=${code}`)
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'Błąd serwera podczas autoryzacji.');
          }
          return data;
        })
        .then((data) => {
          console.log('Auth success data:', data);
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
          setError(err.message || 'Wystąpił błąd podczas logowania.');
          // Remove code from URL even on error
          window.history.replaceState({}, '', '/robloxcallback');
        });
    } else {
      setError('Brak kodu autoryzacyjnego.');
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white p-4">
        <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl max-w-md w-full text-center">
          <h1 className="text-2xl font-black mb-4 uppercase">Błąd logowania</h1>
          <p className="text-white/60 mb-6">{error}</p>
          <button 
            onClick={() => router.push('/sklep')}
            className="w-full bg-white text-black font-black py-3 rounded-xl uppercase tracking-tight"
          >
            Powrót do sklepu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-8 p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl max-w-md w-full mx-4">
        {countdown !== null ? (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-green-500/20 border-4 border-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-center mb-2">
              Pomyślnie zalogowano!
            </h1>
            <p className="text-white/60 font-bold text-center">
              Przekierowanie do sklepu za <span className="text-green-500">{countdown}s</span>...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-[#00ccff] border-t-transparent rounded-full animate-spin mb-6"></div>
            <h1 className="text-2xl font-black uppercase tracking-widest text-center">
              Autoryzacja...
            </h1>
            <p className="text-white/40 font-medium text-center mt-2">
              Proszę czekać, łączymy z Roblox
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
