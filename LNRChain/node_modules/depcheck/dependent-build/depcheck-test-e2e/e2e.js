import test from 'ava';
import path from 'path';
import { spawnSync } from 'child_process';

const node = process.argv[0];
const depcheck = path.resolve(__dirname, './node_modules/depcheck/bin/depcheck');

function testE2E(t, moduleName, output) {
  const expectedStdOut = output.map(line => `${line}\n`).join('');
  const modulePath = path.resolve(__dirname, 'fake_modules', moduleName);
  const result = spawnSync(node, [depcheck, modulePath]);
  t.is(result.error, undefined);
  t.is(result.stdout.toString(), expectedStdOut);
  t.is(result.stderr.toString(), '');
}

test('find all dependencies', t =>
  testE2E(t, 'good', ['No depcheck issue']));

test('find unused dependencies', t =>
  testE2E(t, 'unused', ['Unused dependencies', '* unused-dep']));

test('find missing dependencies', t =>
  testE2E(t, 'missing', ['Missing dependencies', '* missing-dep']));

test('output error exit code when spawned', (t) => {
  const result = spawnSync(node, [depcheck, './not/exist/folder']);
  t.is(result.error, undefined);
  t.is(result.stdout.toString(), '');
  t.pass(result.stderr.toString().includes('/not/exist/folder'));
  t.pass(result.stderr.toString().includes('not exist'));
  t.not(result.status, 0);
});
