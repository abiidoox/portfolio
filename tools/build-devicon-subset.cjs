#!/usr/bin/env node
/**
 * Regenerates the devicon subset.
 *
 * Why this exists: the full devicon font is ~1.5 MB per format and ships four
 * formats (eot, ttf, woff, svg) — 10.6 MB of the 12 MB deploy. No woff2 is
 * published, and Chrome picks the first format it supports from the src list,
 * which is the 1.5 MB TrueType file, fetched with font-display:block, so the
 * skills icons are invisible until it lands.
 *
 * Only 26 of devicon's ~2000 glyphs are ever used. This script reads the icon
 * names straight out of skills.data.ts, extracts their codepoints from
 * devicon.min.css, and emits:
 *
 *   tools/devicon-subset.json      codepoint list, consumed by the subsetter
 *   src/assets/fonts/devicon-subset.woff2   (written by tools/subset-devicon.py)
 *   src/devicon-subset.css         @font-face + only the rules we need
 *
 * Run both steps whenever skills.data.ts changes:
 *   node tools/build-devicon-subset.mjs
 *   python tools/subset-devicon.py
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

const dataSrc = read('src/app/data/skills.data.ts');
const deviconCss = read('node_modules/devicon/devicon.min.css');

// 1. Which devicon classes does the site actually use?
const used = [...new Set([...dataSrc.matchAll(/'(devicon-[a-z0-9-]+)'/g)].map(m => m[1]))].sort();

// 2. Map each class to its codepoint.
//    devicon.min.css stores private-use glyphs as literal characters inside
//    content:"…", not as \eXXX escapes, so the character has to be read back
//    out and converted with codePointAt. Selectors are also comma-grouped
//    (".devicon-csharp-plain:before,.devicon-csharp-plain-wordmark:before"),
//    so every selector in a group shares the codepoint.
const map = new Map();
for (const m of deviconCss.matchAll(/([^{}]+)\{content:"([^"]+)"\}/g)) {
  const cp = m[2].codePointAt(0);
  if (cp === undefined) continue;
  for (const sel of m[1].split(',')) {
    const cls = sel.trim().match(/^\.(devicon-[a-z0-9-]+):before$/);
    if (cls && !map.has(cls[1])) map.set(cls[1], cp);
  }
}

const missing = used.filter(c => !map.has(c));
if (missing.length) {
  console.error('ERROR: no codepoint found for: ' + missing.join(', '));
  process.exit(1);
}

const codepoints = [...new Set(used.map(c => map.get(c)))].sort((a, b) => a - b);

// Class -> codepoint pairs are kept so the result can be verified in a browser
// (tools/check-icons.cjs compares each icon's computed ::before codepoint
// against this), not just trusted from the generated CSS.
const glyphs = {};
for (const c of used) glyphs[c] = map.get(c).toString(16).toUpperCase();

fs.writeFileSync(
  path.join(root, 'tools/devicon-subset.json'),
  JSON.stringify({ classes: used, codepoints, glyphs }, null, 2) + '\n'
);

// 3. Reuse devicon's own base rule verbatim so metrics stay identical.
const baseStart = deviconCss.indexOf('[class^=devicon-]');
const baseRule = deviconCss.slice(baseStart, deviconCss.indexOf('}', baseStart) + 1);

const esc = cp => '\\' + cp.toString(16).toUpperCase();

const css = `/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate with: node tools/build-devicon-subset.mjs && python tools/subset-devicon.py
 *
 * A ${used.length}-glyph subset of the devicon icon font, replacing devicon.min.css.
 * Same font, same codepoints, same rendering — ${used.length} glyphs instead of ~2000,
 * served as woff2 (a few KB) rather than as a 1.5 MB TrueType file.
 */

@font-face {
  font-family: "devicon";
  src: url("assets/fonts/devicon-subset.woff2") format("woff2");
  font-weight: normal;
  font-style: normal;
  /* Icons inherit colour from the element, so there is no metric-compatible
     fallback to swap to. block keeps the reserved box stable instead of
     letting text reflow around tofu. */
  font-display: block;
}

${baseRule}

${used.map(c => `.${c}:before{content:"${esc(map.get(c))}"}`).join('\n')}
`;

fs.writeFileSync(path.join(root, 'src/devicon-subset.css'), css);

console.log(`devicon subset: ${used.length} classes, ${codepoints.length} codepoints`);
console.log('  wrote tools/devicon-subset.json');
console.log('  wrote src/devicon-subset.css');
console.log('  next: python tools/subset-devicon.py');
