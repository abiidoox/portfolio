import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ProjectsComponent } from './projects.component';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { SplitTextDirective } from '../../directives/split-text.directive';
import { ProjectModalModule } from '../../components/shared/project-modal/project-modal.module';

const routes: Routes = [
  { path: '', component: ProjectsComponent }
];

@NgModule({
  declarations: [ProjectsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule,
    ScrollRevealDirective,
    SplitTextDirective,
    ProjectModalModule
  ]
})
export class ProjectsModule { }