import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChildren,
  QueryList
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService, Language } from '../../services/language.service';
import { Subscription } from 'rxjs';

interface LanguageOption {
  code: Language;
  /** Endonym: a language is always named in its own language. */
  name: string;
  icon: string;
}

@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html'
})
export class LanguageSwitcherComponent implements OnInit, OnDestroy {
  readonly languages: LanguageOption[] = [
    { code: 'en', name: 'English', icon: 'fas fa-flag-usa' },
    { code: 'es', name: 'Español', icon: 'fas fa-flag' },
    { code: 'fr', name: 'Français', icon: 'fas fa-flag' }
  ];

  currentLanguage: Language;
  isDropdownOpen = false;

  @ViewChildren('optionBtn') optionButtons?: QueryList<ElementRef<HTMLButtonElement>>;

  private langSub?: Subscription;

  constructor(
    private el: ElementRef<HTMLElement>,
    private translate: TranslateService,
    private languageService: LanguageService
  ) {
    this.currentLanguage = this.languageService.getCurrentLanguage();
  }

  ngOnInit(): void {
    this.langSub = this.languageService.currentLanguage$.subscribe(lang => {
      this.currentLanguage = lang;
    });
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  /** aria-label for the trigger, localised. */
  get triggerLabel(): string {
    const current = this.getCurrentLanguage();
    return this.translate.instant('A11Y.SELECT_LANGUAGE') + ' ' + current.name;
  }

  toggleDropdown(): void {
    this.isDropdownOpen ? this.closeDropdown() : this.openDropdown();
  }

  openDropdown(): void {
    this.isDropdownOpen = true;
    // Land focus on the active option rather than the first one.
    setTimeout(() => this.focusIndex(this.languages.findIndex(l => l.code === this.currentLanguage)));
  }

  closeDropdown(refocusTrigger = false): void {
    this.isDropdownOpen = false;
    if (refocusTrigger) {
      setTimeout(() => this.el.nativeElement.querySelector<HTMLButtonElement>('#language-trigger')?.focus());
    }
  }

  switchLanguage(language: Language): void {
    this.languageService.setLanguage(language);
    this.closeDropdown(true);
  }

  getCurrentLanguage(): LanguageOption {
    return this.languages.find(lang => lang.code === this.currentLanguage) || this.languages[0];
  }

  isLanguageActive(languageCode: Language): boolean {
    return languageCode === this.currentLanguage;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isDropdownOpen && !this.el.nativeElement.contains(event.target as Node)) {
      this.closeDropdown();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (!this.isDropdownOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusIndex((this.focusedIndex() + 1) % this.languages.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusIndex((this.focusedIndex() - 1 + this.languages.length) % this.languages.length);
        break;
      case 'Home':
        event.preventDefault();
        this.focusIndex(0);
        break;
      case 'End':
        event.preventDefault();
        this.focusIndex(this.languages.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        const focusedButton = this.optionButtons?.toArray().find(b => b.nativeElement === document.activeElement);
        if (focusedButton) {
          const index = this.optionButtons?.toArray().indexOf(focusedButton) ?? -1;
          if (index >= 0 && index < this.languages.length) {
            this.switchLanguage(this.languages[index].code);
          }
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.closeDropdown(true);
        break;
      case 'Tab':
        this.closeDropdown();
        break;
      default:
        break;
    }
  }

  private focusedIndex(): number {
    const idx = this.optionButtons?.toArray().findIndex(b => b.nativeElement === document.activeElement) ?? -1;
    return idx;
  }

  private focusIndex(index: number): void {
    const buttons = this.optionButtons?.toArray();
    if (!buttons || !buttons.length) return;
    const wrapped = ((index % buttons.length) + buttons.length) % buttons.length;
    buttons[wrapped].nativeElement.focus();
  }
}
