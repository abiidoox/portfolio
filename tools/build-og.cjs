#!/usr/bin/env node
/**
 * Builds the 1200x630 social preview images (Open Graph / Twitter cards).
 *
 * One PNG per route plus one per project, rendered offline in headless Chrome
 * from an HTML template that matches the site's "digital laboratory" look.
 * Runs locally or in any environment with Chrome; the PNGs are committed so
 * CI and deploys never need a browser.
 *
 * Run: node tools/build-og.cjs
 * Env: CHROME (path override)
 */
const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const path = require('path');
const fs = require('fs');

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const CDP_PORT = 9420;
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'src', 'assets', 'og');
const FONT = f => 'file:///' + path.join(ROOT, 'src', 'assets', 'fonts', f).replace(/\\/g, '/');

const { PROJECTS } = (() => {
  // Read the project list without a build step: parse the data file's keys,
  // titles and techs with a light regex (the file is a plain TS array).
  const src = fs.readFileSync(path.join(ROOT, 'src', 'app', 'data', 'projects.data.ts'), 'utf8');
  const projects = [];
  const re = /key: '([^']+)'[\s\S]*?fallbackTitle: '([^']+)'[\s\S]*?technologies: \[([^\]]+)\][\s\S]*?category: '([^']+)'[\s\S]*?date: '([^']+)'/g;
  let m;
  while ((m = re.exec(src))) {
    projects.push({
      key: m[1],
      title: m[2],
      technologies: m[3].split(',').map(s => s.trim().replace(/^'|'$/g, '')),
      category: m[4],
      date: m[5]
    });
  }
  return { PROJECTS: projects };
})();

const slugify = key => key.toLowerCase().replace(/_/g, '-');

const CARDS = {
  home: {
    kicker: 'Full-Stack Developer',
    title: 'Abderrazzaq El Abdouni',
    sub: 'Fast, accessible web products. Angular, Spring Boot, TypeScript.',
    footLeft: 'Rabat, Morocco'
  },
  projects: {
    kicker: 'Portfolio',
    title: 'Projects',
    sub: 'Shipped work: web platforms, IoT, machine learning and desktop tools.',
    footLeft: 'Case studies included'
  },
  skills: {
    kicker: 'Portfolio',
    title: 'Skills',
    sub: 'The stack behind the projects. Every entry traced to real work.',
    footLeft: 'No invented numbers'
  },
  resume: {
    kicker: 'Portfolio',
    title: 'Resume',
    sub: 'Experience, education and the full CV.',
    footLeft: 'Available for new opportunities'
  },
  contact: {
    kicker: 'Contact',
    title: 'Let\u2019s build something',
    sub: 'One message away from a conversation.',
    footLeft: 'Rabat, Morocco'
  },
  '404': {
    kicker: 'Error 404',
    title: 'Page not found',
    sub: 'But the terminal on this page takes commands.',
    footLeft: 'Try: help'
  }
};

