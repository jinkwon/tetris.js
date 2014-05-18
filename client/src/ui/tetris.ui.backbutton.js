app.tetris.ui.BackButton = {

    setEvents : function(){
        $(document).on('click', '._close', $.proxy(function (we) {
            this._clearAnimationClass($(we.currentTarget));

            $(we.currentTarget)
                .addClass('bounceIn').show();

            app.tetris.Router.moveBack();
        }, this));
    },

    show : function(){
        var welClose = $('#_container').find('._close');
        this._clearAnimationClass(welClose);
        welClose.show().addClass('rotateIn');
    },

    hide : function(){
        var welClose = $('#_container').find('._close');

        if(welClose.css('display') !== 'none'){
            this._clearAnimationClass(welClose);

            welClose
                .show()
                .addClass('bounceOut')
                .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                    welClose.hide();
                });

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