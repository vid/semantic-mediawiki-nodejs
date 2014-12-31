/*

Finds pages in a category which have a title syntax like Region, State which it transforms to a location

*/
/*jslint node: true */

'use strict';

var request = require('request'), bot = require('nodemw'), named = require('named-regexp').named;

var config = require('./config.json');

var test = process.argv.length === 3 && process.argv[2] == '-t';

// set up nodemailer
var params =  {
  action: 'ask',
  query: '[[Category:Entity Type]]|limit=10000'
};

var wikiClient = new bot({
  protocol: config.protocol,
  server: config.server,
  path: config.path,
  debug: false
});

wikiClient.logIn(config.user, config.password, processEntities);

var matches = {
  us: /^(:<locale>[-\sa-zA-Z]+), (:<state>[A-Z]{2}) (.*)$/g , // La Crosse County, WI Sustainability Vision
  intl: /^(:<region>[-\sa-zA-Z]+), (:<country>[A-Za-z\-'\.].*?) (.*)$/g // Kilkenny County, Ireland Arts Strategy
 };

function processEntities() {
  wikiClient.api.call(params, function(info, next, data) {
    console.log(info, next, Object.keys(data.query.results).length);
    var found = 0, results = data.query.results, total = Object.keys(results).length;

    var processArticle = function(article) {
      wikiClient.getArticle(article, function(text) {
        ++found;
        var locale, region, country;
        for (var c in matches) {
          var m = matches[c], ms;
          ms = named(m).exec(article);
          if (ms === null) {
          } else if (ms.captures.state) {
            locale = ms.captures.locale[0];
            region = ms.captures.state[0];
            country = 'US';
            break;
          } else if (ms.captures.country) {
            region = ms.captures.region[0];
            country = ms.captures.country[0];
            break;
          }
        }

        console.log(found, total, article, locale, region, country);
        if (found === total) {
          console.log('done');
        }
      });
    };
    for (var a in results) {
      processArticle(a);
    }
  });
}
