/**
 * @description
 * game.loader
 * 파일 의존성 관리 및 앱 호출
 */
requirejs.config({
    baseUrl : '',
    urlArgs : "bust="+ (new Date()).getTime(),
    waitSeconds : 45,
    paths : {
        'underscore' : 'lib/underscore-min',
        'backbone' : 'lib/backbone',
        'jquery' : 'lib/jquery',
        'jquery-ui' : 'lib/jquery-ui',
        'iscroll' : 'vendor/iscroll/build/iscroll',
        'jq-hammer' : 'lib/jquery.hammer',
        'socket.io' : 'lib/socket.io',
        'jq-slide' : 'lib/slides.min.jquery',
        'glmatrix' : 'lib/glmatrix',
        'hammer' : 'lib/hammer',
        'jq-specialevt' : 'lib/jquery.specialevent.hammer',
        'howler' : 'vendor/howler/howler.min',
        'tetris' : 'Tetris'
    },
    shim : {
        // Libraries
        'backbone' : { deps : ['underscore', 'jquery'], exports : 'Backbone' },
        'jquery' : { exports : '$' },
        'jq-slide' : { deps : ['jquery'] },
        'jquery-ui' : { deps : ['jquery'] },
        'jq-specialevt' : { deps : ['jquery'] },
        'jq-hammer' : { deps : ['jquery', 'hammer', 'jq-specialevt'] },

        // Package Begin

        'tetris' : {
            deps : [
                'backbone',
                'jquery',
                'jquery-ui',
                'glmatrix',
                'socket.io',
                'iscroll',
                'howler'
            ]
        }

    }
});

requirejs([
    'tetris'
], function(){

    app.tetris.init('staging');

});
