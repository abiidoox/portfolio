import { Component, OnInit, NgZone, OnDestroy, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './services/language.service';
import { ToastService } from './services/toast.service';
import { ProjectModalService } from './services/project-modal.service';
import { ProjectModalData } from './components/shared/project-modal/project-modal.component';
import { trigger, transition, style, animate, query } from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        query(':leave', [
          style({ opacity: 1 }),
          animate('200ms ease-out', style({ opacity: 0, transform: 'translateY(-16px)' }))
        ], { optional: true }),
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(28px)' }),
          animate('480ms 180ms cubic-bezier(.22,1,.36,1)', style({ opacity: 1, transform: 'none' }))
        ], { optional: true })
      ])
    ])
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  private mouseHandler?: (e: MouseEvent) => void;
  modalProject: ProjectModalData | null = null;

  prepareRoute(outlet: any): any {
    return outlet?.activatedRouteData?.['animation'] ?? '*';
  }

  constructor(
    private translate: TranslateService,
    private languageService: LanguageService,
    private zone: NgZone,
    private toast: ToastService,
    private projectModalService: ProjectModalService
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
    const current = localStorage.getItem('theme') || 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    if (next === 'light') {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    } else {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', next);
    const key = next === 'light' ? 'TOAST.THEME_LIGHT' : 'TOAST.THEME_DARK';
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

    // Mouse-follow glow (runs outside Angular for performance)
    const glow = document.querySelector('.mouse-glow');
    if (glow && window.matchMedia('(pointer: fine)').matches) {
      this.zone.runOutsideAngular(() => {
        this.mouseHandler = (e: MouseEvent) => {
          (glow as HTMLElement).style.left = e.clientX + 'px';
          (glow as HTMLElement).style.top = e.clientY + 'px';
        };
        window.addEventListener('mousemove', this.mouseHandler!);
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
