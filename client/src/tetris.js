function setGlobalEvents() {
    $(document).on('click', '._close', function () {
        window.history.back();
    });
}

app.tetris.ui.BackButton = {
    show : function(){
        $('#_container').find('._close').show().addClass('animated').addClass('rotateIn');
    },

    hide : function(){
        $('#_container').find('._close').hide().removeClass('animated').removeClass('rotateIn');
    }
};

app.tetris.init = function(){
    setGlobalEvents();
};