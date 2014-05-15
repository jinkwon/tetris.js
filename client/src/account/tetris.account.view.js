(function(){

    var AccountView = Backbone.View.extend({
        el : '#_container #_start_view',
        template : 'start',

        events : {
            "click ._splash_section" : "_onClickSplash",
            "click ._join_btn" : "_onClickJoin",
            "click ._login_btn" :"_onClickLogin"
        },

        initialize : function(){
            this.render();
        },

        assignElements: function () {
            this.welPw = this.$el.find('._pw');
            this.welPwRe = this.$el.find('._pw_re');
            this.welId = this.$el.find('._id');
        },
        
        _checkAccountValidation : function(){
            
            if(this.welId.val() === ''){
                alert('Please insert Id');
                return false;
            }
            
            if(this.welPw.val() !== this.welPwRe.val()){
                alert('Not same password');
                return false;
            }
            
            return true;
        },

        _onClickLogin : function(){
            
            app.tetris.Account.Network.connect($.proxy(function(){
                this._updateAccount();
                this._setAccountEvents();
                app.tetris.Account.Network.io.emit('reqLogin', app.tetris.Account.Info.getAccount());    
            }, this));
        },

        _onClickJoin : function(){
            
            if(this.welPwRe.css('display') === 'none'){
                this.welPwRe.show().css('height', 0).animate({height : this.welPw.outerHeight() + 'px'}, 250);
                return;
            }
            
            if(!this._checkAccountValidation()){
                return;
            }
            
            app.tetris.Account.Network.connect($.proxy(function(){
                this._updateAccount();
                app.tetris.Account.Network.io.emit('reqJoin', app.tetris.Account.Info.getAccount());
            }, this));
        },

        _updateAccount : function(){
            var sUserId = this.$el.find('._id').val();
            var sPasswd = this.$el.find('._pw').val();
            app.tetris.Account.Info.setAccount(sUserId, sPasswd);
        },
        
        _setAccountEvents: function () {
            app.tetris.Account.Info.on('onFailLogin', function () {
                alert('Invalid Id or Password');
            });

            app.tetris.Account.Info.on('onSuccessLogin', function () {
                app.tetris.Account.Info.save();
                app.tetris.Router.navigate('menu', {trigger: true});
            });
        },
        
        _onClickSplash : function(we){
            this.$el.find('._start_btn')
                .removeClass('flipInY')
                .addClass('animated')
                .addClass('fadeOutUp');
            
            if(app.tetris.Account.Info.isAuthenticated()){
                app.tetris.Router.navigate('menu', {trigger : true});
            } else {
                this.hide();
                this.$el.find('#_login_form')
                    .addClass('animated')
                    .addClass('flipInX')
                    .show();
            }
            
            return false;
        },

        hide : function(){
            this.$el.find('._title')
                .addClass('animated')
                .addClass('fadeOutUp')
                .show();
        },
        
        show : function(){
            var htAccount = app.tetris.Account.Info.getAccount();
            
            this.$el.find('._id').val(htAccount.userId);
            this.$el.find('._pw').val(htAccount.passwd);
            this.$el.find('._pw_re').val(htAccount.passwd);
            
            this.$el.show();
            this.$el.find('#_login_form').hide();

            this.$el.find('._start_btn')
                .removeClass('flipOutX')
                .removeClass('flipOutY')
                .addClass('animated')
                .addClass('flipInY');
            
            this.$el.find('._title')
                .removeClass('fadeOutUp')
                .addClass('animated')
                .addClass('flipInX');
        },

        
        
        render : function(){
            app.tetris.TemplateManager.get(this.template, {}, $.proxy(function(template){
                this.$el.html(template);
                this.assignElements();
            }, this));
            return this;
        }
    });

    app.tetris.Account.View = new AccountView();
})();