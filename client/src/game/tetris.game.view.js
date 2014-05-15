/**
 * GameView
 * @author JK Lee
 */
app.tetris.Game.View = Backbone.View.extend({
	
	defaults : {
		oWebGLView : {},
		bWebGLOn : false
	},
    
	initialize : function(options){
		this.oWebGLView = options.oWebGLView;
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
			this.setTouchEvents();
		}
        
		var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/i) ? true : false );
		
		this.isMobile = iOS;
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
		this.htSound = {};
		var ext = 'mp3';
		if(buzz.isOGGSupported()){
			ext = 'ogg';
		}
		this.htSound['harddrop'] = new buzz.sound('../res/sound/TE_SE_harddrop.'+ext, {preload : true});
		this.htSound['softdrop'] = new buzz.sound('../res/sound/TE_SE_softdrop.'+ext, {preload : true});
		this.htSound['lockdown'] = new buzz.sound('../res/sound/TE_SE_lockdown.'+ext, {preload : true});
		this.htSound['bgm'] = new buzz.sound('sound/tetris_bgm.'+ext, {preload : true});
		
		this.htSound.harddrop.setVolume(80);
		this.htSound.bgm.setVolume(10);
	},
	
	/** 
	 * 사운드 제어 
	 */
	controlSound : function(sSoundType, sExcutor){
		
		if(!this.htSound[sSoundType]){
			return false;
		}
		
		if(sExcutor === 'play'){
			
			if(this.isMobile){
				this.htSound[sSoundType].stop().play();
			} else {
				this.htSound[sSoundType].load().play();	
			}
				
		} else if(sExcutor === 'stop'){
			this.htSound[sSoundType].stop();
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
			
			var x = that.startX - $('#game_area2').offset().left;
				var w = $('#game_area2').width();
				var deg = (x / w) * 180;
				that.oWebGLView.fAngleXZ = deg * Math.PI/180;
				
				
		};
		
		//this.animation = setInterval(animatorFunc, 100);
		
		$('#game_area2').mousewheel(function(event, delta, deltaX, deltaY) {
		    
			that.oWebGLView.fCameraDistance += (delta * 10);
		    
		    return false;
		});

		$('#game_area2').on('mousedown', function(e){
			that.mouseDownFlag = true;
			
			$(this).off('mousemove', _onMouseMove);
			$(this).on('mousemove', _onMouseMove);
			
		});
		
		$(document).on('mouseup', function(e){
			that.mouseDownFlag = false;
			$('#game_area2').off('mousemove', _onMouseMove);
		});
		
	},
	
	/**
	 * DOM 렌더링 
	 */
	renderDOM : function(){
		var nScore = this.model.get('nScore');
		$('.score').empty().html(nScore + '점');
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
		var htOtherStage = this.getCanvasObject(sId);
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
	getCanvasObject : function(sId){
		var canvas = document.getElementById(sId);
		
		if(sId === 'game_area'){
			nBlockSize = this.model.get('nBlockPixel');
		} else {
			nBlockSize = 10;
		}
		
		if(canvas === null){
			return false;
		}
		return {
			sId : sId,
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
			stage : this.getCanvasObject('game_area'),
			others : [
				this.getCanvasObject('other_1'),
				this.getCanvasObject('other_2'),
				this.getCanvasObject('other_3'),
				this.getCanvasObject('other_4'),
				this.getCanvasObject('other_5')
			] 
		};
		
		this.nWidth = this.ctx.stage.width;
		this.nHeight = this.ctx.stage.height;
		
		if(this.oWebGLView.isAvailWebGL()){
			this.oWebGLView.initCanvas();	
			
			this.oWebGLView.fAngleYZ = Math.PI/180 * 0;
			this.oWebGLView.fAngleXZ = Math.PI/180 * 90;
			
			this.oWebGLView.fCameraDistance = 620.0;
			
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
	
	setKeyEvents : function(){
		
		this.htKeyState = {};

		$(document)
			.unbind('keydown keyup', this._fnKeyEvent)
			.bind('keydown keyup', this._fnKeyEvent);
	},
	
	setTouchEvents : function(){
		
		$('.jpad').on('touchstart mousedown', $.proxy(function(e){
	        e.stopPropagation();
    		e.preventDefault();
    		
    		
    		if(this.getGameStatus() !== 'play'){
            	return false;
            }
            
	        if(e.handled !== true) {
		        var id = $(e.currentTarget).attr('id');    
	
				if(id === 'down'){
					this.moveDown();
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

	checkLevelUp : function(){
		
		if(this.model.get('nScore') >= 400 && this.level < 2){
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
			this.moveDown();
			this.checkLevelUp();
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
		
		this.controlSound('bgm', 'play');
		
		var wel = $(this.el);
		
		if(bRealGame){
			wel.find('#start_btn').hide();
			wel.find('#stop_btn').hide();
			wel.find('#cancel_btn').hide();
			this.bRealGame = true;
		}else{
			wel.find('#start_btn').hide();
			wel.find('#stop_btn').show();
			this.bRealGame = false;
		}
		
		this.resetData();
		this.setGameStatus('start');
		
		this.nextBlock = [];
		for(var i = 0; i <= 5; i++){
			this.nextBlock.push(this.model.getRandomRange());	
		}
		
		this.makeNewBlock();
		this.setKeyEvents();

        this.startAnimationLoop();
        
		this.tick();
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
		
		this.nextBlock = [];
		
		for(var i = 0; i <= 5; i++){
			this.nextBlock.push(this.model.getRandomRange());	
		}
		
		this.makeNewBlock();
		this.setKeyEvents();
		this.drawMyStage();
	},
	
	pause : function(){
		if(this.model.get('sGameStatus') == 'pause'){
			$('.field .pause').remove();
			this.setGameStatus('play');
			this.timer = setInterval($.proxy(this.tick, this), this.tickTime);
		}else{
			clearTimeout(this.timer);
			this.createDimmedLayer('Pause');
			this.setGameStatus('pause');
		}
	},
	
	/**
	 * Game 정지시킨다 
	 */
	stop : function(){
		$(document).unbind('keydown', $.proxy(this._onKeyAction, this));

		this.setGameStatus('stop');
		this.controlSound('bgm', 'stop');
		$('.pause').remove();

        cancelAnimationFrame(this.ticker);
		
		$(this.el).find('#active').remove();
		this.initMatrix();
		this.drawMyStage();
		this.resetData();
		
		this.createDimmedLayer('Hello TETRIS');
		
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
				
		this.createDimmedLayer('Ready');
		this.oGameIo.emit('reqReady');		
	},
	
	resReady : function(htData){
		if(htData.sStatus === 'ok'){

		}else if(htData.sStatus === 'game'){
			var wel = $(this.el);
			wel.find('#start_btn').show();
			wel.find('#ready_btn').show();
			wel.find('#cancel_btn').hide();
			wel.find('#stop_btn').show();
			
			this.createDimmedLayer('Already Started');
		}else{
			var wel = $(this.el);
			wel.find('#start_btn').show();
			wel.find('#ready_btn').show();
			wel.find('#cancel_btn').hide();
			wel.find('#stop_btn').show();
			
			alert('resReady에서 오류가 났습니다.')
			this.createDimmedLayer('Try again');
		}
	},
	
	reqCancel : function(){
		var wel = $(this.el);
		wel.find('#start_btn').show();
		wel.find('#ready_btn').show();
		wel.find('#cancel_btn').hide();
		wel.find('#stop_btn').hide();
				
		this.oGameIo.emit('reqCancel');
		this.createDimmedLayer('Hello TETRIS');
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
		var nNumber = this.nextBlock.shift();
	
		if(this.checkGameOver()){
			return false;
		}
		
		this.nextBlock.push(this.model.getRandomRange());
		
		this.aBlock = aBlocks.at(nNumber).get('aMatrix');
		this.sBlockCode = aBlocks.at(nNumber).get('sCode');
		this.sBlockColor = aBlocks.at(nNumber).get('sColor');
		this.nBlockAngle = aBlocks.at(nNumber).get('nAngle');
		
		this.model.setBlockPosXY(4,-1);
		this.drawNextBlock();
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
	
	moveDown : function(){
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
			this.createDimmedLayer('Game Over');
			
			$(document).unbind('keydown', $.proxy(this.keyAction, this));
			
			this.htSound.bgm.stop();
			
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
        
		setTimeout($.proxy(this.controlSound('harddrop', 'play'), this));
		
		var rst = false;
		for(var i = 0, nRows = this.model.get('nRows'); i < nRows; i++){
			if(rst == true){
				this.model.get('htBlockPos').nY = -1;
				break;
			}else{
				rst = this.moveDown();
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
			this.moveDown();
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
	
	/**
	 * 다음 블럭을 그린다 
	 */
	drawNextBlock : function(){
		var aBlocks = this.model.get('oBlockCollection');
		var nBlock = this.nextBlock[0];
        
		var sBlock = this.getBlockString(aBlocks.at(nBlock).get('aMatrix'), aBlocks.at(nBlock).get('sColor'), 16, 'next');
		
		$('.next_block_container').empty().append(sBlock);
		$('.next_group_block_container').empty();
		
		for(var i = 0; i < 3; i++){
			nBlock = this.nextBlock[i+1];
			var sBlock = this.getBlockString(aBlocks.at(nBlock).get('aMatrix'), aBlocks.at(nBlock).get('sColor'), 12, 'next_'+i);
			$('.next_group_block_container').append(sBlock + '<div style="clear:both;height:43px;"></div>');	
		}
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
	},
	
	/**
	 * 딤드 레이어 생성용 메서드 
 	 * @param {String} string
	 */
	createDimmedLayer : function(string){
		$('.field .pause').remove();
		$('.field').prepend(
			'<div class="pause" style="z-index:500;width:100%;height:448px;background-color:rgba(0,0,0,.7);position:absolute;color:#FFF;font-size:27px;font-family:Tahoma;">'+
			'<div style="margin:auto;width:100%;height:25px;text-align:center;margin-top:200px;">'+string+'</div></div>');
			
		// $('#other_1').parent().find('.pause').remove();
		// $('#other_1').parent().prepend(
			// '<div class="pause" style="z-index:500;width:100px;height:200px;margin:13px;margin-top:15px;background-color:rgba(0,0,0,.7);position:absolute;color:#FFF;font-size:27px;font-family:Tahoma;">'+
			// '<div style="margin:auto;width:100%;height:25px;text-align:center;margin-top:70px;">'+string+'</div></div>');
	}

});