/**
 * NetworkModule
 */
app.tetris.Network.init = (function(htOptions){
	//if($.cookie('SMSESSION')
	var htOptions = htOptions ? htOptions : {}
	  , oView
	  , oGameIo
	  , oChatIo
	  , sEmpNo = $.cookie('sEmpNo')
	  , sEmpNm = $.cookie('sEmpNm')
	  , sDeptNm = $.cookie('sDeptNm');
	
	var moveToLogin = function(){
		
		if(iOS){
			if(htOptions.fRunLogin){
				htOptions.fRunLogin();
			}
		} else {
			window.location.href = 'login.html';
		}
	};
	
    
	var initialize = function(){
		
		if(sEmpNo == '' || sEmpNo == null || sEmpNm == '' || sEmpNm == null){
			return moveToLogin();
		}
		
		initGameIo();
		initChatIo();
	}
	
	var initGameIo = function(){
		oGameIo = io.connect(app.tetris.htServer.sGame);
		
		
		oGameIo.on('connect', function(){
			
			var htReq = {
				sEmpNo : sEmpNo,
				sEmpNm : sEmpNm,
				sDeptNm : sDeptNm
			};
	
			oGameIo.emit('reqJoin', htReq);
		}).on('disconnect', function(){
			//alert('서버와의 접속이 끊어졌습니다.');
			//moveToLogin();
			oGameIo = io.connect(app.tetris.htServer.sGame);
			
		}).on('resJoin', function(htData){
			if(htData.sStatus === 'ok'){
				$('#ready_btn').show();
				
			}else if(htData.sStatus === 'exist'){
				sEmpNo = $.cookie('sEmpNo');
				sEmpNm = $.cookie('sEmpNm');
	  			sDeptNm = $.cookie('sDeptNm');
				
				oGameIo.emit('reqReJoin', htReq);
				
			}else if(htData.sStatus === 'game'){
				alert('이미 게임이 시작하였습니다.');
			}else{
				alert('서버와 접속이 원활하지 않습니다.');
				moveToLogin();
			}
			
		}).on('pushGameDone', function(htData){
			$('#ready_btn').show();
		}).on('resReady', function(htData){
			oView.resReady(htData);
		}).on('resCancel', function(htData){
			oView.resCancel(htData);
		}).on('pushStart', function(){
			oView.start(true);
		}).on('pushStop', function(){
			oView.stop(true);
		});
	}
	
	var initChatIo = function(){
		oChatIo = io.connect(app.tetris.htServer.sChat);
		
		oChatIo.on('connect', function(){
			oChatIo.emit('sendJoin', {
				sEmpNo : sEmpNo,
				sEmpNm : sEmpNm,
				sDeptNm : sDeptNm
			});
		});
	}

	var bindViewer = function(oViewer){
		oView = oViewer;
	};
	
	initialize();
	
	return {
		oGameIo : oGameIo, 
		oChatIo : oChatIo,
		bindViewer : bindViewer
	};
});


app.tetris.Network.oSessionIo = io.connect(app.tetris.config.sSessionUrl);

var oSessionIo = app.tetris.Network.oSessionIo;

oSessionIo.on('resConnectionCount', function(htRes){
    console.log(htRes);
    app.tetris.Network.Model.set('nConnectedUser', htRes.nConnectedUser);
});

oSessionIo.on('connect', function () {
    $.unblockUI();
    $('#selectable').empty();

    oSessionIo.emit('reqConnectionCount');
});