import { Component, OnInit, NgZone, OnDestroy, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './services/language.service';
import { ToastService } from './services/toast.service';
import { ProjectModalService } from './services/project-modal.service';
import { SeoService } from './services/seo.service';
import { ThemeService } from './services/theme.service';
import { RouterOutlet } from '@angular/router';
import { ProjectModalData } from './components/shared/project-modal/project-modal.component';
import { trigger, transition, style, animate, query } from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        query(':leave', [
          style({ opacity: 1 }),
          animate('180ms ease-out', style({ opacity: 0, transform: 'translateY(-12px)' }))
        ], { optional: true }),
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(24px)' }),
          animate('520ms 160ms cubic-bezier(.22,1,.36,1)', style({ opacity: 1, transform: 'none' }))
        ], { optional: true })
      ])
    ])
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  private mouseHandler?: (e: MouseEvent) => void;
  modalProject: ProjectModalData | null = null;

  prepareRoute(outlet: RouterOutlet | null): string {
    return outlet?.activatedRouteData?.['animation'] ?? '*';
  }

  constructor(
    private translate: TranslateService,
    private languageService: LanguageService,
    private zone: NgZone,
    private toast: ToastService,
    private projectModalService: ProjectModalService,
    private seo: SeoService,
    private theme: ThemeService
  ) {
    // Initialize translations
    translate.addLangs(['en', 'es', 'fr']);
    translate.setDefaultLang('en');
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    // Ignore when typing in inputs/textarea/contenteditable
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    const key = event.key.toLowerCase();

    // T = Toggle theme
    if (key === 't' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      this.toggleTheme();
    }

    // L = Cycle language
    if (key === 'l' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      this.cycleLanguage();
    }
  }

  private toggleTheme(): void {
    // Routed through ThemeService so the switcher's icon and label stay in
    // sync. Writing localStorage and the DOM here is what desynced them.
    this.theme.toggle();
    const key = this.theme.current === 'light' ? 'TOAST.THEME_LIGHT' : 'TOAST.THEME_DARK';
    this.translate.get(key).subscribe(msg => this.toast.info(msg));
  }

  private cycleLanguage(): void {
    const order: Array<'en' | 'fr' | 'es'> = ['en', 'fr', 'es'];
    const current = this.languageService.getCurrentLanguage();
    const next = order[(order.indexOf(current) + 1) % order.length];
    this.languageService.setLanguage(next);
    this.translate.get('TOAST.LANGUAGE_CHANGED', { lang: next.toUpperCase() }).subscribe(msg => this.toast.info(msg));
  }

  ngOnInit(): void {
    this.languageService.currentLanguage$.subscribe(lang => {
      document.documentElement.lang = lang;
    });

    this.projectModalService.project$.subscribe(project => {
      this.modalProject = project;
    });

    // Cursor-following glow. Runs outside Angular and writes only a transform,
    // so it never triggers layout on each move.
    const glow = document.querySelector('.mouse-glow') as HTMLElement | null;
    if (glow && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      this.zone.runOutsideAngular(() => {
        this.mouseHandler = (e: MouseEvent) => {
          glow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        };
        window.addEventListener('mousemove', this.mouseHandler, { passive: true });
      });
    }
  }

  ngOnDestroy(): void {
    if (this.mouseHandler) {
      window.removeEventListener('mousemove', this.mouseHandler);
    }
  }

  closeModal(): void {
    this.projectModalService.close();
  }
}
