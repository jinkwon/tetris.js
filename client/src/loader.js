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
        'move' : '../vendor/move.js/move.min',
		'underscore' : '../lib/underscore-min',
		'backbone' : '../lib/backbone',
		'jquery' : '../lib/jquery',
		'jquery-ui' : '../lib/jquery-ui',
		'jq-blockui' : '../lib/jquery.blockUI',
		'jq-hammer' : '../lib/jquery.hammer',
		'socket.io' : '../lib/socket.io',
		'jq-slide' : '../lib/slides.min.jquery',
		'jq-cookie' : '../lib/jquery.cookie',
		'glmatrix' : '../lib/glmatrix',
		'hammer' : '../lib/hammer',
		'jq-specialevt' : '../lib/jquery.specialevent.hammer',
		'buzz' : '../lib/buzz'
	},
	shim : {
		'backbone' : {
			deps : ['underscore', 'jquery'],
			exports : 'Backbone'
		},
		
		'jquery' : {
			exports : '$'	
		},
		
		'jq-slide' : {
			deps : ['jquery']
		},
		
		'jq-cookie' : {
			deps : ['jquery']
		},
		
		'jquery-ui' : {
			deps : ['jquery']
		},
		
		'jq-specialevt' : {
			deps : ['jquery']
		},
		
		'jq-hammer' : {
			deps : ['jquery', 'hammer', 'jq-specialevt']	
		},
		
		'tetris.uiview' : {
			deps : ['backbone', 'jquery-ui', 'jq-slide', 'tetris']
		},
		
		'tetris.block.model' : {
			deps : ['backbone', 'tetris']
		},
		
		'webgl.util' : {
			deps : ['webgl']			
		},
		
		'webgl' : {
			deps : ['backbone', 'namespace', 'glmatrix']
		},
		
		'game/tetris.game' : {
			deps : ['jq-cookie', 'tetris', 'jq-hammer', 'buzz']
		},

        'game/tetris.gamemodel' : {
            deps : ['backbone', 'tetris']
        },
    
        'game/tetris.gameview' : {
            deps : ['backbone', 'jquery', 'game/tetris.game']
        },
		
		'tetris.util' : {
			deps : ['tetris']			
		},
		
		'tetris.network' : {
			deps : ['socket.io', 'tetris', 'jq-cookie', 'tetris.config']
		},
		
		'tetris' : {
			deps : ['namespace', 'socket.io']
		},

        'board/tetris.board.view' : {
            deps : ['backbone']
        },
        
        'common/tetris.network' : {
            deps : ['backbone', 'common/tetris.network.model']
        },

        'tetris.config' : {
            deps : ['namespace', 'backbone']
        },
        
        'board/tetris.board' : {
            deps : ['tetris.config', 'jq-cookie', 'jquery-ui', 'jq-blockui', 'board/tetris.board.view', 'common/tetris.network']
        },
        
        'menu/tetris.menu.view' : {
        
            deps : ['namespace', 'backbone', 'common/tetris.network.model']
        },
        
        'ui/tetris.ui.header.view' : {
            deps : ['namespace', 'backbone', 'common/tetris.network.model']
        },
        
        'ui/tetris.ui.footer.view' : {
            deps : ['namespace', 'backbone']
        },

        'credit/app.tetris.credit.view' : {
            deps : ['namespace', 'backbone']
        },
        
        'common/tetris.network.model' : {
            deps : ['namespace', 'backbone']
        },
        
        'ui/tetris.ui.start.view' : {
            deps : ['namespace', 'backbone']
        },

        'account/tetris.account.network' : {
        
            deps : ['namespace', 'backbone', 'tetris.config']
        },
        
        'account/tetris.account.view' :{
            deps : ['namespace', 'backbone', 'account/tetris.account.network']
        },
        
        'account/tetris.accountinfo' : {
            deps : ['namespace', 'backbone']
        },
        
        'tetris.router' : {
            deps : ['backbone',
                'tetris',
                'namespace',

                'menu/tetris.menu.view',


                'common/tetris.network.model',
                'common/TemplateManager',

                'account/tetris.accountinfo',
                'account/tetris.account.view',

                'board/tetris.board',
                'credit/app.tetris.credit.view',
                
                'ui/tetris.ui.start.view',
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
