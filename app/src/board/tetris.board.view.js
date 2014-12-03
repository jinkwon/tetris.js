/**
 * GameView
 * @author JK Lee
 */
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

        initNetwork : function(){
            if(!app.tetris.io){
                return;
            }

            var oGameIo = app.tetris.io.of('/game');
            oGameIo.emit('reqScoreBoard');
            oGameIo.on('brScoreBoard', $.proxy(function(data){
                console.log('brScoreBoard');
                this.updateScoreDisplay(data.aScores);
            }, this));
        },

        updateScoreDisplay : function(aScores){
            var aScoresHtml = [];
            _.each(aScores, function(oScore, idx){
                aScoresHtml.push('<li>' + (idx+1) + ". " + oScore.userId +  ': '+ oScore.score);
            });

            this.$el.find('._score_list').html(aScoresHtml.join(""));
        },

        show : function(){
            this.$el.hide().stop().fadeIn(300);
            this.initNetwork();
        },

        hide : function(){
            this.$el.hide();
        },

        moveToMenu : function(){
            app.tetris.Router.navigate('menu', {trigger : true});
        },

        render : function(){
            var htVars = {};
            var template = app.tetris.TemplateManager.get(this.template, htVars);
            this.$el.html(template);
        }
    });

    app.tetris.Board.View = new BoardView();
})();

