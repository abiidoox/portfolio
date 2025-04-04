import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./components/about/about.module').then(m => m.AboutModule)
  },
  {
    path: 'about',
    loadChildren: () => import('./components/about/about.module').then(m => m.AboutModule)
  },
  {
    path: 'projects',
    loadChildren: () => import('./components/projects/projects.module').then(m => m.ProjectsModule)
  },
  {
    path: 'resume',
    loadChildren: () => import('./components/resume/resume.module').then(m => m.ResumeModule)
  },
  {
    path: 'contact',
    loadChildren: () => import('./components/contact/contact.module').then(m => m.ContactModule)
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
