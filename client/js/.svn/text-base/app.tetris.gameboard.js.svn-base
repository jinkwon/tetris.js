/**
 * Gameboard 메인 클래스
 */
app.tetris.gameboard = (function(htOptions){
	var htOptions = htOptions ? htOptions : {}
	  , oView = new app.tetris.GameView({el : $('#stage'), bEventBind : false})
	  , oMonitorIo = io.connect(app.tetris.htServer.sMonitor)
	  , nGamePeopleCount = 0
	  , aSelectedGamePeople = []
	  , sEmpNo = $.cookie('sEmpNo')
	  , sEmpNm = $.cookie('sEmpNm')
	  , sDeptNm = $.cookie('sDeptNm');
	
	//var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/i) ? true : false );
	
	/**
	 * 로그인 화면으로 이동 시킨다 
	 */
	var moveToLogin = function(){
		
		if(iOS){
			if(htOptions.fRunLogin){
				htOptions.fRunLogin();
			}
		} else {
			window.location.href = 'login.html';
		}
	}
	
	/** 
	 * 선택한 사용자의 정보를 가져온다 
	 */
	var selectGamePeople = function(){
		aSelectedGamePeople = [];
		$('#_watch').empty();
		$('#_gamePeople .ui-selected').each(function(){
			var sEmpNo = $(this).attr('id').replace('_gp_', ''),
				sNameAndScore = $(this).text();
			aSelectedGamePeople.push(sEmpNo);
			var aHtml = [];
			aHtml.push('<li class="other_user">');
			aHtml.push('<canvas id="_watch_'+sEmpNo+'" width="100" height="210" class="other_user_canvas"></canvas>');
			aHtml.push('<div id="_info_'+sEmpNo+'" class="info">'+sNameAndScore+'</div>');
			aHtml.push('</li>');
			
			$('#_watch').append(aHtml.join(''));
			oView.drawBoardStage('_watch_'+sEmpNo, []);
		});
		oMonitorIo.emit('sendSelectedGamePeople', aSelectedGamePeople);
	};
	
	/**
	 * 게임보드 초기화 메서드 
	 */
	var initalize = function(){
		
		if(sEmpNo === '' || sEmpNo === null){
			moveToLogin();
		}
		
		$( "#selectable" ).selectable();	
		$.blockUI({timeout: 5000});
		
		oMonitorIo.on('connect', function(){
			$.unblockUI();
			$('#selectable').empty();
			
			oMonitorIo.emit('reqAdmin', sEmpNo);
		});
		
		oMonitorIo.on('resAdmin', function(sStatus){
			
			if(sStatus === 'ok'){
				$('#_start').show();
			}else if(sStatus === 'game'){
				$('#_stop').show();
			}
		});
		
		oMonitorIo.on('pushPeopleInfo', function (htData) {
			
			var aConnectedPeople = htData.aConnectedPeople || []
			  , aGamePeople = htData.aGamePeople || []
			  , nConnectedPeopleCount = aConnectedPeople.length || 0
			 
			nGamePeopleCount = aGamePeople.length || 0;
			  
			this.bRealGame = htData.bRealGame;
			
			$('#_currentConnectedPeople').text(nConnectedPeopleCount);
			$('#_currentGamePeople').text(nGamePeopleCount);
			
			var aHtml = [];
			for(var i=0; i<nConnectedPeopleCount; i++){
				aHtml.push('<li id="_cp_' + aConnectedPeople[i]['sEmpNo'] + '">' + aConnectedPeople[i]['sEmpNm'] + '</li>');	
			}
			
			$('#_connectedPeople').html(aHtml.join(''));
			
			var aHtml = [];
			for(var i=0; i<nGamePeopleCount; i++){
				if(this.bRealGame){
					if(aGamePeople[i]['nScore'] === undefined){
						nScore = 0;
					} else{
						nScore = aGamePeople[i]['nScore'];
					}
										 
					aHtml.push('<li id="_gp_' + aGamePeople[i]['sEmpNo'] + '">' + aGamePeople[i]['sEmpNm'] + ' - ' + nScore + '점</li>');
				}else{
					aHtml.push('<li id="_gp_' + aGamePeople[i]['sEmpNo'] + '">' + aGamePeople[i]['sEmpNm'] + '</li>');	
				}
			}
			
			$('#_gamePeople')
				.html(aHtml.join(''))
				.selectable({
					selected : function(event, ui){
						
						selectGamePeople();
						
					},
					stop : function(event, ui){
						selectGamePeople();
					}
				});
		});
		
		oMonitorIo.on('pushGameInfo', function (htData) {
			oView.drawBoardStage('_watch_' + htData.sEmpNo, htData.aMatrix);
			$('#_info_'+htData.sEmpNo).text(htData.sEmpNm + ' - ' + htData.nScore + '점');
		});
		
		$('#_join').show();	
		
		$('#_start').on('click', function(){
			
			if(nGamePeopleCount === 0){
				alert('There is no ready people for gaming.\nTell people to be ready.');
				return;
			}
			if(confirm('Do you really want to start the game?')){
				$(this).hide();
				$('#_stop').show();
				oMonitorIo.emit('sendStart');	
				this.bRealGame = true;				
			}
		});
		
		$('#_stop').on('click', function(){
			$(this).hide();
			$('#_start').show();
			oMonitorIo.emit('sendStop');
		});
		
	};
	
	initalize();		
});
