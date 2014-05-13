(function(){



    var MenuView = Backbone.View.extend({
        el : '#_container #_menu_view',
        template : 'menu',
        
        events : {
            "click ._menu_item" : "onClickMenu"
        },
        
        initialize : function(){
            this.render();
        },
    
        onClickMenu : function(we){
            var sMenuValue = $(we.currentTarget).attr('data-navigate');
            app.tetris.Router.navigate(sMenuValue, {trigger : true});
            
            return false;
        },
        
        show : function(){
            this.$el.hide().stop().fadeIn(300);
        },
        
        hide : function(){
            this.$el.show().fadeOut(1000);
        },
        
        render : function(){
            TemplateManager.get(this.template, { sName : 'JK'}, $.proxy(function(template){
                this.$el.html(template);
            }, this));
    
            return this;
        }
    });

    app.tetris.Menu.View = new MenuView();
})();