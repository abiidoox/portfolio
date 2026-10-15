#!/usr/bin/env node
/**
 * Browser probe for the self-hosted icon fonts (companion of check-icons.cjs).
 *
 * Loads /skills in headless Chrome and prints a parseable report:
 *   font files fetched       - every font file the page requested
 *   external requests        - any request that left the site's own origin
 *                              (self-hosted fonts regression guard)
 *   codepoint mismatches     - devicon icons whose rendered ::before codepoint
 *                              differs from tools/devicon-subset.json
 *   glyph paint check        - lit pixels when each devicon glyph is drawn on
 *                              a canvas, plus the list of blank glyphs
 *   fa codepoint mismatches  - Font Awesome classes whose rendered codepoint
 *                              differs from tools/fontawesome-subset.json, or
 *                              whose family class resolves to the wrong font
 *   fa glyph paint check     - same canvas test per FA family (solid/brands)
 *   rendered fa icons        - real page elements carrying a glyph class, and
 *                              any whose ::before does not resolve to the
 *                              codepoint the subset promises
 *   console errors           - console errors, exceptions and failed requests
 *
 * Run: node tools/probe-icons.cjs   (needs a server on :4210)
 */
const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE_URL || 'http://localhost:4210';
const PORT = 9339;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const devSpec = JSON.parse(fs.readFileSync(path.join(__dirname, 'devicon-subset.json'), 'utf8'));
const devGlyphs = devSpec.glyphs || {};
const faSpec = JSON.parse(fs.readFileSync(path.join(__dirname, 'fontawesome-subset.json'), 'utf8'));
const faGlyphs = faSpec.glyphs || {};
const faFamilies = faSpec.families || {};

function get(url) {
  return new Promise((res, rej) => {
    http.get(url, r => {
      let d = '';
      r.on('data', c => (d += c));
      r.on('end', () => res(d));
    }).on('error', rej);
  });
}

