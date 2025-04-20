import { Component, OnInit, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  isMobileMenuOpen = false;
  currentLanguage: string;
  isDarkTheme = true;
  
  constructor(private translateService: TranslateService) {
    this.currentLanguage = this.translateService.currentLang || 'en';
  }

  ngOnInit(): void {
    this.translateService.onLangChange.subscribe(event => {
      this.currentLanguage = event.lang;
    });
    
    // Check for theme changes
    this.checkTheme();
    // Listen for theme changes
    window.addEventListener('storage', () => {
      this.checkTheme();
    });
    
    // Also check when body class changes
    const observer = new MutationObserver(() => {
      this.checkTheme();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (window.innerWidth > 768) {
      this.closeMobileMenu();
    }
  }
  
  private checkTheme(): void {
    this.isDarkTheme = !document.body.classList.contains('light-theme');
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  switchLanguage(lang: string): void {
    this.translateService.use(lang);
    this.currentLanguage = lang;
  }
}