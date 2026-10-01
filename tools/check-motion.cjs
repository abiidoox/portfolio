/**
 * Confirms the hero tech chips are genuinely animating (not frozen) by sampling
 * their transform matrix over time, both with and without reduced motion.
 */
const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE_URL || 'http://localhost:4210';
const port = 9335;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-a-'));
const get = url => new Promise((res, rej) => {
  http.get(url, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(d)); }).on('error', rej);
});

async function run(reduceMotion) {
  const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}-${reduceMotion}`, '--no-first-run', '--disable-gpu', '--hide-scrollbars',
    'about:blank'], { stdio: 'ignore' });

  let target = null;
  for (let i = 0; i < 40 && !target; i++) {
    await sleep(500);
    try { target = JSON.parse(await get(`http://127.0.0.1:${port}/json/list`)).find(t => t.type === 'page'); } catch (_) {}
  }
  if (!target) { console.log('FATAL no chrome'); chrome.kill(); return; }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 0; const pending = new Map();
  const send = (m, p = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  await new Promise(r => ws.onopen = r);
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };

  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  // Headless Chrome reports reduce by default, so the media feature must be set
  // explicitly to test each branch.
  await send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: reduceMotion ? 'reduce' : 'no-preference' }]
  });
  await send('Page.navigate', { url: BASE + '/' });
  await sleep(3500);

  // Confirm the media query state, then sample chip transforms.
  const mq = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `window.matchMedia('(prefers-reduced-motion: reduce)').matches`
  });
  const reduce = mq.result.value;

  const sample = async () => {
    const r = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `JSON.stringify([...document.querySelectorAll('.float-slot .lab-tag')].map(e => e.innerText.trim() + '|' + getComputedStyle(e).transform))`
    });
    return r.result.value;
  };

  const a = await sample();
  await sleep(1600);
  const b = await sample();
  const chipsA = JSON.parse(a);
  const chipsB = JSON.parse(b);
  // Compare only the transform part of each "label|matrix(...)" entry.
  const movedCount = chipsA.filter((c, i) => c.split('|')[1] !== (chipsB[i] || '').split('|')[1]).length;
  const labels = chipsA.map(c => c.split('|')[0]);
  const moved = movedCount > 0 && movedCount === chipsA.length;
  const count = chipsA.length;

  console.log(`\nprefers-reduced-motion forced=${reduceMotion} | browser reports reduce=${reduce}`);
  console.log(`  chips found: ${count} -> ${labels.join(', ')}`);
  console.log(`  chips animating: ${movedCount}/${count} ${moved ? '(all moving)' : '(FROZEN)'}`);
  console.log(`  sample t0: ${a.slice(0, 96)}`);
  console.log(`  sample t1: ${b.slice(0, 96)}`);

  ws.close(); chrome.kill();
  return { reduce, count, moved };
}

(async () => {
  const normal = await run(false);
  const reduced = await run(true);
  console.log('\n==== RESULT ====');
  console.log(`normal motion  : ${normal && normal.moved ? 'PASS' : 'FAIL'} (${normal && normal.count} chips)`);
  console.log(`reduced motion : ${reduced && reduced.moved ? 'PASS' : 'FAIL'} (${reduced && reduced.count} chips)`);
  process.exit(0);
})();
