/**
 * Audits every translation key referenced in templates/components against all
 * three language files, so a missing key can never ship as raw "SECTION.KEY"
 * text in the UI.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const LANGS = ['en', 'fr', 'es'];
const ROOT = 'src';

// Build a set of every key path defined in a language file.
function flatten(obj, prefix = '', out = new Set()) {
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, p, out);
    else out.add(p);
  }
  return out;
}

const defined = {};
for (const l of LANGS) {
  defined[l] = flatten(JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', 'i18n', `${l}.json`), 'utf8')));
}

// Find every quoted SCREAMING_SNAKE or dotted key inside translate expressions.
const files = execSync(`git ls-files "src/**/*.ts" "src/**/*.html"`, { encoding: 'utf8' })
  .split('\n').filter(Boolean)
  // git ls-files still reports staged-but-deleted paths, which would throw.
  .filter(f => fs.existsSync(f));

const keyRe = /['"`]([A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z0-9_]+)+)['"`]/g;
// Namespaces are derived from the language files instead of a hardcoded list,
// so a new or empty namespace can never be silently skipped. An empty object
// still registers as a namespace, which is what catches "A11Y": {} shipping
// every A11Y.* label to the DOM as raw text.
const namespaces = new Set();
for (const k of defined.en) namespaces.add(k.split('.')[0]);
const known = Object.keys(JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', 'i18n', 'en.json'), 'utf8')));

const found = new Map();
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = keyRe.exec(src))) {
    const k = m[1];
    const ns = k.split('.')[0];
    if (namespaces.has(ns) || known.includes(ns)) {
      if (!found.has(k)) found.set(k, new Set());
      found.get(k).add(f);
    }
  }
}

let problems = 0;
for (const [key, where] of [...found.entries()].sort()) {
  const missing = LANGS.filter(l => !defined[l].has(key));
  if (missing.length) {
    problems++;
    console.log(`MISSING [${missing.join(',')}]  ${key}`);
    console.log(`   used in: ${[...where].join(', ')}`);
  }
}

// Flag language files that are not structurally parallel.
console.log('\n--- structural parity ---');
const enKeys = defined.en;
for (const l of ['fr', 'es']) {
  const missing = [...enKeys].filter(k => !defined[l].has(k));
  const extra = [...defined[l]].filter(k => !enKeys.has(k));
  console.log(`${l}: ${missing.length} key(s) missing vs en, ${extra.length} extra`);
  missing.slice(0, 10).forEach(k => console.log('   missing:', k));
}

console.log(`\n${found.size} distinct template keys checked, ${problems} with missing translations.`);
