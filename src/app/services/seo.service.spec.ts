import { TestBed } from '@angular/core/testing';
import { Title, Meta } from '@angular/platform-browser';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { SeoService } from './seo.service';
import { LanguageService, Language } from './language.service';

const SITE = 'https://abderrazzaq-portfolio.netlify.app';

describe('SeoService', () => {
  let events: Subject<unknown>;
  let langChange: Subject<unknown>;
  let setTitle: ReturnType<typeof vi.fn>;
  let updateTag: ReturnType<typeof vi.fn>;
  let routerUrl: string;
  let routeData: Record<string, unknown>;
  let lang: Language;
  let dict: Record<string, string>;

  const build = () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: {
            get url() { return routerUrl; },
            events: events.asObservable()
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              get data() { return routeData; },
              firstChild: null
            }
          }
        },
        { provide: Title, useValue: { setTitle } },
        { provide: Meta, useValue: { updateTag } },
        {
          provide: TranslateService,
          useValue: {
            instant: (key: string) => dict[key] ?? key,
            onLangChange: langChange.asObservable()
          }
        },
        { provide: LanguageService, useValue: { getCurrentLanguage: () => lang } }
      ]
    });
    TestBed.inject(SeoService);
  };

  const navigate = (url: string) => {
    routerUrl = url;
    events.next(new NavigationEnd(1, url, url));
  };

  const cleanHead = () => {
    document.head
      .querySelectorAll('link[rel="canonical"], link[rel="alternate"]')
      .forEach(link => link.remove());
  };

  beforeEach(() => {
    events = new Subject();
    langChange = new Subject();
    setTitle = vi.fn();
    updateTag = vi.fn();
    routerUrl = '/';
    routeData = {};
    lang = 'en';
    dict = {};
    cleanHead();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    cleanHead();
  });

  it('applies title, canonical and og tags on navigation', () => {
    routeData = { title: 'TITLE.PROJECTS', meta: [{ name: 'description', content: 'PROJ.DESC' }] };
    dict = { 'TITLE.PROJECTS': 'Projects', 'PROJ.DESC': 'My projects' };
    build();

    navigate('/projects');

    expect(setTitle).toHaveBeenCalledWith('Projects — Abderrazzaq El Abdouni');
    expect(document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href)
      .toBe(SITE + '/projects');
    expect(updateTag).toHaveBeenCalledWith({ property: 'og:url', content: SITE + '/projects' });
    expect(updateTag).toHaveBeenCalledWith({ property: 'og:locale', content: 'en_US' });
    expect(updateTag).toHaveBeenCalledWith({ name: 'description', content: 'My projects' });
  });

  it('canonicalises /about to the site root', () => {
    build();

    navigate('/about');

    expect(document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href)
      .toBe(SITE + '/');
  });

  it('falls back to defaults when translations are missing', () => {
    dict = { 'SEO.DEFAULT_DESCRIPTION': 'Default description' };
    build();

    navigate('/');

    expect(setTitle).toHaveBeenCalledWith('Abderrazzaq El Abdouni — Full-Stack Developer');
    expect(updateTag).toHaveBeenCalledWith({ name: 'description', content: 'Default description' });
  });

  it('replaces alternates with a self-reference and x-default', () => {
    lang = 'fr';
    const stale = document.createElement('link');
    stale.rel = 'alternate';
    stale.hreflang = 'it';
    document.head.appendChild(stale);
    build();

    navigate('/projects');

    const alternates = Array.from(document.head.querySelectorAll<HTMLLinkElement>('link[rel="alternate"]'));
    expect(alternates.length).toBe(2);
    expect(alternates.some(l => l.hreflang === 'it')).toBe(false);
    expect(alternates.find(l => l.hreflang === 'fr')?.href).toBe(SITE + '/projects');
    expect(alternates.find(l => l.hreflang === 'x-default')?.href).toBe(SITE + '/projects');
  });

  it('reapplies the head tags on language change', () => {
    build();
    navigate('/projects');
    updateTag.mockClear();

    lang = 'es';
    langChange.next({});

    expect(updateTag).toHaveBeenCalledWith({ property: 'og:locale', content: 'es_ES' });
  });
});
