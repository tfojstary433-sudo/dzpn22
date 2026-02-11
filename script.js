const BACKEND_URL = 'https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev';
let pollInterval = null;
let lastValidMatchData = null;

function updateLiveMatch(matchData) {
    const liveContainer = document.getElementById('live-match-container');
    if (!liveContainer) return;
    
    const logoA = getTeamLogo(matchData.teamA.nazwa);
    const logoB = getTeamLogo(matchData.teamB.nazwa);
    const skrotA = getTeamShortcut(matchData.teamA.nazwa);
    const skrotB = getTeamShortcut(matchData.teamB.nazwa);
    
    const html = `
        <div style="background: #1a1a1a; border: 1px solid #333; padding: 1rem; border-radius: 4px; margin-bottom: 2rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
                <div style="display: flex; align-items: center; gap: 0.8rem; flex: 1;">
                    <img src="${logoA}" alt="${matchData.teamA.nazwa}" style="width: 40px; height: 40px; object-fit: contain;">
                    <div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 500;">${skrotA}</div>
                    </div>
                </div>
                <div style="text-align: center; min-width: 80px;">
                    <div style="color: #00aaff; font-size: 1.8rem; font-weight: bold;">${matchData.teamA.score}</div>
                </div>
                <div style="color: #666; font-size: 0.9rem;">vs</div>
                <div style="text-align: center; min-width: 80px;">
                    <div style="color: #00aaff; font-size: 1.8rem; font-weight: bold;">${matchData.teamB.score}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.8rem; flex: 1; justify-content: flex-end;">
                    <div style="text-align: right;">
                        <div style="color: white; font-size: 0.9rem; font-weight: 500;">${skrotB}</div>
                    </div>
                    <img src="${logoB}" alt="${matchData.teamB.nazwa}" style="width: 40px; height: 40px; object-fit: contain;">
                </div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 0.8rem; padding-top: 0.8rem; border-top: 1px solid #333;">
                <span style="color: #ff4444; font-size: 0.8rem;">🔴 NA ŻYWO</span>
                <span style="color: #888; font-size: 0.8rem;">${matchData.timer}</span>
                <span style="color: #888; font-size: 0.8rem;">${matchData.period}</span>
            </div>
        </div>
    `;
    
    liveContainer.innerHTML = html;
}

function getTeamLogo(teamName) {
    const team = druzyny.find(d => d.nazwa === teamName || d.skrot === teamName);
    return team ? team.logo : 'https://via.placeholder.com/40?text=?';
}

function getTeamShortcut(teamName) {
    const team = druzyny.find(d => d.nazwa === teamName || d.skrot === teamName);
    return team ? team.skrot : '?';
}

function pollMatchStatus() {
    const proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(`${BACKEND_URL}/api/match/status?t=${Date.now()}`);
    
    fetch(proxyUrl, { timeout: 5000 })
        .then(res => res.json())
        .then(response => {
            if (!response.contents) throw new Error('Invalid response');
            const data = JSON.parse(response.contents);
            return data;
        })
        .then(data => {
            console.log('Otrzymane dane z API:', data);
            
            if (data && (data.active === true || data.active === 'true')) {
                let adaptedData = data;
                if (data.teamAName !== undefined) {
                    adaptedData = {
                        active: data.active,
                        teamA: { nazwa: data.teamAName, score: data.teamAScore },
                        teamB: { nazwa: data.teamBName, score: data.teamBScore },
                        timer: data.timer,
                        period: data.period
                    };
                }
                lastValidMatchData = adaptedData;
                updateLiveMatch(adaptedData);
            } else {
                lastValidMatchData = null;
                clearLiveMatch();
            }
        })
        .catch(err => {
            console.warn('Błąd pobierania statusu meczu:', err.message);
            if (lastValidMatchData) {
                updateLiveMatch(lastValidMatchData);
            }
        });
}

function clearLiveMatch() {
    const liveContainer = document.getElementById('live-match-container');
    if (!liveContainer) return;
    liveContainer.innerHTML = '<div style="color: #888; text-align: center; padding: 1rem; font-size: 0.9rem;">Brak aktywnych meczów</div>';
}

window.addEventListener('load', () => {
    clearLiveMatch();
    pollInterval = setInterval(pollMatchStatus, 2000);
    pollMatchStatus();
});

window.addEventListener('beforeunload', () => {
    if (pollInterval) clearInterval(pollInterval);
});

const druzyny = [
    { id: 1, nazwa: 'Unia Sienkiewicze', skrot: 'USI', logo: 'https://uniaskierniewice.pl/_next/image?url=%2Fimages%2Flogo%2Funia_logo-300x300.png&w=384&q=75', stadium: 'https://media.discordapp.net/attachments/1446799327065280552/1451313899751342241/image_6.png?ex=6947b325&is=694661a5&hm=a9fa03e183102383dd24229907f1a7a0dbc3886fe4677d85536e5ba29c981322&=&format=webp&quality=lossless&width=1548&height=800' },
    { id: 2, nazwa: 'Legia Warszawa', skrot: 'LEG', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Legia_Warsaw_logo.png', stadium: 'https://media.discordapp.net/attachments/1446799327065280552/1451313899751342241/image_6.png?ex=6947b325&is=694661a5&hm=a9fa03e183102383dd24229907f1a7a0dbc3886fe4677d85536e5ba29c981322&=&format=webp&quality=lossless&width=1548&height=800' },
    { id: 3, nazwa: 'Pogoń Szczecin', skrot: 'POG', logo: 'https://pogoncdn.stellis.one/imgsize-xs/documents/7740889/44a6ff9f-f346-69e6-890c-c6f10c6e891b', stadium: 'https://media.discordapp.net/attachments/1446799327065280552/1451313899751342241/image_6.png?ex=6947b325&is=694661a5&hm=a9fa03e183102383dd24229907f1a7a0dbc3886fe4677d85536e5ba29c981322&=&format=webp&quality=lossless&width=1548&height=800' },
    { id: 4, nazwa: 'Arka Gdynia', skrot: 'ARK', logo: 'https://arka.gdynia.pl/files/herb/arka_gdynia_mzks_kolor.png', stadium: 'https://media.discordapp.net/attachments/1446799327065280552/1451313899751342241/image_6.png?ex=6947b325&is=694661a5&hm=a9fa03e183102383dd24229907f1a7a0dbc3886fe4677d85536e5ba29c981322&=&format=webp&quality=lossless&width=1548&height=800' },
    { id: 5, nazwa: 'Lech Poznań', skrot: 'LPO', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b0/KKS_Lech_Pozna%C5%84.svg/960px-KKS_Lech_Pozna%C5%84.svg.png', stadium: 'https://media.discordapp.net/attachments/1446799327065280552/1451313899751342241/image_6.png?ex=6947b325&is=694661a5&hm=a9fa03e183102383dd24229907f1a7a0dbc3886fe4677d85536e5ba29c981322&=&format=webp&quality=lossless&width=1548&height=800' },
    { id: 6, nazwa: 'Zawisza Bydgoszcz', skrot: 'ZAW', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/55/Herb_Zawiszy_Bydgoszcz.png', stadium: 'https://media.discordapp.net/attachments/1446799327065280552/1451313899751342241/image_6.png?ex=6947b325&is=694661a5&hm=a9fa03e183102383dd24229907f1a7a0dbc3886fe4677d85536e5ba29c981322&=&format=webp&quality=lossless&width=1548&height=800' },
    { id: 7, nazwa: 'Lechia Gdańsk', skrot: 'LGD', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b7/Lechia_Gda%C5%84sk_logo.svg/1200px-Lechia_Gda%C5%84sk_logo.svg.png', stadium: 'https://media.discordapp.net/attachments/1446799327065280552/1451313899751342241/image_6.png?ex=6947b325&is=694661a5&hm=a9fa03e183102383dd24229907f1a7a0dbc3886fe4677d85536e5ba29c981322&=&format=webp&quality=lossless&width=1548&height=800' },
    { id: 8, nazwa: 'Zagłębie Lubin', skrot: 'ZAG', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/20/Zag%C5%82%C4%99bie_Lubin_crest.svg/1200px-Zag%C5%82%C4%99bie_Lubin_crest.svg.png', stadium: 'https://media.discordapp.net/attachments/1446799327065280552/1451313899751342241/image_6.png?ex=6947b325&is=694661a5&hm=a9fa03e183102383dd24229907f1a7a0dbc3886fe4677d85536e5ba29c981322&=&format=webp&quality=lossless&width=1548&height=800' },
    { id: 9, nazwa: 'Motor Lublin', skrot: 'MOT', logo: 'https://i.ibb.co/bgRJrvnj/Motor-Lublin-S-A-Oficjalny-Herb.png', stadium: 'https://media.discordapp.net/attachments/1446799327065280552/1451313899751342241/image_6.png?ex=6947b325&is=694661a5&hm=a9fa03e183102383dd24229907f1a7a0dbc3886fe4677d85536e5ba29c981322&=&format=webp&quality=lossless&width=1548&height=800' },
    { id: 118, nazwa: 'Olimpia Elbląg', skrot: 'OLI', logo: 'https://i.ibb.co/RGsNqf6G/olimpia-elblag.png', stadium: 'https://media.discordapp.net/attachments/1446799327065280552/1451313899751342241/image_6.png?ex=6947b325&is=694661a5&hm=a9fa03e183102383dd24229907f1a7a0dbc3886fe4677d85536e5ba29c981322&=&format=webp&quality=lossless&width=1548&height=800' }
];

const userProfile = {
    id: 999,
    imie: 'Jan',
    nazwisko: 'Kowalski',
    profil: 'https://www.roblox.com/users/4674039540/profile',
    poziom: 42,
    doswiadczenie: 15000,
    mecze: 256,
    gole: 89,
    asysty: 34
};

const zawodnicy = [];

const newsy = [];

const tablekaEkstraklasa = [
    { id: 2, nazwa: 'Legia Warszawa', mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [], domowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] }, wyjazdowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] } },
    { id: 5, nazwa: 'Lech Poznań', mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [], domowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] }, wyjazdowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] } },
    { id: 3, nazwa: 'Pogoń Szczecin', mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [], domowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] }, wyjazdowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] } },
    { id: 4, nazwa: 'Arka Gdynia', mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [], domowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] }, wyjazdowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] } },
    { id: 7, nazwa: 'Lechia Gdańsk', mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [], domowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] }, wyjazdowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] } },
    { id: 8, nazwa: 'Zagłębie Lubin', mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [], domowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] }, wyjazdowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] } },
    { id: 6, nazwa: 'Zawisza Bydgoszcz', mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [], domowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] }, wyjazdowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] } },
    { id: 1, nazwa: 'Unia Sienkiewicze', mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [], domowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] }, wyjazdowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] } },
    { id: 9, nazwa: 'Motor Lublin', mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [], domowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] }, wyjazdowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] } }
];

