(function(){

    var StageView = Backbone.View.extend({
        el : '#_container #_single_view',
        template : 'stage/stage.mobile',


        initialize : function(){
            this._setViewProperties();
            this._initTimer();
            this.setUIEvents();
            this.setLogicEvents();
            this.render();
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
//            onChange : function(){
//            change:nScore
//            chnage:aMatrix
//                var htData = {
//                    sGuid : this.model.get('sGuid'),
//                    aMatrix : this.model.get('aMatrix'),
//                    nScore : this.model.get('nScore')
//                };
//                this.oGameIo.emit('sendGameInfo', htData);
//            }

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

        render : function(){
            var template = app.tetris.TemplateManager.get(this.template, {});
            this.$el.html(template);
            if(app.tetris.Util.isMobile()){
                $('._mobile').show();
            } else {
                $('._mobile').hide();
            }

            return this;
        },

        clearOldViewObject: function () {
            if (this.oGameView) {
                this.oGameView.unbind();
            }

            if (this.oGameView2) {
                this.oGameView2.unbind();
            }

            if (this.oGameView3) {
                this.oGameView3.unbind();
            }
        },
        
        show : function(){
            if(this.oGameView){
                this.oGameView.stop().unbind();
            }

            if(this._sType === 'multi'){
                this.$el.find('._multi').show();
            } else {
                this.$el.find('._multi').hide();
            }
            
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
            this.model.bind('change:nScore change:htBlockPos', function () {
                console.log('sendData');
            });
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
            
            this.oGameView.useWebGL(true);

            if(this.isMultiGame()){
                this.openMultiGameMenu('Multi Game');
                
            } else {
                this.startTimer();
                this.oGameView.start();    
            }
            

            this.oGameView2 = new app.tetris.Game.View({
                el : '#other_1_game_area',
                model : new app.tetris.Game.Model(),
                bUseWebGL : false,
                bUseSound : false
            });

            this.oGameView3 = new app.tetris.Game.View({
                el : '#other_2_game_area',
                model : new app.tetris.Game.Model(),
                bUseWebGL : false
            });

//            setInterval(function(){
//                $('#other_1_game_area').parent().removeClass('tada').hide().addClass('tada').show();
//            }, 2000);
//            setInterval(function(){
//                $('#other_2_game_area').parent().removeClass('tada').hide().addClass('tada').show();
//            }, 3000);

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
                this.openDimmedLayer('Pause');
                
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
                    aList : [{sLabel : 'test'}, {sLabel : 'test2'}, {sLabel : 'Back', fn : $.proxy(this.openOptionMenu, this)}]
                });
                
                return false;
            };

            var _onClickMenu = function(){
                app.tetris.Router.navigate('menu', {trigger : true});
            };

            var _onClickPause = function(){
                this.oGameView.pause();
            };

            var _onClickRestart = function(){
                this.oGameView.start();
            };
            
            app.tetris.ui.Option.View.show({
                aList : [
                    { sLabel : 'Continue' },
                    { sLabel : 'Restart', fn : $.proxy(_onClickRestart, this)},
                    { sLabel : 'Pause', fn : $.proxy(_onClickPause, this) },
                    { sLabel : 'Setting', fn : $.proxy(_onClickSetting, this) },
                    { sLabel : 'Go to Menu', fn : $.proxy(_onClickMenu, this) }
                ]
            });

            return false;
        },

        openGameMenu : function(sTitle){
            var _onClickReplay = function(){
                this.oGameView.start();
            };
            
            var _onClickJoinMultiGame = function(){
                
            };

            var _onClickMenu = function(){
                app.tetris.Router.navigate('menu', {trigger : true});
            };
            
            app.tetris.ui.Option.View.show({
                sTitle : sTitle || '',
                aList : [
                    { sLabel : 'Replay Game', fn : $.proxy(_onClickReplay, this) },
                    { sLabel : 'Join Multi Game', fn : $.proxy(_onClickJoinMultiGame, this) },
                    { sLabel : 'Go to Menu', fn : $.proxy(_onClickMenu, this) }
                ]
            });
        },
        
        openMultiGameMenu : function(sTitle){
            var _onClickQuickGame = function(){

                app.tetris.Game.Network.oGameIo.emit('reqQuickGame', {});
            };

            var _onClickMenu = function(){
                app.tetris.Router.navigate('menu', {trigger : true});
            };

            app.tetris.ui.Option.View.show({
                sTitle : sTitle || '',
                aList : [
                    { sLabel : 'Quick Game', fn : $.proxy(_onClickQuickGame, this) },
                    { sLabel : 'Go to Menu', fn : $.proxy(_onClickMenu, this) }
                ]
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