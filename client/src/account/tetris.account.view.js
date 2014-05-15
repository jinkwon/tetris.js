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

        _checkLoginValidation : function(){
            if(this.welId.val().trim() === ''){
                alert('Please insert Id');
                this.welId.focus();
                return false;
            }

            if(this.welPw.val().trim() === ''){
                alert('Please insert Password');
                this.welPw.focus();
                return false;
            }

            return true;
        },

        _checkJoinValidation : function(){
            if(!this._checkLoginValidation()){
                return false;
            }
            
            if(this.welPw.val() !== this.welPwRe.val()){
                alert('Not same password');
                return false;
            }
            
            return true;
        },
        
        _onClickLogin : function(){
            if(!this._checkLoginValidation()){
                return;
            }
            
            app.tetris.Account.Network.connect($.proxy(function(){
                this._updateAccount();
                this._setAccountEvents();
                app.tetris.Account.Network.io.emit('reqLogin', app.tetris.Account.Info.getAccount());    
            }, this));
        },

        _onClickJoin : function(){
            
            if(this.welPwRe.css('display') === 'none'){
                this.welPwRe.show().css('height', 0).animate({height : this.welPw.outerHeight() + 'px'}, 250, 'easeOutBounce');
                return;
            }
            
            if(!this._checkJoinValidation()){
                return;
            }
            
            app.tetris.Account.Network.connect($.proxy(function(){
                this._updateAccount();
                this._setAccountEvents();
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
            if(this.$el.find('#_login_form').css('display') !== 'none'){
                this._resetDisplay();
                return;
            }
            
            this.$el.find('._start_btn').removeClass('flipInY').addClass('fadeOutUp');
            
            if(app.tetris.Account.Info.isAuthenticated()){
                app.tetris.Router.navigate('menu', {trigger : true});
            } else {
                this.hide();
                this.$el.find('#_login_form').addClass('flipInX').show();
                this.welId.focus();
            }
            
            return false;
        },

        hide : function(){
            this.$el.find('._title').addClass('fadeOutUp').show();
        },

        _updateInputs: function () {
            var htAccount = app.tetris.Account.Info.getAccount();
            this.$el.find('._id').val(htAccount.userId);
            this.$el.find('._pw').val(htAccount.passwd);
            this.$el.find('._pw_re').val(htAccount.passwd);
            this.welPwRe.hide();
        },

        _playShowAnimation: function () {
            this.$el.find('._start_btn')
                .removeClass('flipOutX')
                .removeClass('flipOutY')
                .addClass('flipInY');

            this.$el.find('._title')
                .removeClass('fadeOutUp')
                .addClass('flipInX');
        },

        _hideLoginForm: function () {
            this.$el.find('#_login_form').hide();
        },

        _resetDisplay: function () {
            this._updateInputs();
            this._hideLoginForm();
            this._playShowAnimation();
        },
        
        show : function(){
            this._resetDisplay();
            this.$el.show();
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