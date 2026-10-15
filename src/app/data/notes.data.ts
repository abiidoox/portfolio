/**
 * Engineering notes: short, first-person write-ups about how parts of this
 * portfolio were built.
 *
 * Bodies live in the i18n dictionaries (NOTES.ITEMS.<KEY>.BODY) as arrays of
 * paragraphs; the English fallbacks here keep the tools (OG cards, sitemap,
 * RSS) working without loading translations.
 */
export interface Note {
  key: string;
  /** 'YYYY-MM'; notes sort newest first and show the month. */
  date: string;
  readingMinutes: number;
  fallbackTitle: string;
  fallbackSummary: string;
  titleKey: string;
  summaryKey: string;
  bodyKey: string;
}

export const NOTES: Note[] = [
  {
    key: 'TERMINAL_404',
    date: '2026-09',
    readingMinutes: 1,
    fallbackTitle: 'Why the 404 page is a terminal that takes commands',
    fallbackSummary: 'Most 404s are a dead end. Mine hands you a shell prompt instead: type help or whoami and the page answers.',
    titleKey: 'NOTES.ITEMS.TERMINAL_404.TITLE',
    summaryKey: 'NOTES.ITEMS.TERMINAL_404.SUMMARY',
    bodyKey: 'NOTES.ITEMS.TERMINAL_404.BODY'
  },
  {
    key: 'OG_HEADLESS',
    date: '2026-08',
    readingMinutes: 2,
    fallbackTitle: 'Rendering social cards offline with headless Chrome',
    fallbackSummary: 'Every share card on this site is a PNG rendered at build time: no screenshot service, no runtime dependency.',
    titleKey: 'NOTES.ITEMS.OG_HEADLESS.TITLE',
    summaryKey: 'NOTES.ITEMS.OG_HEADLESS.SUMMARY',
    bodyKey: 'NOTES.ITEMS.OG_HEADLESS.BODY'
  },
  {
    key: 'GITHUB_SNAPSHOT',
    date: '2026-07',
    readingMinutes: 1,
    fallbackTitle: 'A GitHub strip that never calls the GitHub API',
    fallbackSummary: 'The about page shows repo stats, yet the browser talks to no third party. A build-time snapshot does the fetching.',
    titleKey: 'NOTES.ITEMS.GITHUB_SNAPSHOT.TITLE',
    summaryKey: 'NOTES.ITEMS.GITHUB_SNAPSHOT.SUMMARY',
    bodyKey: 'NOTES.ITEMS.GITHUB_SNAPSHOT.BODY'
  }
];

/** URL slug for a note key: 'TERMINAL_404' -> 'terminal-404'. */
export function slugifyKey(key: string): string {
  return key.toLowerCase().replace(/_/g, '-');
}

export function noteSlug(note: Note): string {
  return slugifyKey(note.key);
}

export function findNoteBySlug(slug: string): Note | undefined {
  return NOTES.find(note => noteSlug(note) === slug);
}

/** Newest first; declared after NOTES so the module initializes in order. */
export const NOTES_BY_DATE: Note[] = [...NOTES].sort((a, b) => b.date.localeCompare(a.date));
