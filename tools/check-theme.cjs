/** Verifies the fixed backdrop actually follows the light/dark theme. */
const { spawn } = require('child_process');
const http = require('http');
const os = require('os'); const path = require('path'); const fs = require('fs');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE_URL || 'http://localhost:4210';
const port = 9337;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-t-'));
const get = u => new Promise((res, rej) => http.get(u, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(d)); }).on('error', rej));

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
  await send('Page.navigate', { url: BASE + '/' });
  await sleep(3000);

  const read = () => ev(`JSON.stringify({
    bodyClass: document.body.className,
    themeAttr: document.documentElement.getAttribute('data-theme'),
    varBg: getComputedStyle(document.body).getPropertyValue('--lab-bg').trim(),
    backdrop: getComputedStyle(document.querySelector('.lab-bg-base')).backgroundColor,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    panel: getComputedStyle(document.querySelector('.lab-panel')).backgroundColor,
    text: getComputedStyle(document.body).color
  })`);

  console.log('DARK (initial):');
  console.log('  ', await read());

  const btnInfo = await ev(`JSON.stringify([...document.querySelectorAll('app-theme-switcher button, app-language-switcher button')].map(b => b.getAttribute('aria-label')))`);
  console.log('switcher buttons:', btnInfo);

  await ev(`(async () => { document.querySelector('app-theme-switcher button').click(); await new Promise(r=>setTimeout(r,900)); })()`);
  console.log('AFTER TOGGLE:');
  console.log('  ', await read());

  chrome.kill(); process.exit(0);
})();
