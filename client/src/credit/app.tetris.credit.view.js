
(function(){

    var CreditView = Backbone.View.extend({
        el : '#_container #_credit_view',
        template : 'credit',

        events : {
            "click ._menu_item" : "onClickMenu"
        },


        initialize : function(){
            this.setEvents();
            this.render();
        },

        setEvents: function () {
            
        },

        onClickMenu : function(we){
            return false;
        },

        show : function(){
            this.$el.hide().stop().fadeIn(300);
        },

        hide : function(){
            this.$el.hide();
        },

        render : function(){

            var htVars = {
            };

            TemplateManager.get(this.template, htVars, $.proxy(function(template){
                this.$el.html(template);

            }, this));

            return this;
        }
    });

    app.tetris.Credit.View = new CreditView();
})();