/**
 * Exercises the interactive features end to end: project filtering, the details
 * modal (open/Escape/focus restore), contact form validation, language
 * switching, and theme toggling.
 */
const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE_URL || 'http://localhost:4210';
const port = 9336;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-i-'));
const get = url => new Promise((res, rej) => {
  http.get(url, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(d)); }).on('error', rej);
});

const results = [];
function check(name, pass, detail = '') {
  results.push({ name, pass, detail });
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

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
  let id = 0; const pending = new Map(); const errors = [];
  const send = (m, p = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  await new Promise(r => ws.onopen = r);
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
    else if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map(a => a.value ?? a.description).join(' '));
  };
  const evaluate = async expr => {
    const r = await send('Runtime.evaluate', { returnByValue: true, awaitPromise: true, expression: expr });
    if (r.exceptionDetails) return { __err: r.exceptionDetails.exception?.description || r.exceptionDetails.text };
    return r.result.value;
  };
  const goto = async url => { await send('Page.navigate', { url: BASE + url }); await sleep(2600); };

  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

  // ── Projects: filtering ──
  console.log('\n== Projects ==');
  await goto('/projects');
  const all = await evaluate(`document.querySelectorAll('article').length`);
  check('all projects render', all === 9, `${all} cards`);

  // Filter labels are translated, so drive the buttons positionally via
  // aria-pressed rather than matching translated text.
  const filterState = await evaluate(`(() => {
    const btns = [...document.querySelectorAll('[role=group] button[aria-pressed]')];
    return btns.map(b => ({ label: b.innerText.replace(/\\s+/g, ' ').trim(), pressed: b.getAttribute('aria-pressed'), cards: document.querySelectorAll('article').length }));
  })()`);
  check('filter group has 5 categories', Array.isArray(filterState) && filterState.length === 5,
    filterState ? filterState.map(f => f.label).join(' | ') : 'none');

  const filterClick = await evaluate(`(async () => {
    const btns = [...document.querySelectorAll('[role=group] button[aria-pressed]')];
    const target = btns[1];
    target.click();
    await new Promise(r => setTimeout(r, 500));
    const after = document.querySelectorAll('article').length;
    btns[0].click();
    await new Promise(r => setTimeout(r, 500));
    return { narrowed: after, restored: document.querySelectorAll('article').length, pressedCount: document.querySelectorAll('[role=group] button[aria-pressed=true]').length };
  })()`);
  check('clicking a category narrows the list',
    filterClick.narrowed > 0 && filterClick.narrowed < 9, `${filterClick.narrowed} cards`);
  check('"all" restores every project', filterClick.restored === 9, `${filterClick.restored} cards`);
  check('exactly one filter stays pressed', filterClick.pressedCount === 1, `${filterClick.pressedCount}`);

  // ── Modal: open, content, Escape, focus restore ──
  const modalOpen = await evaluate(`(async () => {
    // The card's footer "details" trigger is the .lab-underline button.
    const btn = document.querySelector('article .lab-underline');
    if (!btn) return { open: false, err: 'no details button found' };
    btn.click();
    await new Promise(r => setTimeout(r, 800));
    const d = document.querySelector('[role="dialog"]');
    return { open: !!d, title: d ? d.querySelector('#pm-title')?.innerText.trim() : null, hasTech: !!d?.innerText.match(/FastAPI|Spring|Angular|Django/), focused: document.activeElement?.className || '' };
  })()`);
  check('modal opens on details click', modalOpen.open, modalOpen.title || '');
  check('modal shows technologies', !!modalOpen.hasTech);
  check('focus moves into modal', /pm-close/.test(modalOpen.focused), modalOpen.focused.slice(0, 40));

  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await sleep(600);
  const modalClosed = await evaluate(`!document.querySelector('[role="dialog"]')`);
  check('modal closes on Escape', modalClosed === true);
  const bodyScroll = await evaluate(`document.body.style.overflow || '(cleared)'`);
  check('body scroll restored after close', bodyScroll === '' || bodyScroll === '(cleared)', bodyScroll);

  // ── Every project modal must carry real copy ──
  // Regression cover: PROJECTS.*.LONG_DESCRIPTION was missing from all three
  // locale files and the modal had no fallback, so every project detail panel
  // rendered the raw key instead of a description.
  console.log('\n== Project modals ==');
  await goto('/projects');
  await evaluate(`try { localStorage.setItem('language','en') } catch (e) {}`);
  await goto('/projects');
  const modals = await evaluate(`(async () => {
    const out = { count: 0, raw: [], thin: [], buttonTexts: [] };
    // Match the localized "details" action structurally rather than by English
    // text, so the check still works after a language switch.
    const cards = [...document.querySelectorAll('button')]
      .filter(b => b.querySelector('i.fa-arrow-right') && b.closest('article, li, div[class*=card]'));
    out.buttonTexts = [...new Set(cards.map(b => b.innerText.trim()))].slice(0, 2);
    for (const card of cards) {
      card.click();
      await new Promise(r => setTimeout(r, 650));
      const d = document.querySelector('[role="dialog"]');
      if (!d) { out.raw.push('no dialog'); continue; }
      out.count++;
      const text = d.innerText;
      const key = (text.match(/[A-Z][A-Z0-9_]{2,}\\.[A-Z0-9_]+(\\.[A-Z0-9_]+)+/g) || [])
        .filter(k => /^(PROJECTS|RESUME|ABOUT|SKILLS|CONTACT|HEADER|FOOTER|NAV|A11Y|SEO)\\./.test(k));
      if (key.length) out.raw.push(key.join(','));
      if (text.length < 400) out.thin.push(text.length + ' chars');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await new Promise(r => setTimeout(r, 550));
    }
    return out;
  })()`);
  check('all project modals open', modals.count === 9,
    `${modals.count}/9 — buttons seen: ${modals.buttonTexts.join(', ') || 'none'}`);
  check('no modal shows a raw translation key', modals.raw.length === 0, modals.raw.slice(0, 3).join(' | ') || 'none');
  check('every modal has substantive copy', modals.thin.length === 0, modals.thin.slice(0, 3).join(', ') || 'all >= 400 chars');

  // ── Contact: validation + submit path ──
  console.log('\n== Contact ==');
  await goto('/contact');
  const netlifyForm = await evaluate(`!!document.querySelector('form[name="contact"][netlify], form[name="contact"]')`);
  check('static Netlify form declaration present', netlifyForm);

  const invalid = await evaluate(`(async () => {
    const f = document.querySelector('form[novalidate]');
    f.querySelector('button[type=submit]').click();
    await new Promise(r => setTimeout(r, 500));
    return {
      alerts: [...document.querySelectorAll('[role=alert]')].map(e => e.innerText.trim()).filter(Boolean).length,
      ariaInvalid: [...f.querySelectorAll('[aria-invalid=true]')].length
    };
  })()`);
  check('empty submit shows validation errors', invalid.alerts > 0, `${invalid.alerts} alert(s)`);
  check('invalid fields marked aria-invalid', invalid.ariaInvalid === 3, `${invalid.ariaInvalid}/3`);

  const filled = await evaluate(`(async () => {
    const set = (sel, v) => { const el = document.querySelector(sel);
      const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement : HTMLInputElement;
      Object.getOwnPropertyDescriptor(proto.prototype, 'value').set.call(el, v);
      el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('blur', { bubbles: true })); };
    set('#contact-name', 'Test User');
    set('#contact-email', 'test@example.com');
    set('#contact-message', 'This is a sufficiently long verification message.');
    await new Promise(r => setTimeout(r, 500));
    return {
      alerts: [...document.querySelectorAll('[role=alert]')].map(e => e.innerText.trim()).filter(Boolean).length,
      valid: !document.querySelector('#contact-email[aria-invalid=true]')
    };
  })()`);
  check('valid input clears errors', filled.alerts === 0, `${filled.alerts} remaining`);

  // ── Language switching ──
  console.log('\n== i18n / theme ==');
  await goto('/');
  const h1Before = await evaluate(`document.querySelector('h1').innerText.trim()`);
  const h1After = await evaluate(`(async () => {
    document.querySelector('#language-trigger').click();
    await new Promise(r => setTimeout(r, 400));
    const opts = [...document.querySelectorAll('[role=menuitemradio]')];
    const current = document.querySelector('[role=menuitemradio][aria-checked=true]');
    const next = opts.find(o => o !== current);
    next.click();
    await new Promise(r => setTimeout(r, 900));
    return document.querySelector('h1').innerText.trim();
  })()`);
  check('language switch changes hero text', h1Before !== h1After, `"${h1Before.slice(0, 26)}" -> "${String(h1After).slice(0, 26)}"`);
  check('language menu closes after choosing', await evaluate(`!document.querySelector('#language-menu')`), 'no #language-menu in DOM');
  check('focus returns to the language trigger',
    await evaluate(`document.activeElement && document.activeElement.id === 'language-trigger'`),
    await evaluate(`document.activeElement.tagName + '#' + document.activeElement.id`));

  const theme = await evaluate(`(async () => {
    const btn = document.querySelector('app-theme-switcher button');
    const before = { cls: document.body.className, backdrop: getComputedStyle(document.querySelector('.lab-bg-base')).backgroundColor };
    btn.click();
    await new Promise(r => setTimeout(r, 700));
    return { before, after: { cls: document.body.className, backdrop: getComputedStyle(document.querySelector('.lab-bg-base')).backgroundColor } };
  })()`);
  check('theme toggle switches body class',
    theme.before.cls !== theme.after.cls, `${theme.before.cls} -> ${theme.after.cls}`);
  check('backdrop colour follows the theme',
    theme.before.backdrop !== theme.after.backdrop,
    `${theme.before.backdrop} -> ${theme.after.backdrop}`);

  // ── Per-route SEO ──
  // Regression cover: route data.title/data.meta existed but nothing applied
  // them, so every route shipped the static index.html title.
  console.log('\n== SEO ==');
  await goto('/projects');
  const seo = await evaluate(`(async () => {
    const read = () => ({
      title: document.title,
      desc: (document.querySelector('meta[name=description]')||{}).content || '',
      ogLocale: (document.querySelector('meta[property="og:locale"]')||{}).content || '',
      ogUrl: (document.querySelector('meta[property="og:url"]')||{}).content || '',
      canonical: (document.querySelector('link[rel=canonical]')||{}).getAttribute('href') || '',
      hreflangs: [...document.querySelectorAll('link[rel=alternate]')].map(l => l.hreflang)
    });
    const en = read();
    document.querySelector('#language-trigger').click();
    await new Promise(r => setTimeout(r, 350));
    [...document.querySelectorAll('[role=menuitemradio]')].find(o => o.getAttribute('lang') === 'fr').click();
    await new Promise(r => setTimeout(r, 900));
    return { en, fr: read() };
  })()`);
  check('route title is applied, not the static default',
    seo.en.title.includes('Abderrazzaq') && !/^(?!.*Abderrazzaq).*Full-Stack Developer$/.test(seo.en.title),
    seo.en.title);
  check('route description comes from route data',
    seo.en.desc.length > 40 && !/^[A-Z][A-Z0-9_]*(\.[A-Z0-9_]+)+$/.test(seo.en.desc),
    seo.en.desc.slice(0, 48) + '...');
  check('og:url matches the current route', /\/projects$/.test(seo.en.ogUrl), seo.en.ogUrl);
  check('canonical link is set', /^https:\/\//.test(seo.en.canonical), seo.en.canonical);
  check('language switch retranslates the title', seo.en.title !== seo.fr.title, `${seo.en.title} -> ${seo.fr.title}`);
  check('og:locale follows the language', seo.fr.ogLocale === 'fr_FR', seo.fr.ogLocale);
  check('hreflang does not accumulate across switches',
    seo.fr.hreflangs.length === 2 && seo.fr.hreflangs.includes('fr') && seo.fr.hreflangs.includes('x-default'),
    seo.fr.hreflangs.join(','));

  // Every aria-label must be real text. A missing translation renders as the
  // raw key, which is how "A11Y": {} shipped ten labels unnoticed.
  const rawLabels = await evaluate(`[...document.querySelectorAll('[aria-label]')]
    .map(e => e.getAttribute('aria-label'))
    .filter(v => /^[A-Z][A-Z0-9_]*(\\.[A-Z0-9_]+)+$/.test(v))`);
  check('no aria-label renders as a raw translation key',
    rawLabels.length === 0, rawLabels.slice(0, 4).join(', ') || 'none found');

  // Whole-site sweep in all three languages: no visible text, label or title
  // anywhere may be an unresolved key. This catches empty namespaces that the
  // static audit cannot see, because the lookup key is built at runtime.
  console.log('\n== Untranslated text sweep ==');
  const SCAN = `(() => {
    const NAMESPACE = /^(PROJECTS|RESUME|ABOUT|SKILLS|CONTACT|HEADER|FOOTER|NAV|TOAST|A11Y|SEO|NOT_FOUND|terminal|theme)\\.[A-Z0-9_]+(\\.[A-Z0-9_]+)+$/;
    const found = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) { const t = n.textContent.trim(); if (NAMESPACE.test(t)) found.push(t); }
    for (const el of document.querySelectorAll('[aria-label],[title],[placeholder],[alt]')) {
      for (const a of ['aria-label','title','placeholder','alt']) {
        const v = (el.getAttribute(a) || '').trim();
        if (NAMESPACE.test(v)) found.push(a + '=' + v);
      }
    }
    return found.length ? found.slice(0, 6).join(' | ') : '';
  })()`;
  for (const lang of ['en', 'fr', 'es']) {
    await evaluate(`try { localStorage.setItem('language','${lang}') } catch (e) {}`);
    const hits = [];
    for (const r of ['/', '/projects', '/resume', '/contact', '/skills', '/no-such-page']) {
      await goto(r);
      const found = await evaluate(SCAN);
      if (found) hits.push(`${r}: ${found}`);
    }
    check(`no raw keys on any route (${lang})`, hits.length === 0, hits.slice(0, 2).join(' || ') || '18 route/locale combos clean');
  }

  // ── CV download endpoint ──
  console.log('\n== Assets ==');
  const cv = await fetch(BASE + '/assets/Abderrazzaq_El_Abdouni_CV.pdf').catch(() => null);
  const cvStatus = await new Promise(async res => {
    fetch(BASE + '/assets/Abderrazzaq_El_Abdouni_CV.pdf').then(r => res(r.status)).catch(() => res('ERR'));
  });
  check('CV PDF is served', cvStatus === 200, `HTTP ${cvStatus}`);

  console.log(`\n==== console errors during interaction: ${errors.length} ====`);
  errors.slice(0, 5).forEach(e => console.log('   ' + String(e).slice(0, 160)));
  const failed = results.filter(r => !r.pass);
  console.log(`==== ${results.length - failed.length}/${results.length} checks passed ====`);
  ws.close(); chrome.kill(); process.exit(0);
})();
