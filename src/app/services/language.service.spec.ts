import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let use: ReturnType<typeof vi.fn>;
  let browserLang: string | undefined;

  const make = () => {
    use = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TranslateService,
          useValue: {
            getBrowserLang: () => browserLang,
            use: (lang: string) => (use as unknown as (l: string) => void)(lang)
          }
        }
      ]
    });
    return TestBed.inject(LanguageService);
  };

  beforeEach(() => {
    localStorage.clear();
    browserLang = undefined;
    document.documentElement.lang = 'en';
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
    document.documentElement.lang = '';
  });

  it('defaults to en when nothing is stored and the browser language is unsupported', () => {
    browserLang = 'de';
    const service = make();
    expect(service.getCurrentLanguage()).toBe('en');
  });

  it('prefers a stored language over the browser language', () => {
    localStorage.setItem('language', 'fr');
    browserLang = 'en';
    const service = make();
    expect(service.getCurrentLanguage()).toBe('fr');
  });

  it('uses the browser language when supported', () => {
    browserLang = 'es';
    const service = make();
    expect(service.getCurrentLanguage()).toBe('es');
  });

  it('setLanguage updates the stream, translator, storage and html lang', () => {
    const service = make();
    const seen: string[] = [];
    service.currentLanguage$.subscribe(lang => seen.push(lang));

    service.setLanguage('fr');

    expect(use).toHaveBeenCalledWith('fr');
    expect(localStorage.getItem('language')).toBe('fr');
    expect(document.documentElement.lang).toBe('fr');
    expect(seen).toEqual(['en', 'fr']);
  });

  it('falls back to en for an unknown language', () => {
    const service = make();
    service.setLanguage('xx' as never);

    expect(service.getCurrentLanguage()).toBe('en');
    expect(use).toHaveBeenCalledWith('en');
  });
});
