"use strict";

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jsdoc : {
            dist : {
                src: ['README.md', 'package.json', 'lib/*.js'],
                options: {
                    destination: 'doc',
                    template: './config/jsdoc-template',
                    configure: './config/jsdoc.conf.json'
                }
            }
        }
    });

    // Load the plugins:
    grunt.loadNpmTasks('grunt-jsdoc');

    // Default task(s).
    grunt.registerTask('default', ['jsdoc']);

};
