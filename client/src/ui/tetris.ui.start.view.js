(function(){

    var StartView = Backbone.View.extend({
        el : '#_container #_start',
        template : 'start',
    
        events : {
            "click ._menu_item" : "onClickMenu"
        },
    
        initialize : function(){
            this.render();
        },
    
        onClickMenu : function(we){
            return false;
        },
    
        show : function(){
            this.$el.show();
        },
        
        render : function(){
            TemplateManager.get(this.template, {}, $.proxy(function(template){
                this.$el.html(template);
            }, this));
            return this;
        }
    });

    app.tetris.ui.Start.View = new StartView();
})();