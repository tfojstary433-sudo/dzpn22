-- Roblox Server Script dla `:endmatch`
-- Ten skrypt obsługuje komendę :endmatch i wysyła dane do API

local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")

-- Konfiguracja
local API_URL = "https://pff-website-mjz2.vercel.app/api/endmatch"
local MATCH_DATA = {
	matchId = "",
	homeTeamId = "",
	awayTeamId = "",
	homeScore = 0,
	awayScore = 0,
	scorers = {},
	extraStats = {}, -- Kartki i czyste konta
	report = ""
}

-- Funkcja do pobrania avatara gracza
local function getPlayerAvatar(userId)
	return string.format("https://www.roblox.com/headshot-thumbnail/image?userId=%d&width=150&height=150&format=png", userId)
end

-- Funkcja do wysłania danych o zakończonym meczu
local function sendMatchResult()
	local success, response = pcall(function()
		local jsonData = HttpService:JSONEncode({
			matchId = MATCH_DATA.matchId,
			homeTeamId = MATCH_DATA.homeTeamId,
			awayTeamId = MATCH_DATA.awayTeamId,
			homeScore = MATCH_DATA.homeScore,
			awayScore = MATCH_DATA.awayScore,
			scorers = MATCH_DATA.scorers,
			extraStats = MATCH_DATA.extraStats,
			report = MATCH_DATA.report
		})
		
		return HttpService:PostAsync(
			API_URL,
			jsonData,
			Enum.HttpContentType.ApplicationJson,
			false,
			{
				["Content-Type"] = "application/json"
			}
		)
	end)
	
	if success then
		print("✅ Match result saved successfully!")
		print("Response:", response)
		-- Reset data after success
		MATCH_DATA.scorers = {}
		MATCH_DATA.extraStats = {}
		MATCH_DATA.report = ""
		return true
	else
		warn("❌ Failed to save match result:", response)
		return false
	end
end

-- Funkcja do dodania statystyk (kartki, czyste konta)
local function addExtraStat(playerName, playerId, teamId, statType)
	local found = false
	for i, stat in ipairs(MATCH_DATA.extraStats) do
		if stat.playerId == playerId then
			if statType == "yellow" then stat.yellowCards = (stat.yellowCards or 0) + 1
			elseif statType == "red" then stat.redCards = (stat.redCards or 0) + 1
			elseif statType == "cs" then stat.cleanSheets = (stat.cleanSheets or 0) + 1
			end
			found = true
			break
		end
	end
	
	if not found then
		table.insert(MATCH_DATA.extraStats, {
			playerName = playerName,
			playerId = playerId,
			teamId = teamId,
			yellowCards = statType == "yellow" and 1 or 0,
			redCards = statType == "red" and 1 or 0,
			cleanSheets = statType == "cs" and 1 or 0,
			avatarUrl = getPlayerAvatar(playerId)
		})
	end
end

-- Funkcja do dodania strzelca
local function addScorer(playerName, playerId, teamId, goals)
	local avatarUrl = getPlayerAvatar(playerId)
	
	-- Sprawdź czy gracz już strzelał
	local found = false
	for i, scorer in ipairs(MATCH_DATA.scorers) do
		if scorer.playerId == playerId then
			scorer.goals = scorer.goals + goals
			found = true
			break
		end
	end
	
	-- Jeśli nie, dodaj nowego strzelca
	if not found then
		table.insert(MATCH_DATA.scorers, {
			playerName = playerName,
			playerId = playerId,
			teamId = teamId,
			goals = goals,
			avatarUrl = avatarUrl
		})
	end
end

-- Komenda :endmatch
game.Players.PlayerAdded:Connect(function(player)
	player.Chatted:Connect(function(message)
		-- Tylko admin może użyć komendy
		if not player:GetRankInGroup(YOUR_GROUP_ID) >= ADMIN_RANK then
			return
		end
		
		-- Przykład: :endmatch m1 UNI LGD 2 1
		-- m1 = matchId, UNI = homeTeamId, LGD = awayTeamId, 2 = homeScore, 1 = awayScore
		local args = string.split(message, " ")
		
		if args[1]:lower() == ":endmatch" then
			if #args < 6 then
				player:Kick("Błąd: :endmatch [matchId] [homeTeamId] [awayTeamId] [homeScore] [awayScore]")
				return
			end
			
			MATCH_DATA.matchId = args[2]
			MATCH_DATA.homeTeamId = args[3]
			MATCH_DATA.awayTeamId = args[4]
			MATCH_DATA.homeScore = tonumber(args[5]) or 0
			MATCH_DATA.awayScore = tonumber(args[6]) or 0
			
			print("📊 Match Data Collected:")
			print("Match ID:", MATCH_DATA.matchId)
			print("Home Team:", MATCH_DATA.homeTeamId, "Score:", MATCH_DATA.homeScore)
			print("Away Team:", MATCH_DATA.awayTeamId, "Score:", MATCH_DATA.awayScore)
			
			-- Wyślij dane
			sendMatchResult()
		end
		
		-- Przykład: :addgoal PlayerName 123456 UNI 1
		if args[1]:lower() == ":addgoal" then
			if #args < 5 then
				player:Kick("Błąd: :addgoal [playerName] [playerId] [teamId] [goals]")
				return
			end
			local playerName, playerId, teamId, goals = args[2], tonumber(args[3]), args[4], tonumber(args[5]) or 1
			addScorer(playerName, playerId, teamId, goals)
			print("⚽ Goal added for:", playerName)
		end

		-- Przykład: :addcard yellow PlayerName 123456 UNI
		if args[1]:lower() == ":addcard" then
			if #args < 5 then return end
			local cardType, playerName, playerId, teamId = args[2]:lower(), args[3], tonumber(args[4]), args[5]
			addExtraStat(playerName, playerId, teamId, cardType)
			print("🟨/🟥 Card added for:", playerName)
		end

		-- Przykład: :addcs PlayerName 123456 UNI
		if args[1]:lower() == ":addcs" then
			if #args < 4 then return end
			local playerName, playerId, teamId = args[2], tonumber(args[3]), args[4]
			addExtraStat(playerName, playerId, teamId, "cs")
			print("🧤 Clean sheet added for:", playerName)
		end

		-- Przykład: :report Super mecz, obie druzyny walczyly do konca!
		if args[1]:lower() == ":report" then
			table.remove(args, 1)
			MATCH_DATA.report = table.concat(args, " ")
			print("📝 Report added")
		end
	end)
end)

-- Przykład użycia w grze:
--[[
	1. :addgoal MarcPelaz 123456789 UNI 1
	2. :addcard yellow MarcPelaz 123456789 UNI
	3. :addcs JanKowalski 987654321 UNI
	4. :report Bardzo zacięte spotkanie!
	5. :endmatch m1 UNI LGD 2 1
]]

print("⚽ Match System Loaded!")
print("Commands:")
print("  :addgoal [playerName] [playerId] [teamId] [goals]")
print("  :addcard [yellow/red] [playerName] [playerId] [teamId]")
print("  :addcs [playerName] [playerId] [teamId]")
print("  :report [text...]")
print("  :endmatch [matchId] [homeTeamId] [awayTeamId] [homeScore] [awayScore]")
