
var getLastLeague = function(cb){
    League
        .find()
        .sort({ created_at : 'desc' })
        .exec(function(err, docs) {

            if(!err && docs.length > 0){
                cb(docs[0]);
            } else {
                cb(null)
            }
        });
};

var getNewLeagueSeq = function(cb){
    getLastLeague(function(doc){
        var nLeagueSeq = 0;

        if(doc !== null){
            nLeagueSeq = doc.get('seq') + 1;
        }

        cb(nLeagueSeq, doc);
    });
};

var createNewLeague = function(oGameIo){
    getNewLeagueSeq(function(nLeagueSeq, doc){

        oGameIo.in(doc._id.toString())
            .emit('brLeagueClosed', { msg : 'league_closed', nClosedLeague : nLeagueSeq});
//        oGameIo.emit('brLeagueClosed', { msg : 'league_closed', nClosedLeague : nLeagueSeq});

        var htObj = {
            seq : nLeagueSeq,
            created_at : new Date()
        };

        var _onSave = function(err, doc){
            if(!err){
                console.log(('Successfully Added : League '+nLeagueSeq).green);
            }
        };

        new League(htObj).save(_onSave);
    });
};


function startLeagueCron(oGameIo) {
    createNewLeague(oGameIo);

    new CronJob('*/30 * * * * *', function () {
        console.log('cronjob Excuted');

        createNewLeague(oGameIo);

    }, null, true, "Asis/Seoul");
};

function joinLeague(id, cb){

    getLastLeague(function(doc){

        doc.users.push(id);

        doc.save(function(err, doc){
            console.log(doc);
            cb(doc._id.toString());
        });
    })
}

function outLeague(id){

    getLastLeague(function(doc){
        doc.users = _.reject(doc.users || [], function(userid){ return id === userid});

        doc.save(function(err, doc){
            console.log('outLeague');
            console.log(doc);
        });
    });
}


var oGameIo = oSocketIo.of('/game')
    .on('connection', function(oGame){
        console.log(('connected : ' + oGame.id).magenta);
        oGame
            .on('reqJoinLeague', function(){
                joinLeague(oGame.id, function(roomId){
                    oGame.emit('resJoinLeague');
                });
            })
            .on('reqOutLeague', function(){
                oGame.emit('resOutLeague');
            })

            .on('reqQuickGame', function(obj){
                joinQuickGame(oGame, oSocketIo);
            })
                    
    })
    .on('disconnect', function(){
        console.log(('disconnected : ' + oGame.id).yellow);
        outLeague(oGame.id);
    });


//        startLeagueCron(oGameIo);
