state_list = {}

function create_state(name)
	local data
	data = {}
	
	if (name == nil) then
		return nil
	end
	
	data.name = name
	data.deferred = {}
	
	function data:enter()
	end
	
	function data:process()
	end
	
	function data:leave()
	end
	
	function data:create_overlay(name, x, y, width, height, url)
		if (self[name] ~= nil)
		then
			Log("create overlay failed : the name is already exist")
			return
		end
		self[name] = CreateOverlay(x, y, width, height, url)
	end
	
	function data:delete_overlay(name)
		if (self[name] == nil)
		then
			Log("delete overlay failed : invalid window name")
			return 
		end
		DeleteOverlay(self[name])
		self[name] = nil
	end

	function data:move_overlay(name, x, y, width, height, repaint)
	    if (self[name] == nil)
	    then
	        Log( "move overlay failed : invalid window name" )
	        return
	    end

		MoveOverlay(self[name], x, y, width, height, repaint)
	end
	
	function data:show_closebutton(name, x, y, width, height)
		if (self[name] == nil)
		then
			Log( "show_closebutton failed : invalid window name" )
			return
		end
	  
		ShowCloseButton(self[name], x, y, width, height)
	end
	
	function data:hide_closebutton(name)
		if (self[name] == nil)
			then
				Log( "hide_CloseButton failed : invalid window name" )
				return
			end
	  
		HideCloseButton(self[name])
	end
	
	function data:deferred_destroy(value)	
		for i, v in pairs(self)
		do
			if (type(self[i]) == "number")
			then 
				if (value == v)
				then
					self.deferred[#data.deferred] = i
					break
				end
			end
		end
	end
	
	function data:deferred_process()
		for i, v in pairs(self.deferred)
		do 
			delete_overlay(v)
		end
		self.deferred = nil
		self.deferred = {}
	end
	
	function data:change_url(name, url)
		if (self[name] == nil)
		then
			Log("change url failed : invalid window name")
			return
		end
		ChangeUrl(self[name], url)
	end
	
    data.timer = {}
	function data:create_timer(name, start_delay, elapse)
		if (self.timer[name] ~= nil)
		then
			Log("timer create failed : the name is already exist")
			return
		end
		self.timer[name] = {sd = start_delay, el = elapse, tk = GetTickCount() }
	end
	
	function data:check_timer(name)
		if (self.timer[name] == nil)
		then 
			Log("check timer failed : invalid timer")
			return false
		end
		local t = GetTickCount()
	
		-- start delay process
		if (self.timer[name].sd ~= 0)
		then
			if (t - self.timer[name].tk >= self.timer[name].sd)
			then
				local u = t - self.timer[name].tk - self.timer[name].sd
				
				self.timer[name].tk = t - u
				self.timer[name].sd = 0
			else
				return false
			end
		end
		-- elapse process
		if (t - self.timer[name].tk >= self.timer[name].el)
		then
			self.timer[name].tk = t
			return true
		end
		
		return false
	end
	
	function data:delete_timer(name)
		if (self.timer[name] == nil)
		then
			Log("delete timer failed : invalid timer")
			return
		end
		
		self.timer[name] = nil
	end
	
	state_list[data] = name
	
	return data
end

function set_state(state)
	if (state_list[state] == nil)
	then
		Log("set state failed : undefined state")
		return 0
	end
	
	cur_state:leave()
	cur_state = state
	cur_state:enter()
	
	return 1
end

function process()
	cur_state:deferred_process()
	cur_state:process()
end

function create_overlay(name, x, y, width, height, url)
    cur_state:create_overlay(name, x, y, width, height, url)
end

function delete_overlay(name)
    cur_state:delete_overlay(name)
end

function move_overlay(name, x, y, cx, cy, repaint)
    cur_state:move_overlay( name, x, y, cx, cy, repaint)
end

function show_closebutton(name, x, y, width, height)
    cur_state:show_closebutton(name, x, y, width, height)
end

function hide_closebutton(name)
    cur_state:hide_closebutton(name)
end

function deferred_destroy(value)
  cur_state:deferred_destroy(value)
 end
 
function create_timer(name, start_delay, elapse)
	cur_state:create_timer(name, start_delay, elapse)
end

function check_timer(name)
	return cur_state:check_timer(name)
end

function delete_timer(name)
	cur_state:delete_timer(name)
end

function change_url( name, url )
    cur_state:change_url( name, url )
end

----------------------------------------------------------------------
default_state = create_state( "default_state" )
cur_state  = default_state
