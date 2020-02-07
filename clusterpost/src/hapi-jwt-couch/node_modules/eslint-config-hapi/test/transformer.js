'use strict';


module.exports = [
  {
    ext: '.js',
    transform: function (content, filename) {
      // Ignore fixtures which can break on old versions of Node
      if (filename.indexOf('fixtures') >= 0) {
        return '';
      }

      return content;
    }
  }
];
