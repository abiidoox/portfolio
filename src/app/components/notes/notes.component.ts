import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { NOTES_BY_DATE, noteSlug } from '../../data/notes.data';
import { LanguageService, Language } from '../../services/language.service';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

interface NoteView {
  slug: string;
  title: string;
  summary: string;
  /** Raw 'YYYY-MM' for the <time datetime> attribute. */
  date: string;
  dateLabel: string;
  readingMinutes: number;
}

const LOCALES: Record<Language, string> = { en: 'en-US', fr: 'fr-FR', es: 'es-ES' };

/**
 * The notes index: short engineering write-ups, newest first. Each card is a
 * door into a prerendered page; the list itself carries no weight.
 */
@Component({
    selector: 'app-notes',
    templateUrl: './notes.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink, ScrollRevealDirective, TranslatePipe]
})
export class NotesComponent implements OnInit, OnDestroy {
  private translate = inject(TranslateService);
  private languageService = inject(LanguageService);

  readonly notes = signal<NoteView[]>([]);

  private langSub?: Subscription;

  ngOnInit(): void {
    this.loadNotes();
    this.langSub = this.translate.onLangChange.subscribe(() => this.loadNotes());
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  private loadNotes(): void {
    const keys = NOTES_BY_DATE.flatMap(note => [note.titleKey, note.summaryKey]);
    this.translate.get(keys).subscribe(values => {
      this.notes.set(NOTES_BY_DATE.map(note => ({
        slug: noteSlug(note),
        title: this.clean(values[note.titleKey], note.titleKey, note.fallbackTitle),
        summary: this.clean(values[note.summaryKey], note.summaryKey, note.fallbackSummary),
        date: note.date,
        dateLabel: this.formatDate(note.date),
        readingMinutes: note.readingMinutes
      })));
    });
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
