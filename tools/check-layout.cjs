/**
 * Deep DOM audit of a route: layout overflow, invisible content, broken assets,
 * untranslated strings, duplicate ids, heading order and tap-target sizes.
 */
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const WebSocket = require('ws');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE_URL || 'http://localhost:4210';
// Git Bash rewrites a bare '/' argument into a Windows path, so the route is
// passed as a name: home | about | projects | resume | contact | skills | notfound.
const ROUTES = { home: '/', about: '/about', projects: '/projects', resume: '/resume',
                contact: '/contact', skills: '/skills', notfound: '/no-such-page' };
const ROUTE = ROUTES[process.env.ROUTE || 'home'];
const port = 9341;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'deep-'));
const wait = ms => new Promise(r => setTimeout(r, ms));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--hide-scrollbars', 'about:blank']);
const get = p => new Promise((res, rej) => {
  http.get({ host: '127.0.0.1', port, path: p }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d))); }).on('error', rej);
});

const AUDIT = `(() => {
  const out = { overflow: [], invisible: [], brokenAssets: [], rawKeys: [], dupIds: [],
                headings: [], smallTargets: [], truncated: [], emptySections: [], issues: [] };
  const vw = document.documentElement.clientWidth;

  // 1. horizontal overflow
  if (document.documentElement.scrollWidth > vw + 1) {
    out.overflow.push({ scrollWidth: document.documentElement.scrollWidth, vw });
  }
  // Offending elements. A decorative absolute inside an overflow:hidden
  // ancestor is clipped on purpose, so it only counts when nothing clips it.
  const isClipped = el => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (cs.overflow === 'hidden' || cs.overflowX === 'hidden' || cs.overflowY === 'hidden') return true;
    }
    return false;
  };
  const visuallyHidden = el => {
    const cs = getComputedStyle(el);
    if (cs.clip === 'rect(0px, 0px, 0px, 0px)' || cs.clipPath === 'inset(50%)') return true;
    if (cs.position === 'absolute' && (cs.width === '1px' || cs.height === '1px')) return true;
    return el.classList.contains('sr-only');
  };
  for (const el of document.querySelectorAll('body *')) {
    if (visuallyHidden(el)) continue;
    // Not-yet-revealed scroll animations are translated and transparent by
    // design; they settle once scrolled into view. Children inherit the
    // ancestor's transform, so the whole subtree has to be skipped.
    let underReveal = false;
    for (let p = el; p && p !== document.body; p = p.parentElement) {
      if (p.classList.contains('sr-init')) { underReveal = true; break; }
    }
    if (underReveal) continue;
    if (getComputedStyle(el).opacity === '0') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    if (r.right > vw + 2 || r.left < -2) {
      const cs = getComputedStyle(el);
      if (cs.position === 'fixed' || isClipped(el)) continue;
      out.issues.push('overflows viewport: <' + el.tagName.toLowerCase() +
        (el.className && typeof el.className === 'string' ? ' class="' + el.className.split(' ').slice(0,3).join(' ') + '"' : '') +
        '> left=' + Math.round(r.left) + ' right=' + Math.round(r.right));
    }
  }

  // 2. invisible but present sections (has content, no box)
  for (const sec of document.querySelectorAll('section, app-root > *')) {
    const r = sec.getBoundingClientRect();
    const hasText = (sec.innerText || '').trim().length > 0;
    if (hasText && r.height < 4) out.invisible.push(sec.tagName + '.' + (sec.className || '').toString().split(' ')[0] + ' h=' + Math.round(r.height));
  }

  // 3. broken images / missing assets
  for (const img of document.querySelectorAll('img')) {
    if (!img.complete || img.naturalWidth === 0) out.brokenAssets.push(img.getAttribute('src') + ' alt=' + (img.getAttribute('alt')||''));
    if (!img.getAttribute('alt')) out.issues.push('img without alt: ' + img.getAttribute('src'));
  }

  // 4. untranslated keys visible in text or aria
  const rawRe = /^[A-Z][A-Z0-9_]*(\\.[A-Z0-9_]+)+$/;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    const t = n.textContent.trim();
    if (rawRe.test(t)) out.rawKeys.push('text: ' + t);
  }
  for (const el of document.querySelectorAll('[aria-label],[title],[placeholder],[alt]')) {
    for (const a of ['aria-label','title','placeholder','alt']) {
      const v = (el.getAttribute(a) || '').trim();
      if (rawRe.test(v)) out.rawKeys.push(a + ': ' + v);
    }
  }

  // 5. duplicate ids
  const seen = new Map();
  for (const el of document.querySelectorAll('[id]')) {
    seen.set(el.id, (seen.get(el.id) || 0) + 1);
  }
  for (const [id, c] of seen) if (c > 1) out.dupIds.push(id + ' x' + c);

  // 6. heading order
  let prev = 0;
  for (const h of document.querySelectorAll('h1,h2,h3,h4,h5,h6')) {
    const lvl = +h.tagName[1];
    if (prev && lvl > prev + 1) out.headings.push('jump h' + prev + ' -> h' + lvl + ': "' + (h.innerText||'').trim().slice(0,40) + '"');
    prev = lvl;
  }
  out.h1count = document.querySelectorAll('h1').length;

  // 7. tap targets (interactive, non-desktop hover)
  for (const el of document.querySelectorAll('a,button,[role=button],input,textarea,select')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'inline' && el.closest('p,li,span')) continue;
    if (r.height < 24 || r.width < 24) {
      const label = (el.innerText || el.getAttribute('aria-label') || el.tagName).trim().slice(0,28);
      out.smallTargets.push(Math.round(r.width) + 'x' + Math.round(r.height) + ' "' + label + '"');
    }
  }

  // 8. truncated text (overflow ellipsis / clipped)
  for (const el of document.querySelectorAll('p,h1,h2,h3,span,div,li')) {
    const cs = getComputedStyle(el);
    if ((cs.textOverflow === 'ellipsis' || cs.webkitLineClamp !== 'none') && el.scrollWidth > el.clientWidth + 4) {
      out.truncated.push((el.innerText||'').trim().slice(0,40));
    }
    if (cs.overflow === 'hidden' && el.scrollHeight > el.clientHeight + 8 && el.children.length === 0
        && (el.innerText||'').trim() && !visuallyHidden(el)) {
      out.issues.push('clipped text: "' + (el.innerText||'').trim().slice(0,40) + '"');
    }
  }

  // 9. sections with a heading but no content
  for (const sec of document.querySelectorAll('section')) {
    const h = sec.querySelector('h1,h2,h3');
    if (h && sec.innerText.trim().length <= (h.innerText||'').trim().length + 5) {
      out.emptySections.push((h.innerText||'').trim().slice(0,40));
    }
  }

  out.counts = {
    sections: document.querySelectorAll('section').length,
    imgs: document.querySelectorAll('img').length,
    links: document.querySelectorAll('a').length,
    buttons: document.querySelectorAll('button').length,
    textNodes: document.body.innerText.trim().length
  };
  return JSON.stringify(out);
})()`;

