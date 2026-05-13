const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const requiredPages = ['index.html', 'wardrobe.html', 'outfit.html', 'suggestion.html', 'tryon.html'];
const requiredAssets = ['style.css', 'config.js', 'storage.js', 'app.js'];

function fail(message) {
  console.error(`validate: ${message}`);
  process.exitCode = 1;
}

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

for (const file of [...requiredPages, ...requiredAssets]) {
  const target = path.join(publicDir, file);
  if (!fs.existsSync(target)) {
    fail(`missing public/${file}`);
  }
}

for (const page of requiredPages) {
  const html = read(path.join(publicDir, page));
  const openScripts = (html.match(/<script\b/gi) || []).length;
  const closeScripts = (html.match(/<\/script>/gi) || []).length;
  if (openScripts !== closeScripts) {
    fail(`${page} has mismatched script tags`);
  }

  for (const asset of requiredAssets) {
    if (!html.includes(`"${asset}"`) && !html.includes(`'${asset}'`)) {
      fail(`${page} does not reference ${asset}`);
    }
  }
}

for (const script of ['config.js', 'storage.js', 'app.js']) {
  const file = path.join(publicDir, script);
  try {
    new vm.Script(read(file), { filename: file });
  } catch (error) {
    fail(`${script} has invalid JavaScript: ${error.message}`);
  }
}

if (!process.exitCode) {
  console.log('validate: static app checks passed');
}
