import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

export type Language = 'fr' | 'en' | 'es';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguage = new BehaviorSubject<Language>('en');
  currentLanguage$ = this.currentLanguage.asObservable();

  constructor(private translate: TranslateService) {
    // Initialize with saved language, browser language, or default to English
    const savedLang = localStorage.getItem('language') as Language;
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
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang; // Update HTML lang attribute
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage.value;
  }
}