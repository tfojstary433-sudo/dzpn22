local PhysicsService = game:GetService("PhysicsService")
local HttpService = game:GetService("HttpService")

local BACKEND_URL = "https://88602c77-02c7-4b06-8b56-454baca5488c-00-38bejx2g3vlpx.picard.replit.dev"

local sm = game.ReplicatedStorage.Events.StartMatch
local em = game.ReplicatedStorage.Events.EndMatch
local t = game.ReplicatedStorage.Events.Time
local s = game.ReplicatedStorage.Events.Score
local uie = game.ReplicatedStorage.Events.SetFootballUI

local tms = require(game.ReplicatedStorage.Modules.Tms)

local mval = game.ReplicatedStorage.Values.Match
local lbval = game.ReplicatedStorage.Values.Lockballs

local adm = {
	"2115xDeathZ2115"
}

local currentTime = 0
local maxTime = 0
local baseTime = 0 
local timerActive = false

local Kits = require(game.ReplicatedStorage.Modules.Tms)

local function applyKit(model, shirtId, pantsId)
	local wear = model:FindFirstChild("UBRANIE WEAR")
	if not wear then return end

	local ch = wear:FindFirstChild("Coathanger")
	if not ch then return end

	local shirt = ch:FindFirstChildOfClass("Shirt")
	local pants = ch:FindFirstChildOfClass("Pants")

	if shirt then
		shirt.ShirtTemplate = shirtId
	end
	if pants then
		pants.PantsTemplate = pantsId
	end

	local display = ch:FindFirstChild("WYSTAWA")
	if display then
		local dShirt = display:FindFirstChildOfClass("Shirt")
		local dPants = display:FindFirstChildOfClass("Pants")

		if dShirt then
			dShirt.ShirtTemplate = shirtId
		end
		if dPants then
			dPants.PantsTemplate = pantsId
		end
	end
end



local function hasPermission(plr)
	if game.PrivateServerId ~= "" and plr.UserId == game.PrivateServerOwnerId then
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


local function formatTime(seconds)
	local m = math.floor(seconds / 60)
	local s = seconds % 60
	return string.format("%02d:%02d", m, s)
end

local function lastSunday(year, month)
	local t = os.time({
		year = year,
		month = month + 1,
		day = 0,
		hour = 0,
		min = 0,
		sec = 0
	})

	while os.date("!*t", t).wday ~= 1 do
		t -= 86400
	end

	return t
end

local function isDST_PL(utcTime)
	local y = os.date("!*t", utcTime).year

	local dstStart = lastSunday(y, 3) + 3600 * 2
	local dstEnd   = lastSunday(y, 10) + 3600 * 1

	return utcTime >= dstStart and utcTime < dstEnd
end

