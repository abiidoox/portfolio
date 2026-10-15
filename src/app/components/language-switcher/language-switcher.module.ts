import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from './language-switcher.component';

@NgModule({
  declarations: [
    LanguageSwitcherComponent
  ],
  imports: [
    CommonModule,
    TranslatePipe
  ],
  exports: [
    LanguageSwitcherComponent
  ]
})
export class LanguageSwitcherModule { } 