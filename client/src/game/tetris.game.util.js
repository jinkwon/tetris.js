app.tetris.Game.Util = {

    isCollision : function(htBlockPos, oBlock, aMatrix, forward){
        var result = false
            , aBlock = oBlock.get('aMatrix')
            , nX, nY;

        for(var i = 0; i < aBlock.length; i++){
            for(var j = 0; j < aBlock[i].length; j++){

                nX = j + htBlockPos.nX;
                nY = i + htBlockPos.nY;

                if(forward === 'bottom'){
                    nY = nY + 1;
                } else if(forward === 'left' || forward === 'right'){
                    nX = (forward === 'left') ? nX - 1 : nX + 1;
                }

                if(aMatrix[nY] === undefined){
                    continue;
                }

                if(aMatrix[nY][nX] === undefined){
                    continue;
                }

                if(aMatrix[nY][nX].nFlag === 1 && aBlock[i][j] === 1){
                    result = true;
                    break;
                }
            }
        }

        return result;
    },

    rotateBlockArray : function(sType, oBlockModel, htBlockPos, aMatrix){
        var aBlock = oBlockModel.get('aMatrix'),
            sBlockCode = oBlockModel.get('sCode'),
            nBlockAngle = oBlockModel.get('nAngle');

        var aCopyMatrix = []
            , aClone
            , bRotate = false;

        if(sBlockCode !== 'O'){
            bRotate = true;
        }

        if(sBlockCode === 'S' || sBlockCode === 'I' || sBlockCode === 'Z') {
            if(nBlockAngle > 0){
                sType = 'left';
            }
        }

        if(bRotate === true){
            if(sType === 'right'){
                nBlockAngle = (nBlockAngle + 90) % 360;

                for(j = aBlock[0].length - 1; j >=0; j--){
                    aClone = [];
                    aClone.push(aBlock[3][j]);
                    for(i = 0; i < aBlock.length - 1; i++){
                        aClone.push(aBlock[i][j]);
                    }

                    aCopyMatrix.push(aClone);
                }
            } else {
                nBlockAngle = (nBlockAngle - 90) % 360;

                for(j = 1; j < aBlock.length; j++){
                    aClone = [];
                    for( i = aBlock[0].length - 1; i >=0; i--){
                        aClone.push(aBlock[i][j]);
                    }
                    aCopyMatrix.push(aClone);
                }

                aClone = [];
                for(var i = aBlock[0].length - 1; i >=0; i--){
                    aClone.push(aBlock[i][0]);
                }

                aCopyMatrix.push(aClone);
            }

            var oNewBlock = oBlockModel.clone().set('aMatrix', aCopyMatrix);

            if(!this.isCollision(htBlockPos, oNewBlock, aMatrix)){

                oBlockModel.set({
                    aMatrix : aCopyMatrix,
                    nAngle : nBlockAngle
                });
            }

        }


        return oBlockModel;
    }
};