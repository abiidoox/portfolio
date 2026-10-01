/**
 * WCAG contrast audit across every route in BOTH themes.
 *
 * This is the guard that catches the class of bug where templates hardcode a
 * Tailwind text colour that only works on one surface. It walks every
 * text-bearing element, resolves the effective composited background by walking
 * up the ancestor chain (including gradient stops, which are the worst case for
 * text laid over them), and applies the AA threshold: 4.5:1, relaxed to 3:1
 * for large text. Exits non-zero when anything fails.
 *
 * Themes are applied through localStorage + a real navigation so the app's own
 * boot path runs and every custom property is fully resolved. Toggling classes
 * on a live page leaves var() chains stale for a tick and produces noise.
 *
 * Usage: node tools/check-contrast.cjs   (dev server must be on $BASE_URL)
 */
const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE_URL || 'http://localhost:4210';
const ROUTES = ['/', '/projects', '/skills', '/resume', '/contact', '/nope-404'];
const port = 9339;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-contrast-'));
const get = u => new Promise((res, rej) => http.get(u, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(d)); }).on('error', rej));

// Runs inside the page.
const PAGE_FN = `
(() => {
  const parse = c => {
    if (!c) return null;
    const m = c.match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    const p = m[1].split(/[\\s,\\/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const lum = c => {
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const ratio = (a, b) => {
    const x = lum(a), y = lum(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  };
  const over = (bottom, top) => ({
    r: top.r * top.a + bottom.r * (1 - top.a),
    g: top.g * top.a + bottom.g * (1 - top.a),
    b: top.b * top.a + bottom.b * (1 - top.a),
    a: 1
  });
  const hex = c => '#' + [c.r, c.g, c.b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');

  // Every background layer painted behind el, nearest first. A gradient counts
  // as a layer with one candidate per colour stop, because text laid over a
  // gradient can only ever be as readable as its worst stop.
  const layersOf = el => {
    const out = [];
    let n = el;
    while (n && n.nodeType === 1) {
      const cs = getComputedStyle(n);
      const bi = cs.backgroundImage;
      if (bi && bi !== 'none' && /gradient/.test(bi)) {
        const re = /rgba?\\([^)]+\\)/g; const stops = []; let m;
        while ((m = re.exec(bi))) { const c = parse(m[0]); if (c) stops.push(c); }
        if (stops.length) out.push({ kind: 'g', stops });
      }
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0) {
        out.push({ kind: 'c', c });
        if (c.a >= 1) break;            // reached an opaque surface, stop
      }
      n = n.parentElement;
    }
    return out;
  };

  // Composite the layer stack bottom-up, carrying a SET of candidates so a
  // gradient's range survives the layers painted on top of it. The unpainted
  // root is the starting point and is only ever a real candidate when nothing
  // above it is opaque, which is exactly right.
  const bgsOf = el => {
    const layers = layersOf(el);
    let set = [{ r: 255, g: 255, b: 255, a: 1 }];
    for (let i = layers.length - 1; i >= 0; i--) {
      const L = layers[i];
      if (L.kind === 'c') {
        set = set.map(b => over(b, L.c));
      } else {
        const next = [];
        for (const s of L.stops) for (const b of set) next.push(over(b, s));
        set = next.length > 16 ? next.slice(0, 16) : next;
      }
    }
    return set;
  };

  const text = el => {
    const t = (el.textContent || '').trim().replace(/\\s+/g, ' ');
    return (t.length > 44 ? t.slice(0, 44) + '\\u2026' : t) || el.tagName.toLowerCase();
  };
  const skip = el => {
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.visibility === 'hidden' || s.display === 'none' || s.opacity === '0') return true;
      if (n.getAttribute && n.getAttribute('aria-hidden') === 'true') return true;
      if (n.classList && (n.classList.contains('sr-only') || n.classList.contains('skip-link'))) return true;
    }
    return false;
  };

  const out = [];
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('script, style, noscript')) continue;
    const direct = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length);
    if (!direct) continue;
    if (skip(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    const cs = getComputedStyle(el);
    const fg = parse(cs.color);
    if (!fg || fg.a === 0) continue;                       // gradient-clipped or decorative
    const size = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    const need = (size >= 24 || (size >= 18.66 && weight >= 700)) ? 3 : 4.5;
    let worst = Infinity, worstBg = '';
    for (const bg of bgsOf(el)) {
      // A translucent text colour is only as strong as the result once it has
      // been composited onto its own background, so measure that, not the raw rgb.
      const solidFg = fg.a >= 1 ? fg : over(bg, fg);
      const c = ratio(solidFg, bg);
      if (c < worst) { worst = c; worstBg = hex(bg); }
    }
    if (worst < need) {
      out.push({ text: text(el), cr: +worst.toFixed(2), need, size: +size.toFixed(1), weight,
                 tag: el.tagName.toLowerCase(), bg: worstBg, fg: hex(fg) });
    }
  }
  return out;
})()
`;

(async () => {
  const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
    '--no-first-run', '--disable-gpu', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
  let t = null;
  for (let i = 0; i < 40 && !t; i++) {
    await sleep(500);
    try { t = JSON.parse(await get(`http://127.0.0.1:${port}/json/list`)).find(x => x.type === 'page'); } catch (_) {}
  }
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  let id = 0; const pending = new Map();
  const send = (m, q = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: q })); });
  await new Promise(r => { ws.onopen = r; });
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
  const ev = async x => (await send('Runtime.evaluate', { returnByValue: true, awaitPromise: true, expression: x })).result.value;
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

  await send('Page.navigate', { url: BASE + '/' });
  await sleep(2500);

  const failures = [];
  for (const theme of ['dark', 'light']) {
    await ev(`localStorage.setItem('theme', '${theme}'); localStorage.setItem('language', 'en');`);
    for (const route of ROUTES) {
      await send('Page.navigate', { url: BASE + route });
      await sleep(2000);
      // Reveal-on-scroll content is opacity:0 until observed; force it visible so
      // every string is measured, not just the first viewport.
      await ev(`(() => {
        const s = document.createElement('style');
        s.textContent = '.sr-init,.sr-in,.split-word,.split-char{opacity:1!important;transform:none!important}';
        document.head.appendChild(s);
        void document.body.offsetHeight;   // force style + var() recalc
      })()`);
      await sleep(150);
      const res = await ev(PAGE_FN);
      for (const r of res) failures.push({ route, theme, ...r });
    }
  }

  if (!failures.length) {
    console.log(`PASS  contrast: ${ROUTES.length} routes x 2 themes, nothing below the AA threshold.`);
  } else {
    const dark = failures.filter(f => f.theme === 'dark');
    const light = failures.filter(f => f.theme === 'light');
    console.log(`FAIL  contrast: ${failures.length} below AA  (dark ${dark.length}, light ${light.length})\n`);
    for (const theme of ['dark', 'light']) {
      const rows = failures.filter(f => f.theme === theme);
      if (!rows.length) continue;
      console.log(`--- ${theme.toUpperCase()} (${rows.length}) ---`);
      const seen = new Set();
      for (const f of rows) {
        const k = `${f.route}|${f.text}|${f.fg}`;
        if (seen.has(k)) continue;
        seen.add(k);
        console.log(`  ${String(f.cr).padStart(5)}:1 / need ${f.need}  ${f.fg} on ${f.bg}  ${String(f.size).padStart(4)}px/${f.weight}  ${f.route.padEnd(10)} <${f.tag}> "${f.text}"`);
      }
      console.log('');
    }
  }

  chrome.kill();
  process.exit(failures.length ? 1 : 0);
})();
