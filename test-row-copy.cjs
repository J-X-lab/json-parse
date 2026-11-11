// Run with: node test-row-copy.cjs
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const html = readFileSync(require('node:path').join(__dirname, 'index.html'), 'utf8');
const context = {};
runInNewContext(html.slice(html.indexOf('function tokenize('), html.indexOf('function updateView(')), context);
const source = '{"flow":[{"msg":"OK","code":200,"data":{"type":"title","escaped":"line\\n\\\"quote\\\"","empty":"","large":123456789012345678901234567890,"decimal":1.2300e+40,"nil":null,"flag":false,"object":{},"array":[]}}],"duplicate":1,"duplicate":2}';
function rows(input) {
  return [...context.resultMarkup(input).matchAll(/<(?:summary|div) class="([^"]*json-row[^"]*)" data-copy-start="(\d+)" data-copy-value="(\d+)" data-copy-end="(\d+)"/g)]
    .map(([, className, start, value, end]) => ({ className, start: +start, value: +value, end: +end }));
}
const tokens = context.tokenize(source);
const rendered = rows(source);
function field(key) {
  return rendered.find(row => !row.className.includes('json-close') && tokens[row.start] === JSON.stringify(key));
}
function copy(row, mode, input = source, indent) {
  return context.rowCopyText(input, row.start, row.value, row.end, mode, indent);
}
assert.equal(copy(field('type'), 'pair'), '"type": "title"');
assert.equal(copy(field('type'), 'value'), 'title');
assert.equal(copy(field('escaped'), 'value'), 'line\n"quote"');
assert.equal(copy(field('escaped'), 'pair'), '"escaped": "line\\n\\\"quote\\\""');
assert.equal(copy(field('empty'), 'value'), '');
for (const [key, expected] of [['large', '123456789012345678901234567890'], ['decimal', '1.2300e+40'], ['nil', 'null'], ['flag', 'false'], ['object', '{}'], ['array', '[]']]) {
  assert.equal(copy(field(key), 'value'), expected);
}
const flow = field('flow');
assert.ok(copy(flow, 'pair').startsWith('"flow": [\n'));
assert.ok(copy(flow, 'value').startsWith('[\n'));
assert.ok(copy(flow, 'value').includes('123456789012345678901234567890'));
for (const close of rendered.filter(row => row.className.includes('json-close'))) {
  const open = rendered.find(row => !row.className.includes('json-close') && row.value === close.value);
  for (const mode of ['pair', 'value']) assert.equal(copy(close, mode), copy(open, mode));
}
const arrayObject = rendered.find(row => tokens[row.value] === '{' && row.value > flow.value && row.start === row.value);
assert.equal(copy(arrayObject, 'pair'), copy(arrayObject, 'value'));
assert.equal(copy(rendered[0], 'value'), context.formatJson(source));
assert.ok(copy(flow, 'value', source, '\t').includes('\n\t{'));
assert.deepEqual(rendered.filter(row => tokens[row.start] === '"duplicate"').map(row => copy(row, 'value')), ['1', '2']);
for (const input of ['{}', '[]', 'null', 'true', '123456789012345678901', '"root"', '["first",{"x":2},[],{}]']) {
  const root = rows(input)[0];
  assert.equal(copy(root, 'pair', input), context.formatJson(input, '  ', false));
  assert.equal(copy(root, 'value', input), input === '"root"' ? 'root' : context.formatJson(input, '  ', false));
}
const nestedString = '{"json":"{\\\"x\\\":1}"}';
const nestedRow = rows(nestedString)[1];
assert.equal(copy(nestedRow, 'value', nestedString), '{"x":1}');
assert.equal(copy(nestedRow, 'pair', nestedString), '"json": "{\\\"x\\\":1}"');
const unsafe = '{"<img src=x onerror=alert(1)>":"<script>alert(1)</script>"}';
const markup = context.resultMarkup(unsafe);
assert.ok(!markup.includes('<img'));
assert.ok(!markup.includes('<script>'));
assert.ok(markup.includes('&lt;script&gt;'));
assert.equal(copy(rows(unsafe)[1], 'value', unsafe), '<script>alert(1)</script>');
assert.ok(!context.resultMarkup(source, true).includes('row-actions'));
assert.throws(() => context.resultMarkup('{bad}'));

// Clipboard fallback must neither overwrite the formatted output nor claim success on failure.
const clipboardSource = html.slice(html.indexOf('async function writeClipboard('), html.indexOf("$('viewer').addEventListener('pointerover'"));
(async () => {
  let copied, removed = false, focused = false;
  const field = { style: {}, select() {}, remove() { removed = true; } };
  const clipboardContext = {
    navigator: { clipboard: { async writeText(text) { copied = text; } } },
    document: {
      activeElement: { focus() { focused = true; } },
      createElement: () => field,
      body: { append() {} },
      execCommand(command) { assert.equal(command, 'copy'); return true; }
    }
  };
  runInNewContext(clipboardSource, clipboardContext);
  await clipboardContext.writeClipboard('first');
  assert.equal(copied, 'first');
  clipboardContext.navigator.clipboard.writeText = async () => { throw Error('denied'); };
  await clipboardContext.writeClipboard('fallback');
  assert.equal(field.value, 'fallback');
  assert.ok(removed && focused);
  removed = focused = false;
  clipboardContext.document.execCommand = () => false;
  await assert.rejects(clipboardContext.writeClipboard('blocked'));
  assert.ok(removed && focused);
  console.log('Row copy checks passed: scopes, closing rows, strings, precision, duplicates, escaping, compact view and clipboard fallback.');
})().catch(error => { console.error(error); process.exitCode = 1; });
