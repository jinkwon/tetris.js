'use strict';

var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;

var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON("Tetris.json"),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %>\n' + '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' + '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' + ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
        // Task configuration.
        clean: {
            files: ['www', 'public/releases', 'archive']
        },

        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                src: [
                    '../app/src/namespace.js',
                    '../app/src/tetris.config.js',
                    '../app/src/common/**/*.js',
                    '../app/src/ui/**/*.js',
                    '../app/src/**/*.js',
                    '../app/src/tetris.router.js',
                    '../app/src/tetris.js'
                ],
                dest: 'www/<%= pkg.name %>.js'
            }
        },

        uglify: {
            options: {
                banner: '<%= banner %>',
                compress : {
                    drop_console: true
                }
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
            }
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
                expand : true,
                filter : 'isFile',
                cwd : '../app/',
                src: ['lib/**/*', 'vendor/**', 'res/css/**', 'res/img/**', 'res/shader/**', 'res/sound/**'
                ],
                dest: './www/'
            },

            view : {
                expand : true,
                filter : 'isFile',
                cwd : '../app/',
                src: ['views/**', 'index.html'],
                dest: 'www/'
            },

            package : {
                src : ['package.json'],
                dest : 'www/'
            },

            apk : {
                 src : ['platforms/android/ant-build/Tetris-release.apk'],
                dest : 'archive/tetris.apk'
            },

            loader : {
                src : ['../app/loader.dist.js'],
                dest : 'www/loader.js'
            },

            moveToServer : {

                src : ['www/**'],
                dest : '../server/public/'
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

        cordovacli : {
            options: {
                path: ''
            },
            cordova: {
                options: {
                    command: ['create','platform','plugin','build'],
                    platforms: ['ios','android'],
                    plugins: ['device','dialogs'],
                    path: '',
                    id: 'io.cordova.hellocordova',
                    name: 'HelloCordova'
                }
            },
            add_platforms: {
                options: {
                    command: 'platform',
                    action: 'add',
                    platforms: ['ios', 'android']
                }
            },
            add_plugins: {
                options: {
                    command: 'plugin',
                    action: 'add',
                    plugins: [
                        'battery-status',
                        'camera',
                        'console',
                        'contacts',
                        'device',
                        'device-motion',
                        'device-orientation',
                        'dialogs',
                        'file',
                        'geolocation',
                        'globalization',
                        'inappbrowser',
                        'media',
                        'media-capture',
                        'network-information',
                        'splashscreen',
                        'vibration',
                        'org.apache.cordova.statusbar'
                    ]
                }
            },
            build : {
                options: {
                    command: 'build',
                    platforms: ['android', 'ios'],
                    args: ['--release']
                }
            },
            emulate_android: {
                options: {
                    command: 'emulate',
                    platforms: ['android'],
                    args: ['--target','Nexus5']
                }
            },

            emulate_ios : {
                options : {
                    command : 'run',
                    platforms : ['ios'],
                    args : ['--emulate']
                }
            }
        },

        compress : {
            nw_win : {
                options: {
                    mode: 'zip',
                    archive : 'archive/tetris.win.zip'
                },
                expand: true,
                cwd: 'public/releases/Tetris/win/',
                src: ['**/*']
            },

            nw_osx : {
                options: {
                    mode: 'zip',
                    archive : 'archive/tetris.osx.zip'
                },
                expand: true,
                cwd: 'public/releases/Tetris/mac/',
                src: ['**/*']
            }
        },

        scp : {
            options: {
                host: 'srv.bdyne.net',
                username: '',
                password: ''
            },
            your_target: {
                files: [{
                    cwd: 'archive',
                    src: '**/*',
                    filter: 'isFile',
                    // path on the server
                    dest: '/home/www/public/archive/tetris'
                }]
            }
        }

    });

    // livereload for dev
    grunt.registerTask('default', ['sloc']);

    // fly deploy
    grunt.registerTask('build', [
        'clean',
        'copy:lib',
        'copy:view' ,
        'copy:loader',
        'copy:package',
        'concat',
        'uglify',
        'uglify:loader',
        'copy:moveToServer'
    ]);

    grunt.registerTask('pack_nw', ['nodewebkit', 'compress:nw_win', 'compress:nw_osx']);
    grunt.registerTask('pack_mobile', ['cordovacli:build', 'copy:apk']);
    // deploy task.
    grunt.registerTask('deploy', ['build', 'pack_nw', 'pack_mobile']);

};