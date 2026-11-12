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
  const node = () => ({style:root.style, append(child){child.parentElement=this;}, after(){}, addEventListener(name,callback){this[name]=callback;}});
  const swatches = new Map();
  const themeChoices = ['glass','mint'].map(value => ({value,parentElement:{querySelector:()=>({style:{setProperty:(key,color)=>swatches.set(value+key,color)}})}}));
  const context = {
    document:{documentElement:root,createElement(){const result=node();created.push(result);return result;},getElementById:id=>nodes[id]||(nodes[id]=node())},
    themeChoices,
    localStorage:{getItem(){if(blocked)throw Error('blocked');return saved;},setItem(key,value){assert.equal(key,'json-parse-theme-colors');if(blocked)throw Error('blocked');saved=value;}}
  };
  runInNewContext(source,context);
  return {context,root,properties,nodes,created,swatches,saved:()=>saved};
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

function choose(test, theme) {
  test.root.dataset.theme=theme;test.context.applyThemeColors();test.context.refreshThemeColorControls();
}
function field(test, name) { return test.created.find(node=>node.id==='theme-color-'+name); }
function edit(test, name, color) { const input=field(test,name);input.value=color;input.input(); }
choose(test,'glass');
assert.equal(field(test,'gradient-start').parentElement.hidden,false);
assert.equal(field(test,'gradient-end').parentElement.hidden,false);
assert.equal(field(test,'gradient-start').value,'#d4c1ef');
assert.equal(field(test,'gradient-end').value,'#a9dce9');
edit(test,'gradient-start','#ff8800');edit(test,'gradient-end','#00ccff');edit(test,'background','#112233');
assert.equal(test.properties.get('--custom-gradient-start'),'#ff8800');
assert.equal(test.properties.get('--custom-gradient-end'),'#00ccff');
assert.equal(test.swatches.get('glass--swatch-bg'),'linear-gradient(135deg,#ff8800,#112233,#00ccff)');
const palette=JSON.parse(test.saved()).glass;
assert.equal(palette.length,12);
const gradientRestored=load(test.saved());choose(gradientRestored,'glass');
assert.equal(field(gradientRestored,'gradient-start').value,'#ff8800');
assert.equal(field(gradientRestored,'gradient-end').value,'#00ccff');
choose(gradientRestored,'mint');
assert.equal(field(gradientRestored,'gradient-start').parentElement.hidden,true);
assert.equal(gradientRestored.properties.has('--custom-gradient-start'),false);
assert.equal(gradientRestored.properties.has('--custom-gradient-end'),false);
choose(gradientRestored,'glass');gradientRestored.nodes['theme-colors-reset'].onclick();
assert.equal(gradientRestored.root.dataset.customColors,undefined);
assert.equal(field(gradientRestored,'gradient-start').value,'#d4c1ef');
assert.equal(field(gradientRestored,'gradient-end').value,'#a9dce9');
assert.deepEqual(JSON.parse(gradientRestored.saved()).mint,JSON.parse(test.saved()).mint);
const legacy=load(JSON.stringify({glass:palette.slice(0,10)}));choose(legacy,'glass');
assert.equal(legacy.properties.get('--custom-background'),'#112233');
assert.equal(legacy.properties.get('--custom-gradient-start'),'#d4c1ef');
edit(legacy,'gradient-end','#abcdef');
assert.deepEqual(JSON.parse(legacy.saved()).glass,palette.slice(0,10).concat('#d4c1ef','#abcdef'));
for(const bad of [palette.slice(0,11),palette.concat('#123456'),palette.slice(0,10).concat('url(x)','#123456')]) {
  const invalid=load(JSON.stringify({glass:bad}));choose(invalid,'glass');assert.equal(invalid.root.dataset.customColors,undefined);
}
assert.equal(load(JSON.stringify({mint:palette})).root.dataset.customColors,undefined);
console.log('Theme color checks passed: validation, themes, reset, storage, contrast, independent gradients, swatches and legacy migration.');
