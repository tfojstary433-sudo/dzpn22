'use client';

import { useState } from 'react';
import { useMatchStats } from '@/lib/useMatchStats';
import { teams, matches } from '@/lib/data';

export function AdminMatchPanel() {
  const { saveMatchResult } = useMatchStats();
  const [isOpen, setIsOpen] = useState(false);
  const [matchId, setMatchId] = useState('m1');
  const [homeScore, setHomeScore] = useState(2);
  const [awayScore, setAwayScore] = useState(1);
  const [scorerName, setScorerName] = useState('');
  const [scorerId, setScorerId] = useState('');
  const [scorerTeam, setScorerTeam] = useState('ARK');
  const [scorerGoals, setScorerGoals] = useState(1);
  const [scorers, setScorers] = useState<Array<{playerName: string; playerId: number; teamId: string; goals: number}>>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const addScorer = () => {
    if (!scorerName.trim()) {
      alert('Wpisz imię gracza!');
      return;
    }
    if (!scorerId.trim()) {
      alert('Wpisz Roblox User ID!');
      return;
    }
    
    setScorers([...scorers, {
      playerName: scorerName,
      playerId: Number(scorerId),
      teamId: scorerTeam,
      goals: scorerGoals
    }]);
    setScorerName('');
    setScorerId('');
    setScorerGoals(1);
  };

  const handleSubmit = async () => {
    console.log('🎯 [Admin Panel] Rozpoczęcie zapisywania meczu...');

    const match = matches.find(m => m.id === matchId);
    if (!match) {
      alert('Mecz nie znaleziony!');
      return;
    }

    if (scorers.length === 0) {
      alert('Dodaj przynajmniej jednego strzelca!');
      return;
    }

    console.log('📋 [Admin Panel] Dane do zapisania:', {
      matchId,
      homeTeamId: match.homeTeam!.id,
      awayTeamId: match.awayTeam!.id,
      homeScore,
      awayScore,
      scorers
    });

    const result = await saveMatchResult({
      matchId,
      homeTeamId: match.homeTeam!.id,
      awayTeamId: match.awayTeam!.id,
      homeScore,
      awayScore,
      scorers: scorers.map(s => ({
        ...s,
        avatarUrl: `https://www.roblox.com/headshot-thumbnail/image?userId=${s.playerId}&width=420&height=420&format=png`
      }))
    });

    console.log('📊 [Admin Panel] Wynik zapisywania:', result);

    if (result.success) {
      alert('✅ Wynik meczu zapisany!\n\nOdśwież stronę aby zobaczyć zmiany.');
      setScorers([]);
      setHomeScore(0);
      setAwayScore(0);
      window.location.reload();
    } else {
      alert('❌ Błąd zapisywania wyniku: ' + JSON.stringify(result.error));
    }
  };

  const handleSyncStats = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/sync-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ competitionId: 'PL' }),
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Statystyki zsynchronizowane z API zewnętrznym!\n\nOdśwież stronę aby zobaczyć zmiany.');
        window.location.reload();
      } else {
        alert('❌ Błąd synchronizacji: ' + result.error);
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('❌ Błąd synchronizacji statystyk');
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-full shadow-2xl z-50 flex items-center gap-2 border-2 border-blue-400"
      >
        ⚽ Admin Panel
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gradient-to-br from-slate-900 to-blue-950 text-white p-6 rounded-2xl shadow-2xl max-w-md z-50 border-2 border-blue-600 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">⚽ Admin - Zakończ Mecz</h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">✕</button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Wybierz Mecz</label>
          <select 
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            className="w-full bg-slate-800 border border-blue-600/30 rounded-lg px-3 py-2 text-sm"
          >
            {matches.slice(0, 20).map(m => (
              <option key={m.id} value={m.id}>
                {m.homeTeam!.shortName} vs {m.awayTeam!.shortName} (Kolejka {m.round})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Wynik Gospodarzy</label>
            <input
              type="number"
              value={homeScore}
              onChange={(e) => setHomeScore(Number(e.target.value))}
              className="w-full bg-slate-800 border border-blue-600/30 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Wynik Gości</label>
            <input
              type="number"
              value={awayScore}
              onChange={(e) => setAwayScore(Number(e.target.value))}
              className="w-full bg-slate-800 border border-blue-600/30 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div className="border-t border-blue-600/30 pt-4">
          <h4 className="font-bold mb-3">Dodaj Strzelca</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Imię gracza</label>
              <input
                type="text"
                value={scorerName}
                onChange={(e) => setScorerName(e.target.value)}
                placeholder="np. Marc Pelaz"
                className="w-full bg-slate-800 border border-blue-600/30 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Roblox User ID</label>
              <input
                type="text"
                value={scorerId}
                onChange={(e) => setScorerId(e.target.value)}
                placeholder="123456789"
                className="w-full bg-slate-800 border border-blue-600/30 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Drużyna</label>
                <select
                  value={scorerTeam}
                  onChange={(e) => setScorerTeam(e.target.value)}
                  className="w-full bg-slate-800 border border-blue-600/30 rounded-lg px-3 py-2 text-sm"
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.shortName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Bramki</label>
                <input
                  type="number"
                  value={scorerGoals}
                  onChange={(e) => setScorerGoals(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-blue-600/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <button
              onClick={addScorer}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              + Dodaj Strzelca
            </button>
          </div>
        </div>

        {scorers.length > 0 && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-blue-600/30">
            <h5 className="font-bold text-xs mb-2">Strzelcy ({scorers.length}):</h5>
            <div className="space-y-2">
              {scorers.map((s, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-slate-900/50 p-2 rounded">
                  <span>{s.playerName} ({teams.find(t => t.id === s.teamId)?.shortName})</span>
                  <span className="font-bold text-blue-400">{s.goals} ⚽</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={scorers.length === 0}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg"
        >
          💾 Zapisz Wynik Meczu
        </button>

        <div className="border-t border-blue-600/30 pt-4">
          <h4 className="font-bold mb-3">🔄 Synchronizacja z API</h4>
          <button
            onClick={handleSyncStats}
            disabled={isSyncing}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg"
          >
            {isSyncing ? '⏳ Synchronizuję...' : '🌐 Synchronizuj Statystyki'}
          </button>
          <p className="text-xs text-green-400/70 mt-2">
            Synchronizuje tabelę ligową i statystyki zawodników z zewnętrznego API
          </p>
        </div>

        <div className="text-xs text-blue-400/70 bg-blue-900/20 p-3 rounded-lg border border-blue-600/20">
          <p className="font-semibold mb-1">💡 Jak używać:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Wybierz mecz</li>
            <li>Wpisz wynik</li>
            <li>Dodaj strzelców (imię + Roblox ID)</li>
            <li>Kliknij "Zapisz"</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
