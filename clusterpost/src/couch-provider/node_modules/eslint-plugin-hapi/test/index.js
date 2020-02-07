'use strict';
var Code = require('code');
var Lab = require('lab');
var Plugin = require('../lib');

var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.describe;
var it = lab.it;

Code.settings.truncateMessages = false;

describe('ESLint Plugin', function () {
  it('exposes all expected rules', function (done) {
    expect(Plugin.rules).to.exist();
    expect(Plugin.rules).to.be.an.object();

    var rules = Object.keys(Plugin.rules);

    expect(rules.length).to.equal(5);
    expect(rules.indexOf('hapi-capitalize-modules')).to.not.equal(-1);
    expect(rules.indexOf('hapi-for-you')).to.not.equal(-1);
    expect(rules.indexOf('hapi-no-var')).to.not.equal(-1);
    expect(rules.indexOf('hapi-scope-start')).to.not.equal(-1);
    expect(rules.indexOf('no-arrowception')).to.not.equal(-1);
    done();
  });
});
