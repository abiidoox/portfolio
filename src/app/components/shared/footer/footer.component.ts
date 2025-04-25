import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  socialLinks = [
    { icon: 'fab fa-github', url: 'https://github.com', label: 'GitHub' },
    { icon: 'fab fa-linkedin', url: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: 'fab fa-twitter', url: 'https://twitter.com', label: 'Twitter' },
  ];
} 