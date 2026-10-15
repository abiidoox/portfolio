import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ResumeComponent } from './resume.component';
import { TranslatePipe } from '@ngx-translate/core';
import { MagneticDirective } from '../../directives/magnetic.directive';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

const routes: Routes = [
  { path: '', component: ResumeComponent }
];

@NgModule({
  declarations: [ResumeComponent],
  imports: [
    ScrollRevealDirective,
    CommonModule,
    RouterModule.forChild(routes),
    TranslatePipe,
    MagneticDirective
  ]
})
export class ResumeModule { }