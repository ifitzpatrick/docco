(function() {
  var ck, dir_template, docco, fs, http, showdown;

  http = require('http');

  docco = require('./docco');

  fs = require('fs');

  ck = require('CoffeeKup');

  showdown = require('./../vendor/showdown').Showdown;

  dir_template = ck.compile(fs.readFileSync('docco/resources/dir.coffee', "utf8"));

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
              var filename, readme_name, readme_url, readmes;
              if (err) {
                return didError();
              } else {
                readmes = (function() {
                  var _i, _len, _results;
                  _results = [];
                  for (_i = 0, _len = filenames.length; _i < _len; _i++) {
                    filename = filenames[_i];
                    if (filename.indexOf('README') === 0) _results.push(filename);
                  }
                  return _results;
                })();
                if (readmes.length) {
                  readme_name = readmes[0];
                  readme_url = ("" + url + "/" + readme_name).replace('//', '/');
                  return fs.readFile(readme_url, "utf8", function(err, data) {
                    var html;
                    if (err) {
                      return didError();
                    } else {
                      if ((readme_name.toLowerCase() === "readme.md") || (readme_name.toLowerCase() === "readme.markdown")) {
                        html = showdown.makeHtml(data);
                      } else {
                        html = data;
                      }
                      res.writeHead(200);
                      return res.end(dir_template({
                        filenames: filenames,
                        url: base_url,
                        readme: html
                      }));
                    }
                  });
                } else {
                  res.writeHead(200);
                  return res.end(dir_template({
                    filenames: filenames,
                    url: base_url,
                    readme: ''
                  }));
                }
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
