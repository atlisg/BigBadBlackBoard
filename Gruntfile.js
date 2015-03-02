module.exports = function ( grunt ) {
 grunt.loadNpmTasks('grunt-contrib-jshint');
 var taskConfig = {
   jshint: {
     src: ['src/scripts/blackboard.js', 'src/scripts/buttons.js'],
     gruntfile: ['Gruntfile.js'],
     options: {
      "curly": true,
      "eqnull": true,
      "eqeqeq": true,
      "globals": {
        "jQuery": true,
      }
     }
   }
 };
 grunt.initConfig(taskConfig);
};