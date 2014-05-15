
(function(){

    var FooterView = Backbone.View.extend({
        el : '#_container #_footer',
        template : 'ui/footer',
    
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
        
        hide : function(){
            this.$el.hide();
        },
        
        render : function(){

            app.tetris.TemplateManager.get(this.template, {}, $.proxy(function(template){
                this.$el.html(template);
            }, this));
            return this;
        }
    });

    app.tetris.ui.Footer.View = new FooterView();
})();