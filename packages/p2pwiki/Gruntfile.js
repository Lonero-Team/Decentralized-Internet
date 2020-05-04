module.exports = function( grunt ) {

  "use strict";

  grunt.loadNpmTasks('grunt-git-authors');
  grunt.loadNpmTasks('grunt-retire');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    authors: {
      prior: [
        "Nick Niemeir <nick.niemeir@gmail.com>",
        "Ward Cunningham <ward@c2.com>",
        "Paul Rodwell <paul.rodwell@btinternet.com>"
      ]
    },

    retire: {
      node: ['.'],
      options: {packageOnly: true}
    }
  });

  grunt.registerTask('check', ['retire']);

}
