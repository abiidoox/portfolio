import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type Language = 'fr' | 'en';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguage = new BehaviorSubject<Language>('fr');
  currentLanguage$ = this.currentLanguage.asObservable();

  constructor() { }

  setLanguage(lang: Language) {
    this.currentLanguage.next(lang);
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage.value;
  }
}