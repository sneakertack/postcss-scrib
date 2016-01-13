/* jshint esnext:true */
import test from 'ava';

import scrib from '../';

const fixtures = {};

function toRun(t) { // Executed at bottom of this file.
  const f = fixtures;
  console.log('## Here\'s some shortcut definitions:');
  console.log(f.shortcutsInput);
  console.log('## Converting the definitions into a tree gives us:');
  const parsed = scrib.parseShortcutText(f.shortcutsInput);
  console.dir(parsed);
  t.same(parsed, f.shortcutsParsed);
  console.log('## Now here\'s some input CSS:');
  console.log(f.cssInput);
  scrib.process(f.cssInput, {tree: f.shortcutsParsed}).then(result => {
    console.log('## Applying the shortcuts gives us:');
    console.log(result.css);
    t.same(result.css, f.cssOutput);
  });
}

fixtures.shortcutsInput = `
# A comment to disregard
mt margin-top
mb margin-bottom

d display
  b block
  ib inline-block

c color
bgc background-color
  tr transparent
`;

fixtures.shortcutsParsed = {
  mt: 'margin-top',
  mb: 'margin-bottom',
  d: {
    _becomes: 'display',
    _shortcuts: {
      b: 'block',
      ib: 'inline-block'
    }
  },
  c: {
    _becomes: 'color',
    _shortcuts: {tr: 'transparent'}
  },
  bgc: {
    _becomes: 'background-color',
    _shortcuts: {tr: 'transparent'}
  }
};
fixtures.cssInput = `
body {
  d: b;
  mt: 10px;
}

tr { /* <- should not mistakenly expand */
  bgc: tr;
}
`;

fixtures.cssOutput = `
body {
  display: block;
  margin-top: 10px;
}

tr { /* <- should not mistakenly expand */
  background-color: transparent;
}
`;

test('program should not explode', toRun);
