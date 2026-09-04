import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { ProjectModalService } from '../../services/project-modal.service';
import { forkJoin, Subscription } from 'rxjs';

interface Project {
  key: string;
  title: string;
  description: string;
  longDescription?: string;
  technologies: string[];
  category: string;
  featured: boolean;
  date: string;
  links?: { label: string; url: string; icon: string }[];
}

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit, OnDestroy {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  categories: string[] = ['all', 'web', 'mobile', 'desktop', 'ai', 'iot'];
  selectedCategory: string = 'all';

  constructor(
    private translate: TranslateService,
    private languageService: LanguageService,
    private projectModalService: ProjectModalService
  ) { }

  private langSub?: Subscription;

  ngOnInit(): void {
    this.initializeProjects();
    this.updateProjectTranslations();

    this.langSub = this.translate.onLangChange.subscribe(() => {
      this.updateProjectTranslations();
    });
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  initializeProjects(): void {
    this.projects = [
      {
        key: 'AI_CHAT',
        title: 'AI Chat Assistant',
        description: 'A conversational AI assistant built with FastAPI and TinyLlama',
        longDescription: 'PROJECTS.AI_CHAT.LONG_DESCRIPTION',
        technologies: ['FastAPI', 'TinyLlama', 'React.js', 'Docker'],
        category: 'ai',
        featured: true,
        date: "2025",
        links: [
          { label: 'GitHub', url: 'https://github.com/abiidoox', icon: 'fab fa-github' }
        ]
      },
      {
        key: 'FACE_RECOGNITION',
        title: 'Smart Face Recognition System',
        description: 'An IoT-based facial recognition system using ESP32-S3, Django, and React Native',
        longDescription: 'PROJECTS.FACE_RECOGNITION.LONG_DESCRIPTION',
        technologies: ["ESP32-S3", "Django", "React Native", "FFmpeg", "ResNet", "SCRFD"],
        category: "iot",
        featured: true,
        date: "2024",
        links: [
          { label: 'GitHub', url: 'https://github.com/abiidoox', icon: 'fab fa-github' }
        ]
      },
      {
        key: 'SCHEDULE_SYSTEM',
        title: 'Schedule Management System',
        description: 'A comprehensive schedule management system developed with ASP.NET and SQL Server',
        longDescription: 'PROJECTS.SCHEDULE_SYSTEM.LONG_DESCRIPTION',
        technologies: ["C#", "ASP.NET", "HTML", "CSS", "JavaScript", "Bootstrap", "SQL Server"],
        category: "web",
        featured: false,
        date: "2022",
        links: [
          { label: 'GitHub', url: 'https://github.com/abiidoox', icon: 'fab fa-github' }
        ]
      },
      {
        key: 'SCHOOL_MANAGEMENT_APP',
        title: 'School Management Application',
        description: 'A complete and user-friendly school management application',
        longDescription: 'PROJECTS.SCHOOL_MANAGEMENT_APP.LONG_DESCRIPTION',
        technologies: ["ASP.NET", "HTML", "CSS", "JavaScript", "SQL Server"],
        category: "web",
        featured: false,
        date: "2021"
      },
      {
        key: 'SPAM_DETECTION',
        title: 'Email Spam Detection Model',
        description: 'A machine learning model to classify emails as spam or legitimate',
        longDescription: 'PROJECTS.SPAM_DETECTION.LONG_DESCRIPTION',
        technologies: ["Python", "K-NN", "Decision Trees"],
        category: "ai",
        featured: false,
        date: "2023",
        links: [
          { label: 'GitHub', url: 'https://github.com/abiidoox', icon: 'fab fa-github' }
        ]
      },
      {
        key: 'EMPLOYMENT_PLATFORM',
        title: 'Integrated Web Platform for Job and Internship Offers',
        description: 'A web platform dedicated to job and internship offers using web scraping',
        longDescription: 'PROJECTS.EMPLOYMENT_PLATFORM.LONG_DESCRIPTION',
        technologies: ["Spring Boot", "Bootstrap", "chartjs", "HTML5", "Java", "Spring Data", "CSS", "Spring Security", "MySQL", "JavaScript", "Selenium"],
        category: "web",
        featured: true,
        date: "2023",
        links: [
          { label: 'GitHub', url: 'https://github.com/abiidoox', icon: 'fab fa-github' }
        ]
      },
      {
        key: 'SCHOOL_MANAGEMENT_APP_2',
        title: 'School Management Desktop App',
        description: 'A Java Swing desktop application for managing school records',
        longDescription: 'PROJECTS.SCHOOL_MANAGEMENT_APP_2.LONG_DESCRIPTION',
        technologies: ["Java", "Java Swing", "MySQL"],
        category: "desktop",
        featured: false,
        date: "2022"
      },
      {
        key: 'OPTICIAN_ORDER_STOCK',
        title: 'Order and Stock Management Application for Opticians',
        description: 'Software for managing orders and inventory in an optical store',
        longDescription: 'PROJECTS.OPTICIAN_ORDER_STOCK.LONG_DESCRIPTION',
        technologies: ["C#", "T-SQL", "Microsoft SQL Server"],
        category: "desktop",
        featured: false,
        date: "2021"
      },
      {
        key: 'COMPANY_DOMICILIATION',
        title: 'Company Domiciliation Management Platform',
        description: 'Web platform for complete management of company domiciliation',
        longDescription: 'PROJECTS.COMPANY_DOMICILIATION.LONG_DESCRIPTION',
        technologies: ["Spring Boot", "Angular", "MySQL", "JPA/Hibernate", "RESTful API", "Spring Security"],
        category: "web",
        featured: true,
        date: "2025",
        links: [
          { label: 'GitHub', url: 'https://github.com/abiidoox', icon: 'fab fa-github' }
        ]
      }
    ];
    // Sort projects by date descending (most recent first)
    this.projects.sort((a, b) => Number(b.date) - Number(a.date));
    this.filteredProjects = [...this.projects];
  }

  updateProjectTranslations(): void {
    const keys = this.projects.map(p => p.key);

    const translationObservables = keys.flatMap(key => [
      this.translate.get(`PROJECTS.${key}.TITLE`),
      this.translate.get(`PROJECTS.${key}.DESCRIPTION`),
      this.translate.get(`PROJECTS.${key}.LONG_DESCRIPTION`)
    ]);

    forkJoin(translationObservables).subscribe({
      next: (translations) => {
        this.projects.forEach((project, i) => {
          const base = i * 3;
          project.title = translations[base] || project.title;
          project.description = translations[base + 1] || project.description;
          project.longDescription = translations[base + 2] || project.longDescription;
        });
        this.filterProjects(this.selectedCategory);
      },
      error: () => {}
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

  openModal(project: Project): void {
    this.projectModalService.open(project);
  }

  closeModal(): void {
    this.projectModalService.close();
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'web': return 'fa-globe';
      case 'mobile': return 'fa-mobile-screen-button';
      case 'ai': return 'fa-brain';
      case 'iot': return 'fa-microchip';
      case 'desktop': return 'fa-desktop';
      default: return 'fa-code';
    }
  }
}