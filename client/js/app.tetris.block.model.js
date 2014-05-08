/**
 * app.tetris.BlockModel
 * @author JKLee 
 */
app.tetris.BlockModel = Backbone.Model.extend({
	defaults : function(){
		return {
			sColor :'',
			sCode : '',
			nAngle : 0,
			aMatrix : []
		}
	}
});

/**
 * app.arBlockList 
 */
app.arBlockList = (function(){
	
	var arObjBlock = [];
	
	arObjBlock[0] = new app.tetris.BlockModel({
		sColor :'yellow',
		sCode : 'O',
		nAngle : 0,
		aMatrix : [
			[0, 0, 0, 0],
			[0, 1, 1, 0],
			[0, 1, 1, 0],
			[0, 0, 0, 0]
		]
	});
	
	arObjBlock[1] = new app.tetris.BlockModel({
		sColor :'sky',
		sCode : 'I',
		nAngle : 0,
		aMatrix : [
			[0, 0, 0, 0],
			[1, 1, 1, 1],
			[0, 0, 0, 0],
			[0, 0, 0, 0]
		]
	});
	
	arObjBlock[2] = new app.tetris.BlockModel({
		sColor :'orange',
		sCode : 'L',
		nAngle : 0,
		aMatrix : [
			[0, 0, 0, 0],
			[0, 1, 1, 1],
			[0, 1, 0, 0],
			[0, 0, 0, 0]
		]
	});
	
	arObjBlock[3] = new app.tetris.BlockModel({
		sColor :'blue',
		sCode : 'J',
		nAngle : 0, 
		aMatrix : [
			[0, 0, 0, 0],
			[0, 1, 1, 1],
			[0, 0, 0, 1],
			[0, 0, 0, 0]
		]
	});
	
	arObjBlock[4] = new app.tetris.BlockModel({
		sColor :'green',
		sCode : 'S', 
		nAngle : 0,
		aMatrix : [
		[0, 0, 0, 0],
		[0, 0, 1, 1],
		[0, 1, 1, 0],
		[0, 0, 0, 0]
		]
	});
	
	arObjBlock[5] = new app.tetris.BlockModel({
		sColor :'red',
		sCode : 'Z',
		nAngle : 0,
		aMatrix : [
			[0, 0, 0, 0],
			[0, 1, 1, 0],
			[0, 0, 1, 1],
			[0, 0, 0, 0]
		]
	});
		
	arObjBlock[6] = new app.tetris.BlockModel({
		sColor :'purple', 
		sCode : 'T',
		nAngle : 0,
		aMatrix : [
			[0, 0, 0, 0],
			[0, 1, 1, 1],
			[0, 0, 1, 0],
			[0, 0, 0, 0]
		]
	});
	
	return arObjBlock;
})();