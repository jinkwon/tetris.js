app.tetris.Rules.filterRules = function(nScore, cb){

    var nLevel = 1;
    
    // DEFAULT SPEED
    var nLogicSpeed = 1500;
    
    // 50000 : level 6
    // 20000 : level 5
    // 10000 : level 4
    // 5000 : level 3
    // 1000 : level 2
    
    var aLevels = [
        {nLv : 9, nScore : 10000, nLogicSpeed : 100},
        {nLv : 8, nScore : 6000, nLogicSpeed : 150},
        {nLv : 7, nScore : 4000, nLogicSpeed : 250},
        {nLv : 6, nScore : 2500, nLogicSpeed : 350},
        {nLv : 5, nScore : 2000, nLogicSpeed : 450},
        {nLv : 4, nScore : 1500, nLogicSpeed : 550},
        {nLv : 3, nScore : 1000, nLogicSpeed : 650},
        {nLv : 2, nScore : 500, nLogicSpeed : 1000},
        {nLv : 1, nScore : 0, nLogicSpeed : 1500}
    ];
   
    var _getLevelBy = function(nScore){
        var aLevel = _.filter(aLevels, function(oLevel){
            return (oLevel.nScore <= nScore);
        });
        
        if(aLevel.length > 0){
            return aLevel[0];    
        }
    };

//    _getLevelBy(1000);
//    _getLevelBy(1500);
//    _getLevelBy(5000);
//    _getLevelBy(5500);
//    _getLevelBy(15500);
  
    cb(_getLevelBy(nScore));
};

/**
 * app.arBlockList
 */
app.tetris.Rules.BlockList = {

    create : function(){
        var arObjBlock = [];

        arObjBlock[0] = new app.tetris.Game.BlockModel({
            sColor: 'yellow',
            sCode: 'O',
            nAngle: 0,
            aMatrix: [
                [0, 0, 0, 0],
                [0, 1, 1, 0],
                [0, 1, 1, 0],
                [0, 0, 0, 0]
            ]
        });

        arObjBlock[1] = new app.tetris.Game.BlockModel({
            sColor: 'sky',
            sCode: 'I',
            nAngle: 0,
            aMatrix: [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ]
        });

        arObjBlock[2] = new app.tetris.Game.BlockModel({
            sColor: 'orange',
            sCode: 'L',
            nAngle: 0,
            aMatrix: [
                [0, 0, 0, 0],
                [0, 1, 1, 1],
                [0, 1, 0, 0],
                [0, 0, 0, 0]
            ]
        });

        arObjBlock[3] = new app.tetris.Game.BlockModel({
            sColor: 'blue',
            sCode: 'J',
            nAngle: 0,
            aMatrix: [
                [0, 0, 0, 0],
                [0, 1, 1, 1],
                [0, 0, 0, 1],
                [0, 0, 0, 0]
            ]
        });

        arObjBlock[4] = new app.tetris.Game.BlockModel({
            sColor: 'green',
            sCode: 'S',
            nAngle: 0,
            aMatrix: [
                [0, 0, 0, 0],
                [0, 0, 1, 1],
                [0, 1, 1, 0],
                [0, 0, 0, 0]
            ]
        });

        arObjBlock[5] = new app.tetris.Game.BlockModel({
            sColor: 'red',
            sCode: 'Z',
            nAngle: 0,
            aMatrix: [
                [0, 0, 0, 0],
                [0, 1, 1, 0],
                [0, 0, 1, 1],
                [0, 0, 0, 0]
            ]
        });

        arObjBlock[6] = new app.tetris.Game.BlockModel({
            sColor: 'purple',
            sCode: 'T',
            nAngle: 0,
            aMatrix: [
                [0, 0, 0, 0],
                [0, 1, 1, 1],
                [0, 0, 1, 0],
                [0, 0, 0, 0]
            ]
        });

        return arObjBlock;
    }
};