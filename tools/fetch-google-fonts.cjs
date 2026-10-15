#!/usr/bin/env node
/**
 * Downloads and self-hosts the Google Fonts the site uses.
 *
 * Why this exists: index.html loaded the css2 stylesheet from
 * fonts.googleapis.com, which pulls woff2 files from fonts.gstatic.com at
 * runtime. Third-party render-blocking CSS on the critical path, a dependency
 * on Google staying up and serving the same CSS, and traffic leaking to a
 * third party for no functional benefit.
 *
 * Requests the same families/weights with a Chrome user-agent (css2 serves
 * woff2 only to browsers), keeps the latin + latin-ext unicode-range blocks
 * (French copy uses "œ", which lives in latin-ext), stores the woff2 files in
 * src/assets/fonts/ and writes src/fonts.css with the @font-face rules
 * rewritten to local paths. When a weight is never rendered the browser still
 * only downloads the ranges it needs.
 *
 * Run this only when the family/weight list below changes.
 * Requires network access.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const OUT_DIR = path.join(root, 'src', 'assets', 'fonts');
const CSS_OUT = path.join(root, 'src', 'fonts.css');

// Firefox/Chrome UA so fonts.googleapis.com serves woff2 rather than ttf.
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Must mirror the weights used in src/styles.css.
const FAMILIES = [
  { query: 'Inter:wght@300;400;500;600;700', slug: 'inter', weights: [300, 400, 500, 600, 700] },
  { query: 'Space+Grotesk:wght@500;600;700', slug: 'space-grotesk', weights: [500, 600, 700] },
  { query: 'JetBrains+Mono:wght@400;500;600', slug: 'jetbrains-mono', weights: [400, 500, 600] },
];

const SUBSETS = ['latin', 'latin-ext'];

async function get(url, as) {
  const res = await fetch(url, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return as === 'buffer' ? Buffer.from(await res.arrayBuffer()) : res.text();
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const faces = [];
  let total = 0;

  for (const fam of FAMILIES) {
    const css = await get(
      `https://fonts.googleapis.com/css2?family=${fam.query}&display=swap`,
      'text'
    );
    const seenWeights = new Set();

    // Blocks are: /* subset */ @font-face { ... }
    for (const m of css.matchAll(/\/\*\s*([a-z-]+)\s*\*\/\s*@font-face\s*{([^}]+)}/g)) {
      const subset = m[1];
      if (!SUBSETS.includes(subset)) continue;

      const body = m[2];
      const family = /font-family:\s*'([^']+)'/.exec(body)[1];
      const weight = /font-weight:\s*(\d+)/.exec(body)[1];
      const range = /unicode-range:\s*([^;]+);/.exec(body)[1].trim();
      const src = /url\((https:[^)]+)\)/.exec(body)[1];

      const file = `${fam.slug}-${weight}-${subset}.woff2`;
      const buf = await get(src, 'buffer');
      fs.writeFileSync(path.join(OUT_DIR, file), buf);
      faces.push({ family, weight, range, file });
      seenWeights.add(weight);
      total += buf.length;
      console.log(`  ${file.padEnd(34)} ${(buf.length / 1024).toFixed(1)} KB`);
    }

    for (const w of fam.weights) {
      if (!seenWeights.has(String(w))) {
        throw new Error(`google fonts served no block for ${fam.slug} weight ${w}`);
      }
    }
  }

  const byFile = [...faces].sort((a, b) => a.file.localeCompare(b.file));
  const cssOut = `/*
 * GENERATED FILE — do not edit by hand.
 * Regenerate with: node tools/fetch-google-fonts.cjs
 *
 * Self-hosted Inter / Space Grotesk / JetBrains Mono (latin + latin-ext
 * ranges), replacing the fonts.googleapis.com stylesheet. Same files Google
 * would have served; unicode-range kept so unused ranges are never fetched.
 */

${byFile
  .map(
    f => `@font-face {
  font-family: ${`'${f.family}'`};
  font-style: normal;
  font-weight: ${f.weight};
  font-display: swap;
  src: url("assets/fonts/${f.file}") format("woff2");
  unicode-range: ${f.range};
}`
  )
  .join('\n\n')}
`;
  fs.writeFileSync(CSS_OUT, cssOut);

  console.log(`\n${byFile.length} faces, ${(total / 1024).toFixed(1)} KB of fonts`);
  console.log('  wrote src/fonts.css');
})().catch(err => {
  console.error(err.message);
  process.exit(1);
});
