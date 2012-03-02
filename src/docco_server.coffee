http  = require 'http'
docco = require './docco'
fs    = require 'fs'

dir_template = docco.template fs.readFileSync('docco/resources/dir.jst', "utf8")

http.createServer((req, res) ->
  base_url = req.url
  url      = '.' + base_url
  didError = (message, console_message) ->
    message = message or 'an error has occured retrieving file data'
    console.error "Error: #{console_message or message}"
    res.writeHead 400
    res.end message

    res.writeHead 200
    res.end()
    return

  if base_url.indexOf('docco.css') >= 0
    fs.readFile 'docco/resources/docco.css', (err, data) ->
      if err
        didError()
      else
        res.setHeader 'Content-type', 'text/css'
        res.writeHead 200
        res.end data
  else if base_url.indexOf('favicon.ico') >= 0
    res.writeHead 200
    res.end ''
  else
    fs.stat url, (err, stat) ->
      if err
        console.log err
        console.log 'fail'
        didError()
      else
        if stat.isDirectory()
          fs.readdir url, (err, filenames) ->
            if err
              didError()
            else
              res.writeHead 200
              res.end dir_template filenames: filenames, url: base_url

        else if stat.isFile()
          docco.generate_documentation url, (err, html) ->
            if err then didError 'Cannot display documentation for files with this file extension',
              err
            else
              res.writeHead 200
              res.end html

).listen 3000

console.log 'Serving documentation at port 3000...'

