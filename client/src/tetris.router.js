(function () {
    
    var t = app.tetris;
    
    
    var TetrisRouter = Backbone.Router.extend({
    
        routes: {
            login : "moveToStart",
            menu : "moveToMenu",
            
            single : "moveToSingleGame",
            multi : "moveToMultiGame",
            board :'moveToGameBoard',
            credit : "moveToCredit",
            logout : "moveToLogout",
            
            '':  'moveToStart'
        },

        execute: function(callback, args) {
            var sFrag = Backbone.history.fragment;
            
            if(!app.tetris.Account.Info.isAuthenticated() && sFrag !== 'login'){
//                this.navigate('login', {trigger : true});
//                return;
            }
            
            if (callback) callback.apply(this, args);
        },
        
        initialize : function(){
            this._welContainer = $('#_container');
            
            this._hideAllScreens();
        },

        _hideAllScreens : function(){
            

            this._welContainer.find('._screen').hide();
            this._welContainer.removeClass('animated').removeClass('fadeInDown');

            t.ui.Header.View.hide();
            t.ui.Footer.View.hide();
            t.ui.BackButton.hide();
        },

        moveToStart : function(){
            this._hideAllScreens();
            t.Account.View.show();
        },

        moveToLogout : function(){
            app.tetris.Account.Info.clear();
            this.navigate('login', {trigger : true});
        },


        moveToMultiGame : function(){
            this._hideAllScreens();
            t.Menu.View.show();
        },
        
        moveToGameBoard : function(){
            this._hideAllScreens();
            
            
            t.Board.init();
            t.Board.View.show();

            t.ui.Header.View.changeTitle('GameBoard').show();
            t.ui.Footer.View.show();

            t.ui.BackButton.show();
        },

        moveToCredit : function(){
            this._hideAllScreens();
            t.Credit.View.show();
            t.ui.Header.View.changeTitle('Credit').show();
            
            t.ui.BackButton.show();
        },

        moveToSingleGame : function(){
            this._hideAllScreens();

            t.ui.BackButton.show();
            t.Game.StageView.show();
            
            // Game Init
            var oTetris = t.Game.init({
                sTargetId  : 'game_area',
                bUseWebGL : true
            });
            
            oTetris.on('ready', function(context){
                context.oGameView.show();
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

    
    t.Router.navigate(sNavigation, {trigger: true});    
    
})();