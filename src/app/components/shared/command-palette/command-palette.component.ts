import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { PROJECTS_BY_DATE, projectSlug } from '../../../data/projects.data';
import { CommandPaletteService } from '../../../services/command-palette.service';
import { ThemeService } from '../../../services/theme.service';
import { Language, LanguageService } from '../../../services/language.service';
import { ToastService } from '../../../services/toast.service';

interface PaletteItem {
  id: string;
  label: string;
  hint?: string;
  icon: string;
  /** Lowercased haystack for filtering. */
  keywords: string;
  run: () => void;
}

interface PaletteGroup {
  title: string;
  items: PaletteItem[];
}

type Row =
  | { header: string; item?: undefined; index: number }
  | { header?: undefined; item: PaletteItem; index: number };

const LANGUAGES: { code: Language; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' }
];

/**
 * Ctrl+K command palette: one keystroke to anywhere. Keyboard-first, so it
 * opens and closes instantly — no entry animation to sit through on every
 * invocation. Filtering is synchronous over a small local list.
 */
@Component({
    selector: 'app-command-palette',
    templateUrl: './command-palette.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [TranslatePipe]
})
export class CommandPaletteComponent {
  private router = inject(Router);
  private translate = inject(TranslateService);
  private theme = inject(ThemeService);
  private language = inject(LanguageService);
  private toast = inject(ToastService);
  private platformId = inject(PLATFORM_ID);

  readonly palette = inject(CommandPaletteService);

  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('paletteInput');
  private previouslyFocused: HTMLElement | null = null;

  readonly query = signal('');
  readonly activeIndex = signal(0);
  private readonly groups = signal<PaletteGroup[]>([]);

  readonly rows = computed<Row[]>(() => {
    const needle = this.query().trim().toLowerCase();
    const rows: Row[] = [];
    let index = 0;

    for (const group of this.groups()) {
      const items = needle
        ? group.items.filter(item => item.keywords.includes(needle))
        : group.items;
      if (items.length === 0) continue;

      rows.push({ header: group.title, index: -1 });
      for (const item of items) rows.push({ item, index: index++ });
    }
    return rows;
  });

  readonly itemCount = computed(() => this.rows().reduce((n, row) => (row.item ? n + 1 : n), 0));
  readonly isEmpty = computed(() => this.itemCount() === 0);
  readonly activeId = computed(() =>
    this.rows().find(row => row.item && row.index === this.activeIndex())?.item?.id ?? ''
  );

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    effect(() => {
      if (this.palette.isOpen()) {
        this.groups.set(this.buildItems());
        this.query.set('');
        this.activeIndex.set(0);
        this.previouslyFocused = document.activeElement as HTMLElement | null;
        document.body.style.overflow = 'hidden';
        setTimeout(() => this.inputRef()?.nativeElement.focus());
      } else {
        document.body.style.overflow = '';
        this.previouslyFocused?.focus?.();
      }
    });

