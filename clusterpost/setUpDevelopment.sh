#!/bin/bash

npm link src/clusterpost-auth
npm link src/clusterpost-fs
npm link src/clusterpost-lib
npm link src/clusterpost-list
npm link src/clusterpost-model
npm link src/clusterpost-provider
npm link src/clusterpost-static
npm link src/couch-provider
npm link src/couch-update-views
npm link src/hapi-jwt-couch
npm link src/hapi-jwt-couch-lib

ln -s src/clusterpost-server/index.js index.js