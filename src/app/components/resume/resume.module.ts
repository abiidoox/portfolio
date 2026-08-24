import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ResumeComponent } from './resume.component';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  { path: '', component: ResumeComponent }
];

@NgModule({
  declarations: [ResumeComponent],
  imports: [
    ScrollRevealDirective,
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule
  ]
})
export class ResumeModule { }
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';