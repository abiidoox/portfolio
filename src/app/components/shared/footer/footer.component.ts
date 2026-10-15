import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ToastService } from '../../../services/toast.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class FooterComponent {
  private toast = inject(ToastService);
  private translate = inject(TranslateService);

  currentYear = new Date().getFullYear();

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
