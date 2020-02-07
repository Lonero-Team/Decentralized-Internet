module.exports = function(grunt) {
    var name = 'clusterpost-list';
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        ngtemplates: {
            'clusterpost-list': {
                src: './src/**.html',
                dest: './dist/clusterpost-list.templates.js'
            }
        },
        assets:{
            appJS: [
            'node_modules/jsonformatter/dist/json-formatter.min.js',
            './src/clusterpost-list.module.js',
            './src/clusterpost-list.service.js',
            './src/clusterpost-jobs.directive.js',
            './src/clusterpost-app.directive.js',
            './src/clusterpost-es-admin.directive.js',
            './dist/clusterpost-list.templates.js'
            ]
        },
        concat: {
            prod: { //target
                files: {
                    './dist/clusterpost-list.min.js' : '<%= assets.appJS %>'
                }
            },
            dev: {
                options: {
                    sourceMap: true
                },
                files: {
                    './dist/clusterpost-list.min.js' : '<%= assets.appJS %>'
                }
            }
        },
        ngAnnotate: {
		    options: {
                singleQuotes: true
            },
            app: {
                files: {
                    './dist/clusterpost-list.min.js': './dist/clusterpost-list.min.js'
                }
            }
		},
		uglify: {
            prod: {
                files: {
                    './dist/clusterpost-list.min.js': ['./dist/clusterpost-list.min.js']
                }
            },
            dev: {
                options: {
                    mangle: false,
                    compress: false,
                    sourceMap: true,
                    sourceMapIncludeSources: true,
                    sourceMapIn: './dist/clusterpost-list.min.js.map'
                },
                files: { //target
                    './dist/clusterpost-list.min.js': ['./dist/clusterpost-list.min.js']
                }
            }
		},
        cssmin: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1
            },
            target: {
                files: {
                    'dist/clusterpost-list.min.css': ['src/*.css', './node_modules/jsonformatter/dist/json-formatter.min.css']
                }
            }
        },
        clean: {
            dev: ['./dist/clusterpost-list.templates.js'],
            prod: ['./dist/clusterpost-list.templates.js', 'dist/clusterpost-list.min.js.map']
        }   
    });

    //load grunt tasks
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-ng-annotate'); 
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-contrib-cssmin');


    //register grunt default task
    grunt.registerTask('default', [ 'ngtemplates', 'concat:prod', 'ngAnnotate', 'uglify:prod', 'cssmin', 'clean:prod']);
    //register dev task
    grunt.registerTask('dev', [ 'ngtemplates', 'concat:dev', 'ngAnnotate', 'uglify:dev', 'cssmin', 'clean:dev']);
}