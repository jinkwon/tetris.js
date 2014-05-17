app.tetris.init = function(){
    app.tetris.ui.BackButton.setEvents();
    Backbone.history.start();

    var sNavigation = Backbone.history.fragment ? Backbone.history.fragment : false;
    app.tetris.Router.navigate(sNavigation, {trigger: true});
};