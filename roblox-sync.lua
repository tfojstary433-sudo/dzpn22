local HttpService = game:GetService("HttpService")

local BACKEND_URL = "https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev"

local sm = game.ReplicatedStorage.Events.StartMatch
local em = game.ReplicatedStorage.Events.EndMatch
local s = game.ReplicatedStorage.Events.Score
local t = game.ReplicatedStorage.Events.Time
local tms = require(game.ReplicatedStorage.Modules.Tms)

local currentMatch = {
    teamA = "",
    teamB = "",
    scoreA = 0,
    scoreB = 0
}

local function sendToBackend(endpoint, data)
    local success, result = pcall(function()
        return HttpService:PostAsync(
            BACKEND_URL .. endpoint,
            HttpService:JSONEncode(data),
            Enum.HttpContentType.ApplicationJson
        )
    end)
    
    if success then
        print("[SYNC] ✓ " .. endpoint)
    else
        print("[SYNC] ✗ " .. endpoint .. " ERROR: " .. tostring(result))
    end
end

sm.OnServerEvent:Connect(function(plr, team1, team2, h_pos, a_pos, img1, img2)
    currentMatch.teamA = tms[team1].fullName or tms[team1].fullname or team1
    currentMatch.teamB = tms[team2].fullName or tms[team2].fullname or team2
    currentMatch.scoreA = 0
    currentMatch.scoreB = 0
    
    sendToBackend("/api/match/start", {
        teamA = currentMatch.teamA,
        teamB = currentMatch.teamB
    })
    
    print("[MECZ] Rozpoczęty: " .. currentMatch.teamA .. " vs " .. currentMatch.teamB)
end)

em.OnServerEvent:Connect(function(plr)
    sendToBackend("/api/match/end", {})
    print("[MECZ] Zakończony")
end)

s.OnServerEvent:Connect(function(plr, scoreA, scoreB)
    currentMatch.scoreA = tonumber(scoreA) or 0
    currentMatch.scoreB = tonumber(scoreB) or 0
    
    sendToBackend("/api/match/update", {
        teamAScore = currentMatch.scoreA,
        teamBScore = currentMatch.scoreB
    })
    
    print("[SCORE] " .. currentMatch.scoreA .. " - " .. currentMatch.scoreB)
end)

t.OnServerEvent:Connect(function(plr, currentTime, addedTime)
    local minutes = math.floor(currentTime / 60)
    local seconds = currentTime % 60
    
    local timerText
    if addedTime then
        timerText = string.format("%d:%02d +%d", minutes, seconds, addedTime)
    else
        timerText = string.format("%d:%02d", minutes, seconds)
    end
    
    local period = "Pierwsza połowa"
    if minutes > 45 then
        period = "Druga połowa"
    end
    if minutes >= 90 then
        period = "Mecz zakończony"
    end
    
    sendToBackend("/api/match/update", {
        timer = timerText,
        period = period
    })
end)

print("[SYNC] Zainicjalizowano - backend: " .. BACKEND_URL)
