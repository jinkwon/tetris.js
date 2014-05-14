(function(){



    var MenuView = Backbone.View.extend({
        el : '#_container #_menu_view',
        template : 'menu',
        
        events : {
            "click ._menu_item" : "onClickMenu"
        },

        initialize : function(){
            this.render();

            app.tetris.Network.Model.on('change:nConnectedUser', $.proxy(function(d, sValue){
                this.onChangeConnedUserCount(sValue);
            }, this));
        },
        
        onChangeConnedUserCount: function (sValue) {
            this.$el.find('._conn_user_cnt span').html(sValue);
            this.$el.find('._conn_user_cnt')
                .removeClass('pulse')
                .addClass('animated').addClass('pulse').show();
        },
    
        onClickMenu : function(we){
            var sMenuValue = $(we.currentTarget).attr('data-navigate');
            app.tetris.Router.navigate(sMenuValue, {trigger : true});
            return false;
        },
        
        show : function(){
            this.$el.show();
            this.$el.addClass('animated').removeClass('fadeOutUp').addClass('fadeInDown');
            this.$el.find('._welcome').addClass('animated').addClass('tada');
        },
        
        hide : function(){
//            this.$el.hide();
            this.$el.addClass('animated').removeClass('fadeInDown').addClass('fadeOutUp');

        },
        
        render : function(){
            var htVars = {
                sName : app.tetris.AccountInfo.userId,
                nConnectedUser : app.tetris.Network.Model.get('nConnectedUser')
            };
            
            TemplateManager.get(this.template, htVars, $.proxy(function(template){
                this.$el.html(template);
            }, this));
    
            return this;
        }
    });

    app.tetris.Menu.View = new MenuView();
})();