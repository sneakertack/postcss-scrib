var postcss = require('postcss');

function scrib(opts) {

  return function (css, result) {
    return new Promise(function (resolve, reject) {
      opts = opts || {}; // Question: should this + the next ~8 lines be shifted up 1 (or 2) function scopes instead? Does it eliminate any redudancy?
      if (typeof opts === 'string') {
        resolve(parseShortcutText(opts));
      } else if (opts.tree) {
        resolve(opts.tree);
      } else if (opts.shortcuts) {
        resolve(parseShortcutText(opts.shortcuts));
      } else if (opts.file) {
        require('fs').readFile(opts.file, 'utf8', function (err, data) {
          if (err) return reject(err);
          resolve(parseShortcutText(data));
        });
      } else {reject('postcss-scrib must be called with either a string or options object describing the shortcuts to use. Please refer to the readme.');}
    }).then(function (tree) {
      return new Promise(function (resolve, reject) {
        css.walkDecls(function (decl) {
          // Expand value alias (if any). Search prop-specific values first, then generic values.
          var replacement = (((typeof tree[decl.prop] === 'string' ? null : tree[decl.prop]) || {})._shortcuts || {})[decl.value] || ((tree['*'] || {})._shortcuts || {})[decl.value];
          if (replacement) decl.value = replacement;
          // Expand property alias (if any).
          if (tree[decl.prop]) decl.prop = typeof tree[decl.prop] === 'string' ? tree[decl.prop] : tree[decl.prop]._becomes;
        });
        resolve();
      });
    });
  };
}

function parseShortcutText(text) {
  var tree = {};
  text = text.replace(/ ?#[^'"\n]*$/gm, ''); // Strip comments.
  var groups = (text || '').split(/(?:[\t ]*\n){2,}/); // Split by double(or-more)-newlines, trimming whitespace.
  groups.forEach(function (group) {
    // Within the group, sanity-check that once indentation starts, it doesn't stop.
    var lines = group.split('\n').filter(function (line) {return /\S/.test(line);});
    var indentationHasOccured = false;
    var propShortcuts = [];
    var valueShortcuts = [];
    lines.forEach(function (line) {
      var parsedLine;
      if (/^[\t ]/.test(line)) {
        indentationHasOccured = true;
        if (!/[^ ] +[^ ]/.test(line)) throw new Error('Expected more than 1 word on this line:\n'+line);
        parsedLine = /^([^ ]*) (.*)$/.exec(line.replace(/^[\t ]*/g, '')).slice(1);
        valueShortcuts.push(parsedLine);
      } else {
        if (indentationHasOccured) throw new Error('Expected indentation or line break instead of the following line:\n'+line);
        try {
          if (!/[^ ] +[^ ]/.test(line)) throw new Error('Expected more than 1 word on this line:\n'+line);
          parsedLine = /^([^ ]*) (.*)$/.exec(line).slice(1);
        } catch (e) {
          if (/^\*\s*$/.test(line)) {
            parsedLine = ['*'];
          } else {throw e;}
        }
        propShortcuts.push(parsedLine);
      }
    });
    if (valueShortcuts.length) {
      var valueShortcutsTree = {};
      valueShortcuts.forEach(function (shortcut) {
        valueShortcutsTree[shortcut[0]] = shortcut[1];
      });
      propShortcuts.forEach(function (shortcut)  {
        tree[shortcut[0]] = {
          _becomes: shortcut[1],
          _shortcuts: valueShortcutsTree
        };
      });
    } else {
      propShortcuts.forEach(function (shortcut)  {
        tree[shortcut[0]] = shortcut[1];
      });
    }
  });
  return tree;
}

var scribPlugin = postcss.plugin('postcss-scrib', scrib);
scribPlugin.parseShortcutText = parseShortcutText;

module.exports = scribPlugin;
