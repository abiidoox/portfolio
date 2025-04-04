import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
  projects = [
    {
      title: '',
      description: '',
      image: 'assets/project1.jpg',
      technologies: ['Angular', 'Node.js', 'MongoDB', 'Express'],
      demoUrl: 'https://demo.example.com',
      githubUrl: 'https://github.com/yourusername/project'
    },
    {
      title: '',
      description: '',
      image: 'assets/project2.jpg',
      technologies: ['React', 'Firebase', 'Material-UI'],
      demoUrl: 'https://demo.example.com',
      githubUrl: 'https://github.com/yourusername/project'
    },
    // Add more projects as needed
  ];

  constructor(
    private translate: TranslateService,
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
    // Initial translation
    this.updateProjectTranslations();
    
    // Subscribe to language changes
    this.languageService.currentLanguage$.subscribe(() => {
      this.updateProjectTranslations();
    });
  }

  updateProjectTranslations(): void {
    // Update project 1
    this.translate.get('PROJECTS.PROJECT1.TITLE').subscribe((title: string) => {
      this.projects[0].title = title;
    });
    this.translate.get('PROJECTS.PROJECT1.DESCRIPTION').subscribe((desc: string) => {
      this.projects[0].description = desc;
    });
    
    // Update project 2
    this.translate.get('PROJECTS.PROJECT2.TITLE').subscribe((title: string) => {
      this.projects[1].title = title;
    });
    this.translate.get('PROJECTS.PROJECT2.DESCRIPTION').subscribe((desc: string) => {
      this.projects[1].description = desc;
    });
  }
}