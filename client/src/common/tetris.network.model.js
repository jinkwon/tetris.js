(function(){

    var networkModelSingleTon = Backbone.Model.extend({
       
        defaults : {
            connectedUser : 200
        },
        
        initialize : function(){
            var n = 10;
            
            setInterval($.proxy(function(){
                this.set('connectedUser', n++);
            }, this), 1000);
        }
    });
    
    app.tetris.Network.Model = new networkModelSingleTon();
})();