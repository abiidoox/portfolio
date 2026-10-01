import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, ActivatedRoute, NavigationEnd, Data } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter, merge } from 'rxjs';
import { LanguageService, Language } from './language.service';

const SITE = 'https://abderrazzaq-portfolio.netlify.app';
const OG_LOCALE: Record<Language, string> = { en: 'en_US', fr: 'fr_FR', es: 'es_ES' };
/** '' and '/about' render the same About page, so they share one canonical. */
const ALIASES: Record<string, string> = { '': '/', '/about': '/' };

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private title: Title,
    private meta: Meta,
    private translate: TranslateService,
    private languageService: LanguageService
  ) {
    // Route changes and language changes both have to refresh the head tags.
    // onLangChange is used rather than languageService.currentLanguage$ because
    // that stream fires before translate.use() resolves, which would read the
    // previous language's dictionary and leave the title a language behind.
    merge(
      this.router.events.pipe(filter(e => e instanceof NavigationEnd)),
      this.translate.onLangChange
    ).subscribe(() => this.apply());
  }

  /** Route data for the deepest activated route, which is where lazy routes put it. */
  private deepestData(): Data {
    let route = this.route.snapshot;
    while (route.firstChild) route = route.firstChild;
    return route.data ?? {};
  }

  private text(key: string | undefined | null): string {
    if (!key) return '';
    // instant() echoes the key back when a translation is missing, which would
    // silently ship "ABOUT.TITLE" into a <title> or meta tag.
    const value = this.translate.instant(key);
    return value === key ? '' : value;
  }

  private metaContent(data: Data, field: 'name' | 'property', value: string): string {
    const entries = (data['meta'] ?? []) as Array<{ name?: string; property?: string; content: string }>;
    const match = entries.find(e => e[field] === value);
    return this.text(match?.content);
  }

  private setLink(rel: string, href: string, hreflang?: string): void {
    const selector = `link[rel="${rel}"]${hreflang ? `[hreflang="${hreflang}"]` : ':not([hreflang])'}`;
    let el = document.head.querySelector<HTMLLinkElement>(selector);
    if (!el) {
      el = document.createElement('link');
      el.rel = rel;
      if (hreflang) el.hreflang = hreflang;
      document.head.appendChild(el);
    }
    el.href = href;
  }

  private apply(): void {
    const data = this.deepestData();
    const lang = this.languageService.getCurrentLanguage();
    const url = SITE + (ALIASES[this.router.url.split(/[?#]/)[0]] ?? this.router.url.split(/[?#]/)[0]);

    const routeTitle = this.text(data['title']);
    const fullTitle = routeTitle
      ? `${routeTitle} — Abderrazzaq El Abdouni`
      : 'Abderrazzaq El Abdouni — Full-Stack Developer';

    const description = this.metaContent(data, 'name', 'description')
      || this.text('SEO.DEFAULT_DESCRIPTION');
    const ogDescription = this.metaContent(data, 'property', 'og:description') || description;

    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: ogDescription });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:locale', content: OG_LOCALE[lang] });

    // One URL serves every language, so the canonical is that URL and the only
    // honest hreflang is a self-reference plus x-default. Pointing alternate
    // languages at the same URL would claim distinct documents that don't exist.
    this.setLink('canonical', url);
    document.head.querySelectorAll('link[rel="alternate"]').forEach(l => l.remove());
    this.setLink('alternate', url, lang);
    this.setLink('alternate', url, 'x-default');
  }
}
