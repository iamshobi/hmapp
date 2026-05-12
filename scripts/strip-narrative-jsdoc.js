// Removes JSX `{/* ... */}`, then non-JSDoc `/* ... */` blocks, then trims prose
// before the first `@` line in preserved `/** ... */` blocks.
// Preserves blocks containing @typedef|@param|@returns|@type|@deprecated|@property.
// Processes App.js + src/**/*.js only.
const fs = require('fs');
const path = require('path');

const PRESERVE =
  /@(typedef|param|returns|type|deprecated|property)\b/;

function walkJs(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === '.git') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkJs(p, out);
    else if (ent.name.endsWith('.js')) out.push(p);
  }
  return out;
}

function trimTaggedStarStarBlock(block) {
  const lines = block.split('\n');
  if (lines.length === 1) return block;

  let firstAt = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*\*\s*@/.test(line) || /^\s*\/\*\*\s*@/.test(line)) {
      firstAt = i;
      break;
    }
  }
  if (firstAt <= 0) return block;
  return [lines[0], ...lines.slice(firstAt)].join('\n');
}

function processBlock(block) {
  if (!PRESERVE.test(block)) return '';
  if (block.startsWith('/**')) return trimTaggedStarStarBlock(block);
  return block;
}

function stripJsxComments(content) {
  return content.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '');
}

function stripBlockComments(content) {
  return content.replace(/\/\*[\s\S]*?\*\//g, processBlock);
}

function tidy(content) {
  return content
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n');
}

const root = path.join(__dirname, '..');
const files = [path.join(root, 'App.js'), ...walkJs(path.join(root, 'src'))].filter((f) =>
  fs.existsSync(f),
);

let n = 0;
for (const f of files) {
  const before = fs.readFileSync(f, 'utf8');
  const after = tidy(stripBlockComments(stripJsxComments(before)));
  if (after !== before) {
    fs.writeFileSync(f, after);
    n += 1;
    console.log(path.relative(root, f));
  }
}
console.log('updated', n, 'files');
