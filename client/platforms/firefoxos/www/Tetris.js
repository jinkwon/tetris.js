/*! Tetris - v0.1.0 - 2014-05-17
* https://github.com/Jinkwon/tetris.js
* Copyright (c) 2014 LeeJinKwon; Licensed MIT */
var app = app ? app : {};

/**
 * @namespace
 */
app.tetris = app.tetris ? app.tetris : {};

/**
 * @namespace
 */
app.tetris.Game = {};

/**
 * @namespace
 */
app.tetris.Board = {};

/**
 * @namespace
 */
app.tetris.Menu = {};

/**
 * @namespace
 */
app.tetris.Rules = {};

/**
 * @namespace
 */
app.tetris.Util = {};
/**
 * @namespace
 */
app.tetris.Account = {};

/**
 * @namespace
 */
app.tetris.ui = {};

/**
 * @namespace
 */
app.tetris.ui.Footer = {};

/**
 * @namespace
 */
app.tetris.ui.Header = {};

/**
 * @namespace
 */
app.tetris.ui.Option = {};

/**
 * @namespace
 */
app.tetris.Network = {};

/**
 * @namespace
 */
app.tetris.Credit = {};

/**
 * @namespace
 */
app.tetris.Webgl = {};


app.tetris.config = {
	sMode : "development", // production, staging, developement
    sHost :""
};

app.tetris.config.setEnv = function(sMode) {
    app.tetris.config.sMode = sMode;
    app.tetris.config._refresh();
};

app.tetris.config._refresh = function(){

    var sSrvUrl = '';

    switch(app.tetris.config.sMode){
        case 'production' :
            sSrvUrl = 'http://serverurl';
            break;
        case 'staging' :
            sSrvUrl = 'http://localhost:8888';
            break;
        default :
            sSrvUrl = 'http://' + document.location.hostname + ':8888';
            break;
    }

    app.tetris.config.sHost = sSrvUrl;
    app.tetris.config.sAccountUrl = sSrvUrl + '/account';
    app.tetris.config.sSessionUrl = sSrvUrl + '/session';
    app.tetris.config.sMonitorUrl = sSrvUrl + '/monitor';
    app.tetris.config.sGameUrl = sSrvUrl + '/game';
    app.tetris.config.sChatUrl = sSrvUrl + '/chat';
};

app.tetris.TemplateManager = {
    templates : {},

    get : function(id, htVars){
        var template = this.templates[id];

        if (template) {

            var result = _.template(template, htVars);
            return(result);

        } else {

            template = $.ajax({
                url : "./views/" + id + ".html",
                async : false
            }).responseText;

            this.templates[id] = template;
            var result = _.template(template, htVars);
            return(result);
        }
    }

};

app.mobile = {};


function meta(name, content) {
   document.write('<meta name="' + name + '" content="' + content + '">');
}

app.mobile.metaInit = function(){
	// Cache Control
	meta("expires", "-1");
	meta("Cache-Control", "No-Cache");
	meta("Pragma", "No-Cache");
	
	meta("viewport", "initial-scale=1.0, width=device-width, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no");
	meta("format-detection", "address=no,telephone=no");
	
	meta("apple-mobile-web-app-capable", "yes");
	meta("apple-mobile-web-app-status-bar-style", "white");
	
	meta('apple-touch-fullscreen', 'yes');

};
app.tetris.Network.init = (function(htOptions){
	//if($.cookie('SMSESSION')
	var htOptions = htOptions ? htOptions : {}
	  , oView
	  , oGameIo
	  , oChatIo
	  , sEmpNo = ''
	  , sEmpNm = ''
	  , sDeptNm = '';
	
    iOS = false;
    
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
		initGameIo();
		initChatIo();
	}
	
	var initGameIo = function(){
		oGameIo = io.connect(app.tetris.config.sGameUrl);
		
		
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
			oGameIo = io.connect(app.tetris.config.sGameUrl);
			
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
		oChatIo = io.connect(app.tetris.sChatUrl);
		
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


app.tetris.Network.startSession = function() {
    app.tetris.Network.oSessionIo = io.connect(app.tetris.config.sSessionUrl);

    var oSessionIo = app.tetris.Network.oSessionIo;

    oSessionIo.on('resConnectionCount', function (htRes) {

        app.tetris.Network.Model.set({
            'nConnectedUser': htRes.nConnectedUser,
            'nRegisterUser': htRes.nRegisterUser
        });
    });

    oSessionIo.on('connect', function () {
        $('#selectable').empty();
        oSessionIo.emit('reqConnectionCount');
    });
};


(function(){

    var networkModelSingleTon = Backbone.Model.extend({
       
        defaults : {
            nConnectedUser : 0,
            nRegisterUser : 0
        },
        
        initialize : function(){
            
        }
    });
    
    app.tetris.Network.Model = new networkModelSingleTon();
})();
app.tetris.Util.leadingSpaces = function(n, digits) {
	var space = '';
	n = n.toString();
	if (n.length < digits) {
		for (var i = 0; i < digits - n.length; i++)
		  space += '0';
	}
	return space + n;
};


app.tetris.Util.makeGuid = function(){
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    	return v.toString(16);
	});
};


// requestAnimationFrame Polyfill
(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
            window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());



var WebGLUtil = {};

WebGLUtil.createShader = function( gl, src, type ) {
	var shader = gl.createShader( type );

	gl.shaderSource(shader, src);
	gl.compileShader(shader);

	if( !gl.getShaderParameter(shader, gl.COMPILE_STATUS) ){
		var error = gl.getShaderInfoLog( shader );
		// Remove trailing linefeed, for FireFox's benefit.
		while( (error.length > 1) && (error.charCodeAt(error.length-1) < 32) ){
			error = error.substring(0, error.length-1);
		}
		alert(error);

		return null;
	}

	return shader;
};

WebGLUtil.loadImage = function(gl, glTexture, sImageUrl){
	var htImage = {};
	
	glTexture.bIsLoaded = false;
	
	htImage.img = new Image();
	htImage.img.src = sImageUrl;
		
	htImage.img.onload = function() {		
		gl.bindTexture(gl.TEXTURE_2D, glTexture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, htImage.img);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);

		glTexture.bIsLoaded = true;
	};
	
	htImage.img.onerror = function() {
		alert("error load texture");
	};
};

WebGLUtil.loadShader = function(url){
	var source = null;

	$.ajax({
	    async: false,
	    url: url,
	    success: function (data) {
	        source = data;
	    },
		dataType: 'text'
	});
		
	return source;
};
	

app.tetris.ui.BackButton = {

    setEvents : function(){
        $(document).on('click', '._close', $.proxy(function (we) {
            this._clearAnimationClass($(we.currentTarget));

            $(we.currentTarget)
                .addClass('bounceIn').show();

            window.history.back();
        }, this));
    },

    show : function(){
        var welClose = $('#_container').find('._close');
        this._clearAnimationClass(welClose);
        welClose.show().addClass('rotateIn');
    },

    hide : function(){
        var welClose = $('#_container').find('._close');

        if(welClose.css('display') !== 'none'){
            this._clearAnimationClass(welClose);

            welClose
                .show()
                .addClass('bounceOut')
                .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                    welClose.hide();
                });

        } else {
            this._clearAnimationClass(welClose);
            welClose.hide();
        }
    },

    _clearAnimationClass: function (welClose) {
        welClose
            .removeClass('bounceIn')
            .removeClass('rotateIn');
    }
};

(function(){

    var FooterView = Backbone.View.extend({
        el : '#_container #_footer',
        template : 'ui/footer',
    
        events : {
            "click ._menu_item" : "onClickMenu"
        },
    
        initialize : function(){
            this.render();
        },
    
        onClickMenu : function(we){
    
            return false;
        },
    
        show : function(){
            this.$el.show();
        },
        
        hide : function(){
            this.$el.hide();
        },
        
        render : function(){

            var template = app.tetris.TemplateManager.get(this.template, {});
            this.$el.html(template);

            return this;
        }
    });

    app.tetris.ui.Footer.View = new FooterView();
})();

(function(){
    
var DEFAULT_STR = 'HEADER';
    
var HeaderView = Backbone.View.extend({
    el : '#_container #_header',
    template : 'ui/header',

    events : {
        "click ._menu_item" : "onClickMenu"
    },


    initialize : function(){
        
        this.sTitle = DEFAULT_STR;
        this.setEvents();
        this.render();
    },
    
    setEvents: function () {
        this.model.bind('change', $.proxy(this.render, this));
    },

    onClickMenu : function(we){
        return false;
    },

    show : function(){
        this.render();
        this.$el.addClass('animated').addClass('fadeInUp').show();

        return this;
    },

    hide : function(){
        this.$el.hide();
        this.sTitle = DEFAULT_STR;
    },
    
    changeTitle : function(sTitle){
    
        this.sTitle = sTitle;
        
        return this;
    },
    
    render : function(){
        var htVars = {
            sTitle : this.sTitle,
            nConnectedUser : this.model.get('nConnectedUser')
        };
//        this.$el.addClass('animated').removeClass('pulse');

        var template = app.tetris.TemplateManager.get(this.template, htVars);
        this.$el.html(template);
//            this.$el.addClass('animated').hide().addClass('pulse').show();

        return this;
    }
});

    app.tetris.ui.Header.View = new HeaderView({model  : app.tetris.Network.Model});
})();
app.tetris.ui.Option.View = Backbone.View.extend({
    el : '#_container #_option',
    template : 'ui/option',

    events : {

        "click ._menu_item" : "onClickMenu"
    },

    initialize : function(){
        this.render();
    },

    onClickMenu : function(we){
        return false;
    },

    render : function(){
        var template = app.tetris.TemplateManager.get(this.template, {});
        this.$el.html(template).show();

        return this;
    }
});
(function(){
    var AccountInfo = function(){
        this.userId ='';
        this.passwd = '';
        this.bAvail = false;
    };
    
    AccountInfo.prototype = {
        _listeners : [],
    
        setAccount : function(sUserId, sPasswd){
            this.userId = sUserId;
            this.passwd = sPasswd;
        },
    
        getAccount : function(){
            return {
                userId : this.userId,
                passwd : this.passwd
            }
        },
    
        on : function(sEvent, fn){
            this.listeners = _.filter(this.listeners, function(item){ return item.sEvent !== sEvent});
            this.listeners.push({ fn : fn, sEvent : sEvent});
            return this;
        },
    
        save : function(){
            if(this.userId === '' || this.passwd === ''){
                return;
            }
    
            window.localStorage.setItem('account', JSON.stringify({
                userId : this.userId,
                passwd : this.passwd
            }));
        },
    
        load : function(){
            var sAccount = window.localStorage.getItem('account');
            var htAccount = JSON.parse(sAccount) || { userId : '', passwd : ''};
    
            this.userId = htAccount.userId;
            this.passwd = htAccount.passwd;
        },
    
        clear : function(){
            window.localStorage.removeItem('account');
            this.userId = '';
            this.passwd = '';
            this.bAvail = false;
        },
    
        broadcast : function(sEvent){
            _.each(this.listeners, function(evt){
                if(evt.sEvent === sEvent){
                    evt.fn();
                }
            });
            return this;
        },
    
        isAuthenticated : function(){
            return this.bAvail;
        }
    };
    
    app.tetris.Account.Info = new AccountInfo();

})();

