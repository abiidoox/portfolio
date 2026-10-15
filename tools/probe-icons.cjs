#!/usr/bin/env node
/**
 * Browser probe for the devicon subset (companion of check-icons.cjs).
 *
 * Loads /skills in headless Chrome and prints a parseable report:
 *   font files fetched    - every font file the page requested
 *   codepoint mismatches  - icons whose rendered ::before codepoint differs
 *                           from tools/devicon-subset.json
 *   glyph paint check     - lit pixels when each subset glyph is drawn on a
 *                           canvas, plus the list of blank glyphs
 *   console errors        - console errors, exceptions and failed requests
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
const spec = JSON.parse(fs.readFileSync(path.join(__dirname, 'devicon-subset.json'), 'utf8'));
const glyphs = spec.glyphs || {};

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
    console.log('codepoint mismatches: n/a');
    console.log('glyph paint check: 0');
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
  await send('Runtime.evaluate', { expression: 'document.fonts.ready.then(() => true)', awaitPromise: true });

  // ---- font files the page actually fetched
  const fonts = [...new Set(events
    .filter(ev => ev.method === 'Network.requestWillBeSent' &&
      /\.(woff2?|ttf|otf|eot|svg)([?#]|$)/i.test(ev.params.request.url))
    .map(ev => ev.params.request.url.split('/').pop().split(/[?#]/)[0]))];

  // ---- rendered codepoints + glyph paint, measured in the page
  const probe = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const spec = ${JSON.stringify(glyphs)};
      const holder = document.createElement('div');
      holder.style.cssText = 'position:fixed;left:-9999px;top:0;font-size:32px;';
      document.body.appendChild(holder);
      const mismatches = [];
      for (const [cls, hex] of Object.entries(spec)) {
        const span = document.createElement('span');
        span.className = cls;
        holder.appendChild(span);
        const content = getComputedStyle(span, '::before').content || '';
        const raw = content.replace(/^"|"$/g, '');
        const cp = raw ? raw.codePointAt(0) : 0;
        const got = cp ? cp.toString(16).toUpperCase() : 'none';
        if (got !== hex) mismatches.push(cls + ': got ' + got + ' expected ' + hex);
      }
      holder.remove();

      const size = 48, cols = 6;
      const entries = Object.entries(spec);
      const cv = document.createElement('canvas');
      cv.width = cols * size;
      cv.height = Math.ceil(entries.length / cols) * size;
      const ctx = cv.getContext('2d');
      ctx.font = size + 'px devicon';
      ctx.textBaseline = 'top';
      const blanks = [];
      let total = 0;
      entries.forEach(([, hex], i) => {
        const x = (i % cols) * size, y = Math.floor(i / cols) * size;
        ctx.clearRect(x, y, size, size);
        ctx.fillText(String.fromCodePoint(parseInt(hex, 16)), x + 4, y + 2);
        const d = ctx.getImageData(x, y, size, size).data;
        let lit = 0;
        for (let p = 0; p < d.length; p += 4) if (d[p + 3] > 0) lit++;
        total += lit;
        if (lit === 0) blanks.push(entries[i][0]);
      });
      return JSON.stringify({ mismatches, total, blanks });
    })()`
  });

  let result = {};
  try { result = JSON.parse((probe && probe.result && probe.result.value) || '{}'); } catch (_) { /* reported below */ }
  const mismatches = result.mismatches || [];
  const blanks = result.blanks || [];
  const total = result.total || 0;

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
  console.log('codepoint mismatches: ' + (mismatches.length ? mismatches.length + ' (' + mismatches.join('; ') + ')' : '0'));
  console.log('glyph paint check: ' + total + ' | blank glyphs: ' + (blanks.length ? blanks.join(', ') : 'none'));
  console.log('console errors: ' + (uniqueErrors.length ? uniqueErrors.length + ' (' + uniqueErrors.join(' | ') + ')' : 'none'));

  ws.close();
  chrome.kill();
  process.exit(0);
})().catch(err => {
  console.log('console errors: probe crashed: ' + (err && err.message ? err.message : err));
  process.exit(1);
});
