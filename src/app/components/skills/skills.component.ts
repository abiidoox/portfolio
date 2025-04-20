import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';

interface Skill {
  name: string;
  level: number;
  icon: string;
  category: string;
  experience: string;
  projects?: number;
}

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
})
export class SkillsComponent implements OnInit {
  skills: Skill[] = [
    // Languages
    { name: 'C#', level: 90, icon: 'csharp', category: 'languages', experience: '3+', projects: 5 },
    { name: 'Java', level: 85, icon: 'java', category: 'languages', experience: '3+', projects: 4 },
    { name: 'Python', level: 80, icon: 'python', category: 'languages', experience: '2+', projects: 3 },
    { name: 'JavaScript', level: 90, icon: 'javascript', category: 'languages', experience: '3+', projects: 8 },
    { name: 'TypeScript', level: 85, icon: 'typescript', category: 'languages', experience: '2+', projects: 6 },
    { name: 'HTML/CSS', level: 90, icon: 'html5', category: 'languages', experience: '3+', projects: 10 },

    // Frameworks
    { name: '.NET Core', level: 85, icon: 'dot-net', category: 'frameworks', experience: '2+', projects: 4 },
    { name: 'Spring Boot', level: 80, icon: 'spring', category: 'frameworks', experience: '2+', projects: 3 },
    { name: 'Angular', level: 90, icon: 'angularjs', category: 'frameworks', experience: '2+', projects: 6 },
    { name: 'React', level: 85, icon: 'react', category: 'frameworks', experience: '1+', projects: 4 },
    { name: 'FastAPI', level: 80, icon: 'python', category: 'frameworks', experience: '1+', projects: 2 },
    { name: 'Django', level: 75, icon: 'django', category: 'frameworks', experience: '1+', projects: 2 },

    // Databases
    { name: 'SQL Server', level: 85, icon: 'microsoftsqlserver', category: 'databases', experience: '3+', projects: 5 },
    { name: 'MySQL', level: 80, icon: 'mysql', category: 'databases', experience: '2+', projects: 4 },
    { name: 'PostgreSQL', level: 80, icon: 'postgresql', category: 'databases', experience: '2+', projects: 3 },
    { name: 'MongoDB', level: 75, icon: 'mongodb', category: 'databases', experience: '1+', projects: 2 },

    // Tools & DevOps
    { name: 'Git', level: 90, icon: 'git', category: 'tools', experience: '3+', projects: 15 },
    { name: 'Docker', level: 85, icon: 'docker', category: 'tools', experience: '2+', projects: 6 },
    { name: 'Jenkins', level: 75, icon: 'jenkins', category: 'tools', experience: '1+', projects: 3 },
    { name: 'Azure DevOps', level: 80, icon: 'azure', category: 'tools', experience: '2+', projects: 4 }
  ];

  categories: string[] = ['all', 'languages', 'frameworks', 'databases', 'tools'];
  selectedCategory: string = 'all';

  constructor(
    private translate: TranslateService,
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
    this.languageService.currentLanguage$.subscribe(() => {
      // Update any translated content if needed
    });
  }

  get filteredSkills(): Skill[] {
    if (this.selectedCategory === 'all') {
      return this.skills;
    }
    return this.skills.filter(skill => skill.category === this.selectedCategory);
  }

  getSkillIconClass(icon: string): string {
    return `devicon-${icon}-plain colored`;
  }

  getSkillLevel(level: number): string {
    if (level >= 90) return 'Expert';
    if (level >= 80) return 'Advanced';
    if (level >= 70) return 'Intermediate';
    return 'Beginner';
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'all':
        return 'fa-th-large';
      case 'languages':
        return 'fa-code';
      case 'frameworks':
        return 'fa-layer-group';
      case 'databases':
        return 'fa-database';
      case 'tools':
        return 'fa-tools';
      default:
        return 'fa-folder';
    }
  }

  formatExperience(experience: string): string {
    if (!experience) return '';
    const years = parseInt(experience);
    if (isNaN(years)) return '';
    return this.translate.instant(
      years > 1 ? 'SKILLS.EXPERIENCE.YEARS' : 'SKILLS.EXPERIENCE.YEAR'
    );
  }

  getCategoryStats(category: string): { total: number, avgLevel: number, totalProjects: number } {
    const categorySkills = category === 'all' 
      ? this.skills 
      : this.skills.filter(skill => skill.category === category);

    const total = categorySkills.length;
    const avgLevel = Math.round(categorySkills.reduce((acc, skill) => acc + skill.level, 0) / total);
    const totalProjects = categorySkills.reduce((acc, skill) => acc + (skill.projects || 0), 0);

    return { total, avgLevel, totalProjects };
  }
} 