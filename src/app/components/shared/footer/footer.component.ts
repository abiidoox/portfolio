import { Component } from '@angular/core';
import { ToastService } from '../../../services/toast.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  socialLinks = [
    { icon: 'fab fa-github', url: 'https://github.com/abiidoox', label: 'GitHub' },
    { icon: 'fab fa-linkedin', url: 'https://www.linkedin.com/in/abderrazzaq-el-abdouni-28004019a', label: 'LinkedIn' },
  ];

  constructor(private toast: ToastService, private translate: TranslateService) {}

  copyEmail(): void {
    const email = 'elabdouni.abderrazzaq@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
      this.translate.get('TOAST.EMAIL_COPIED').subscribe(msg => this.toast.success(msg));
    }).catch(() => {
      this.translate.get('TOAST.EMAIL_COPY_FAILED').subscribe(msg => this.toast.error(msg));
    });
  }
} 