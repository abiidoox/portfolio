import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';

interface Project {
  title: string;
  description: string;
  image: string;
  technologies: string[];
  demoUrl?: string;
  githubUrl?: string;
  category: string;
  featured: boolean;
  date: string;
}

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  categories: string[] = ['all', 'web', 'mobile', 'ai', 'iot'];
  selectedCategory: string = 'all';

  constructor(
    private translate: TranslateService,
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
    this.initializeProjects();
    this.updateProjectTranslations();
    
    this.languageService.currentLanguage$.subscribe(() => {
      this.updateProjectTranslations();
    });
  }

  initializeProjects(): void {
    this.projects = [
      {
        title: '',
        description: '',
        image: 'assets/projects/ai-chat.jpg',
        technologies: ['FastAPI', 'TinyLlama', 'React.js', 'Docker'],
        demoUrl: 'https://demo.example.com',
        githubUrl: 'https://github.com/yourusername/ai-chat',
        category: 'ai',
        featured: true,
        date: '2024'
      },
      {
        title: '',
        description: '',
        image: 'assets/projects/face-recognition.jpg',
        technologies: ['ESP32-S3', 'Django', 'React Native', 'FFmpeg', 'ResNet', 'SCRFD'],
        demoUrl: 'https://demo.example.com',
        githubUrl: 'https://github.com/yourusername/face-recognition',
        category: 'iot',
        featured: true,
        date: '2024'
      },
      {
        title: '',
        description: '',
        image: 'assets/projects/job-platform.jpg',
        technologies: ['Java', 'Spring Boot', 'Angular', 'MySQL', 'Selenium'],
        demoUrl: 'https://demo.example.com',
        githubUrl: 'https://github.com/yourusername/job-platform',
        category: 'web',
        featured: false,
        date: '2023'
      },
      {
        title: '',
        description: '',
        image: 'assets/projects/schedule-system.jpg',
        technologies: ['C#', 'ASP.NET', 'SQL Server', 'Bootstrap'],
        demoUrl: 'https://demo.example.com',
        githubUrl: 'https://github.com/yourusername/schedule-system',
        category: 'web',
        featured: false,
        date: '2022'
      }
    ];
    this.filteredProjects = [...this.projects];
  }

  updateProjectTranslations(): void {
    // Update project 1 (AI Chat)
    this.translate.get('PROJECTS.AI_CHAT.TITLE').subscribe((title: string) => {
      this.projects[0].title = title;
    });
    this.translate.get('PROJECTS.AI_CHAT.DESCRIPTION').subscribe((desc: string) => {
      this.projects[0].description = desc;
    });
    
    // Update project 2 (Face Recognition)
    this.translate.get('PROJECTS.FACE_RECOGNITION.TITLE').subscribe((title: string) => {
      this.projects[1].title = title;
    });
    this.translate.get('PROJECTS.FACE_RECOGNITION.DESCRIPTION').subscribe((desc: string) => {
      this.projects[1].description = desc;
    });

    // Update project 3 (Job Platform)
    this.translate.get('PROJECTS.JOB_PLATFORM.TITLE').subscribe((title: string) => {
      this.projects[2].title = title;
    });
    this.translate.get('PROJECTS.JOB_PLATFORM.DESCRIPTION').subscribe((desc: string) => {
      this.projects[2].description = desc;
    });

    // Update project 4 (Schedule System)
    this.translate.get('PROJECTS.SCHEDULE_SYSTEM.TITLE').subscribe((title: string) => {
      this.projects[3].title = title;
    });
    this.translate.get('PROJECTS.SCHEDULE_SYSTEM.DESCRIPTION').subscribe((desc: string) => {
      this.projects[3].description = desc;
    });
  }

  filterProjects(category: string): void {
    this.selectedCategory = category;
    if (category === 'all') {
      this.filteredProjects = [...this.projects];
    } else {
      this.filteredProjects = this.projects.filter(project => project.category === category);
    }
  }
}