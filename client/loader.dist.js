/**
 * @description
 * game.loader
 * 파일 의존성 관리 및 앱 호출
 */
requirejs.config({
    baseUrl : '',
    urlArgs : '',
    waitSeconds : 45,
    paths : {
        'underscore' : 'vendor/underscore/underscore',
        'backbone' : 'vendor/backbone/backbone',
        'jquery' : 'vendor/jquery/dist/jquery.min',
        'jquery-ui' : 'lib/jquery-ui',
        'iscroll' : 'vendor/iscroll/build/iscroll',
        'socket.io' : 'vendor/socket.io-client/dist/socket.io.min',
        'glmatrix' : 'lib/glmatrix',
        'howler' : 'vendor/howler/howler.min',
        'tetris' : 'Tetris.min'
    },

    shim : {
        // Libraries
        'backbone' : { deps : ['underscore', 'jquery'], exports : 'Backbone' },
        'jquery' : { exports : '$' },
        'jquery-ui' : { deps : ['jquery'] },

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
    app.tetris.init('production');
});
