// Run with: node test-theme-colors.cjs
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {runInNewContext} = require('node:vm');
const html = readFileSync(require('node:path').join(__dirname,'index.html'),'utf8');
const source = ['theme-colors-init','theme-color-controls'].map(id => html.split('<script id="'+id+'">')[1].split('</script>')[0]).join('\n');
function load(stored, blocked = false) {
  const properties = new Map(), nodes = {}, created = [];
  let saved = stored;
  const root = {dataset:{theme:'mint'},style:{setProperty:(key,value)=>properties.set(key,value),removeProperty:key=>properties.delete(key)}};
  const node = () => ({style:root.style, append(){}, addEventListener(name,callback){this[name]=callback;}});
  const context = {
    document:{documentElement:root,createElement(){const result=node();created.push(result);return result;},getElementById:id=>nodes[id]||(nodes[id]=node())},
    themeChoices:[],
    localStorage:{getItem(){if(blocked)throw Error('blocked');return saved;},setItem(key,value){assert.equal(key,'json-parse-theme-colors');if(blocked)throw Error('blocked');saved=value;}}
  };
  runInNewContext(source,context);
  return {context,root,properties,nodes,created,saved:()=>saved};
}
for (const bad of [null,'{broken','[]','null','{"mint":["red"]}','{"mint":["#112233"]}']) {
  const test=load(bad); assert.equal(test.root.dataset.customColors,undefined);
}
const test=load(null);
assert.equal(test.context.themeAccentInk('#ffffff'),'#000000');assert.equal(test.context.themeAccentInk('#000000'),'#ffffff');
const themes=['default','neumorphic','midnight','paper','mono','terminal','glass','mint'];
for(const theme of themes){
  test.root.dataset.theme=theme;test.context.applyThemeColors();test.context.refreshThemeColorControls();
  const color=test.created.find(node=>node.id==='theme-color-background');color.value='#123456';color.input();
  assert.equal(test.properties.get('--custom-background'),'#123456');
  assert.equal(test.root.dataset.customColors,'true');
}
assert.equal(Object.keys(JSON.parse(test.saved())).length,8);
const restored=load(test.saved());assert.equal(restored.properties.get('--custom-background'),'#123456');
restored.nodes['theme-colors-reset'].onclick();
assert.equal(restored.root.dataset.customColors,undefined);assert.equal(restored.properties.size,0);
assert.equal(Object.keys(JSON.parse(restored.saved())).length,7);
assert.equal(JSON.parse(restored.saved()).mint,undefined);
const invalid=JSON.parse(test.saved());invalid.mint[0]='url(https://example.com)';
assert.equal(load(JSON.stringify(invalid)).root.dataset.customColors,undefined);
const blocked=load(null,true);const input=blocked.created.find(node=>node.id==='theme-color-accent');input.value='#ffcc00';input.input();
assert.equal(blocked.properties.get('--custom-accent'),'#ffcc00');assert.ok(blocked.nodes['theme-colors-status'].textContent.includes('无法保存'));
console.log('Theme color checks passed: validation, all themes, isolated reset, restore, blocked storage, accent contrast.');
