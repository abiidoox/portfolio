import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';

interface Achievement {
  id: number;
  titleKey: string;
  descriptionKey: string;
  date: Date;
  issuerKey: string;
  image: string;
  type: 'certification' | 'award' | 'project' | 'publication';
  link?: string;
  technologies?: string[];
  category?: string;
}

@Component({
  selector: 'app-achievements',
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.scss']
})
export class AchievementsComponent implements OnInit, OnDestroy {
  private langSubscription!: Subscription;
  achievements: Achievement[] = [
    {
      id: 1,
      titleKey: 'ACHIEVEMENTS.ITEMS.SCRUM.TITLE',
      descriptionKey: 'ACHIEVEMENTS.ITEMS.SCRUM.DESCRIPTION',
      date: new Date('2024-01-15'),
      issuerKey: 'ACHIEVEMENTS.ITEMS.SCRUM.ISSUER',
      image: 'assets/images/achievements/scrum-cert.jpg',
      type: 'certification',
      link: 'https://www.scrum.org/certificates/123456',
      technologies: ['Scrum', 'Agile'],
      category: 'methodology'
    },
    {
      id: 2,
      titleKey: 'ACHIEVEMENTS.ITEMS.FACE_RECOGNITION.TITLE',
      descriptionKey: 'ACHIEVEMENTS.ITEMS.FACE_RECOGNITION.DESCRIPTION',
      date: new Date('2024-03-20'),
      issuerKey: 'ACHIEVEMENTS.ITEMS.FACE_RECOGNITION.ISSUER',
      image: 'assets/images/achievements/face-recognition.jpg',
      type: 'project',
      link: 'https://github.com/yourusername/face-recognition',
      technologies: ['Python', 'OpenCV', 'TensorFlow', 'ESP32'],
      category: 'ai'
    },
    {
      id: 3,
      titleKey: 'ACHIEVEMENTS.ITEMS.BEST_PROJECT.TITLE',
      descriptionKey: 'ACHIEVEMENTS.ITEMS.BEST_PROJECT.DESCRIPTION',
      date: new Date('2023-12-10'),
      issuerKey: 'ACHIEVEMENTS.ITEMS.BEST_PROJECT.ISSUER',
      image: 'assets/images/achievements/best-project.jpg',
      type: 'award',
      technologies: ['Angular', 'Node.js', 'MongoDB'],
      category: 'web'
    }
  ];

  selectedType: string = 'all';
  selectedCategory: string = 'all';

  constructor(
    private translate: TranslateService,
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
    // Subscribe to language changes
    this.langSubscription = this.languageService.currentLanguage$.subscribe(() => {
      // Update any dynamic content if needed
    });
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  get filteredAchievements(): Achievement[] {
    return this.achievements.filter(achievement => {
      const typeMatch = this.selectedType === 'all' || achievement.type === this.selectedType;
      const categoryMatch = this.selectedCategory === 'all' || achievement.category === this.selectedCategory;
      return typeMatch && categoryMatch;
    });
  }

  get categories(): string[] {
    const categories = new Set(this.achievements
      .filter(a => a.category)
      .map(a => a.category as string));
    return ['all', ...Array.from(categories)];
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString(this.languageService.getCurrentLanguage(), {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'certification':
        return '🎓';
      case 'award':
        return '🏆';
      case 'project':
        return '💻';
      case 'publication':
        return '📚';
      default:
        return '🌟';
    }
  }

  getCategoryLabel(category: string): string {
    return this.translate.instant(`ACHIEVEMENTS.CATEGORIES.${category.toUpperCase()}`);
  }

  getTypeLabel(type: string): string {
    return this.translate.instant(`ACHIEVEMENTS.TYPES.${type.toUpperCase()}`);
  }
} 