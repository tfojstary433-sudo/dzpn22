local PhysicsService = game:GetService("PhysicsService")
local RunService = game:GetService("RunService")

local sm = game.ReplicatedStorage.Events.StartMatch
local em = game.ReplicatedStorage.Events.EndMatch
local t = game.ReplicatedStorage.Events.Time
local s = game.ReplicatedStorage.Events.Score
local uie = game.ReplicatedStorage.Events.SetFootballUI

local tms = require(script.Parent.Modules.Teams)

local mval = game.ReplicatedStorage.Values.Match
local lbval = game.ReplicatedStorage.Values.Lockballs

local adm = {
	"2115xDeathZ2115"
}

local currentTime = 0
local maxTime = 0
local baseTime = 0 
local timerActive = false
local currentAddedTime = 0

local currentHomeTeam = ""
local currentAwayTeam = ""
local currentHomeScore = 0
local currentAwayScore = 0

local Kits = require(game.ReplicatedStorage.Modules.Tms)

local sowner = nil

game.ReplicatedStorage.Events.TPData.OnServerEvent:Connect(function(p, owner)
	sowner = owner
end)

-- Fizyka piłki - ustawienia dla płynności
local BALL_PHYSICS = PhysicalProperties.new(
	0.4, -- Gęstość
	0.2, -- Tarcie
	0.8, -- Sprężystość (bounciness)
	1,   -- Tarcie (FrictionWeight)
	1    -- Sprężystość (ElasticityWeight)
)

local function setupBall(ball, owner)
	ball.CustomPhysicalProperties = BALL_PHYSICS
	ball.CanCollide = true
	ball:SetNetworkOwner(owner) -- KLUCZ DO PŁYNNOŚCI: Oddanie fizyki klientowi
end

