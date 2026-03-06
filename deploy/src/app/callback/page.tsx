'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code) {
      const apiPath = state === 'discord' ? '/api/auth/callback' : '/api/auth/roblox/callback';
      fetch(`${apiPath}?code=${code}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            // Save user info to localStorage
            if (state !== 'discord') {
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
                  email: data.email || existingUser.email
                };
              } else {
                userData = {
                  ...data,
                  discordId: data.id,
                  discordUsername: data.username,
                  discordAvatar: data.avatar,
                  discordRoles: data.discordRoles || []
                };
              }
              localStorage.setItem('discord_user', JSON.stringify(userData));
            }
            // Redirect to shop
            router.push('/sklep');
          }
        })
        .catch((err) => {
          console.error('Callback error:', err);
          setError('Wystąpił błąd podczas logowania.');
        });
    } else {
      setError('Brak kodu autoryzacyjnego.');
    }
  }, [searchParams, router]);

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
          <h1 className="text-2xl font-black uppercase tracking-widest">Autoryzacja...</h1>
          <p className="text-white/40 font-medium">Proszę czekać, łączymy z Roblox</p>
        </div>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <div className="w-16 h-16 border-4 border-[#00ccff] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
