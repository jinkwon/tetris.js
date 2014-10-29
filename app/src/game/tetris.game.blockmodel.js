/**
 * app.tetris.BlockModel
 * @author JKLee 
 */
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