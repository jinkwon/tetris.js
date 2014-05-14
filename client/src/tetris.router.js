(function () {

    
    var t = app.tetris;
    
    var TetrisRouter = Backbone.Router.extend({
    
        routes: {
            '' : 'moveToMenu',
            menu : "moveToMenu",
            singleGame : "moveToSingleGame",
            multiGame : "moveToMultiGame",
            credit : "moveToCredit",
            board :'moveToGameBoard',
            '*path':  'moveToIndex'
        },
    
        initialize : function(){
            this._hideAllScreens();
        },

        _hideAllScreens : function(){
            var welContainer = $('#_container');

            welContainer.find('._screen').hide();
            welContainer.removeClass('animated').removeClass('fadeInDown');

            t.ui.Header.View.hide();
            t.ui.Footer.View.hide();
            t.ui.BackButton.hide();
        },

        before: function () {
            console.log('before');
        },
        after: function () {
            console.log('after');
        },

        

        moveToIndex : function(){
            this._hideAllScreens();


//            t.Menu.View.show();
        },
        
        moveToCredit : function(){

;
            t.Menu.View.hide();

            t.Credit.View.show();

            t.ui.BackButton.show();
        },
        
        moveToMultiGame : function(){
            this._hideAllScreens();
            t.Menu.View.show();
        },

        moveToGameBoard : function(){
            this._hideAllScreens();
            t.Board.init();
            t.Board.View.show();

            t.ui.Header.View.show();
            t.ui.Footer.View.show();
        },

        moveToSingleGame : function(){
            this._hideAllScreens();
            new t.Menu.View();
            
            var oTetris = t.game({
                sTargetId  : 'app',
                bUseWebGL : iOS ? false : false
            });
        },

        moveToMenu : function(){
            this._hideAllScreens();
            t.Menu.View.show();
        }
    });

    t.Router = new TetrisRouter();
    Backbone.history.start();

    var sNavigation = Backbone.history.fragment ? Backbone.history.fragment : false;
    
    if(sNavigation){
        t.Router.navigate(sNavigation, {trigger: true});    
    }
    
})();