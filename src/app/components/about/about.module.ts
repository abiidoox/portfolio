import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about.component';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { CountUpDirective } from '../../directives/count-up.directive';
import { WordRotatorComponent } from '../../components/shared/word-rotator/word-rotator.component';

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
    WordRotatorComponent
  ]
})
export class AboutModule { }