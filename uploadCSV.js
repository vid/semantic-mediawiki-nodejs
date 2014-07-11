// converts the content in a csv file to SMW templated data and uploads them

var csv = require('csv'), bot = require('nodemw');

var configArg = process.argv[2];
if (!configArg) {
  console.log('usage:' + process.argv[0] + ' config.json');
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
  var templates = [];
  csv().from(config.inputCSV).to.array(function(csvRows, count) {
    var hrows = csvRows.shift();
    console.log('csv has cols', hrows.length, 'rows', csvRows.length);
    var rowCount = 0;
    csvRows.forEach(function(row) {
      var title = 'import-' + ++rowCount, merges = {}, r = '{{'+config.templateName + '\n';
      for (var i = 0; i < hrows.length; i++) {
        // if row has data
        if (row[i]) {
          var header = hrows[i], val = row[i];
          if (config.merges[header]) {
            var merged = config.merges[header];
            var m = merges[merged] || [];
            m.push(val);
            merges[merged] = m;
          } else {
            // transform the value based on a two value array
            if (config.replace && config.replace[header]) {
              var repl = new RegExp(config.replace[header][0], 'gi');
              val = val.replace(repl, config.replace[header][1]);
            }
            r += '|' + header + '=' + val + '\n';
            // asign title if appropriate
            if (hrows[i] == config.titleRow) {
              title = val;
            }
          }
        }
      }
      for (var f in merges) {
        console.log(f, merges[f]);
        r += '|' + f + '=' + merges[f].join(',');
      }
      r += '}}\n';
      templates.push({ title : title, data: r});
    });
    console.log(JSON.stringify(templates, null, 2));
    templates.forEach(function(t) {
      wikiClient.edit(t.title, t.data, 'importing from ' + config.inputCSV, function(result) { 
        if (result.result !== 'Success') {
          console.log(result.title, result.result); 
        }
      }); 
    });

  });
}
