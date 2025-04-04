import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

export type Language = 'fr' | 'en';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguage = new BehaviorSubject<Language>('fr');
  currentLanguage$ = this.currentLanguage.asObservable();

  constructor(private translate: TranslateService) {
    // Initialize with browser language or default to French
    const browserLang = translate.getBrowserLang() as Language;
    const defaultLang = browserLang && ['en', 'fr'].includes(browserLang) ? browserLang : 'fr';
    
    this.setLanguage(defaultLang);
  }

  setLanguage(lang: Language) {
    this.currentLanguage.next(lang);
    this.translate.use(lang);
    document.documentElement.lang = lang; // Update HTML lang attribute
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage.value;
  }
}