Package.describe({
  name: 'startup:decentralized-internet',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'An SDK for building decentralized web and distributed computing projects',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/Lonero-Team/Decentralized-Internet',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.10.2');
  api.use('ecmascript');
  api.mainModule('decentralized-internet.js');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('startup:decentralized-internet');
  api.mainModule('decentralized-internet-tests.js');
});
