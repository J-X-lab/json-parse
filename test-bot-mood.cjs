// Run with: node test-bot-mood.cjs
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {runInNewContext} = require('node:vm');
const html = readFileSync(require('node:path').join(__dirname, 'index.html'), 'utf8');
const core = html.slice(html.indexOf('const botMoods ='), html.indexOf('// Native pane scrolling'));
let animations = 0, reduced = false;
const bot = {setState(value){this.state=value;},setShape(value){this.shape=value;},setMaterial(type,value){this.colors=value;},setAttribute(name,value){this[name]=value;},animate(){animations++;return {cancel(){}};}};
const nodes = {'header-bot':bot,'bot-caption':{},'bot-mode':{value:'custom'},'bot-switch':{setAttribute(){}}};
const context = {$:id=>nodes[id],matchMedia:()=>({matches:reduced})};
runInNewContext(core,context);
runInNewContext(html.split('<script id="bot-presets">')[1].split('let restoredPreset =')[0],context);
assert.equal(runInNewContext('presetDefaults.every(validBotPreset)',context),true);
for(const [slot,value] of [[0,' '],[0,'x'.repeat(41)],[1,'invalid'],[2,'red'],[3,null],[4,'#fff'],[5,'invalid'],[6,'invalid'],[7,'invalid']]){
  context.slot=slot;context.invalid=value;
  assert.equal(runInNewContext('validBotPreset(presetDefaults[0].map((value,i)=>i===slot?invalid:value))',context),false);
}
assert.equal(context.validBotPreset(null),false);
assert.equal(context.randomDifferent(1,0),0);
const custom=['自定义','leaf','#22bb99','#88eedd','#ffffff','','happy','none'];
for(const mood of ['idle','happy','curious','surprised','playful','shy','suspicious','angry','sad','laughing']){
  custom[6]=mood;context.applyBotAppearance(custom);context.applyBotAppearance(custom);
  assert.equal(bot.state,mood);assert.equal(bot.shape,'leaf');assert.equal(animations,0);
}
custom[6]='random';custom[7]='random';
let previousMood=bot.state,previousGesture=runInNewContext('botGesture',context);
for(let i=0;i<12;i++){
  context.applyBotAppearance(custom);
  assert.notEqual(bot.state,previousMood);previousMood=bot.state;
  const gesture=runInNewContext('botGesture',context);assert.notEqual(gesture,previousGesture);previousGesture=gesture;
  assert.equal(bot.shape,'leaf');assert.equal(bot.colors.start,'#22bb99');
}
assert.equal(animations,12);
custom[6]='happy';custom[7]='2';context.applyBotAppearance(custom);assert.equal(runInNewContext('botGesture',context),2);
reduced=true;const before=animations;context.applyBotAppearance(custom);assert.equal(animations,before);
context.applyBotAppearance(custom,false);assert.equal(animations,before);
runInNewContext('botLooks.splice(0,botLooks.length,presetDefaults[0]); applyBotLook(randomDifferent(botLooks.length,0));',context);
assert.equal(runInNewContext('botLook',context),0);
runInNewContext(html.slice(html.indexOf('function animatePresetPreview('),html.indexOf('function refreshPresetPreviews(')),context);
let previews=0;const tile={querySelector:()=>({animate(frames){assert.ok(frames.length>=3);previews++;}})};
context.animatePresetPreview(tile,'0');assert.equal(previews,0);
reduced=false;context.animatePresetPreview(tile,'none');assert.equal(previews,0);
for(const action of ['random','0','1','2','3','4'])context.animatePresetPreview(tile,action);
assert.equal(previews,6);
console.log('Role checks passed: presets, fixed/custom random fields, validation, reduced motion, previews.');
