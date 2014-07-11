nodejs-semantic-mediawiki
=========================

proggies for use with smw

uploadCSV.js
========

create a config.json like this:

    {
      "protocol" : "http",
      "server" : "my.great.domain",
      "path" : "mw",
      "user" : "My great account",
      "password" : "My great password",
      "inputCSV" : "./my great.csv",
      "titleRow" : "Project Title", // text that will be the title
      "replace" : {
        "Field which should only be digits" : ["[^0-9]", ""] // does search and replace for each field
      },
      "merges" : {
        "Population 1" : "Populations", // merges into one field (Populations)
        "Population 2" : "Populations"
      },
      "templateName" : "My great template"
    }

then execute ```node uploadCSV.js config.json```

