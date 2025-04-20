import { Component, OnInit, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService, Language } from '../../services/language.service';

interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}

@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss']
})
export class LanguageSwitcherComponent implements OnInit {
  languages: LanguageOption[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];

  currentLanguage: Language;
  isDropdownOpen: boolean = false;
  focusedIndex: number = -1;

  constructor(
    private translate: TranslateService,
    private languageService: LanguageService
  ) {
    this.currentLanguage = this.languageService.getCurrentLanguage();
  }

  ngOnInit(): void {
    // Subscribe to language changes
    this.languageService.currentLanguage$.subscribe(lang => {
      this.currentLanguage = lang;
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (!this.isDropdownOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusedIndex = (this.focusedIndex + 1) % this.languages.length;
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusedIndex = (this.focusedIndex - 1 + this.languages.length) % this.languages.length;
        break;
      case 'Enter':
      case ' ':
        if (this.focusedIndex >= 0) {
          this.switchLanguage(this.languages[this.focusedIndex].code);
        }
        break;
      case 'Escape':
        this.closeDropdown();
        break;
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.focusedIndex = this.languages.findIndex(lang => lang.code === this.currentLanguage);
    }
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
    this.focusedIndex = -1;
  }

  switchLanguage(language: Language): void {
    this.languageService.setLanguage(language);
    this.closeDropdown();
  }

  getCurrentLanguage(): LanguageOption {
    return this.languages.find(lang => lang.code === this.currentLanguage) || this.languages[0];
  }

  isLanguageActive(languageCode: Language): boolean {
    return languageCode === this.currentLanguage;
  }

  getLanguageName(languageCode: Language): string {
    const lang = this.languages.find(l => l.code === languageCode);
    return lang ? lang.name : '';
  }
} 