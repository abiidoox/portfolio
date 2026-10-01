import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

/**
 * Single source of truth for the colour theme.
 *
 * This exists because two components used to own theme state independently:
 * ThemeSwitcherComponent kept a `currentTheme` field, while AppComponent's
 * `T` shortcut wrote localStorage and the DOM directly. Pressing `T` therefore
 * left the switcher's icon and accessible name describing a theme the page was
 * no longer in. One observable, one writer.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService implements OnDestroy {
  private readonly themeSubject: BehaviorSubject<Theme>;
  readonly theme$;

  constructor() {
    this.themeSubject = new BehaviorSubject<Theme>(this.readStoredTheme());
    this.theme$ = this.themeSubject.asObservable();
    this.apply(this.themeSubject.value);

    // Adopt theme changes made in another tab. The `storage` event only fires
    // in *other* tabs, so applying it here cannot echo back and loop.
    window.addEventListener('storage', this.onStorage);
  }

  get current(): Theme {
    return this.themeSubject.value;
  }

  /** The theme a toggle would switch to — what the button should describe. */
  get target(): Theme {
    return this.current === 'dark' ? 'light' : 'dark';
  }

  set(theme: Theme): void {
    if (theme === this.themeSubject.value) return;
    this.themeSubject.next(theme);
    this.apply(theme);
  }

  toggle(): void {
    this.set(this.target);
  }

  ngOnDestroy(): void {
    window.removeEventListener('storage', this.onStorage);
  }

  private onStorage = (event: StorageEvent): void => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    const incoming: Theme = event.newValue === 'light' ? 'light' : 'dark';
    this.themeSubject.next(incoming);
    this.apply(incoming);
  };

  private readStoredTheme(): Theme {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark';
    } catch {
      // Private browsing modes can throw on access rather than return null.
      return 'dark';
    }
  }

  private apply(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.toggle('light-theme', theme === 'light');
    document.body.classList.toggle('dark-theme', theme === 'dark');
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Non-fatal: the theme still applies for this page view.
    }
  }
}
