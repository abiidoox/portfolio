import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  isScrolled = false;
  currentLanguage: string;
  isDarkTheme = true;
  
  // Sliding nav indicator
  indicatorX = 0;
  indicatorWidth = 0;
  indicatorScale = 0;
  
  @ViewChild('navLinks') navLinks!: ElementRef<HTMLUListElement>;
  
  private subs: Subscription[] = [];
  private storageHandler?: () => void;
  private observer?: MutationObserver;
  
  constructor(private translateService: TranslateService, private router: Router) {
    this.currentLanguage = this.translateService.currentLang || 'en';
  }

  ngOnInit(): void {
    this.subs.push(
      this.translateService.onLangChange.subscribe(event => {
        this.currentLanguage = event.lang;
        setTimeout(() => this.updateIndicator(), 0);
      })
    );
    
    // Check for theme changes
    this.checkTheme();
    // Listen for theme changes
    this.storageHandler = () => this.checkTheme();
    window.addEventListener('storage', this.storageHandler);
    
    // Also check when body class changes
    this.observer = new MutationObserver(() => this.checkTheme());
    this.observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    
    // Initialize indicator position
    setTimeout(() => this.updateIndicator(), 0);

    // Sync indicator on route changes
    this.subs.push(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        setTimeout(() => this.updateIndicator(), 0);
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    if (this.storageHandler) window.removeEventListener('storage', this.storageHandler);
    this.observer?.disconnect();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.isScrolled = window.scrollY > 24;
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
  
  setActiveLink(event: Event, index: number): void {
    const target = event.target as HTMLAnchorElement;
    const li = target.closest('li') as HTMLLIElement;
    if (!li || !this.navLinks) return;
    
    this.updateIndicator();
  }
  
  private updateIndicator(): void {
    const activeLink = this.navLinks?.nativeElement.querySelector('a.active');
    if (!activeLink) return;
    
    const containerRect = this.navLinks.nativeElement.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    
    // Slightly wider indicator, centered on the link (the extra width via CSS margin, offset here)
    this.indicatorX = (linkRect.left - containerRect.left) - 6;
    this.indicatorWidth = linkRect.width + 12;
    this.indicatorScale = 1;
  }
}