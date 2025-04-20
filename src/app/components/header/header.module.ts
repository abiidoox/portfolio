import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
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
    TranslateModule.forChild(),
    ThemeSwitcherModule,
    LanguageSwitcherModule
  ],
  exports: [
    HeaderComponent
  ]
})
export class HeaderModule { }