module.exports = function(grunt) {

    var REQUIRED_BUILD_ENVVARS = [
        'API_ROOT'
    ];

    var missingKeys = function (obj, keys) {
        var missingKeys = [];
        keys.forEach(function (k) {
            if (obj[k] === undefined) {
                missingKeys.push(k);
            }
        });
        return missingKeys;
    };

    var buildEnvironmentValid = function () {
        var missing = missingKeys(process.env, REQUIRED_BUILD_ENVVARS);
        return missing.length === 0;
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            source: {
                files: ['Gruntfile.js', 'src/**/*.js', 'src/**/*.html'],
                tasks: ['jshint:all', 'build']
            }
        },
        jshint: {
            all: ['Gruntfile.js', 'src/js/*.js']
        },
        'http-server': {
            dev: {
                root: "src/",
                port: 8282,
                host: "127.0.0.1",
                cache: 0,
                showDir : true,
                autoIndex: true,
                defaultExt: "html",
                runInBackground: true
            },
            prod: {
                root: "dist/",
                port: 8282,
                host: "127.0.0.1",
                cache: 0,
                showDir : true,
                autoIndex: true,
                defaultExt: "html",
                runInBackground: false
            }
        },
        render: {
            config: {
                options: {
                    data: {
                        pkg: grunt.file.readJSON('package.json'),
                        env: process.env
                    }
                },
                files: {
                    'manifest.json': ['manifest.ejs.json']
                }
            }
        },
        copy: {
            entrypoints: {
                files: [
                    {'dist/manifest.json': ['manifest.json']},
                    {'dist/popup.html': ['popup.html']},
                    {'dist/background.html': ['background.html']}
                ]
            },
            assets: {
                files: [
                    // includes files within path and its sub-directories
                    {cwd: 'assets',
                     expand: true,
                     src: ['**'],
                     dest: 'dist/assets'}
                ]
            }
        },
        html2js: {
            popup: {
                options: {
                    module: 'mc-addon.popup.templates'
                },
                src: ['src/views/popup/*.html'],
                dest: 'gen/templates-popup.js'
            }
        },
        useminPrepare: {
            html: ['popup.html', 'background.html', 'runner.html'],
            options: {
                dest: 'dist',
                flow: { steps: { 'js': ['concat']}, post: {}}
            }
        },
        usemin: {
            html: ['dist/popup.html', 'dist/background.html', 'dist/runner.html']
        }
    });

    grunt.loadNpmTasks('grunt-fail');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-http-server');
    grunt.loadNpmTasks('grunt-ejs-render');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-usemin');

    var errmsg, failmsg;

    var buildTasks = [
        'render',
        'html2js'
    ];

    if (!buildEnvironmentValid()) {
        errmsg = "Missing envvars [" + missingKeys(process.env, REQUIRED_BUILD_ENVVARS) + "].";
        failmsg = "fail:" + errmsg + ":7";
        buildTasks.unshift(failmsg);
    }

    grunt.registerTask('build', buildTasks);
    grunt.registerTask('dist', [
        'build',
        'copy',
        'useminPrepare',
        'concat:generated',
        'usemin']);
    grunt.registerTask('default', ['watch']);
};
