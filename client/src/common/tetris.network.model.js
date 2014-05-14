(function(){

    var networkModelSingleTon = Backbone.Model.extend({
       
        defaults : {
            nConnectedUser : 0
        },
        
        initialize : function(){
            
        }
    });
    
    app.tetris.Network.Model = new networkModelSingleTon();
})();