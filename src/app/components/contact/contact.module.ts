import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ContactComponent } from './contact.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { MagneticDirective } from '../../directives/magnetic.directive';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

const routes: Routes = [
  { path: '', component: ContactComponent }
];

@NgModule({
  declarations: [ContactComponent],
  imports: [
    ScrollRevealDirective,
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    TranslatePipe,
    MagneticDirective
  ]
})
export class ContactModule { }