const tabela1Liga = [
    { id: 100, nazwa: 'Górnik Łęczna', mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [], domowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] }, wyjazdowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] } },
    { id: 101, nazwa: 'Widzew Łódź', mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [], domowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] }, wyjazdowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] } },
    { id: 102, nazwa: 'Podbeskidzie Tychy', mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [], domowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] }, wyjazdowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] } },
    { id: 103, nazwa: 'Resovia Rzeszów', mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [], domowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] }, wyjazdowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] } },
    { id: 104, nazwa: 'Olimpia Grudziądz', mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [], domowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] }, wyjazdowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] } },
    { id: 105, nazwa: 'Chrobry Głogów', mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [], domowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] }, wyjazdowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] } },
    { id: 106, nazwa: 'GKS Jastrzębie', mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [], domowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] }, wyjazdowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] } },
    { id: 107, nazwa: 'MKS Kalisz', mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [], domowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] }, wyjazdowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] } },
    { id: 108, nazwa: 'Skra Częstochowa', mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [], domowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] }, wyjazdowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] } },
    { id: 109, nazwa: 'Bytovia Gdynia', mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [], domowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] }, wyjazdowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] } },
    { id: 110, nazwa: 'Sandecja Nowy Sącz', mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [], domowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] }, wyjazdowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] } },
    { id: 111, nazwa: 'ŁKS Łódź', mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [], domowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] }, wyjazdowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] } },
    { id: 112, nazwa: 'Zagłębie Sosnowiec', mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [], domowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] }, wyjazdowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] } },
    { id: 113, nazwa: 'Wisła Płock', mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [], logo: 'https://i.ibb.co/SX6LkvnR/obraz-2026-02-01-105518416.png', domowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] }, wyjazdowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] } },
    { id: 114, nazwa: 'KS Arka Gdańsk', mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [], domowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] }, wyjazdowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] } },
    { id: 115, nazwa: 'Garbarnia Kraków', mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [], domowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] }, wyjazdowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] } },
    { id: 116, nazwa: 'Elana Toruń', mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [], domowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] }, wyjazdowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] } },
    { id: 117, nazwa: 'Znicz Pruszków', mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [], domowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] }, wyjazdowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] } },
    { id: 118, nazwa: 'Olimpia Elbląg', mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [], domowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] }, wyjazdowe: { mecze: 0, wygrane: 0, remisy: 0, przegrane: 0, bramkiZa: 0, bramkiProti: 0, punkty: 0, forma: [] } }
];

let tabela = tablekaEkstraklasa;
let currentLeague = 'ekstraklasa';

const mecze = [];

const terminarz = [
    {
        kolejka: 1,
        mecze: [
            { id: 1, teamA: 'Legia Warszawa', teamB: 'Lech Poznań', czas: '15:00' },
            { id: 2, teamA: 'Pogoń Szczecin', teamB: 'Arka Gdynia', czas: '17:30' },
            { id: 3, teamA: 'Lechia Gdańsk', teamB: 'Zagłębie Lubin', czas: '17:30' },
            { id: 4, teamA: 'Zawisza Bydgoszcz', teamB: 'Unia Sienkiewicze', czas: '19:00' },
            { id: 9, teamA: 'Motor Lublin', teamB: 'Górnik Łęczna', czas: '20:30' }
        ]
    },
    {
        kolejka: 2,
        mecze: [
            { id: 5, teamA: 'Lech Poznań', teamB: 'Pogoń Szczecin', czas: '15:00' },
            { id: 6, teamA: 'Arka Gdynia', teamB: 'Legia Warszawa', czas: '17:30' },
            { id: 7, teamA: 'Zagłębie Lubin', teamB: 'Zawisza Bydgoszcz', czas: '17:30' },
            { id: 8, teamA: 'Unia Sienkiewicze', teamB: 'Lechia Gdańsk', czas: '19:00' },
            { id: 10, teamA: 'Olimpia Elbląg', teamB: 'Motor Lublin', czas: '20:30' }
        ]
    }
];

function loadNews() {
    const heroContainer = document.getElementById('hero-news');
    const gridContainer = document.getElementById('news-grid');
    
    const heroNews = newsy.find(n => n.hero);
    const otherNews = newsy.filter(n => !n.hero);
    
    if (heroNews) {
        heroContainer.innerHTML = `
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(45deg, #1e3c72, #2a5298); z-index: -1;"></div>
            <div class="hero-content">
                <span class="hero-tag">${heroNews.tag}</span>
                <div class="hero-title">${heroNews.tytul}</div>
                <div class="news-date">${heroNews.data}</div>
            </div>
        `;
        heroContainer.style.cursor = 'pointer';
        heroContainer.onclick = () => openNewsModal(heroNews.id);
    } else {
        heroContainer.innerHTML = `
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(45deg, #1e3c72, #2a5298); z-index: -1;"></div>
            <div class="hero-content">
                <span class="hero-tag">BRAK NEWSA</span>
                <div class="hero-title">Brak aktualności</div>
                <div class="news-date">--</div>
            </div>
        `;
    }
    
    gridContainer.innerHTML = '';
    if (otherNews.length === 0) {
        for (let i = 0; i < 6; i++) {
            gridContainer.innerHTML += `
                <div class="news-card" style="cursor: default;">
                    <div style="width: 100%; height: 150px; background: linear-gradient(45deg, #2c3e50, #3498db);"></div>
                    <div class="news-card-content">
                        <div class="news-card-title" style="background: rgba(255,255,255,0.1); height: 20px; border-radius: 4px;"></div>
                        <div class="news-date" style="background: rgba(255,255,255,0.05); height: 16px; border-radius: 4px; margin-top: 8px; width: 60%;"></div>
                    </div>
                </div>
            `;
        }
    } else {
        otherNews.forEach(news => {
            gridContainer.innerHTML += `
                <div class="news-card" onclick="openNewsModal(${news.id})">
                    <div style="width: 100%; height: 150px; background: linear-gradient(45deg, #2c3e50, #3498db);"></div>
                    <div class="news-card-content">
                        <div class="news-card-title">${news.tytul}</div>
                        <div class="news-date">${news.data}</div>
                    </div>
                </div>
            `;
        });
    }
}