for (const p of PROJECTS) {
  CARDS['project-' + slugify(p.key)] = {
    kicker: 'Case study',
    title: p.title,
    sub: p.technologies.slice(0, 5).join(' \u00b7 '),
    footLeft: p.category.toUpperCase() + ' \u00b7 ' + p.date
  };
}

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
@font-face { font-family:'Grotesk'; font-weight:700; src:url('${FONT('space-grotesk-700-latin.woff2')}') format('woff2'); }
@font-face { font-family:'JetBrains'; font-weight:400; src:url('${FONT('jetbrains-mono-400-latin.woff2')}') format('woff2'); }
@font-face { font-family:'Inter'; font-weight:400; src:url('${FONT('inter-400-latin.woff2')}') format('woff2'); }
* { margin:0; padding:0; box-sizing:border-box; }
body { width:1200px; height:630px; overflow:hidden; background:#080b12; color:#f1f5f9; font-family:'Inter',sans-serif; }
.card { position:relative; width:100%; height:100%; display:flex; flex-direction:column; justify-content:space-between; padding:76px 84px; }
.grid { position:absolute; inset:0; background-image:linear-gradient(rgba(148,163,184,.08) 1px, transparent 1px),linear-gradient(90deg, rgba(148,163,184,.08) 1px, transparent 1px); background-size:64px 64px; -webkit-mask-image:linear-gradient(to bottom, black, transparent 85%); }
.glow-a { position:absolute; width:560px; height:560px; top:-220px; right:-140px; border-radius:50%; background:rgba(255,94,58,.17); filter:blur(130px); }
.glow-b { position:absolute; width:460px; height:460px; bottom:-220px; left:-160px; border-radius:50%; background:rgba(56,189,248,.13); filter:blur(130px); }
.row { position:relative; display:flex; align-items:center; gap:22px; }
.mark { width:66px; height:66px; border-radius:18px; display:flex; align-items:center; justify-content:center; font-family:'Grotesk'; font-weight:700; font-size:27px; color:#fff; background:linear-gradient(135deg,#ff5e3a,#ff8a5c 55%,#ffb08a); box-shadow:0 18px 50px -12px rgba(255,94,58,.55); }
.kicker { font-family:'JetBrains',monospace; font-size:15px; letter-spacing:.24em; text-transform:uppercase; color:#94a3b8; border:1px solid rgba(148,163,184,.28); border-radius:999px; padding:11px 20px; }
main { position:relative; }
h1 { font-family:'Grotesk'; font-weight:700; font-size:62px; line-height:1.08; letter-spacing:-0.02em; max-width:980px; }
h1.short { font-size:80px; }
p.sub { margin-top:22px; font-size:24px; line-height:1.45; color:#94a3b8; max-width:900px; }
footer { position:relative; display:flex; justify-content:space-between; align-items:center; font-family:'JetBrains',monospace; font-size:16px; color:#64748b; }
footer .url { color:#ff5e3a; }
</style></head><body>
<div class="card">
  <div class="grid"></div><div class="glow-a"></div><div class="glow-b"></div>
  <div class="row"><div class="mark">AE</div><div class="kicker" id="kicker"></div></div>
  <main><h1 id="title"></h1><p class="sub" id="sub"></p></main>
  <footer><span id="foot-left"></span><span class="url">abderrazzaq-portfolio.netlify.app</span></footer>
</div>
<script>
const CARDS = ${JSON.stringify(CARDS)};
const slug = new URLSearchParams(location.search).get('slug');
const c = CARDS[slug];
document.getElementById('kicker').textContent = c.kicker;
document.getElementById('title').textContent = c.title;
document.getElementById('title').className = c.title.length > 30 ? '' : 'short';
document.getElementById('sub').textContent = c.sub || '';
document.getElementById('foot-left').textContent = c.footLeft || '';
</script></body></html>`;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const get = u => new Promise(res => http.get(u, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(d)); }).on('error', () => res('')));

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'og-render-')), 'og.html');
  fs.writeFileSync(tmp, html);
  const fileUrl = 'file:///' + tmp.replace(/\\/g, '/');

  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-og-'));
  const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${profile}`, '--no-first-run', '--disable-gpu', '--hide-scrollbars',
    '--allow-file-access-from-files', 'about:blank'], { stdio: 'ignore' });

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

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });

  let count = 0;
  for (const slug of Object.keys(CARDS)) {
    await send('Page.navigate', { url: `${fileUrl}?slug=${slug}` });
    await sleep(350);
    await send('Runtime.evaluate', { expression: 'document.fonts.ready.then(() => true)', awaitPromise: true });
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    if (!shot || !shot.data) { console.error(`screenshot failed: ${slug}`); chrome.kill(); process.exit(1); }
    fs.writeFileSync(path.join(OUT_DIR, `${slug}.png`), Buffer.from(shot.data, 'base64'));
    count++;
  }

  console.log(`wrote ${count} OG images to src/assets/og/`);
  chrome.kill();
})();
