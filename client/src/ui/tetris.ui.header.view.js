
(function(){
    
var HeaderView = Backbone.View.extend({
    el : '#_container #_header',
    template : 'ui/header',

    events : {
        "click ._menu_item" : "onClickMenu"
    },


    initialize : function(){
        this.setEvents();
        this.render();
    },
    
    setEvents: function () {
        this.model.bind('change', $.proxy(this.render, this));
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
        var htVars = {
            connectedUser : this.model.get('connectedUser')
        };
        
        TemplateManager.get(this.template, htVars, $.proxy(function(template){
            this.$el.html(template);
        }, this));

        return this;
    }
});

    app.tetris.ui.Header.View = new HeaderView({model  : app.tetris.Network.Model});
})();