async function main() {
  await wait(2500);
  const page = (await get('/json/list')).find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false, maxPayload: 256 * 1024 * 1024 });
  let id = 0; const pend = new Map();
  ws.on('message', d => { const m = JSON.parse(d); if (pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } });
  await new Promise(r => ws.on('open', r));
  const cmd = (method, params = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  await cmd('Page.enable'); await cmd('Runtime.enable');
  const read = async expr => {
    const r = await cmd('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400));
    return r.result?.result?.value;
  };

  await cmd('Page.navigate', { url: BASE + ROUTE });
  await wait(4000);
  await read(`try { localStorage.setItem('language','en') } catch (e) {}`);
  await cmd('Page.reload'); await wait(4500);

  for (const [w, h] of [[1440, 900], [1024, 768], [768, 1024], [390, 844]]) {
    await cmd('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 500 });
    await wait(900);
    const o = JSON.parse(await read(AUDIT));
    console.log(`\n===== ${ROUTE} @ ${w}x${h} =====`);
    console.log('counts:', JSON.stringify(o.counts), 'h1count:', o.h1count);
    const show = (label, arr) => { if (arr.length) { console.log(`${label} (${arr.length}):`); [...new Set(arr)].slice(0, 12).forEach(x => console.log('   -', x)); } };
    show('RAW KEYS', o.rawKeys);
    show('BROKEN ASSETS', o.brokenAssets);
    show('DUP IDS', o.dupIds);
    show('OVERFLOW', o.overflow);
    show('ISSUES', o.issues);
    show('HEADING JUMPS', o.headings);
    show('SMALL TARGETS', o.smallTargets);
    show('TRUNCATED', o.truncated);
    show('INVISIBLE', o.invisible);
    show('EMPTY SECTIONS', o.emptySections);
    if (!o.rawKeys.length && !o.brokenAssets.length && !o.dupIds.length && !o.overflow.length && !o.issues.length) console.log('clean');
  }

  ws.close(); chrome.kill(); process.exit(0);
}
main().catch(e => { console.error('FAIL', e.message); chrome.kill(); process.exit(1); });
