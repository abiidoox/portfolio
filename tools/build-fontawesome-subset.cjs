#!/usr/bin/env node
/**
 * Regenerates the Font Awesome subset (solid + brands).
 *
 * Why this exists: index.html loaded the full 6.5.2 all.min.css from cdnjs
 * (~100 KB of CSS) which in turn pulls fa-solid-900.woff2 and
 * fa-brands-400.woff2 (~400 KB) from the same CDN at runtime. The site uses
 * ~50 of the ~2000 glyphs, and the external stylesheet also made every
 * prerender pass log "Unable to locate stylesheet".
 *
 * Icon class names are scanned straight out of the templates and TS files.
 * Codepoints are read from the package's all.min.css — the same file the CDN
 * served — so legacy FA5 aliases (fa-check-circle, fa-info-circle, …) keep
 * working exactly as before. Base rules are extracted verbatim from the
 * package's split css files.
 *
 * Emits:
 *   tools/fontawesome-subset.json   codepoints, consumed by the subsetter
 *   src/assets/fonts/fa-solid-subset.woff2   (written by tools/subset-fontawesome.py)
 *   src/assets/fonts/fa-brands-subset.woff2  (written by tools/subset-fontawesome.py)
 *   src/fontawesome-subset.css      @font-face + base rules + only the glyphs we need
 *
 * Run both steps whenever an icon is added or removed:
 *   node tools/build-fontawesome-subset.cjs
 *   python tools/subset-fontawesome.py
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

// 1. Which fa-* classes does the site actually use?
const used = new Set();
const walk = dir => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (/\.(html|ts)$/.test(entry.name)) {
      for (const m of fs.readFileSync(p, 'utf8').matchAll(/\bfa-[a-z0-9-]+/g)) used.add(m[0]);
    }
  }
};
walk(path.join(root, 'src'));

// Family/style utility classes are not glyphs; anything else that resolves to
// no glyph rule is almost certainly a typo and fails the build.
const utilities = new Set([
  'fa-solid', 'fa-regular', 'fa-brands', 'fa-classic', 'fa-sharp',
  'fa-fw', 'fa-spin', 'fa-pulse', 'fa-beat', 'fa-fade', 'fa-flip', 'fa-bounce', 'fa-shake',
]);

// 2. Map each class to its codepoint and family.
//    all.min.css stores rules as .fa-check-circle:before,.fa-circle-check:before{content:"\f058"}
//    so every selector in a comma group shares the rule's codepoint. The file
//    concatenates one section per font family (Free, then Brands), each opened
//    by that family's @font-face, so the most recent @font-face tells us which
//    font a glyph rule belongs to. The browser probe uses this to paint-test
//    each glyph with the family that can actually render it.
const allCss = read(path.join('node_modules', '@fortawesome', 'fontawesome-free', 'css', 'all.min.css'));
const map = new Map();
let family = 'solid';
for (const m of allCss.matchAll(
  /@font-face\{font-family:"Font Awesome 6 (Free|Brands)"|([^{}]+)\{content:"\\([0-9a-fA-F]+)"\}/g
)) {
  if (m[1]) {
    family = m[1] === 'Brands' ? 'brands' : 'solid';
    continue;
  }
  const cp = parseInt(m[3], 16);
  for (const sel of m[2].split(',')) {
    const cls = sel.trim().match(/^\.(fa-[a-z0-9-]+):before$/);
    if (cls && !map.has(cls[1])) map.set(cls[1], { cp, family });
  }
}

const missing = [...used].filter(c => !map.has(c) && !utilities.has(c));
if (missing.length) {
  console.error('ERROR: no codepoint found for: ' + missing.join(', '));
  process.exit(1);
}

const classes = [...used].filter(c => map.has(c)).sort();
const codepoints = [...new Set(classes.map(c => map.get(c).cp))].sort((a, b) => a - b);

// Class -> codepoint/family pairs are kept so the result can be verified in a
// browser (tools/probe-icons.cjs compares each icon's rendered ::before
// codepoint against this and paint-tests the glyph with the family that can
// render it), not just trusted from the generated CSS.
const glyphs = {};
const families = {};
for (const c of classes) {
  glyphs[c] = map.get(c).cp.toString(16).toUpperCase();
  families[c] = map.get(c).family;
}

fs.writeFileSync(
  path.join(root, 'tools/fontawesome-subset.json'),
  JSON.stringify({ classes, codepoints, glyphs, families }, null, 2) + '\n'
);

// 3. Reuse Font Awesome's own base rules verbatim so metrics stay identical.
//    Rules have no nested braces, so a rule is everything between a closing
//    brace (or start) and the next one; selectors compare after whitespace
//    normalisation because the files format them with newlines. Comments are
//    stripped first — the license header would otherwise glue onto the first
//    selector in the file.
const rules = css =>
  css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('}')
    .map(chunk => {
      const i = chunk.indexOf('{');
      if (i < 0) return null;
      return { sel: chunk.slice(0, i).replace(/\s+/g, ' ').trim(), body: chunk.slice(i + 1).trim() };
    })
    .filter(Boolean);

const baseCss = read(path.join('node_modules', '@fortawesome', 'fontawesome-free', 'css', 'fontawesome.css'));
const solidCss = read(path.join('node_modules', '@fortawesome', 'fontawesome-free', 'css', 'solid.css'));
const brandsCss = read(path.join('node_modules', '@fortawesome', 'fontawesome-free', 'css', 'brands.css'));

const pick = (css, sel, source) => {
  const rule = rules(css).find(r => r.sel === sel);
  if (!rule) throw new Error(`base rule not found in ${source}: ${sel}`);
  return `${rule.sel} {\n  ${rule.body}\n}`;
};

const baseRules = [
  pick(baseCss, '.fa', 'fontawesome.css'),
  pick(baseCss, '.fa, .fa-classic, .fa-sharp, .fas, .fa-solid, .far, .fa-regular, .fab, .fa-brands', 'fontawesome.css'),
  pick(baseCss, '.fas, .fa-classic, .fa-solid, .far, .fa-regular', 'fontawesome.css'),
  pick(baseCss, '.fab, .fa-brands', 'fontawesome.css'),
  pick(solidCss, '.fas, .fa-solid', 'solid.css'),
  pick(brandsCss, '.fab, .fa-brands', 'brands.css'),
].join('\n\n');

const esc = cp => '\\' + cp.toString(16).toUpperCase();

const css = `/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate with: node tools/build-fontawesome-subset.cjs && python tools/subset-fontawesome.py
 *
 * A ${classes.length}-glyph subset of Font Awesome Free 6.5.2 (solid + brands), replacing the
 * cdnjs all.min.css. Same codepoints, same rendering — ${classes.length} glyphs instead of
 * ~2000, served from two local woff2 files (a few KB each) instead of ~400 KB
 * of CDN webfonts, and no external stylesheet for the prerenderer to fetch.
 * Legacy FA5 aliases are included because the codepoints are read from the
 * same all.min.css the CDN served.
 */

@font-face {
  font-family: 'Font Awesome 6 Free';
  font-style: normal;
  font-weight: 900;
  font-display: block;
  src: url("assets/fonts/fa-solid-subset.woff2") format("woff2");
}

@font-face {
  font-family: 'Font Awesome 6 Brands';
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url("assets/fonts/fa-brands-subset.woff2") format("woff2");
}

${baseRules}

${classes.map(c => `.${c}:before{content:"${esc(map.get(c).cp)}"}`).join('\n')}
`;

fs.writeFileSync(path.join(root, 'src/fontawesome-subset.css'), css);

const brandCount = classes.filter(c => map.get(c).family === 'brands').length;
console.log(`fontawesome subset: ${classes.length} classes, ${codepoints.length} codepoints (${brandCount} brand glyphs)`);
console.log('  wrote tools/fontawesome-subset.json');
console.log('  wrote src/fontawesome-subset.css');
console.log('  next: python tools/subset-fontawesome.py');
