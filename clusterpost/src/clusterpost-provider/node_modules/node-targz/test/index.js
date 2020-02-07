var assert = require('assert');
var tarGzip = require('../lib');

describe('node targs', () => {
  it('compress', (done) => {
    tarGzip.compress({
      source: './test/example/example-compress',
      destination: './test/example-compress.tar.gz',
      level: 6,
      memLevel: 6,
      options: {
        entries: ['test.txt']
      }
    }, function(error) {
      assert.ifError(error);
      done();
    });
  });

  it('decompress', (done) => {
    tarGzip.decompress({
      source: './test/example/example-decompress.tar.gz',
      destination: './test/example-decompress'
    }, function(error) {
      assert.ifError(error);
      done();
    });
  });
});