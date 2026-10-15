import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { ThemeSwitcherComponent } from './theme-switcher.component';

@NgModule({
  declarations: [
    ThemeSwitcherComponent
  ],
  imports: [
    CommonModule,
    TranslatePipe
  ],
  exports: [
    ThemeSwitcherComponent
  ]
})
export class ThemeSwitcherModule { } 