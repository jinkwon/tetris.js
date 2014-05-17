
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

            var template = app.tetris.TemplateManager.get(this.template, {});
            this.$el.html(template);

            return this;
        }
    });

    app.tetris.ui.Footer.View = new FooterView();
})();