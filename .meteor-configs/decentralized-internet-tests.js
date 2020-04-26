// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by decentralized-internet.js.
import { name as packageName } from "meteor/startup:decentralized-internet";

// Write your tests here!
// Here is an example.
Tinytest.add('decentralized-internet - example', function (test) {
  test.equal(packageName, "decentralized-internet");
});
