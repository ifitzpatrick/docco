(function() {
  var dir_template, docco, fs, http;

  http = require('http');

  docco = require('./docco');

  fs = require('fs');

  dir_template = docco.template(fs.readFileSync('docco/resources/dir.jst', "utf8"));

  http.createServer(function(req, res) {
    var base_url, didError, url;
    base_url = req.url;
    url = '.' + base_url;
    didError = function(message, console_message) {
      message = message || 'an error has occured retrieving file data';
      console.error("Error: " + (console_message || message));
      res.writeHead(400);
      res.end(message);
      res.writeHead(200);
      res.end();
    };
    if (base_url.indexOf('docco.css') >= 0) {
      return fs.readFile('docco/resources/docco.css', function(err, data) {
        if (err) {
          return didError();
        } else {
          res.setHeader('Content-type', 'text/css');
          res.writeHead(200);
          return res.end(data);
        }
      });
    } else if (base_url.indexOf('favicon.ico') >= 0) {
      res.writeHead(200);
      return res.end('');
    } else {
      return fs.stat(url, function(err, stat) {
        if (err) {
          console.log(err);
          console.log('fail');
          return didError();
        } else {
          if (stat.isDirectory()) {
            return fs.readdir(url, function(err, filenames) {
              if (err) {
                return didError();
              } else {
                res.writeHead(200);
                return res.end(dir_template({
                  filenames: filenames,
                  url: base_url
                }));
              }
            });
          } else if (stat.isFile()) {
            return docco.generate_documentation(url, function(err, html) {
              if (err) {
                return didError('Cannot display documentation for files with this file extension', err);
              } else {
                res.writeHead(200);
                return res.end(html);
              }
            });
          }
        }
      });
    }
  }).listen(3000);

  console.log('Serving documentation at port 3000...');

}).call(this);
