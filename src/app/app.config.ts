import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withXhr, withInterceptorsFromDi } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withPreloading, PreloadAllModules, withViewTransitions } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { ToastService } from './services/toast.service';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Native View Transitions between routes where supported. Custom timing
    // lives in styles.css; reduced-motion users get the default cross-fade.
    provideRouter(routes, withPreloading(PreloadAllModules), withViewTransitions({ skipInitialTransition: true })),
    provideAnimations(),
    ToastService,
    provideHttpClient(withXhr(), withInterceptorsFromDi()),
    provideTranslateService({ fallbackLang: 'en' }),
    provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' }),
    provideClientHydration()
  ]
};
