/**
 * Pinpoints elements wider than the viewport so small horizontal-overflow
 * regressions can be traced to a specific class instead of guessed at.
 */
const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE_URL || 'http://localhost:4210';
const ROUTE = process.argv[2] || '/contact';
const WIDTH = Number(process.argv[3] || 360);
const port = 9334;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-w-'));

const get = url => new Promise((res, rej) => {
  http.get(url, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(d)); }).on('error', rej);
});

(async () => {
  const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`, '--no-first-run', '--disable-gpu', '--hide-scrollbars', 'about:blank'],
    { stdio: 'ignore' });

  let target = null;
  for (let i = 0; i < 40 && !target; i++) {
    await sleep(500);
    try { target = JSON.parse(await get(`http://127.0.0.1:${port}/json/list`)).find(t => t.type === 'page'); } catch (_) {}
  }
  if (!target) { console.log('FATAL: no chrome'); chrome.kill(); process.exit(1); }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 0; const pending = new Map();
  const send = (m, p = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  await new Promise(r => ws.onopen = r);
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };

  await send('Page.enable'); await send('Runtime.enable');
  // Warm up with a desktop override first; applying mobile:true as the very
  // first override on a fresh target can be ignored by Chrome.
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await sleep(200);
  await send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: 800, deviceScaleFactor: 1, mobile: WIDTH < 500 });
  await send('Page.navigate', { url: BASE + ROUTE });
  await sleep(2500);
  // Re-apply after navigation so the override survives the new document.
  await send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: 800, deviceScaleFactor: 1, mobile: WIDTH < 500 });
  await sleep(1200);

  const r = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const vw = document.documentElement.clientWidth;
      const out = [];
      for (const el of document.querySelectorAll('body *')) {
        const b = el.getBoundingClientRect();
        if (b.width === 0) continue;
        if (b.right > vw + 0.5 || b.left < -0.5) {
          out.push({
            tag: el.tagName,
            cls: (el.getAttribute('class') || '').slice(0, 90),
            left: Math.round(b.left), right: Math.round(b.right), w: Math.round(b.width),
            over: Math.round(Math.max(b.right - vw, -b.left))
          });
        }
      }
      return JSON.stringify({ vw, count: out.length, worst: out.sort((a,b)=>b.over-a.over).slice(0, 8) }, null, 1);
    })()`
  });
  console.log(r.result.value);
  ws.close(); chrome.kill(); process.exit(0);
})();
