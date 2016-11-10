module.exports = function( grunt ) {

	require( 'matchdep' ).filterDev( 'grunt-*' ).forEach( grunt.loadNpmTasks );

	// destination path for deployment
	// overwrite in hidden .deployment file
	dest = 'path/for/deployment';
	try {
		require( './.deployment' );
	} catch( error ) {}

	grunt.loadNpmTasks('grunt-fixindent');

	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),

		less: {
			development: {
				files: {
					'dist/css/108.css': 'src/less/108.less'
				}
			}
		},

		autoprefixer: {
			style: {
				src: 'dist/css/108.css',
				dest: 'dist/css/108.css'
			}
		},

		modernizr: {
			dist: {
				'dest' : 'src/js/dependencies/00-modernizr.js',
				'options' : [
					'setClasses',
					'addTest',
					'html5printshiv',
					'testProp',
					'fnBind',
					'mq'
				],
				'tests' : [
					'touchevents',
					'pointerevents'
				],
				'files' : {
					'src': [
						'src/js/**/*.js',
						'src/less/**/*.less',
						'!node_modules/**/*',
						'!src/js/**/*.min.js'
					]
				}
			}
		},

		uglify: {
			options: {
				mangle: false
			},
			dependencies: {
				files: {
					'dist/js/dependencies.min.js': ['src/js/dependencies/*.js']
				}
			},
			main: {
				files: {
					'dist/js/main.min.js': [
						'src/js/debug.js',
						'src/js/viewport.js',
						'src/js/sequencer.js',
						'src/js/timeline.js',
						'src/js/ui.js',
						'src/js/url.js',
						'src/js/intro.js',
						'src/js/title.js',
						'src/js/history.js'
					]
				}
			}
		},

		copy: {
			deployment: {
				files: [
					{
						expand: true,
						src: ['src/**/*', 'dist/**/*', 'index.html', '!.*'],
						dest: dest + '/'
					},
		    	],
		  	},
		},

		watch: {
			css: {
				files: ['**/*.less'],
				tasks: ['buildcss']
			},
			js: {
				files: ['src/js/**/*.js','!js/**/*.min.js'],
				tasks: ['buildjs']
			}
		},

		fixindent: {
			scripts: {
				src: [
					'src/js/*.js'
				],
				dest: 'src/js/',
				options: {
					style: 'tab',
					size: 1
				}
			}
		}

	} );

	grunt.registerTask( 'default', ['build'] );

	grunt.registerTask( 'buildcss',  ['less', 'autoprefixer'] );
	grunt.registerTask( 'buildmodernizr', ['modernizr'] );
	grunt.registerTask( 'buildjs',  ['uglify'] );

	grunt.registerTask( 'deploy',  ['copy'] );

	grunt.registerTask( 'build',  ['buildcss', 'buildmodernizr', 'buildjs'] );
};
