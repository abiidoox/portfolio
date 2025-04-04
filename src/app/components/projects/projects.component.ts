import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
  projects = [
    {
      title: 'E-Commerce Platform',
      description: 'A full-stack e-commerce platform built with Angular and Node.js',
      image: 'assets/project1.jpg',
      technologies: ['Angular', 'Node.js', 'MongoDB', 'Express'],
      demoUrl: 'https://demo.example.com',
      githubUrl: 'https://github.com/yourusername/project'
    },
    {
      title: 'Task Management App',
      description: 'A responsive task management application with real-time updates',
      image: 'assets/project2.jpg',
      technologies: ['React', 'Firebase', 'Material-UI'],
      demoUrl: 'https://demo.example.com',
      githubUrl: 'https://github.com/yourusername/project'
    },
    // Add more projects as needed
  ];

  constructor() { }

  ngOnInit(): void {
  }
}