'use strict';

var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;

var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON("Tetris.json"),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %>\n' + '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' + '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' + ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
        // Task configuration.
        clean: {
            files: ['www', 'public/releases']
        },
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                src: [
                    'src/namespace.js',
                    'src/tetris.config.js',
                    'src/common/**/*.js',
                    'src/ui/**/*.js',
                    'src/**/*.js',
                    'src/tetris.router.js',
                    'src/tetris.js'
                ],
                dest: 'www/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: '<%= concat.dist.dest %>',
                dest: 'www/<%= pkg.name %>.min.js'
            },
            loader: {
                src: 'www/loader.js',
                dest: 'www/loader.js'
            }
        },
        qunit: {
            files: ['test/**/*.html']
        },
        jshint: {
            gruntfile: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: 'Gruntfile.js'
            },
            src: {
                options: {
                    jshintrc: 'src/.jshintrc'
                },
                src: ['src/**/*.js']
            },
            test: {
                options: {
                    jshintrc: 'test/.jshintrc'
                },
                src: ['test/**/*.js']
            },
        },
        connect: {
            livereload: {
                options: {
                    base: "./", // Gruntfile.js 기준 경로
                    port: 9001,
                    middleware: function (connect, options) {
                        return [lrSnippet, mountFolder(connect, options.base)];
                    }
                }
            }
        },
        // Configuration to be run (and then tested)
        regarde: {
            style: {
                files: '**/*.css',
                tasks: ['livereload']
            },
            script: {
                files: '**/*.js',
                tasks: ['livereload', 'jshint:test', 'qunit']
            },
            markup: {
                files: ['**/*.html'],
                tasks: ['livereload', 'jshint:test', 'qunit']
            }
        },
        sloc: {
            options: {
                // Task-specific options go here.
            },
            'my-source-files': {
                files: {
                    'src' : '**/*.js'
                }
            }
        },
        copy: {
            lib : {
                src: ['lib/**', 'vendor/**', 'res/css/**', 'res/img/**', 'res/shader/**', 'res/sound/**'
                ],
                dest: 'www/'
            },

            view : {
                src: ['views/**', 'index.html'],
                dest: 'www/'
            },

            package : {
                src : ['package.json'],
                dest : 'www/'
            },

            loader : {
                src : ['loader.dist.js'],
                dest : 'www/loader.js'
            },

            phonegap : {
                src : ['platforms/**'],
                dest : 'public/phonegap/'
            }

        },
        nodewebkit: {
            options: {
                app_name : 'Tetris',
                build_dir: './public', // Where the build version of my node-webkit app is saved
                mac: true, // We want to build it for mac
                win: true, // We want to build it for win
                linux32: false, // We don't need linux32
                linux64: false // We don't need linux64
            },
            src: ['./www/**/*'] // Your node-webkit app
        },
        phonegap: {
            config: {
                root: 'www',
                template: '_myConfig.xml',
                data: {
                    id: 'com.grunt-phonegap.example',
                    version: '0.1',
                    name: 'tetris'
                },

                config: 'config.xml',
                cordova: '.cordova',
                html : 'index.html', // (Optional) You may change this to any other.html
                path: 'public/phonegap',
//                plugins: ['/local/path/to/plugin', 'http://example.com/path/to/plugin.git'],
                platforms: ['android', 'ios'],
                maxBuffer: 200, // You may need to raise this for iOS.
                verbose: false,
                releases: 'releases',
                releaseName: function(){
                    var pkg = grunt.file.readJSON('package.json');
                    return(pkg.name + '-' + pkg.version);
                },
                debuggable: false,

                // Must be set for ios to work.
                // Should return the app name.
                name: function(){
                    var pkg = grunt.file.readJSON('package.json');
                    return pkg.name;
                },

                // Add a key if you plan to use the `release:android` task
                // See http://developer.android.com/tools/publishing/app-signing.html
                key: {
                    store: 'release.keystore',
                    alias: 'release',
                    aliasPassword: function(){
                        // Prompt, read an environment variable, or just embed as a string literal
                        return('tetris');
                    },
                    storePassword: function(){
                        // Prompt, read an environment variable, or just embed as a string literal
                        return('tetris');
                    }
                },

                // Set an app icon at various sizes (optional)
//                icons: {
//                    android: {
//                        ldpi: 'icon-36-ldpi.png',
//                        mdpi: 'icon-48-mdpi.png',
//                        hdpi: 'icon-72-hdpi.png',
//                        xhdpi: 'icon-96-xhdpi.png'
//                    },
//                    wp8: {
//                        app: 'icon-62-tile.png',
//                        tile: 'icon-173-tile.png'
//                    },
//                    ios: {
//                        icon29: 'icon29.png',
//                        icon29x2: 'icon29x2.png',
//                        icon40: 'icon40.png',
//                        icon40x2: 'icon40x2.png',
//                        icon57: 'icon57.png',
//                        icon57x2: 'icon57x2.png',
//                        icon60x2: 'icon60x2.png',
//                        icon72: 'icon72.png',
//                        icon72x2: 'icon72x2.png',
//                        icon76: 'icon76.png',
//                        icon76x2: 'icon76x2.png'
//                    }
//                },

                // Set a splash screen at various sizes (optional)
                // Only works for Android and IOS
//                screens: {
//                    android: {
//                        ldpi: 'screen-ldpi-portrait.png',
//                        // landscape version
//                        ldpiLand: 'screen-ldpi-landscape.png',
//                        mdpi: 'screen-mdpi-portrait.png',
//                        // landscape version
//                        mdpiLand: 'screen-mdpi-landscape.png',
//                        hdpi: 'screen-hdpi-portrait.png',
//                        // landscape version
//                        hdpiLand: 'screen-hdpi-landscape.png',
//                        xhdpi: 'screen-xhdpi-portrait.png',
//                        // landscape version
//                        xhdpiLand: 'www/screen-xhdpi-landscape.png'
//                    },
//                    ios: {
//                        // ipad landscape
//                        ipadLand: 'screen-ipad-landscape.png',
//                        ipadLandx2: 'screen-ipad-landscape-2x.png',
//                        // ipad portrait
//                        ipadPortrait: 'screen-ipad-portrait.png',
//                        ipadPortraitx2: 'screen-ipad-portrait-2x.png',
//                        // iphone portrait
//                        iphonePortrait: 'screen-iphone-portrait.png',
//                        iphonePortraitx2: 'screen-iphone-portrait-2x.png',
//                        iphone568hx2: 'screen-iphone-568h-2x.png'
//                    }
//                },

                // Android-only integer version to increase with each release.
                // See http://developer.android.com/tools/publishing/versioning.html
                versionCode: function(){ return(1) },

                // Android-only options that will override the defaults set by Phonegap in the
                // generated AndroidManifest.xml
                // See https://developer.android.com/guide/topics/manifest/uses-sdk-element.html
                minSdkVersion: function(){ return(10) },
                targetSdkVersion: function(){ return(19) },

                // iOS7-only options that will make the status bar white and transparent
                iosStatusBar: 'WhiteAndTransparent',

                // If you want to use the Phonegap Build service to build one or more
                // of the platforms specified above, include these options.
                // See https://build.phonegap.com/
//                remote: {
//                    username: 'master@bdyne.net',
//                    password: 'your_password',
//                    platforms: ['android', 'blackberry', 'ios', 'symbian', 'webos', 'wp7']
//                },

                // Set an explicit Android permissions list to override the automatic plugin defaults.
                // In most cases, you should omit this setting. See 'Android Permissions' in README.md for details.
                permissions: ['INTERNET', 'ACCESS_COURSE_LOCATION', '...']
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-sloc');

    grunt.loadNpmTasks('grunt-node-webkit-builder');
    grunt.loadNpmTasks('grunt-phonegap');
    grunt.loadNpmTasks('grunt-sloc');

    // livereload
    grunt.loadNpmTasks('grunt-regarde');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-livereload');

    // livereload for dev
    grunt.registerTask('default', ['sloc']);


    // fly deploy
    grunt.registerTask('fly', [
        'clean',
        'copy:lib',
        'copy:view' ,
        'copy:loader',
        'copy:package',
        'copy:phonegap',
        'concat',
        'uglify',
        'uglify:loader'
    ]);

    // deploy task.
    grunt.registerTask('deploy', ['fly', 'nodewebkit']);
    grunt.registerTask('phonegap', ['copy:phonegap', 'phonegap:release:android']);

};