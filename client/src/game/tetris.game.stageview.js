(function(){

    var StageView = Backbone.View.extend({
        el : '#_container #_single_view',
        template : 'stage/stage.mobile',
        
        initialize : function(){
            this.focusMenu('tip');
            
            this.model = new app.tetris.Game.Model();
            
            this._initTimer();
            this.model.bind('change:sGameStatus', this.watchGameStatus, this);
    
            this.setEvents();
            
            $("#slides").slides({
                pagination: false,
                generatePagination : false,
                start: 1,
                effect: 'slide',
                slideSpeed: 500,
                play: 2500,
                pause: 0
            });
            
            this.render();
        },
    
        render : function(){
            app.tetris.TemplateManager.get(this.template, {}, $.proxy(function(template){
                this.$el.html(template);
            }, this));
    
            return this;
        },
        
        show : function(){
        
            this.$el.show();

            this.oGameView = new app.tetris.Game.View({
                el : $('#game_area'),
                model : this.model,
                bEventBind : true,
                bUseWebGL : false,
                oWebGLView : new app.tetris.Game.WebGLView()
            });

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

    app.tetris.Game.StageView = new StageView();

})();