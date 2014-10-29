/**
 * 테트리스 메인 클래스
 * Model : app.tetris.gamemodel.js
 * View : app.tetris.gameview.js
 * @author JK Lee
 */
app.tetris.Game.init = (function(htOptions){
	htOptions = htOptions ? htOptions : {};
	return;

	var oNetwork
	  , oModel
	  , oGameView
	  , oUIView
	  , sEmpNo = ''
	  , sEmpNm = ''
	  , sDeptNm = '';
	  	
  	var welMain = $('#main')
      , welLogin = $('#login')
      , welGame = $('#game')
      , welGameboard = $('#gameboard')
      , welAbout = $('#about');
      
	
	var replaceElement = function(){
		$('#welcome_str').html('환영합니다');
	};

    var iOS = false;
    
	var initialize = function(){
	
		var sTargetId = htOptions.sTargetId;
		
		if (iOS) {
			$(document).on('resize', function(){
			resizeGameArea();	
			});
		}
		
		replaceElement();
	
		// app.tetris.network
		oNetwork = app.tetris.Network.init();
		
		// app.tetris.gamemodel.js
		
//		oGameView = new app.tetris.Game.View({
//			el : $('#' + sTargetId), 
//			model : new app.tetris.Game.Model(),
//			bEventBind : true,
//			bUseWebGL : htOptions.bUseWebGL, 
//			oWebGLView : new app.tetris.Game.WebGLView()
////			oGameIo : oNetwork.oGameIo,
////			oChatIo : oNetwork.oChatIo
//		});
//		
        
		// app.tetris.ui.view.js
        
        /*
		oUIView = new app.tetris.UIView({
			el : $('#'+sTargetId), 
			model : oModel, 
			oGameView : oGameView
		});
		
		oNetwork.bindViewer(oGameView);
		*/
//		setInterfaceEvents();
        
        if(_.where(listeners, {sEvent : 'ready'}).length){
            _.where(listeners, {sEvent : 'ready'})[0].fn({
                oGameView : oGameView
            });
        }
	};
	
	
	
    var resetCookie = function(){
    	$.cookie('sEmpNo', null);
		$.cookie('sEmpNm', null);
		$.cookie('sDeptNm', null);
    };
  
	var setLogin = function(){
		
		if ($('#_name').val() === '' || $('#_name').val() === null) {
			alert('이름을 입력하여주세요');
			$('#_name').focus();
			return;
		}

		if ($('#_id').val() === '' || $('#_id').val() === null) {
			alert('아이디를 입력하여주세요');
			$('<div id="_id"></div>').focus();
			return;
		}

		$.cookie('sEmpNo', $('#_id').val());
		$.cookie('sEmpNm', $('#_name').val());
		$.cookie('sDeptNm', 'DEV TEAM');		
		
		$('#welcome_str').html($.cookie('sEmpNm') + '님 환영합니다'); 
	};
	      
	var resizeGameArea = function(){
  		var height = (window.innerHeight - 120);
		$('#game_area').css('height', height + 'px');
		$('#game_area').css('width', height / 2 + 'px');
  	};
	
	var setInterfaceEvents = function(){
		
		if($.cookie('sEmpNo') !== '' && $.cookie('sEmpNo') !== null){
		}
	    
	    
	    $('input:text').on('click', function(e){
			$(this).focus();
			e.stopPropagation();
		});
      	

	    $(".header-button.menu").on("mousedown touchstart",st.toggle_nav);
	    
	    $('.info').click(function() {
	      
	    });
	    
	    $('.main').click(function() {
	    	
	    });
	    
	    $('.stp-nav a').click(function(){
	    	
	    });
	    
	    $('.stp-nav .gameboard').click(function(){
	    	
	    });
	    
	    $('.stp-nav .single_game').click(function() {
			oGameView.start();
			
			$('.game_title').html('Single Game');
			return st.show_section(welGame, {
				animation: 'infromright'
			});
	    });
	    
	    $('.stp-nav .online_game').click(function() {
			oGameView.reqReady();
			
			$('.game_title').html('Online Game');
			return st.show_section(welGame, {
				animation: 'infromright'
			});
	    });
	    
	   $('.container .gameboard').click(function(){
	   
	    	st.show_section(welGameboard, {
				animation: 'infromleft'
			});
	    });
	    
		$('#main .start_btn').click(function() {
			oGameView.start();
			
			$('.game_title').html('Single Game');
			return st.show_section(welGame, {
				animation: 'infromright'
			});
	    });
	    
	    $('.ready_btn').click(function() {
			oGameView.reqReady();
			
			$('.game_title').html('Online Game');
			return st.show_section(welGame, {
				animation: 'infromright'
			});
	    });
	    
	    $('#about  a.cancel').click(function() {
		   if($.cookie('sEmpNo') !== '' && $.cookie('sEmpNo') !== null){
				st.show_section(welMain, {
		       		animation: 'upfrombottom'
		     	});
		     } else {
		     	st.show_section(welLogin, {
		       		animation: 'upfrombottom'
				});
		     }
	     
	    });
	    $('#game a.cancel').click(function() {
	    	oGameView.stop();
	      return st.show_section(welMain, {
	        animation: 'infromright'
	      });
	    });
	    
	    $('header .logout').click(function(){
	    	resetCookie();
			
//	    	return st.show_section(welLogin, {
//	        animation: 'infromleft'
//	      });
	    });
			
		$('#_login').on('click', function(){
			
//			setLogin();
			
			st.show_section(welMain, {
	        	animation: 'infromleft'
			});
		});
	};

//    app.tetris.TemplateManager.get('stage/stage.mobile', {}, function(sTemplate){
//        $('#' + htOptions.sTargetId).html(sTemplate);
//        initialize();
//    });
	
	var listeners = [];
    
	return {
        
        on : function(sEvent, fn){
            listeners.push({sEvent : sEvent, fn : fn});
        }
	};
});