#!/usr/bin/env node
/**
 * Verifies the icon-font subsets and the self-hosted fonts stay in sync with
 * the code.
 *
 * The subsets are generated artefacts, so the failure mode is mundane and easy
 * to miss: someone adds an icon to a template, and it silently renders as tofu
 * because the glyph was never subsetted in. Or a CDN link gets reintroduced
 * and third-party CSS is back on the critical path. This check fails loudly
 * instead.
 *
 * Four groups are verified:
 *   icons — devicon subset sync   (skills.data.ts -> subset json -> css -> woff2)
 *   icons — fontawesome subset    (src templates -> subset json -> css -> woff2)
 *   fonts — self-hosted           (no third-party hosts, every @font-face
 *                                  url resolves to a committed file)
 *   icons — browser               (probe-icons.cjs: rendered codepoints match
 *                                  the specs, glyphs paint, no external
 *                                  requests, no console errors)
 *
 * Run: node tools/check-icons.cjs
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

let fail = 0;
const ok = m => console.log('  \u2713 ' + m);
const bad = m => { console.log('  \u2717 ' + m); fail++; };

// Family/style utility classes are not glyphs. Kept in sync with
// tools/build-fontawesome-subset.cjs.
const FA_UTILITIES = new Set([
  'fa-solid', 'fa-regular', 'fa-brands', 'fa-classic', 'fa-sharp',
  'fa-fw', 'fa-spin', 'fa-pulse', 'fa-beat', 'fa-fade', 'fa-flip', 'fa-bounce', 'fa-shake',
]);

// ---------------------------------------------------------------- devicon
console.log('\nicons \u2014 devicon subset sync');

const specPath = path.join(root, 'tools/devicon-subset.json');
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
  /"devicon"\s*:\s*"\^?2/.test(read('package.json').replace(/"devicon":\s*"[^\"]*"\s*,?\s*\n\s*"postcss"/, '"postcss"')) &&
  /^[\s\S]*?"devicon":\s*"\^?2[\s\S]*?"devDependencies"/.test(read('package.json'))
    ? bad('devicon still looks like a runtime dependency')
    : ok('devicon is build-time only');
}

// ------------------------------------------------------------ fontawesome
console.log('\nicons \u2014 fontawesome subset');

const faSpecPath = path.join(root, 'tools/fontawesome-subset.json');
if (!fs.existsSync(faSpecPath)) {
  bad('tools/fontawesome-subset.json is missing \u2014 run: node tools/build-fontawesome-subset.cjs && python tools/subset-fontawesome.py');
} else {
  const spec = JSON.parse(fs.readFileSync(faSpecPath, 'utf8'));
  const css = read('src/fontawesome-subset.css');
  const specClasses = spec.classes || [];

  // Same scan as tools/build-fontawesome-subset.cjs: every fa-* class in the
  // templates and TS files, minus the family/style utilities.
  const used = new Set();
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (/\.(html|ts)$/.test(entry.name)) {
        for (const m of fs.readFileSync(p, 'utf8').matchAll(/\bfa-[a-z0-9-]+/g)) {
          if (!FA_UTILITIES.has(m[0])) used.add(m[0]);
        }
      }
    }
  };
  walk(path.join(root, 'src'));
  const usedList = [...used].sort();

  const notSubset = usedList.filter(c => !specClasses.includes(c));
  const noRule = specClasses.filter(c => !css.includes('.' + c + ':before'));
  const unused = specClasses.filter(c => !usedList.includes(c));

  usedList.length ? ok(usedList.length + ' fa classes used in src') : bad('no fa classes found in src');
  notSubset.length
    ? bad('used but not in the subset (regenerate): ' + notSubset.join(', '))
    : ok('every used class is in the subset');
  noRule.length
    ? bad('no :before rule in src/fontawesome-subset.css: ' + noRule.join(', '))
    : ok('every class has a :before rule');
  unused.length
    ? console.log('  \u00b7 ' + unused.length + ' subset glyph(s) unused (harmless): ' + unused.join(', '))
    : ok('no unused glyphs in subset');

  for (const f of ['fa-solid-subset.woff2', 'fa-brands-subset.woff2']) {
    const p = path.join(root, 'src/assets/fonts', f);
    if (!fs.existsSync(p)) bad('src/assets/fonts/' + f + ' is missing \u2014 run: python tools/subset-fontawesome.py');
    else {
      const kb = fs.statSync(p).size / 1024;
      kb < 50 ? ok(f + ' present, ' + kb.toFixed(1) + ' KB') : bad(f + ' is ' + kb.toFixed(1) + ' KB \u2014 was it generated as woff2?');
    }
  }
}

// ---------------------------------------------------------- self-hosted fonts
console.log('\nfonts \u2014 self-hosted');

const indexHtml = read('src/index.html');
/https?:\/\/(cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)/.test(indexHtml)
  ? bad('index.html still links a third-party css/font host \u2014 self-host it (src/fonts.css / the subset css files)')
  : ok('index.html loads no third-party stylesheets or fonts');

const angular = read('angular.json');
const missingStyles = ['src/fontawesome-subset.css', 'src/devicon-subset.css', 'src/fonts.css'].filter(s => !angular.includes(s));
missingStyles.length
  ? bad('angular.json does not bundle: ' + missingStyles.join(', '))
  : ok('angular.json bundles the subset css and src/fonts.css');

if (!fs.existsSync(path.join(root, 'src/fonts.css'))) {
  bad('src/fonts.css is missing \u2014 run: node tools/fetch-google-fonts.cjs');
} else {
  const faces = (read('src/fonts.css').match(/@font-face/g) || []).length;
  faces ? ok('src/fonts.css declares ' + faces + ' @font-face rules') : bad('src/fonts.css has no @font-face rules');

  const dangling = [];
  for (const cssFile of ['src/fonts.css', 'src/fontawesome-subset.css', 'src/devicon-subset.css']) {
    for (const m of read(cssFile).matchAll(/url\("([^"]+)"\)/g)) {
      if (!fs.existsSync(path.join(root, 'src', m[1]))) dangling.push(cssFile + ' -> ' + m[1]);
    }
  }
  dangling.length
    ? bad('css references missing font files: ' + dangling.join(', '))
    : ok('every @font-face points at a committed font file');
}

// --------------------------------------------------------------- runtime
console.log('\nicons \u2014 browser');

const serverUp = spawnSync(process.execPath, ['-e',
  `const h=require('http');h.get('http://localhost:4210/',r=>process.exit(0)).on('error',()=>process.exit(1)).setTimeout(4000,()=>process.exit(1));`],
  { timeout: 10000 }).status === 0;

if (!serverUp) {
  console.log('  \u00b7 dev server not on :4210 \u2014 skipping runtime checks (start "npm start -- --port 4210")');
} else {
  const cdp = spawnSync(process.execPath, [path.join(__dirname, 'probe-icons.cjs')], { encoding: 'utf8', timeout: 180000 });
  const out = (cdp.stdout || '') + (cdp.stderr || '');
  console.log(out.trim());

  const fetched = (out.match(/font files fetched\s*:([^\n]*)/) || ['', ''])[1].trim();
  if (fetched) {
    /devicon\.(ttf|woff|eot|svg)/.test(fetched)
      ? bad('legacy devicon font still fetched: ' + fetched)
      : ok('no legacy devicon font fetched');
    /fa-(solid-900|brands-400|regular-400|v4compatibility)(-[A-Z0-9]+)?\.(woff2?|ttf)/.test(fetched)
      ? bad('full Font Awesome webfont still fetched: ' + fetched)
      : ok('no full Font Awesome webfont fetched');
    /fa-solid-subset[^,]*\.woff2/.test(fetched) && /fa-brands-subset[^,]*\.woff2/.test(fetched)
      ? ok('both Font Awesome subset woff2 files fetched')
      : bad('Font Awesome subset font not fetched \u2014 fetched: ' + fetched);
  } else bad('could not read the font fetch list from the probe');

  const ext = out.match(/external requests\s*:\s*(.*)/);
  if (ext) ext[1].trim() === 'none' ? ok('no request leaves the site origin') : bad('external requests: ' + ext[1].trim());
  else bad('probe did not report external requests');

  const mismatch = out.match(/codepoint mismatches\s*:\s*(.*)/);
  if (mismatch) {
    mismatch[1].trim() === '0' ? ok('all devicon glyphs match the subset spec') : bad('devicon codepoint mismatches: ' + mismatch[1].trim());
  } else bad('probe did not report devicon codepoint mismatches');

  const paint = out.match(/glyph paint check\s*:\s*(\d+)/);
  if (paint) Number(paint[1]) > 150 ? ok('devicon glyphs paint (' + paint[1] + ' lit pixels)') : bad('devicon glyph area is blank');
  else bad('probe did not report the devicon glyph paint check');

  const faMismatch = out.match(/fa codepoint mismatches\s*:\s*(.*)/);
  if (faMismatch) {
    faMismatch[1].trim() === '0' ? ok('all fa glyphs match the subset spec') : bad('fa codepoint mismatches: ' + faMismatch[1].trim());
  } else bad('probe did not report fa codepoint mismatches');

  const faPaint = out.match(/fa glyph paint check\s*:\s*(\d+)/);
  if (faPaint) Number(faPaint[1]) > 150 ? ok('fa glyphs paint (' + faPaint[1] + ' lit pixels)') : bad('fa glyph area is blank');
  else bad('probe did not report the fa glyph paint check');

  const faRendered = out.match(/rendered fa icons\s*:\s*(\d+)\s*\|\s*broken:\s*(.*)/);
  if (faRendered) {
    faRendered[2].trim() === 'none'
      ? ok(faRendered[1] + ' rendered fa icon(s) on the page, none broken')
      : bad('broken rendered icons: ' + faRendered[2].trim());
  } else bad('probe did not report rendered fa icons');

  const con = out.match(/console errors\s*:\s*(.*)/);
  if (con) con[1].trim() === 'none' ? ok('no console errors') : bad('console errors: ' + con[1].trim());
  else bad('probe did not report console errors');
}

console.log(fail ? '\nicons: ' + fail + ' problem(s)\n' : '\nicons: all checks passed\n');
process.exit(fail ? 1 : 0);
