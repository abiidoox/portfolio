import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ProjectsComponent } from './projects.component';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  { path: '', component: ProjectsComponent }
];

@NgModule({
  declarations: [ProjectsComponent],
  imports: [
    ScrollRevealDirective,
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule
  ]
})
export class ProjectsModule { }
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';