// Run with: node test-theme.cjs
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const html = readFileSync(require('node:path').join(__dirname, 'index.html'), 'utf8');
const scripts = ['theme-init', 'theme-controls'].map(id => html.split('<script id="' + id + '">')[1].split('</script>')[0]);
for (const stored of [null, 'neumorphic', 'default', 'invalid', 'blocked']) {
  const events = {}, dataset = {};
  let saved, focused = false;
  const settings = { open: false, contains: target => target === select, querySelector: () => ({ focus: () => { focused = true; } }) };
  const select = { value: '', addEventListener: (name, handler) => { select[name] = handler; } };
  const context = {
    document: { documentElement: { dataset }, getElementById: id => id === 'theme-select' ? select : settings, addEventListener: (name, handler) => { events[name] = handler; } },
    localStorage: {
      getItem: () => { if (stored === 'blocked') throw Error('unavailable'); return stored; },
      setItem: (key, value) => { assert.equal(key, 'json-parse-theme'); if (stored === 'blocked') throw Error('unavailable'); saved = value; }
    }
  };
  runInNewContext(scripts.join('\n'), context);
  assert.equal(select.value, stored === 'neumorphic' ? 'neumorphic' : 'default');
  for (const theme of ['neumorphic', 'default']) {
    select.value = theme; select.change();
    assert.equal(dataset.theme, theme);
    if (stored !== 'blocked') assert.equal(saved, theme);
  }
  settings.open = true; events.click({ target: select }); assert.equal(settings.open, true);
  events.keydown({ key: 'Escape' }); assert.equal(settings.open, false); assert.equal(focused, true);
  settings.open = true; events.click({ target: {} }); assert.equal(settings.open, false);
}
console.log('Theme checks passed (restore, switching, unavailable storage, dismissal).');
