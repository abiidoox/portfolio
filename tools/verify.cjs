/**
 * Headless verification: loads each route, records console errors/warnings and
 * page exceptions, and reports key layout metrics so regressions are visible.
 * Uses the Chrome DevTools Protocol directly (no extra dependencies).
 */
const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE_URL || 'http://localhost:4210';
const ROUTES = JSON.parse(process.env.ROUTES || '["/","/projects","/skills","/resume","/contact","/nope-404"]');
const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1280', width: 1280, height: 800 },
  { name: '1024', width: 1024, height: 768 },
  { name: '768', width: 768, height: 1024 },
  { name: '390', width: 390, height: 844 },
  { name: '360', width: 360, height: 800 }
].filter(v => !process.env.W || process.env.W.split(',').includes(v.name));

const sleep = ms => new Promise(r => setTimeout(r, ms));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-'));
const port = 9333;

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
  const chrome = spawn(CHROME, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
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
      const list = JSON.parse(await get(`http://127.0.0.1:${port}/json/list`));
      target = list.find(t => t.type === 'page');
    } catch (_) { /* not up yet */ }
  }
  if (!target) { console.log('FATAL: could not attach to Chrome'); chrome.kill(); process.exit(1); }

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

  let failures = 0;

  for (const vp of VIEWPORTS) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width, height: vp.height, deviceScaleFactor: 1, mobile: vp.width < 500
    });

    for (const route of ROUTES) {
      events.length = 0;
      await send('Page.navigate', { url: BASE + route });
      await sleep(2600);

      const problems = [];
      for (const ev of events) {
        if (ev.method === 'Runtime.exceptionThrown') {
          const d = ev.params.exceptionDetails;
          problems.push('EXCEPTION: ' + (d.exception?.description || d.text).split('\n')[0]);
        }
        if (ev.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(ev.params.type)) {
          const txt = ev.params.args.map(a => a.value ?? a.description ?? '').join(' ');
          problems.push(ev.params.type.toUpperCase() + ': ' + txt.slice(0, 220));
        }
        if (ev.method === 'Log.entryAdded' && ['error'].includes(ev.params.entry.level)) {
          problems.push('LOG: ' + ev.params.entry.text.slice(0, 220));
        }
        if (ev.method === 'Network.loadingFailed') {
          problems.push('NETFAIL: ' + ev.params.errorText);
        }
      }

      const probe = await send('Runtime.evaluate', {
        returnByValue: true,
        expression: `(() => {
          const d = document;
          const h1 = d.querySelector('h1');
          const uniq = new Set([...d.querySelectorAll('*')]
            .filter(e => e.getBoundingClientRect().right > d.documentElement.clientWidth + 0.5)
            .map(e => {
              const b = e.getBoundingClientRect();
              const cs = getComputedStyle(e);
              const parent = e.parentElement;
              const pcs = parent ? getComputedStyle(parent) : null;
              return e.tagName + '.' + (e.getAttribute('class') || '').slice(0, 34)
                + ' [L' + Math.round(b.left) + ' R' + Math.round(b.right) + ' W' + Math.round(b.width)
                + ' pos:' + cs.position
                + ' parentOverflowX:' + (pcs ? pcs.overflowX : '-') + ']';
            }));
          // Elements that are not decorative (in-flow) and genuinely exceed the
          // viewport are the ones that actually create a horizontal scrollbar.
          const contentWide = [...d.querySelectorAll('main *, footer *, app-header *')]
            .filter(e => {
              const b = e.getBoundingClientRect();
              const cs = getComputedStyle(e);
              return cs.position === 'static' && b.right > d.documentElement.clientWidth + 0.5;
            })
            .map(e => e.tagName + '.' + (e.getAttribute('class') || '').slice(0, 60)
              + ' R' + Math.round(e.getBoundingClientRect().right));
          return JSON.stringify({
            title: (d.title || '').slice(0, 40),
            h1: h1 ? h1.innerText.replace(/\\s+/g, ' ').trim().slice(0, 55) : null,
            textLen: d.body.innerText.trim().length,
            scrollW: d.documentElement.scrollWidth,
            // A vertical scrollbar makes clientWidth smaller than innerWidth, so
            // innerWidth is the correct reference for detecting real h-overflow.
            clientW: window.innerWidth,
            overflow: d.documentElement.scrollWidth > d.documentElement.clientWidth,
            wide: [...uniq].slice(0, 4),
            contentWide: [...new Set(contentWide)].slice(0, 4),
            innerW: window.innerWidth,
            bodyW: Math.round(document.body.getBoundingClientRect().width),
            rawKeys: (d.body.innerText.match(/\\b(ABOUT|PROJECTS|RESUME|CONTACT|HEADER|FOOTER|NOT_FOUND|TOAST|NAV|header|terminal|not_found|about|contact|theme)\\.[A-Za-z0-9_.]+/g) || []).filter(k => !k.startsWith('terminal.')).slice(0, 4)
          });
        })()`
      });

      const info = JSON.parse(probe.result.value);
      const bad = problems.length > 0 || info.rawKeys.length > 0;
      if (bad) failures++;

      console.log(`\n[${vp.name}px] ${route}${bad ? '  <-- ISSUES' : '  ok'}`);
      console.log(`   h1: ${info.h1}`);
      console.log(`   text: ${info.textLen} chars | scrollW ${info.scrollW} vs clientW ${info.clientW}${info.overflow ? '  OVERFLOW' : ''}`);
      if (info.overflow) console.log(`   innerW ${info.innerW} | bodyW ${info.bodyW}`);
      if (info.overflow && info.wide.length) console.log(`   wide: ${info.wide.join('\n         ')}`);
      if (info.overflow && info.contentWide.length) console.log(`   CONTENT OVERFLOW: ${info.contentWide.join('\n         ')}`);
      if (info.rawKeys.length) console.log(`   UNTRANSLATED KEYS: ${info.rawKeys.join(', ')}`);
      problems.slice(0, 6).forEach(p => console.log('   ' + p));
    }
  }

  console.log(`\n==== ${failures} route/viewport combination(s) with issues ====`);
  ws.close();
  chrome.kill();
  process.exit(0);
})();
