import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/about/about.component').then(m => m.AboutComponent),
    data: {
      animation: 'about',
      title: 'ABOUT.TITLE',
      meta: [
        { name: 'description', content: 'ABOUT.META_DESCRIPTION' },
        { property: 'og:description', content: 'ABOUT.OG_DESCRIPTION' }
      ]
    }
  },
  {
    path: 'about',
    loadComponent: () => import('./components/about/about.component').then(m => m.AboutComponent),
    data: {
      animation: 'about',
      title: 'ABOUT.TITLE',
      meta: [
        { name: 'description', content: 'ABOUT.META_DESCRIPTION' },
        { property: 'og:description', content: 'ABOUT.OG_DESCRIPTION' }
      ]
    }
  },
  {
    path: 'projects',
    loadComponent: () => import('./components/projects/projects.component').then(m => m.ProjectsComponent),
    data: {
      animation: 'projects',
      title: 'PROJECTS.TITLE',
      meta: [
        { name: 'description', content: 'PROJECTS.META_DESCRIPTION' },
        { property: 'og:description', content: 'PROJECTS.OG_DESCRIPTION' }
      ]
    }
  },
  {
    // Runtime copy is published via SeoService.setOverride by the component.
    path: 'projects/:key',
    loadComponent: () => import('./components/project-detail/project-detail.component').then(m => m.ProjectDetailComponent),
    data: {
      animation: 'projects',
      title: 'PROJECTS.TITLE',
      meta: [
        { name: 'description', content: 'PROJECTS.META_DESCRIPTION' },
        { property: 'og:description', content: 'PROJECTS.OG_DESCRIPTION' }
      ]
    }
  },
  {
    path: 'notes',
    loadComponent: () => import('./components/notes/notes.component').then(m => m.NotesComponent),
    data: {
      animation: 'notes',
      title: 'NOTES.TITLE',
      meta: [
        { name: 'description', content: 'NOTES.META_DESCRIPTION' },
        { property: 'og:description', content: 'NOTES.OG_DESCRIPTION' }
      ]
    }
  },
  {
    // Runtime copy is published via SeoService.setOverride by the component.
    path: 'notes/:key',
    loadComponent: () => import('./components/note-detail/note-detail.component').then(m => m.NoteDetailComponent),
    data: {
      animation: 'notes',
      title: 'NOTES.TITLE',
      meta: [
        { name: 'description', content: 'NOTES.META_DESCRIPTION' },
        { property: 'og:description', content: 'NOTES.OG_DESCRIPTION' }
      ]
    }
  },
  {
    path: 'resume',
    loadComponent: () => import('./components/resume/resume.component').then(m => m.ResumeComponent),
    data: {
      animation: 'resume',
      title: 'RESUME.TITLE',
      meta: [
        { name: 'description', content: 'RESUME.META_DESCRIPTION' },
        { property: 'og:description', content: 'RESUME.OG_DESCRIPTION' }
      ]
    }
  },
  {
    path: 'contact',
    loadComponent: () => import('./components/contact/contact.component').then(m => m.ContactComponent),
    data: {
      animation: 'contact',
      title: 'CONTACT.TITLE',
      meta: [
        { name: 'description', content: 'CONTACT.META_DESCRIPTION' },
        { property: 'og:description', content: 'CONTACT.OG_DESCRIPTION' }
      ]
    }
  },
  {
    path: 'skills',
    loadComponent: () => import('./components/skills/skills.component').then(m => m.SkillsComponent),
    data: {
      animation: 'skills',
      title: 'SKILLS.TITLE',
      meta: [
        { name: 'description', content: 'SKILLS.META_DESCRIPTION' },
        { property: 'og:description', content: 'SKILLS.OG_DESCRIPTION' }
      ]
    }
  },
  {
    path: '404',
    loadComponent: () => import('./components/not-found/not-found.component').then(m => m.NotFoundComponent),
    data: {
      animation: '404',
      title: 'NOT_FOUND.TITLE',
      meta: [
        { name: 'description', content: 'NOT_FOUND.META_DESCRIPTION' },
        { property: 'og:description', content: 'NOT_FOUND.OG_DESCRIPTION' }
      ]
    }
  },
  { path: '**', redirectTo: '404' }
];
