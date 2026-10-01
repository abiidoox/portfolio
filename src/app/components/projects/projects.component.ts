import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ProjectModalService } from '../../services/project-modal.service';
import { PROJECTS, Project } from '../../data/projects.data';
import { Subscription, forkJoin } from 'rxjs';

interface DisplayProject {
  key: string;
  title: string;
  description: string;
  longDescription: string;
  technologies: string[];
  category: string;
  featured: boolean;
  date: string;
  links?: { labelKey: string; url: string; icon: string }[];
}

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html'
})
export class ProjectsComponent implements OnInit, OnDestroy {
  /** Canonical filter order; only categories present in the data are shown. */
  private static readonly CATEGORY_ORDER = ['web', 'mobile', 'ai', 'iot', 'desktop'];

  selectedCategory = 'all';

  projects: DisplayProject[] = [];
  filteredProjects: DisplayProject[] = [];

  /**
   * Derived from the projects themselves so a category can never be offered
   * with nothing behind it — a tab that filters to an empty grid is a dead end.
   */
  get categories(): string[] {
    const present = new Set(this.projects.map(p => p.category));
    return ['all', ...ProjectsComponent.CATEGORY_ORDER.filter(c => present.has(c))];
  }

  private langSub?: Subscription;

  constructor(
    private translate: TranslateService,
    private projectModalService: ProjectModalService
  ) {}

  ngOnInit(): void {
    this.projects = PROJECTS
      .slice()
      .sort((a, b) => Number(b.date) - Number(a.date))
      .map(p => ({
        key: p.key,
        title: p.fallbackTitle,
        description: p.fallbackDescription,
        longDescription: '',
        technologies: p.technologies,
        category: p.category,
        featured: p.featured,
        date: p.date,
        links: p.links
      }));

    this.filterProjects('all');
    this.loadTranslations();

    this.langSub = this.translate.onLangChange.subscribe(() => this.loadTranslations());
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  private loadTranslations(): void {
    const source = new Map(PROJECTS.map(p => [p.key, p]));
    const requests = PROJECTS.flatMap(p => [
      this.translate.get(p.titleKey),
      this.translate.get(p.descriptionKey),
      this.translate.get(p.longDescriptionKey)
    ]);

    forkJoin(requests).subscribe({
      next: values => {
        this.projects = this.projects.map(p => {
          const src = source.get(p.key)!;
          const i = PROJECTS.findIndex(x => x.key === p.key);
          const base = i * 3;
          return {
            ...p,
            // If a key is missing ngx-translate echoes the key back; fall back
            // to the English source so a card is never blank.
            title: usable(values[base], src.fallbackTitle),
            description: usable(values[base + 1], src.fallbackDescription),
            longDescription: usable(values[base + 2], '')
          };
        });
        this.filterProjects(this.selectedCategory);
      },
      error: () => this.filterProjects(this.selectedCategory)
    });
  }

  filterProjects(category: string): void {
    this.selectedCategory = category;
    this.filteredProjects = category === 'all'
      ? this.projects
      : this.projects.filter(p => p.category === category);
  }

  countFor(category: string): number {
    return category === 'all'
      ? this.projects.length
      : this.projects.filter(p => p.category === category).length;
  }

  openModal(project: DisplayProject): void {
    this.projectModalService.open(project as DisplayProject);
  }

  categoryIcon(category: string): string {
    switch (category) {
      case 'web': return 'fa-globe';
      case 'ai': return 'fa-brain';
      case 'iot': return 'fa-microchip';
      case 'desktop': return 'fa-desktop';
      case 'mobile': return 'fa-mobile-screen-button';
      default: return 'fa-code';
    }
  }

  /** Restrained per-category washes — depth, not decoration. */
  gradientFor(category: string): string {
    switch (category) {
      case 'ai': return 'from-violet-500/[0.16] via-fuchsia-500/[0.07] to-transparent';
      case 'iot': return 'from-emerald-500/[0.16] via-teal-500/[0.07] to-transparent';
      case 'desktop': return 'from-sky-500/[0.14] via-blue-500/[0.06] to-transparent';
      case 'web': return 'from-signal/[0.16] via-orange-500/[0.06] to-transparent';
      case 'mobile': return 'from-violet-500/[0.14] via-sky-500/[0.06] to-transparent';
      default: return 'from-slate-500/[0.12] to-transparent';
    }
  }

  onGlowMove(e: MouseEvent): void {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }
}

function usable(value: string | undefined, fallback: string): string {
  if (!value || !value.trim()) return fallback;
  // ngx-translate returns the key itself when a translation is missing.
  if (/^[A-Z0-9_]+(\.[A-Z0-9_]+)+$/.test(value)) return fallback;
  return value;
}

export type { Project };
