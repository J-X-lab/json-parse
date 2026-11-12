// Run with: node test-json-path.cjs (Python 3 is used to verify the generated expressions).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const page = fs.readFileSync(__dirname + '/index.html', 'utf8');
const script = page.split('<script id="json-path">')[1].split('</script>')[0];
const context = {};
vm.runInNewContext(page.slice(page.indexOf('function tokenize('), page.indexOf('function updateView(')), context);
vm.runInNewContext(script.slice(0, script.indexOf('const refreshPathSelection =')), context);
const source = '{"flow":[{"data":{"type":"title","display.name":"special","owner name":"Alex","0":"key","quote\\\"key":"quoted","slash\\\\key":null,"":false}}],"empty":[],"large":12345678901234567890}';
const tokens = context.tokenize(source);
const paths = context.jsonPathIndex(source);
function fieldPath(key, mode) {
  const index = tokens.findIndex((t, i) => t === JSON.stringify(key) && tokens[i + 1] === ':') + 2;
  return context.pathParts(paths.get(index), mode).join('');
}
assert.equal(fieldPath('type'), '$.flow[0].data.type');
assert.equal(fieldPath('display.name'), '$.flow[0].data["display.name"]');
assert.equal(fieldPath('owner name'), '$.flow[0].data["owner name"]');
assert.equal(fieldPath('0'), '$.flow[0].data["0"]');
assert.equal(fieldPath('quote"key'), '$.flow[0].data["quote\\"key"]');
assert.equal(fieldPath('slash\\key'), '$.flow[0].data["slash\\\\key"]');
assert.equal(fieldPath(''), '$.flow[0].data[""]');
assert.equal(fieldPath('empty'), '$.empty');
assert.equal(fieldPath('large'), '$.large');
assert.equal(context.pathParts(paths.get(0)).join(''), '$');
const arrays = context.jsonPathIndex('[["one", "two"], {"x":1}, null]');
assert.deepEqual([...arrays.values()].map(p => context.pathParts(p).join('')), ['$', '$[0]', '$[0][0]', '$[0][1]', '$[1]', '$[1].x', '$[2]']);
for (const input of ['null', '12345678901234567890', '"hello"', '{}', '[]']) {
  const root = context.jsonPathIndex(input).get(0);
  assert.equal(context.pathParts(root).join(''), '$');
  assert.equal(context.pathParts(root, 'python').join(''), 'data');
}
assert.equal(fieldPath('type', 'python'), 'data["flow"][0]["data"]["type"]');
assert.equal(fieldPath('display.name', 'python'), 'data["flow"][0]["data"]["display.name"]');
assert.equal(fieldPath('0', 'python'), 'data["flow"][0]["data"]["0"]');
assert.equal(context.pathParts([0, 'x'], 'python').join(''), 'data[0]["x"]');
// Check generated expressions with Python itself, including quotes, control characters and Unicode.
const special = ['normal', 'display.name', 'owner name', '0', '', 'quote"key', 'slash\\key', 'line\nbreak', '\u0000', '中文😀'];
const data = Object.fromEntries(special.map((key, index) => [key, {items:[index]}]));
const expressions = special.map((key, index) => [context.pathParts([key, 'items', 0], 'python').join(''), index]);
const check = require('node:child_process').spawnSync('python', ['-X', 'utf8', '-c', 'import sys,json; payload=json.load(sys.stdin); data=payload["data"]; assert all(eval(expr,{"__builtins__":{}},{"data":data})==expected for expr,expected in payload["expressions"])'], {input:JSON.stringify({data,expressions}), encoding:'utf8'});
assert.equal(check.status, 0, check.stderr || check.error?.message);
console.log('JSONPath / Python path checks passed: JSONPath, Python evaluation, nesting, indices, escaped keys and root values.');
