var isWindows = typeof process != 'undefined' && 'win32' === process.platform
var EOL = isWindows ? '\r\n' : '\n'

var hits = {};

function deprecate(methodName, message) {
  if(deprecate.silence || hits[methodName]) return;
  hits[methodName] = true;

  var _deprecate = typeof process === 'undefined' ? browserDeprecate : nodeDeprecate;
  _deprecate(methodName, message);
}

function nodeDeprecate(methodName, message) {
  deprecate.stream.write(EOL);
  if(deprecate.color) {
    deprecate.stream.write(deprecate.color);
  }
  deprecate.stream.write('Warning: ' + methodName + ' has been deprecated.');
  deprecate.stream.write(EOL);
  for(var i = 1; i < arguments.length; i++) {
    deprecate.stream.write(arguments[i]);
    deprecate.stream.write(EOL);
  }
  if(deprecate.color) {
    deprecate.stream.write('\x1b[0m');
  }
  deprecate.stream.write(EOL);
  deprecate.stream.write(EOL);
};

function browserDeprecate(methodName, message) {
  console.warn(methodName, ' has been deprecated.');
  for(var i = 1; i < arguments.length; i++) {
    console.log(arguments[i]);
  }
}

if (typeof process !== 'undefined' && typeof process.stderr !== 'undefined') {
  deprecate.stream = process.stderr;
  deprecate.color = deprecate.stream.isTTY && '\x1b[31;1m';
}
deprecate.silence = false;

module.exports = deprecate;
