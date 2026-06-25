'use client';

import { useState, useEffect } from 'react';
import { Star, Award, CheckCircle2 } from 'lucide-react';
import { RobloxAvatar } from './roblox-avatar';

interface MatchVotingProps {
  matchId: string;
  players: Array<{
    userId: string;
    username: string;
    team: string;
  }>;
}

export function MatchVoting({ matchId, players }: MatchVotingProps) {
  const [user, setUser] = useState<any>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [motmId, setMotmId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [votedRating, setVotedRating] = useState(false);
  const [votedMotm, setVotedMotm] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('discord_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    fetchResults();
  }, [matchId]);

  const fetchResults = async () => {
    try {
      const res = await fetch(`/api/matches/${matchId}/vote`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (err) {
      console.error('Error fetching results:', err);
    }
  };

  const handleRate = async (value: number) => {
    if (!user || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/matches/${matchId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id || user.discordId,
          rating: value,
          type: 'rating'
        })
      });
      if (res.ok) {
        setRating(value);
        setVotedRating(true);
        fetchResults();
      }
    } catch (err) {
      console.error('Rating error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoteMotm = async (playerId: string) => {
    if (!user || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/matches/${matchId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id || user.discordId,
          playerId,
          type: 'motm'
        })
      });
      if (res.ok) {
        setMotmId(playerId);
        setVotedMotm(true);
        fetchResults();
      }
    } catch (err) {
      console.error('MOTM error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="p-6 rounded-2xl border border-white/10 bg-white/5 text-center">
        <p className="text-white/60 mb-2">Zaloguj się, aby ocenić mecz i zagłosować na zawodnika meczu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Match Rating */}
      <div className="p-6 rounded-2xl border border-white/10 bg-white/5 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400" />
            Oceń ten mecz
          </h3>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleRate(star)}
                  className="transition-transform hover:scale-125"
                >
                  <Star 
                    className={`w-10 h-10 ${
                      (hoverRating || rating) >= star 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-white/20'
                    }`} 
                  />
                </button>
              ))}
            </div>

            {results?.averageRating && (
              <div className="flex flex-col items-center md:items-start border-l border-white/10 md:pl-8">
                <span className="text-4xl font-black text-white">{results.averageRating}</span>
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Średnia ocena ({results.ratingCount} głosów)</span>
              </div>
            )}
          </div>
          
          {votedRating && (
            <p className="mt-4 text-green-400 text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Dziękujemy za głos!
            </p>
          )}
        </div>
      </div>

      {/* MOTM Voting */}
      <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-6 flex items-center gap-2">
          <Award className="w-6 h-6 text-blue-400" />
          Zawodnik Meczu (MOTM)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player) => {
            const voteCount = results?.motm?.votes?.[player.userId] || 0;
            const isWinner = results?.motm?.winnerId === player.userId;
            const isVoted = motmId === player.userId;

            return (
              <button
                key={player.userId}
                onClick={() => handleVoteMotm(player.userId)}
                disabled={votedMotm || submitting}
                className={`relative group p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 ${
                  isVoted 
                    ? 'bg-blue-500/20 border-blue-500' 
                    : 'bg-white/5 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 flex-shrink-0">
                  <RobloxAvatar username={player.username} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex flex-col text-left overflow-hidden">
                  <span className="text-white font-black text-sm truncate">{player.username}</span>
                  <span className="text-white/40 text-[10px] font-bold uppercase tracking-wider">{player.team}</span>
                </div>

                {results?.motm?.totalVotes > 0 && (
                  <div className="ml-auto flex flex-col items-end">
                    <span className={`text-lg font-black ${isWinner ? 'text-yellow-400' : 'text-white/60'}`}>
                      {voteCount}
                    </span>
                    <span className="text-[8px] font-black text-white/20 uppercase">Głosów</span>
                  </div>
                )}

                {isWinner && (
                  <div className="absolute -top-2 -right-2">
                    <Award className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
