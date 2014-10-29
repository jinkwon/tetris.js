-- 테트리스 오버레이광고 --
-- 게임광고사업기획팀 --
-- Ver 1.00 2009.05.29 --
-- 리얼 빌드용 --

inroom = create_state("inroom")
buttprac = create_state("buttprac")
waitend = create_state("waitend")
buttstart = create_state("buttstart")
playend = create_state("playend")
buttsingle = create_state("buttsingle")
singleend = create_state("singleend")
leave = create_state("leave")


-------광고유닛_테트리스 빅오버레이광고 --
function inroom:enter()
	create_overlay("inroom_ad", 417, 100, 220, 448, "http://game.ad.hangame.com/adshow?unit=D0016B&svc=TETRIS")
	create_timer("inr_timer", 0, 10000)
	isDeleted = false
end

function inroom:process()
	if (check_timer( "inr_timer" ) == true )
	then
		if (isDeleted == false)
		then 
			delete_overlay("inroom_ad")
			isDeleted = true
		end			
	end
end

function inroom:leave()
	delete_timer("inr_timer")
	delete_overlay("inroom_ad")
end

-- 광고유닛_아이콘오버레이(멀티모드)--
function buttstart:enter()
	create_overlay("buttstart_ad", 662, 606, 90, 100, "http://game.ad.hangame.com/adshow?unit=D0016A&svc=TETRIS")
end

function buttstart:process()
end

function buttstart:leave()
	delete_overlay("buttstart_ad")
end

--------광고유닛_아이콘오버레이(싱글모드)--
function buttsingle:enter()
	create_overlay("single_ad", 648, 614, 90, 100, "http://game.ad.hangame.com/adshow?unit=D0016A&svc=TETRIS")
end

function buttsingle:process()
end

function buttsingle:leave()
	delete_overlay("single_ad")
end