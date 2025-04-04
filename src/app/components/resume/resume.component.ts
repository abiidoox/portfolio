import { Component } from '@angular/core';

@Component({
  selector: 'app-resume',
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.scss']
})
export class ResumeComponent {
  skills = {
    languages: ['C', 'C#', 'Java', 'Python', 'R', 'JavaScript', 'HTML', 'CSS'],
    frameworks: ['.NET core', 'JEE', 'Spring Boot', 'Bootstrap', 'React', 'Angular', 'React Native', 'FastApi'],
    databases: ['SQL Server', 'MySQL', 'T-SQL', 'PostgreSQL', 'MongoDB'],
    tools: ['Git', 'GitHub', 'GitLab', 'Docker', 'Docker Compose']
  };

  languages = ['Arabe', 'Français', 'Anglais'];
  certifications = ['Scrum Foundations'];
  
  experiences = [
    {
      title: 'Développeur Full Stack',
      company: 'Freelance',
      period: '11/2024 – 01/2025',
      responsibilities: [
        'Développement d\'une API REST avec FastAPI et intégration du modèle TinyLlama',
        'Création d\'une interface utilisateur en React.js pour l\'interaction avec l\'IA',
        'Conteneurisation et déploiement avec Docker'
      ],
      technologies: 'FastAPI, TinyLlama, Docker, React.js, GitHub'
    },
    {
      title: 'Ingénieur Full Stack, IoT et Machine Learning',
      company: 'Automize Technology — Stage PFE',
      period: '02/2024 – 07/2024',
      responsibilities: [
        'Développement d\'un système de reconnaissance faciale combinant IoT, machine learning, web et mobile',
        'Configuration de l\'ESP32-S3 pour le streaming RTSP/WebSocket et conception d\'une API REST avec Django',
        'Conversion des flux RTSP en HLS via FFmpeg, et mise en œuvre de la reconnaissance faciale avec ResNet/SCRFD',
        'Création d\'une application mobile pour le streaming et l\'authentification'
      ],
      technologies: 'ESP32-S3, Django, React Native, FFmpeg, ResNet, SCRFD, PostgreSQL, Redis, Ubuntu 22.04'
    },
    {
      title: 'Développeur Full Stack Java / Angular',
      company: 'Freelance',
      period: '06/2023 – 08/2023',
      responsibilities: [
        'Développement d\'une plateforme de recherche d\'emploi avec web scraping',
        'Création du backend avec Spring Boot et gestion de la sécurité avec Spring Security',
        'Développement du frontend en Angular pour une interface interactive'
      ],
      technologies: 'Java, Spring Boot, Spring Data, Spring Security, Thymeleaf, Bootstrap, Selenium, MySQL'
    },
    {
      title: 'Développeur C#/.Net',
      company: 'ISMA salé — Stage',
      period: '05/2022 – 07/2022',
      responsibilities: [
        'Développement d\'un module d\'automatisation de la génération des emplois du temps',
        'Tests, validation et formation des utilisateurs pour garantir une utilisation optimale'
      ],
      technologies: 'C#, ASP.NET, HTML, CSS, JavaScript, Bootstrap, SQL Server / T-sql'
    },
    {
      title: 'Développeur C#/.Net',
      company: 'ISMA salé — Stage',
      period: '07/2021 – 11/2021',
      responsibilities: [
        'Maintenance et amélioration du système de gestion des absences et plannings',
        'Optimisation et automatisation des processus dans la base de données'
      ],
      technologies: 'C#, ASP.NET, HTML, CSS, JavaScript, Bootstrap, SQL Server / T-sql'
    }
  ];

  education = [
    {
      degree: 'MASTER EN BIG DATA ET INTERNET DES OBJETS',
      institution: 'École nationale supérieure d\'arts et métiers',
      period: '11/2022 – 07/2024',
      location: 'CASABLANCA, Maroc'
    },
    {
      degree: 'Licence Professionnelle Logiciel et Développement Web',
      institution: 'Ecole normale supérieure Tetouan',
      period: '11/2021 – 07/2022',
      location: 'Tetouan, Maroc'
    },
    {
      degree: 'Technicien Spécialisé en Développement Informatique',
      institution: 'Institut Spécialisé de Technologie Appliquée',
      period: '09/2019 – 07/2021',
      location: 'RABAT, Maroc'
    }
  ];
}