#!/usr/bin/env node
/**
 * Mobile responsiveness check.
 *
 * check-layout proves nothing overflows at a handful of desktop/tablet widths.
 * This one targets the failures that only appear on a phone: a stray fixed
 * element widening the page, a control too small to hit with a thumb, text
 * scaled below readability, or media wider than the screen.
 *
 * Widths are the real-world ones, not round numbers:
 *   320  iPhone SE (1st gen) / Galaxy Fold cover screen - the tightest case
 *   360  the most common Android width
 *   390  iPhone 14/15
 *   414  iPhone 8 Plus / 11
 *   768  iPad portrait, where the desktop nav first has to fit
 *
 * Checks per route/width:
 *   1. horizontal scroll      documentElement.scrollWidth > clientWidth
 *   2. bleed                  elements extending past the right edge
 *   3. tap targets            interactive controls under 44px (WCAG 2.5.5)
 *   4. tiny text               computed font-size under 12px
 *   5. wide media              img/video/svg wider than the viewport
 *
 * Run: node tools/check-mobile.cjs
 * Env: PORT (default 4210)
 */
const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const path = require('path');
const fs = require('fs');

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = process.env.PORT || 4210;
const BASE = `http://localhost:${PORT}`;
const CDP_PORT = 9412;

const WIDTHS = [
  { w: 320, h: 640, label: 'iPhone SE' },
  { w: 360, h: 740, label: 'Android' },
  { w: 390, h: 844, label: 'iPhone 14' },
  { w: 414, h: 896, label: 'iPhone 11' },
  { w: 768, h: 1024, label: 'iPad portrait' },
];

const ROUTES = ['/', '/about', '/projects', '/skills', '/resume', '/contact', '/nope-404'];

const sleep = ms => new Promise(r => setTimeout(r, ms));
const get = u => new Promise(res => http.get(u, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(d)); }).on('error', () => res('')));

const TAP_MIN = 44;

