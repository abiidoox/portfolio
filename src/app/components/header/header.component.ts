import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

interface NavItem {
  path: string;
  key: string;
  label: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  isScrolled = false;

  navItems: NavItem[] = [
    { path: '/', key: 'header.home', label: 'Home' },
    { path: '/projects', key: 'header.projects', label: 'Projects' },
    { path: '/skills', key: 'header.skills', label: 'Skills' },
    { path: '/resume', key: 'header.resume', label: 'Resume' },
    { path: '/contact', key: 'header.contact', label: 'Contact' }
  ];

  // Sliding active indicator
  indicatorX = 0;
  indicatorWidth = 0;
  indicatorVisible = false;

  @ViewChild('navLinks') navLinks?: ElementRef<HTMLUListElement>;

  private subs: Subscription[] = [];

  constructor(private translateService: TranslateService, private router: Router) {}

  ngOnInit(): void {
    this.loadLabels();

    this.subs.push(
      this.translateService.onLangChange.subscribe(() => {
        this.loadLabels();
        // Labels change width, so the indicator must be recomputed.
        setTimeout(() => this.updateIndicator(), 0);
      })
    );

    // Removed: a `storage` listener and a MutationObserver on body's class
    // attribute, both wired to an empty detectTheme(). The observer fired on
    // every body class change to do nothing. Cross-tab theme sync now lives in
    // ThemeService, where it has an actual implementation.

    setTimeout(() => this.updateIndicator(), 0);

    this.subs.push(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => {
          this.closeMobileMenu();
          setTimeout(() => this.updateIndicator(), 0);
        })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 24;
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 768) this.closeMobileMenu();
    setTimeout(() => this.updateIndicator(), 0);
  }

  private loadLabels(): void {
    for (const item of this.navItems) {
      this.translateService.get(item.key).subscribe(label => (item.label = label));
    }
  }

  isActive(path: string): boolean {
    if (path === '/') return this.router.url === '/';
    return this.router.url.startsWith(path);
  }

  /** Both handlers used to take parameters they immediately discarded. */
  onNavClick(): void {
    setTimeout(() => this.updateIndicator(), 0);
  }

  onMobileNavClick(): void {
    this.closeMobileMenu();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    setTimeout(() => this.updateIndicator(), 0);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  private updateIndicator(): void {
    const list = this.navLinks?.nativeElement;
    if (!list) return;
    const activeLink = list.querySelector<HTMLAnchorElement>('a[data-active="true"]');
    if (!activeLink) {
      this.indicatorVisible = false;
      return;
    }
    const listRect = list.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    this.indicatorX = linkRect.left - listRect.left;
    this.indicatorWidth = linkRect.width;
    this.indicatorVisible = true;
  }
}
