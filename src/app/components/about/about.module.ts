import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about.component';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { CountUpDirective } from '../../directives/count-up.directive';
import { MagneticDirective } from '../../directives/magnetic.directive';
import { SplitTextDirective } from '../../directives/split-text.directive';

const routes: Routes = [
  { path: '', component: AboutComponent }
];

@NgModule({
  declarations: [AboutComponent],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule.forChild(routes),
    ScrollRevealDirective,
    CountUpDirective,
    MagneticDirective,
    SplitTextDirective
  ]
})
export class AboutModule { }