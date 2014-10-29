
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
            this.$el.show();
            this.$el.addClass('animated').removeClass('fadeInUp').addClass('fadeInDown');
        },

        hide : function(){
//            this.$el.hide();
            this.$el.addClass('animated').removeClass('fadeInDown').addClass('fadeInUp');

//            var self = this;
//            this.$el.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
//                self.$el.hide();
//            });

        },

        render : function(){

            var htVars = {
            };

            var template = app.tetris.TemplateManager.get(this.template, htVars);
            this.$el.html(template);

            return this;
        }
    });

    app.tetris.Credit.View = new CreditView();
})();