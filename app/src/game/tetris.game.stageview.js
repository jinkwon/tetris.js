(function(){
var StageView = Backbone.View.extend({
    el : '#_container #_single_view',
    template : 'stage/stage.mobile',

    events : {
        'click ._option' : 'openOptionMenu'
    },

    initialize : function(){
        this.render();
        this._setViewProperties();
        this._initTimer();
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
            app.tetris.ui.Option.View.hide();
            this._startNetworkGame(htData);
        }, this);

        this._onBroadCastGameInfo = $.proxy(this._onWisper, this);
    },

    _onWisper : function(htData){
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
    },

    _startNetworkGame : function(htData){
        this._sRoomId = htData.sRoomId;

        this.model
            .off('change:nScore', this._onChangeModel)
            .off('change:aMatrixCustomEvent', this._onChangeModel);

        this.model
            .on('change:nScore', this._onChangeModel)
            .on('change:aMatrixCustomEvent', this._onChangeModel);

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

        app.tetris.io.removeListener('brGameInfo', this._onBroadCastGameInfo);
        app.tetris.io.addListener('brGameInfo', this._onBroadCastGameInfo);

        this.backModel.on('change:nScore change:aMatrix', $.proxy(function(){
            var wel = $('._back_user_info');

            this.oBackGameView.drawMyStage();
            this.renderOtherStage(wel, this.backModel);

            if(this.backModel.get('sUserId') === this.frontModel.get('sUserId')){
                this.frontModel.initVal();
            }

        }, this));

        this.frontModel.on('change:nScore change:aMatrix', $.proxy(function(){
            var wel = $('._front_user_info');

            this.oFrontGameView.drawMyStage();
            this.renderOtherStage(wel, this.frontModel);

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

    openOptionMenu : function(){
        var _onClickSetting = function(){

            var aMenuList = [{sLabel : 'Back', fn : $.proxy(this.openOptionMenu, this)}];

            if(app.tetris.Game.Util.isWebGLAvailable()){
                aMenuList.unshift({
                    sLabel : 'Use WebGL',
                    fn : $.proxy(function(){
                        if(this.oGameView){
                            this.oGameView.useWebGL(true);
                        }
                }, this)}
                );
            }

            app.tetris.ui.Option.View.show({
                sTitle : 'Setting',
                aList : aMenuList
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