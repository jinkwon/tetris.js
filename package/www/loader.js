/*! Tetris - v0.1.0 - 2014-10-29
* https://github.com/Jinkwon/tetris.js
* Copyright (c) 2014 LeeJinKwon; Licensed MIT */
requirejs.config({baseUrl:"./",urlArgs:"",waitSeconds:45,paths:{underscore:"vendor/underscore/underscore",backbone:"vendor/backbone/backbone",jquery:"vendor/jquery/dist/jquery.min","jquery-ui":"lib/jquery-ui",iscroll:"vendor/iscroll/build/iscroll","socket.io":"vendor/socket.io-client/dist/socket.io.min",glmatrix:"lib/glmatrix",howler:"vendor/howler/howler.min",fastclick:"vendor/fastclick/lib/fastclick",tetris:"Tetris.min"},shim:{backbone:{deps:["underscore","jquery"],exports:"Backbone"},jquery:{exports:"$"},"jquery-ui":{deps:["jquery"]},tetris:{deps:["backbone","jquery","jquery-ui","glmatrix","socket.io","iscroll","fastclick","howler"]}}}),requirejs(["tetris"],function(){app.tetris.init("production")});