'use client';

import { useState, useEffect } from 'react';

interface RobloxAvatarProps {
  username: string;
  className?: string;
  style?: React.CSSProperties;
}

const avatarCache = new Map<string, string>();

export async function seedAvatarCache(usernames: string[]) {
  const toFetch = usernames.filter(u => u && !avatarCache.has(u.trim()));
  if (toFetch.length === 0) return;

  try {
    const response = await fetch('/api/roblox/avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernames: toFetch })
    });
    if (response.ok) {
      const { data } = await response.json();
      Object.entries(data).forEach(([username, result]: [string, any]) => {
        avatarCache.set(username.trim(), result.avatarUrl);
      });
    }
  } catch (error) {
    console.error('Failed to seed avatar cache', error);
  }
}

export function RobloxAvatar({ username, className, style }: RobloxAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    if (!username) return;
    const trimmedUsername = username.trim();
    if (!trimmedUsername) return;

    if (avatarCache.has(trimmedUsername)) {
      setAvatarUrl(avatarCache.get(trimmedUsername)!);
      return;
    }
    
    // Check cache every 100ms for 2 seconds to see if it was seeded
    let checks = 0;
    const interval = setInterval(() => {
      if (avatarCache.has(trimmedUsername)) {
        setAvatarUrl(avatarCache.get(trimmedUsername)!);
        clearInterval(interval);
      }
      if (++checks > 20) clearInterval(interval);
    }, 100);

    const fetchAvatar = async () => {
      if (avatarCache.has(trimmedUsername)) return;
      
      try {
        const response = await fetch(`/api/roblox/avatar?username=${encodeURIComponent(trimmedUsername)}`, {
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          avatarCache.set(trimmedUsername, data.avatarUrl);
          setAvatarUrl(data.avatarUrl);
        }
      } catch (error) {
        console.error('Failed to fetch roblox avatar for', username, error);
      }
    };

    fetchAvatar();
    return () => clearInterval(interval);
  }, [username]);

  if (!avatarUrl) {
    return <div className={`${className} bg-gray-800 animate-pulse rounded-full`} style={style} />;
  }

  return (
    <img 
      src={avatarUrl} 
      alt={username} 
      className={`${className} transition-opacity duration-300 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
      style={style}
      onLoad={() => setIsImageLoaded(true)}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  );
}