function openNewsModal(newsId) {
    const news = newsy.find(n => n.id === newsId);
    if (!news) return;
    
    const modal = document.getElementById('club-modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <div style="text-align: center; margin-bottom: 1.5rem;">
            <span style="background: #0056b3; color: white; padding: 4px 12px; font-size: 0.7rem; font-weight: bold; text-transform: uppercase; display: inline-block; margin-bottom: 1rem;">${news.tag}</span>
            <h2 style="font-size: 1.5rem; margin: 0 0 0.5rem 0; line-height: 1.3;">${news.tytul}</h2>
            <p style="color: #aaa; font-size: 0.85rem;">${news.data}</p>
        </div>
        <div style="line-height: 1.8; font-size: 1rem; color: #ddd;">
            ${news.tresc}
        </div>
    `;
    modal.style.display = 'block';
}

function loadSidebarTabela() {
    const container = document.getElementById('sidebar-content');
    let html = `
        <table class="compact-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Klub</th>
                    <th>M</th>
                    <th>Pkt</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    tabela.forEach((team, index) => {
        const druzyna = druzyny.find(d => d.id === team.id);
        const logo = druzyna ? druzyna.logo : '';
        html += `
            <tr>
                <td class="pos">${index + 1}</td>
                <td>
                    <div class="team-flex">
                        <img src="${logo}" alt="${team.nazwa}">
                        <span>${druzyna ? druzyna.skrot : team.nazwa.substring(0,3).toUpperCase()}</span>
                    </div>
                </td>
                <td>${team.mecze}</td>
                <td><strong>${team.punkty}</strong></td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function getTeamShortcut(teamName) {
    const team = druzyny.find(d => d.nazwa === teamName);
    return team ? team.skrot : teamName.substring(0, 3).toUpperCase();
}

function loadSidebarTerminarz() {
    const container = document.getElementById('sidebar-content');
    let html = '<div id="countdown-placeholder"></div><div style="display: flex; flex-direction: column; gap: 2px;">';
    
    mecze.forEach(mecz => {
        const domowySk = getTeamShortcut(mecz.domowe.nazwa);
        const goscieSk = getTeamShortcut(mecz.gość.nazwa);
        
        html += `
            <div style="display: grid; grid-template-columns: 0.6fr 45px 0.6fr 60px; align-items: center; padding: 8px 5px; background: rgba(0,0,0,0.6); border-bottom: 1px solid #333; gap: 8px; font-size: 0.85rem;">
                <div style="display: flex; align-items: center; gap: 5px; justify-content: flex-end;">
                    <img src="${mecz.domowe.logo}" alt="" style="height: 20px; width: auto;">
                    <span style="font-weight: 600; color: #aaa; font-size: 0.75rem;">${domowySk}</span>
                </div>
                <div style="background: #0044cc; color: white; padding: 3px 5px; font-weight: bold; text-align: center; border-radius: 3px; font-size: 0.9rem;">${mecz.wynik}</div>
                <div style="display: flex; align-items: center; gap: 5px; justify-content: flex-start;">
                    <span style="font-weight: 600; color: #aaa; font-size: 0.75rem;">${goscieSk}</span>
                    <img src="${mecz.gość.logo}" alt="" style="height: 20px; width: auto;">
                </div>
                <div style="text-align: center; color: #00aaff; font-weight: bold; font-size: 0.7rem; cursor: pointer;">SKRÓT</div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    startCountdown();
}

function startCountdown() {
    const placeholder = document.getElementById('countdown-placeholder');
    if (!placeholder) return;

    // Find next match (mocking one for demo purposes if all are past)
    // For demo, let's set a match 3 days from now
    const now = new Date();
    const nextMatchDate = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000) + (5 * 60 * 60 * 1000)); // 3 days 5 hours from now
    
    // Mock teams for the next match
    const homeTeam = druzyny[7]; // Zagłębie Lubin
    const awayTeam = druzyny[6]; // Lechia Gdańsk

    placeholder.innerHTML = `
        <div class="countdown-container">
            <div class="countdown-date">PIĄTEK, ${nextMatchDate.toLocaleDateString('pl-PL')}</div>
            <div class="countdown-header">
                <div class="countdown-team">
                    <img src="${homeTeam.logo}" alt="${homeTeam.nazwa}">
                    <span>${homeTeam.skrot}</span>
                </div>
                <div class="countdown-timer" id="timer">00:00:00:00</div>
                <div class="countdown-team">
                    <img src="${awayTeam.logo}" alt="${awayTeam.nazwa}">
                    <span>${awayTeam.skrot}</span>
                </div>
            </div>
            <div class="countdown-labels">
                <span>DNI</span>
                <span>GODZ</span>
                <span>MIN</span>
                <span>SEK</span>
            </div>
        </div>
    `;

    function updateTimer() {
        const currentTime = new Date().getTime();
        const distance = nextMatchDate.getTime() - currentTime;

        if (distance < 0) {
            document.getElementById("timer").innerHTML = "MECZ TRWA";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("timer").innerHTML = 
            (days < 10 ? "0" + days : days) + ":" + 
            (hours < 10 ? "0" + hours : hours) + ":" + 
            (minutes < 10 ? "0" + minutes : minutes) + ":" + 
            (seconds < 10 ? "0" + seconds : seconds);
    }

    setInterval(updateTimer, 1000);
    updateTimer();
}

function loadSidebarKluby() {
    const container = document.getElementById('sidebar-content');
    let html = '<div style="display: flex; flex-direction: column; gap: 8px; padding: 8px 0;">';
    
    druzyny.forEach(team => {
        const stats = tabela.find(t => t.id === team.id);
        const points = stats ? stats.punkty : 0;
        
        html += `
            <div style="display: flex; align-items: center; gap: 8px; padding: 8px; background: rgba(0,0,0,0.6); border-radius: 4px; cursor: pointer; transition: all 0.3s;" 
                 onmouseover="this.style.background='rgba(0,86,179,0.3)'" 
                 onmouseout="this.style.background='rgba(0,0,0,0.6)'"
                 onclick="showClubProfile(${team.id})">
                <img src="${team.logo}" alt="${team.nazwa}" style="height: 28px; width: auto; flex-shrink: 0;">
                <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 0.8rem; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: white;">${team.skrot}</div>
                    <div style="font-size: 0.7rem; color: #aaa;">${points} pkt</div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function changeLeague(league) {
    if (league === 'ekstraklasa') {
        tabela = tablekaEkstraklasa;
        currentLeague = 'ekstraklasa';
    } else if (league === '1liga') {
        tabela = tabela1Liga;
        currentLeague = '1liga';
    }
    renderFullTable('all');
}

function filterTable(type, btn) {
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    renderFullTable(type);
}

function renderFullTable(filterType = 'all') {
    const container = document.getElementById('full-table-content');
    let html = `
        <table class="full-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th style="text-align: left;">DRUŻYNA</th>
                    <th>MECZE</th>
                    <th>PUNKTY</th>
                    <th>ZWYCIĘSTWA</th>
                    <th>REMISY</th>
                    <th>PRZEGRANE</th>
                    <th>BRAMKI</th>
                    <th>FORMA</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Sort table based on points (descending)
    const sortedTabela = [...tabela].sort((a, b) => {
        const statsA = filterType === 'home' ? a.domowe : (filterType === 'away' ? a.wyjazdowe : a);
        const statsB = filterType === 'home' ? b.domowe : (filterType === 'away' ? b.wyjazdowe : b);
        return statsB.punkty - statsA.punkty;
    });

    sortedTabela.forEach((team, index) => {
        const druzyna = druzyny.find(d => d.id === team.id);
        const logo = druzyna ? druzyna.logo : '';
        
        // Select stats based on filter
        let stats = team;
        if (filterType === 'home') stats = team.domowe;
        if (filterType === 'away') stats = team.wyjazdowe;

        let formHtml = '<div class="form-dots">';
        if (stats.forma) {
            stats.forma.forEach(result => {
                let colorClass = '';
                if (result === 'W') colorClass = 'win';
                else if (result === 'D') colorClass = 'draw';
                else if (result === 'L') colorClass = 'loss';
                formHtml += `<span class="dot ${colorClass}"></span>`;
            });
        }
        formHtml += '</div>';

        const isRelegation = index >= sortedTabela.length - 3;
        const trClass = isRelegation ? 'class="relegation-row"' : '';

        html += `
            <tr ${trClass}>
                <td class="pos-cell">${index + 1}</td>
                <td class="team-cell">
                    <img src="${logo}" alt="${team.nazwa}">
                    <span>${team.nazwa.toUpperCase()}</span>
                </td>
                <td>${stats.mecze}</td>
                <td class="points-cell">${stats.punkty}</td>
                <td>${stats.wygrane}</td>
                <td>${stats.remisy}</td>
                <td>${stats.przegrane}</td>
                <td>${stats.bramkiZa}:${stats.bramkiProti}</td>
                <td>${formHtml}</td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function switchSidebar(tab) {
    const tabs = document.querySelectorAll('.sidebar-tab');
    tabs.forEach(t => t.classList.remove('active'));
    
    if (tab === 'terminarz') {
        tabs[0].classList.add('active');
        loadSidebarTerminarz();
    } else if (tab === 'tabela') {
        tabs[1].classList.add('active');
        loadSidebarTabela();
    }
}

function formatDate(dateString) {
    const options = { day: 'numeric', month: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pl-PL', options);
}

function loadTicker() {
    const container = document.getElementById('clubs-ticker');
    if (!container) return;
    
    let html = '';
    
    // Duplicate 3 times for a smooth infinite scroll effect
    const allTeams = [...druzyny, ...druzyny, ...druzyny];
    
    allTeams.forEach(team => {
        html += `
            <div class="ticker-item" onclick="openModal(${team.id})">
                <img src="${team.logo}" alt="${team.nazwa}">
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function openModal(teamId) {
    const modal = document.getElementById('club-modal');
    const modalBody = document.getElementById('modal-body');
    const team = druzyny.find(d => d.id === teamId);
    const stats = tabela.find(t => t.id === teamId);
    
    if (!team || !stats) return;
    
    modalBody.innerHTML = `
        <div class="modal-header">
            <img src="${team.logo}" alt="${team.nazwa}" class="modal-logo">
            <h2>${team.nazwa}</h2>
        </div>
        <div class="modal-stats">
            <div class="stat-box">
                <div class="stat-value">${stats.mecze}</div>
                <div class="stat-label">Mecze</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${stats.punkty}</div>
                <div class="stat-label">Punkty</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${stats.wygrane}</div>
                <div class="stat-label">Zwycięstwa</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${stats.przegrane}</div>
                <div class="stat-label">Porażki</div>
            </div>
        </div>
    `;
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('club-modal').style.display = 'none';
}

function scrollToSidebar() {
    showLeaguesModal();
}

function showLeaguesModal() {
    const modal = document.getElementById('club-modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <div style="text-align: center;">
            <h2 style="margin-bottom: 2rem; color: white;">WYBIERZ ROZGRYWKĘ</h2>
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                <button onclick="selectLeague('7u7-ekstraklasa')" style="padding: 1rem; background: transparent; border: 2px solid #0056b3; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 1rem;">
                    <img src="https://i.ibb.co/fgf9xk7/ekstraklasabaner-removebg-preview.png" alt="Ekstraklasa" style="height: 60px; object-fit: contain;">
                </button>
                <button onclick="selectLeague('1liga')" style="padding: 1rem; background: transparent; border: 2px solid #0056b3; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 1rem;">
                    <img src="https://i.ibb.co/7JnQJNz2/obraz-2025-12-19-145450497.png" alt="1. Liga" style="height: 60px; object-fit: contain;">
                </button>
                <button onclick="selectLeague('7u7-puchar-polski')" style="padding: 1rem; background: transparent; border: 2px solid #0056b3; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 1rem;">
                    <img src="https://i.ibb.co/FkyfzY94/2d771fb9-cae8-4073-b874-7b2487c970bd.png" alt="7U7 Puchar Polski" style="height: 60px; object-fit: contain;">
                </button>
            </div>
        </div>
    `;
    modal.style.display = 'block';
}

function selectLeague(league) {
    document.getElementById('club-modal').style.display = 'none';
    
    if (league === '7u7-puchar-polski') {
        showView('cup-bracket');
        loadCupBracket();
    } else if (league === '1liga') {
        tabela = tabela1Liga;
        currentLeague = '1liga';
        showView('table');
        renderFullTable();
    } else if (league === '7u7-ekstraklasa') {
        tabela = tablekaEkstraklasa;
        currentLeague = 'ekstraklasa';
        showView('table');
        renderFullTable();
    }
}

function loadCupBracket() {
    const container = document.getElementById('bracket-content');
    
    const teams = Array(16).fill('');
    
    let html = `
        <style>
            .bracket-wrapper {
                display: flex;
                gap: 2rem;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                min-height: 600px;
            }
            
            .bracket-round {
                display: flex;
                flex-direction: column;
                justify-content: space-around;
                flex-shrink: 0;
            }
            
            .match-box {
                background: rgba(0,0,0,0.6);
                border: 1px solid #0056b3;
                border-radius: 4px;
                padding: 0.8rem;
                min-width: 140px;
                position: relative;
            }
            
            .match-box::after {
                content: '';
                position: absolute;
                right: -1rem;
                top: 50%;
                width: 1rem;
                height: 1px;
                background: #0056b3;
                transform: translateY(-50%);
            }
            
            .match-box.final::after {
                display: none;
            }
            
            .team-slot {
                color: #aaa;
                font-size: 0.75rem;
                padding: 0.3rem 0;
                text-align: center;
                min-height: 16px;
                border-bottom: 1px solid #0056b3;
            }
            
            .team-slot:last-child {
                border-bottom: none;
            }
            
            .vs-text {
                color: #0056b3;
                font-size: 0.65rem;
                text-align: center;
                padding: 0.2rem 0;
                font-weight: bold;
            }
            
            .round-title {
                text-align: center;
                color: #00aaff;
                font-size: 0.85rem;
                margin-bottom: 2rem;
                font-weight: bold;
                text-transform: uppercase;
            }
            
            .finals-section {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                gap: 1rem;
            }
            
            .champion-text {
                color: #00aaff;
                font-size: 1rem;
                font-weight: bold;
                text-transform: uppercase;
                margin-top: 2rem;
            }
        </style>
        
        <div class="bracket-wrapper">
            <!-- LEFT SIDE (8 Teams) -->
            <div>
                <div class="round-title">1/8 FINAŁU</div>
                <div class="bracket-round" style="gap: 2.5rem;">
                    ${Array(4).fill(0).map((_, i) => `
                        <div class="match-box">
                            <div class="team-slot">---</div>
                            <div class="vs-text">VS</div>
                            <div class="team-slot">---</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- 1/4 FINALS -->
            <div>
                <div class="round-title">1/4 FINAŁU</div>
                <div class="bracket-round" style="gap: 5rem;">
                    ${Array(2).fill(0).map((_, i) => `
                        <div class="match-box">
                            <div class="team-slot">---</div>
                            <div class="vs-text">VS</div>
                            <div class="team-slot">---</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- SEMI-FINALS & FINALS (CENTER) -->
            <div class="finals-section">
                <div style="display: flex; flex-direction: column; gap: 8rem; align-items: center;">
                    <div class="match-box">
                        <div class="team-slot">---</div>
                        <div class="vs-text">VS</div>
                        <div class="team-slot">---</div>
                    </div>
                    <div class="match-box final">
                        <div class="team-slot">---</div>
                        <div class="vs-text">VS</div>
                        <div class="team-slot">---</div>
                    </div>
                    <div class="match-box final">
                        <div class="team-slot">ZWYCIĘZCA</div>
                    </div>
                </div>
            </div>
            
            <!-- SEMI-FINALS & FINALS (CENTER) - RIGHT SIDE MIRROR -->
            <div class="finals-section">
                <div style="display: flex; flex-direction: column; gap: 8rem; align-items: center;">
                    <div class="match-box">
                        <div class="team-slot">---</div>
                        <div class="vs-text">VS</div>
                        <div class="team-slot">---</div>
                    </div>
                </div>
            </div>
            
            <!-- 1/4 FINALS RIGHT -->
            <div>
                <div class="round-title">1/4 FINAŁU</div>
                <div class="bracket-round" style="gap: 5rem;">
                    ${Array(2).fill(0).map((_, i) => `
                        <div class="match-box">
                            <div class="team-slot">---</div>
                            <div class="vs-text">VS</div>
                            <div class="team-slot">---</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- RIGHT SIDE (8 Teams) -->
            <div>
                <div class="round-title">1/8 FINAŁU</div>
                <div class="bracket-round" style="gap: 2.5rem;">
                    ${Array(4).fill(0).map((_, i) => `
                        <div class="match-box">
                            <div class="team-slot">---</div>
                            <div class="vs-text">VS</div>
                            <div class="team-slot">---</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        
        <div class="champion-text" style="text-align: center; margin-top: 3rem;">
            🏆 PUCHAR POLSKI 🏆
        </div>
    `;
    
    container.innerHTML = html;
}

let matchState = {
    seconds: 0,
    isRunning: false,
    interval: null,
    isFinished: false
};

function updateMatchTimer() {
    const minutes = Math.floor(matchState.seconds / 60);
    const secs = matchState.seconds % 60;
    
    if (minutes >= 40) {
        pauseMatch();
        return;
    }
    
    const period = minutes >= 20 ? 'Druga połowa' : 'Pierwsza połowa';
    document.getElementById('match-timer').textContent = `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    document.getElementById('match-period').textContent = minutes === 20 ? 'PRZERWA' : period;
}

function startMatch() {
    if (matchState.isRunning) return;
    
    matchState.isRunning = true;
    matchState.interval = setInterval(() => {
        matchState.seconds++;
        updateMatchTimer();
    }, 1000);
}

function pauseMatch() {
    matchState.isRunning = false;
    if (matchState.interval) clearInterval(matchState.interval);
}

function resetMatch() {
    pauseMatch();
    matchState.seconds = 0;
    updateMatchTimer();
    clearEvents();
}

let matchEvents = {
    'team-a': [],
    'team-b': []
};

function getEventIcon(type) {
    const icons = {
        'goal': '⚽',
        'yellow': '🟡',
        'red': '🔴',
        'substitution': '🔄'
    };
    return icons[type] || '';
}

function getEventLabel(type) {
    const labels = {
        'goal': 'Gol',
        'yellow': 'Żółta kartka',
        'red': 'Czerwona kartka',
        'substitution': 'Zmiana'
    };
    return labels[type] || '';
}

function addEvent(team, type) {
    const minutes = Math.floor(matchState.seconds / 60);
    const event = {
        type: type,
        minute: minutes,
        time: `${minutes}'`
    };
    
    matchEvents[team].push(event);
    updateEventsDisplay();
}

function updateEventsDisplay() {
    ['team-a', 'team-b'].forEach(team => {
        const container = document.getElementById(`${team}-events`);
        if (!matchEvents[team] || matchEvents[team].length === 0) {
            container.innerHTML = '<div style="color: #666;">Brak zdarzeń</div>';
        } else {
            container.innerHTML = matchEvents[team]
                .map((event, i) => `
                    <div style="color: white; padding: 0.5rem; background: rgba(0,170,255,0.1); margin-bottom: 0.5rem; border-radius: 3px; display: flex; justify-content: space-between; align-items: center;">
                        <span>${event.time} - ${getEventLabel(event.type)}</span>
                        <span>${getEventIcon(event.type)}</span>
                        <button onclick="removeEvent('${team}', ${i})" style="background: #dc3545; color: white; border: none; border-radius: 3px; padding: 0.2rem 0.5rem; cursor: pointer; font-size: 0.8rem;">X</button>
                    </div>
                `)
                .join('');
        }
    });
}

function removeEvent(team, index) {
    matchEvents[team].splice(index, 1);
    updateEventsDisplay();
}

function clearEvents() {
    matchEvents['team-a'] = [];
    matchEvents['team-b'] = [];
    updateEventsDisplay();
}

function endMatch() {
    pauseMatch();
    matchState.isFinished = true;
    document.getElementById('match-period').textContent = 'Mecz zakończony';
}

function addEventToMatch(eventData) {
    if (!eventData || !eventData.type || !eventData.team) return;
    
    const team = eventData.team === 'A' ? 'team-a' : 'team-b';
    const minutes = eventData.timestamp ? parseInt(eventData.timestamp) : Math.floor(matchState.seconds / 60);
    
    const event = {
        type: eventData.type,
        minute: minutes,
        time: `${minutes}'`,
        description: eventData.description
    };
    
    matchEvents[team].push(event);
    updateEventsDisplay();
}

window.onclick = function(event) {
    const modal = document.getElementById('club-modal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadNews();
    loadSidebarTerminarz();
    loadTicker();
    loadMainCountdown();
    renderSchedule();
});

function showView(viewName) {
    const newsView = document.getElementById('news-view');
    const tableView = document.getElementById('table-view');
    const scheduleView = document.getElementById('schedule-view');
    const cupBracketView = document.getElementById('cup-bracket-view');
    const scoreboardView = document.getElementById('scoreboard-view');
    
    const navNews = document.getElementById('nav-news');
    const navTable = document.getElementById('nav-table');
    const navSchedule = document.getElementById('nav-schedule');

    // Reset all
    newsView.style.display = 'none';
    tableView.style.display = 'none';
    scheduleView.style.display = 'none';
    cupBracketView.style.display = 'none';
    if (scoreboardView) scoreboardView.style.display = 'none';
    
    navNews.classList.remove('active');
    navTable.classList.remove('active');
    navSchedule.classList.remove('active');

    if (viewName === 'news') {
        newsView.style.display = 'grid';
        navNews.classList.add('active');
    } else if (viewName === 'table') {
        tableView.style.display = 'block';
        navTable.classList.add('active');
        renderFullTable();
    } else if (viewName === 'schedule') {
        scheduleView.style.display = 'block';
        navSchedule.classList.add('active');
        renderSchedule();
    } else if (viewName === 'cup-bracket') {
        cupBracketView.style.display = 'block';
    } else if (viewName === 'scoreboard') {
        if (scoreboardView) scoreboardView.style.display = 'block';
        loadScheduleMatches();
    }
}

function loadMainCountdown() {
    const container = document.getElementById('main-countdown-banner');
    if (!container) return;

    // Test match data
    const now = new Date();
    // Set date to Friday, 30.01.2026 as in the screenshot or relative to now
    // The screenshot says 30.01.2026. I'll use that date if it's in the future, otherwise I'll use a relative date.
    // Since the current date is Dec 2025, Jan 2026 is in the future.
    const nextMatchDate = new Date('2026-01-30T20:30:00'); 
    
    const homeTeam = druzyny[7]; // Zagłębie Lubin
    // GKS Katowice is not in the druzyny array, so I'll create a temporary object for it
    const awayTeam = { id: 99, nazwa: 'GKS Katowice', skrot: 'GKS', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/GKS_Katowice_herb.svg/1200px-GKS_Katowice_herb.svg.png' };

    container.innerHTML = `
        <div class="countdown-left">
            <img src="https://media.discordapp.net/attachments/1446799327065280552/1451331677291937842/clash.png?ex=6947c3b4&is=69467234&hm=c1dc35cd7e4388c1f02416876c16d65ba97e224900b402e2a6696a30ee9787a7&=&format=webp&quality=lossless&width=1860&height=474" class="countdown-watch" alt="Watch">
            <div class="countdown-title">
                <h2>AZTORIN</h2>
                <p>ODMIERZA CZAS DO NASTĘPNEGO MECZU</p>
            </div>
        </div>
        <div class="countdown-right">
            <div class="match-countdown-wrapper">
                <div class="countdown-team-logo">
                    <img src="${homeTeam.logo}" alt="${homeTeam.nazwa}">
                    <span>${homeTeam.nazwa}</span>
                </div>
                
                <div class="countdown-center">
                    <div class="countdown-date-info">PIĄTEK, 30.01.2026</div>
                    <div class="main-timer" id="main-timer">00:00:00:00</div>
                    <div class="timer-labels">
                        <span>DNI</span>
                        <span>GODZ</span>
                        <span>MIN</span>
                        <span>SEK</span>
                    </div>
                </div>

                <div class="countdown-team-logo">
                    <img src="${awayTeam.logo}" alt="${awayTeam.nazwa}">
                    <span>${awayTeam.nazwa}</span>
                </div>
            </div>
        </div>
    `;

    startMainTimer(nextMatchDate);
}

function startMainTimer(targetDate) {
    function update() {
        const now = new Date().getTime();
        const distance = targetDate.getTime() - now;

        if (distance < 0) {
            const timerElement = document.getElementById("main-timer");
            if (timerElement) timerElement.innerHTML = "MECZ TRWA";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const timerElement = document.getElementById("main-timer");
        if (timerElement) {
            timerElement.innerHTML = 
                (days < 10 ? "0" + days : days) + " : " + 
                (hours < 10 ? "0" + hours : hours) + " : " + 
                (minutes < 10 ? "0" + minutes : minutes) + " : " + 
                (seconds < 10 ? "0" + seconds : seconds);
        }
    }

    setInterval(update, 1000);
    update();
}

function renderSchedule() {
    const container = document.getElementById('schedule-content');
    if (!container) return;

    const round = terminarz[0];
    
    let html = '<h3 style="color: white; margin-bottom: 1.5rem; text-transform: uppercase;">Harmonogram meczu</h3>';
    
    round.mecze.forEach(match => {
        const logoA = getTeamLogo(match.teamA);
        const logoB = getTeamLogo(match.teamB);
        const skrotA = getTeamShortcut(match.teamA);
        const skrotB = getTeamShortcut(match.teamB);
        
        html += `
            <div style="background: #1a1a1a; border: 1px solid #333; padding: 1rem; border-radius: 4px; margin-bottom: 0.8rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
                <div style="display: flex; align-items: center; gap: 0.8rem; flex: 1;">
                    <img src="${logoA}" alt="${match.teamA}" style="width: 40px; height: 40px; object-fit: contain;">
                    <div style="color: white; font-size: 0.9rem; font-weight: 500;">${skrotA}</div>
                </div>
                <div style="text-align: center; color: #888; font-size: 0.85rem;">${match.czas}</div>
                <div style="display: flex; align-items: center; gap: 0.8rem; flex: 1; justify-content: flex-end;">
                    <div style="color: white; font-size: 0.9rem; font-weight: 500;">${skrotB}</div>
                    <img src="${logoB}" alt="${match.teamB}" style="width: 40px; height: 40px; object-fit: contain;">
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function changeRound(direction) {
    // Placeholder for changing rounds
    alert("To jest tylko demo - dostępna jest tylko 18. kolejka.");
}

function loadClubsGallery() {
    const container = document.getElementById('clubs-grid');
    if (!container) return;
    
    container.innerHTML = '';
    druzyny.forEach(team => {
        const clubCard = document.createElement('div');
        clubCard.className = 'club-card-large';
        clubCard.style.backgroundImage = `url('${team.stadium}')`;
        clubCard.innerHTML = `
            <div class="club-card-overlay">
                <div class="club-card-logo">
                    <img src="${team.logo}" alt="${team.nazwa}">
                </div>
                <h3>${team.nazwa}</h3>
                <button class="club-profile-btn" onclick="showClubProfile(${team.id})">PROFIL KLUBU →</button>
            </div>
        `;
        container.appendChild(clubCard);
    });
}

function showClubProfile(teamId) {
    const team = druzyny.find(d => d.id === teamId);
    const stats = tabela.find(t => t.id === teamId);
    
    if (!team || !stats) return;
    
    const container = document.getElementById('club-profile-content');
    if (!container) return;
    
    const allViews = document.querySelectorAll('[id$="-view"]');
    allViews.forEach(view => view.style.display = 'none');
    
    const profileView = document.getElementById('club-profile-view');
    if (profileView) profileView.style.display = 'block';
    
    container.innerHTML = `
        <div class="club-profile-container">
            <div class="club-profile-header">
                <img src="${team.logo}" alt="${team.nazwa}" class="club-profile-logo">
                <h1>${team.nazwa}</h1>
            </div>
            
            <div class="club-profile-tabs">
                <button class="club-tab active" onclick="switchClubTab('o-klubie', ${teamId})">O KLUBIE</button>
                <button class="club-tab" onclick="switchClubTab('zawodnicy', ${teamId})">ZAWODNICY</button>
            </div>
            
            <div id="club-tab-content" class="club-tab-content">
                <div class="club-info-grid">
                    <div class="info-item">
                        <span class="info-label">Mecze</span>
                        <span class="info-value">${stats.mecze}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Punkty</span>
                        <span class="info-value">${stats.punkty}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Zwycięstwa</span>
                        <span class="info-value">${stats.wygrane}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Remisy</span>
                        <span class="info-value">${stats.remisy}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Porażki</span>
                        <span class="info-value">${stats.przegrane}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Bramki</span>
                        <span class="info-value">${stats.bramkiZa}:${stats.bramkiProti}</span>
                    </div>
                </div>
            </div>
            
            <button class="back-btn" onclick="showClubsView()">← POWRÓT</button>
        </div>
    `;
}

function switchClubTab(tab, teamId) {
    const buttons = document.querySelectorAll('.club-tab');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const team = druzyny.find(d => d.id === teamId);
    const stats = tabela.find(t => t.id === teamId);
    const contentDiv = document.getElementById('club-tab-content');
    
    if (tab === 'o-klubie') {
        contentDiv.innerHTML = `
            <div class="club-info-grid">
                <div class="info-item">
                    <span class="info-label">Mecze</span>
                    <span class="info-value">${stats.mecze}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Punkty</span>
                    <span class="info-value">${stats.punkty}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Zwycięstwa</span>
                    <span class="info-value">${stats.wygrane}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Remisy</span>
                    <span class="info-value">${stats.remisy}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Porażki</span>
                    <span class="info-value">${stats.przegrane}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Bramki</span>
                    <span class="info-value">${stats.bramkiZa}:${stats.bramkiProti}</span>
                </div>
            </div>
        `;
    } else if (tab === 'zawodnicy') {
        const teamPlayers = zawodnicy.filter(z => z.klub === teamId);
        const strikers = teamPlayers.filter(z => z.pozycja === 'Napastnik').sort((a, b) => b.gole - a.gole);
        const assists = teamPlayers.sort((a, b) => b.asysty - a.asysty);
        
        contentDiv.innerHTML = `
            <div class="players-tabs">
                <button class="player-tab active" onclick="switchPlayerTab('strzelcy', this)">STRZELCY</button>
                <button class="player-tab" onclick="switchPlayerTab('asysty', this)">ASYSTY</button>
            </div>
            <div id="strikers-content" class="players-grid">
                ${strikers.map((p, i) => `
                    <div class="player-card">
                        <div class="player-rank">${i + 1}</div>
                        <div class="player-stats">
                            <div class="player-name">${p.imie} ${p.nazwisko}</div>
                            <div class="player-count">${p.gole}</div>
                            <div class="player-label">GOLI</div>
                        </div>
                        <a href="${p.profil}" class="player-link" target="_blank">PROFIL</a>
                    </div>
                `).join('')}
            </div>
            <div id="assists-content" class="players-grid" style="display: none;">
                ${assists.map((p, i) => `
                    <div class="player-card">
                        <div class="player-rank">${i + 1}</div>
                        <div class="player-stats">
                            <div class="player-name">${p.imie} ${p.nazwisko}</div>
                            <div class="player-count">${p.asysty}</div>
                            <div class="player-label">ASYST</div>
                        </div>
                        <a href="${p.profil}" class="player-link" target="_blank">PROFIL</a>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

function switchPlayerTab(tab, btn) {
    const tabs = btn.parentElement.querySelectorAll('.player-tab');
    tabs.forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    
    const strikersContent = document.getElementById('strikers-content');
    const assistsContent = document.getElementById('assists-content');
    
    if (tab === 'strzelcy') {
        if (strikersContent) strikersContent.style.display = 'grid';
        if (assistsContent) assistsContent.style.display = 'none';
    } else if (tab === 'asysty') {
        if (strikersContent) strikersContent.style.display = 'none';
        if (assistsContent) assistsContent.style.display = 'grid';
    }
}

function switchStatsType(type, btn) {
    const tabs = btn.parentElement.querySelectorAll('.stats-type-tab');
    tabs.forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    
    const indywidualne = document.getElementById('stats-indywidualne');
    const druzynowe = document.getElementById('stats-druzynowe');
    
    if (type === 'indywidualne') {
        if (indywidualne) indywidualne.style.display = 'block';
        if (druzynowe) druzynowe.style.display = 'none';
    } else if (type === 'druzynowe') {
        if (indywidualne) indywidualne.style.display = 'none';
        if (druzynowe) druzynowe.style.display = 'block';
    }
}

function switchPlayerType(type, btn) {
    const tabs = btn.parentElement.querySelectorAll('.player-type-btn');
    tabs.forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
}

function showClubsView() {
    const allViews = document.querySelectorAll('[id$="-view"]');
    allViews.forEach(view => view.style.display = 'none');
    
    const clubsView = document.getElementById('clubs-view');
    if (clubsView) {
        clubsView.style.display = 'grid';
        loadClubsGallery();
    }
    
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
}

function showLeagueStats() {
    const allViews = document.querySelectorAll('[id$="-view"]');
    allViews.forEach(view => view.style.display = 'none');
    
    const leagueStatsView = document.getElementById('league-stats-view');
    const container = document.getElementById('league-stats-content');
    
    if (!leagueStatsView || !container) return;
    
    leagueStatsView.style.display = 'block';
    
    container.innerHTML = `
        <div class="league-stats-container">
            <h1 style="color: white; margin-bottom: 2rem; text-transform: uppercase; letter-spacing: 2px;">STATYSTYKI</h1>
            
            <div class="search-bar-container">
                <input type="text" id="player-search" class="player-search-input" placeholder="Wyszukaj zawodnika..." onkeyup="filterPlayers()">
                <div id="search-results" class="search-results"></div>
            </div>
            
            <div class="stats-tabs">
                <button class="stats-tab-btn active" onclick="switchStatsTab('indywidualne')">INDYWIDUALNE</button>
                <button class="stats-tab-btn" onclick="switchStatsTab('druzynowe')">DRUŻYNOWE</button>
            </div>
            
            <div id="indywidualne-stats" class="stats-tab-content">
                <div class="stats-type-buttons">
                    <button class="stats-type-btn active" onclick="switchPlayerType('pola')">ZAWODNICY Z POLA</button>
                    <button class="stats-type-btn" onclick="switchPlayerType('bramkarze')">BRAMKARZE</button>
                </div>
                
                <div id="pola-stats" class="stats-columns">
                    <div class="stats-column">
                        <div class="stats-column-header">KLASYFIKACJA STRZELCÓW</div>
                        <div id="scorers-list" class="stats-players-list"></div>
                        <div class="stats-more"><a href="#">WIĘCEJ →</a></div>
                    </div>
                    
                    <div class="stats-column">
                        <div class="stats-column-header">ASYSTENCI</div>
                        <div id="assists-list" class="stats-players-list"></div>
                        <div class="stats-more"><a href="#">WIĘCEJ →</a></div>
                    </div>
                    
                    <div class="stats-column">
                        <div class="stats-column-header">KLASYFIKACJA KANADYJSKA</div>
                        <div id="canadian-list" class="stats-players-list"></div>
                        <div class="stats-more"><a href="#">WIĘCEJ →</a></div>
                    </div>
                </div>
                
                <div id="bramkarze-stats" class="stats-columns" style="display: none;">
                    <div class="stats-column">
                        <div class="stats-column-header">NAJMNIEJ STRACONYCH BRAMEK</div>
                        <div id="gk-list" class="stats-players-list"></div>
                    </div>
                </div>
            </div>
            
            <div id="druzynowe-stats" class="stats-tab-content" style="display: none;">
                <p style="color: #aaa; text-align: center; margin-top: 2rem;">Statystyki drużynowe wkrótce</p>
            </div>
        </div>
    `;
    
    populateLeagueStats();
    
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    document.getElementById('nav-stats').classList.add('active');
}

function switchStatsTab(tab) {
    document.querySelectorAll('.stats-tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    document.getElementById('indywidualne-stats').style.display = tab === 'indywidualne' ? 'block' : 'none';
    document.getElementById('druzynowe-stats').style.display = tab === 'druzynowe' ? 'block' : 'none';
}

function switchPlayerType(type) {
    document.querySelectorAll('.stats-type-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    document.getElementById('pola-stats').style.display = type === 'pola' ? 'block' : 'none';
    document.getElementById('bramkarze-stats').style.display = type === 'bramkarze' ? 'block' : 'none';
}

function populateLeagueStats() {
    const polacy = zawodnicy.filter(p => p.pozycja !== 'Bramkarz');
    const bramkarze = zawodnicy.filter(p => p.pozycja === 'Bramkarz');
    
    const topScorers = [...polacy].sort((a, b) => b.gole - a.gole);
    const topAssists = [...polacy].sort((a, b) => b.asysty - a.asysty);
    const topCanadian = [...polacy].sort((a, b) => (b.gole + b.asysty) - (a.gole + a.asysty));
    
    renderTopScorers(topScorers);
    renderTopAssists(topAssists);
    renderTopCanadian(topCanadian);
}

function renderTopScorers(scorers) {
    const container = document.getElementById('scorers-list');
    const topPlayer = scorers[0];
    const restPlayers = scorers.slice(1, 4);
    const klub = druzyny.find(d => d.id === topPlayer.klub);
    
    let html = `
        <div class="stats-top-player">
            <div class="stats-top-player-name">${topPlayer.imie.toUpperCase()} ${topPlayer.nazwisko.toUpperCase()}</div>
            <div class="stats-top-player-number">${topPlayer.gole}</div>
            <div class="stats-top-player-team">
                <img src="${klub?.logo}" alt="${klub?.nazwa}" style="width: 40px; height: 40px; object-fit: contain;">
            </div>
        </div>
    `;
    
    restPlayers.forEach((player, idx) => {
        const playerKlub = druzyny.find(d => d.id === player.klub);
        html += `
            <div class="stats-player-row" onclick="openPlayerModal(${player.id})">
                <span class="stats-rank">${idx + 2}</span>
                <span class="stats-player-name">${player.imie} ${player.nazwisko}</span>
                <span class="stats-value">${player.gole}</span>
                <img src="${playerKlub?.logo}" alt="${playerKlub?.nazwa}" class="stats-club-icon">
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function renderTopAssists(assists) {
    const container = document.getElementById('assists-list');
    const topPlayer = assists[0];
    const restPlayers = assists.slice(1, 4);
    const klub = druzyny.find(d => d.id === topPlayer.klub);
    
    let html = `
        <div class="stats-top-player">
            <div class="stats-top-player-name">${topPlayer.imie.toUpperCase()} ${topPlayer.nazwisko.toUpperCase()}</div>
            <div class="stats-top-player-number">${topPlayer.asysty}</div>
            <div class="stats-top-player-team">
                <img src="${klub?.logo}" alt="${klub?.nazwa}" style="width: 40px; height: 40px; object-fit: contain;">
            </div>
        </div>
    `;
    
    restPlayers.forEach((player, idx) => {
        const playerKlub = druzyny.find(d => d.id === player.klub);
        html += `
            <div class="stats-player-row" onclick="openPlayerModal(${player.id})">
                <span class="stats-rank">${idx + 2}</span>
                <span class="stats-player-name">${player.imie} ${player.nazwisko}</span>
                <span class="stats-value">${player.asysty}</span>
                <img src="${playerKlub?.logo}" alt="${playerKlub?.nazwa}" class="stats-club-icon">
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function renderTopCanadian(canadian) {
    const container = document.getElementById('canadian-list');
    const topPlayer = canadian[0];
    const restPlayers = canadian.slice(1, 4);
    const klub = druzyny.find(d => d.id === topPlayer.klub);
    
    let html = `
        <div class="stats-top-player">
            <div class="stats-top-player-name">${topPlayer.imie.toUpperCase()} ${topPlayer.nazwisko.toUpperCase()}</div>
            <div class="stats-top-player-number">${topPlayer.gole + topPlayer.asysty}</div>
            <div class="stats-top-player-team">
                <img src="${klub?.logo}" alt="${klub?.nazwa}" style="width: 40px; height: 40px; object-fit: contain;">
            </div>
        </div>
    `;
    
    restPlayers.forEach((player, idx) => {
        const playerKlub = druzyny.find(d => d.id === player.klub);
        html += `
            <div class="stats-player-row" onclick="openPlayerModal(${player.id})">
                <span class="stats-rank">${idx + 2}</span>
                <span class="stats-player-name">${player.imie} ${player.nazwisko}</span>
                <span class="stats-value">${player.gole + player.asysty}</span>
                <img src="${playerKlub?.logo}" alt="${playerKlub?.nazwa}" class="stats-club-icon">
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function openPlayerModal(playerId) {
    const player = zawodnicy.find(p => p.id === playerId);
    if (!player) return;
    
    const klub = druzyny.find(d => d.id === player.klub);
    const modal = document.getElementById('player-modal');
    const modalBody = document.getElementById('player-modal-body');
    
    const robloxId = player.profil.split('/users/')[1].split('/')[0];
    const avatarUrl = `https://www.roblox.com/bust-thumbnail/image?userId=${robloxId}&width=420&height=420&format=png`;
    
    modalBody.innerHTML = `
        <div class="player-profile-content">
            <div class="player-profile-header">
                <img src="${avatarUrl}" alt="${player.imie} ${player.nazwisko}" class="player-avatar" onerror="this.onerror=null; this.src='https://tr.rbxcdn.com/9f3e6c94f45fb5fa3b9e7a34c4a6d6a3/420x420.png'" loading="lazy">
            </div>
            
            <div class="player-profile-info">
                <h2>${player.imie} ${player.nazwisko}</h2>
                <div class="player-profile-bio">
                    <div class="player-bio-item">
                        <span class="player-bio-label">KLUB</span>
                        <span class="player-bio-value">${klub?.nazwa}</span>
                    </div>
                    <div class="player-bio-item">
                        <span class="player-bio-label">POZYCJA</span>
                        <span class="player-bio-value">${player.pozycja}</span>
                    </div>
                </div>
                
                <div class="player-stats-grid">
                    <div class="player-stat">
                        <div class="player-stat-value">${player.gole}</div>
                        <div class="player-stat-label">GOLE</div>
                    </div>
                    <div class="player-stat">
                        <div class="player-stat-value">${player.asysty}</div>
                        <div class="player-stat-label">ASYSTY</div>
                    </div>
                    <div class="player-stat">
                        <div class="player-stat-value">${player.gole + player.asysty}</div>
                        <div class="player-stat-label">RAZEM</div>
                    </div>
                </div>
                
                <a href="${player.profil}" target="_blank" class="player-profile-link">Odwiedź Profil Roblox →</a>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function closePlayerModal() {
    document.getElementById('player-modal').style.display = 'none';
}

function filterPlayers() {
    const searchInput = document.getElementById('player-search');
    const searchTerm = searchInput.value.toLowerCase();
    const searchResults = document.getElementById('search-results');
    
    if (!searchTerm) {
        searchResults.innerHTML = '';
        searchResults.style.display = 'none';
        return;
    }
    
    const results = zawodnicy.filter(p => 
        p.imie.toLowerCase().includes(searchTerm) || 
        p.nazwisko.toLowerCase().includes(searchTerm) ||
        (p.robloxName && p.robloxName.toLowerCase().includes(searchTerm))
    );
    
    if (results.length > 0) {
        searchResults.innerHTML = results.map(p => `
            <div class="search-result-item" onclick="openDetailedPlayerProfile(${p.id})">
                <div class="search-result-name">${p.imie} ${p.nazwisko}</div>
                ${p.robloxName ? `<div class="search-result-roblox">${p.robloxName}</div>` : ''}
            </div>
        `).join('');
        searchResults.style.display = 'block';
    } else {
        searchResults.innerHTML = '<div class="search-result-item">Brak wyników</div>';
        searchResults.style.display = 'block';
    }
}

function filterPlayersNavbar() {
    const searchInput = document.getElementById('navbar-player-search');
    const searchTerm = searchInput.value.toLowerCase();
    const searchResults = document.getElementById('navbar-search-results');
    
    if (!searchTerm) {
        searchResults.innerHTML = '';
        searchResults.style.display = 'none';
        return;
    }
    
    const results = zawodnicy.filter(p => 
        p.imie.toLowerCase().includes(searchTerm) || 
        p.nazwisko.toLowerCase().includes(searchTerm) ||
        (p.robloxName && p.robloxName.toLowerCase().includes(searchTerm))
    );
    
    if (results.length > 0) {
        searchResults.innerHTML = results.map(p => `
            <div class="search-result-item" onclick="openDetailedPlayerProfile(${p.id})">
                <div class="search-result-name">${p.imie} ${p.nazwisko}</div>
                ${p.robloxName ? `<div class="search-result-roblox">${p.robloxName}</div>` : ''}
            </div>
        `).join('');
        searchResults.style.display = 'block';
    } else {
        searchResults.innerHTML = '<div class="search-result-item">Brak wyników</div>';
        searchResults.style.display = 'block';
    }
}

function openDetailedPlayerProfile(playerId) {
    const player = zawodnicy.find(p => p.id === playerId);
    if (!player) return;
    
    const klub = druzyny.find(d => d.id === player.klub);
    const modal = document.getElementById('player-modal');
    const modalBody = document.getElementById('player-modal-body');
    
    const robloxId = player.profil.split('/users/')[1].split('/')[0];
    const avatarUrl = `https://www.roblox.com/bust-thumbnail/image?userId=${robloxId}&width=420&height=420&format=png`;
    const displayName = player.robloxName || player.nazwisko;
    
    modalBody.innerHTML = `
        <div class="detailed-player-profile">
            <div class="detailed-player-header" style="background: linear-gradient(135deg, #0056b3, #00aaff); padding: 2rem; border-radius: 8px 8px 0 0; display: flex; gap: 2.5rem; align-items: center;">
                <div style="flex-shrink: 0;">
                    <img src="${avatarUrl}" alt="${player.imie} ${player.nazwisko}" style="width: 200px; height: 200px; border-radius: 12px; border: 4px solid white; object-fit: cover;" onerror="this.onerror=null; this.src='https://tr.rbxcdn.com/9f3e6c94f45fb5fa3b9e7a34c4a6d6a3/420x420.png'" loading="lazy">
                </div>
                <div style="color: white; flex: 1; display: flex; flex-direction: column; justify-content: center;">
                    <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1rem;">
                        <div>
                            <div style="font-size: 2.5rem; font-weight: bold; text-transform: uppercase; line-height: 1.2;">${player.imie}</div>
                            <div style="font-size: 2.5rem; font-weight: bold; text-transform: uppercase; line-height: 1.2; color: #00aaff;">${displayName}</div>
                        </div>
                        <img src="${klub?.logo}" alt="${klub?.nazwa}" style="height: 100px; width: auto; max-width: 150px; filter: drop-shadow(0 0 5px rgba(0,0,0,0.3));">
                    </div>
                    <div style="font-size: 0.95rem; opacity: 0.95; margin-bottom: 0.5rem;">Pozycja: <strong>${player.pozycja}</strong></div>
                    <div style="font-size: 0.95rem; opacity: 0.95;">Klub: <strong>${klub?.nazwa}</strong></div>
                </div>
            </div>
            
            <div class="detailed-player-bio" style="background: rgba(0, 0, 0, 0.2); padding: 1.5rem; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; border-bottom: 2px solid #0056b3;">
                <div style="border-right: 1px solid #0056b3; padding-right: 1rem;">
                    <div style="color: #aaa; font-size: 0.8rem; margin-bottom: 0.3rem;">IMĘ</div>
                    <div style="color: white; font-weight: bold;">${player.imie}</div>
                </div>
                <div style="border-right: 1px solid #0056b3; padding-right: 1rem;">
                    <div style="color: #aaa; font-size: 0.8rem; margin-bottom: 0.3rem;">NICK</div>
                    <div style="color: white; font-weight: bold;">${displayName}</div>
                </div>
                <div>
                    <div style="color: #aaa; font-size: 0.8rem; margin-bottom: 0.3rem;">KRAJ</div>
                    <div style="color: white; font-weight: bold;">${player.kraj || 'N/A'}</div>
                </div>
                <div style="border-right: 1px solid #0056b3; padding-right: 1rem; border-top: 1px solid #0056b3; padding-top: 1rem; margin-top: 1rem;">
                    <div style="color: #aaa; font-size: 0.8rem; margin-bottom: 0.3rem;">POZYCJA</div>
                    <div style="color: white; font-weight: bold;">${player.pozycja}</div>
                </div>
                <div style="border-right: 1px solid #0056b3; padding-right: 1rem; border-top: 1px solid #0056b3; padding-top: 1rem; margin-top: 1rem;">
                    <div style="color: #aaa; font-size: 0.8rem; margin-bottom: 0.3rem;">WZROST</div>
                    <div style="color: white; font-weight: bold;">185 cm</div>
                </div>
                <div style="border-top: 1px solid #0056b3; padding-top: 1rem; margin-top: 1rem;">
                    <div style="color: #aaa; font-size: 0.8rem; margin-bottom: 0.3rem;">DATA URODZENIA</div>
                    <div style="color: white; font-weight: bold;">${player.dataUrodzenia || '1996-03-06'}</div>
                </div>
            </div>
            
            <div class="detailed-stats-grid" style="padding: 2rem; display: grid; grid-template-columns: repeat(6, 1fr); gap: 1.5rem;">
                <div style="text-align: center;">
                    <div style="font-size: 1.8rem; color: #00aaff; font-weight: bold;">${player.gole + player.asysty}</div>
                    <div style="color: #aaa; font-size: 0.8rem; text-transform: uppercase;">Mecze Rozegrane</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 1.8rem; color: #00aaff; font-weight: bold;">${player.gole + player.asysty}</div>
                    <div style="color: #aaa; font-size: 0.8rem; text-transform: uppercase;">Mecze w podstawowym składzie</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 1.8rem; color: #00aaff; font-weight: bold;">${player.gole}</div>
                    <div style="color: #aaa; font-size: 0.8rem; text-transform: uppercase;">Gole</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 1.8rem; color: #00aaff; font-weight: bold;">${player.asysty}</div>
                    <div style="color: #aaa; font-size: 0.8rem; text-transform: uppercase;">Asysty</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 1.8rem; color: #00aaff; font-weight: bold;">${player.gole + player.asysty}</div>
                    <div style="color: #aaa; font-size: 0.8rem; text-transform: uppercase;">Klasyfikacja Kanadyjska</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 1.8rem; color: #00aaff; font-weight: bold;">1</div>
                    <div style="color: #aaa; font-size: 0.8rem; text-transform: uppercase;">Kluczowy udział bez asysty</div>
                </div>
            </div>
            
            <div style="padding: 1.5rem; text-align: center;">
                <a href="${player.profil}" target="_blank" class="player-profile-link">Odwiedź Profil Roblox →</a>
            </div>
        </div>
    `;
    
    const playerSearch = document.getElementById('player-search');
    const navbarSearch = document.getElementById('navbar-player-search');
    if (playerSearch) {
        playerSearch.value = '';
        document.getElementById('search-results').innerHTML = '';
        document.getElementById('search-results').style.display = 'none';
    }
    if (navbarSearch) {
        navbarSearch.value = '';
        document.getElementById('navbar-search-results').innerHTML = '';
        document.getElementById('navbar-search-results').style.display = 'none';
    }
    
    modal.style.display = 'block';
}
