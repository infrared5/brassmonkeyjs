module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    concat: {
      dist: {
        src: [
          'src/core.js',
          'src/base64.js',
          'src/resources.js',
          'src/device.js',
          'src/detect.js',
          'src/flash/swfobject.js',
          'src/flash/flash.js',
          'src/websockets/websockets.js'
        ],
        dest: 'brassmonkey.js'
      }
    },
    lint: {
      files: ['brassmonkey.js']
    },
    min: {
      dist: {
        src: ['brassmonkey.js'],
        dest: 'brassmonkey.min.js'
      }
    },
    yuidoc: {
      compile: {
        "name": "Brass Monkey Javascript SDK",
        "description": "An SDK that enables developers to make games that use mobile devices as controllers.",
        options: {
          parseOnly:false,
          paths: "./src",
          outdir: "./docs"
        }
      }
    }
  });

  // Create yuidoc task, this is based on https://github.com/gcpantazis/grunt-yuidocs/blob/master/tasks/grunt-yuidocs.js
  // which worked better than the built in yuidoc task in https://github.com/gruntjs/grunt-contrib/blob/master/docs/yuidoc.md.
  // TODO: Revisit this and use newer maintained version if possible by figuring out why it was only building the parsedata
  // but not the actual documentation.
  grunt.registerMultiTask( "yuidoc", "Create YUIDocs", function() {

		var Y = require('yuidocjs');

		// This is an asyncronous task.
		var done = this.async();

		var logoUrl = 'http://yuilibrary.com/img/yui-logo.png';

		if ( this.data.logo ) {
			if ( typeof this.data.logo === 'string' ) {
				logoUrl = grunt.file.expandFileURLs(this.data.logo)[0];
			}
		}

		var options = { 
			external: { 
				data: 'http://yuilibrary.com/yui/docs/api/data.json' 
			},
			linkNatives: 'true',
			attributesEmit: 'true',
			paths: [this.data.options.paths],
			outdir: this.data.options.outdir,
			port: 3000,
			nocode: false,
			quiet: true,
			project: { 
				name: 'YUIDoc',
				description: 'YUIDoc documentation tool written in Javascript',
				url: 'http://github.com/yui/yuidoc/issues',
				logo: logoUrl
			} 
		}

		var starttime = (new Date).getTime();
		var json = (new Y.YUIDoc(options)).run();
    
		options = Y.Project.mix(json, options);
    
		if (!options.parseOnly) {
			var builder = new Y.DocBuilder(options, json);

			grunt.log.writeln('Start YUIDoc compile...');
			grunt.log.writeln('Scanning: ' + options.paths.join(', '));
			grunt.log.writeln('Output: ' + options.outdir);

			builder.compile(function() {
				var endtime = (new Date).getTime();
				grunt.log.writeln('YUIDocs completed in ' + ((endtime - starttime) / 1000) + ' seconds' , 'info', 'yuidoc');
			});
		}

	});

  // Build SDK Documentation.
  grunt.registerTask('docs', 'yuidoc');
  
  // Minify the SDK
  grunt.registerTask('minify', 'concat min');
  
  // Minify the SDK and Build SDK Documentation
  grunt.registerTask('default', 'concat min docs');
  
  // Start a basic server for hosting the examples and documentation.
  grunt.registerTask('server', 'Start a custom static web server.', function() {
    // Make it an asynchronous task so that the server doesn't close immediately.
		var done = this.async();
    
    var express = require('express'),
        app = express.createServer();
    
    app.configure(function(){
      app.use(express.bodyParser());
      app.use(express.methodOverride());
      app.use(express.static(__dirname + '/'));
    });
    
    grunt.log.writeln('Starting static web server on port 8080.');
    grunt.log.writeln('    \nPress Control+C to Quit');
    app.listen(8080);
  });
};