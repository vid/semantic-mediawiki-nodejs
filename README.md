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
        "Unwanted non number field" : ["[^0-9]", ""] // does searc and replace for each replace
      },
      "merges" : {
        "Population 1" : "Populations", // merges into one field (Populations)
        "Population 2" : "Populations"
      },
      "templateName" : "My great template"
    }

then execute ```node uploadCSV.js config.json```

