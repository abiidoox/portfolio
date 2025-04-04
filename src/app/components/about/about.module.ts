import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about.component';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  { path: '', component: AboutComponent }
];

@NgModule({
  declarations: [AboutComponent],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule.forChild(routes)
  ]
})
export class AboutModule { }