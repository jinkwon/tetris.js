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

        show : function(){
            this.$el.hide().stop().fadeIn(300);
        },

        hide : function(){
            this.$el.hide();
        },

        moveToMenu : function(){
            app.tetris.Router.navigate('menu', {trigger : true});
        },

        render : function(){
            app.tetris.TemplateManager.get(this.template, {}, $.proxy(function(template){
                this.$el.html(template);
            }, this));

            return this;
        }
    });
    
    app.tetris.Board.View = new BoardView();
})();

    