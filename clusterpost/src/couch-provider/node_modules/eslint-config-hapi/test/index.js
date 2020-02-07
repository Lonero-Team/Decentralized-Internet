'use strict';
var Fs = require('fs');
var Path = require('path');
var Code = require('code');
var ESLint = require('eslint');
var Lab = require('lab');
var Config = require('../lib');
var Es5Config = require('../lib/es5');
var CLIEngine = ESLint.CLIEngine;

// Test shortcuts
var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.describe;
var it = lab.it;

Code.settings.truncateMessages = false;

function getLinter (config) {
  return new CLIEngine({
    useEslintrc: false,
    baseConfig: config || Config
  });
}

function lintFile (file, config) {
  var cli = getLinter(config);
  var data = Fs.readFileSync(Path.join(__dirname, file), 'utf8');

  return cli.executeOnText(data);
}

describe('eslint-config-hapi', function () {
  it('enforces file level strict mode', function (done) {
    var output = lintFile('fixtures/strict.js');
    var results = output.results[0];

    expect(output.errorCount).to.equal(1);
    expect(output.warningCount).to.equal(0);
    expect(results.errorCount).to.equal(1);
    expect(results.warningCount).to.equal(0);

    var msg = results.messages[0];

    expect(msg.ruleId).to.equal('strict');
    expect(msg.severity).to.equal(2);
    expect(msg.message).to.equal('Use the global form of \'use strict\'.');
    expect(msg.line).to.equal(2);
    expect(msg.column).to.equal(1);
    expect(msg.nodeType).to.equal('Program');
    expect(msg.source).to.equal('const foo = \'this should be using strict mode but isnt\';');
    done();
  });

  it('enforces stroustrup style braces', function (done) {
    var output = lintFile('fixtures/brace-style.js');
    var results = output.results[0];

    expect(output.errorCount).to.equal(0);
    expect(output.warningCount).to.equal(1);
    expect(results.errorCount).to.equal(0);
    expect(results.warningCount).to.equal(1);

    var msg = results.messages[0];

    expect(msg.ruleId).to.equal('brace-style');
    expect(msg.severity).to.equal(1);
    expect(msg.message).to.equal('Closing curly brace appears on the same line as the subsequent block.');
    expect(msg.line).to.equal(7);
    expect(msg.column).to.equal(8);
    expect(msg.nodeType).to.equal('BlockStatement');
    expect(msg.source).to.equal('} else {');
    done();
  });

  it('enforces four space indentation', function (done) {
    var output = lintFile('fixtures/indent.js');
    var results = output.results[0];

    expect(output.errorCount).to.equal(1);
    expect(output.warningCount).to.equal(0);
    expect(results.errorCount).to.equal(1);
    expect(results.warningCount).to.equal(0);

    var msg = results.messages[0];

    expect(msg.ruleId).to.equal('indent');
    expect(msg.severity).to.equal(2);
    expect(msg.message).to.equal('Expected indentation of 4 space characters but found 2.');
    expect(msg.line).to.equal(4);
    expect(msg.column).to.equal(3);
    expect(msg.nodeType).to.equal('ReturnStatement');
    expect(msg.source).to.equal('  return value + 1;');
    done();
  });

  it('enforces case indentation in switch statements', function (done) {
    var output = lintFile('fixtures/indent-switch-case.js');
    var results = output.results[0];

    expect(output.errorCount).to.equal(5);
    expect(output.warningCount).to.equal(0);
    expect(results.errorCount).to.equal(5);
    expect(results.warningCount).to.equal(0);

    var msg = results.messages[0];

    expect(msg.ruleId).to.equal('indent');
    expect(msg.severity).to.equal(2);
    expect(msg.message).to.equal('Expected indentation of 4 space characters but found 0.');
    expect(msg.line).to.equal(10);
    expect(msg.column).to.equal(1);
    expect(msg.nodeType).to.equal('SwitchCase');
    expect(msg.source).to.equal('case \'bar\':');

    msg = results.messages[1];

    expect(msg.ruleId).to.equal('indent');
    expect(msg.severity).to.equal(2);
    expect(msg.message).to.equal('Expected indentation of 8 space characters but found 4.');
    expect(msg.line).to.equal(11);
    expect(msg.column).to.equal(5);
    expect(msg.nodeType).to.equal('ExpressionStatement');
    expect(msg.source).to.equal('    result = 2;');

    msg = results.messages[2];

    expect(msg.ruleId).to.equal('indent');
    expect(msg.severity).to.equal(2);
    expect(msg.message).to.equal('Expected indentation of 8 space characters but found 4.');
    expect(msg.line).to.equal(12);
    expect(msg.column).to.equal(5);
    expect(msg.nodeType).to.equal('BreakStatement');
    expect(msg.source).to.equal('    break;');

    msg = results.messages[3];

    expect(msg.ruleId).to.equal('indent');
    expect(msg.severity).to.equal(2);
    expect(msg.message).to.equal('Expected indentation of 8 space characters but found 4.');
    expect(msg.line).to.equal(14);
    expect(msg.column).to.equal(5);
    expect(msg.nodeType).to.equal('ExpressionStatement');
    expect(msg.source).to.equal('    result = 3;');

    msg = results.messages[4];

    expect(msg.ruleId).to.equal('indent');
    expect(msg.severity).to.equal(2);
    expect(msg.message).to.equal('Expected indentation of 8 space characters but found 4.');
    expect(msg.line).to.equal(15);
    expect(msg.column).to.equal(5);
    expect(msg.nodeType).to.equal('BreakStatement');
    expect(msg.source).to.equal('    break;');

    done();
  });

  it('enforces semicolon usage', function (done) {
    var output = lintFile('fixtures/semi.js');
    var results = output.results[0];

    expect(output.errorCount).to.equal(1);
    expect(output.warningCount).to.equal(0);
    expect(results.errorCount).to.equal(1);
    expect(results.warningCount).to.equal(0);

    var msg = results.messages[0];

    expect(msg.ruleId).to.equal('semi');
    expect(msg.severity).to.equal(2);
    expect(msg.message).to.equal('Missing semicolon.');
    expect(msg.line).to.equal(4);
    expect(msg.column).to.equal(14);
    expect(msg.nodeType).to.equal('ReturnStatement');
    expect(msg.source).to.equal('    return 42');
    done();
  });

  it('enforces space-before-function-paren', function (done) {
    var output = lintFile('fixtures/space-before-function-paren.js');
    var results = output.results[0];

    expect(output.errorCount).to.equal(2);
    expect(output.warningCount).to.equal(0);
    expect(results.errorCount).to.equal(2);
    expect(results.warningCount).to.equal(0);

    var msg = results.messages[0];

    expect(msg.ruleId).to.equal('space-before-function-paren');
    expect(msg.severity).to.equal(2);
    expect(msg.message).to.equal('Missing space before function parentheses.');
    expect(msg.line).to.equal(8);
    expect(msg.column).to.equal(21);
    expect(msg.nodeType).to.equal('FunctionExpression');
    expect(msg.source).to.equal('const bar = function() {');

    msg = results.messages[1];

    expect(msg.ruleId).to.equal('space-before-function-paren');
    expect(msg.severity).to.equal(2);
    expect(msg.message).to.equal('Unexpected space before function parentheses.');
    expect(msg.line).to.equal(16);
    expect(msg.column).to.equal(27);
    expect(msg.nodeType).to.equal('FunctionExpression');
    expect(msg.source).to.equal('const quux = function quux () {');
    done();
  });

  it('enforces hapi/hapi-for-you', function (done) {
    var output = lintFile('fixtures/hapi-for-you.js');
    var results = output.results[0];

    expect(output.errorCount).to.equal(0);
    expect(output.warningCount).to.equal(2);
    expect(results.errorCount).to.equal(0);
    expect(results.warningCount).to.equal(2);

    var msg = results.messages[0];

    expect(msg.ruleId).to.equal('hapi/hapi-for-you');
    expect(msg.severity).to.equal(1);
    expect(msg.message).to.equal('Expected iterator \'j\', but got \'k\'.');
    expect(msg.line).to.equal(6);
    expect(msg.column).to.equal(5);
    expect(msg.nodeType).to.equal('ForStatement');
    expect(msg.source).to.equal('    for (let k = 0; k < arr.length; k++) {');

    msg = results.messages[1];

    expect(msg.ruleId).to.equal('hapi/hapi-for-you');
    expect(msg.severity).to.equal(1);
    expect(msg.message).to.equal('Update to iterator should use prefix operator.');
    expect(msg.line).to.equal(6);
    expect(msg.column).to.equal(5);
    expect(msg.nodeType).to.equal('ForStatement');
    expect(msg.source).to.equal('    for (let k = 0; k < arr.length; k++) {');
    done();
  });

  it('enforces hapi/hapi-scope-start', function (done) {
    var output = lintFile('fixtures/hapi-scope-start.js');
    var results = output.results[0];

    expect(output.errorCount).to.equal(0);
    expect(output.warningCount).to.equal(1);
    expect(results.errorCount).to.equal(0);
    expect(results.warningCount).to.equal(1);

    var msg = results.messages[0];

    expect(msg.ruleId).to.equal('hapi/hapi-scope-start');
    expect(msg.severity).to.equal(1);
    expect(msg.message).to.equal('Missing blank line at beginning of function.');
    expect(msg.line).to.equal(2);
    expect(msg.column).to.equal(13);
    expect(msg.nodeType).to.equal('FunctionExpression');
    expect(msg.source).to.equal('const foo = function () {');
    done();
  });

  it('enforces hapi/hapi-capitalize-modules', function (done) {
    var output = lintFile('fixtures/hapi-capitalize-modules.js');
    var results = output.results[0];

    expect(output.errorCount).to.equal(0);
    expect(output.warningCount).to.equal(1);
    expect(results.errorCount).to.equal(0);
    expect(results.warningCount).to.equal(1);

    var msg = results.messages[0];

    expect(msg.ruleId).to.equal('hapi/hapi-capitalize-modules');
    expect(msg.severity).to.equal(1);
    expect(msg.message).to.equal('Imported module variable name not capitalized.');
    expect(msg.line).to.equal(4);
    expect(msg.column).to.equal(7);
    expect(msg.nodeType).to.equal('VariableDeclarator');
    expect(msg.source).to.equal('const net = require(\'net\');');
    done();
  });

  it('enforces hapi/no-arrowception', function (done) {
    var output = lintFile('fixtures/no-arrowception.js');
    var results = output.results[0];

    expect(output.errorCount).to.equal(1);
    expect(output.warningCount).to.equal(0);
    expect(results.errorCount).to.equal(1);
    expect(results.warningCount).to.equal(0);

    var msg = results.messages[0];

    expect(msg.ruleId).to.equal('hapi/no-arrowception');
    expect(msg.severity).to.equal(2);
    expect(msg.message).to.equal('Arrow function implicitly creates arrow function.');
    expect(msg.line).to.equal(2);
    expect(msg.column).to.equal(13);
    expect(msg.nodeType).to.equal('ArrowFunctionExpression');
    expect(msg.source).to.equal('const foo = () => () => 85;');
    done();
  });

  it('enforces no-shadow rule', function (done) {
    var output = lintFile('fixtures/no-shadow.js');
    var results = output.results[0];

    expect(output.errorCount).to.equal(0);
    expect(output.warningCount).to.equal(1);
    expect(results.errorCount).to.equal(0);
    expect(results.warningCount).to.equal(1);

    var msg = results.messages[0];

    expect(msg.ruleId).to.equal('no-shadow');
    expect(msg.severity).to.equal(1);
    expect(msg.message).to.equal('\'res\' is already declared in the upper scope.');
    expect(msg.line).to.equal(27);
    expect(msg.column).to.equal(33);
    expect(msg.nodeType).to.equal('Identifier');
    expect(msg.source).to.equal('        const inner = function (res) {');
    done();
  });

  it('enforces one-var rule', function (done) {
    var output = lintFile('fixtures/one-var.js');
    var results = output.results[0];

    expect(output.errorCount).to.equal(1);
    expect(output.warningCount).to.equal(0);
    expect(results.errorCount).to.equal(1);
    expect(results.warningCount).to.equal(0);

    var msg = results.messages[0];

    expect(msg.ruleId).to.equal('one-var');
    expect(msg.severity).to.equal(2);
    expect(msg.message).to.equal('Split \'let\' declarations into multiple statements.');
    expect(msg.line).to.equal(5);
    expect(msg.column).to.equal(1);
    expect(msg.nodeType).to.equal('VariableDeclaration');
    expect(msg.source).to.equal('let baz, quux;');
    done();
  });

  it('enforces no-unused-vars', function (done) {
    var output = lintFile('fixtures/no-unused-vars.js');
    var results = output.results[0];

    expect(output.errorCount).to.equal(0);
    expect(output.warningCount).to.equal(1);
    expect(results.errorCount).to.equal(0);
    expect(results.warningCount).to.equal(1);

    var msg = results.messages[0];

    expect(msg.ruleId).to.equal('no-unused-vars');
    expect(msg.severity).to.equal(1);
    expect(msg.message).to.equal('\'internals2\' is defined but never used');
    expect(msg.line).to.equal(3);
    expect(msg.column).to.equal(7);
    expect(msg.nodeType).to.equal('Identifier');
    expect(msg.source).to.equal('const internals2 = {};');
    done();
  });

  it('enforces prefer-const', function (done) {
    var output = lintFile('fixtures/prefer-const.js');
    var results = output.results[0];

    expect(output.errorCount).to.equal(1);
    expect(output.warningCount).to.equal(0);
    expect(results.errorCount).to.equal(1);
    expect(results.warningCount).to.equal(0);

    var msg = results.messages[0];

    expect(msg.ruleId).to.equal('prefer-const');
    expect(msg.severity).to.equal(2);
    expect(msg.message).to.equal('\'foo\' is never modified, use \'const\' instead.');
    expect(msg.line).to.equal(4);
    expect(msg.column).to.equal(5);
    expect(msg.nodeType).to.equal('Identifier');
    expect(msg.source).to.equal('let foo = 1;');
    done();
  });

  it('enforces no-var', function (done) {
    var output = lintFile('fixtures/no-var.js');
    var results = output.results[0];

    expect(output.errorCount).to.equal(1);
    expect(output.warningCount).to.equal(0);
    expect(results.errorCount).to.equal(1);
    expect(results.warningCount).to.equal(0);

    var msg = results.messages[0];

    expect(msg.ruleId).to.equal('no-var');
    expect(msg.severity).to.equal(2);
    expect(msg.message).to.equal('Unexpected var, use let or const instead.');
    expect(msg.line).to.equal(3);
    expect(msg.column).to.equal(1);
    expect(msg.nodeType).to.equal('VariableDeclaration');
    expect(msg.source).to.equal('var foo = 1;');
    done();
  });

  it('enforces arrow-parens', function (done) {
    var output = lintFile('fixtures/arrow-parens.js');
    var results = output.results[0];

    expect(output.errorCount).to.equal(1);
    expect(output.warningCount).to.equal(0);
    expect(results.errorCount).to.equal(1);
    expect(results.warningCount).to.equal(0);

    var msg = results.messages[0];

    expect(msg.ruleId).to.equal('arrow-parens');
    expect(msg.severity).to.equal(2);
    expect(msg.message).to.equal('Expected parentheses around arrow function argument.');
    expect(msg.line).to.equal(2);
    expect(msg.column).to.equal(13);
    expect(msg.nodeType).to.equal('ArrowFunctionExpression');
    expect(msg.source).to.equal('const foo = bar => {');
    done();
  });

  it('enforces arrow-spacing', function (done) {
    var output = lintFile('fixtures/arrow-spacing.js');
    var results = output.results[0];

    expect(output.errorCount).to.equal(2);
    expect(output.warningCount).to.equal(0);
    expect(results.errorCount).to.equal(2);
    expect(results.warningCount).to.equal(0);

    var msg = results.messages[0];
    expect(msg.ruleId).to.equal('arrow-spacing');
    expect(msg.severity).to.equal(2);
    expect(msg.message).to.equal('Missing space before =>');
    expect(msg.line).to.equal(2);
    expect(msg.column).to.equal(17);
    expect(msg.nodeType).to.equal('Punctuator');
    expect(msg.source).to.equal('const foo = (bar)=> {');

    msg = results.messages[1];
    expect(msg.ruleId).to.equal('arrow-spacing');
    expect(msg.severity).to.equal(2);
    expect(msg.message).to.equal('Missing space after =>');
    expect(msg.line).to.equal(7);
    expect(msg.column).to.equal(22);
    expect(msg.nodeType).to.equal('Punctuator');
    expect(msg.source).to.equal('const baz = (quux) =>{');
    done();
  });

  it('enforces prefer-arrow-callback', function (done) {
    var output = lintFile('fixtures/prefer-arrow-callback.js');
    var results = output.results[0];

    expect(output.errorCount).to.equal(1);
    expect(output.warningCount).to.equal(0);
    expect(results.errorCount).to.equal(1);
    expect(results.warningCount).to.equal(0);

    var msg = results.messages[0];

    expect(msg.ruleId).to.equal('prefer-arrow-callback');
    expect(msg.severity).to.equal(2);
    expect(msg.message).to.equal('Unexpected function expression.');
    expect(msg.line).to.equal(21);
    expect(msg.column).to.equal(8);
    expect(msg.nodeType).to.equal('FunctionExpression');
    expect(msg.source).to.equal('foo(4, function (err, value) {');
    done();
  });

  it('enforces no-constant-condition rule', function (done) {
    var output = lintFile('fixtures/no-constant-condition.js');
    var results = output.results[0];

    expect(output.errorCount).to.equal(1);
    expect(output.warningCount).to.equal(0);
    expect(results.errorCount).to.equal(1);
    expect(results.warningCount).to.equal(0);

    var msg = results.messages[0];

    expect(msg.ruleId).to.equal('no-constant-condition');
    expect(msg.severity).to.equal(2);
    expect(msg.message).to.equal('Unexpected constant condition.');
    expect(msg.line).to.equal(3);
    expect(msg.column).to.equal(1);
    expect(msg.nodeType).to.equal('IfStatement');
    expect(msg.source).to.equal('if ((foo) => 1) {');
    done();
  });

  it('enforces handle-callback-err rule', function (done) {
    var output = lintFile('fixtures/handle-callback-err.js');
    var results = output.results[0];

    expect(output.errorCount).to.equal(2);
    expect(output.warningCount).to.equal(0);
    expect(results.errorCount).to.equal(2);
    expect(results.warningCount).to.equal(0);

    var msg = results.messages[0];

    expect(msg.ruleId).to.equal('handle-callback-err');
    expect(msg.severity).to.equal(2);
    expect(msg.message).to.equal('Expected error to be handled.');
    expect(msg.line).to.equal(6);
    expect(msg.column).to.equal(17);
    expect(msg.nodeType).to.equal('FunctionExpression');
    expect(msg.source).to.equal('    const top = function (err) {');

    msg = results.messages[1];

    expect(msg.ruleId).to.equal('handle-callback-err');
    expect(msg.severity).to.equal(2);
    expect(msg.message).to.equal('Expected error to be handled.');
    expect(msg.line).to.equal(8);
    expect(msg.column).to.equal(23);
    expect(msg.nodeType).to.equal('FunctionExpression');
    expect(msg.source).to.equal('        const inner = function (e) {');

    done();
  });

  it('uses the node environment', function (done) {
    var output = lintFile('fixtures/node-env.js');
    var results = output.results[0];

    expect(output.errorCount).to.equal(0);
    expect(output.warningCount).to.equal(0);
    expect(results.errorCount).to.equal(0);
    expect(results.warningCount).to.equal(0);
    expect(results.messages).to.deep.equal([]);
    done();
  });

  it('uses the ES6 environment', function (done) {
    var output = lintFile('fixtures/es6-env.js');
    var results = output.results[0];

    expect(output.errorCount).to.equal(0);
    expect(output.warningCount).to.equal(0);
    expect(results.errorCount).to.equal(0);
    expect(results.warningCount).to.equal(0);
    expect(results.messages).to.deep.equal([]);
    done();
  });

  it('does not enforce the camelcase lint rule', function (done) {
    var output = lintFile('fixtures/camelcase.js');
    var results = output.results[0];

    expect(output.errorCount).to.equal(0);
    expect(output.warningCount).to.equal(0);
    expect(results.errorCount).to.equal(0);
    expect(results.warningCount).to.equal(0);
    expect(results.messages).to.deep.equal([]);
    done();
  });

  it('supports ES5 linting', function (done) {
    var output = lintFile('fixtures/es5.js', Es5Config);
    var results = output.results[0];

    expect(output.errorCount).to.equal(0);
    expect(output.warningCount).to.equal(0);
    expect(results.errorCount).to.equal(0);
    expect(results.warningCount).to.equal(0);
    expect(results.messages).to.deep.equal([]);
    done();
  });
});
