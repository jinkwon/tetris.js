/**
 * @description 
 * game.loader
 * 파일 의존성 관리 및 앱 호출
 */
requirejs.config({
	baseUrl : 'src',
	urlArgs : "bust="+ (new Date()).getTime(),
	waitSeconds : 45,
	paths : {
		'underscore' : '../lib/underscore-min',
		'backbone' : '../lib/backbone',
		'jquery' : '../lib/jquery',
		'jquery-ui' : '../lib/jquery-ui',
		'jq-blockui' : '../lib/jquery.blockUI',
        'iscroll' : '../vendor/iscroll/build/iscroll',
		'jq-hammer' : '../lib/jquery.hammer',
		'socket.io' : '../lib/socket.io',
		'jq-slide' : '../lib/slides.min.jquery',
		'glmatrix' : '../lib/glmatrix',
		'hammer' : '../lib/hammer',
		'jq-specialevt' : '../lib/jquery.specialevent.hammer',
        'howler' : '../vendor/howler/howler.min'
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
                'namespace',
                'backbone',
                'socket.io',
                'tetris.config',
                'iscroll',
                'common/tetris.util'
            ]
        },
        
        'common/tetris.util' : {
            deps : ['namespace']
        },
        
		'tetris.network' : {
			deps : ['tetris']
		},
		
        'board/tetris.board.view' : {
            deps : ['tetris']
        },
        
        'common/tetris.network' : {
            deps : [
                'tetris', 
                'common/tetris.network.model'
            ]
        },

        'tetris.config' : {
            deps : ['namespace']
        },
        
        'board/tetris.board' : {
            deps : [
                // Lib
                'jquery-ui',
                'jq-blockui',
                
                'tetris',
                'board/tetris.board.view', 
                'common/tetris.network'
            ]
        },
        
        'menu/tetris.menu.view' : {
            deps : [
                'tetris', 
                'common/tetris.network.model'
            ]
        },
        
        'ui/tetris.ui.header.view' : {
            deps : [
                'tetris',
                'common/tetris.network.model'
            ]
        },
        
        'ui/tetris.ui.footer.view' : {
            deps : ['tetris']
        },

        'credit/tetris.credit.view' : {
            deps : ['tetris']
        },
        
        'common/tetris.network.model' : {
            deps : ['tetris']
        },
        
        'account/tetris.account.network' : {
        
            deps : ['tetris']
        },
        
        'account/tetris.account.view' :{
            deps : [
                'tetris', 
                'account/tetris.account.network'
            ]
        },
        
        'account/tetris.accountinfo' : {
            deps : ['tetris']
        },

        // Game
        
        'game/tetris.game.stageview' : {
            deps : [
                'jquery-ui', 
                'jq-slide', 
                
                'tetris',
                'game/tetris.game'
            ]
        },

        'game/tetris.game.blockmodel' : {
            deps : ['tetris']
        },

        'game/tetris.game.webglview' : {
            deps : ['tetris', 'glmatrix', 'common/tetris.webgl.util']
        },

        'game/tetris.rules' : {
            deps : ['tetris', 'game/tetris.game.blockmodel']
        },
        
        'game/tetris.game' : {
            deps : [
                'backbone',

                'game/tetris.rules',
                'game/tetris.game.model',
                'game/tetris.game.blockmodel',
                'game/tetris.game.view',
                'game/tetris.game.webglview',
                
                // LIB
                'howler'
            ]
        },

        'game/tetris.game.model' : {
            deps : ['backbone', 'namespace', 'game/tetris.rules']
        },

        'game/tetris.game.view' : {
            deps : ['tetris']
        },
        
        'game/tetris.gameview' : {
            deps : ['tetris']
        },

        'common/tetris.TemplateManager' : {
            deps : ['namespace']
        },

        'account/tetris.account.info' : {
            deps : ['namespace']
        },
        
        'tetris.router' : {
            deps : [
                'tetris',
                'game/tetris.game',

                'common/tetris.network.model',
                'common/tetris.TemplateManager',

                'account/tetris.account.info',
                'board/tetris.board',
                'menu/tetris.menu.view',
                'account/tetris.account.view',
                'game/tetris.game.stageview',
                'credit/tetris.credit.view',
                
                'ui/tetris.ui.footer.view',
                'ui/tetris.ui.header.view'
            ]
        }
	}
});

requirejs([
	'tetris.router'
    ], function(){

    
    app.tetris.init();
    
});
