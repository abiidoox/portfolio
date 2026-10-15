import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { Subscription, forkJoin } from 'rxjs';
import {
  Project,
  adjacentProjects,
  contextKeyFor,
  findProjectBySlug,
  outcomeKeyFor,
  projectSlug
} from '../../data/projects.data';
import { SeoService, SITE } from '../../services/seo.service';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

/** schema.org applicationCategory per project category. */
const APPLICATION_CATEGORY: Record<string, string> = {
  web: 'WebApplication',
  mobile: 'MobileApplication',
  desktop: 'DesktopApplication'
};

interface CaseStudyView {
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  context: string;
  outcome: string;
  technologies: string[];
  category: string;
  featured: boolean;
  date: string;
  links?: { labelKey: string; url: string; icon: string }[];
  prev?: { slug: string; title: string };
  next?: { slug: string; title: string };
}

/**
 * One deep-dive page per project: context, what was built, outcome, stack.
 * The copy already existed for the modal; this page gives it a shareable,
 * prerendered URL and a structure a recruiter can skim in one scroll.
 */
@Component({
    selector: 'app-project-detail',
    templateUrl: './project-detail.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink, ScrollRevealDirective, TranslatePipe]
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private seo = inject(SeoService);

  readonly view = signal<CaseStudyView | null>(null);

  private project?: Project;
  private langSub?: Subscription;

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('key');
    const project = slug ? findProjectBySlug(slug) : undefined;
    if (!project) {
      this.router.navigate(['/404'], { replaceUrl: true });
      return;
    }

    this.project = project;
    this.loadTranslations();
    this.langSub = this.translate.onLangChange.subscribe(() => this.loadTranslations());
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
    this.seo.setOverride(null);
  }

  private loadTranslations(): void {
    const project = this.project;
    if (!project) return;

    const titleKey = project.titleKey;
    const descriptionKey = project.descriptionKey;
    const longDescriptionKey = project.longDescriptionKey;
    const contextKey = contextKeyFor(project);
    const outcomeKey = outcomeKeyFor(project);

    forkJoin([
      this.translate.get(titleKey),
      this.translate.get(descriptionKey),
      this.translate.get(longDescriptionKey),
      this.translate.get(contextKey),
      this.translate.get(outcomeKey)
    ]).subscribe(([title, description, longDescription, context, outcome]) => {
      const resolvedTitle = this.clean(title, titleKey, project.fallbackTitle);
      const resolvedDescription = this.clean(description, descriptionKey, project.fallbackDescription);

      const adjacent = adjacentProjects(project.key);
      const prev = adjacent.prev && {
        slug: projectSlug(adjacent.prev),
        title: this.localizedTitle(adjacent.prev)
      };
      const next = adjacent.next && {
        slug: projectSlug(adjacent.next),
        title: this.localizedTitle(adjacent.next)
      };

      this.view.set({
        slug: projectSlug(project),
        title: resolvedTitle,
        description: resolvedDescription,
        longDescription: this.clean(longDescription, longDescriptionKey, resolvedDescription),
        context: this.clean(context, contextKey),
        outcome: this.clean(outcome, outcomeKey),
        technologies: project.technologies,
        category: project.category,
        featured: project.featured,
        date: project.date,
        links: project.links,
        prev: prev || undefined,
        next: next || undefined
      });

      const suffix = this.translate.instant('PROJECTS.CASE_STUDY.SEO_SUFFIX');
      const slug = projectSlug(project);
      this.seo.setOverride({
        title: `${resolvedTitle} — ${suffix}`,
        meta: [
          { name: 'description', content: resolvedDescription },
          { property: 'og:description', content: resolvedDescription }
        ],
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: resolvedTitle,
          description: resolvedDescription,
          applicationCategory: APPLICATION_CATEGORY[project.category] ?? 'SoftwareApplication',
          datePublished: project.date,
          image: `${SITE}/assets/og/project-${slug}.png`,
          url: `${SITE}/projects/${slug}`,
          author: {
            '@type': 'Person',
            name: 'Abderrazzaq El Abdouni',
            url: SITE
          }
        }
      });
    });
  }

  private localizedTitle(project: Project): string {
    const value = this.translate.instant(project.titleKey);
    return value === project.titleKey ? project.fallbackTitle : value;
  }

  /** instant()/get() echo the key back when a translation is missing. */
  private clean(value: string, key: string, fallback = ''): string {
    return value === key ? fallback : value;
  }
}
