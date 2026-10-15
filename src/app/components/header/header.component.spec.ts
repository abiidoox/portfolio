import { TestBed } from '@angular/core/testing';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { of, Subject } from 'rxjs';
import { HeaderComponent } from './header.component';

const LABELS: Record<string, string> = {
  'header.home': 'Home',
  'header.projects': 'Projects',
  'header.skills': 'Skills',
  'header.resume': 'Resume',
  'header.contact': 'Contact'
};

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let langChange: Subject<unknown>;
  let events: Subject<unknown>;
  let routerUrl: string;

  beforeEach(() => {
    langChange = new Subject();
    events = new Subject();
    routerUrl = '/';
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TranslateService,
          useValue: {
            get: (key: string) => of(LABELS[key] ?? key),
            onLangChange: langChange.asObservable()
          }
        },
        {
          provide: Router,
          useValue: {
            get url() { return routerUrl; },
            events: events.asObservable()
          }
        }
      ]
    });
    component = TestBed.runInInjectionContext(() => new HeaderComponent());
  });

  afterEach(() => TestBed.resetTestingModule());

  it('loads translated labels on init and on language change', () => {
    component.ngOnInit();

    expect(component.navItems.map(i => i.label))
      .toEqual(['Home', 'Projects', 'Skills', 'Resume', 'Contact']);

    LABELS['header.home'] = 'Accueil';
    langChange.next({});
    expect(component.navItems[0].label).toBe('Accueil');
    LABELS['header.home'] = 'Home';

    component.ngOnDestroy();
  });

  it('toggles and closes the mobile menu', () => {
    component.ngOnInit();

    component.toggleMobileMenu();
    expect(component.isMobileMenuOpen).toBe(true);

    component.closeMobileMenu();
    expect(component.isMobileMenuOpen).toBe(false);

    component.ngOnDestroy();
  });

  it('closes the mobile menu on navigation', () => {
    component.ngOnInit();
    component.toggleMobileMenu();

    events.next(new NavigationEnd(1, '/skills', '/skills'));

    expect(component.isMobileMenuOpen).toBe(false);

    component.ngOnDestroy();
  });

  it('marks the active route, treating / as exact', () => {
    component.ngOnInit();

    expect(component.isActive('/')).toBe(true);
    expect(component.isActive('/projects')).toBe(false);

    routerUrl = '/projects';
    expect(component.isActive('/')).toBe(false);
    expect(component.isActive('/projects')).toBe(true);
    expect(component.isActive('/skills')).toBe(false);

    component.ngOnDestroy();
  });

  it('tracks the scrolled state from window.scrollY', () => {
    component.ngOnInit();

    Object.defineProperty(window, 'scrollY', { value: 100, configurable: true });
    component.onScroll();
    expect(component.isScrolled).toBe(true);

    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
    component.onScroll();
    expect(component.isScrolled).toBe(false);

    delete (window as { scrollY?: unknown }).scrollY;
    component.ngOnDestroy();
  });

  it('closes the mobile menu on resize above the breakpoint', () => {
    component.ngOnInit();
    component.toggleMobileMenu();

    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
    component.onResize();

    expect(component.isMobileMenuOpen).toBe(false);

    delete (window as { innerWidth?: unknown }).innerWidth;
    component.ngOnDestroy();
  });
});
