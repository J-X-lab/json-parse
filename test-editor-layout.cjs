// Run with: node test-editor-layout.cjs
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const html = readFileSync(require('node:path').join(__dirname, 'index.html'), 'utf8');
const nodes = new Map();
const document = { activeElement: null };
function node(id) {
  if (!nodes.has(id)) nodes.set(id, {
    id, children: [], style: {}, dataset: {}, events: {}, value: '', hidden: false,
    offsetWidth: 244, offsetHeight: 180, open: false,
    append(...children) {
      for (const child of children) {
        if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
        this.children.push(child); child.parent = this;
        if (document.activeElement === child) document.activeElement = node('body');
      }
    },
    prepend(child) { this.append(child); this.children.unshift(this.children.pop()); },
    addEventListener(type, handler) { (this.events[type] ||= []).push(handler); },
    emit(type, event = {}) { for (const handler of this.events[type] || []) handler(event); },
    hidePopover() { this.open = false; },
    getBoundingClientRect() { return { height: 94, right: 390, bottom: 780 }; },
    getClientRects() { return [this.getBoundingClientRect()]; },
    focus() { document.activeElement = this; }
  });
  return nodes.get(id);
}
for (const id of ['format', 'compact', 'indent', 'unwrap', 'expand', 'collapse', 'export', 'copy']) {
  assert.equal((html.match(new RegExp('id="' + id + '"', 'g')) || []).length, 1, id + ' must remain unique');
}
assert.ok(!html.includes('<div class="toolbar">'));
node('format-actions').append(node('format'), node('compact'));
node('fold-actions').append(node('expand'), node('collapse'));
node('share-actions').append(node('copy'), node('export'));
node('result-tools').append(node('format-actions'), node('fold-actions'), node('share-actions'), node('format-settings-toggle'));
node('editors').dataset.view = 'input';
document.activeElement = node('body');
const media = node('media'); media.matches = false;
const window = node('window');
runInNewContext(html.match(/<script id="editor-layout">([\s\S]*?)<\/script>/)[1], {
  $: node, document, window, matchMedia: () => media, innerWidth: 390, innerHeight: 844,
  ResizeObserver: class { constructor(callback) { this.callback = callback; } observe() { this.callback(); } },
  selectPane(view) { node('editors').dataset.view = view; }
});
assert.equal(node('input-header').style.minHeight, '94px');
assert.equal(node('format-actions').parent.id, 'result-tools');
let exportCount = 0;
node('export').addEventListener('click', () => exportCount++);
node('format-settings-toggle').focus();
media.matches = true; media.emit('change');
assert.equal(node('format-actions').parent.id, 'input-actions');
assert.equal(node('format-settings-toggle').parent.id, 'format-actions');
assert.equal(document.activeElement, node('format-settings-toggle'));
assert.equal(node('input-header').style.minHeight, '');
assert.equal(node('export').parent.id, 'more-actions');
assert.equal(node('fold-actions').hidden, true);
node('format').emit('click');
assert.equal(node('editors').dataset.view, 'input', 'invalid or empty input must remain visible');
node('output').value = '{"keep":1}';
node('format').emit('click');
assert.equal(node('editors').dataset.view, 'result');
assert.equal(node('format-actions').parent.id, 'result-tools');
node('result-more').open = true;
node('export').emit('click');
assert.equal(exportCount, 1, 'moving controls must preserve handlers');
assert.equal(node('result-more').open, false);
node('format-options').emit('toggle', { newState: 'open' });
assert.equal(node('format-options').style.left, '134px');
assert.equal(node('format-options').style.top, '652px');
media.matches = false; media.emit('change');
assert.deepEqual(node('fold-actions').children.map(n => n.id), ['expand', 'collapse']);
assert.equal(node('export').parent.id, 'share-actions');
assert.equal(node('fold-actions').hidden, false);
assert.equal(node('output').value, '{"keep":1}', 'layout changes must preserve data');
node('format-options').open = true; window.emit('resize');
assert.equal(node('format-options').open, false);
console.log('Editor layout checks passed');
