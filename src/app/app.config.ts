import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withXhr, withInterceptorsFromDi } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { ToastService } from './services/toast.service';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    ToastService,
    provideHttpClient(withXhr(), withInterceptorsFromDi()),
    provideTranslateService({ fallbackLang: 'en' }),
    provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' }),
    provideClientHydration()
  ]
};
