// get a property for the query results

/*jslint node: true */

'use strict';

var bot = require('nodemw'), path = require('path');

var parser = require('./lib/parser.js');

if (process.argv.length < 4) {
  console.log('usage:' + process.argv[0] + ' config.json query property');
  process.exit(1);
}

var configArg = path.resolve(process.argv[2]), query = process.argv[3], property = process.argv[4];

var config = require(configArg);
var params =  {
  action: 'ask',
  query: query
};

var wikiClient = new bot({
  protocol: config.protocol,
  server: config.server,
  path: config.path,
  debug: false
});

wikiClient.logIn(config.user, config.password, getProperty);

function getProperty() {
  wikiClient.api.call(params, function(info, next, data) {
    if(data && data.query && data.query.results) {
      for (var e in data.query.results) { processResult(e); }
    }
  });
}

function processResult(title) {
  wikiClient.getArticle(title, function(contents) {
    var props = parser.parseTemplates(contents)[0];
    console.log(property ? property.split(',').reduce(function(p) { return props[property]; }): props);
  });
}
