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
        var template = app.tetris.TemplateManager.get(this.template, {});
        this.$el.html(template).show();

        return this;
    }
});