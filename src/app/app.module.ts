import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderModule } from './components/header/header.module';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { FormsModule } from '@angular/forms';
import { ThemeSwitcherModule } from './components/theme-switcher/theme-switcher.module';
import { LanguageSwitcherModule } from './components/language-switcher/language-switcher.module';

// Import all new components
import { SkillsComponent } from './components/skills/skills.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { FooterComponent } from './components/shared/footer/footer.component';
import { ParticlesBackgroundComponent } from './components/shared/particles-background/particles-background.component';
import { ScrollProgressComponent } from './components/shared/scroll-progress/scroll-progress.component';
import { BackToTopComponent } from './components/shared/back-to-top/back-to-top.component';
import { TerminalIntroComponent } from './components/shared/terminal-intro/terminal-intro.component';
import { ToastContainerComponent } from './components/shared/toast-container/toast-container.component';
import { ToastService } from './services/toast.service';
import { ScrollRevealDirective } from './directives/scroll-reveal.directive';
import { CountUpDirective } from './directives/count-up.directive';
import { ProjectModalModule } from './components/shared/project-modal/project-modal.module';

// Factory function for TranslateHttpLoader
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    SkillsComponent,
    NotFoundComponent,
    FooterComponent,
    ParticlesBackgroundComponent,
    ScrollProgressComponent,
    BackToTopComponent,
    TerminalIntroComponent,
    ToastContainerComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HeaderModule,
    HttpClientModule,
    FormsModule,
    ThemeSwitcherModule,
    LanguageSwitcherModule,
    ScrollRevealDirective,
    CountUpDirective,
    ProjectModalModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [ToastService],
  bootstrap: [AppComponent]
})
export class AppModule { }
