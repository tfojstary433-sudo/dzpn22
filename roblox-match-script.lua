local HttpService = game:GetService("HttpService")

local BACKEND_URL = "https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev"
local MATCH_ID = 1

local teamAName = "Legia Warszawa"
local teamBName = "Lech Poznań"
local teamAScore = 0
local teamBScore = 0
local matchTime = 0
local isMatchActive = false
local matchDuration = 2400

local function getTeamInfo(teamName)
    local teamLogos = {
        ["Legia Warszawa"] = "https://upload.wikimedia.org/wikipedia/commons/a/a4/Legia_Warsaw_logo.png",
        ["Lech Poznań"] = "https://upload.wikimedia.org/wikipedia/en/thumb/b/b0/KKS_Lech_Pozna%C5%84.svg/960px-KKS_Lech_Pozna%C5%84.svg.png",
        ["Pogoń Szczecin"] = "https://pogoncdn.stellis.one/imgsize-xs/documents/7740889/44a6ff9f-f346-69e6-890c-c6f10c6e891b",
        ["Arka Gdynia"] = "https://arka.gdynia.pl/files/herb/arka_gdynia_mzks_kolor.png",
        ["Motor Lublin"] = "https://i.ibb.co/bgRJrvnj/Motor-Lublin-S-A-Oficjalny-Herb.png",
        ["Olimpia Elbląg"] = "https://i.ibb.co/RGsNqf6G/olimpia-elblag.png"
    }
    return teamLogos[teamName] or ""
end

local function formatTime(seconds)
    local minutes = math.floor(seconds / 60)
    local secs = seconds % 60
    return string.format("%d:%02d", minutes, secs)
end

local function getPeriod(seconds)
    if seconds < 1200 then
        return "Pierwsza połowa"
    elseif seconds < 2400 then
        return "Druga połowa"
    else
        return "Mecz zakończony"
    end
end

local function startMatch(team1, team2)
    teamAName = team1
    teamBName = team2
    teamAScore = 0
    teamBScore = 0
    matchTime = 0
    isMatchActive = true
    
    local data = {
        teamA = team1,
        teamB = team2
    }
    
    local success, response = pcall(function()
        return HttpService:PostAsync(BACKEND_URL .. "/api/match/start", HttpService:JSONEncode(data), Enum.HttpContentType.ApplicationJson)
    end)
    
    if success then
        print("Mecz rozpoczęty:", response)
    else
        print("Błąd przy starcie meczu:", response)
    end
end

local function updateMatch(scoreA, scoreB)
    teamAScore = scoreA
    teamBScore = scoreB
    
    local data = {
        teamAScore = scoreA,
        teamBScore = scoreB,
        timer = formatTime(matchTime),
        period = getPeriod(matchTime)
    }
    
    local success, response = pcall(function()
        return HttpService:PostAsync(BACKEND_URL .. "/api/match/update", HttpService:JSONEncode(data), Enum.HttpContentType.ApplicationJson)
    end)
    
    if success then
        print("Mecz zaktualizowany:", formatTime(matchTime), scoreA, "-", scoreB)
    end
end

local function addGoal(team, playerName)
    local event = {
        type = "goal",
        team = team,
        description = playerName .. " zdobył gola!"
    }
    
    local data = {
        event = event,
        timer = formatTime(matchTime),
        period = getPeriod(matchTime)
    }
    
    if team == "A" then
        teamAScore = teamAScore + 1
        data.teamAScore = teamAScore
        data.teamBScore = teamBScore
    else
        teamBScore = teamBScore + 1
        data.teamAScore = teamAScore
        data.teamBScore = teamBScore
    end
    
    local success, response = pcall(function()
        return HttpService:PostAsync(BACKEND_URL .. "/api/match/update", HttpService:JSONEncode(data), Enum.HttpContentType.ApplicationJson)
    end)
end

local function endMatch()
    isMatchActive = false
    
    local success, response = pcall(function()
        return HttpService:PostAsync(BACKEND_URL .. "/api/match/end", HttpService:JSONEncode({
            teamAScore = teamAScore,
            teamBScore = teamBScore
        }), Enum.HttpContentType.ApplicationJson)
    end)
    
    if success then
        print("Mecz zakończony!")
    end
end

local function matchLoop()
    while isMatchActive and matchTime < matchDuration do
        wait(1)
        matchTime = matchTime + 1
        
        local data = {
            teamAScore = teamAScore,
            teamBScore = teamBScore,
            timer = formatTime(matchTime),
            period = getPeriod(matchTime)
        }
        
        local success, response = pcall(function()
            return HttpService:PostAsync(BACKEND_URL .. "/api/match/update", HttpService:JSONEncode(data), Enum.HttpContentType.ApplicationJson)
        end)
    end
    
    if matchTime >= matchDuration then
        endMatch()
    end
end

startMatch("Legia Warszawa", "Lech Poznań")
matchLoop()

return {
    startMatch = startMatch,
    updateMatch = updateMatch,
    addGoal = addGoal,
    endMatch = endMatch
}
