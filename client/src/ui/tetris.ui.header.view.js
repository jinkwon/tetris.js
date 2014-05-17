
(function(){
    
var DEFAULT_STR = 'HEADER';
    
var HeaderView = Backbone.View.extend({
    el : '#_container #_header',
    template : 'ui/header',

    events : {
        "click ._menu_item" : "onClickMenu"
    },


    initialize : function(){
        
        this.sTitle = DEFAULT_STR;
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
        this.render();
        this.$el.addClass('animated').addClass('fadeInUp').show();

        return this;
    },

    hide : function(){
        this.$el.hide();
        this.sTitle = DEFAULT_STR;
    },
    
    changeTitle : function(sTitle){
    
        this.sTitle = sTitle;
        
        return this;
    },
    
    render : function(){
        var htVars = {
            sTitle : this.sTitle,
            nConnectedUser : this.model.get('nConnectedUser')
        };
//        this.$el.addClass('animated').removeClass('pulse');

        var template = app.tetris.TemplateManager.get(this.template, htVars);
        this.$el.html(template);
//            this.$el.addClass('animated').hide().addClass('pulse').show();

        return this;
    }
});

    app.tetris.ui.Header.View = new HeaderView({model  : app.tetris.Network.Model});
})();