    // Labels are localized; rebuild while open if the language changes.
    this.translate.onLangChange.subscribe(() => {
      if (this.palette.isOpen()) this.groups.set(this.buildItems());
    });
  }

  @HostListener('document:keydown', ['$event'])
  onGlobalKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.palette.toggle();
      return;
    }
    if (this.palette.isOpen() && event.key === 'Escape') {
      event.preventDefault();
      this.palette.close();
    }
  }

  onInputKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.move(-1);
        break;
      case 'Enter':
        event.preventDefault();
        this.runActive();
        break;
      case 'Tab':
        // Keep focus in the input; arrow keys drive the selection.
        event.preventDefault();
        break;
    }
  }

  onQueryInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(0);
  }

  setActive(index: number): void {
    this.activeIndex.set(index);
  }

  run(item: PaletteItem): void {
    this.palette.close();
    item.run();
  }

  close(): void {
    this.palette.close();
  }

  private move(delta: number): void {
    const count = this.itemCount();
    if (count === 0) return;
    this.activeIndex.update(index => (index + delta + count) % count);
    queueMicrotask(() => {
      const id = this.activeId();
      if (id) document.getElementById(id)?.scrollIntoView({ block: 'nearest' });
    });
  }

  private runActive(): void {
    const row = this.rows().find(r => r.item && r.index === this.activeIndex());
    if (row?.item) this.run(row.item);
  }

  private buildItems(): PaletteGroup[] {
    const t = (key: string, params?: object): string => {
      const value = params ? this.translate.instant(key, params) : this.translate.instant(key);
      return value === key ? '' : value;
    };

    const nav: { key: string; path: string; icon: string; aliases: string }[] = [
      { key: 'header.home', path: '/', icon: 'fas fa-house', aliases: 'home start about main' },
      { key: 'header.projects', path: '/projects', icon: 'fas fa-diagram-project', aliases: 'projects work portfolio case study' },
      { key: 'header.skills', path: '/skills', icon: 'fas fa-layer-group', aliases: 'skills stack technologies tools' },
      { key: 'header.resume', path: '/resume', icon: 'fas fa-file-lines', aliases: 'resume cv experience education' },
      { key: 'header.contact', path: '/contact', icon: 'fas fa-paper-plane', aliases: 'contact email hire message' }
    ];

    const pages: PaletteItem[] = nav.map(entry => {
      const label = t(entry.key);
      return {
        id: `page-${entry.path}`,
        label,
        hint: entry.path,
        icon: entry.icon,
        keywords: `${label} ${entry.aliases} ${entry.path}`.toLowerCase(),
        run: () => this.router.navigate([entry.path])
      };
    });

    const projects: PaletteItem[] = PROJECTS_BY_DATE.map(project => {
      const label = t(project.titleKey) || project.fallbackTitle;
      return {
        id: `project-${projectSlug(project)}`,
        label,
        hint: project.date,
        icon: 'fas fa-folder-open',
        keywords: `${label} ${project.technologies.join(' ')} ${project.key}`.toLowerCase(),
        run: () => this.router.navigate(['/projects', projectSlug(project)])
      };
    });

    const themeToLight = t('PALETTE.THEME_TO_LIGHT');
    const themeToDark = t('PALETTE.THEME_TO_DARK');

    const actions: PaletteItem[] = [
      {
        id: 'action-theme',
        label: this.theme.current === 'dark' ? themeToLight : themeToDark,
        hint: 'T',
        icon: 'fas fa-circle-half-stroke',
        keywords: `theme dark light toggle ${themeToLight} ${themeToDark}`.toLowerCase(),
        run: () => this.toggleTheme()
      },
      ...LANGUAGES.map(entry => ({
        id: `action-language-${entry.code}`,
        label: entry.name,
        hint: entry.code.toUpperCase(),
        icon: 'fas fa-language',
        keywords: `language ${entry.name} ${entry.code}`.toLowerCase(),
        run: () => this.switchLanguage(entry.code)
      })),
      {
        id: 'action-copy-email',
        label: t('PALETTE.COPY_EMAIL'),
        icon: 'fas fa-envelope',
        keywords: `copy email mail ${t('PALETTE.COPY_EMAIL')}`.toLowerCase(),
        run: () => this.copyEmail()
      }
    ];

    const links: PaletteItem[] = [
      {
        id: 'link-github',
        label: 'GitHub',
        hint: '↗',
        icon: 'fab fa-github',
        keywords: 'github code repositories source',
        run: () => window.open('https://github.com/abiidoox', '_blank', 'noopener')
      },
      {
        id: 'link-linkedin',
        label: 'LinkedIn',
        hint: '↗',
        icon: 'fab fa-linkedin-in',
        keywords: 'linkedin professional network',
        run: () => window.open('https://www.linkedin.com/in/abderrazzaq-el-abdouni-28004019a', '_blank', 'noopener')
      }
    ];

    return [
      { title: t('PALETTE.GROUP_PAGES'), items: pages },
      { title: t('PALETTE.GROUP_PROJECTS'), items: projects },
      { title: t('PALETTE.GROUP_ACTIONS'), items: actions },
      { title: t('PALETTE.GROUP_LINKS'), items: links }
    ];
  }

  private toggleTheme(): void {
    this.theme.toggle();
    const key = this.theme.current === 'light' ? 'TOAST.THEME_LIGHT' : 'TOAST.THEME_DARK';
    this.translate.get(key).subscribe(message => this.toast.info(message));
  }

  private switchLanguage(code: Language): void {
    this.language.setLanguage(code);
    this.translate.get('TOAST.LANGUAGE_CHANGED', { lang: code.toUpperCase() })
      .subscribe(message => this.toast.info(message));
  }

  private copyEmail(): void {
    const email = 'elabdouni.abderrazzaq@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
      this.translate.get('TOAST.EMAIL_COPIED').subscribe(message => this.toast.success(message));
    }).catch(() => {
      this.translate.get('TOAST.EMAIL_COPY_FAILED').subscribe(message => this.toast.error(message));
    });
  }
}
