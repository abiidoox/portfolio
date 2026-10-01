import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Theme, ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-switcher',
  templateUrl: './theme-switcher.component.html'
})
export class ThemeSwitcherComponent implements OnInit, OnDestroy {
  currentTheme: Theme = 'dark';

  private sub?: Subscription;

  constructor(private translate: TranslateService, private theme: ThemeService) {}

  ngOnInit(): void {
    // The switcher no longer owns theme state, it mirrors it. This is what
    // keeps the icon and label correct when the `T` shortcut is used.
    this.sub = this.theme.theme$.subscribe(theme => (this.currentTheme = theme));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  /**
   * Names the *action*, not the current state. This used to return the theme
   * the page was already in, so in dark mode the button announced "Switch to
   * Dark Mode" while switching to light.
   */
  getThemeLabel(): string {
    return this.theme.target === 'light'
      ? this.translate.instant('theme.light')
      : this.translate.instant('theme.dark');
  }
}
