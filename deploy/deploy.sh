#!/bin/bash

# Skrypt do wdrożenia aplikacji Next.js na CyberFolks

echo "🚀 Rozpoczynam wdrażanie aplikacji Next.js..."

# Zainstaluj zależności
echo "📦 Instaluję zależności..."
npm install

# Zbuduj aplikację
echo "🔨 Buduję aplikację..."
npm run build

# Sprawdź czy build się udał
if [ $? -eq 0 ]; then
    echo "✅ Build zakończony sukcesem!"

    # Opcjonalnie: uruchom aplikację lokalnie do testów
    echo "🧪 Uruchamiam aplikację na porcie 3000..."
    echo "Możesz przetestować aplikację pod adresem: http://localhost:3000"
    echo "Aby zatrzymać, naciśnij Ctrl+C"

    npm start
else
    echo "❌ Build nie powiódł się. Sprawdź błędy powyżej."
    exit 1
fi