local function getPolishTime()
	local utc = os.time(os.date("!*t"))
	local offset = isDST_PL(utc) and 7200 or 3600
	return os.date("*t", utc + offset)
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

		------------------------------------------------
		-- SPAWN BALL
		------------------------------------------------

		if command == ":pb" then
			if lbval.Value and plr.Team.Name ~= "Sędziowie" then return end

			if plrfolder:FindFirstChild("Ball") then
				plrfolder.Ball:Destroy()
			end

			local ball = game.ServerStorage.Ball:Clone()
			ball.Parent = plrfolder
			ball.Position = plr.Character.HumanoidRootPart.Position

			------------------------------------------------
			-- START MATCH
			------------------------------------------------

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

			if homeData and awayData then
				for i = 1, 18 do
					local model = workspace.StrojeHome:FindFirstChild(tostring(i))
					if model then
						if i == 3 then
							applyKit(model, homeData.GkKit, homeData.GkShorts)
						else
							applyKit(model, homeData.HomeKit, homeData.HomeShorts)
						end
					end
				end

				for i = 1, 18 do
					local model = workspace.StrojeAway:FindFirstChild(tostring(i))
					if model then
						if i == 3 then
							applyKit(model, awayData.GkKit, awayData.GkShorts)
						else
							applyKit(model, awayData.AwayKit, awayData.AwayShorts)
						end
					end
				end
			end
			

			sm:FireAllClients(t1, t2, d1.h_pos, d2.a_pos, d1.image_id, d2.image_id)

			game.StarterGui.MatchUI.Enabled = true
			game.StarterGui.MatchUI.Frame.Team1_Name.Text = t1
			game.StarterGui.MatchUI.Frame.Team2_Name.Text = t2
			game.StarterGui.MatchUI.Frame.Team1_Score.Text = "0"
			game.StarterGui.MatchUI.Frame.Team2_Score.Text = "0"
			game.StarterGui.MatchUI.Frame.Timer.Text = "00:00"

			local screen = workspace.Ekran.SurfaceGui
			screen.Enabled = true
			screen.Frame.HomeName.Text = (d1.fullName or d1.fullname):upper()
			screen.Frame.AwayName.Text = (d2.fullName or d2.fullname):upper()
			screen.Frame.HomeScore.Text = "0"
			screen.Frame.AwayScore.Text = "0"
			screen.Frame.Timer.Text = "00:00"
			screen.Frame.HomeLogo.Image = homeData.Logo
			screen.Frame.AwayLogo.Image = awayData.Logo
			
			if plrfolder:FindFirstChild("Ball") then
				plrfolder.Ball:Destroy()
			end

			local ball = game.ServerStorage.Ball:Clone()
			ball.Parent = plrfolder
			ball.Position = Vector3.new(-5262.742, 518.6, 1372.633)

			uie:FireAllClients("Match", true)
			mval.Value = true

			local function sendStartMatch()
				local success, result = pcall(function()
					return HttpService:PostAsync(BACKEND_URL .. "/api/match/start", HttpService:JSONEncode({
						teamA = d1.fullName or d1.fullname or t1,
						teamB = d2.fullName or d2.fullname or t2
					}), Enum.HttpContentType.ApplicationJson)
				end)
				if success then 
					print("[SYNC] ✓ START: " .. (d1.fullName or d1.fullname or t1) .. " vs " .. (d2.fullName or d2.fullname or t2))
				else 
					print("[SYNC] ✗ Error: " .. tostring(result))
				end
			end
			sendStartMatch()

			------------------------------------------------
			-- END MATCH
			------------------------------------------------

		elseif command == ":endmatch" then
			if not hasPermission(plr) then return end

			em:FireAllClients()
			uie:FireAllClients("Match", false)

			game.StarterGui.MatchUI.Enabled = false

			local screen = workspace.Ekran.SurfaceGui
			screen.Enabled = false
			screen.Frame.HomeName.Text = ""
			screen.Frame.AwayName.Text = ""
			screen.Frame.HomeScore.Text = "0"
			screen.Frame.AwayScore.Text = "0"
			screen.Frame.Timer.Text = "00:00"
			game.StarterGui.MatchUI.Frame.Added.Position = UDim2.new(0.765, 0, 0.51, 0)
			game.StarterGui.MatchUI.Frame.Added.Visible = false

			mval.Value = false
			timerActive = false
			currentTime = 0

			local function sendEndMatch()
				local success, result = pcall(function()
					return HttpService:PostAsync(BACKEND_URL .. "/api/match/end", HttpService:JSONEncode({}), Enum.HttpContentType.ApplicationJson)
				end)
				if success then 
					print("[SYNC] ✓ END Match")
				end
			end
			sendEndMatch()

			------------------------------------------------
			-- SCORE
			------------------------------------------------

		elseif command == ":score" then
			if not (arg1 and arg2) then return end

			game.StarterGui.MatchUI.Frame.Team1_Score.Text = arg1
			game.StarterGui.MatchUI.Frame.Team2_Score.Text = arg2

			workspace.Ekran.SurfaceGui.Frame.HomeScore.Text = arg1
			workspace.Ekran.SurfaceGui.Frame.AwayScore.Text = arg2

			s:FireAllClients(arg1, arg2)

			local function sendScore()
				local success, result = pcall(function()
					return HttpService:PostAsync(BACKEND_URL .. "/api/match/update", HttpService:JSONEncode({
						teamAScore = tonumber(arg1) or 0,
						teamBScore = tonumber(arg2) or 0
					}), Enum.HttpContentType.ApplicationJson)
				end)
				if success then
					print("[SYNC] ✓ SCORE: " .. arg1 .. " - " .. arg2)
				end
			end
			sendScore()

			------------------------------------------------
			-- HOME GOAL (gol dla gospodarzy)
			------------------------------------------------

		elseif command == ":home" or command == "home" then
			if not hasPermission(plr) then return end
			
			-- Parsuj wynik z argumentów (np. "home 1:0" lub ":home 1 0")
			local newScoreA, newScoreB
			if arg1 and arg1:find(":") then
				-- Format "1:0"
				local parts = string.split(arg1, ":")
				newScoreA = tonumber(parts[1]) or 0
				newScoreB = tonumber(parts[2]) or 0
			elseif arg1 and arg2 then
				-- Format "1 0"
				newScoreA = tonumber(arg1) or 0
				newScoreB = tonumber(arg2) or 0
			else
				-- Bez argumentów - dodaj 1 gol dla home
				local currentA = tonumber(game.StarterGui.MatchUI.Frame.Team1_Score.Text) or 0
				local currentB = tonumber(game.StarterGui.MatchUI.Frame.Team2_Score.Text) or 0
				newScoreA = currentA + 1
				newScoreB = currentB
			end

			game.StarterGui.MatchUI.Frame.Team1_Score.Text = tostring(newScoreA)
			game.StarterGui.MatchUI.Frame.Team2_Score.Text = tostring(newScoreB)

			workspace.Ekran.SurfaceGui.Frame.HomeScore.Text = tostring(newScoreA)
			workspace.Ekran.SurfaceGui.Frame.AwayScore.Text = tostring(newScoreB)

			s:FireAllClients(tostring(newScoreA), tostring(newScoreB))

			local function sendHomeGoal()
				local success, result = pcall(function()
					return HttpService:PostAsync(BACKEND_URL .. "/api/match/update", HttpService:JSONEncode({
						teamAScore = newScoreA,
						teamBScore = newScoreB,
						event = {
							type = "goal",
							team = "home",
							player = plr.Name,
							minute = math.floor(currentTime / 60)
						}
					}), Enum.HttpContentType.ApplicationJson)
				end)
				if success then
					print("[SYNC] ✓ HOME GOAL: " .. newScoreA .. " - " .. newScoreB)
				end
			end
			sendHomeGoal()

			------------------------------------------------
			-- AWAY GOAL (gol dla gości)
			------------------------------------------------

		elseif command == ":away" or command == "away" then
			if not hasPermission(plr) then return end
			
			-- Parsuj wynik z argumentów (np. "away 0:1" lub ":away 0 1")
			local newScoreA, newScoreB
			if arg1 and arg1:find(":") then
				-- Format "0:1"
				local parts = string.split(arg1, ":")
				newScoreA = tonumber(parts[1]) or 0
				newScoreB = tonumber(parts[2]) or 0
			elseif arg1 and arg2 then
				-- Format "0 1"
				newScoreA = tonumber(arg1) or 0
				newScoreB = tonumber(arg2) or 0
			else
				-- Bez argumentów - dodaj 1 gol dla away
				local currentA = tonumber(game.StarterGui.MatchUI.Frame.Team1_Score.Text) or 0
				local currentB = tonumber(game.StarterGui.MatchUI.Frame.Team2_Score.Text) or 0
				newScoreA = currentA
				newScoreB = currentB + 1
			end

			game.StarterGui.MatchUI.Frame.Team1_Score.Text = tostring(newScoreA)
			game.StarterGui.MatchUI.Frame.Team2_Score.Text = tostring(newScoreB)

			workspace.Ekran.SurfaceGui.Frame.HomeScore.Text = tostring(newScoreA)
			workspace.Ekran.SurfaceGui.Frame.AwayScore.Text = tostring(newScoreB)

			s:FireAllClients(tostring(newScoreA), tostring(newScoreB))

			local function sendAwayGoal()
				local success, result = pcall(function()
					return HttpService:PostAsync(BACKEND_URL .. "/api/match/update", HttpService:JSONEncode({
						teamAScore = newScoreA,
						teamBScore = newScoreB,
						event = {
							type = "goal",
							team = "away",
							player = plr.Name,
							minute = math.floor(currentTime / 60)
						}
					}), Enum.HttpContentType.ApplicationJson)
				end)
				if success then
					print("[SYNC] ✓ AWAY GOAL: " .. newScoreA .. " - " .. newScoreB)
				end
			end
			sendAwayGoal()

			------------------------------------------------
			-- TIME
			------------------------------------------------

		elseif command == ":time" then
			if not hasPermission(plr) then return end
			if not tonumber(arg1) then return end

			currentTime = 0
			baseTime = tonumber(arg1) * 60
			maxTime = baseTime
			timerActive = true

			local txt = formatTime(currentTime)
			t:FireAllClients(currentTime)
			workspace.Ekran.SurfaceGui.Frame.Timer.Text = txt
			game.StarterGui.MatchUI.Frame.Timer.Text = txt

			local function sendTime()
				local period = currentTime < 2700 and "Pierwsza połowa" or "Druga połowa"
				local success, result = pcall(function()
					return HttpService:PostAsync(BACKEND_URL .. "/api/match/update", HttpService:JSONEncode({
						timer = formatTime(currentTime),
						period = period
					}), Enum.HttpContentType.ApplicationJson)
				end)
			end
			sendTime()
			
			------------------------------------------------
			-- ADDTIME
			------------------------------------------------
			
		elseif command == ":addtime" then
			if not hasPermission(plr) then return end
			if not tonumber(arg1) then return end
			if not timerActive then return end

			maxTime += tonumber(arg1) * 60
			t:FireAllClients(currentTime, arg1)
			game.StarterGui.MatchUI.Frame.Added.Position = UDim2.new(0.82, 0, 0.51, 0)
			game.StarterGui.MatchUI.Frame.Added.TextLabel.Text = "+"..arg1
			game.StarterGui.MatchUI.Frame.Added.Visible = true
			game.Workspace.Ekran.SurfaceGui.Frame.AdderTime.Text = "+"..arg1
			game.Workspace.Ekran.SurfaceGui.Frame.AdderTime.Visible = true
			
			------------------------------------------------
			-- LOCK BALLS
			------------------------------------------------

		elseif command == ":lockballs" then
			if not hasPermission(plr) then return end

			if arg1 == "true" then
				lbval.Value = true
				uie:FireAllClients("Balls", true)
			elseif arg1 == "false" then
				lbval.Value = false
				uie:FireAllClients("Balls", false)
			end

			------------------------------------------------
			-- CLEAR BALLS
			------------------------------------------------

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


task.spawn(function()
	while true do
		task.wait(1)

		if timerActive then
			currentTime += 1

			local txt
			if currentTime <= baseTime then
				txt = formatTime(currentTime)
			else
				local added = math.floor((currentTime - baseTime) / 60)
				txt = formatTime(baseTime) .. " +" .. added
			end

			workspace.Ekran.SurfaceGui.Frame.Timer.Text = txt
			game.StarterGui.MatchUI.Frame.Timer.Text = txt

			if currentTime >= maxTime then
				timerActive = false
			end

			local function sendTimeUpdate()
				local period = currentTime < 2700 and "Pierwsza połowa" or "Druga połowa"
				local success, result = pcall(function()
					return HttpService:PostAsync(BACKEND_URL .. "/api/match/update", HttpService:JSONEncode({
						timer = formatTime(currentTime),
						period = period
					}), Enum.HttpContentType.ApplicationJson)
				end)
			end
			sendTimeUpdate()
		end
	end
end)
