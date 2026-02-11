# Użyj oficjalnego obrazu Node.js
FROM node:18-alpine

# Ustaw katalog roboczy
WORKDIR /app

# Skopiuj pliki package.json i package-lock.json
COPY package*.json ./

# Zainstaluj zależności
RUN npm ci --only=production

# Skopiuj resztę aplikacji
COPY . .

# Zbuduj aplikację
RUN npm run build

# Ustaw port
EXPOSE 3000

# Uruchom aplikację
CMD ["npm", "start"]