/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    stylus: {
      compile: {
        options: {
          compress: false
        },
        files: {
          'site/style.css': 'stylus/*.styl'
        }
      }
    },

    watch: {
      livereload: {
        options: { livereload: true },
        files: ['site/*']
      },
      stylus: {
        files: 'stylus/*.styl',
        tasks: ['stylus']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('default', ['stylus']);

};
