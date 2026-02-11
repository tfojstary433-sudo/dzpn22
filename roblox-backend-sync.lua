local HttpService = game:GetService("HttpService")
local RunService = game:GetService("RunService")

local CONFIG = {
    BACKEND_URL = "https://pff-website-mjz2.vercel.app",
    MATCH_ID = 1,
    UPDATE_INTERVAL = 0.5
}

local State = {
    matchActive = false,
    lastTeamA = nil,
    lastTeamB = nil,
    lastScoreA = 0,
    lastScoreB = 0,
    lastTimer = "00:00",
    lastPeriod = "Pierwsza połowa"
}

local sm = game.ReplicatedStorage.Events.StartMatch
local em = game.ReplicatedStorage.Events.EndMatch
local s = game.ReplicatedStorage.Events.Score
local t = game.ReplicatedStorage.Events.Time
local tms = require(game.ReplicatedStorage.Modules.Tms)

local function getTeamInfo(abbr)
    local teamData = tms[abbr]
    if not teamData then return nil end
    
    return {
        nazwa = teamData.fullName or teamData.fullname or abbr,
        logo = teamData.Logo or "",
        score = 0
    }
end

local function sendToBackend(endpoint, data)
    local success, response = pcall(function()
        return HttpService:PostAsync(
            CONFIG.BACKEND_URL .. endpoint,
            HttpService:JSONEncode(data),
            Enum.HttpContentType.ApplicationJson
        )
    end)
    
    if success then
        print("[Backend Sync] ✓ " .. endpoint)
    else
        print("[Backend Sync] ✗ " .. endpoint .. " - " .. tostring(response))
    end
end

sm.OnServerEvent:Connect(function(plr, team1, team2, h_pos, a_pos, img1, img2)
    State.matchActive = true
    State.lastTeamA = team1
    State.lastTeamB = team2
    State.lastScoreA = 0
    State.lastScoreB = 0
    State.lastTimer = "00:00"
    
    local teamAData = getTeamInfo(team1)
    local teamBData = getTeamInfo(team2)
    
    if teamAData and teamBData then
        sendToBackend("/api/match/start", {
            matchId = CONFIG.MATCH_ID,
            teamA = teamAData,
            teamB = teamBData
        })
    end
end)

em.OnServerEvent:Connect(function(plr)
    State.matchActive = false
    
    sendToBackend("/api/match/end", {
        teamAScore = State.lastScoreA,
        teamBScore = State.lastScoreB
    })
end)

s.OnServerEvent:Connect(function(plr, scoreA, scoreB)
    State.lastScoreA = tonumber(scoreA) or 0
    State.lastScoreB = tonumber(scoreB) or 0
    
    sendToBackend("/api/match/update", {
        teamAScore = State.lastScoreA,
        teamBScore = State.lastScoreB,
        timer = State.lastTimer,
        period = State.lastPeriod
    })
end)

t.OnServerEvent:Connect(function(plr, currentTime, addedTime)
    if not State.matchActive then return end
    
    local minutes = math.floor(currentTime / 60)
    local seconds = currentTime % 60
    
    local timerText
    if addedTime then
        timerText = string.format("%02d:%02d +%d", minutes, seconds, addedTime)
    else
        timerText = string.format("%02d:%02d", minutes, seconds)
    end
    
    local period = "Pierwsza połowa"
    if minutes > 45 then
        if minutes < 90 then
            period = "Druga połowa"
        else
            period = "Mecz zakończony"
        end
    end
    
    State.lastTimer = timerText
    State.lastPeriod = period
    
    sendToBackend("/api/match/update", {
        teamAScore = State.lastScoreA,
        teamBScore = State.lastScoreB,
        timer = timerText,
        period = period
    })
end)

print("[Backend Sync] Zainicjalizowano - backend URL: " .. CONFIG.BACKEND_URL)
