app.tetris.ui.Option.View = Backbone.View.extend({
    el : '#_container #_option',
    template : 'ui/option',

    events : {
        "click ._menu_item" : "onClickMenu"
    },

    initialize : function(){

        this.render();
    },

    _setOptionListIdx : function(aList){
        for(var i = 0; i < aList.length; i++){
            aList[i].id = i;
        }

        this.aOptionList = aList;
    },

    onClickMenu : function(we){
        this.unbind();

        var nIdx = $(we.currentTarget).attr('data-idx');

        var bClose;
        
        if (this.aOptionList[nIdx].fn) {
            bClose = this.aOptionList[nIdx].fn();
        }

        if(bClose !== false){
            this.hide();
        }


        return false;
    },

    show : function(options){
        this._setOptionListIdx(options.aList || []);
        this.sTitle = options.sTitle || 'Options';

        this.$el.show();
        this.showDimmedLayer();
        this.render();

        var nHeight = this.$el.find('.option_title').outerHeight() + this.$el.find('.option_layer').height();
        
        this.$el.find('.option_container')
            .show()
            .removeClass('animated flipInY')
            .css('height', nHeight + 'px');


        this.$el.find('.option_container')
            .removeClass('animated flipInY')
            .addClass('animated flipInY')
            .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                $(this).removeClass('animated flipInY');
            });
    },

    hide : function(){

        var self = this;
        this.$el.find('.option_container')
            .removeClass('animated05 fadeOutDown')
            .addClass('animated05 fadeOutDown')
            .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                $(this).removeClass('animated05 fadeOutDown');
                self.$el.hide();
            });
        
        this.hideDimmed();
    },

    hideDimmed : function(){
        $('#_dimmed_section').hide();
    },

    showDimmedLayer : function(string){
        if($('#_dimmed_section .pause').length > 0){
            $('#_dimmed_section').show();
            return;
        }

        string = string || '';

        $('.field .pause').remove();
        $('#_dimmed_section').html(
                '<div class="pause" style="z-index:50;width:100%;height:100%;background-color:rgba(0,0,0,.7);position:absolute;color:#FFF;font-size:27px;font-family:Tahoma;">'+
                '<div style="margin:auto;width:100%;height:25px;text-align:center;margin-top:200px;">'+string+'</div></div>').show();
    },

    render : function(){
        var template = app.tetris.TemplateManager.get(this.template, {
            aList : this.aOptionList,
            sTitle : this.sTitle
        });
        this.$el.html(template);
        return this;
    }
});

app.tetris.ui.Option.View = new app.tetris.ui.Option.View();