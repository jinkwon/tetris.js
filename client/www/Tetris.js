/*! Tetris - v0.1.0 - 2014-05-21
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
            sSrvUrl = 'http://' + document.location.hostname + ':8888';
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

    if(!app.tetris.io){
        app.tetris.io = io.connect(app.tetris.config.sHost, {
            timeout : 10000
        });

        app.tetris.Game.Network.init();
        app.tetris.Account.Network.init();
    }

    return;

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

app.tetris.Util.getOrdinal = function(n) {
    var s=["th","st","nd","rd"],
        v=n%100;
    return n+(s[(v-20)%10]||s[v]||s[0]);
}

app.tetris.Util.makeGuid = function(){
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    	return v.toString(16);
	});
};

app.tetris.Util.isMobile = function(){
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
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
        this._hideDomWithContext = $.proxy(this._hideDom, this);
        this.welClose = $('#_container').find('._close');
        this._sAniEvents = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        
        $(document).on('click', '._close', $.proxy(function (we) {
            this._clearAnimationClass($(we.currentTarget));

            $(we.currentTarget)
                .addClass('bounceIn').show();
            app.tetris.Router.moveBack();
        }, this));
    },

    show : function(){
        this._clearAnimationClass(this.welClose);
        this.welClose.show().addClass('rotateIn');
        this.welClose.off(this._sAniEvents);
    },

    _hideDom : function(){
        this.welClose.hide();
    },

    hide : function(){
        var welClose = $('#_container').find('._close');

        if(welClose.css('display') !== 'none'){
            this._clearAnimationClass(welClose);

            welClose
                .show()
                .addClass('bounceOut')
                .one(this._sAniEvents, this._hideDomWithContext);

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
            this.render();
            this.$el.addClass('animated').addClass('fadeInDown').show();

            return this;
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

    _setOptionListIdx : function(aList){
        for(var i = 0; i < aList.length; i++){
            aList[i].id = i;
        }

        this.aOptionList = aList;
    },

    onClickMenu : function(we){
        this.unbind();

        var nIdx = $(we.currentTarget).attr('data-idx');

        var bClose;
        
        if (this.aOptionList[nIdx].fn) {
            bClose = this.aOptionList[nIdx].fn();
        }

        if(bClose !== false){
            this.hide();
        }


        return false;
    },

    show : function(options){
        this._setOptionListIdx(options.aList || []);
        this.sTitle = options.sTitle || 'Options';

        this.$el.show();
        this.showDimmedLayer();
        this.render();

        var nHeight = this.$el.find('.option_title').outerHeight() + this.$el.find('.option_layer').height();
        
        this.$el.find('.option_container')
            .show()
            .removeClass('animated flipInY')
            .css('height', nHeight + 'px');


        this.$el.find('.option_container')
            .removeClass('animated flipInY')
            .addClass('animated flipInY')
            .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                $(this).removeClass('animated flipInY');
            });
    },

    hide : function(){

        var self = this;
        this.$el.find('.option_container')
            .removeClass('animated05 fadeOutDown')
            .addClass('animated05 fadeOutDown')
            .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                $(this).removeClass('animated05 fadeOutDown');
                self.$el.hide();
            });
        
        this.hideDimmed();
    },

    hideDimmed : function(){
        $('#_dimmed_section').hide();
    },

    showDimmedLayer : function(string){
        if($('#_dimmed_section .pause').length > 0){
            $('#_dimmed_section').show();
            return;
        }

        string = string || '';

        $('.field .pause').remove();
        $('#_dimmed_section').html(
                '<div class="pause" style="z-index:50;width:100%;height:100%;background-color:rgba(0,0,0,.7);position:absolute;color:#FFF;font-size:27px;font-family:Tahoma;">'+
                '<div style="margin:auto;width:100%;height:25px;text-align:center;margin-top:200px;">'+string+'</div></div>').show();
    },

    render : function(){
        var template = app.tetris.TemplateManager.get(this.template, {
            aList : this.aOptionList,
            sTitle : this.sTitle
        });
        this.$el.html(template);
        return this;
    }
});

app.tetris.ui.Option.View = new app.tetris.ui.Option.View();
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


app.tetris.Account.Network.init = function(cb){


    if(!app.tetris.Account.Network.io){
        app.tetris.Account.Network.io = app.tetris.io.of('/account');

        app.tetris.Account.Network.io
            .on('connect', function(){
                console.log('connect account', arguments);

                if(cb){
                    cb();
                }

            })
            .on('reconnect', function(){

            })
            .on('disconnect', function(){
                console.log('disconnected');
            })
            .on('error', function(){
                alert('Cannot connect to Server');

            })
            .on('reconnect_failed', function(){
                console.log('reconnect_failed');
            })
            .on('connect_failed', function (err) {
                console.log(err);
                alert('Connect failed');
            })
            .on('resLogin', function(htData){
                console.log(htData.bAvail);
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
            
            this._updateAccount();
            this._setAccountEvents();
            app.tetris.Account.Network.io.emit('reqLogin', app.tetris.Account.Info.getAccount());
        },

        _onClickJoin : function(){

            if(this.welPwRe.css('display') === 'none'){
                this.welPwRe.show().css('height', 0).animate({height : this.welPw.outerHeight() + 'px'}, 250, 'easeOutBounce');
                return;
            }

            if(!this._checkJoinValidation()){
                return;
            }

            this._updateAccount();
            this._setAccountEvents();
            app.tetris.Account.Network.io.emit('reqJoin', app.tetris.Account.Info.getAccount());
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
            _bWebGLOn : false
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
            sUserId : '',
            sGuid : '',
            nLogicSpeed : 1500,
            nLevel : 1,
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
            nLogicSpeed : 1500,
            nLevel : 1,
            aMatrix : [],
            sUserId : '',
            nRank : '',
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
        
		this.set('nScore', nScore + nScorePlus);
	},

    clearFullLine : function(){
        var matrix = this.get('aMatrix')
            , nCols = this.get('nCols')
            , nRows = this.get('nRows')
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
        
        return lineCount;
    },
    
    setBlockToMatrix : function(oBlockModel, htBlockPos){

        var aBlock = oBlockModel.get('aMatrix'), 
            sBlockColor = oBlockModel.get('sColor');
        
        var matrix = this.getMatrix();
        var nX, nY;

        for(var i = 0; i < aBlock.length; i++){
            for(var j = 0; j < aBlock[i].length; j++){

                nX = j + htBlockPos.nX;
                nY = i + htBlockPos.nY;

                if(matrix[nY] === undefined){
                    continue;
                }

                if(matrix[nY][nX] === undefined){
                    continue;
                }

                if(matrix[nY][nX].nFlag !== 1){
                    matrix[nY][nX].nFlag = aBlock[i][j];
                    matrix[nY][nX].sColor = sBlockColor;
                }
            }
        }

        this.setMatrix(matrix);
    },
    
	setBlockPosXY : function(nX, nY){
		this.set('htBlockPos', {nX : nX, nY : nY});
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
    
    initVal : function(){
        this.initialize();
    },
    
	setMatrix : function(matrix){
		this.set('aMatrix', matrix);
	},
	
	getMatrix : function(){
		return this.get('aMatrix');
	}
});


app.tetris.Game.Network = {};

app.tetris.Game.Network.close = function(){
    if(app.tetris.Game.Network.io){
        app.tetris.Game.Network.io.disconnect();
    }
};
app.tetris.Game.Network.open = function(){
    if(app.tetris.Game.Network.io){
        app.tetris.Game.Network.io.reconnect();
    }
};

app.tetris.Game.Network.init = function(){
    app.tetris.Game.Network.io = app.tetris.io.of('/game');

    app.tetris.Game.Network.io
        .on("reconnect", function(){
            console.log('connect', arguments);
//            oGameIo.emit('reqJoinLeague', {
//            });
        })

        .on('disconnected', function(){
            console.log('game disconnected')
        })
        .on('brGameStart', function(htObj){
            console.log('brGameStart');
            if(htObj.bIsStarted){
                // play Game
                app.tetris.Game.Network.sRoomName = htObj.sRoomName;
            }
        })
        .on('brGameInfo', function(htObj){
            console.log('brGameInfo', arguments);
        })
        .on('resStartGame', function(htObj){
            console.log('resStartGame', arguments);

            if(htObj.code === 400){
                app.tetris.Game.Network.io.emit('reqRoomInfo', { sRoomId : htObj.sRoomId});
            }
            
            if(htObj.bIsStarted){
                // play Game
                console.log('GAME BEGIN');
                app.tetris.Game.Network.sRoomName = htObj.sRoomName;
            }
        })
        .on('brLeagueClosed', function(){
            console.log(arguments);
        });
};
(function(){

    var StageView = Backbone.View.extend({
        el : '#_container #_single_view',
        template : 'stage/stage.mobile',


        initialize : function(){
            this.render();
            this._setViewProperties();
            this._initTimer();
            this.setUIEvents();
            this.setLogicEvents();
            
        },

        setType : function(sType){
            this._sType = sType;
        },
        
        _setViewProperties: function () {
            this.arColorPos = {
                'red': 1,
                'orange': 2,
                'yellow': 3,
                'green': 4,
                'sky': 5,
                'blue': 6,
                'purple': 7,
                'sand': 8,
                'leaf': 9,
                'brown': 10,
                'leaf2': 11,
                'sky2': 12,
                'sand2': 13,
                'stone': 14
            };

            this._onTouchKeyPadWithContext = $.proxy(this._onTouchKeyPad, this);
            this._isDrawNextGroupBlock = false;


            this._onBrRoomInfo = $.proxy(this._onChangeRoomData, this);
            this._onresQuickGame = $.proxy(function(htData){
                this.setReady = true;
                this._onChangeRoomData.apply(this, [htData]);
            }, this);

            this._onChangeModel = $.proxy(function(){
                app.tetris.Game.Network.io.emit('brGameInfo', {
                    sRoomId : this._sRoomId,
                    aMatrix : this.model.get('aMatrix'),
                    nScore : this.model.get('nScore')
                });
            }, this);
            
            this._onGameStart = $.proxy(function(htData){
                console.log(arguments);
                app.tetris.ui.Option.View.hide();
                this._startNetworkGame(htData);
            }, this);
            
            this._onWisper = $.proxy( function(htData){
                console.log('brGameInfo, wisper', arguments);

                var welScoreBoard = this.$el.find('._score_board');
                
                if(htData.nMyRank){
                    welScoreBoard.find('._my_rank').html(app.tetris.Util.getOrdinal(htData.nMyRank)).show();
                    
                    if(htData.nTotal){
                        var nPercent = 100 / (htData.nTotal - 1) * (htData.nMyRank - 1);
                        welScoreBoard.find('._rank_percent').css('left', nPercent + '%').show();
                    }
                }
                
                var oModel = null;
                if(htData.sType === 'im_back'){
                    oModel = this.backModel;
                } else if(htData.sType === 'im_front'){
                    oModel = this.frontModel;
                }

                if(oModel){
                    oModel.set({
                        'sUserId' : htData.sUserId,
                        'nRank' : htData.nRank,
                        'nScore' : htData.nScore,
                        'aMatrix' : htData.aMatrix
                    });    
                }
                
            }, this);
        },

        _startNetworkGame : function(htData){
            this._sRoomId = htData.sRoomId;
            
            this.model.unbind('change:nScore', this._onChangeModel);
            this.model.unbind('change:aMatrixCustomEvent', this._onChangeModel);

            this.model.bind('change:nScore', this._onChangeModel);
            this.model.bind('change:aMatrixCustomEvent', this._onChangeModel);

            this.startTimer();
            
            this.oGameView.start();

            app.tetris.Game.Network.io.emit('brGameInfo', {
                sRoomId : this._sRoomId,
                aMatrix : this.model.get('aMatrix'),
                nScore : this.model.get('nScore')
            });
        },
        
        _createMenuObject : function(sLabel, fn){
            return {
                sLabel : sLabel,
                fn : fn
            };
        },

        renderOtherStage: function (wel, model) {
            wel.removeClass('pulse animated05').hide().addClass('pulse animated05').show();
            
            var nRank = model.get('nRank');
            var sUserId = model.get('sUserId');
            var nScore = model.get('nScore');
            
            wel.find('._rank').html(nRank > 0 ? app.tetris.Util.getOrdinal(nRank) : '');    
            wel.find('._text').html(sUserId !== '' ? sUserId + '. ' + nScore : '');    
            
        },
        
        _onChangeRoomData : function(htData){
            if(!this.setReady || htData.sRoomId === 'menu'){
                return;
            }

            
            
            
            app.tetris.Game.Network.io.removeListener('brGameStart', this._onGameStart);
            app.tetris.Game.Network.io.addListener('brGameStart', this._onGameStart);

            app.tetris.io.removeListener('brGameInfo', this._onWisper);
            app.tetris.io.addListener('brGameInfo', this._onWisper);

            this.backModel.bind('change:nScore change:aMatrix', $.proxy(function(){

                
                var wel = $('._back_user_info');

                this.oBackGameView.drawMyStage();
                this.renderOtherStage(wel, this.backModel);

                if(this.backModel.get('sUserId') === this.frontModel.get('sUserId')){
                    this.frontModel.initVal();
                }
                
            }, this));

            this.frontModel.bind('change:nScore change:aMatrix', $.proxy(function(){
                
                var wel = $('._front_user_info');

                this.oFrontGameView.drawMyStage();
                this.renderOtherStage(wel, this.frontModel);
                
                console.log(this.backModel.get('sUserId') , this.frontModel.get('sUserId'));
                
                if(this.backModel.get('sUserId') === this.frontModel.get('sUserId')){
                    this.backModel.initVal();
                }
                
            }, this));
            
            var aMenuList = [
                this._createMenuObject('Leave Room', $.proxy(function(){
                    this.setReady = false;
                    app.tetris.Game.Network.io.emit("unsubscribe", { sRoomId : htData.sRoomId});
                    this.openMultiGameMenu();
                    return false;
                    
                }, this)),
                this._createMenuObject('Go to Menu', $.proxy(function(){
                    this.setReady = false;
                    app.tetris.Game.Network.io.emit("unsubscribe", { sRoomId : htData.sRoomId});
                    app.tetris.Game.Network.io.emit("unsubscribe", { sRoomId :'menu'});
                    app.tetris.Router.navigate('menu', {trigger : true});
                }, this))
            ];

            if(app.tetris.io.socket.sessionid === htData.sOwnerId){
                aMenuList.unshift(
                    this._createMenuObject('Start Game', $.proxy(function(){
                        app.tetris.Game.Network.io.emit('reqStartGame', {
                            sRoomId : htData.sRoomId
                        });
                        
                        return false;   
                    }, this))
                );
            }
            
            app.tetris.ui.Option.View.show({
                sTitle : 'Multi Game<br> User : ' + htData.nMemberCount,
                aList : aMenuList
            });
        },

        initNetworks: function () {
            app.tetris.Game.Network.io.emit("subscribe", { sRoomId : 'menu' });
            app.tetris.Game.Network.io.removeListener('resQuickGame', this._onresQuickGame);
            app.tetris.Game.Network.io.removeListener('brRoomInfo', this._onBrRoomInfo);

            app.tetris.Game.Network.io.addListener('resQuickGame', this._onresQuickGame);
            app.tetris.Game.Network.io.addListener('brRoomInfo', this._onBrRoomInfo);
        },

        openMultiQuickJoin : function(sTitle){
            app.tetris.Game.Network.io.emit("unsubscribe", { sRoomId :'menu'});
            this.initNetworks();

                        
            var _onClickQuickGame = function(){
                app.tetris.Game.Network.io.emit('reqQuickGame', {});
                app.tetris.ui.Option.View.show(htMultiGameOption);
                return false;
            };

            var _onClickMenu = function(){
                app.tetris.Game.Network.io.emit("unsubscribe", { sRoomId :'menu'});
                app.tetris.Router.navigate('menu', {trigger : true});
            };

            var htMultiGameOption = {
                sTitle : sTitle || 'Multi Game',
                aList : [
                    this._createMenuObject('Quick Join', $.proxy(_onClickQuickGame, this)),
                    this._createMenuObject('Go to Menu', $.proxy(_onClickMenu, this))
                ]
            };

            app.tetris.ui.Option.View.show(htMultiGameOption);

            app.tetris.Game.Network.io.emit('reqQuickGame', {});
            app.tetris.ui.Option.View.show(htMultiGameOption);
        },
        
        openMultiGameMenu : function(sTitle){
            this.initNetworks();
            
            var _onClickQuickGame = function(){
                app.tetris.Game.Network.io.emit('reqQuickGame', {});
                app.tetris.ui.Option.View.show(htMultiGameOption);
                return false;
            };

            var _onClickMenu = function(){
                app.tetris.Game.Network.io.emit("unsubscribe", { sRoomId :'menu'});
                app.tetris.Router.navigate('menu', {trigger : true});
            };
            
            var htMultiGameOption = {
                sTitle : sTitle || 'Multi Game',
                aList : [
                    this._createMenuObject('Quick Join', $.proxy(_onClickQuickGame, this)),
                    this._createMenuObject('Go to Menu', $.proxy(_onClickMenu, this))
                ]
            };
            
            app.tetris.ui.Option.View.show(htMultiGameOption);
        },

        _onTouchKeyPad :function(e){
            e.stopPropagation();
            e.preventDefault();
            var sGameStatus = this.model.get('sGameStatus');

            if(this.model.get('sGameStatus') !== 'play'){
                return false;
            }

            if(e.handled !== true) {
                var id = $(e.currentTarget).attr('id');

                if(id === 'down'){
                    this.oGameView.moveDown(true);
                } else if(id === 'right'){
                    this.oGameView.moveBlock('right');
                } else if(id === 'left'){
                    this.oGameView.moveBlock('left');
                } else if(id === 'up'){
                    this.oGameView.rotateBlock('right');
                } else if(id === 'harddown'){
                    this.oGameView.moveHardDown();
                }

                e.handled = true;
            }

            return false;
        },
        
        setLogicEvents: function () {

            app.tetris.Router.on('route', $.proxy(function(sRouteName){
                if(this.oGameView && 
                    sRouteName !== 'moveToSingleGame' &&
                    sRouteName !== 'moveToMultiGame'
                ){
                    this.oGameView.stop().unbind();
                }
            }, this));
        },

        _renderScore : function(){
            var nScore = this.model.get('nScore');
            var welScore = this.$el.find('.score');

            welScore.empty().html(nScore);
            this.playUIAnimation(welScore.parent(), 'pulse');
        },
        
        playUIAnimation : function(wel, sType, time){
            var sAnimationClsss = time === '.5' ? 'animated05' : 'animated';
            var sEvents = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
                
            var _onAnimationClose = function(){
                $(this).removeClass(sAnimationClsss + ' ' + sType);
            };
            
            wel.removeClass(sAnimationClsss + ' ' + sType).addClass(sAnimationClsss + ' ' + sType).one(sEvents, _onAnimationClose);
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

            if(!aBlocks.at(nBlock)){
                return;
            }
            
            var sBlock = this.getBlockString(aBlocks.at(nBlock).get('aMatrix'), aBlocks.at(nBlock).get('sColor'), 16, 'next');

            $('.next_block_container').empty().append(sBlock);

            if(this._isDrawNextGroupBlock){
                $('.next_group_block_container').empty();

                for(var i = 0; i < 3; i++){
                    nBlock = this.model.get('nextBlock')[i+1];
                    sBlock = this.getBlockString(aBlocks.at(nBlock).get('aMatrix'), aBlocks.at(nBlock).get('sColor'), 12, 'next_'+i);
                    $('.next_group_block_container').append(sBlock + '<div style="clear:both;height:43px;"></div>');
                }
            }

            this.playUIAnimation($('._next_block'), 'fadeInDown');
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

        resetUI: function () {
            if(this._sType === 'multi'){
                this.$el.find('._multi').show();
            } else {
                this.$el.find('._multi').hide();
            }
        },
        
        render : function(){
            var template = app.tetris.TemplateManager.get(this.template, {});
            this.$el.html(template);

            this.resetUI();
            return this;
        },

        clearOldViewObject: function () {
            if (this.oGameView) this.oGameView.unbind();
            if (this.oGameView2) this.oGameView2.unbind();
            if (this.oGameView3) this.oGameView3.unbind();
        },
        
        show : function(){
            if(this.oGameView){
                this.oGameView.stop().unbind();
            }

            this.resetUI();
            this.$el.show();

            this.clearOldViewObject();
            this.initGame();
            this._renderScore();

            this.playUIAnimation(this.$el.find('._option'), 'rotateIn');
        },

        setGameEvents : function(){
            this.$el
                .off('touchstart mousedown', '.jpad', this._onTouchKeyPadWithContext)
                .on('touchstart mousedown', '.jpad', this._onTouchKeyPadWithContext);
        },

        bindModelEvents: function () {
            this.model.bind('change:sGameStatus', this.watchGameStatus, this);
            this.model.bind('change:htBlockPos', this.onBlockChange, this);
            this.model.bind('change:nScore', this._renderScore, this);
        },

        getGameType : function(){
            return this._sType;
        },
        
        isMultiGame : function(){
            return this.getGameType() === 'multi';
        },
        
        initGame : function(){
            this.model = new app.tetris.Game.Model();
            this.bindModelEvents();
            
            this.oGameView = new app.tetris.Game.View({
                el : '#single_game_area',
                model : this.model,
                bKeyEventBind : true,
                bUseSound : true
            });
            this.setGameEvents();
            
//            this.oGameView.useWebGL(true);

            if(this.isMultiGame()){
                this.openMultiGameMenu();
                
            } else {
                this.startTimer();
                this.oGameView.start();    
            }

            this.frontModel = new app.tetris.Game.Model();
            
            this.oFrontGameView = new app.tetris.Game.View({
                el : '#other_1_game_area',
                model : this.frontModel,
                bUseWebGL : false,
                bUseSound : false
            });

            this.backModel = new app.tetris.Game.Model();
            
            this.oBackGameView = new app.tetris.Game.View({
                el : '#other_2_game_area',
                model : this.backModel,
                bUseWebGL : false
            });

            var wel = $(this.$el);
            this._setGameEvents(wel);
        },

        runTick : function(){
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
            var welPlayTime = this.$el.find('._play_time')

            welPlayTime.html(sMin + ':' + sSec);
            this.playUIAnimation(welPlayTime, 'rubberBand', '.5');
        },
        
        _initTimer : function(){
            this.drawTime('00', '00');
            this.stopTimer();
        },
        
        startTimer : function(){
            var that = this;
            
            this.nGameStartTime = this.model.get('nGameStartTime');
            this.stopTimer();
            this.runTick();
            this.timer = setInterval(function(){
                that.runTick();
            },1000);
            
        },
        
        stopTimer : function(){
            clearTimeout(this.timer);
        },
        
        watchGameStatus : function(){
            var sGameStatus = this.model.get('sGameStatus');

            if(sGameStatus === 'start'){

            } else if(sGameStatus === 'play'){
                $('.field .pause').remove();
                this.startTimer();
            } else if(sGameStatus === 'pause'){
                this.stopTimer();
                
            } else if(sGameStatus === 'stop'){
                this._initTimer();
                this.openDimmedLayer('Hello TETRIS');
                
            } else if(sGameStatus === 'ready'){
                this.openDimmedLayer('Ready');
                
            } else if(sGameStatus === 'game'){
                this.openDimmedLayer('Already Started');
                
            } else if(sGameStatus === 'end'){
                this.stopTimer();
                this.openDimmedLayer();
                
                this.openGameMenu('Game Over');
                
            }else {
                this.stopTimer();
            }
        },
        
        logChat : function(sStr){
            var chatOld = $('.chat_area').html();
                
            $('.chat_area').html(chatOld + sStr + '<br>');
            $('.chat_area').scrollTop($('.chat_area')[0].scrollHeight);
        },
        
        _setGameEvents: function (wel) {
            wel.find('#start_btn').bind('click', $.proxy(this.oGameView.start, this.oGameView));
            wel.find('#stop_btn').bind('click', $.proxy(this.oGameView.stop, this.oGameView));
            wel.find('#ready_btn').bind('click', $.proxy(this.oGameView.reqReady, this.oGameView));
            wel.find('#cancel_btn').bind('click', $.proxy(this.oGameView.reqCancel, this.oGameView));
            wel.find('#start_touch').bind('click', $.proxy(this.oGameView.start, this.oGameView));

            wel.find('#debug_btn').bind('click', $.proxy(this.oGameView.debugStart, this.oGameView));
        },

        setUIEvents : function(){
            
            var wel = this.$el;
            
            wel.find('#ssamdi').on('click', $.proxy(function(){
                if(this._bWebGLOn === true){
                    this._bWebGLOn = false;
                } else {
                    this._bWebGLOn = true;
                }
            },this.oGameView));
            
            wel.find('#fullscreen_btn').bind('click', function(){
                var el = document.documentElement
                , rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen;
                rfs.call(el);
            });
            
            
            wel.find('#fullscreen_btn').bind('click', $.proxy(this._onClickFullScreen, this));


            this.$el.on('click', '._option', $.proxy(function(){
                this.openOptionMenu();
            }, this));
        },

        openOptionMenu : function(){
            var _onClickSetting = function(){
                app.tetris.ui.Option.View.show({
                    sTitle : 'Setting',
                    aList : [{sLabel : 'Setting1'}, {sLabel : 'Setting2'}, {sLabel : 'Back', fn : $.proxy(this.openOptionMenu, this)}]
                });
                
                return false;
            };

            var _onClickMenu = function(){
                app.tetris.Router.navigate('menu', {trigger : true});
            };

            var _onClickPause = function(){
                this.oGameView.pause();

                app.tetris.ui.Option.View.show({
                    sTitle: 'Pause',
                    aList : [
                        { sLabel : 'Continue', fn : $.proxy(function(){
                            this.startTimer();
                            this.oGameView.pause();
                        }, this)}
                    ]
                });
                return false;
            };

            var _onClickJoinMultiGame = function(){
                app.tetris.Router.navigate('menu', {trigger : true});
                app.tetris.Router.navigate('multi', {trigger : true});
                return false;
            };
            
            var _onClickRestart = function(){
                this.oGameView.start();
            };

            var aMenuList = [];
            if(this.isMultiGame()){
                aMenuList = [
                    { sLabel : 'Continue' },
                    { sLabel : 'Pause', fn : $.proxy(_onClickPause, this) },
                    { sLabel : 'Restart', fn : $.proxy(_onClickRestart, this)},
                    { sLabel : 'Re-join Multi Game', fn : $.proxy(_onClickJoinMultiGame, this) },
                    { sLabel : 'Setting', fn : $.proxy(_onClickSetting, this) },
                    { sLabel : 'Exit Multi Game', fn : $.proxy(_onClickMenu, this) }
                ];
            } else {
                aMenuList = [
                    { sLabel : 'Continue' },
                    { sLabel : 'Restart', fn : $.proxy(_onClickRestart, this)},
                    { sLabel : 'Pause', fn : $.proxy(_onClickPause, this) },
                    { sLabel : 'Join Multi Game', fn : $.proxy(_onClickJoinMultiGame, this) },
                    { sLabel : 'Setting', fn : $.proxy(_onClickSetting, this) },
                    { sLabel : 'Go to Menu', fn : $.proxy(_onClickMenu, this) }
                ];
            }
            
            app.tetris.ui.Option.View.show({
                aList : aMenuList
            });

            return false;
        },

        openGameMenu : function(sTitle){
            var _onClickReplay = function(){
                this.oGameView.start();
            };
            
            var _onClickJoinMultiGame = function(){
                app.tetris.Router.navigate('menu', {trigger : true});
                app.tetris.Router.navigate('multi', {trigger : true});
                return false;
            };

            var _onClickMenu = function(){
                app.tetris.Router.navigate('menu', {trigger : true});
            };

            var aMenuList = [];
            if(this.isMultiGame()){
                aMenuList = [
                    { sLabel : 'Re-Join Multi Game', fn : $.proxy(_onClickJoinMultiGame, this) },
                    { sLabel : 'Go to Menu', fn : $.proxy(_onClickMenu, this) }
                ];
            } else {
                aMenuList = [
                    { sLabel : 'Replay Game', fn : $.proxy(_onClickReplay, this) },
                    { sLabel : 'Join Multi Game', fn : $.proxy(_onClickJoinMultiGame, this) },
                    { sLabel : 'Go to Menu', fn : $.proxy(_onClickMenu, this) }
                ];
            }
            
            app.tetris.ui.Option.View.show({
                sTitle : sTitle || '',
                aList : aMenuList
            });
        },

        _onClickFullScreen : function(){
            if(that.bFullScreen == true){
                that.bFullScreen = false;
            } else {
                var el = document.documentElement
                    , rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen;
                rfs.call(el);
                that.bFullScreen = true;
            }

        },

        openDimmedLayer : function(string){
            string = string || '';
            $('.field .pause').remove();
            $('#_dimmed_section').html(
                '<div class="pause" style="z-index:50;width:100%;height:100%;background-color:rgba(0,0,0,.7);position:absolute;color:#FFF;font-size:27px;font-family:Tahoma;">'+
                    '<div style="margin:auto;width:100%;height:25px;text-align:center;margin-top:200px;">'+string+'</div></div>').show();
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
app.tetris.Game.Util = {

    isCollision : function(htBlockPos, oBlock, aMatrix, forward){
        var result = false
            , aBlock = oBlock.get('aMatrix')
            , nX, nY;

        for(var i = 0; i < aBlock.length; i++){
            for(var j = 0; j < aBlock[i].length; j++){

                nX = j + htBlockPos.nX;
                nY = i + htBlockPos.nY;

                if(forward === 'bottom'){
                    nY = nY + 1;
                } else if(forward === 'left' || forward === 'right'){
                    nX = (forward === 'left') ? nX - 1 : nX + 1;
                }

                if(aMatrix[nY] === undefined){
                    continue;
                }

                if(aMatrix[nY][nX] === undefined){
                    continue;
                }

                if(aMatrix[nY][nX].nFlag === 1 && aBlock[i][j] === 1){
                    result = true;
                    break;
                }
            }
        }

        return result;
    },

    rotateBlockArray : function(sType, oBlockModel, htBlockPos, aMatrix){
        var aBlock = oBlockModel.get('aMatrix'),
            sBlockCode = oBlockModel.get('sCode'),
            nBlockAngle = oBlockModel.get('nAngle');

        var aCopyMatrix = []
            , aClone
            , bRotate = false;

        if(sBlockCode !== 'O'){
            bRotate = true;
        }

        if(sBlockCode === 'S' || sBlockCode === 'I' || sBlockCode === 'Z') {
            if(nBlockAngle > 0){
                sType = 'left';
            }
        }

        if(bRotate === true){
            if(sType === 'right'){
                nBlockAngle = (nBlockAngle + 90) % 360;

                for(j = aBlock[0].length - 1; j >=0; j--){
                    aClone = [];
                    aClone.push(aBlock[3][j]);
                    for(i = 0; i < aBlock.length - 1; i++){
                        aClone.push(aBlock[i][j]);
                    }

                    aCopyMatrix.push(aClone);
                }
            } else {
                nBlockAngle = (nBlockAngle - 90) % 360;

                for(j = 1; j < aBlock.length; j++){
                    aClone = [];
                    for( i = aBlock[0].length - 1; i >=0; i--){
                        aClone.push(aBlock[i][j]);
                    }
                    aCopyMatrix.push(aClone);
                }

                aClone = [];
                for(var i = aBlock[0].length - 1; i >=0; i--){
                    aClone.push(aBlock[i][0]);
                }

                aCopyMatrix.push(aClone);
            }

            var oNewBlock = oBlockModel.clone().set('aMatrix', aCopyMatrix);

            if(!this.isCollision(htBlockPos, oNewBlock, aMatrix)){

                oBlockModel.set({
                    aMatrix : aCopyMatrix,
                    nAngle : nBlockAngle
                });
            }

        }


        return oBlockModel;
    }
};
app.tetris.Game.View = Backbone.View.extend({
	
	defaults : {
		oWebGLView : {},
		_bWebGLOn : false
	},

    initialize : function(options){
        this.assignProperties(options);
        this.render();
		this.initResources();
        this.resetData();
        this.useWebGL(this._bWebGLOn);
        this.initCanvas();

        if(this._bKeyEventBind){
            this.bindEvents();
        }
        
        this.drawMyStage();
	},
    
    assignProperties: function (options) {
        this.Util = app.tetris.Game.Util;

        this.oUIView = options.oUIView;
        this._bKeyEventBind = options.bKeyEventBind || false;
        this._bUseSound = options.bUseSound || false;
        this._bWebGLOn = options.bUseWebGL || false;
        this._fnKeyEvent = $.proxy(this._onKeyAction, this);
    },

    render : function(){
        var aCanvasStr = ['<canvas class="_tetris_webgl_canvas web_gl_cvs" style="width:100%;height:100%;"></canvas>',
            '<canvas class="_tetris_origin_canvas org_cvs" style="width:100%;height:100%;"> </canvas>'];
        
        this.$el.html(aCanvasStr.join(''));
    },

	/**
	 * 데이터 리셋
	 */
	resetData : function(){
		this.nTickCnt = 0;
		this.tickTime = 35;
		this.nLogicTickCnt = 0;
		
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
        this.htSound = {};

        if(!this._bUseSound){
            return;
        }

		this.htSound = {
            harddrop : new Howl({urls: ['../res/sound/TE_SE_harddrop.mp3'], volume: 0.3}),
            softdrop : new Howl({urls: ['../res/sound/TE_SE_softdrop.mp3'], volume: 0.3}),
            lockdown : new Howl({urls: ['../res/sound/TE_SE_lockdown.mp3'], volume: 0.3})
        };
	},


    disableSmoothing: function () {
        this.stage.ctx.imageSmoothingEnabled = false;
        this.stage.ctx.webkitImageSmoothingEnabled = false;
        this.stage.ctx.mozImageSmoothingEnabled = false;
    },
    
    assignCanvasSize: function () {
        this.nWidth = $(this.stage.elCanvas).width();
        this.nHeight = $(this.stage.elCanvas).height();

        this.stage.nWidth = this.nWidth;
        this.stage.nHeight = this.nHeight;

        $(this.stage.elCanvas)
            .attr('width', this.nWidth)
            .attr('height', this.nHeight);
    },
    
    /**
     * 전체 캔버스 이니셜라이저
     */
    initCanvas : function(){
        
        this.stage = this.getOriginCanvasObject();

        this.assignCanvasSize();

        if(this._bWebGLOn){
            $(this.stage.elCanvas).hide();
            this.$el.find('._tetris_webgl_canvas').show();

            this._bWebGLOn = this.oWebGLView.isAvailWebGL();
            
            if(this._bWebGLOn){
                
                console.log('1');
                this.oWebGLView.initCanvas();    
            }
            
        } else {
            this.$el.find('._tetris_webgl_canvas').hide();
            $(this.stage.elCanvas).show();
        }

        this.disableSmoothing();
    },

    /** 
	 * 사운드 제어 
	 */
	controlSound : function(sSoundType, sExcutor){

		if(!this.htSound[sSoundType] || !this._bUseSound){
			return false;
		}
		
		if(sExcutor === 'play'){
            this.htSound[sSoundType].play();

		} else if(sExcutor === 'stop'){
			this.htSound[sSoundType].pause();
		}
		
	},

	bindEvents : function(){
        var self = this;
        $(window).on('resize', function(){
            self.initCanvas();
        });
	},

	drawGhostBlock : function(){
		var htBlock = this.model.get('htBlockPos');
		var nY = 0;
		
		for(var i = 0; i < 35; i++){
			nY = htBlock.nY + i;
			if(this.Util.isCollision(
                {nX : htBlock.nX, nY : htBlock.nY + i}, 
                this.model.get('currentBlock'), 
                this.model.get('aMatrix'), 
                'bottom'
            )){
				this.drawMovingBlock(this.model.get('currentBlock'), {nX : htBlock.nX, nY : nY}, true);
				break;
			}
		}
	},
	
	drawMovingBlock : function(oBlockModel, htBlockPos, bIsGhost){
		htBlockPos = htBlockPos || this.model.get('htBlockPos');
        
		var aBlock = oBlockModel ? oBlockModel.get('aMatrix') : this.model.get('currentBlock').get('aMatrix')
        , sBlockColor = oBlockModel ? oBlockModel.get('sColor') : this.model.get('currentBlock').get('sColor')
		, stage = this.stage
		, nX, nY, bDraw;

		if(aBlock === undefined){
			return;
		}
		
		for(var i = 0; i < aBlock.length; i++){
			for(var j = 0; j < aBlock[i].length; j++){
				bDraw = false;
					
				if(aBlock[i][j] === 1){
					bDraw = true;	
				}
				
				if(this.debugMode && bDraw === false){
					sBlockColor = 'stone';
					bDraw = true;
				}
				
				if(bDraw){
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
		this.drawStage(this.stage, this.getMatrix());
		
		if(this.debugMode){
			this.drawDebugStage();
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

    drawToWebGL: function (nBlockSize, nX, nY, sColor, nOpacity) {
        var matrix = this.getMatrix(), nRows = matrix.length, nCols = matrix[0].length;
        var MoveX = ( (nCols - 1) * nBlockSize) / 2 - 10;
        var MoveY = ( (nRows + 1) / 2) * nBlockSize;
        var MoveZ = -50.0;
        this.oWebGLView.bCameraPerspective = true;
        this.oWebGLView.arCameraLookAt = [MoveX, MoveY, MoveZ];
        this.oWebGLView.drawBlock(nX, nRows - nY, nBlockSize, this.arColorPos[sColor], [1.0, 1.0, 1.0, nOpacity]);
    },

    drawToCanvas: function (nBlockSize, nX, nY, sColor, nOpacity, nTopMargin) {
        
        var ctx = this.stage.ctx;
        if (nTopMargin === undefined) {
            nTopMargin = this.stage.nHeight / 20;
        }

        var nBlockPosX = this.getPosPixelByColor(sColor, nBlockSize);
        ctx.globalAlpha = nOpacity;
        var RESIZE_W = this.stage.nWidth / 10;
        var RESIZE_H = this.stage.nHeight / 20;

        ctx.drawImage(this.blockImg[nBlockSize], nBlockPosX, 0, nBlockSize, nBlockSize, nX * RESIZE_W, nY * RESIZE_H - nTopMargin, RESIZE_W, RESIZE_H);
        ctx.globalAlpha = 1;
    },
    
    drawBlock : function(ctx, sColor, nBlockSize, nX, nY, nOpacity, nTopMargin){
		if(sColor === undefined || ctx === undefined){
			return false;
		}
		
		var bWebGLEnable = this._bWebGLOn;

		if(this.ctx){
			if( (ctx == this.stage.ctx) && (this.oWebGLView !== undefined) ){
				if(this._bWebGLOn === true){
					bWebGLEnable = true;
				} else {
					bWebGLEnable = false;
				}
			}
		}

		if(bWebGLEnable) {
            this.drawToWebGL(nBlockSize, nX, nY, sColor, nOpacity);
        } else {
            this.drawToCanvas(nBlockSize, nX, nY, sColor, nOpacity, nTopMargin);
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
		
		if( (stage.ctx == this.stage.ctx) && (this.oWebGLView !== undefined) ){
			if(this._bWebGLOn){
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
			.off('keydown keyup', this._fnKeyEvent)
			.on('keydown keyup', this._fnKeyEvent);
	},
	
	getGameStatus : function(){
		return this.model.get('sGameStatus');	
	},

    /**
     * @todo 로직 개선 & 리펙토링
     */
	checkLevelUp : function(){
        
        app.tetris.Rules.filterRules(this.model.get('nScore'), $.proxy(function(oLevel){
            this.model.set('nLogicSpeed', oLevel.nLogicSpeed);
            this.model.set("nLevel", oLevel.nLevel);
            
        }, this));
	},

    useWebGL : function(bFlag){
        
        this._bWebGLOn = bFlag;
        
        if(!this.oWebGLView){
            this.oWebGLView = new app.tetris.Game.WebGLView({
                el : this.$el.find('._tetris_webgl_canvas')
            });    
        }
        
        
        
        this.initCanvas();
    },
    
	renderCanvas : function(){
		this.drawMyStage();
		this.drawMovingBlock();
		this.drawGhostBlock();
	},
	
	tick : function(){
        this.checkLevelUp();
		this.renderCanvas();
		
		this.nTickCnt += this.tickTime;
		this.nLogicTickCnt += this.tickTime;
        var nLogicSpeed = this.model.get('nLogicSpeed');
        
		if(this.nLogicTickCnt > nLogicSpeed){
			this.setGameStatus('play');
			this.moveDown(true);
			this.nLogicTickCnt -= nLogicSpeed;
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

        this.stopAnimationLoop();
        this.startAnimationLoop();
        
		this.tick();

        if(this._bKeyEventBind){
            clearTimeout(this.keyLongPressChecker);
            this.bindKeyEvents();
        }
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
		if(this.model.get('sGameStatus') === 'pause'){
            $(document).off('keydown', this._fnKeyEvent);
			this.setGameStatus('play');
			this.startAnimationLoop();
		}else{
            this.stopAnimationLoop();
			this.setGameStatus('pause');
            if(this._bKeyEventBind){
                this.bindKeyEvents();    
            }
		}
	},
	
	/**
	 * Game 정지시킨다 
	 */
	stop : function(){
		this.setGameStatus('stop');
		$('.pause').remove();

        clearTimeout(this.keyLongPressChecker);
        cancelAnimationFrame(this.ticker);
		
		$(this.el).find('#active').remove();
		this.initMatrix();
		this.drawMyStage();
		this.resetData();
		
		$('#debug_area').empty().hide();

        $(document).off('keydown', this._fnKeyEvent);
        
        return this;
	},
	
	makeNewBlock : function(){
		var aBlocks = this.model.get('oBlockCollection');
		var nNumber = this.model.get('nextBlock').shift();
	
		if(this.isGameOver()){
			return false;
		}

        this.model.set('nextBlock', []);
        var nextBlock = this.model.get('nextBlock');
        nextBlock.push(this.model.getRandomRange());

        this.model.set('currentBlock', aBlocks.at(nNumber).clone());
		this.model.setBlockPosXY(4,-1);
	},
	
	moveDown : function(bPlaySound){
		if(this.checkGameOver()){
			return;
		}
		
		var htBlockPos = this.model.get('htBlockPos')
		, result = false
		, bChk = this.Util.isCollision(htBlockPos, this.model.get('currentBlock'), this.model.get('aMatrix'), 'bottom');
		
		if(!bChk){
			htBlockPos.nY++;
			this.model.set('htBlockPos', htBlockPos);
		}else{
            if(bPlaySound){
                this.controlSound('lockdown','play');
            }

            this.model.trigger('change:aMatrixCustomEvent');
            this.model.setBlockToMatrix(this.model.get('currentBlock'), this.model.get('htBlockPos'));
            this.makeNewBlock();
			result = true;
		}
		
		this.clearFullLine();
		
		if(this.debugMode){
			this.drawMyStage();
			this.drawMovingBlock();
		}
		
		return result;
	},
	
	clearFullLine : function(){
		var lineCount = this.model.clearFullLine();
		this._addScoreBy(lineCount);
	},
	
    _addScoreBy : function(lineCount){
        if(lineCount > 0){
            // Fast Drop give Bonus Point
            var nBonus = 0;
            if(this._nHardBlockPosY <= 2){
                nBonus = (this._nHardBlockPosY + 1) * 50;
            }
    
            this.model.plusScore(lineCount * 100 + nBonus);
        }
    },
    
	moveBlock : function(sDirection){
        var htBlockPos = this.model.get('htBlockPos');
        
        var bCollision = this.Util.isCollision(
            this.model.get('htBlockPos'), 
            this.model.get('currentBlock'), 
            this.model.get('aMatrix'), 
            sDirection);
        
		if(sDirection === 'left' && !bCollision){
            htBlockPos.nX--;
            this.model.set('htBlockPos', htBlockPos);
		} else if(sDirection === 'right' && !bCollision){
            htBlockPos.nX++;
            this.model.set('htBlockPos', htBlockPos);
		}
		
		if(this.debugMode) {
			this.drawMyStage();
			this.drawMovingBlock();
		}
	},
	
	setMatrix : function(matrix){
		this.model.setMatrix(matrix);
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
		var oBlockModel = this.Util.rotateBlockArray(
            sType,
            this.model.get('currentBlock'), 
            this.model.get('htBlockPos'), 
            this.model.get('aMatrix')
        );

        this.model.set('currentBlock', oBlockModel);

		if(this.debugMode) {
			this.drawMyStage();
			this.drawMovingBlock();
		}
	},
	
    isGameOver: function () {
        var matrix = this.getMatrix();
        var nCnt = 0;
        var nLen = this.model.get('nCols') + 1;
        
        for (var j = 1; j < nLen; j++) {
            if (matrix[0][j].nFlag == 1) {
                nCnt++;
            }
        }
        return nCnt > 0;
    },
    
    /**
	 * 게임 오버 상태를 체크하는 메서드 
	 */
	checkGameOver : function(){

		if(this.isGameOver()){
			$(this.el).find('#active').remove();
            this.stopAnimationLoop();
			this.setGameStatus('end');
			
			$(document).off('keydown', this._fnKeyEvent);
			
			return true;
		}

        return false;
	},

    clearLongPress: function () {
        clearInterval(this.keyLongPressChecker);
        this.nLongPressCnt = 0;
    },

    resetBlockPos: function (htBlockPos) {
        htBlockPos = this.model.get('htBlockPos');
        htBlockPos.nY = -1;
        this.model.set('htBlockPos', htBlockPos);
    },
    
    playBoundEffect: function () {
        if (!this._bWebGLOn) {
            this.$el
                .removeClass('bounceDrops animatedDrops')
                .addClass('bounceDrops animatedDrops')
                .show()
                .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                    $(this).removeClass('bounceDrops animatedDrops');
                });
        }
    },
    
    /**
	 * SpaceBar로 빠르게 블럭을 내린다 
	 */
	moveHardDown : function(){
        this.clearLongPress();

        this.playBoundEffect();
        
		this.controlSound('harddrop', 'play');

		var bIsCollision = false;
        
        this._nHardBlockPosY = this.model.get('htBlockPos').nY;
        
		for(var i = 0, nRows = this.model.get('nRows'); i < nRows; i++){
			if(bIsCollision === true){
                this.resetBlockPos();
                this.model.trigger('change:aMatrixCustomEvent');
                break;
			}else{
                var bPlaySound = false;
				bIsCollision = this.moveDown(bPlaySound);
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
			
//			this.keyLongPressChecker = setInterval($.proxy(function(){
//				this.nLongPressCnt++;
//                this.keyPressFlag = this.nLongPressCnt > 5;
//            }, this), 400);
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

    initialize : function(){
        this.vertexShaderText = WebGLUtil.loadShader('res/shader/model.vs');
        this.fragmentShaderText = WebGLUtil.loadShader('res/shader/model.fs');
    },

	isAvailWebGL : function(){
		return !!window.WebGLRenderingContext;
	},

	initCanvas : function(){
        
        
        var elCanvas = this.$el[0];

        
		this.nWidth = this.$el.parent().width();
		this.nHeight = this.$el.parent().height();
        
        this.$el.attr('width', this.nWidth);
        this.$el.attr('height', this.nHeight);
       
		this.arCameraEye = [0, 0, 0];
		this.arCameraLookAt = [0, 0, 0];
		this.fAngleYZ = 0.0;
		this.fAngleXZ = Math.PI / 2.0;
		this.fCameraDistance = 300.0;
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
        
        this.setEvents();
	},

    setEvents : function(){

        var that = this;
        this.forward = false;
        this.startX = 0;

        this._nMovedViewX = 0;
        this._nMovedViewY = 0;

        var _onMouseMove = function(e){
            if(this.mouseDownFlag){
                var w = welGlStage.width();
                var left = welGlStage.offset().left;
                var top = welGlStage.offset().top;
                var h = welGlStage.height();

                if( e.originalEvent.changedTouches){
                    e = e.originalEvent.changedTouches[0]
                } else {
                    e = e.originalEvent;
                }

                var x = e.clientX - left - this._nMovedViewX;
                var y = e.clientY - top - this._nMovedViewY;

                var deg = (x / w) * 180;
                this.fAngleXZ = deg * Math.PI/180;

                deg = (y / h) * 90;
                this.fAngleYZ = deg * Math.PI/180;

                this._nViewX = x;
                this._nViewY = y;
            }
        };

        this.flag = 0;
        this.startX = 350;
        var welGlStage = this.$el;

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
            that.fAngleXZ = deg * Math.PI/180;
        };

        //this.animation = setInterval(animatorFunc, 100);

        welGlStage.mousewheel(function(event, delta, deltaX, deltaY) {
            that.fCameraDistance += (delta * 10);
            return false;
        });

        var _onMouseMoveWithContext = $.proxy(_onMouseMove, this);

        welGlStage.on('mousedown touchstart', function(e){
            that.mouseDownFlag = true;
            $(document).on('touchmove mousemove', _onMouseMoveWithContext);
        });

        $(document).on('mouseup touchcancel touchend', $.proxy(function(e){
            this.mouseDownFlag = false;
            $(document).off('mousemove touchmove', _onMouseMoveWithContext);
        }, this));
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

	drawBlock : function(nPosX, nPosY, nBlockSize, nTexturePos, vColor){

		var gl = this.ctx;

		gl.useProgram(this.gl_Shader_RenderProgram);
		gl.enableVertexAttribArray(this.gl_Attribute_VertexPosition);
		gl.enableVertexAttribArray(this.gl_Attribute_VertexColor);
		gl.enableVertexAttribArray(this.gl_Attribute_VertexCordinate);


		var arCameraGap = [
            this.fCameraDistance * Math.cos(this.fAngleYZ) * Math.cos(this.fAngleXZ),	// X
            this.fCameraDistance * Math.sin(this.fAngleYZ),                             // Y
            this.fCameraDistance * Math.cos(this.fAngleYZ) * Math.sin(this.fAngleXZ)    // Z
        ];
        
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
        
        
		if(this.bCameraPerspective == true){
            mat4.perspective(this.nFov, this.nWidth/this.nHeight, 0.1, 1000.0, ProjectionMatrix);
            
        } else if(this.bCameraPerspective == false){
            mat4.ortho(-this.nWidth/2 , this.nWidth/2, -this.nHeight/2, this.nHeight/2, 0.1, 1000.0, ProjectionMatrix);
        }
        
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
app.tetris.Rules.filterRules = function(nScore, cb){

    var nLevel = 1;
    
    // DEFAULT SPEED
    var nLogicSpeed = 1500;
    
    // 50000 : level 6
    // 20000 : level 5
    // 10000 : level 4
    // 5000 : level 3
    // 1000 : level 2
    
    var aLevels = [
        {nLv : 8, nScore : 10000, nLogicSpeed : 100},
        {nLv : 7, nScore : 5000, nLogicSpeed : 150},
        {nLv : 6, nScore : 2500, nLogicSpeed : 200},
        {nLv : 5, nScore : 2000, nLogicSpeed : 300},
        {nLv : 4, nScore : 1500, nLogicSpeed : 400},
        {nLv : 3, nScore : 1000, nLogicSpeed : 600},
        {nLv : 2, nScore : 500, nLogicSpeed : 1000},
        {nLv : 1, nScore : 0, nLogicSpeed : 1500}
    ];
   
    var _getLevelBy = function(nScore){
        var aLevel = _.filter(aLevels, function(oLevel){
            return (oLevel.nScore <= nScore);
        });
        
        if(aLevel.length > 0){
            return aLevel[0];    
        }
    };

//    _getLevelBy(1000);
//    _getLevelBy(1500);
//    _getLevelBy(5000);
//    _getLevelBy(5500);
//    _getLevelBy(15500);
  
    cb(_getLevelBy(nScore));
};

/**
 * app.arBlockList
 */
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

        },
        
        hide : function(){
//            this.$el.hide();
            this.$el.addClass('animated').removeClass('fadeInDown').addClass('fadeOutUp');
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
//    return;

    app.tetris.Network.init();

    // initialize Singleton
    app.tetris.Router = app.tetris.Router.getInstance();
    app.tetris.Game.StageView = app.tetris.Game.StageView.getInstance();
    
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
            quick : "moveToQuickJoin",
            
            '':  'moveToStart'
        },

        execute: function(callback, args) {
            app.tetris.Account.Info.load();
            var sFrag = Backbone.history.fragment;

            if(!app.tetris.Account.Info.isAuthenticated() && sFrag !== 'login'){
                this.navigate('login', {trigger : true});
                app.tetris.Account.Network.io.emit('reqLogin', app.tetris.Account.Info.getAccount());
                return;
            }
            
            if (callback) callback.apply(this, args);
        },
        
        initialize : function(){
            this._welContainer = $('#_container');
            this._hideAllScreens();
        },

        _hideAllScreens : function(){
            this._welContainer.find('#_dimmed_section').hide();
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

        moveToQuickJoin : function(){
            this._hideAllScreens();
            t.ui.BackButton.show();

            t.Game.StageView.setType('multi');
            t.Game.StageView.show();
            t.Game.StageView.openMultiQuickJoin();
        },
        
        moveToSingleGame : function(){
            this._hideAllScreens();
            t.ui.BackButton.show();

            t.Game.StageView.setType('single');
            t.Game.StageView.show();
        },

        moveToMultiGame : function(){
            this._hideAllScreens();
            t.ui.BackButton.show();

            t.Game.StageView.setType('multi');
            t.Game.StageView.show();
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

        moveBack : function(){
            window.history.back();
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