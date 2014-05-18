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
            

            
            this._initTimer();





//            onChange : function(){
//            change:nScore
//            chnage:aMatrix
//
//                var htData = {
//                    sGuid : this.model.get('sGuid'),
//                    aMatrix : this.model.get('aMatrix'),
//                    nScore : this.model.get('nScore')
//                };
//                this.oGameIo.emit('sendGameInfo', htData);
//            }

            this.setUIEvents();
            
            this.render();

        },

        _renderScore : function(){
            var nScore = this.model.get('nScore');

            this.$el.find('.score')
                .empty()
                .html(nScore)
                .parent().removeClass('animated pulse').addClass('animated pulse').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                    $(this).removeClass('animated pulse');
                });
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

            if(this.drawNextGroupBlock){
                $('.next_group_block_container').empty();

                for(var i = 0; i < 3; i++){
                    nBlock = this.model.get('nextBlock')[i+1];
                    var sBlock = this.getBlockString(aBlocks.at(nBlock).get('aMatrix'), aBlocks.at(nBlock).get('sColor'), 12, 'next_'+i);
                    $('.next_group_block_container').append(sBlock + '<div style="clear:both;height:43px;"></div>');
                }
            }

            $('._next_block')
                .removeClass('animated fadeInDown').addClass('animated fadeInDown').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                    $(this).removeClass('animated fadeInDown');
                });

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
        
        show : function(){
        
            this.$el.show();

            if(this.oGameView){
                this.oGameView.unbind();
            }

            this.initGame();
            this._renderScore();
        },

        initGame : function(){
            this.model = new app.tetris.Game.Model();
            this.model.bind('change:sGameStatus', this.watchGameStatus, this);
            this.model.bind('change:htBlockPos', this.onBlockChange, this);
            this.model.bind('change:nScore', this._renderScore, this);
            this.model.bind('change:nScore change:htBlockPos', function(){
                console.log('sendData');
            });

            this.oGameView = new app.tetris.Game.View({
                el : '#single_game_area',
                model : this.model,
                bEventBind : true,
                bUseWebGL : false,
                bUseSound : true
            });

            this.startTimer();
            this.oGameView.start();


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
//
//                $('#other_1_game_area').parent().removeClass('tada').hide().addClass('tada').show();
//            }, 2000);
//
//            setInterval(function(){
//                $('#other_2_game_area').parent().removeClass('tada').hide().addClass('tada').show();
//            }, 3000);


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
            this.$el.find('._play_time')
                .html(sMin + ':' + sSec)
                .removeClass('animated05 rubberBand').addClass('animated05 rubberBand').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                    $(this).removeClass('animated05 rubberBand');
                });
        },
        
        _initTimer : function(){
            this.drawTime('00', '00');
            this.stopTimer();
        },
        
        startTimer : function(){
            var that = this;
            
            this.nGameStartTime = this.model.get('nGameStartTime');
            this.stopTimer();
            this.excuteTick();
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
                this.openDimmedLayer('Game Over');
                
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
            wel.find('#stop_btn').bind('click', $.proxy(this.oGameView.stop, this.oGameView));
            wel.find('#ready_btn').bind('click', $.proxy(this.oGameView.reqReady, this.oGameView));
            wel.find('#cancel_btn').bind('click', $.proxy(this.oGameView.reqCancel, this.oGameView));
            wel.find('#start_touch').bind('click', $.proxy(this.oGameView.start, this.oGameView));

            wel.find('#debug_btn').bind('click', $.proxy(this.oGameView.debugStart, this.oGameView));
        },

        setUIEvents : function(){
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
            
            var wel = this.$el;
            
            
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
            
            
            wel.find('#fullscreen_btn').bind('click', $.proxy(this._onClickFullScreen, this));


            this.$el.on('click', '._option', $.proxy(function(){
                this.openMenu();

            }, this));
        },

        openMenu : function(){

            var _onClickSetting = function(){
                app.tetris.ui.Option.View.show({
                    aList : [{sLabel : 'test'}, {sLabel : 'test2'}, {sLabel : 'Back', fn : $.proxy(this.openMenu, this)}]
                });
            };

            var _onClickMenu = function(){
                app.tetris.Router.navigate('menu', {trigger : true});
            };

            var _onClickPause = function(){
                this.oGameView.pause();
            };

            app.tetris.ui.Option.View.show({
                aList : [
                    { sLabel : 'Continue' },
                    { sLabel : 'Pause', fn : $.proxy(_onClickPause, this) },
                    { sLabel : 'Setting', fn : $.proxy(_onClickSetting, this) },
                    { sLabel : 'Menu', fn : $.proxy(_onClickMenu, this) }
                ]
            });

            return false;
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