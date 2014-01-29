module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		esteWatch: {
			options: {
				dirs: [
					'src', ['src/js', 'src/js/lib', 'src/scss', 'src/jade', 'src/html']
				],
				livereload: {
					enabled: false,
					port: 9000
				}
			},
			jade: function (filePath) {
				grunt.config('jade', {
					compile: {
						options: {
							pretty: true,
							data: {
								debug: true
							}
						},
						files: {
							"htdocs/index.html": ["htdocs/jade/index.jade"]
						}
					}
				});
				return ['jade'];
			},
			scss: function (filepath) {
				grunt.config('compass', {
					dist: {                   // Target
						options: {              // Target options
							sassDir: 'src/scss',
							cssDir: 'src/css',
							environment: 'production'
						}
					},
				});
				grunt.config('cssmin', {
					minify: {
						expand: true,
						cwd: 'src/css',
						src: ['*.css', '!*.min.css'],
						dest: 'build/css',
						ext: '.min.css'
					}
				});
				return ['compass', 'cssmin'];
			},
			js: function (filePath) {
				grunt.config('jshint', {
					files: ['src/js/egg.js'],
					options: {
						strict: true,
						indent: 4,
						unused: true,
						undef: true,
						browser: true,
						devel: true,
						debug: true,
						jquery: true,
						globals: {
							_: false,
							Backbone: false,
							THREE: false,
							jQuery: false,
							'$': false
						}
					}
				});
				grunt.config('concat', {
					basic: {
						src: ['src/js/egg.js'],
						dest: 'build/js/egg.js'
					},
					extras: {
						src: ['src/js/lib/*.js', 'src/extras.js'],
						dest: 'build/js/lib/all.js'
					}
				});
				grunt.config('uglify', {
					options: {
						banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
					},
					build: {
						files: {
							'build/js/egg.min.js': 'src/js/egg.js',
							'build/js/lib/all.min.js': 'build/js/lib/all.js'
						}
					}
				});
				return [/*'jshint',*/ 'concat', 'uglify'];
			},
			html: function () {
				grunt.config('htmlmin',{
					dist: {                                      // Target
						options: {                                 // Target options
							removeComments: true,
							collapseWhitespace: true
						},
						files: {
							'build/index.html': 'src/html/index.html'
						}
					}
				});
				return ['htmlmin'];
			}
		},
		connect: {
			site: { // オプション未設定の為、空オブジェクト
				options: {
					base: 'build',
					port: 35729
				}
			}
		},
		jshint: {
			options: {
				files: ['src/js/*.js'],
				globals: {
					jQuery: true,
					console: true,
					module: true,
					swfobject: true
				}
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				files: {
					'build/egg.min.js': 'src/js/egg.js'
				}
			}
		},
		imagemin: {                          // Task
			static: {                          // Target
				options: {                       // Target options
					optimizationLevel: 3
				},
				files: {                         // Dictionary of files
//					'dist/img.png': 'src/img.png', // 'destination': 'source'
//					'dist/img.jpg': 'src/img.jpg',
//					'dist/img.gif': 'src/img.gif'
				}
			},
			dynamic: {                         // Another target
				files: [
					{
						expand: true,                  // Enable dynamic expansion
						cwd: 'assets/',                   // Src matches are relative to this path
						src: ['img/*.{png,jpg,gif}'],   // Actual patterns to match
						dest: 'build'                  // Destination path prefix
					}
				]
			}
		},
		yuidoc: {
			compile: {
				name: '<%= pkg.name %>',
				description: '<%= pkg.description %>',
				version: '<%= pkg.version %>',
				url: '<%= pkg.homepage %>',
				options: {
					paths: 'src/',
					outdir: 'doc/',
					markdown: true
				}
			}
		},
		connect: {
			server: {
				options: {
					port: 8080,
					base: './build/',
					keepalive: true,
					hostname: 'localhost'
				}
			}
		},
		concat: {

			extras: {
				src: ['src/js/lib/jquery*.js','src/js/lib/underscore.js','src/js/lib/*.js'],
				dest: 'build/js/lib/all.js'
			}
		},
		htmlmin: {
			dist: {                                      // Target
				options: {                                 // Target options
					removeComments: true,
					collapseWhitespace: true
				},
				files: {
					'build/index.html': 'src/html/index.html'
				}
			}
		}
	});

	/*
	 npm install grunt-contrib-jade --save-dev
	 npm install grunt-contrib-cssmin --save-dev
	 npm install grunt-contrib-jasmine --save-dev
	 npm install grunt-contrib-uglify --save-dev
	 npm install grunt-contrib-jshint --save-dev
	 npm install grunt-contrib-compass --save-dev
	 npm install grunt-contrib-yuidoc --save-dev
	 npm install grunt-contrib-connect --save-dev
	 npm install grunt-contrib-imagemin --save-dev
	 npm install grunt-este-watch --save-dev
	 */
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-yuidoc');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-este-watch');

	grunt.registerTask('default', ['jshint', 'uglify', 'imagemin', 'htmlmin']);
	grunt.registerTask('build', ['jshint', 'uglify', 'imagemin']);
	grunt.registerTask('este', ['esteWatch']);
	grunt.registerTask('server', ['connect']);


};