app.tetris.Account.Network = {};



app.tetris.Account.Network.connect = function(cb){
    if(!app.tetris.Account.Network.io){
        app.tetris.Account.Network.io = io.connect(app.tetris.config.sAccountUrl);

        app.tetris.Account.Network.io
            .on('connection', function(){
                if(cb){
                    cb();
                }
            })
            .on('error', function(){
                alert('Cannot connect to Server');
            })
            .on('reconnect_failed', function(){
                console.log('reconnect_failed');
            })
            .on('connect_failed', function (err) {
                console.log(err);
            })
            .on('resLogin', function(htData){
                
                app.tetris.Account.Info.bAvail = htData.bAvail;
                if(app.tetris.Account.Info.bAvail){
                    app.tetris.Account.Info.broadcast('onSuccessLogin');
                } else {
                    app.tetris.Account.Info.broadcast('onFailLogin');
                }
            })
            .on('resJoin', function(htData){

                if(htData.bAvail === false){
                    alert(htData.sMessage);
                    return;
                }

                app.tetris.Account.Info.on('onSuccessLogin', function () {
                    app.tetris.Account.Info.save();
                    app.tetris.Menu.View.render();
                    app.tetris.Router.navigate('menu', {trigger: true});
                });

                app.tetris.Account.Network.io.emit('reqLogin', app.tetris.Account.Info.getAccount());
            });
        
//setInterval(function(){
//        app.tetris.Account.Network.io.emit('reqLogin', app.tetris.Account.Info.getAccount());
//}, 1000);
    }
    
    if (app.tetris.Account.Network.io.socket.connected === false && app.tetris.Account.Network.io.socket.connecting === false) {
        app.tetris.Account.Network.io.socket.connect();
    } else {
        
        
        if(cb){
            cb();
        }
    }
    
    
};
(function(){

    var AccountView = Backbone.View.extend({
        el : '#_container #_start_view',
        template : 'start',

        events : {
            "click ._splash_section" : "_onClickSplash",
            "click ._join_btn" : "_onClickJoin",
            "click ._login_btn" :"_onClickLogin"
        },

        initialize : function(){
            this.render();
        },

        assignElements: function () {
            this.welPw = this.$el.find('._pw');
            this.welPwRe = this.$el.find('._pw_re');
            this.welId = this.$el.find('._id');
        },

        _checkLoginValidation : function(){
            if(this.welId.val().trim() === ''){
                alert('Please insert Id');
                this.welId.focus();
                return false;
            }

            if(this.welPw.val().trim() === ''){
                alert('Please insert Password');
                this.welPw.focus();
                return false;
            }

            return true;
        },

        _checkJoinValidation : function(){
            if(!this._checkLoginValidation()){
                return false;
            }
            
            if(this.welPw.val() !== this.welPwRe.val()){
                alert('Not same password');
                return false;
            }
            
            return true;
        },
        
        _onClickLogin : function(){
            if(!this._checkLoginValidation()){
                return;
            }
            
            app.tetris.Account.Network.connect($.proxy(function(){
                this._updateAccount();
                this._setAccountEvents();
                app.tetris.Account.Network.io.emit('reqLogin', app.tetris.Account.Info.getAccount());    
            }, this));
        },

        _onClickJoin : function(){

            if(this.welPwRe.css('display') === 'none'){
                this.welPwRe.show().css('height', 0).animate({height : this.welPw.outerHeight() + 'px'}, 250, 'easeOutBounce');
                return;
            }

            if(!this._checkJoinValidation()){
                return;
            }

            app.tetris.Account.Network.connect($.proxy(function(){

                this._updateAccount();
                this._setAccountEvents();
                app.tetris.Account.Network.io.emit('reqJoin', app.tetris.Account.Info.getAccount());
            }, this));
        },

        _updateAccount : function(){
            var sUserId = this.$el.find('._id').val();
            var sPasswd = this.$el.find('._pw').val();
            app.tetris.Account.Info.setAccount(sUserId, sPasswd);
        },
        
        _setAccountEvents: function () {
            app.tetris.Account.Info.on('onFailLogin', function () {
                alert('Invalid Id or Password');
            });

            app.tetris.Account.Info.on('onSuccessLogin', function () {
                app.tetris.Account.Info.save();
                app.tetris.Router.navigate('menu', {trigger: true});
            });
        },
        
        _onClickSplash : function(we){
            if(this.$el.find('#_login_form').css('display') !== 'none'){
                this._resetDisplay();
                return;
            }
            
            this.$el.find('._start_btn').removeClass('flipInY').addClass('fadeOutUp');
            
            if(app.tetris.Account.Info.isAuthenticated()){
                app.tetris.Router.navigate('menu', {trigger : true});
            } else {
                this.hide();
                this.$el.find('#_login_form').addClass('flipInX').show();
            }
            
            return false;
        },

        hide : function(){
            this.$el.find('._title').addClass('fadeOutUp').show();
        },

        _updateInputs: function () {

            var htAccount = app.tetris.Account.Info.getAccount();
            this.$el.find('._id').val(htAccount.userId);
            this.$el.find('._pw').val(htAccount.passwd);
            this.$el.find('._pw_re').val(htAccount.passwd);
            this.welPwRe.hide();
        },

        _playShowAnimation: function () {
            this.$el.find('._start_btn')
                .removeClass('flipOutX')
                .removeClass('flipOutY')
                .addClass('flipInY');

            this.$el.find('._title')
                .removeClass('fadeOutUp')
                .addClass('flipInX');
        },

        _hideLoginForm : function () {
            this.$el.find('#_login_form').hide();
        },

        _resetDisplay : function () {
            this._updateInputs();
            this._hideLoginForm();
            this._playShowAnimation();
        },
        
        show : function(){
            this._resetDisplay();
            this.$el.show();
        },

        render : function(){
            var template = app.tetris.TemplateManager.get(this.template, {});
            this.$el.html(template);
            this.assignElements();
            return this;
        }
    });

    app.tetris.Account.View = new AccountView();
})();
app.tetris.Board.init = function(htOptions){
    if(app.tetris.Board.bInitialized){
        return;
    }
    
    var oMonitorIo = io.connect(app.tetris.config.sMonitorUrl);
    
    
	var htOptions = htOptions ? htOptions : {}
//	  , oView = new app.tetris.GameView({el : $('#stage'), bEventBind : false})
	  , nGamePeopleCount = 0
	  , aSelectedGamePeople = []
	  , sEmpNo = 'nt1234'
	  , sEmpNm = 'names'
	  , sDeptNm = '';
	
	var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/i) ? true : false );
	
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
	};
	
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
//			oView.drawBoardStage('_watch_'+sEmpNo, []);
		});
		oMonitorIo.emit('sendSelectedGamePeople', aSelectedGamePeople);
	};

    var setNetworkEvents = function() {

        
        oMonitorIo.on('resAdmin', function (sStatus) {

            if (sStatus === 'ok') {
                $('#_start').show();
            } else if (sStatus === 'game') {
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
            for (var i = 0; i < nConnectedPeopleCount; i++) {
                aHtml.push('<li id="_cp_' + aConnectedPeople[i]['sEmpNo'] + '">' + aConnectedPeople[i]['sEmpNm'] + '</li>');
            }

            $('#_connectedPeople').html(aHtml.join(''));

            var aHtml = [];
            for (var i = 0; i < nGamePeopleCount; i++) {
                if (this.bRealGame) {
                    if (aGamePeople[i]['nScore'] === undefined) {
                        nScore = 0;
                    } else {
                        nScore = aGamePeople[i]['nScore'];
                    }

                    aHtml.push('<li id="_gp_' + aGamePeople[i]['sEmpNo'] + '">' + aGamePeople[i]['sEmpNm'] + ' - ' + nScore + '점</li>');
                } else {
                    aHtml.push('<li id="_gp_' + aGamePeople[i]['sEmpNo'] + '">' + aGamePeople[i]['sEmpNm'] + '</li>');
                }
            }

            $('#_gamePeople')
                .html(aHtml.join(''))
                .selectable({
                    selected: function (event, ui) {

                        selectGamePeople();

                    },
                    stop: function (event, ui) {
                        selectGamePeople();
                    }
                });
        });

        oMonitorIo.on('pushGameInfo', function (htData) {
//            oView.drawBoardStage('_watch_' + htData.sEmpNo, htData.aMatrix);
            $('#_info_' + htData.sEmpNo).text(htData.sEmpNm + ' - ' + htData.nScore + '점');
        });
    };


    /**
	 * 게임보드 초기화 메서드 
	 */
	var initalize = function(){
        
        if(sEmpNo === '' || sEmpNo === null){
//			moveToLogin();
		}

		$( "#selectable" ).selectable();
        setNetworkEvents();
        
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


        app.tetris.Board.bInitialized = true;
	};

    
    initalize();
};

(function(){


    var BoardView = Backbone.View.extend({
        el : '#_container #_gameboard_view',
        template : 'board',

        defaults : {
            oWebGLView : {},
            bWebGLOn : false
        },

        events : {

            'click._move_to_menu' : "moveToMenu"
        },

        initialize : function(){
            this.render();
        },

        show : function(){
            this.$el.hide().stop().fadeIn(300);
        },

        hide : function(){
            this.$el.hide();
        },

        moveToMenu : function(){
            app.tetris.Router.navigate('menu', {trigger : true});
        },

        render : function(){
            app.tetris.TemplateManager.get(this.template, {}, $.proxy(function(template){
                this.$el.html(template);
            }, this));

            return this;
        }
    });
    
    app.tetris.Board.View = new BoardView();
})();

    

