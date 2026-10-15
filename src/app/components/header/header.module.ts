import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { HeaderComponent } from './header.component';
import { ThemeSwitcherModule } from '../theme-switcher/theme-switcher.module';
import { LanguageSwitcherModule } from '../language-switcher/language-switcher.module';

@NgModule({
  declarations: [
    HeaderComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    TranslatePipe,
    ThemeSwitcherModule,
    LanguageSwitcherModule
  ],
  exports: [
    HeaderComponent
  ]
})
export class HeaderModule { }