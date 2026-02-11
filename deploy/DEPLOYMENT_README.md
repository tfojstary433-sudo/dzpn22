# Wdrożenie aplikacji Next.js na CyberFolks.pl

## Pliki do wdrożenia
Przygotowałem następujące pliki do ułatwienia wdrożenia:

- `Dockerfile` - dla konteneryzacji aplikacji
- `deploy.sh` - skrypt do automatycznego budowania i uruchamiania
- `.htaccess` - konfiguracja Apache dla reverse proxy

## Metoda 1: Wdrożenie z Docker (Zalecane)
Jeśli CyberFolks obsługuje Docker:

1. Prześlij `Dockerfile` na serwer
2. Zbuduj obraz:
   ```bash
   docker build -t moja-aplikacja .
   ```
3. Uruchom kontener:
   ```bash
   docker run -p 3000:3000 moja-aplikacja
   ```

## Metoda 2: Bezpośrednie wdrożenie Node.js
1. Prześlij wszystkie pliki projektu na serwer przez FTP/SFTP
2. Uruchom skrypt wdrożenia:
   ```bash
   ./deploy.sh
   ```
   Lub ręcznie:
   ```bash
   npm install
   npm run build
   npm start
   ```

## Metoda 3: Wdrożenie przez Apache/Nginx
Jeśli używasz Apache:
1. Skopiuj `.htaccess` do katalogu publicznego
2. Uruchom aplikację na porcie 3000
3. Apache przekieruje ruch na aplikację Node.js

## Konfiguracja środowiska
Upewnij się, że na serwerze jest zainstalowany Node.js w wersji 18+.

## Zmienne środowiskowe
Jeśli potrzebujesz zmiennych środowiskowych, utwórz plik `.env.local`:
```
NODE_ENV=production
# Dodaj inne zmienne
```

## Testowanie
Po wdrożeniu sprawdź, czy aplikacja działa pod Twoją domeną.

## Problemy?
Jeśli napotkasz problemy:
1. Sprawdź logi aplikacji: `npm run build 2>&1 | tee build.log`
2. Sprawdź logi serwera
3. Upewnij się, że port 3000 jest dostępny