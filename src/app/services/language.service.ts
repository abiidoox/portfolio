import { Injectable, inject, PLATFORM_ID, DOCUMENT } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

export type Language = 'fr' | 'en' | 'es';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private translate = inject(TranslateService);
  private platformId = inject(PLATFORM_ID);
  private doc = inject(DOCUMENT);

  private currentLanguage = new BehaviorSubject<Language>('en');
  currentLanguage$ = this.currentLanguage.asObservable();

  constructor() {
    const translate = this.translate;

    // Initialize with saved language, browser language, or default to English
    const savedLang = isPlatformBrowser(this.platformId)
      ? localStorage.getItem('language') as Language
      : null;
    const browserLang = translate.getBrowserLang() as Language;
    const defaultLang = savedLang || (browserLang && ['en', 'fr', 'es'].includes(browserLang) ? browserLang : 'en');
    
    this.setLanguage(defaultLang);
  }

  setLanguage(lang: Language) {
    if (!['en', 'fr', 'es'].includes(lang)) {
      lang = 'en'; // Fallback to English if invalid language
    }
    
    this.currentLanguage.next(lang);
    this.translate.use(lang);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('language', lang);
    }
    this.doc.documentElement.lang = lang; // Update HTML lang attribute
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage.value;
  }
}