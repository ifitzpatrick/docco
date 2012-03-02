doctype 5

html ->
  head  ->
    title -> @title
    meta "http-equiv": "content-type", content: "text/html; charset=UTF-8"
    link rel:"stylesheet", media:"all", href:"docco.css"

  body ->
    div "#container", ->
      div "#background", ->
        if @sources.length > 1
          div "#jump_to", ->
            text "Jump To &hellip",
            div "#jump_wrapper", ->
              div "#jump_page", ->
                for source in @sources
                  a ".source", {href: path.basename destination(source)},
                    path.basename source

      table cellpadding:"0", cellspacing:"0", ->
        thead ->
          tr ->
            th ".docs", ->
              h1 @title

            th ".code", ->

        tbody ->
          i = 0
          for section in @sections
            i++
            tr "#section#{i + 1}", ->
              td ".docs", ->
                div ".pilwrap", ->
                  a ".pilcrow", href: "#section#{i + 1}", "&#182;"

                text section.docs_html

              td ".code", section.code_html

