(function(){



    var MenuView = Backbone.View.extend({
        el : '#_container #_menu_view',
        template : 'menu',
        
        events : {
            "click ._menu_item" : "onClickMenu"
        },

        initialize : function(){
            this.render();

            this.oBgm = new Howl({urls: ['../res/sound/FF_8_OST.mp3'], volume : 0.1, format : 'mp3'});

            app.tetris.Network.Model.on('change:nRegisterUser change:nConnectedUser', $.proxy(function(oModel){
                this.onChangeCount(oModel);
            }, this));
        },

        onChangeCount: function (oModel) {

            var welUserCnt = this.$el.find('._conn_user_cnt');
            welUserCnt.find('._con_user').html(oModel.get('nConnectedUser'));
            welUserCnt.find('._reg_user').html(oModel.get('nRegisterUser'));

            welUserCnt.removeClass('pulse').hide().addClass('pulse').show();
        },
    
        onClickMenu : function(we){
            var sMenuValue = $(we.currentTarget).attr('data-navigate');
            app.tetris.Router.navigate(sMenuValue, {trigger : true});
            return false;
        },
        
        show : function(){
            this.render();
            
            this.$el.show();
            this.$el.find('._welcome').addClass('animated').addClass('pulse');
            this.$el.addClass('animated').removeClass('fadeOutUp').addClass('fadeInDown');
            this.$el.find('._conn_user_cnt')
                .removeClass('pulse')
                .addClass('animated').addClass('pulse').show();

            var self = this;
            setTimeout(function(){
                if(self.myScroll){
                    self.myScroll.refresh();
                }
            }, 200);

//            this.oBgm.stop();
//            this.oBgm.play();
            
        },
        
        hide : function(){
//            this.$el.hide();
            this.$el.addClass('animated').removeClass('fadeInDown').addClass('fadeOutUp');

//            this.oBgm.stop();
        },
        
        render : function(){
            var htVars = {
                sName : app.tetris.Account.Info.userId,
                nConnectedUser : app.tetris.Network.Model.get('nConnectedUser'),
                nRegisterUser : app.tetris.Network.Model.get('nRegisterUser')
            };

            var template = app.tetris.TemplateManager.get(this.template, htVars);
            this.$el.html(template);

            this.myScroll = new IScroll('#wrapper_scroll', {
                scrollX: false,
                scrollY: true,
                momentum: true,
                click: true
            });


            return this;
        }
    });

    app.tetris.Menu.View = new MenuView();
})();