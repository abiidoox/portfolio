# Portfolio Website

Personal portfolio of Abderrazzaq El Abdouni, full-stack developer.
Angular single-page app with Tailwind CSS, three locales (en, fr, es) and Netlify hosting.

## Stack

- Angular 22.2, TypeScript 6.0
- Tailwind CSS 3.4 + PostCSS
- `@ngx-translate/core` with dictionaries in `src/assets/i18n/`
- Prerendering (SSG): every route ships pre-rendered HTML via `@angular/ssr` (`outputMode: static`)
- Font Awesome + devicon subsets and Inter / Space Grotesk / JetBrains Mono, self-hosted (no CDN)
- Netlify deployment (`netlify.toml`)

## Requirements

- Node.js 20.19+, 22.12+ or 24+ (Angular 22 supported range)
- npm 9+
- Google Chrome for the headless audit scripts

## Setup

```bash
npm install
npm start
```

Dev server runs on `http://localhost:4200/`.

## Scripts

```bash
npm start                                              # dev server
npm run build                                          # development build
npm run build:prod                                     # production build to dist/portfolio-website/browser
npm run watch                                          # development build in watch mode
npm run lint                                           # ESLint (TypeScript + Angular templates)
npm test                                               # unit tests (Vitest, watch mode)
npm test -- --watch=false                              # one-shot test run
```

## Audit tools

The `tools/` folder contains a headless UI audit suite driven by the Chrome DevTools Protocol.
Run the dev server on port 4210 first:

```bash
npx ng serve --port 4210
```

Then, in a second terminal:

```bash
npm run audit:verify        # every route x 6 viewports: console errors, overflow, raw i18n keys
npm run audit:a11y          # accessibility checks
npm run audit:contrast      # colour contrast
npm run audit:layout        # layout / overflow
npm run audit:mobile        # mobile viewports
npm run audit:theme         # light and dark theme
npm run audit:motion        # reduced motion behaviour
npm run audit:icons         # icon fonts + no third-party requests
npm run audit:interactive   # interactive states
npm run audit:overflow      # horizontal overflow
```

`npm run audit:keys` audits translation keys and needs no server:

```bash
npm run audit:keys          # fails on keys missing from en/fr/es
```

The audit scripts expect Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe`.
Edit the `CHROME` constant in `tools/*.cjs` if Chrome lives elsewhere.

## Project structure

```
src/app/components   feature components (about, projects, skills, resume, contact) + shared/*
src/app/services     theme, language, SEO, toast, modal services
src/app/directives   scroll reveal, split text, magnetic, count up
src/app/data         projects, skills and resume datasets
src/assets/i18n      en.json, fr.json, es.json
tools/               headless audit scripts, icon-font subset builders, font fetcher
```

## Icons and fonts

Nothing loads from a CDN — icon fonts and web fonts are self-hosted subsets,
bundled through `angular.json` (`src/*-subset.css`, `src/fonts.css`).
Regenerate after the related source changes, then run `npm run audit:icons`
(it fails when a subset is stale):

```bash
# after adding/removing an fa-* icon class (any template or TS file)
node tools/build-fontawesome-subset.cjs && python tools/subset-fontawesome.py

# after editing src/app/data/skills.data.ts
node tools/build-devicon-subset.cjs && python tools/subset-devicon.py

# only when a family or weight is added to src/styles.css
node tools/fetch-google-fonts.cjs
```

The subsetters need `pip install fonttools brotli`.

## Internationalization

Project cards and the project modal resolve titles at runtime from
`PROJECTS.<KEY>.TITLE`, `PROJECTS.<KEY>.DESCRIPTION` and `PROJECTS.<KEY>.LONG_DESCRIPTION`
using the keys declared in `src/app/data/projects.data.ts`.
After adding or renaming a project, run `npm run audit:keys`.

## Deployment

Netlify builds with `netlify.toml`: `npm run build:prod`, publish folder `dist/portfolio-website/browser`,
SPA fallback via `src/_redirects`, caching and security headers via `src/_headers`.
The canonical URL lives in `src/assets/sitemap.xml`, `src/assets/robots.txt`
and `src/app/services/seo.service.ts`.

The CV served on the resume page is `src/assets/Abderrazzaq_El_Abdouni_CV.pdf`.
