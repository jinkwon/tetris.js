/**
 * GameView
 * @author JK Lee
 */
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