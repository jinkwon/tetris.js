app.tetris.ui.Option.View = Backbone.View.extend({
    el : '#_container #_option',
    template : 'ui/option',

    events : {

        "click ._menu_item" : "onClickMenu"
    },

    initialize : function(){
        this.render();
    },

    onClickMenu : function(we){
        return false;
    },

    render : function(){
        TemplateManager.get(this.template, {}, $.proxy(function(template){
            this.$el.html(template).show();
        }, this));
        return this;
    }
});