local function getPlayerByQuery(requester, query)
	if not query or query == "" then return nil end
	query = query:lower()

	if query == "me" then
		return requester
	end

	local bestMatch = nil
	local bestScore = -1

	for _, player in pairs(game.Players:GetPlayers()) do
		local nameLower = player.Name:lower()

		if nameLower == query then
			return player
		end

		if string.sub(nameLower, 1, #query) == query then
			if bestScore < 3 then
				bestMatch = player
				bestScore = 3
			end
		elseif string.find(nameLower, query, 1, true) then
			if bestScore < 2 then
				bestMatch = player
				bestScore = 2
			end
		end
	end

	return bestMatch
end

local function hasPermission(plr)
	if plr.UserId == sowner then
		return true
	end

	if table.find(adm, plr.Name) then
		return true
	end

	if plr.Team and plr.Team.Name == "Sędziowie" then
		return true
	end

	return false
end

local function getteam(query)
	if not query or query == "" then return nil end

	local upperQuery = query:upper()
	if tms[upperQuery] then
		return upperQuery
	end

	for abbr, data in pairs(tms) do
		local name = data.fullName or data.fullname
		if name and string.find(name:lower(), query:lower(), 1, true) then
			return abbr
		end
	end

	return nil
end

local function getAnyTeam(query)
	if not query or query == "" then return nil end
	query = query:lower()

	local bestMatch = nil
	local bestScore = -1

	for _, team in pairs(game.Teams:GetChildren()) do
		if team:IsA("Team") then
			local nameLower = team.Name:lower()

			if nameLower == query then
				return team
			end

			if string.sub(nameLower, 1, #query) == query then
				if bestScore < 3 then
					bestMatch = team
					bestScore = 3
				end

			elseif string.find(nameLower, query, 1, true) then
				if bestScore < 2 then
					bestMatch = team
					bestScore = 2
				end
			end
		end
	end

	return bestMatch
end

local function formatTime(seconds)
	local m = math.floor(seconds / 60)
	local s = seconds % 60
	return string.format("%02d:%02d", m, s)
end

game.Players.PlayerAdded:Connect(function(plr)
	local folder = Instance.new("Folder")
	folder.Name = plr.Name
	folder.Parent = workspace.Balls

	if timerActive then
		t:FireClient(plr, currentTime)
	end

	plr.Chatted:Connect(function(msg)
		local plrfolder = workspace.Balls:FindFirstChild(plr.Name)
		if not plrfolder then return end

		local args = string.split(msg, " ")
		local command = args[1]:lower()
		local arg1 = args[2]
		local arg2 = args[3]

		if command == ":pb" then
			if lbval.Value and plr.Team.Name ~= "Sędziowie" then return end

			if plrfolder:FindFirstChild("Ball") then
				plrfolder.Ball:Destroy()
			end

			local ball = game.ServerStorage.Ball:Clone()
			ball.Parent = plrfolder
			-- Spawn lekko nad graczem, by uniknąć glitchowania
			ball.Position = plr.Character.HumanoidRootPart.Position + Vector3.new(0, 2, 0)
			
			setupBall(ball, plr)

		elseif command == ":startmatch" then
			if not hasPermission(plr) then return end
			if not (arg1 and arg2) then return end

			local t1 = getteam(arg1)
			local t2 = getteam(arg2)
			if not (t1 and t2) then return end

			local d1 = tms[t1]
			local d2 = tms[t2]

			local homeData = Kits[d1.fullName or d1.fullname or t1]
			local awayData = Kits[d2.fullName or d2.fullname or t2]

			currentHomeTeam = d1.fullName or d1.fullname or t1
			currentAwayTeam = d2.fullName or d2.fullname or t2
			currentHomeScore = 0
			currentAwayScore = 0
			currentAddedTime = 0

			sm:FireAllClients(t1, t2, d1.h_pos, d2.a_pos, d1.image_id, d2.image_id)

			-- UI na ekranach w świecie gry
			local screen = workspace.Ekran.SurfaceGui
			screen.Enabled = true
			screen.Frame.HomeScore.Text = "0"
			screen.Frame.AwayScore.Text = "0"
			screen.Frame.Timer.Text = "00:00"
			if homeData then screen.Frame.HomeLogo.Image = homeData.Logo end
			if awayData then screen.Frame.AwayLogo.Image = awayData.Logo end

			-- Spawn piłki na środku
			if plrfolder:FindFirstChild("Ball") then plrfolder.Ball:Destroy() end
			local centerBall = game.ServerStorage.Ball:Clone()
			centerBall.Parent = plrfolder
			centerBall.Position = Vector3.new(-5262.7, 518.6, 1372.6) -- Przykładowa pozycja środka
			setupBall(centerBall, nil) -- Server ownership na start

			uie:FireAllClients("Match", true)
			mval.Value = true

		elseif command == ":endmatch" then
			if not hasPermission(plr) then return end

			em:FireAllClients()
			uie:FireAllClients("Match", false)

			local screen = workspace.Ekran.SurfaceGui
			screen.Enabled = false
			
			mval.Value = false
			timerActive = false
			currentTime = 0
			currentAddedTime = 0

			currentHomeTeam = ""
			currentAwayTeam = ""
			currentHomeScore = 0
			currentAwayScore = 0
			
		elseif command == ":team" then
			if not hasPermission(plr) then return end
			if not arg1 or not arg2 then return end

			local targetPlayer = getPlayerByQuery(plr, arg1)
			if not targetPlayer then return end

            local teamObj = getAnyTeam(arg2)
            if not teamObj then return end

            targetPlayer.Team = teamObj

		elseif command == ":score" then
			if not (arg1 and arg2) then return end

			currentHomeScore = tonumber(arg1) or 0
			currentAwayScore = tonumber(arg2) or 0

			workspace.Ekran.SurfaceGui.Frame.HomeScore.Text = tostring(currentHomeScore)
			workspace.Ekran.SurfaceGui.Frame.AwayScore.Text = tostring(currentAwayScore)

			s:FireAllClients(currentHomeScore, currentAwayScore)

		elseif command == ":time" then
			if not hasPermission(plr) then return end
			if not tonumber(arg1) then return end

			currentTime = 0
			baseTime = tonumber(arg1) * 60
			maxTime = baseTime
			timerActive = true
			currentAddedTime = 0

			t:FireAllClients(currentTime)
			local txt = formatTime(currentTime)
			workspace.Ekran.SurfaceGui.Frame.Timer.Text = txt

		elseif command == ":addtime" then
			if not hasPermission(plr) then return end
			if not tonumber(arg1) then return end
			if not timerActive then return end

			maxTime += tonumber(arg1) * 60
			currentAddedTime = tonumber(arg1)

			t:FireAllClients(currentTime, arg1)
			workspace.Ekran.SurfaceGui.Frame.AdderTime.Text = "+"..arg1
			workspace.Ekran.SurfaceGui.Frame.AdderTime.Visible = true

		elseif command == ":lockballs" then
			if not hasPermission(plr) then return end

			if arg1 == "true" then
				lbval.Value = true
				uie:FireAllClients("Balls", true)
			elseif arg1 == "false" then
				lbval.Value = false
				uie:FireAllClients("Balls", false)
			end

		elseif command == ":clearballs" then
			if not hasPermission(plr) then return end

			for _, p in pairs(game.Players:GetPlayers()) do
				local f = workspace.Balls:FindFirstChild(p.Name)
				if f then
					for _, b in pairs(f:GetChildren()) do
						b:Destroy()
					end
				end
			end
		end
	end)
end)

-- Pętla timera oparta na Heartbeat dla lepszej precyzji
local lastTick = tick()
RunService.Heartbeat:Connect(function()
	if not timerActive then 
		lastTick = tick()
		return 
	end

	if tick() - lastTick >= 1 then
		lastTick = tick()
		
		if currentTime < maxTime then
			currentTime += 1
		else
			currentTime = maxTime
			timerActive = false
			workspace.Ekran.SurfaceGui.Frame.AdderTime.Visible = false
			t:FireAllClients(currentTime, nil, "stop")
		end

		local txt = formatTime(currentTime)
		workspace.Ekran.SurfaceGui.Frame.Timer.Text = txt
		-- Nie aktualizujemy StarterGui co sekundę (to marnuje zasoby), 
		-- RemoteEvent 't' załatwia UI u graczy.
	end
end)
