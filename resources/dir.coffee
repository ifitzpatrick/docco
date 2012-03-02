doctype 5

html ->

  head ->
    title "Docco"
    meta charset: "utf-8"
    link rel:"stylesheet", media:"all", href:"docco.css"

  body ->
    div "#containter",
      table ->
        thead ->
          tr ->
            th ".docs", ->
              h1 @url

            th ".code", ->

        tbody ->
          tr ->
            td ".docs", @readme
            td ".code", ->
              for filename in @filenames
                div ->
                  a ".url.filename", href: "#{@url}/#{filename}".replace('//', '/'),
                    filename
