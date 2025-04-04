import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  currentLang: string;
  
  profile = {
    name: 'ABDERRAZZAQ EL ABDOUNI',
    title: 'Ingénieur Full Stack',
    email: 'elabdouni.abderrazzaq@gmail.com',
    phone: '0653539113',
    location: 'Rabat, Maroc',
    bio: 'Je suis un Ingénieur Full Stack passionné basé à Rabat, spécialisé dans le développement web, l\'IoT et le Machine Learning. Je combine expertise technique et innovation pour créer des solutions logicielles performantes et évolutives.'
  };

  constructor(private translate: TranslateService) {
    this.currentLang = this.translate.currentLang || this.translate.defaultLang || 'fr';
  }

  ngOnInit(): void {
    // Get current language or set default
    this.currentLang = this.translate.currentLang || this.translate.defaultLang || 'fr';
  }

  // Method to change language
  changeLanguage(lang: string): void {
    this.translate.use(lang);
    this.currentLang = lang;
  }
}