(async () => {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'probe-icons-'));
  const chrome = spawn(CHROME, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--hide-scrollbars',
    'about:blank'
  ], { stdio: 'ignore' });

  let target = null;
  for (let i = 0; i < 40 && !target; i++) {
    await sleep(500);
    try {
      const list = JSON.parse(await get(`http://127.0.0.1:${PORT}/json/list`));
      target = list.find(t => t.type === 'page');
    } catch (_) { /* not up yet */ }
  }
  if (!target) {
    console.log('font files fetched: n/a (could not start Chrome)');
    console.log('external requests: n/a');
    console.log('codepoint mismatches: n/a');
    console.log('glyph paint check: 0');
    console.log('fa codepoint mismatches: n/a');
    console.log('fa glyph paint check: 0');
    console.log('rendered fa icons: n/a');
    console.log('console errors: probe could not start Chrome');
    chrome.kill();
    process.exit(1);
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  const events = [];

  const send = (method, params = {}) =>
    new Promise(resolve => {
      const msgId = ++id;
      pending.set(msgId, resolve);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

  await new Promise(r => (ws.onopen = r));
  ws.onmessage = e => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg.result); pending.delete(msg.id); }
    else if (msg.method) events.push(msg);
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Network.enable');

  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: BASE + '/skills' });

  // Wait for the page (and its lazy chunks) to finish loading.
  for (let i = 0; i < 30; i++) {
    await sleep(400);
    const r = await send('Runtime.evaluate', { expression: 'document.readyState', returnByValue: true });
    if (r && r.result && r.result.value === 'complete') break;
  }
  await sleep(1200);

  // ---- font files the page actually fetched
  const fonts = [...new Set(events
    .filter(ev => ev.method === 'Network.requestWillBeSent' &&
      /\.(woff2?|ttf|otf|eot|svg)([?#]|$)/i.test(ev.params.request.url))
    .map(ev => ev.params.request.url.split('/').pop().split(/[?#]/)[0]))];

  // ---- requests that left the site's own origin
  const external = [...new Set(events
    .filter(ev => ev.method === 'Network.requestWillBeSent')
    .map(ev => ev.params.request.url)
    .filter(u => !u.startsWith(BASE) && !/^(data|about|blob|devtools|chrome)/.test(u)))];

  // ---- rendered codepoints + glyph paint, measured in the page.
  // Holds synthetic spans for every spec class first (so both fonts are
  // requested), then waits for document.fonts.ready before the canvas test.
  const probe = await send('Runtime.evaluate', {
    returnByValue: true,
    awaitPromise: true,
    expression: `(async () => {
      const dev = ${JSON.stringify(devGlyphs)};
      const fa = ${JSON.stringify(faGlyphs)};
      const faFam = ${JSON.stringify(faFamilies)};
      const size = 48, cols = 6;

      const makeHolder = () => {
        const holder = document.createElement('div');
        holder.style.cssText = 'position:fixed;left:-9999px;top:0;font-size:32px;';
        document.body.appendChild(holder);
        return holder;
      };
      const contentCp = el => {
        const content = getComputedStyle(el, '::before').content || '';
        const raw = content.replace(/^"|"$/g, '');
        const cp = raw ? raw.codePointAt(0) : 0;
        return cp ? cp.toString(16).toUpperCase() : 'none';
      };
      const paint = (entries, fontFor) => {
        const cv = document.createElement('canvas');
        cv.width = cols * size;
        cv.height = Math.ceil(entries.length / cols) * size;
        const ctx = cv.getContext('2d');
        ctx.textBaseline = 'top';
        const blanks = [];
        let total = 0;
        entries.forEach(([, hex], i) => {
          const x = (i % cols) * size, y = Math.floor(i / cols) * size;
          ctx.clearRect(x, y, size, size);
          ctx.font = fontFor(entries[i][0]);
          ctx.fillText(String.fromCodePoint(parseInt(hex, 16)), x + 4, y + 2);
          const d = ctx.getImageData(x, y, size, size).data;
          let lit = 0;
          for (let p = 0; p < d.length; p += 4) if (d[p + 3] > 0) lit++;
          total += lit;
          if (lit === 0) blanks.push(entries[i][0]);
        });
        return { total, blanks };
      };

      // devicon: rendered codepoints
      const devHolder = makeHolder();
      const mismatches = [];
      for (const [cls, hex] of Object.entries(dev)) {
        const span = document.createElement('span');
        span.className = cls;
        devHolder.appendChild(span);
        const got = contentCp(span);
        if (got !== hex) mismatches.push(cls + ': got ' + got + ' expected ' + hex);
      }

      // Font Awesome: rendered codepoints, with the family class the spec
      // says can render them
      const faHolder = makeHolder();
      const faMismatches = [];
      for (const [cls, hex] of Object.entries(fa)) {
        const span = document.createElement('span');
        span.className = (faFam[cls] === 'brands' ? 'fab ' : 'fas ') + cls;
        faHolder.appendChild(span);
        const got = contentCp(span);
        if (got !== hex) faMismatches.push(cls + ': got ' + got + ' expected ' + hex);
        const family = getComputedStyle(span).fontFamily || '';
        const want = faFam[cls] === 'brands' ? 'Font Awesome 6 Brands' : 'Font Awesome 6 Free';
        if (!family.includes(want)) faMismatches.push(cls + ': family ' + family + ' expected ' + want);
      }

      // Both fonts must have settled before the canvas paint test.
      await document.fonts.ready;

      const devPaint = paint(Object.entries(dev), () => size + 'px devicon');
      const faPaint = paint(Object.entries(fa), cls =>
        (faFam[cls] === 'brands' ? '400 ' : '900 ') + size + 'px "' +
        (faFam[cls] === 'brands' ? 'Font Awesome 6 Brands' : 'Font Awesome 6 Free') + '"');

      // Real elements on the page that carry a glyph class: their ::before
      // must resolve to the codepoint the subset promises. Catches a template
      // that pairs a glyph with the wrong family class (renders tofu).
      const faBroken = [];
      let faCount = 0;
      for (const el of document.querySelectorAll('*')) {
        const glyph = [...el.classList].find(c => fa[c]);
        if (!glyph) continue;
        faCount++;
        const got = contentCp(el);
        if (got !== fa[glyph]) faBroken.push(el.tagName.toLowerCase() + '.' + glyph + ': got ' + got);
      }

      devHolder.remove();
      faHolder.remove();
      return JSON.stringify({
        mismatches, devTotal: devPaint.total, devBlanks: devPaint.blanks,
        faMismatches, faTotal: faPaint.total, faBlanks: faPaint.blanks,
        faCount, faBroken
      });
    })()`
  });

  let result = {};
  try { result = JSON.parse((probe && probe.result && probe.result.value) || '{}'); } catch (_) { /* reported below */ }
  const mismatches = result.mismatches || [];
  const devBlanks = result.devBlanks || [];
  const faMismatches = result.faMismatches || [];
  const faBlanks = result.faBlanks || [];
  const faBroken = result.faBroken || [];

  // ---- console errors / exceptions / failed requests
  const errors = [];
  for (const ev of events) {
    if (ev.method === 'Runtime.exceptionThrown') {
      const d = ev.params.exceptionDetails;
      errors.push('EXCEPTION ' + (d.exception?.description || d.text || '').split('\n')[0]);
    }
    if (ev.method === 'Runtime.consoleAPICalled' && ev.params.type === 'error') {
      errors.push('CONSOLE ' + ev.params.args.map(a => a.value ?? a.description ?? '').join(' ').slice(0, 220));
    }
    if (ev.method === 'Log.entryAdded' && ev.params.entry.level === 'error') {
      errors.push('LOG ' + (ev.params.entry.text || '').slice(0, 220));
    }
    if (ev.method === 'Network.loadingFailed') {
      errors.push('NETFAIL ' + ev.params.errorText);
    }
  }
  const uniqueErrors = [...new Set(errors.map(e => e.replace(/\s+/g, ' ').trim()))];

  console.log('font files fetched: ' + (fonts.length ? fonts.join(', ') : 'none'));
  console.log('external requests: ' + (external.length ? external.join(', ') : 'none'));
  console.log('codepoint mismatches: ' + (mismatches.length ? mismatches.length + ' (' + mismatches.join('; ') + ')' : '0'));
  console.log('glyph paint check: ' + (result.devTotal || 0) + ' | blank glyphs: ' + (devBlanks.length ? devBlanks.join(', ') : 'none'));
  console.log('fa codepoint mismatches: ' + (faMismatches.length ? faMismatches.length + ' (' + faMismatches.join('; ') + ')' : '0'));
  console.log('fa glyph paint check: ' + (result.faTotal || 0) + ' | blank glyphs: ' + (faBlanks.length ? faBlanks.join(', ') : 'none'));
  console.log('rendered fa icons: ' + (result.faCount || 0) + ' | broken: ' + (faBroken.length ? faBroken.join(', ') : 'none'));
  console.log('console errors: ' + (uniqueErrors.length ? uniqueErrors.length + ' (' + uniqueErrors.join(' | ') + ')' : 'none'));

  ws.close();
  chrome.kill();
  process.exit(0);
})().catch(err => {
  console.log('console errors: probe crashed: ' + (err && err.message ? err.message : err));
  process.exit(1);
});
