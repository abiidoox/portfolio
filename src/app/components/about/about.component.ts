import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';

interface ProfileInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
}

interface SkillCategory {
  title: string;
  items: string[];
  icon: string;
}

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  profileData: { [key: string]: ProfileInfo } = {
    en: {
      name: 'ABDERRAZZAQ EL ABDOUNI',
      title: 'Full Stack Engineer',
      email: 'elabdouni.abderrazzaq@gmail.com',
      phone: '0653539113',
      location: 'Rabat, Morocco',
      bio: 'I am a passionate Full Stack Engineer based in Rabat, specializing in web development, IoT, and Machine Learning. I combine technical expertise and innovation to create high-performance, scalable software solutions.'
    },
    fr: {
      name: 'ABDERRAZZAQ EL ABDOUNI',
      title: 'Ingénieur Full Stack',
      email: 'elabdouni.abderrazzaq@gmail.com',
      phone: '0653539113',
      location: 'Rabat, Maroc',
      bio: 'Je suis un Ingénieur Full Stack passionné basé à Rabat, spécialisé dans le développement web, l\'IoT et le Machine Learning. Je combine expertise technique et innovation pour créer des solutions logicielles performantes et évolutives.'
    },
    es: {
      name: 'ABDERRAZZAQ EL ABDOUNI',
      title: 'Ingeniero Full Stack',
      email: 'elabdouni.abderrazzaq@gmail.com',
      phone: '0653539113',
      location: 'Rabat, Marruecos',
      bio: 'Soy un Ingeniero Full Stack apasionado con sede en Rabat, especializado en desarrollo web, IoT y Machine Learning. Combino experiencia técnica e innovación para crear soluciones de software escalables y de alto rendimiento.'
    }
  };

  skillCategories: SkillCategory[] = [
    {
      title: 'ABOUT.SKILLS.LANGUAGES.TITLE',
      items: [
        'ABOUT.SKILLS.LANGUAGES.ITEM1',
        'ABOUT.SKILLS.LANGUAGES.ITEM2',
        'ABOUT.SKILLS.LANGUAGES.ITEM3',
        'ABOUT.SKILLS.LANGUAGES.ITEM4'
      ],
      icon: 'fas fa-code'
    },
    {
      title: 'ABOUT.SKILLS.FRAMEWORKS.TITLE',
      items: [
        'ABOUT.SKILLS.FRAMEWORKS.ITEM1',
        'ABOUT.SKILLS.FRAMEWORKS.ITEM2',
        'ABOUT.SKILLS.FRAMEWORKS.ITEM3',
        'ABOUT.SKILLS.FRAMEWORKS.ITEM4'
      ],
      icon: 'fas fa-layer-group'
    },
    {
      title: 'ABOUT.SKILLS.DATABASES.TITLE',
      items: [
        'ABOUT.SKILLS.DATABASES.ITEM1',
        'ABOUT.SKILLS.DATABASES.ITEM2',
        'ABOUT.SKILLS.DATABASES.ITEM3',
        'ABOUT.SKILLS.DATABASES.ITEM4'
      ],
      icon: 'fas fa-database'
    },
    {
      title: 'ABOUT.SKILLS.TOOLS.TITLE',
      items: [
        'ABOUT.SKILLS.TOOLS.ITEM1',
        'ABOUT.SKILLS.TOOLS.ITEM2',
        'ABOUT.SKILLS.TOOLS.ITEM3',
        'ABOUT.SKILLS.TOOLS.ITEM4'
      ],
      icon: 'fas fa-tools'
    }
  ];

  get profile(): ProfileInfo {
    const currentLang = this.translate.currentLang || this.translate.defaultLang || 'en';
    return this.profileData[currentLang] || this.profileData['en'];
  }

  constructor(
    private translate: TranslateService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.languageService.currentLanguage$.subscribe(() => {
      // Update any translated content if needed
    });
  }
}