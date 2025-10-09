import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';

interface Project {
  title: string;
  description: string;
  technologies: string[];
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
        technologies: ['FastAPI', 'TinyLlama', 'React.js', 'Docker'],
        category: 'ai',
        featured: true,
        date: "2025"
      },
      {
        title: '',
        description: '',
        technologies: ["ESP32-S3", "Django", "React Native", "FFmpeg", "ResNet", "SCRFD"],
        category: "iot",
        featured: true,
        date: "2024"
      },
      {
        title: '',
        description: '',
        technologies: ["C#", "ASP.NET", "HTML", "CSS", "JavaScript", "Bootstrap", "SQL Server"],
        category: "web",
        featured: false,
        date: "2022"
      },
      {
        title: '',
        description: '',
        technologies: ["ASP.NET", "HTML", "CSS", "JavaScript", "SQL Server"],
        category: "web",
        featured: false,
        date: "2021"
      },
      {
        title: '',
        description: '',
        technologies: ["Python", "K-NN", "Decision Trees"],
        category: "ai",
        featured: false,
        date: "2023"
      },
      {
        title: '',
        description: '',
        technologies: ["Spring Boot", "Bootstrap", "chartjs", "HTML5", "Java", "Spring Data", "CSS", "Spring Security", "MySQL", "JavaScript", "Selenium"],
        category: "web",
        featured: true,
        date: "2023"
      },
      {
        title: '',
        description: '',
        technologies: ["Java", "Java Swing", "MySQL"],
        category: "desktop",
        featured: false,
        date: "2022"
      },
      {
        title: '',
        description: '',
        technologies: ["C#", "T-SQL", "Microsoft SQL Server"],
        category: "desktop",
        featured: false,
        date: "2021"
      },
      {
        title: '',
        description: '',
        technologies: ["Spring Boot", "Angular", "MySQL", "JPA/Hibernate", "RESTful API", "Spring Security"],
        category: "web",
        featured: true,
        date: "2025"
      }
    ];
    // Sort projects by date descending (most recent first)
    this.projects.sort((a, b) => Number(b.date) - Number(a.date));
    this.filteredProjects = [...this.projects];
  }

  updateProjectTranslations(): void {
    // AI Chat Assistant
    this.translate.get('PROJECTS.AI_CHAT.TITLE').subscribe((title: string) => {
      this.projects[0].title = title;
    });
    this.translate.get('PROJECTS.AI_CHAT.DESCRIPTION').subscribe((desc: string) => {
      this.projects[0].description = desc;
    });

    // Smart Face Recognition System
    this.translate.get('PROJECTS.FACE_RECOGNITION.TITLE').subscribe((title: string) => {
      this.projects[1].title = title;
    });
    this.translate.get('PROJECTS.FACE_RECOGNITION.DESCRIPTION').subscribe((desc: string) => {
      this.projects[1].description = desc;
    });

    // Schedule Management System
    this.translate.get('PROJECTS.SCHEDULE_SYSTEM.TITLE').subscribe((title: string) => {
      this.projects[2].title = title;
    });
    this.translate.get('PROJECTS.SCHEDULE_SYSTEM.DESCRIPTION').subscribe((desc: string) => {
      this.projects[2].description = desc;
    });

    // Maintenance and Improvement of School Information System
    this.translate.get('PROJECTS.SCHOOL_MANAGEMENT_APP.TITLE').subscribe((title: string) => {
      this.projects[3].title = title;
    });
    this.translate.get('PROJECTS.SCHOOL_MANAGEMENT_APP.DESCRIPTION').subscribe((desc: string) => {
      this.projects[3].description = desc;
    });

    // Email Spam Detection Model
    this.translate.get('PROJECTS.SPAM_DETECTION.TITLE').subscribe((title: string) => {
      this.projects[4].title = title;
    });
    this.translate.get('PROJECTS.SPAM_DETECTION.DESCRIPTION').subscribe((desc: string) => {
      this.projects[4].description = desc;
    });

    // Integrated Web Platform for Job and Internship Offers
    this.translate.get('PROJECTS.EMPLOYMENT_PLATFORM.TITLE').subscribe((title: string) => {
      this.projects[5].title = title;
    });
    this.translate.get('PROJECTS.EMPLOYMENT_PLATFORM.DESCRIPTION').subscribe((desc: string) => {
      this.projects[5].description = desc;
    });

    // School Management Application
    this.translate.get('PROJECTS.SCHOOL_MANAGEMENT_APP.TITLE').subscribe((title: string) => {
      this.projects[6].title = title;
    });
    this.translate.get('PROJECTS.SCHOOL_MANAGEMENT_APP.DESCRIPTION').subscribe((desc: string) => {
      this.projects[6].description = desc;
    });

    // Order and Stock Management Application for Opticians
    this.translate.get('PROJECTS.OPTICIAN_ORDER_STOCK.TITLE').subscribe((title: string) => {
      this.projects[7].title = title;
    });
    this.translate.get('PROJECTS.OPTICIAN_ORDER_STOCK.DESCRIPTION').subscribe((desc: string) => {
      this.projects[7].description = desc;
    });

    // Company Domiciliation Management Platform
    this.translate.get('PROJECTS.COMPANY_DOMICILIATION.TITLE').subscribe((title: string) => {
      this.projects[8].title = title;
    });
    this.translate.get('PROJECTS.COMPANY_DOMICILIATION.DESCRIPTION').subscribe((desc: string) => {
      this.projects[8].description = desc;
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