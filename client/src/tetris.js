function setGlobalEvents() {
    $(document).on('click', '._close', function () {
        window.history.back();
    });

    
}

app.tetris.ui.BackButton = {
    show : function(){
        $('#_container').find('._close').show();
    },
    hide : function(){
        $('#_container').find('._close').hide();
    }
};

app.tetris.init = function(){
    setGlobalEvents();
};