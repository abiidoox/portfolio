import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { ThemeService } from '../../services/theme.service';

interface TerminalLine {
  kind: 'cmd' | 'out' | 'err';
  text: string;
}

/**
 * The 404 page doubles as a way out: a minimal shell that accepts the handful
 * of commands a visitor was probably looking for anyway. Every command maps to
 * real navigation, theme or identity — nothing decorative.
 */
@Component({
    selector: 'app-not-found',
    templateUrl: './not-found.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink, TranslatePipe, FormsModule]
})
export class NotFoundComponent {
  private router = inject(Router);
  private translate = inject(TranslateService);
  private theme = inject(ThemeService);

  readonly lines = signal<TerminalLine[]>([]);
  command = '';

  constructor() {
    // Seed the transcript once translations resolve, so the shell never
    // greets a visitor with a raw i18n key.
    this.translate.get('NOT_FOUND.CMD.WELCOME').subscribe(text => {
      this.lines.set([{ kind: 'out', text }]);
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  run(): void {
    const raw = this.command.trim();
    this.command = '';
    if (!raw) return;

    this.write('cmd', raw);
    const [cmd] = raw.toLowerCase().split(/\s+/);

    switch (cmd) {
      case 'help':
        this.write('out', this.t('NOT_FOUND.CMD.HELP'));
        break;
      case 'home':
      case 'projects':
      case 'skills':
      case 'resume':
      case 'contact':
        this.navigate(cmd === 'home' ? '/' : `/${cmd}`);
        break;
      case 'theme':
        this.theme.toggle();
        this.write('out', this.t('NOT_FOUND.CMD.THEME_OK', { theme: this.theme.current }));
        break;
      case 'whoami':
        this.write('out', `${this.t('ABOUT.NAME')} — ${this.t('ABOUT.ROLE')}`);
        break;
      case 'clear':
        this.lines.set([]);
        break;
      default:
        this.write('err', this.t('NOT_FOUND.CMD.UNKNOWN', { cmd: raw }));
    }
  }

  private navigate(route: string): void {
    this.write('out', this.t('NOT_FOUND.CMD.OPENING', { route }));
    this.router.navigate([route]);
  }

  private write(kind: TerminalLine['kind'], text: string): void {
    this.lines.update(list => [...list, { kind, text }]);
  }

  private t(key: string, params?: object): string {
    // instant() echoes the key when it is missing; an empty string keeps the
    // terminal readable instead of printing raw keys.
    const value = params ? this.translate.instant(key, params) : this.translate.instant(key);
    return value === key ? '' : value;
  }
}
