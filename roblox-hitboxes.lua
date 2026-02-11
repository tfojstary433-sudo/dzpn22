local HitboxPresets = {

	Shoot = {
		Offset = CFrame.new(0, -2, 0),
		Size = Vector3.new(5, 4, 5)
	},

	Pass = {
		Offset = CFrame.new(0, -1.5, -0.5),
		Size = Vector3.new(4, 4, 4)
	},

	Tackle = {
		Offset = CFrame.new(0, -2.5, -2),
		Size = Vector3.new(3, 2, 4)
	},

	Header = {
		Offset = CFrame.new(0, 1, 0),
		Size = Vector3.new(4, 4, 4)
	},

	Header2 = {
		Offset = CFrame.new(0, 2, 0),
		Size = Vector3.new(5, 4, 5)
	},

	GK = {
		Offset = CFrame.new(0, 0, 0),
		Size = Vector3.new(6, 6, 6)
	},

	CatchBall = {
		Offset = CFrame.new(0, -1.5, -0.5),
		Size = Vector3.new(4, 4, 4)
	},

	Collider = {
		Offset = CFrame.new(0, 0, 0),
		Size = Vector3.new(4, 6, 4)
	}

}

return HitboxPresets
