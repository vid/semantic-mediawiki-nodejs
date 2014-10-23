// Retrieves a list of URLs to test, optionally directly notifies via User page email.

/* Example data template:

{{ #set_internal: has Check URL
|Check URL={{{1|}}}
|Check active=true
|Check notify={{{2|}}}
|Check word={{{3|}}}
|Page={{FULLPAGENAME}}
}}{{{1}}} {{ #if: {{{2|}}}|({{{2}}}) }} {{ #if: {{{3|}}}|for ''{{{3}}}'' }}

*/
/*jslint node: true */

'use strict';

var request = require('request'), bot = require('nodemw'), path = require('path'), nodemailer = require('nodemailer');
var parser = require('./lib/parser.js');

// set up nodemailer
var transporter = nodemailer.createTransport({host: 'smtp.concordia.ca'});
//var mailFrom = 'Check URL <csfg-sysadmin@concordia.ca>';
var mailFrom = 'Check URL <d.mason@concordia.ca>', defaultTo = mailFrom;
var addresses = {};

var config = require('./config.json');
var params =  {
  action: 'ask',
  query: '[[Check active::true]]|?Check URL|?Check notify|?Check word|?Page'
};

var wikiClient = new bot({
  protocol: config.protocol,
  server: config.server,
  path: config.path,
  debug: false
});

wikiClient.logIn(config.user, config.password, getProperty);

function getProperty() {
  var url, notify, word, page;
  wikiClient.api.call(params, function(info, next, data) {
    if(data && data.query && data.query.results) {
      for (var e in data.query.results) {
        var p = data.query.results[e].printouts;
        url = p['Check URL'][0];
        try {
          notify = p['Check notify'] ? p['Check notify'][0].fulltext : null;
        } catch (e) {
        }
        try {
          word = p['Check word'] ? p['Check word'][0] : null;
        } catch (e) {
        }
        page = p.Page ? p.Page[0].fullurl : null;
        console.log(url, notify, page);
        checkURL(url, notify, page, word);
      }
    }
  });
}

// Check that a URL request succeeds, and if a word is required that it's present.
function checkURL(url, notify, page, word) {
  request(url, function (error, response, body) {
    if (error || response.statusCode != 200) {
      console.log('failed', url, notify);
      sendProblemEmail(url, notify, page, error);
    } else if (word && (body || '').toLowerCase().indexOf(word.toLowerCase()) < 0) {
      sendProblemEmail(url, notify, page, {'Word not found': word});
    }
  });
}

function sendProblemEmail(url, notify, page, error) {
  var sendMail = function(email) {
    console.log('got', error, email);
    var sendTo = [defaultTo];
    if (email) {
      sendTo.push(email);
    }
    var mailOptions = {
      from: mailFrom,
      to: sendTo,
      subject: 'Check URL failed for ' + url,
      text: 'Check URL: ' + url + '\nSource wiki page ' + page.replace('intranet', 'auth') + '\nError: ' + JSON.stringify(error, null, 2)
    };

console.log('would send to', sendTo, url, error);
/*
    transporter.sendMail(mailOptions, function(error, info){
      if (error){
        console.log(error);
      } else {
        console.log('Message sent: ' + info.response);
      }
    });
  */
  };

  if (notify) {
    getAddress(notify, sendMail);
  } else {
    sendMail();
  }
}

function getAddress(notify, callback) {
  if (addresses[notify]) {
    callback(addresses[notify]);
    return;
  }
  var email = null, params =  {
    action: 'ask',
    query: '[[User:' + notify.replace('User:', '') + ']]|?Email'
  };
  wikiClient.api.call(params, function(info, next, data) {
    if(data && data.query && data.query.results) {
      try {
        email = data.query.results[Object.keys(data.query.results)[0]].printouts.Email[0].replace('mailto:', '');
        addresses[notify] = email;
      } catch (e) {
        console.log('error retrieving email for', notify);
      }
    }
    callback(email);
  });
}