(async () => {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-mob-'));
  const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${profile}`, '--no-first-run', '--disable-gpu', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });

  let target = null;
  for (let i = 0; i < 40 && !target; i++) {
    await sleep(500);
    try { target = JSON.parse(await get(`http://127.0.0.1:${CDP_PORT}/json/list`)).find(x => x.type === 'page'); } catch (_) { }
  }
  if (!target) { console.error('could not start Chrome'); chrome.kill(); process.exit(1); }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 0; const pend = new Map();
  const send = (m, p = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  await new Promise(r => ws.onopen = r);
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); }
  };
  const evaluate = async expr => {
    const r = await send('Runtime.evaluate', { returnByValue: true, awaitPromise: true, expression: expr });
    return r && r.result ? r.result.value : undefined;
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });

  // deterministic language so results do not depend on a stale localStorage
  await send('Page.navigate', { url: BASE + '/' });
  await sleep(3500);
  await evaluate(`localStorage.setItem('language','en')`);

  // The measurement runs in the page. Off-screen decoration is deliberately
  // excluded: hero glows and background blobs sit at negative offsets by design
  // and are clipped by an overflow:hidden ancestor, so flagging them is noise.
  const MEASURE = `(() => {
    const vw = document.documentElement.clientWidth;
    const de = document.documentElement;
    const label = el => {
      const id = el.id ? '#' + el.id : '';
      const cls = (el.getAttribute('class') || '').trim().split(/\\s+/).filter(Boolean).slice(0, 2).join('.');
      return el.tagName.toLowerCase() + id + (cls ? '.' + cls : '');
    };
    const decorative = el => {
      if (el.getAttribute('aria-hidden') === 'true') return true;
      const cs = getComputedStyle(el);
      if (cs.position === 'fixed' || cs.position === 'absolute') {
        // an ancestor that clips means it cannot widen the page
        for (let p = el.parentElement; p; p = p.parentElement) {
          const pcs = getComputedStyle(p);
          if (pcs.overflow !== 'visible' || pcs.overflowX !== 'visible') return true;
          if (pcs.position === 'fixed') return true;
        }
      }
      return false;
    };

    const bleed = [], tiny = [], wide = [], smallTap = [];

    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') continue;
      const b = el.getBoundingClientRect();
      if (b.width === 0 && b.height === 0) continue;

      if (b.right > vw + 2 || b.left < -2) {
        if (!decorative(el)) bleed.push(label(el) + ' [' + Math.round(b.left) + '..' + Math.round(b.right) + '] vw' + vw);
      }

      if (/^(IMG|VIDEO|SVG|CANVAS)$/.test(el.tagName) && b.width > vw + 2 && !decorative(el)) {
        wide.push(label(el) + ' ' + Math.round(b.width) + 'px');
      }

      // text smaller than 12px that actually renders characters
      const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length);
      if (hasText) {
        const fs = parseFloat(cs.fontSize);
        if (fs < 12) tiny.push(label(el) + ' ' + fs + 'px');
      }

      // tap targets: standalone controls only. An inline link inside a
      // paragraph is sized by the text and is not a thumb-target failure.
      const tappable = el.matches('button, a[href], input:not([type=hidden]), select, textarea, [role=button], [role=tab]');
      if (tappable && cs.display !== 'none') {
        const inline = el.tagName === 'A' && el.closest('p, li.prose, span') && !el.closest('nav, header, footer, [role=menu]');
        if (!inline && (b.width < ${TAP_MIN} || b.height < ${TAP_MIN})) {
          smallTap.push(label(el) + ' ' + Math.round(b.width) + 'x' + Math.round(b.height));
        }
      }
    }

    return JSON.stringify({
      vw,
      scrollW: de.scrollWidth,
      clientW: de.clientWidth,
      hScroll: de.scrollWidth > de.clientWidth + 1,
      bleed: [...new Set(bleed)].slice(0, 8),
      tiny: [...new Set(tiny)].slice(0, 8),
      wide: [...new Set(wide)].slice(0, 8),
      smallTap: [...new Set(smallTap)].slice(0, 8),
      counts: { bleed: bleed.length, tiny: tiny.length, wide: wide.length, smallTap: smallTap.length }
    });
  })()`;

  let problems = 0;
  console.log('mobile responsiveness — ' + WIDTHS.map(x => x.w).join(' / ') + 'px\n');

  for (const vp of WIDTHS) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.w, height: vp.h, deviceScaleFactor: 2, mobile: true,
    });
    console.log(`── ${vp.w}px  ${vp.label} ${'─'.repeat(Math.max(0, 46 - vp.label.length))}`);

    for (const route of ROUTES) {
      await send('Page.navigate', { url: BASE + route + '?m=' + Date.now() });
      await sleep(2600);
      // settle lazy/reveal animations so nothing is measured mid-transition
      await evaluate(`document.querySelectorAll('[class*=sr-init]').forEach(e=>e.classList.remove('sr-init'));
                       window.scrollTo(0,0); true`);
      await sleep(700);

      const raw = await evaluate(MEASURE);
      if (!raw) { console.log(`   ${route.padEnd(12)} MEASURE FAILED`); problems++; continue; }
      const r = JSON.parse(raw);
      const issues = [];
      if (r.hScroll) issues.push(`H-SCROLL scrollW ${r.scrollW} > ${r.clientW}`);
      if (r.counts.bleed) issues.push(`bleed x${r.counts.bleed}`);
      if (r.counts.wide) issues.push(`wide-media x${r.counts.wide}`);
      if (r.counts.tiny) issues.push(`tiny-text x${r.counts.tiny}`);
      if (r.counts.smallTap) issues.push(`tap<${TAP_MIN} x${r.counts.smallTap}`);

      if (issues.length) {
        problems++;
        console.log(`   ${route.padEnd(12)} ${issues.join(' | ')}`);
        const detail = [
          r.bleed.length && ['bleed', r.bleed],
          r.wide.length && ['wide', r.wide],
          r.tiny.length && ['tiny', r.tiny],
          r.smallTap.length && ['tap', r.smallTap],
        ].filter(Boolean);
        for (const [k, list] of detail) list.forEach(x => console.log(`       ${k}: ${x}`));
      } else {
        console.log(`   ${route.padEnd(12)} ok`);
      }
    }
    console.log('');
  }

  console.log(problems
    ? `mobile: ${problems} route/width combination(s) with issues\n`
    : `mobile: all ${ROUTES.length * WIDTHS.length} route/width combinations clean\n`);

  ws.close();
  chrome.kill();
  process.exit(problems ? 1 : 0);
})();
