'use client';

import { useState, useEffect } from 'react';

interface RobloxAvatarProps {
  username: string;
  className?: string;
  style?: React.CSSProperties;
}

const avatarCache = new Map<string, string>();

export function RobloxAvatar({ username, className, style }: RobloxAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(avatarCache.get(username.trim()) || null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    if (!username) return;

    const fetchAvatar = async () => {
      const trimmedUsername = username.trim();
      if (!trimmedUsername) return;
      
      if (avatarCache.has(trimmedUsername)) {
        setAvatarUrl(avatarCache.get(trimmedUsername)!);
        return;
      }
      
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
