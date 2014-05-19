/**
 * 테트리스 데이터 모델
 * @author JK Lee
 */
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
        
        debugger;
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
