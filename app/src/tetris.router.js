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
            quick : "moveToQuickJoin",
            
            '':  'moveToStart'
        },

        execute: function(callback, args) {
            app.tetris.Account.Info.load();
            var sFrag = Backbone.history.fragment;

            if(!app.tetris.Account.Info.isAuthenticated() && sFrag !== 'login'){
                this.navigate('login', {trigger : true});
                app.tetris.Account.Network.io.emit('reqLogin', app.tetris.Account.Info.getAccount());
                return;
            }
            
            if (callback) callback.apply(this, args);
        },
        
        initialize : function(){
            this._welContainer = $('#_container');
            this._hideAllScreens();
        },

        _hideAllScreens : function(){
            this._welContainer.find('#_dimmed_section').hide();
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

        moveToQuickJoin : function(){
            this._hideAllScreens();
            t.ui.BackButton.show();

            t.Game.StageView.setType('multi');
            t.Game.StageView.show();
            t.Game.StageView.openMultiQuickJoin();
        },
        
        moveToSingleGame : function(){
            this._hideAllScreens();
            t.ui.BackButton.show();

            t.Game.StageView.setType('single');
            t.Game.StageView.show();
        },

        moveToMultiGame : function(){
            this._hideAllScreens();
            t.ui.BackButton.show();

            t.Game.StageView.setType('multi');
            t.Game.StageView.show();
        },
        
        moveToGameBoard : function(){

            this._hideAllScreens();
            
            t.Board.init();
            t.Board.View.show();
            t.ui.Header.View.changeTitle('ScoreBoard').show();
            t.ui.Footer.View.show();
            t.ui.BackButton.show();
        },

        moveToCredit : function(){
            this._hideAllScreens();
            t.Credit.View.show();
            t.ui.Header.View.changeTitle('Credit').show();
            t.ui.BackButton.show();
        },

        moveBack : function(){
            window.history.back();
        },

        moveToMenu : function(){
            this._hideAllScreens();
            t.Menu.View.show();
        }
    });

    // Router is singleton
    app.tetris.Router = {
        _oInstance : null,
        getInstance : function() {
            if (this._oInstance === null) {
                this._oInstance = new TetrisRouter();
            }

            return this._oInstance;
        }
    };
})();