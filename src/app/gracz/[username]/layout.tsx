import { Metadata } from 'next';
import { API_ENDPOINTS } from '@/lib/constants';

interface PlayerData {
  username: string;
  userId: string;
  currentClub: string;
  position: string;
  stats: {
    matches: number;
    goals: number;
    assists: number;
  };
}

async function getPlayerData(username: string): Promise<PlayerData | null> {
  try {
    const decodedUsername = decodeURIComponent(username).trim();
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://pff24.pl'}/api/players/${encodeURIComponent(decodedUsername)}`, {
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const player = await getPlayerData(params.username);
  const username = decodeURIComponent(params.username);

  if (!player) {
    return {
      title: `${username} - Profil Zawodnika | PFF`,
      description: `Zobacz statystyki i historię kariery zawodnika ${username} w Polskiej Federacji Futbolu.`
    };
  }

  const title = `${player.username} - Profil Zawodnika | PFF`;
  const description = `${player.username} (${player.position}) - Zawodnik klubu ${player.currentClub}. Statystyki: ${player.stats.matches} meczów, ${player.stats.goals} goli, ${player.stats.assists} asyst. Zobacz pełny profil w PFF!`;
  const avatarUrl = `https://www.roblox.com/headshot-thumbnail/image?userId=${player.userId}&width=420&height=420&format=png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: avatarUrl,
          width: 420,
          height: 420,
          alt: player.username,
        },
      ],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [avatarUrl],
    },
  };
}

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
