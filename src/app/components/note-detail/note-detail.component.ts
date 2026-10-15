import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subscription, forkJoin } from 'rxjs';
import { Note, findNoteBySlug, noteSlug } from '../../data/notes.data';
import { LanguageService, Language } from '../../services/language.service';
import { SeoService, SITE } from '../../services/seo.service';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

interface NoteDetailView {
  slug: string;
  title: string;
  summary: string;
  paragraphs: string[];
  /** Raw 'YYYY-MM' for the <time datetime> attribute. */
  date: string;
  dateLabel: string;
  readingMinutes: number;
}

const LOCALES: Record<Language, string> = { en: 'en-US', fr: 'fr-FR', es: 'es-ES' };

/**
 * One deep-dive note per write-up: a shareable, prerendered page with its own
 * structured data and social card, in the same shell as the case studies.
 */
@Component({
    selector: 'app-note-detail',
    templateUrl: './note-detail.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink, ScrollRevealDirective, TranslatePipe]
})
export class NoteDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private languageService = inject(LanguageService);
  private seo = inject(SeoService);

  readonly view = signal<NoteDetailView | null>(null);

  private note?: Note;
  private langSub?: Subscription;

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('key');
    const note = slug ? findNoteBySlug(slug) : undefined;
    if (!note) {
      this.router.navigate(['/404'], { replaceUrl: true });
      return;
    }

    this.note = note;
    this.loadTranslations();
    this.langSub = this.translate.onLangChange.subscribe(() => this.loadTranslations());
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
    this.seo.setOverride(null);
  }

  private loadTranslations(): void {
    const note = this.note;
    if (!note) return;

    forkJoin([
      this.translate.get(note.titleKey),
      this.translate.get(note.summaryKey),
      this.translate.get(note.bodyKey)
    ]).subscribe(([title, summary, body]) => {
      const resolvedTitle = this.clean(title, note.titleKey, note.fallbackTitle);
      const resolvedSummary = this.clean(summary, note.summaryKey, note.fallbackSummary);
      const resolvedBody = body === note.bodyKey ? [] : this.toParagraphs(body);
      const slug = noteSlug(note);

      this.view.set({
        slug,
        title: resolvedTitle,
        summary: resolvedSummary,
        paragraphs: resolvedBody,
        date: note.date,
        dateLabel: this.formatDate(note.date),
        readingMinutes: note.readingMinutes
      });

      const suffix = this.translate.instant('NOTES.SEO_SUFFIX');
      this.seo.setOverride({
        title: `${resolvedTitle} — ${suffix}`,
        meta: [
          { name: 'description', content: resolvedSummary },
          { property: 'og:description', content: resolvedSummary }
        ],
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: resolvedTitle,
          description: resolvedSummary,
          datePublished: note.date,
          image: `${SITE}/assets/og/note-${slug}.png`,
          url: `${SITE}/notes/${slug}`,
          author: {
            '@type': 'Person',
            name: 'Abderrazzaq El Abdouni',
            url: SITE
          }
        }
      });
    });
  }

  /** Bodies are string arrays in the dictionaries; tolerate a plain string. */
  private toParagraphs(body: string | string[]): string[] {
    if (Array.isArray(body)) return body.filter(Boolean);
    return String(body ?? '').split('\n\n').filter(Boolean);
  }

  private formatDate(date: string): string {
    const locale = LOCALES[this.languageService.getCurrentLanguage()];
    return new Date(`${date}-01T00:00:00Z`)
      .toLocaleDateString(locale, { year: 'numeric', month: 'long', timeZone: 'UTC' });
  }

  /** instant()/get() echo the key back when a translation is missing. */
  private clean(value: string, key: string, fallback = ''): string {
    return value === key ? fallback : value;
  }
}
