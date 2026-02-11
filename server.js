const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// Konfiguracja katalogu danych
const DATA_DIR = path.join(__dirname, 'src', 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const readData = (filename) => {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) return [];
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
    } catch (e) {
        return [];
    }
};

const saveData = (filename, data) => {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

// Konfiguracja CORS - zezwól na wszystko
app.use(cors({
    origin: ['*', 'https://pff-website-mjz2.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

let matchData = {
    active: false,
    teamA: { nazwa: 'Drużyna A', score: 0 },
    teamB: { nazwa: 'Drużyna B', score: 0 },
    timer: '0:00',
    period: 'Pierwsza połowa'
};

app.get('/api/match/status', (req, res) => {
    res.json(matchData);
});

app.get('/api/table', (req, res) => {
    const table = readData('league_table.json');
    res.json(table);
});

app.get('/api/players', (req, res) => {
    const players = readData('player_statistics.json');
    res.json(players);
});

app.get('/api/history', (req, res) => {
    const history = readData('matches_history.json');
    res.json(history);
});

app.post('/api/match/start', (req, res) => {
    const { teamA, teamB } = req.body;
    
    matchData = {
        active: true,
        teamA: { nazwa: teamA, score: 0 },
        teamB: { nazwa: teamB, score: 0 },
        timer: '0:00',
        period: 'Pierwsza połowa'
    };
    
    console.log(`[MECZ] START: ${teamA} vs ${teamB}`);
    res.json({ success: true });
});

app.post('/api/match/update', (req, res) => {
    const { teamAScore, teamBScore, timer, period } = req.body;
    
    if (teamAScore !== undefined) matchData.teamA.score = teamAScore;
    if (teamBScore !== undefined) matchData.teamB.score = teamBScore;
    if (timer) matchData.timer = timer;
    if (period) matchData.period = period;
    
    console.log(`[MECZ] ${matchData.teamA.nazwa || 'N/A'} ${matchData.teamA.score} - ${matchData.teamB.score} ${matchData.teamB.nazwa || 'N/A'} | ${matchData.timer}`);
    res.json({ success: true });
});

// GŁÓWNY ENDPOINT PRZETWARZANIA MECZU (zgodny z roblox-endmatch.lua)
app.post('/api/endmatch', (req, res) => {
    try {
        const { matchId, homeTeamId, awayTeamId, homeScore, awayScore, scorers, lineups } = req.body;

        if (!matchId) {
            return res.status(400).json({ success: false, error: 'Missing matchId' });
        }

        console.log(`[SYSTEM] Przetwarzanie meczu: ${matchId}`);

        // 1. Sprawdź czy już przetworzony
        const history = readData('matches_history.json');
        if (history.find(m => m.matchId === matchId)) {
            console.log(`[WARN] Mecz ${matchId} już był przetwarzany.`);
            return res.status(400).json({ success: false, error: 'Match already processed' });
        }

        // 2. Zapisz wynik
        history.push({
            matchId,
            homeTeamId,
            awayTeamId,
            homeScore,
            awayScore,
            date: new Date().toISOString(),
            status: 'FINISHED'
        });
        saveData('matches_history.json', history);

        // 3. Aktualizacja tabeli
        const leagueTable = readData('league_table.json');
        const homeTeam = leagueTable.find(t => t.id === homeTeamId);
        const awayTeam = leagueTable.find(t => t.id === awayTeamId);

        if (homeTeam && awayTeam) {
            homeTeam.played += 1;
            awayTeam.played += 1;
            homeTeam.goalsFor += homeScore;
            homeTeam.goalsAgainst += awayScore;
            awayTeam.goalsFor += awayScore;
            awayTeam.goalsAgainst += homeScore;
            homeTeam.goalDifference = homeTeam.goalsFor - homeTeam.goalsAgainst;
            awayTeam.goalDifference = awayTeam.goalsFor - awayTeam.goalsAgainst;

            if (homeScore > awayScore) {
                homeTeam.points += 3;
                homeTeam.won += 1;
                awayTeam.lost += 1;
            } else if (homeScore < awayScore) {
                awayTeam.points += 3;
                awayTeam.won += 1;
                homeTeam.lost += 1;
            } else {
                homeTeam.points += 1;
                awayTeam.points += 1;
                homeTeam.drawn += 1;
                awayTeam.drawn += 1;
            }
            saveData('league_table.json', leagueTable);
        }

        // 4. Statystyki zawodników (Gole, Asysty, Kartki, Czyste konta)
        const playerStats = readData('player_statistics.json');
        
        // Gole i asysty
        if (scorers && Array.isArray(scorers)) {
            scorers.forEach(s => {
                let player = playerStats.find(p => p.playerId === s.playerId);
                if (!player) {
                    player = {
                        playerId: s.playerId,
                        name: s.playerName,
                        teamId: s.teamId,
                        goals: 0,
                        assists: 0,
                        points: 0,
                        cleanSheets: 0,
                        yellowCards: 0,
                        redCards: 0,
                        avatarUrl: s.avatarUrl
                    };
                    playerStats.push(player);
                }
                player.goals += (s.goals || 0);
                player.assists += (s.assists || 0);
                player.points = player.goals + player.assists;
            });
        }

        // Dodatkowe statystyki (kartki, czyste konta) przekazywane w body
        const { extraStats } = req.body;
        if (extraStats && Array.isArray(extraStats)) {
            extraStats.forEach(s => {
                let player = playerStats.find(p => p.playerId === s.playerId);
                if (!player) {
                    player = {
                        playerId: s.playerId,
                        name: s.playerName,
                        teamId: s.teamId,
                        goals: 0,
                        assists: 0,
                        points: 0,
                        cleanSheets: 0,
                        yellowCards: 0,
                        redCards: 0,
                        avatarUrl: s.avatarUrl
                    };
                    playerStats.push(player);
                }
                player.yellowCards += (s.yellowCards || 0);
                player.redCards += (s.redCards || 0);
                player.cleanSheets += (s.cleanSheets || 0);
            });
        }
        saveData('player_statistics.json', playerStats);

        // 5. Składy (Lineups) i Relacja
        if (lineups || req.body.report) {
            const matchDetails = readData('match_details.json');
            matchDetails.push({
                matchId,
                lineups: lineups || [],
                report: req.body.report || '',
                date: new Date().toISOString()
            });
            saveData('match_details.json', matchDetails);
            
            // Kompatybilność wsteczna dla lineups.json
            if (lineups) {
                const lineupsData = readData('lineups.json');
                lineupsData.push({
                    matchId,
                    lineups,
                    date: new Date().toISOString()
                });
                saveData('lineups.json', lineupsData);
            }
        }

        // 6. Terminarz
        const schedule = readData('matches_schedule.json');
        const updatedSchedule = schedule.filter(m => m.id !== matchId);
        saveData('matches_schedule.json', updatedSchedule);

        matchData.active = false;
        console.log(`[SYSTEM] Mecz ${matchId} zakończony pomyślnie.`);
        res.json({ success: true, message: 'Match processed and saved' });

    } catch (error) {
        console.error('Błąd endmatch:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

app.post('/api/match/end', (req, res) => {
    matchData.active = false;
    console.log(`[MECZ] KONIEC (Legacy): ${matchData.teamA.nazwa} ${matchData.teamA.score} - ${matchData.teamB.score} ${matchData.teamB.nazwa}`);
    res.json({ success: true });
});

app.use(express.static('.'));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`[SERVER] Uruchomiony na porcie ${PORT}`);
    console.log(`[API] POST /api/endmatch (Nowy system)`);
    console.log(`[API] POST /api/match/end (Stary system)`);
});
