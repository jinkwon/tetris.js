app.tetris.ui.BackButton = {

    setEvents : function(){
        this._hideDomWithContext = $.proxy(this._hideDom, this);
        this.welClose = $('#_container').find('._close');
        this._sAniEvents = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        
        $(document).on('click', '._close', $.proxy(function (we) {
            this._clearAnimationClass($(we.currentTarget));

            $(we.currentTarget)
                .addClass('bounceIn').show();
            app.tetris.Router.moveBack();
        }, this));
    },

    show : function(){
        this._clearAnimationClass(this.welClose);
        this.welClose.show().addClass('rotateIn');
        this.welClose.off(this._sAniEvents);
    },

    _hideDom : function(){
        this.welClose.hide();
    },

    hide : function(){
        var welClose = $('#_container').find('._close');

        if(welClose.css('display') !== 'none'){
            this._clearAnimationClass(welClose);

            welClose
                .show()
                .addClass('bounceOut')
                .one(this._sAniEvents, this._hideDomWithContext);

        } else {
            this._clearAnimationClass(welClose);
            welClose.hide();
        }
    },

    _clearAnimationClass: function (welClose) {
        welClose
            .removeClass('bounceIn')
            .removeClass('rotateIn');
    }
};