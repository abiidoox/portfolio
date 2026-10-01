#!/usr/bin/env node
/**
 * Verifies the devicon subset is in sync with the skills data.
 *
 * The subset is a generated artefact, so the failure mode is mundane and easy
 * to miss: someone adds a technology to skills.data.ts, and its icon silently
 * renders as tofu because the glyph is not in devicon-subset.woff2. This check
 * fails loudly instead.
 *
 * Two things are verified:
 *   1. static  - every devicon class in skills.data.ts has a codepoint in
 *                tools/devicon-subset.json and a :before rule in
 *                src/devicon-subset.css (i.e. regenerate after editing skills)
 *   2. runtime - in a real browser, every icon on /skills resolves to the exact
 *                codepoint the subset claims, uses the devicon family, has a
 *                non-zero box, and the font actually loaded and painted
 *
 * Run: node tools/check-icons.cjs
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

const specPath = path.join(root, 'tools/devicon-subset.json');
let fail = 0;
const ok = m => console.log('  \u2713 ' + m);
const bad = m => { console.log('  \u2717 ' + m); fail++; };

// ---------------------------------------------------------------- static
console.log('\nicons \u2014 subset sync');

if (!fs.existsSync(specPath)) {
  bad('tools/devicon-subset.json is missing \u2014 run: node tools/build-devicon-subset.cjs && python tools/subset-devicon.py');
} else {
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const dataSrc = read('src/app/data/skills.data.ts');
  const css = read('src/devicon-subset.css');

  const used = [...new Set([...dataSrc.matchAll(/'(devicon-[a-z0-9-]+)'/g)].map(m => m[1]))].sort();

  const noGlyph = used.filter(c => !spec.glyphs || !spec.glyphs[c]);
  const noRule = used.filter(c => !css.includes('.' + c + ':before'));
  const unused = (spec.classes || []).filter(c => !used.includes(c));

  used.length ? ok(used.length + ' devicon classes in skills.data.ts') : bad('no devicon classes found in skills.data.ts');
  noGlyph.length
    ? bad('no glyph in subset (regenerate): ' + noGlyph.join(', '))
    : ok('every class has a glyph in the subset');
  noRule.length
    ? bad('no :before rule in src/devicon-subset.css: ' + noRule.join(', '))
    : ok('every class has a :before rule');
  unused.length
    ? console.log('  \u00b7 ' + unused.length + ' subset glyph(s) unused by skills.data.ts (harmless): ' + unused.join(', '))
    : ok('no unused glyphs in subset');

  const fontPath = path.join(root, 'src/assets/fonts/devicon-subset.woff2');
  if (!fs.existsSync(fontPath)) {
    bad('src/assets/fonts/devicon-subset.woff2 is missing \u2014 run: python tools/subset-devicon.py');
  } else {
    const kb = fs.statSync(fontPath).size / 1024;
    kb < 100 ? ok('subset font present, ' + kb.toFixed(1) + ' KB') : bad('subset font is ' + kb.toFixed(1) + ' KB \u2014 too large, was it generated as woff2?');
  }

  // The full font must not be wired into the build any more.
  const angular = read('angular.json');
  /node_modules\/devicon\/devicon\.min\.css/.test(angular)
    ? bad('angular.json still imports the full devicon.min.css (10.6 MB) \u2014 replace it with src/devicon-subset.css')
    : ok('build no longer imports the full devicon.min.css');
  /"devicon"\s*:\s*"\^?2/.test(read('package.json').replace(/"devicon":\s*"[^\"]*"\s*,?\s*\n\s*"postcss"/, '"postcss"'))
    && /^[\s\S]*?"devicon":\s*"\^?2[\s\S]*?"devDependencies"/.test(read('package.json'))
    ? bad('devicon still looks like a runtime dependency')
    : ok('devicon is build-time only');
}

// --------------------------------------------------------------- runtime
console.log('\nicons \u2014 browser');

const serverUp = spawnSync(process.execPath, ['-e',
  `const h=require('http');h.get('http://localhost:4210/',r=>process.exit(0)).on('error',()=>process.exit(1)).setTimeout(4000,()=>process.exit(1));`],
  { timeout: 10000 }).status === 0;

if (!serverUp) {
  console.log('  \u00b7 dev server not on :4210 \u2014 skipping runtime checks (start "npm start -- --port 4210")');
} else {
  const cdp = spawnSync(process.execPath, [path.join(require('os').tmpdir(), 'probe-icons.cjs')], { encoding: 'utf8', timeout: 180000 });
  const out = (cdp.stdout || '') + (cdp.stderr || '');
  console.log(out.trim());

  const expectOnly = /font files fetched\s*:([^\n]*)/;
  const fetched = (out.match(expectOnly) || ['', ''])[1].trim();
  if (fetched) {
    /devicon\.(ttf|woff|eot|svg)/.test(fetched)
      ? bad('legacy devicon font still fetched: ' + fetched)
      : ok('only the subset font is fetched');
  } else bad('could not read the font fetch list from the probe');
  const mismatch = out.match(/codepoint mismatches\s*:\s*(.*)/);
  if (mismatch) {
    mismatch[1].trim() === '0' ? ok('all glyphs match the subset spec') : bad('codepoint mismatches: ' + mismatch[1].trim());
  } else bad('probe did not report codepoint mismatches');
  const paint = out.match(/glyph paint check\s*:\s*(\d+)/);
  if (paint) Number(paint[1]) > 150 ? ok('glyphs paint (' + paint[1] + ' lit pixels)') : bad('glyph area is blank');
  else bad('probe did not report the glyph paint check');
  const con = out.match(/console errors\s*:\s*(.*)/);
  if (con) con[1].trim() === 'none' ? ok('no console errors') : bad('console errors: ' + con[1].trim());
  else bad('probe did not report console errors');
}

console.log(fail ? '\nicons: ' + fail + ' problem(s)\n' : '\nicons: all checks passed\n');
process.exit(fail ? 1 : 0);
