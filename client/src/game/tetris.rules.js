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