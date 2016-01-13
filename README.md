[PostCSS] plugin to let you write shortcuts for your favourite properties and their favourite values.

[PostCSS]: https://github.com/postcss/postcss

```sh
# my-scrib-shortcuts.txt
b border # Define a property shortcut.
bt border-top
bb border-bottom

d display
  b block # Define a value shortcut by indenting under a property.
  ib inline-block
  tr table-row

c color
bgc background-color
  tr transparent # Value shortcuts work for a group of multiple properties too (seperate groups with double-newlines).

*
  au auto # If necessary, Use * for generic value shortcuts (i.e. not tied to any property).
```

```css
/* Input.css */
tr.fancy-class {
  b: solid 1px black;
  d: b;
  c: white;
  bgc: tr;
  overflow: au;
}
```

```css
/* output.css */
tr.fancy-class { /* <-- 'tr' only affects properties, so the selector remains safe */
  border: solid 1px black;
  display: block;
  color: white;
  background-color: transparent;
  overflow: auto;
}
```

**Similar Libraries** (may fit your use case better):
- [postcss-alias](https://github.com/seaneking/postcss-alias) - Custom aliases for CSS properties through an `@alias` rule
- [postcss-crip](https://github.com/johnie/postcss-crip) - Useful if you want a pre-defined set of shortcuts

## Usage

```js
// Pass a list of shortcuts (formatted like the example on top of this readme) as a string to postcss-scrib
var shortcuts = 'b border\nd display\n  b block';
postcss([require('postcss-scrib')(shortcuts)]);

// OR

// Pass in an options object with with 1 of the following keys: 1) shortcuts, 2) file, or 3) tree.
var options = {
  shortcuts: 'b border\nd display\n  b block', // List of shortcut definitions
  // OR
  file: './my-shortcut-file.txt', // Path to a file that contains shortcut definitions (passed directly to fs.readFile).
  // OR
  tree: {b: 'border', d: 'display', b: 'block'} // Alternative intermediate JS representation.
};
postcss([require('postcss-scrib')(options)]);
```

See [PostCSS] docs for examples for your environment.

## Intermediate JS representation

Using the `tree` option, you have the choice of writing your shortcuts directly in JS, instead of in this plugin's custom format. It is slightly more verbose, but may come in useful in cases where you wish to generate shortcuts programmatically, or modify shortcuts at a later time. Converting the example at the top of this readme into a tree gives us:

```js
{ b: 'border',
  bt: 'border-top',
  bb: 'border-bottom',
  d:
   { _becomes: 'display',
     _shortcuts: { b: 'block', ib: 'inline-block', tr: 'table-row' } },
  c: { _becomes: 'color', _shortcuts: { tr: 'transparent' } },
  bgc:
   { _becomes: 'background-color',
     _shortcuts: { tr: 'transparent' } }, // same _shortcuts object reference as c.
  '*': { _becomes: undefined, _shortcuts: { au: 'auto' } } }
```

`parseShortcutText` is available as a method on the module if you wish to generate such a tree:

```js
var scrib = require('postcss-scrib');
scrib.parseShortcutText('b border\nd display\n  b block');
// >> {b: 'border', d: 'display', b: 'block'}
```

## Sample Shortcuts

As a reference, here's the shortcuts that I use. I'd suggest to keep the shortcuts tight, and define them only for the props/values you really need (as opposed to going overboard and short-cutting the entire language, then forgetting them all tomorrow morning).

```sh
# sneakertack's shortcuts
d display
  b block
  i inline
  ib inline-block
  n none
  t table
  tr table-row
  tc table-cell

pos position
  rel relative
  abs absolute

m margin
mt margin-top
mb margin-bottom
ml margin-left
mr margin-right

b border
bt border-top
bb border-bottom
bl border-left
br border-right

p padding
pt padding-top
pb padding-bottom
pl padding-left
pr padding-right

f font
ff font-family
fs font-size
c color

bg background
bgc background-color

ts text-shadow
bs box-shadow

f float
  l left
  r right

```
