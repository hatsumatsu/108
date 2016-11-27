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
					'dist/css/style.css': 'src/less/style.less'
				}
			}
		},

		autoprefixer: {
			style: {
				src: 'dist/css/style.css',
				dest: 'dist/css/style.css'
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
						'src/js/history.js',
						'src/js/timeline.js',
						'src/js/ui.js',
						'src/js/banner.js',
						'src/js/url.js',
						'src/js/intro.js',
						'src/js/title.js',
						
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
		}

	} );

	grunt.registerTask( 'default', ['build'] );

	grunt.registerTask( 'buildcss',  ['less', 'autoprefixer'] );
	grunt.registerTask( 'buildmodernizr', ['modernizr'] );
	grunt.registerTask( 'buildjs',  ['uglify'] );

	grunt.registerTask( 'deploy',  ['copy'] );

	grunt.registerTask( 'build',  ['buildcss', 'buildmodernizr', 'buildjs'] );
};
