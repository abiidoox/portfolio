import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';
import { ToastService } from '../../../services/toast.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/** The CV's home base; also the timezone the clock reports. */
const HOME_TIMEZONE = 'Africa/Casablanca';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink, RouterLinkActive, TranslatePipe]
})
export class FooterComponent {
  private toast = inject(ToastService);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);

  currentYear = new Date().getFullYear();

  /**
   * Local time at home, so visitors can tell at a glance whether it is a
   * reasonable hour to send that email. Empty during prerender; the browser
   * fills it after hydration, and the reserved width keeps the row stable.
   */
  readonly localTime = signal('--:--');

  constructor() {
    afterNextRender(() => {
      const format = new Intl.DateTimeFormat('en-GB', {
        timeZone: HOME_TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      const update = () => this.localTime.set(format.format(new Date()));
      update();
      // Minute precision does not need a per-second tick; 30s keeps the
      // displayed minute accurate without waking the timer every second.
      const id = setInterval(update, 30_000);
      this.destroyRef.onDestroy(() => clearInterval(id));
    });
  }

  readonly navItems = [
    { route: '/', label: 'header.home' },
    { route: '/projects', label: 'header.projects' },
    { route: '/skills', label: 'header.skills' },
    { route: '/resume', label: 'header.resume' },
    { route: '/contact', label: 'header.contact' }
  ];

  readonly socialLinks = [
    { icon: 'fab fa-github', url: 'https://github.com/abiidoox', label: 'GitHub' },
    { icon: 'fab fa-linkedin-in', url: 'https://www.linkedin.com/in/abderrazzaq-el-abdouni-28004019a', label: 'LinkedIn' }
  ];

  copyEmail(): void {
    const email = 'elabdouni.abderrazzaq@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
      this.translate.get('TOAST.EMAIL_COPIED').subscribe(msg => this.toast.success(msg));
    }).catch(() => {
      this.translate.get('TOAST.EMAIL_COPY_FAILED').subscribe(msg => this.toast.error(msg));
    });
  }
}
