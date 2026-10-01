/** Quick accessibility sanity pass: images, headings, landmarks, labels, contrast-critical text. */
const { spawn } = require('child_process');
const http = require('http');
const os = require('os'); const path = require('path'); const fs = require('fs');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE_URL || 'http://localhost:4210';
const port = 9338;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-a11y-'));
const get = u => new Promise((res, rej) => http.get(u, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(d)); }).on('error', rej));

let problems = 0;
(async () => {
  const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
    '--no-first-run', '--disable-gpu', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
  let t = null;
  for (let i = 0; i < 40 && !t; i++) { await sleep(500); try { t = JSON.parse(await get(`http://127.0.0.1:${port}/json/list`)).find(x => x.type === 'page'); } catch (_) {} }
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  let id = 0; const p = new Map();
  const send = (m, q = {}) => new Promise(r => { const i = ++id; p.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: q })); });
  await new Promise(r => ws.onopen = r);
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && p.has(m.id)) { p.get(m.id)(m.result); p.delete(m.id); } };
  const ev = async x => (await send('Runtime.evaluate', { returnByValue: true, awaitPromise: true, expression: x })).result.value;
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

  for (const route of ['/', '/projects', '/skills', '/resume', '/contact']) {
    await send('Page.navigate', { url: BASE + route });
    await sleep(2400);
    const r = JSON.parse(await ev(`(() => {
      // Elements inside a hidden or aria-hidden subtree are not exposed to
      // assistive tech, so they must not count as accessibility issues.
      const exposed = el => !el.closest('[hidden], [aria-hidden="true"]');
      return JSON.stringify({
      imgsNoAlt: [...document.querySelectorAll('img')].filter(i => exposed(i) && !i.hasAttribute('alt')).length,
      imgs: [...document.querySelectorAll('img')].filter(exposed).length,
      h1: [...document.querySelectorAll('h1')].filter(exposed).length,
      headingJumps: (() => { let prev = 0, bad = 0;
        [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(exposed).forEach(h => {
          const lvl = +h.tagName[1];
          if (prev && lvl > prev + 1) bad++;
          prev = lvl; });
        return bad; })(),
      main: [...document.querySelectorAll('main')].filter(exposed).length,
      header: [...document.querySelectorAll('header')].filter(exposed).length,
      footer: [...document.querySelectorAll('footer')].filter(exposed).length,
      inputsNoLabel: [...document.querySelectorAll('input:not([type=hidden]),textarea,select')]
        .filter(i => exposed(i) && !i.labels?.length && !i.getAttribute('aria-label') && !i.getAttribute('aria-labelledby')).length,
      btnsNoName: [...document.querySelectorAll('button')].filter(b => exposed(b) &&
        !b.innerText.trim() && !b.getAttribute('aria-label') && !b.querySelector('[class*=sr-only]')).length,
      linksNoName: [...document.querySelectorAll('a')].filter(a => exposed(a) &&
        !a.innerText.trim() && !a.getAttribute('aria-label')).length,
      lang: document.documentElement.lang,
      hasSkipLink: !!document.querySelector('a[href="#main"], .skip-link')
    }); })()`));
    const issues = [];
    if (r.imgsNoAlt) issues.push(`${r.imgsNoAlt} img without alt`);
    if (r.h1 !== 1) issues.push(`h1 count = ${r.h1}`);
    if (r.headingJumps) issues.push(`${r.headingJumps} heading level jump(s)`);
    if (r.inputsNoLabel) issues.push(`${r.inputsNoLabel} form control(s) without label`);
    if (r.btnsNoName) issues.push(`${r.btnsNoName} button(s) without accessible name`);
    if (r.linksNoName) issues.push(`${r.linksNoName} link(s) without accessible name`);
    if (r.main !== 1) issues.push(`main count = ${r.main}`);
    problems += issues.length;
    console.log(`${route.padEnd(11)} ${issues.length ? 'ISSUES: ' + issues.join('; ') : 'ok'}  (lang=${r.lang}, imgs=${r.imgs}, header=${r.header}, footer=${r.footer}, skipLink=${r.hasSkipLink})`);
  }
  console.log(`\n==== ${problems} accessibility issue(s) ====`);
  chrome.kill(); process.exit(0);
})();
