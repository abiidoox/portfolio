import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SkillsComponent } from './components/skills/skills.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./components/about/about.module').then(m => m.AboutModule),
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
    loadChildren: () => import('./components/about/about.module').then(m => m.AboutModule),
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
    loadChildren: () => import('./components/projects/projects.module').then(m => m.ProjectsModule),
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
    path: 'resume',
    loadChildren: () => import('./components/resume/resume.module').then(m => m.ResumeModule),
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
    loadChildren: () => import('./components/contact/contact.module').then(m => m.ContactModule),
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
    component: SkillsComponent,
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
    component: NotFoundComponent,
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

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
