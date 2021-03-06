(function() {
  var ck, destination, docco_styles, docco_template, ensure_directory, exec, ext, fs, generate_documentation, generate_html, get_language, highlight, highlight_end, highlight_start, l, languages, parse, path, showdown, spawn, template, _ref;

  generate_documentation = function(source, callback) {
    return fs.readFile(source, "utf-8", function(error, code) {
      var section, sections;
      if (error != null) return callback(error);
      try {
        sections = parse(source, code);
        if (((function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = sections.length; _i < _len; _i++) {
            section = sections[_i];
            if (section.code_text.length > 0) _results.push(section);
          }
          return _results;
        })()).length > 0) {
          return highlight(source, sections, function() {
            return callback(null, generate_html(source, sections));
          });
        } else {
          return callback(null, sections[0].docs_text);
        }
      } catch (error2) {
        return callback(error2.message);
      }
    });
  };

  exports.generate_documentation = generate_documentation;

  parse = function(source, code) {
    var code_text, docs_text, has_code, language, line, lines, save, sections, _i, _len;
    lines = code.split('\n');
    sections = [];
    language = get_language(source);
    has_code = docs_text = code_text = '';
    if (language == null) {
      return [
        {
          docs_text: code,
          code_text: ''
        }
      ];
    } else {
      save = function(docs, code) {
        return sections.push({
          docs_text: docs,
          code_text: code
        });
      };
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        line = lines[_i];
        if (line.match(language.comment_matcher) && !line.match(language.comment_filter)) {
          if (has_code) {
            save(docs_text, code_text);
            has_code = docs_text = code_text = '';
          }
          docs_text += line.replace(language.comment_matcher, '') + '\n';
        } else {
          has_code = true;
          code_text += line + '\n';
        }
      }
      save(docs_text, code_text);
      return sections;
    }
  };

  highlight = function(source, sections, callback) {
    var language, output, pygments, section;
    language = get_language(source);
    pygments = spawn('pygmentize', ['-l', language.name, '-f', 'html', '-O', 'encoding=utf-8,tabsize=2']);
    output = '';
    pygments.stderr.addListener('data', function(error) {
      if (error) return console.error(error.toString());
    });
    pygments.stdin.addListener('error', function(error) {
      console.error("Could not use Pygments to highlight the source.");
      return process.exit(1);
    });
    pygments.stdout.addListener('data', function(result) {
      if (result) return output += result;
    });
    pygments.addListener('exit', function() {
      var fragments, i, section, _len;
      output = output.replace(highlight_start, '').replace(highlight_end, '');
      fragments = output.split(language.divider_html);
      for (i = 0, _len = sections.length; i < _len; i++) {
        section = sections[i];
        section.code_html = highlight_start + fragments[i] + highlight_end;
        section.docs_html = showdown.makeHtml(section.docs_text);
      }
      return callback();
    });
    if (pygments.stdin.writable) {
      pygments.stdin.write(((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = sections.length; _i < _len; _i++) {
          section = sections[_i];
          _results.push(section.code_text);
        }
        return _results;
      })()).join(language.divider_text));
      return pygments.stdin.end();
    }
  };

  generate_html = function(source, sections) {
    var html, title;
    if (typeof sources === "undefined" || sources === null) sources = [];
    title = path.basename(source);
    html = docco_template({
      title: title,
      sections: sections,
      sources: sources,
      path: path,
      destination: destination
    });
    return html;
  };

  fs = require('fs');

  path = require('path');

  showdown = require('./../vendor/showdown').Showdown;

  _ref = require('child_process'), spawn = _ref.spawn, exec = _ref.exec;

  languages = {
    '.coffee': {
      name: 'coffee-script',
      symbol: '#'
    },
    '.js': {
      name: 'javascript',
      symbol: '//'
    },
    '.rb': {
      name: 'ruby',
      symbol: '#'
    },
    '.py': {
      name: 'python',
      symbol: '#'
    },
    '.php': {
      name: 'php',
      symbol: '//'
    },
    '.tex': {
      name: 'tex',
      symbol: '%'
    },
    '.latex': {
      name: 'tex',
      symbol: '%'
    },
    '.c': {
      name: 'c',
      symbol: '//'
    },
    '.h': {
      name: 'c',
      symbol: '//'
    },
    '.sh': {
      name: 'bash',
      symbol: '#'
    }
  };

  for (ext in languages) {
    l = languages[ext];
    l.comment_matcher = new RegExp('^\\s*' + l.symbol + '\\s?');
    l.comment_filter = new RegExp('(^#![/]|^\\s*#\\{)');
    l.divider_text = '\n' + l.symbol + 'DIVIDER\n';
    l.divider_html = new RegExp('\\n*<span class="c1?">' + l.symbol + 'DIVIDER<\\/span>\\n*');
  }

  get_language = function(source) {
    switch (path.basename(source)) {
      case 'Cakefile':
        return languages['.coffee'];
      case 'Rakefile':
        return languages['.rb'];
      case 'Phakefile':
        return languages['.php'];
      default:
        ext = path.extname(source);
        if (ext === '.json') {
          return languages['.js'];
        } else {
          return languages[ext];
        }
    }
  };

  exports.get_language = get_language;

  destination = function(filepath) {
    return 'docs/' + path.basename(filepath, path.extname(filepath)) + '.html';
  };

  ensure_directory = function(dir, callback) {
    return exec("mkdir -p " + dir, function() {
      return callback();
    });
  };

  template = function(str) {
    return new Function('obj', 'var p=[],print=function(){p.push.apply(p,arguments);};' + 'with(obj){p.push(\'' + str.replace(/[\r\t\n]/g, " ").replace(/'(?=[^<]*%>)/g, "\t").split("'").join("\\'").split("\t").join("'").replace(/<%=(.+?)%>/g, "',$1,'").split('<%').join("');").split('%>').join("p.push('") + "');}return p.join('');");
  };

  exports.template = template;

  ck = require("CoffeeKup");

  docco_template = ck.compile(fs.readFileSync(__dirname + '/../resources/docco.coffee').toString());

  docco_styles = fs.readFileSync(__dirname + '/../resources/docco.css').toString();

  highlight_start = '<div class="highlight"><pre>';

  highlight_end = '</pre></div>';

}).call(this);
