'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code) {
      const isDiscord = state === 'discord' || state?.startsWith('discord:');
      const apiPath = isDiscord ? '/api/auth/callback' : '/api/auth/roblox/callback';
      fetch(`${apiPath}?code=${code}&state=${state || ''}`)
        .then((res) => res.json())
        .then((data) => {
          // Remove code from URL to prevent reuse on refresh
          window.history.replaceState({}, '', '/callback');

          if (data.error) {
            setError(data.error);
          } else {
            // Save user info to localStorage
            if (!isDiscord) {
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
              const existingUserStr = localStorage.getItem('discord_user');
              let userData;
              if (existingUserStr) {
                const existingUser = JSON.parse(existingUserStr);
                userData = {
                  ...existingUser,
                  discordId: data.id,
                  discordUsername: data.username,
                  discordAvatar: data.avatar,
                  discordRoles: data.discordRoles || [],
                  discordRoleNames: data.discordRoleNames || {},
                  email: data.email || existingUser.email,
                  robloxId: data.robloxId || existingUser.robloxId
                };
              } else {
                userData = {
                  ...data,
                  discordId: data.id,
                  discordUsername: data.username,
                  discordAvatar: data.avatar,
                  discordRoles: data.discordRoles || [],
                  discordRoleNames: data.discordRoleNames || {},
                  robloxId: data.robloxId
                };
              }
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
          window.history.replaceState({}, '', '/callback');
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
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-[#00ccff] border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <h1 className="text-2xl font-black uppercase tracking-widest">
            {countdown !== null ? `Przekierowanie za ${countdown}s` : 'Autoryzacja...'}
          </h1>
          <p className="text-white/40 font-medium">
            {countdown !== null ? 'Pomyślnie zalogowano!' : 'Proszę czekać, łączymy z Roblox'}
          </p>
        </div>
      </div>
    </div>
  );
}
