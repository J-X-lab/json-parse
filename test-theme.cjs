// Run with: node test-theme.cjs
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const html = readFileSync(require('node:path').join(__dirname, 'index.html'), 'utf8');
const scripts = ['theme-init', 'theme-controls'].map(id => html.split('<script id="' + id + '">')[1].split('</script>')[0]);
for (const stored of [null, 'neumorphic', 'midnight', 'paper', 'mono', 'terminal', 'glass', 'mint', 'default', 'invalid', 'blocked']) {
  const events = {}, dataset = {};
  let saved, focused = false, paletteFocused = false;
  const palette = { open: false, querySelector: () => ({ focus: () => { paletteFocused = true; } }) };
  const closeButton = {};
  const settings = { open: false, contains: target => target === select, querySelector: () => ({ focus: () => { focused = true; } }) };
  const choices = ['default','neumorphic','midnight','paper','mono','terminal','glass','mint'].map(value => ({value, checked:false, addEventListener(name, handler){this[name] = handler;}}));
  const select = choices[0];
  const context = {
    applyThemeColors() {}, refreshThemeColorControls() {},
    document: { documentElement: { dataset }, getElementById: id => id === 'theme-color-editor' ? palette : id === 'theme-colors-close' ? closeButton : settings, querySelectorAll: () => choices, addEventListener: (name, handler) => { events[name] = handler; } },
    localStorage: {
      getItem: () => { if (stored === 'blocked') throw Error('unavailable'); return stored; },
      setItem: (key, value) => { assert.equal(key, 'json-parse-theme'); if (stored === 'blocked') throw Error('unavailable'); saved = value; }
    }
  };
  runInNewContext(scripts.join('\n'), context);
  assert.equal(choices.find(choice => choice.checked).value, ['neumorphic', 'midnight', 'paper', 'mono', 'terminal', 'glass', 'mint'].includes(stored) ? stored : 'default');
  for (const theme of ['neumorphic', 'midnight', 'paper', 'mono', 'terminal', 'glass', 'mint', 'default']) {
    choices.find(choice => choice.value === theme).change();
    assert.equal(dataset.theme, theme);
    if (stored !== 'blocked') assert.equal(saved, theme);
  }
  settings.open = true; events.click({ target: select }); assert.equal(settings.open, true);
  palette.open = true;
  events.keydown({ key: 'Escape', preventDefault() {} });
  assert.equal(palette.open, false); assert.equal(settings.open, true); assert.equal(paletteFocused, true);
  palette.open = true; paletteFocused = false; closeButton.onclick();
  assert.equal(palette.open, false); assert.equal(settings.open, true); assert.equal(paletteFocused, true);
  events.keydown({ key: 'Escape', preventDefault() {} }); assert.equal(settings.open, false); assert.equal(focused, true);
  settings.open = true; events.click({ target: {} }); assert.equal(settings.open, false);
}
console.log('Theme checks passed (restore, switching, unavailable storage, dismissal).');
