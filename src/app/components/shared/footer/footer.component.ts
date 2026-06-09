import { Component } from '@angular/core';

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
} 