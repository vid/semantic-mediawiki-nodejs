// set a property based

/*jslint node: true */

'use strict';

var bot = require('nodemw');

var configArg = process.argv[2];
if (!configArg) {
  console.log('usage:' + process.argv[0] + ' config.json query property value');
  process.exit(1);
}

var config = require(configArg);

var wikiClient = new bot({
    protocol: config.protocol,
    server: config.server,
    path: config.path
//    debug: true
  });

// login then parse and edit
wikiClient.logIn(config.user, config.password, parseAndEdit);

// parse the CSV file then edit the pages
function parseAndEdit() {
}
