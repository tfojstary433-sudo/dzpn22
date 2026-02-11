# Integracja Roblox z Website Scoreboardem

## Architektura

```
Roblox Server → Backend API → Website (WebSocket)
```

## Instalacja

### 1. Zainstaluj zależności backendu

```bash
cd "c:\Users\pakyv\Desktop\bot discord\strona"
npm install
```

### 2. Uruchom backend

```bash
npm start
```

Server będzie dostępny na `http://localhost:3000`

## Konfiguracja Roblox Server (WAŻNE!)

### Metoda: Dodaj nowy skrypt synchronizacji

Zamiast modyfikować istniejący scoreboard:

1. **W Roblox Studio**, otwórz **ServerScriptService**

2. **Stwórz nowy Script** o nazwie `BackendSync`

3. **Skopiuj zawartość** pliku `roblox-backend-sync.lua` do tego skryptu

4. **W grze muszą być ustawienia:**
   - HttpService włączona w Game Settings → Security → HttpService ✓
   - ReplicatedStorage → Events z: `StartMatch`, `EndMatch`, `Score`, `Time` ✓
   - ReplicatedStorage → Modules → Tms (tablica zespołów) ✓

5. **Jeśli grasz lokalnie na innym PC:**
   - Zmień w `roblox-backend-sync.lua` linię:
   ```lua
   BACKEND_URL = "http://192.168.1.X:3000"
   ```
   - Zamień `192.168.1.X` na IP swoiego komputera z backendem

## Jak to działa

1. **Gracz w Roblox** uruchamia mecz za pomocą komendy `:startmatch LEG LPO`
2. **Roblox wysyła event** `StartMatch` do ReplicatedStorage
3. **BackendSync skrypt** nasłuchuje tego eventu i wysyła do backendu
4. **Backend** rozsyła aktualizacje do website'u przez WebSocket
5. **Website** automatycznie aktualizuje scoreboard w real-time

## Komendy w Roblox

Istniejące komendy już działają, a BackendSync je synchronizuje:

```
:startmatch LEG LPO      → Rozpoczyna mecz Legia vs Lech
:score 2 1               → Ustawia wynik 2-1
:home 1:0                → Gol dla gospodarzy (wynik 1:0)
:home 1 0                → Gol dla gospodarzy (wynik 1:0)
:home                    → Dodaje 1 gol dla gospodarzy
:away 0:1                → Gol dla gości (wynik 0:1)
:away 0 1                → Gol dla gości (wynik 0:1)
:away                    → Dodaje 1 gol dla gości
:time 45                 → Ustawia czas na 45 minut
:addtime 5               → Dodaje 5 minut (dogrywka)
:endmatch                → Kończy mecz
```

### Komendy goli (WAŻNE!)
- `:home` - używaj dla goli drużyny gospodarzy (lewa strona)
- `:away` - używaj dla goli drużyny gości (prawa strona)
- Możesz podać wynik w formacie `1:0` lub `1 0`
- Bez argumentów komenda automatycznie doda 1 gol

## WebSocket (Real-Time Updates)

Website automatycznie łączy się przez WebSocket i nasłuchuje:

- `match_start` - rozpoczęcie meczu
- `match_update` - aktualizacja wyniku/czasu
- `match_end` - koniec meczu

## API Endpoints (dla referencji)

### POST /api/match/start
```json
{
  "matchId": 1,
  "teamA": { "nazwa": "Legia Warszawa", "logo": "...", "score": 0 },
  "teamB": { "nazwa": "Lech Poznań", "logo": "...", "score": 0 }
}
```

### POST /api/match/update
```json
{
  "teamAScore": 1,
  "teamBScore": 0,
  "timer": "20:45",
  "period": "Pierwsza połowa"
}
```

### GET /api/match/current
Pobiera aktualny stan meczu

## Troubleshooting

### Brak synchronizacji
- ✓ Backend uruchomiony? `npm start` w oknie terminala
- ✓ Port 3000 wolny? Jeśli nie: `netstat -ano | findstr :3000`
- ✓ Firewall blokuje? Dodaj wyjątek dla Node.js

### Roblox nie wysyła danych
- ✓ HttpService włączona? Game Settings → Security
- ✓ ReplicatedStorage → Events istnieje?
- ✓ BackendSync skrypt jest w ServerScriptService?

### Inny komputer
Użyj IP zamiast localhost:
```lua
BACKEND_URL = "http://192.168.1.100:3000"
```
Sprawdź IP: `ipconfig | findstr IPv4`