(function(){

    var CreditView = Backbone.View.extend({
        el : '#_container #_credit_view',
        template : 'credit',

        events : {
            "click ._menu_item" : "onClickMenu"
        },

        initialize : function(){
            this.setEvents();
            this.render();
        },

        setEvents: function () {
            
        },

        onClickMenu : function(we){
            return false;
        },

        show : function(){
            this.$el.show();
            this.$el.addClass('animated').removeClass('fadeInUp').addClass('fadeInDown');
        },

        hide : function(){
//            this.$el.hide();
            this.$el.addClass('animated').removeClass('fadeInDown').addClass('fadeInUp');

//            var self = this;
//            this.$el.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
//                self.$el.hide();
//            });

        },

        render : function(){

            var htVars = {
            };

            var template = app.tetris.TemplateManager.get(this.template, htVars);
            this.$el.html(template);

            return this;
        }
    });

    app.tetris.Credit.View = new CreditView();
})();
app.tetris.Game.BlockModel = Backbone.Model.extend({
	defaults : function(){
		return {
			sColor :'',
			sCode : '',
			nAngle : 0,
			aMatrix : []
		}
	}
});
app.tetris.Game.init = (function(htOptions){
	htOptions = htOptions ? htOptions : {};
	
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
      	

		$('.game_area').on('touchmove', function(e) {
			return false;
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
app.tetris.Game.Model = Backbone.Model.extend({
	defaults : function(){
		return {
		nScore : 0,
		sGameStatus : 'stop',
		nBlockPixel : null,
		aBlocks : null,
		nNumber : 2,
		nCols : 0,
		nRows : 0,
		sGuid : '',
		aMatrix : [],
		nGameStartTime : 0,
		oBlockCollection : {},
		htBlockPos : {
			nX : 0,
			nY : 0
		}
		};
	},
	
	initialize : function(){
		this.set({
			nScore : 0,
			htBlockPos : {nX : 5, nY : 0},
			nCols :10,
			nRows: 20,
			nBlockPixel : 22
		});

        this.set('sGuid', app.tetris.Util.makeGuid());

        var Blocks = Backbone.Collection.extend({model : app.tetris.Game.BlockModel});

        var oBlockCollection = new Blocks();
        oBlockCollection.add(app.tetris.Rules.BlockList.create());

        this.set('oBlockCollection', oBlockCollection);
        
		this.initMatrix();
		
	},
	
	plusScore : function(nScorePlus){
		var nScore = this.get('nScore');
		this.set('nScore', nScore + (nScorePlus * 100));
	},
	
	setBlockPosXY : function(nX, nY){
		this.set({ htBlockPos : {nX : nX, nY : nY}});
	},
	
	/**
	 * 랜덤 메서드 
	 */
	getRandomRange : function() {
		var n1 = 0
		, n2 = this.get('oBlockCollection').length - 1;
		return Math.floor( (Math.random() * (n2 - n1 + 1)) + n1 );
	},
	
	/**
	 * 스테이지 배열 초기화 
	 */
	initMatrix : function(){
		var matrix = [];
		var nCols = this.get('nCols');
		var nRows = this.get('nRows');
		
		for(var i = 0; i < nRows + 2; i++){
			matrix[i] = [];
			for(var j = 0; j < nCols + 2; j++){
				
				if(j == 0 || j == nCols + 1 || i > nRows){
					matrix[i][j] = { nFlag : 1 };
				} else {
					matrix[i][j] = { nFlag : 0 };	
				}
				
			}
		}
		
		this.setMatrix(matrix);	
	},
	
	setMatrix : function(matrix){
		this.set('aMatrix', matrix);
	},
	
	getMatrix : function(){
		return this.get('aMatrix');
	}
});

(function(){

    var StageView = Backbone.View.extend({
        el : '#_container #_single_view',
        template : 'stage/stage.mobile',
        
        initialize : function(){
            this.arColorPos = {
                'red' : 1,
                'orange' : 2,
                'yellow' : 3,
                'green' : 4,
                'sky' : 5,
                'blue' : 6,
                'purple' : 7,
                'sand' : 8,
                'leaf' : 9,
                'brown' : 10,
                'leaf2' : 11,
                'sky2' : 12,
                'sand2' : 13,
                'stone' : 14
            };

            this.focusMenu('tip');
            
            this.model = new app.tetris.Game.Model();
            
            this._initTimer();
            this.model.bind('change:sGameStatus', this.watchGameStatus, this);

            this.model.bind('change:htBlockPos', this.onBlockChange, this);
            this.setEvents();
            
            this.render();
        },

        onBlockChange : function(){
            this.drawNextBlock();
        },

        /**
         * 다음 블럭을 그린다
         */
        drawNextBlock : function(){
            var aBlocks = this.model.get('oBlockCollection');
            var nBlock = this.model.get('nextBlock')[0];

            var sBlock = this.getBlockString(aBlocks.at(nBlock).get('aMatrix'), aBlocks.at(nBlock).get('sColor'), 16, 'next');

            $('.next_block_container').empty().append(sBlock);

            if(this._isDrawNextGroupBlock){
                $('.next_group_block_container').empty();

                for(var i = 0; i < 3; i++){
                    nBlock = this.model.get('nextBlock')[i+1];
                    var sBlock = this.getBlockString(aBlocks.at(nBlock).get('aMatrix'), aBlocks.at(nBlock).get('sColor'), 12, 'next_'+i);
                    $('.next_group_block_container').append(sBlock + '<div style="clear:both;height:43px;"></div>');
                }
            }

        },

        getPosPixelByColor : function(sColor, nSize){
            return this.arColorPos[sColor] * nSize;
        },

        getBlockString : function(aBlock, sColor, nSize, sId){
            var str = ['<div class="single_block" style="clear:both;" id="'+sId+'">'];
            var nPosX;

            for(var i = 0; i < aBlock.length; i++){
                for(var j = 0; j < aBlock[i].length; j++){
                    if(aBlock[i][j] == 1){

                        nPosX = this.getPosPixelByColor(sColor, nSize);

                        str.push('<div class="fill_block_'+nSize+'" style="width:'+nSize+'px;height:'+nSize+'px;background-position:-'+nPosX+'px 0;"></div>');
                    }else{
                        str.push('<div class="empty_block" style="width:'+nSize+'px;height:'+nSize+'px;"></div>');
                    }
                }
                str.push('<div class="clear"></div>');
            }
            str.push('</div><br>');

            return str.join('');
        },

        render : function(){
            var template = app.tetris.TemplateManager.get(this.template, {});
            this.$el.html(template);

            return this;
        },
        
        show : function(){
        
            this.$el.show();

            this.oGameView = new app.tetris.Game.View({
                el : '#single_game_area',
                model : this.model,
                bEventBind : true,
                bUseWebGL : true
            });

            this.oGameView2 = new app.tetris.Game.View({
                el : '#other_1_game_area',
                model : new app.tetris.Game.Model(),
                bEventBind : true,
                bUseWebGL : true
            });

            this.oGameView3 = new app.tetris.Game.View({
                el : '#other_2_game_area',
                model : new app.tetris.Game.Model(),
                bEventBind : true,
                bUseWebGL : false
            });

            setInterval(function(){

                $('#other_1_game_area').parent().removeClass('tada').hide().addClass('tada').show();
            }, 2000);

            setInterval(function(){
                $('#other_2_game_area').parent().removeClass('tada').hide().addClass('tada').show();
            }, 3000);


            var wel = $(this.$el);
            this._setGameEvents(wel);
        },
        
        excuteTick : function(){
            var nGameStartTime = this.nGameStartTime;
            
            nGameStartTime += 1000;
            
            var d = new Date(nGameStartTime)
             ,  sMin = app.tetris.Util.leadingSpaces(d.getMinutes(), 2)
             ,  sSec = app.tetris.Util.leadingSpaces(d.getSeconds(), 2);
            
            this.drawTime(sMin, sSec);
            
            this.nGameStartTime = nGameStartTime;
            
            this.model.set('nGameStartTime', nGameStartTime);
        },
        
        
        drawTime : function(sMin, sSec){
            var arElHour = $('.time_hour li').attr('class','').addClass('hold_num')
             ,  arElMin = $('.time_min li').attr('class','').addClass('hold_num');
            
            $(arElHour[0]).addClass('n' + sMin.charAt(0));
            $(arElHour[1]).addClass('n' + sMin.charAt(1));
            $(arElMin[0]).addClass('n' + sSec.charAt(0));
            $(arElMin[1]).addClass('n' + sSec.charAt(1));
        },
        
        _initTimer : function(){
            this.drawTime('00', '00');
            this.stopTimer();
        },
        
        startTimer : function(){
            var that = this;
            
            this.nGameStartTime = this.model.get('nGameStartTime');
            this.stopTimer();
            
            this.timer = setInterval(function(){
                that.excuteTick();
            },1000);
            
        },
        
        stopTimer : function(){
            clearTimeout(this.timer);
        },
        
        watchGameStatus : function(){
            var sGameStatus = this.model.get('sGameStatus');
            
            if(sGameStatus === 'start'){
                this._initTimer();
                this.startTimer();
            } else if(sGameStatus === 'play'){
                $('.field .pause').remove();
                this.startTimer();
            } else if(sGameStatus === 'pause'){
                this.stopTimer();
                this.createDimmedLayer('Pause');
                
            } else if(sGameStatus === 'stop'){
                this._initTimer();
                this.createDimmedLayer('Hello TETRIS');
                
            } else if(sGameStatus === 'ready'){
                this.createDimmedLayer('Ready');
                
            } else if(sGameStatus === 'game'){
                this.createDimmedLayer('Already Started');
                
            } else if(sGameStatus === 'end'){
                this.createDimmedLayer('Game Over');
                
            }else {
                this.stopTimer();
            }
        },
        
        logChat : function(sStr){
            var chatOld = $('.chat_area').html();
                
            $('.chat_area').html(chatOld + sStr + '<br>');
            $('.chat_area').scrollTop($('.chat_area')[0].scrollHeight);
        },
        
        focusMenu : function(sMenu){
            $('.tip_btn, .option_btn, .map_btn, .key_btn').css('background-position','');
            
            if(sMenu === 'tip'){
                $('.tip_btn').css('background-position', '-228px 0');
            }else if(sMenu === 'option'){
                $('.option_btn').css('background-position', '-224px 0');
            } else if(sMenu === 'map'){
                $('.map_btn').css('background-position', '-224px 0');
            } else {
                $('.key_btn').css('background-position', '-224px 0');	
            }
        },

        _setGameEvents: function (wel) {
            wel.find('#start_btn').bind('click', $.proxy(this.oGameView.start, this.oGameView));
            wel.find('#debug_btn').bind('click', $.proxy(this.oGameView.debugStart, this.oGameView));
            wel.find('#stop_btn').bind('click', $.proxy(this.oGameView.stop, this.oGameView));
            wel.find('#ready_btn').bind('click', $.proxy(this.oGameView.reqReady, this.oGameView));
            wel.find('#cancel_btn').bind('click', $.proxy(this.oGameView.reqCancel, this.oGameView));
            $('#start_touch').bind('click', $.proxy(this.oGameView.start, this.oGameView));
        }, setEvents : function(){
            var that = this;
            
            $('.chat_input').on('keydown', function(e){
                if(e.keyCode === 13 && $(this).val() !==''){
                    that.logChat('me : ' + $(this).val());
                    $(this).val('');
                }
            });
        
            $('.pop_btn').on('click', function(){
                var reg = new RegExp('^(.*)_btn', 'ig');
                var sId = reg.exec($(this).attr('id'))[1];
                that.focusMenu(sId);
            });
            
            var wel = $(this.$el);
            
            
            wel.find('#ssamdi').on('click', $.proxy(function(){
                if(this.bWebGLOn === true){
                    this.bWebGLOn = false;
                } else {
                    this.bWebGLOn = true;
                }
            },this.oGameView));
            
            wel.find('#fullscreen_btn').bind('click', function(){
                var el = document.documentElement
                , rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen;
                rfs.call(el);
            });
            
            
            var that = this.oGameView;
            wel.find('#fullscreen_btn').bind('click', function(){
                if(that.bFullScreen == true){
                    that.bFullScreen = false;
                } else {
                    var el = document.documentElement
                    , rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen;
                    rfs.call(el);
                    that.bFullScreen = true;	
                }
                
            });
        },


        /**
         * 딤드 레이어 생성용 메서드
         * @param {String} string
         */
        createDimmedLayer : function(string){
            $('.field .pause').remove();
            $('#_dimmed_section').prepend(
                '<div class="pause" style="z-index:50;width:100%;height:100%;background-color:rgba(0,0,0,.7);position:absolute;color:#FFF;font-size:27px;font-family:Tahoma;">'+
                    '<div style="margin:auto;width:100%;height:25px;text-align:center;margin-top:200px;">'+string+'</div></div>');

            // $('#other_1').parent().find('.pause').remove();
            // $('#other_1').parent().prepend(
            // '<div class="pause" style="z-index:500;width:100px;height:200px;margin:13px;margin-top:15px;background-color:rgba(0,0,0,.7);position:absolute;color:#FFF;font-size:27px;font-family:Tahoma;">'+
            // '<div style="margin:auto;width:100%;height:25px;text-align:center;margin-top:70px;">'+string+'</div></div>');
        }
    });

    // Stage view is Singleton
    app.tetris.Game.StageView = {
        _oInstance : null,
        getInstance : function() {
            if (this._oInstance === null) {
                this._oInstance = new StageView();
            }

            return this._oInstance;
        }
    };

})();
app.tetris.Game.View = Backbone.View.extend({
	
	defaults : {
		oWebGLView : {},
		bWebGLOn : true
	},
    
	initialize : function(options){
        this.render();

		this.oWebGLView = new app.tetris.Game.WebGLView({
            el : this.$el.find('._tetris_webgl_canvas')
        });
		this.oUIView = options.oUIView;
		this.oGameIo = options.oGameIo || {};
		
		this.bEventBind = options.bEventBind;

        this._fnKeyEvent = $.proxy(this._onKeyAction, this);
        
		this.initResources();
		
		if(this.model !== undefined){
			this.resetData();
			this.initCanvas();
			
			if(this.bEventBind){
				this.bindModelEvents();
				this.bindEvents();	
			}
			
			this.drawMyStage();
			this.renderDOM();
			this.start();
		}

		this.bWebGLOn = options.bUseWebGL ? options.bUseWebGL : false;
		
		this.bFullScreen = false;
		
		if(this.bEventBind){
			this.setGameEvents();
		}
	},

    render : function(){
        this.$el.html(
            '<canvas class="_tetris_webgl_canvas" width="220" height="448" style="width:100%;height:100%;position:absolute;z-index:10;left:0px;display:block;"></canvas>' +
            '<canvas class="_tetris_origin_canvas" width="220" height="448" style="width:100%;height:100%;"> </canvas>'

        );
    },

	/**
	 * 데이터 리셋
	 */
	resetData : function(){
		this.nTickCnt = 0;
		this.tickTime = 35;
		this.nLogicTickCnt = 0;
		this.nLogicSpeed = 1500;
		this.nLongPressCnt = 0;
		this.level = 1;
		this.model.set('nGameStartTime', 0);
		this.model.set('nScore', 0);
		this.initMatrix();
	},
	
	/**
	 * 리소스 초기화 
	 */
	initResources : function(){
		/**
		 * TODO
		 * 차후 리소스가 더 많아지면 리소스 초기화 메서드 분리 해야 함 
		 */
		this.blockImg = [];
		
		this.blockImg[22] = new Image();
		this.blockImg[22].src = './res/img/mino_main.png';
		
		this.blockImg[10] = new Image();
		this.blockImg[10].src = './res/img/mino_sub.png';
		
		this.arColorPos = {
			'red' : 1,
			'orange' : 2,
			'yellow' : 3,
			'green' : 4,
			'sky' : 5,
			'blue' : 6,
			'purple' : 7,
			'sand' : 8,
			'leaf' : 9,
			'brown' : 10,
			'leaf2' : 11,
			'sky2' : 12,
			'sand2' : 13,
			'stone' : 14
		};
		
		this.initAudio();	
	},
	
	/**
	 * 오디오 초기화 
	 */
	initAudio : function(){
		this.htSound = {
            harddrop : new Howl({urls: ['../res/sound/TE_SE_harddrop.mp3'], volume: 0.3}),
            softdrop : new Howl({urls: ['../res/sound/TE_SE_softdrop.mp3'], volume: 0.3}),
            lockdown : new Howl({urls: ['../res/sound/TE_SE_lockdown.mp3'], volume: 0.3})
        };
	},
	
	/** 
	 * 사운드 제어 
	 */
	controlSound : function(sSoundType, sExcutor){
		if(!this.htSound[sSoundType]){
			return false;
		}
		
		if(sExcutor === 'play'){
            this.htSound[sSoundType].play();

		} else if(sExcutor === 'stop'){
			this.htSound[sSoundType].pause();
		}
		
	},
	
	/** 
	 * 모델 이벤트 바인딩 
	 */
	bindModelEvents : function(){
		this.model.bind('change:nScore', this.renderDOM, this);
	},
	
	/**
	 * Game 이벤트 바인딩 
	 */
	bindEvents : function(){
		var wel = $(this.el);
		
		this.X = 0;
		var that = this;
		this.forward = false;
		
		this.startX = 0;
		var _onMouseMove = function(e){
			if(that.mouseDownFlag){
				
				var x = e.clientX - $(this).offset().left;
				var w = $(this).width();
				var deg = (x / w) * 180;
				that.oWebGLView.fAngleXZ = deg * Math.PI/180;
				
				var y = e.clientY - $(this).offset().top;
				var h = $(this).height();
				var deg = (y / h) * 90;
				that.oWebGLView.fAngleYZ = deg * Math.PI/180;
			}
		};
		
		this.flag = 0;
		this.startX = 350;
        var welGlStage = this.$el.find('._tetris_webgl_canvas');

		var animatorFunc = function(){
			
			if(that.flag == 0){
				that.startX--;	
			} else {
				that.startX++;
			}
				
			
			if(that.startX > 350){
				that.flag = 0;
			}
			
			if(that.startX <= 330){
				that.flag = 1;
			}
			
			var x = that.startX - welGlStage.offset().left;
				var w = welGlStage.width();
				var deg = (x / w) * 180;
				that.oWebGLView.fAngleXZ = deg * Math.PI/180;
				
				
		};
		
		//this.animation = setInterval(animatorFunc, 100);

        welGlStage.mousewheel(function(event, delta, deltaX, deltaY) {
		    
			that.oWebGLView.fCameraDistance += (delta * 10);
		    
		    return false;
		});

        welGlStage.on('mousedown', function(e){
			that.mouseDownFlag = true;
			
			$(this).off('mousemove', _onMouseMove);
			$(this).on('mousemove', _onMouseMove);
			
		});
		
		$(document).on('mouseup', function(e){
			that.mouseDownFlag = false;
            welGlStage.off('mousemove', _onMouseMove);
		});
		
	},
	
	/**
	 * DOM 렌더링 
	 */
	renderDOM : function(){
		var nScore = this.model.get('nScore');
		$('.score').empty().html(nScore);
	},
	
	/**
	 * Ghost Block 그리기 메서드 
	 */
	drawGhostBlock : function(){
		var htBlock = this.model.get('htBlockPos');
		var nY = 0;
		
		for(var i = 0; i < 35; i++){
			nY = htBlock.nY + i;
			if(this.checkCollision({nX : htBlock.nX, nY : htBlock.nY + i}, this.aBlock, 'bottom')){
				this.drawMovingBlock(this.aBlock, {nX : htBlock.nX, nY : nY}, true);
				break;
			}
		}
	},
	
	/**
	 * 움직이는 블럭을 그린다
	 * @param {Object} aBlock
	 * @param {Object} htBlockPos
	 * @param {Object} bIsGhost
	 */
	drawMovingBlock : function(aBlock, htBlockPos, bIsGhost){
		var htBlockPos = htBlockPos || this.model.get('htBlockPos') 
		, aBlock = aBlock || this.aBlock
		, stage = this.ctx.stage
		, nX, nY, bDraw;

		if(aBlock === undefined){
			return;
		}
		
		for(var i = 0; i < aBlock.length; i++){
			for(var j = 0; j < aBlock[i].length; j++){
				bDraw = false;
					
				if(aBlock[i][j] === 1){
					sBlockColor = this.sBlockColor;
					bDraw = true;	
				}
				
				if(this.debugMode && bDraw === false){
					sBlockColor = 'stone';
					bDraw = true;
				}
				
				if(bDraw){

					if(this.oWebGLView.isAvailWebGL()){


					}
	
					nX = j + htBlockPos.nX - 1;
					nY = i + htBlockPos.nY;
					this.drawBlock(stage.ctx, sBlockColor, stage.nBlockSize, nX, nY, bIsGhost ? 0.2 : 1);	
				}
			}
		}
	},
	
	/**
	 * 내 스테이지 그리기 
	 */	
	drawMyStage : function(){
		var arMatrix = this.getMatrix()
		, htStage = this.ctx.stage;
		
		this.drawStage(htStage, arMatrix);
		
		if(this.debugMode){
			this.drawDebugStage();
		}
	},
	
	/**
	 * 다른 사람의 스테이지 영역 그리기
	 * @param {Object} nSeq
	 * @param {Object} arMatrix
	 */
	drawOtherStage : function(nSeq, arMatrix){
		var htOtherStage = this.ctx.others[nSeq];
		try{
			if(arMatrix.length>0)
				this.drawStage(htOtherStage, arMatrix, 10);	
		}catch(e){
			
		}
	},
	
	/**
	 * 스테이지 그리기
	 * @param {Object} htStage
	 * @param {Object} matrix
	 * @param {Object} nTopMargin
	 */
	drawStage : function(htStage, matrix, nTopMargin){
		if(matrix.length === 0){
			return;
		}
		
		var nRows = matrix.length
		, nCols = matrix[0].length
		, ctx = htStage.ctx
		, nBlockSize = htStage.nBlockSize;
		
		this.clearScreen(htStage);
		
		for(var i = 0; i < nRows; i++){
			for(var j = 0; j < nCols; j++){
				
				
				if(matrix[i][j].nFlag === 1){
					var sColor = matrix[i][j].sColor;
					this.drawBlock(ctx, sColor, nBlockSize, j - 1, i, 1, nTopMargin);
				}
			}
		}

	},
	
	drawBoardStage : function(sId, arMatrix){
		var htOtherStage = this.getOriginCanvasObject();
		this.drawStage(htOtherStage, arMatrix, 0);	
	},
	
	drawBlock : function(ctx, sColor, nBlockSize, nX, nY, nOpacity, nTopMargin){
		if(sColor === undefined){
			return false;
		}
		
		if(ctx === undefined){
			return false;
		}
		
		var bWebGLEnable = this.bWebGLOn;

		if(this.ctx){
			if( (ctx == this.ctx.stage.ctx) && (this.oWebGLView !== undefined) ){
				if(this.oWebGLView.isAvailWebGL() && this.bWebGLOn === true){
					bWebGLEnable = true;
				} else {
					bWebGLEnable = false;
				}
			}
		}

		if(bWebGLEnable) {
			var matrix = this.getMatrix(), nRows = matrix.length, nCols = matrix[0].length;
			var MoveX = ((nCols-1)*nBlockSize)/2 -22;
			var MoveY = ((nRows+1)/2)*nBlockSize +5;
			var MoveZ = 0.0;
			//this.bCameraPerspective = false;
			//this.oWebGLView.fAngleYZ = 0.0;
			//this.oWebGLView.fAngleXZ = Math.PI/2.0;
			//this.oWebGLView.fCameraDistance = 900.0;
			this.oWebGLView.bCameraPerspective = true;
			
			
			this.oWebGLView.arCameraLookAt = [MoveX,MoveY,MoveZ];
			
			this.oWebGLView.drawBlock(nX, nRows-nY, nBlockSize, this.arColorPos[sColor], [1.0,1.0,1.0,nOpacity]);
			//console.log(nX,nY);
		} else {
			if(nTopMargin === undefined){
				nTopMargin = 14;
			}

			var nBlockPosX = this.getPosPixelByColor(sColor, nBlockSize);
		
			ctx.globalAlpha = nOpacity;
			ctx.drawImage(this.blockImg[nBlockSize], nBlockPosX, 0, nBlockSize, nBlockSize, nX * nBlockSize, nY * nBlockSize - nTopMargin, nBlockSize, nBlockSize);
			ctx.globalAlpha = 1;
		}

	},
	
	/**
	 * 스테이지 클리어 
 	* @param {Object} stage
	 */
	clearScreen : function(stage){
		stage.ctx.clearRect(0, 0, stage.nWidth, stage.nHeight);
		
		if(this.ctx === undefined)
		return null;
		
		if( (stage.ctx == this.ctx.stage.ctx) && (this.oWebGLView !== undefined) ){
			if(this.oWebGLView.isAvailWebGL()){
				this.oWebGLView.clear();
			}	
		}
	},
	
	/**
	 * 캔버스 오브젝트 Getter 
 	 * @param {Object} sId
	 */
    getOriginCanvasObject : function(){
        return this.getCanvasObjectBy('canvas');
	},

    getCanvasObjectBy : function(sType){
        var canvas = null;

        switch(sType){
            case 'canvas' :
            canvas = this.$el.find('._tetris_origin_canvas')[0];
            break;
        }

        var nBlockSize = ($(canvas).hasClass('game_area')) ? this.model.get('nBlockPixel') : 10;

        if(canvas === null){
            return false;
        }

        return {
            elCanvas : canvas,
            ctx : canvas.getContext('2d'),
            nWidth : canvas.width,
            nHeight : canvas.height,
            nBlockSize : nBlockSize
        }
    },

	/** 
	 * 전체 캔버스 이니셜라이저
	 */
	initCanvas : function(){
		this.ctx = {
			stage : this.getOriginCanvasObject(),
			others : [
//				this.getCanvasObject('other_1'),
//				this.getCanvasObject('other_2')
			]
		};
		
		this.nWidth = this.ctx.stage.width;
		this.nHeight = this.ctx.stage.height;
		
		if(this.oWebGLView.isAvailWebGL()){
			this.oWebGLView.initCanvas();
			
			this.oWebGLView.fAngleYZ = Math.PI/180 * 0;
			this.oWebGLView.fAngleXZ = Math.PI/180 * 90;
			
			this.oWebGLView.fCameraDistance = 300.0;
			
		}
	},
	
	setGameStatus : function(sStatus){
		this.model.set('sGameStatus', sStatus);
		
		if(sStatus === 'start'){
			this.debugMode = false;
			$('#debug_area').empty().hide();
			$('.pause').remove();
		}
	},
	
	bindKeyEvents : function(){
		
		this.htKeyState = {};

		$(document)
			.unbind('keydown keyup', this._fnKeyEvent)
			.bind('keydown keyup', this._fnKeyEvent);
	},
	
	setGameEvents : function(){
		
		$('.jpad').on('touchstart mousedown', $.proxy(function(e){
	        e.stopPropagation();
    		e.preventDefault();
    		
    		
    		if(this.getGameStatus() !== 'play'){
            	return false;
            }
            
	        if(e.handled !== true) {
		        var id = $(e.currentTarget).attr('id');    
	
				if(id === 'down'){
					this.moveDown(true);
				} else if(id === 'right'){
					this.moveBlock('right');
				} else if(id === 'left'){
					this.moveBlock('left');
				} else if(id === 'up'){
					this.rotateBlock('right');
				} else if(id === 'harddown'){
					this.moveHardDown();
				}
	
	            e.handled = true;
	        }
	        
	        return false;
		}, this));
		
	 	$('#game_area').on('hold tap swipe', $.proxy(function (event) {
			event.stopPropagation();
    		event.preventDefault();
    		
            if(this.getGameStatus() !== 'play'){
            	return false;
            }
            
            if(event.direction === 'right' && event.type =='swipe'){
            	this.moveBlock('right');
            } else if(event.direction ==='left' && event.type =='swipe'){
            	this.moveBlock('left');
            } else if(event.direction ==='down' && event.type =='swipe'){
            	this.moveHardDown();
            } else if(event.direction ==='up' && event.type =='swipe'){
            	this.rotateBlock('left');
            	
            	
            } else if(event.type === 'hold'){
            	this.start();
            }
            
            
        }, this));
	},
	
	getGameStatus : function(){
		return this.model.get('sGameStatus');	
	},

    /**
     * @todo 로직 개선 & 리펙토링
     */
	checkLevelUp : function(){
		
		if(this.model.get('nScore') >= 100 && this.level < 2){
			this.level = 2;
			this.nLogicSpeed = 250;
		} else if(this.model.get('nScore') >= 1000 && this.level < 3){
			this.level = 3;
			this.nLogicSpeed = 200;
		} else if(this.model.get('nScore') >= 2000 && this.level < 4){
			this.level = 3;
			this.nLogicSpeed = 100;
		}
	},
	
	renderCanvas : function(){
		this.drawMyStage();
		this.drawMovingBlock();
		this.drawGhostBlock();
	},
	
	tick : function(){
		this.renderCanvas();
		
		this.nTickCnt += this.tickTime;
		this.nLogicTickCnt += this.tickTime;
		
		if(this.nLogicTickCnt > this.nLogicSpeed){
			this.setGameStatus('play');
			this.moveDown(true);
			this.nLogicTickCnt -= this.nLogicSpeed;
		}
		
		if(this.keyPressFlag == true){
			if (this.htKeyState[37]){
				this.moveBlock('left');
			} else if(this.htKeyState[39]){
				this.moveBlock('right');			
			}
		}
	},
	
	start : function(bRealGame){
		if(this.getGameStatus() === 'start'){
			return ;
		}
		
		var wel = $(this.el);
		
		if(bRealGame){
			wel.find('#start_btn').hide();
			wel.find('#stop_btn').hide();
			wel.find('#cancel_btn').hide();
//			this.bRealGame = true;
		}else{
			wel.find('#start_btn').hide();
			wel.find('#stop_btn').show();
//			this.bRealGame = false;
		}
		
		this.resetData();
		this.setGameStatus('start');
		
		this.model.set('nextBlock', []);
		for(var i = 0; i <= 5; i++){
			var nextBlock = this.model.get('nextBlock');
            nextBlock.push(this.model.getRandomRange());
            this.model.set('nextBlock', nextBlock);
		}
		
		this.makeNewBlock();
		this.bindKeyEvents();

        this.stopAnimationLoop();
        this.startAnimationLoop();
        
		this.tick();
	},
	
    stopAnimationLoop : function(){
        cancelAnimationFrame(this.ticker);
    },
    
    startAnimationLoop : function(){
        this.ticker = requestAnimationFrame($.proxy(this.startAnimationLoop, this));
        this.tick();
    },
    
	debugStart : function(){
		if(this.getGameStatus() === 'start'){
			return ;
		}
		$('.pause').remove();
		
		this.debugMode = true;	
		this.setGameStatus('debug');
		this.resetData();

        this.model.set('nextBlock', []);
        for(var i = 0; i <= 5; i++){
            var nextBlock = this.model.get('nextBlock');
            nextBlock.push(this.model.getRandomRange());
            this.model.set('nextBlock', nextBlock);
        }
		
		this.makeNewBlock();
		this.bindKeyEvents();
		this.drawMyStage();
	},
	
	pause : function(){
		if(this.model.get('sGameStatus') == 'pause'){
			this.setGameStatus('play');
			this.timer = setInterval($.proxy(this.tick, this), this.tickTime);
		}else{
			clearTimeout(this.timer);
			this.setGameStatus('pause');
		}
	},
	
	/**
	 * Game 정지시킨다 
	 */
	stop : function(){
		$(document).unbind('keydown', $.proxy(this._onKeyAction, this));

		this.setGameStatus('stop');
		$('.pause').remove();

        cancelAnimationFrame(this.ticker);
		
		$(this.el).find('#active').remove();
		this.initMatrix();
		this.drawMyStage();
		this.resetData();
		
		$('#debug_area').empty().hide();
	},

    /**
     * ready 신호 전송
     */
	reqReady : function(){
		this.stop();
		
		var wel = $(this.el);
		wel.find('#start_btn').hide();
		wel.find('#ready_btn').hide();
		wel.find('#cancel_btn').show();
		wel.find('#stop_btn').hide();
				
		this.oGameIo.emit('reqReady');

        this.setGameStatus('ready');
	},
	
	resReady : function(htData){
		if(htData.sStatus === 'ok'){

		}else if(htData.sStatus === 'game'){
			var wel = $(this.el);
			wel.find('#start_btn').show();
			wel.find('#ready_btn').show();
			wel.find('#cancel_btn').hide();
			wel.find('#stop_btn').show();
			
		}else{
			var wel = $(this.el);
			wel.find('#start_btn').show();
			wel.find('#ready_btn').show();
			wel.find('#cancel_btn').hide();
			wel.find('#stop_btn').show();
			
			alert('resReady에서 오류가 났습니다.');
		}
	},
	
	reqCancel : function(){
		var wel = $(this.el);
		wel.find('#start_btn').show();
		wel.find('#ready_btn').show();
		wel.find('#cancel_btn').hide();
		wel.find('#stop_btn').hide();
				
		this.oGameIo.emit('reqCancel');
	},
	
	resCancel : function(htData){
		if(htData.sStatus === 'ok'){

		}else if(htData.sStatus === 'game'){
			var wel = $(this.el);
			wel.find('#start_btn').hide();
			wel.find('#ready_btn').hide();
			wel.find('#cancel_btn').show();
			wel.find('#stop_btn').hide();
			
			alert('이미 게임이 시작되었습니다.');
		}else{
			var wel = $(this.el);
			wel.find('#start_btn').hide();
			wel.find('#ready_btn').hide();
			wel.find('#cancel_btn').show();
			wel.find('#stop_btn').hide();
			
			alert('resCancel에서 오류가 났습니다.');
		}
	},
	
	makeNewBlock : function(){
		var aBlocks = this.model.get('oBlockCollection');
		var nNumber = this.model.get('nextBlock').shift();
	
		if(this.checkGameOver()){
			return false;
		}

        this.model.set('nextBlock', []);
        var nextBlock = this.model.get('nextBlock');
        nextBlock.push(this.model.getRandomRange());

		this.aBlock = aBlocks.at(nNumber).get('aMatrix');
		this.sBlockCode = aBlocks.at(nNumber).get('sCode');
		this.sBlockColor = aBlocks.at(nNumber).get('sColor');
		this.nBlockAngle = aBlocks.at(nNumber).get('nAngle');
		
		this.model.setBlockPosXY(4,-1);
        this.checkLevelUp();
	},
	
	checkCollision : function(htBlockPos, aBlock, forward){
		var matrix = this.model.get('aMatrix')
		 ,  result = false
		 , nX, nY;
		 
		for(var i = 0; i < aBlock.length; i++){
			for(var j = 0; j < aBlock[i].length; j++){
				nX = j + htBlockPos.nX;
				nY = i + htBlockPos.nY;
				
				if(forward === 'bottom'){
					nY = nY + 1;
				}else if(forward === 'left' || forward === 'right'){
					nX = (forward === 'left') ? nX - 1 : nX +1;	
				}

				if(matrix[nY] === undefined){
					continue;
				}
				
				if(matrix[nY][nX] === undefined){
					continue;
				}
				
				if(matrix[nY][nX].nFlag === 1 && aBlock[i][j] === 1){
					result = true;
					break;
				}					
			}
		}

		return result;
	},
	
	moveDown : function(bPlaySound){
		if(this.checkGameOver()){
			return;
		}
		
		var htBlockPos = this.model.get('htBlockPos')
		, result = false
		, bChk = this.checkCollision(htBlockPos, this.aBlock, 'bottom');
		
		if(!bChk){
			htBlockPos.nY++;
			this.model.set({htBlockPos : htBlockPos});
		}else{
            if(bPlaySound){
                this.htSound['lockdown'].play();
            }

			this.setBlockToMatrix();
			this.makeNewBlock();

			result = true;
		}
		
		this.checkFullLine();
		
		if(this.debugMode){
			this.drawMyStage();
			this.drawMovingBlock();
		}
		
		return result;
	},
	
	checkFullLine : function(){
		var matrix = this.model.get('aMatrix')
			, nCols = this.model.get('nCols')
			, nRows = this.model.get('nRows')
			, lineCount = 0
			, nFlag
			, nCnt
			, aNewLine;
		
		for(var i = 0; i < nRows + 2; i++){
			nCnt = 0;
			for(var j = 1; j < nCols + 1; j++){
				if(matrix[i][j].nFlag == 1){
					nCnt++;
				}
			}
			
			if(nCnt == nCols && i < nRows + 1){
				matrix.splice(i, 1);
				
				aNewLine = [];
				for(var k = 0; k <= nCols + 1; k++){
					nFlag = (k === 0 || k === nCols + 1) ? 1 : 0;
					aNewLine.push({nFlag : nFlag});
				}
				
				matrix.unshift(aNewLine);
				lineCount++;
			}
		}
		
		this.setMatrix(matrix);
		if(lineCount > 0){
			this.model.plusScore(lineCount * 2);
			this.sendData();
		}
	},
	
	moveBlock : function(sDirection){

		if(sDirection === 'left'){
			if(!this.checkCollision(this.model.get('htBlockPos'), this.aBlock, 'left')){
				this.model.get('htBlockPos').nX--;	
			}
		} else if(sDirection === 'right'){
			if(!this.checkCollision(this.model.get('htBlockPos'), this.aBlock, 'right')){
				this.model.get('htBlockPos').nX++;	
			}
		}
		
		
		
		if(this.debugMode) {
			this.drawMyStage();
			this.drawMovingBlock();
		}
	},
	
	setBlockToMatrix : function(){
		var matrix = this.getMatrix();
		var nX, nY;
		
		for(var i = 0; i < this.aBlock.length; i++){
			for(var j = 0; j < this.aBlock[i].length; j++){
				
				nX = j + this.model.get('htBlockPos').nX;
				nY = i + this.model.get('htBlockPos').nY;
				
				if(matrix[nY] === undefined){
					continue;
				}
				
				if(matrix[nY][nX] === undefined){
					continue;
				}
				
				if(matrix[nY][nX].nFlag !== 1){
					matrix[nY][nX].nFlag = this.aBlock[i][j];
					matrix[nY][nX].sColor = this.sBlockColor;
				}
			}
		}
		
		this.setMatrix(matrix);
		this.sendData();
	},
	
	setMatrix : function(matrix){
		this.model.setMatrix(matrix);
	},
	
	sendData : function(){
		if(this.bRealGame){
			var htData = { 
				sGuid : this.model.get('sGuid'), 
				aMatrix : this.model.get('aMatrix'),
				nScore : this.model.get('nScore')
			};
			this.oGameIo.emit('sendGameInfo', htData);
		}
	},
	
	getMatrix : function(){
		return this.model.get('aMatrix');
	},
	
	initMatrix : function(){
		this.model.initMatrix();
	},
	
	getPosPixelByColor : function(sColor, nSize){
		return this.arColorPos[sColor] * nSize;
	},
	
	rotateBlock : function(sType){
		this.aBlock = this.rotateBlockArray(this.aBlock, sType);
		
		if(this.debugMode) {
			this.drawMyStage();
			this.drawMovingBlock();
		}
	},
	
	rotateBlockArray : function(aBlock, sType){
		var aCopy = []
		, aClone
		, htBlockPos = this.model.get('htBlockPos')
		, bRotate = false;
		
		if(this.sBlockCode !== 'O'){
			bRotate = true;
		} 
		
		if(this.sBlockCode === 'S' || this.sBlockCode === 'I' || this.sBlockCode === 'Z') {
			if(this.nBlockAngle > 0){
				sType = 'left';
			}
		}
		
		if(bRotate === true){
			
			if(sType === 'right'){
				this.nBlockAngle = (this.nBlockAngle + 90) % 360;
			
				for(var j = aBlock[0].length - 1; j >=0; j--){
					aClone = [];
					aClone.push(aBlock[3][j]);
					for(var i = 0; i < aBlock.length - 1; i++){
						aClone.push(aBlock[i][j]);
					}
					
					aCopy.push(aClone);
				}
			} else {
				this.nBlockAngle = (this.nBlockAngle - 90) % 360;
				
				for(var j = 1; j < aBlock.length; j++){
					aClone = [];
					for(var i = aBlock[0].length - 1; i >=0; i--){
						aClone.push(aBlock[i][j]);
					}
					aCopy.push(aClone);
				}
				
				aClone = [];
				for(var i = aBlock[0].length - 1; i >=0; i--){
					aClone.push(aBlock[i][0]);
				}
				
				aCopy.push(aClone);
			}
			
		} else {
			aCopy = aBlock;
		}

		
		if(this.checkCollision(htBlockPos, aCopy)){
			aCopy = aBlock;
		}
		
		return aCopy;
	},
	
	/**
	 * 게임 오버 상태를 체크하는 메서드 
	 */
	checkGameOver : function(){
		var nCnt = 0
		, matrix = this.getMatrix();
		
		for(var j = 1; j < this.model.get('nCols') + 1; j++){
			if(matrix[0][j].nFlag == 1){
				nCnt++;
			}
		}
		
		if(nCnt > 0){
			$(this.el).find('#active').remove();
            cancelAnimationFrame(this.ticker);
			
			this.setGameStatus('end');
			
			$(document).unbind('keydown', $.proxy(this.keyAction, this));
			
			return false;
		}
	},

    clearLongPress: function () {
        clearInterval(this.keyLongPressChecker);
        this.nLongPressCnt = 0;
    }, 
    
    /**
	 * SpaceBar로 빠르게 블럭을 내린다 
	 */
	moveHardDown : function(){
        this.clearLongPress();

//        this.$el
//            .removeClass().addClass('bounceDrops animatedDrops').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
//                $(this).removeClass();
//            });

		this.controlSound('harddrop', 'play');

		var rst = false;
		for(var i = 0, nRows = this.model.get('nRows'); i < nRows; i++){
			if(rst == true){
				this.model.get('htBlockPos').nY = -1;
				break;
			}else{
                var bPlaySound = false;
				rst = this.moveDown(bPlaySound);
			}
		}
	},
	
	/**
	 * 키보드 액션 이벤트 메서드 
	 */
	_onKeyAction : function(htData){
		var nKeyCode = htData.keyCode;
	
		
		if(htData.type =='keydown' && this.nLongPressCnt === 0){
			this.htKeyState[htData.keyCode || htData.which] = true;
			this.nLongPressCnt = 1;
			
			clearInterval(this.keyLongPressChecker);
			
			var that = this;

			this.keyLongPressChecker = setInterval(function(){
				that.nLongPressCnt++;
				that.keyPressFlag  = (that.nLongPressCnt > 5) ? true : false;
			}, 400);
		}
		
		if(htData.type =='keyup'){
			this.htKeyState[htData.keyCode || htData.which] = false;
			this.nLongPressCnt = 0;
			clearInterval(this.keyLongPressChecker);
		}

		if(htData.type === 'keyup'){
			return false;
		}
		
		if(this.model.get('sGameStatus') === 'pause' && nKeyCode !== 16){
			return false;
		}

		switch(nKeyCode){
			case 16 :
			this.pause();
			break;
			
			case 32 :
			this.moveHardDown();
			break;
			case 37 : 
			this.moveBlock('left');
			break;
			
			case 39 : 
			this.moveBlock('right');
			break;
			
			case 38 : 
			this.rotateBlock('right');
			break;
			
			case 40 :
			this.moveDown(true);
			break;
			
			case 90 :
			this.rotateBlock('left');
			break;
			
			case 88 :
			this.rotateBlock('right');
			break;
			
			default : 
			break;		
		}
		
		return false;
	},
	
	drawDebugStage : function(){
		var matrix = this.getMatrix()
		, str = []
		, nRows = matrix.length
		, nCols = matrix[0].length;
		 
		for(var i = 0; i < nRows; i++){
			for(var j = 0; j < nCols; j++){
				str.push('<div class="block">' + matrix[i][j].nFlag + '</div>');	
			}
			str.push('<div class="clear"></div>');
		}
		
		$('#debug_area').show().empty().append(str.join(''));
	}
	

});
app.tetris.Game.WebGLView = Backbone.View.extend({
	defaults : {
		nWidth : 0,
		nHeight : 0,
		arCameraEye : [0.0,0.0,0.0],
		arCameraLookAt : [0.0,0.0,0.0],
		fAngleYZ : 100,
		fAngleXZ : 0,
		fCameraDistance : 0,
		bCameraPerspective : false,
		nFov : 0,
		ctx : null,
		bWebGLAvailable : false
	},

	isAvailWebGL : function(){
		return !!window.WebGLRenderingContext;
	},

	initCanvas : function(){
        var elCanvas = this.$el[0];

		this.nWidth = elCanvas.width;
		this.nHeight = elCanvas.height;
		this.arCameraEye = [0.0,0.0,0.0];
		this.arCameraLookAt = [0.0,0.0,0.0];
		this.fAngleYZ = 0.0;
		this.fAngleXZ = Math.PI / 2.0;
		this.fCameraDistance = 100.0;
		this.bCameraPerspective = false;
		this.nFov = 45;

		var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
		this.ctx = null;
		for(var index=0; index<names.length; ++index){
			try{
				this.ctx = elCanvas.getContext(names[index]);
			}
			catch(e){
				break;
			}
			if(this.ctx != null) break;
		}

		if(this.ctx == null){
			this.bWebGLAvailable = false;
		} else {
			this.bWebGLAvailable = true;
		}

        this.initResource();
		this.initShader();
		this.clear();
	},

	initResource : function(){
		var gl = this.ctx;

		/////////////////////////////////////////////////////////////////////////////////////// VertexData
		var vertices = [-0.5,-0.5,0.5,	0.5,-0.5,0.5,	0.5,0.5,0.5,	-0.5,0.5,0.5,	// Front face
						-0.5,-0.5,-0.5,	-0.5,0.5,-0.5,	0.5,0.5,-0.5,	0.5,-0.5,-0.5,	// Back face
						-0.5,0.5,-0.5,	-0.5,0.5,0.5,	0.5,0.5,0.5,	0.5,0.5,-0.5,	// Top face
						-0.5,-0.5,-0.5,	0.5,-0.5,-0.5,	0.5,-0.5,0.5,	-0.5,-0.5,0.5,	// Bottom face
						0.5,-0.5,-0.5,	0.5,0.5,-0.5,	0.5,0.5,0.5,	0.5,-0.5,0.5,	// Right face
						-0.5,-0.5,-0.5,	-0.5,-0.5,0.5,	-0.5,0.5,0.5,	-0.5,0.5,-0.5	// Left face
						];
		this.gl_VB_Position_Cube = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_VB_Position_Cube);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		this.gl_VB_Position_Cube.itemSize = 3;
        this.gl_VB_Position_Cube.numItems = 24;
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		var colors = [	1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	// Front face
						1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	// Back face
						1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	// Top face
						1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	// Bottom face
						1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	// Right face
						1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0,	1.0,1.0,1.0,1.0		// Left face
						];
		this.gl_VB_Color_Cube = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_VB_Color_Cube);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
		this.gl_VB_Color_Cube.itemSize = 4;
        this.gl_VB_Color_Cube.numItems = 24;
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		var cordinate = [0.0,0.0,	1.0,0.0,	1.0,1.0,	0.0,1.0,	// Front face
						0.0,0.0,	1.0,0.0,	1.0,1.0,	0.0,1.0,	// Back face
						0.0,0.0,	1.0,0.0,	1.0,1.0,	0.0,1.0,	// Top face
						0.0,0.0,	1.0,0.0,	1.0,1.0,	0.0,1.0,	// Bottom face
						0.0,0.0,	1.0,0.0,	1.0,1.0,	0.0,1.0,	// Right face
						0.0,0.0,	1.0,0.0,	1.0,1.0,	0.0,1.0		// Left face
						];
		this.gl_VB_Cordinate_Cube = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_VB_Cordinate_Cube);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cordinate), gl.STATIC_DRAW);
		this.gl_VB_Cordinate_Cube.itemSize = 2;
        this.gl_VB_Cordinate_Cube.numItems = 24;
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		/////////////////////////////////////////////////////////////////////////////////////// IndexData
		var indices = [	0,1,2,		0,2,3,    // Front face
						4,5,6,		4,6,7,    // Back face
						8,9,10,		8,10,11,  // Top face
						12,13,14,	12,14,15, // Bottom face
						16,17,18,	16,18,19, // Right face
						20,21,22,	20,22,23  // Left face
						];
		this.gl_IB_Cube = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.gl_IB_Cube);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
		this.gl_IB_Cube.itemSize = 1;
        this.gl_IB_Cube.numItems = 36;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		/////////////////////////////////////////////////////////////////////////////////////// Texture

		this.gl_Tex_Cube = gl.createTexture();
		WebGLUtil.loadImage(gl, this.gl_Tex_Cube, 'res/img/mino_main2.png');
	},

	initShader : function(){
		var gl = this.ctx;

		/////////////////////////////////////////////////////////////////////////////////////// Shader
		this.gl_Shader_RenderProgram = gl.createProgram();
		var vertexShaderText = this.vertexShaderText;
		var vertexShader = WebGLUtil.createShader(gl, vertexShaderText, gl.VERTEX_SHADER);
		var fragmentShaderText = this.fragmentShaderText;
		var fragmentShader = WebGLUtil.createShader(gl, fragmentShaderText, gl.FRAGMENT_SHADER);
		if( vertexShader == null || fragmentShader == null ){
			alert("Shader can not compile");
			return false;
		}
		gl.attachShader(this.gl_Shader_RenderProgram, vertexShader);
		gl.attachShader(this.gl_Shader_RenderProgram, fragmentShader);
		gl.deleteShader(vertexShader);
		gl.deleteShader(fragmentShader);

		gl.linkProgram(this.gl_Shader_RenderProgram);
		if( !gl.getProgramParameter(this.gl_Shader_RenderProgram, gl.LINK_STATUS) ){
			alert("Could not initialize shaders");
			return false;
		}
		gl.useProgram(this.gl_Shader_RenderProgram);

		this.gl_Attribute_VertexPosition = gl.getAttribLocation(this.gl_Shader_RenderProgram, "aVertexPosition");
		this.gl_Attribute_VertexColor = gl.getAttribLocation(this.gl_Shader_RenderProgram, "aVertexColor");
		this.gl_Attribute_VertexCordinate = gl.getAttribLocation(this.gl_Shader_RenderProgram, "aVertexCordinate");

		this.gl_Uniform_WorldMatrix = gl.getUniformLocation(this.gl_Shader_RenderProgram, "uWorldMatrix");
		this.gl_Uniform_ViewMatrix = gl.getUniformLocation(this.gl_Shader_RenderProgram, "uViewMatrix");
		this.gl_Uniform_ProjectionMatrix = gl.getUniformLocation(this.gl_Shader_RenderProgram, "uProjectionMatrix");

		this.gl_Uniform_Texture = gl.getUniformLocation(this.gl_Shader_RenderProgram, "uTexture");
		this.gl_Uniform_ModulateCordinate = gl.getUniformLocation(this.gl_Shader_RenderProgram, "uModulateCordinate");
		this.gl_Uniform_Color = gl.getUniformLocation(this.gl_Shader_RenderProgram, "uColor");

		gl.useProgram(null);
	},

	initialize : function(){
        this.vertexShaderText = WebGLUtil.loadShader('res/shader/model.vs');
        this.fragmentShaderText = WebGLUtil.loadShader('res/shader/model.fs');
	},

	drawBlock : function(nPosX, nPosY, nBlockSize, nTexturePos, vColor){
		var gl = this.ctx;

		gl.useProgram(this.gl_Shader_RenderProgram);
		gl.enableVertexAttribArray(this.gl_Attribute_VertexPosition);
		gl.enableVertexAttribArray(this.gl_Attribute_VertexColor);
		gl.enableVertexAttribArray(this.gl_Attribute_VertexCordinate);


		var arCameraGap = [0.0,0.0,0.0];
        arCameraGap[0] = this.fCameraDistance * Math.cos(this.fAngleYZ) * Math.cos(this.fAngleXZ);	//X
        arCameraGap[1] = this.fCameraDistance * Math.sin(this.fAngleYZ);	//Y
		arCameraGap[2] = this.fCameraDistance * Math.cos(this.fAngleYZ) * Math.sin(this.fAngleXZ);	//Z
		this.arCameraEye[0] = this.arCameraLookAt[0] + arCameraGap[0];
		this.arCameraEye[1] = this.arCameraLookAt[1] + arCameraGap[1];
		this.arCameraEye[2] = this.arCameraLookAt[2] + arCameraGap[2];
				
		var WorldMatrix = mat4.create();
		var ViewMatrix = mat4.create();
		var ProjectionMatrix = mat4.create();
		mat4.identity(WorldMatrix);
		mat4.scale(WorldMatrix, [nBlockSize,nBlockSize,nBlockSize], WorldMatrix);
		mat4.translate(WorldMatrix, [nPosX,nPosY,0.0], WorldMatrix);
		mat4.lookAt(this.arCameraEye, this.arCameraLookAt, [0.0,1.0,0.0], ViewMatrix);
		if(this.bCameraPerspective == true)		
			mat4.perspective(this.nFov, this.nWidth/this.nHeight, 0.1, 1000.0, ProjectionMatrix);
		else if(this.bCameraPerspective == false)
			mat4.ortho(-this.nWidth/2, this.nWidth/2, -this.nHeight/2, this.nHeight/2, 0.1, 1000.0, ProjectionMatrix);
		gl.uniformMatrix4fv(this.gl_Uniform_WorldMatrix, false, WorldMatrix);
		gl.uniformMatrix4fv(this.gl_Uniform_ViewMatrix, false, ViewMatrix);
		gl.uniformMatrix4fv(this.gl_Uniform_ProjectionMatrix, false, ProjectionMatrix);
		
		if(this.gl_Tex_Cube.bIsLoaded == true){
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.gl_Tex_Cube);
			gl.uniform1i(this.gl_Uniform_Texture, 0);
		}
		gl.uniform4fv(this.gl_Uniform_ModulateCordinate, [0.0625, 1.0, 0.0625*nTexturePos, 0.0]);
		gl.uniform4fv(this.gl_Uniform_Color, vColor);
		
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		if(vColor[3] < 1.0){
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			gl.blendEquation(gl.FUNC_ADD);
		}
		else{
			gl.disable(gl.BLEND);			
		}
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_VB_Position_Cube);
		gl.vertexAttribPointer(this.gl_Attribute_VertexPosition, this.gl_VB_Position_Cube.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_VB_Color_Cube);
		gl.vertexAttribPointer(this.gl_Attribute_VertexColor, this.gl_VB_Color_Cube.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gl_VB_Cordinate_Cube);
		gl.vertexAttribPointer(this.gl_Attribute_VertexCordinate, this.gl_VB_Cordinate_Cube.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.gl_IB_Cube);
		gl.drawElements(gl.TRIANGLES, this.gl_IB_Cube.numItems, gl.UNSIGNED_SHORT, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.disableVertexAttribArray(this.gl_Attribute_VertexPosition);
		gl.disableVertexAttribArray(this.gl_Attribute_VertexColor);
		gl.disableVertexAttribArray(this.gl_Attribute_VertexCordinate);
		gl.useProgram(null);

		//console.log("drawImage");
	},
	
	clear : function(){
		var gl = this.ctx;
		
		gl.clearColor(0.0,0.0,0.0,0.0);
		gl.viewport(0, 0, this.nWidth, this.nHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}
});
app.tetris.Rules.BlockList = {

    create : function(){
        var arObjBlock = [];

        arObjBlock[0] = new app.tetris.Game.BlockModel({
            sColor: 'yellow',
            sCode: 'O',
            nAngle: 0,
            aMatrix: [
                [0, 0, 0, 0],
                [0, 1, 1, 0],
                [0, 1, 1, 0],
                [0, 0, 0, 0]
            ]
        });

        arObjBlock[1] = new app.tetris.Game.BlockModel({
            sColor: 'sky',
            sCode: 'I',
            nAngle: 0,
            aMatrix: [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ]
        });

        arObjBlock[2] = new app.tetris.Game.BlockModel({
            sColor: 'orange',
            sCode: 'L',
            nAngle: 0,
            aMatrix: [
                [0, 0, 0, 0],
                [0, 1, 1, 1],
                [0, 1, 0, 0],
                [0, 0, 0, 0]
            ]
        });

        arObjBlock[3] = new app.tetris.Game.BlockModel({
            sColor: 'blue',
            sCode: 'J',
            nAngle: 0,
            aMatrix: [
                [0, 0, 0, 0],
                [0, 1, 1, 1],
                [0, 0, 0, 1],
                [0, 0, 0, 0]
            ]
        });

        arObjBlock[4] = new app.tetris.Game.BlockModel({
            sColor: 'green',
            sCode: 'S',
            nAngle: 0,
            aMatrix: [
                [0, 0, 0, 0],
                [0, 0, 1, 1],
                [0, 1, 1, 0],
                [0, 0, 0, 0]
            ]
        });

        arObjBlock[5] = new app.tetris.Game.BlockModel({
            sColor: 'red',
            sCode: 'Z',
            nAngle: 0,
            aMatrix: [
                [0, 0, 0, 0],
                [0, 1, 1, 0],
                [0, 0, 1, 1],
                [0, 0, 0, 0]
            ]
        });

        arObjBlock[6] = new app.tetris.Game.BlockModel({
            sColor: 'purple',
            sCode: 'T',
            nAngle: 0,
            aMatrix: [
                [0, 0, 0, 0],
                [0, 1, 1, 1],
                [0, 0, 1, 0],
                [0, 0, 0, 0]
            ]
        });

        return arObjBlock;
    }
};
(function(){



    var MenuView = Backbone.View.extend({
        el : '#_container #_menu_view',
        template : 'menu',
        
        events : {
            "click ._menu_item" : "onClickMenu"
        },

        initialize : function(){
            this.render();

            this.oBgm = new Howl({urls: ['../res/sound/FF_8_OST.mp3'], volume : 0.1, format : 'mp3'});

            app.tetris.Network.Model.on('change:nRegisterUser change:nConnectedUser', $.proxy(function(oModel){
                this.onChangeCount(oModel);
            }, this));
        },

        onChangeCount: function (oModel) {

            var welUserCnt = this.$el.find('._conn_user_cnt');
            welUserCnt.find('._con_user').html(oModel.get('nConnectedUser'));
            welUserCnt.find('._reg_user').html(oModel.get('nRegisterUser'));

            welUserCnt.removeClass('pulse').hide().addClass('pulse').show();
        },
    
        onClickMenu : function(we){
            var sMenuValue = $(we.currentTarget).attr('data-navigate');
            app.tetris.Router.navigate(sMenuValue, {trigger : true});
            return false;
        },
        
        show : function(){
            this.render();
            
            this.$el.show();
            this.$el.find('._welcome').addClass('animated').addClass('pulse');
            this.$el.addClass('animated').removeClass('fadeOutUp').addClass('fadeInDown');
            this.$el.find('._conn_user_cnt')
                .removeClass('pulse')
                .addClass('animated').addClass('pulse').show();

            var self = this;
            setTimeout(function(){
                if(self.myScroll){
                    self.myScroll.refresh();
                }
            }, 200);

//            this.oBgm.stop();
//            this.oBgm.play();
            
        },
        
        hide : function(){
//            this.$el.hide();
            this.$el.addClass('animated').removeClass('fadeInDown').addClass('fadeOutUp');

//            this.oBgm.stop();
        },
        
        render : function(){
            var htVars = {
                sName : app.tetris.Account.Info.userId,
                nConnectedUser : app.tetris.Network.Model.get('nConnectedUser'),
                nRegisterUser : app.tetris.Network.Model.get('nRegisterUser')
            };

            var template = app.tetris.TemplateManager.get(this.template, htVars);
            this.$el.html(template);

            this.myScroll = new IScroll('#wrapper_scroll', {
                scrollX: false,
                scrollY: true,
                momentum: true,
                click: true
            });


            return this;
        }
    });

    app.tetris.Menu.View = new MenuView();
})();
app.tetris.init = function(sMode){
    app.tetris.config.setEnv(sMode || 'development');

    // initialize Singleton
    app.tetris.Game.StageView = app.tetris.Game.StageView.getInstance();
    app.tetris.Router = app.tetris.Router.getInstance();

    app.tetris.Network.startSession();

    app.tetris.ui.BackButton.setEvents();
    Backbone.history.start();

    var sNavigation = Backbone.history.fragment ? Backbone.history.fragment : false;

    app.tetris.Router.navigate(sNavigation, {trigger: true});
};
(function () {
    var t = app.tetris;
    
    var TetrisRouter = Backbone.Router.extend({
    
        routes: {
            login : "moveToStart",
            menu : "moveToMenu",
            
            single : "moveToSingleGame",
            multi : "moveToMultiGame",
            board :'moveToGameBoard',
            credit : "moveToCredit",
            logout : "moveToLogout",
            
            '':  'moveToStart'
        },

        execute: function(callback, args) {
            app.tetris.Account.Info.load();
            var sFrag = Backbone.history.fragment;
            
            if(!app.tetris.Account.Info.isAuthenticated() && sFrag !== 'login'){
//                this.navigate('login', {trigger : true});
//                return;
            }
            
            if (callback) callback.apply(this, args);
        },
        
        initialize : function(){
            this._welContainer = $('#_container');
            
            this._hideAllScreens();
        },

        _hideAllScreens : function(){
            

            this._welContainer.find('._screen').hide();
            this._welContainer.removeClass('animated').removeClass('fadeInDown');

            t.ui.Header.View.hide();
            t.ui.Footer.View.hide();
            t.ui.BackButton.hide();
        },

        moveToStart : function(){
            this._hideAllScreens();
            t.Account.View.show();
        },

        moveToLogout : function(){
            app.tetris.Account.Info.clear();
            this.navigate('login', {trigger : true});
        },


        moveToMultiGame : function(){
            this._hideAllScreens();
            t.Menu.View.show();
        },
        
        moveToGameBoard : function(){
            this._hideAllScreens();
            
            
            t.Board.init();
            t.Board.View.show();

            t.ui.Header.View.changeTitle('GameBoard').show();
            t.ui.Footer.View.show();

            t.ui.BackButton.show();
        },

        moveToCredit : function(){
            this._hideAllScreens();
            t.Credit.View.show();
            t.ui.Header.View.changeTitle('Credit').show();
            
            t.ui.BackButton.show();
        },

        moveToSingleGame : function(){
            this._hideAllScreens();

            t.ui.BackButton.show();
            t.Game.StageView.show();
            
            // Game Init
            var oTetris = t.Game.init({
                sTargetId  : 'game_area',
                bUseWebGL : true
            });
            
            oTetris.on('ready', function(context){
                context.oGameView.show();
            });
            
        },

        moveToMenu : function(){
            
            this._hideAllScreens();
            t.Menu.View.show();
        }
    });

    // Router is singleton
    app.tetris.Router = {
        _oInstance : null,
        getInstance : function() {
            if (this._oInstance === null) {
                this._oInstance = new TetrisRouter();
            }

            return this._oInstance;
        }
    };
})();