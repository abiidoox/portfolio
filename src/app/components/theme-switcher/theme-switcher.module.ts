import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeSwitcherComponent } from './theme-switcher.component';

@NgModule({
  declarations: [
    ThemeSwitcherComponent
  ],
  imports: [
    CommonModule,
    TranslateModule
  ],
  exports: [
    ThemeSwitcherComponent
  ]
})
export class ThemeSwitcherModule { } 