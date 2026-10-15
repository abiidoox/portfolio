import { enableProdMode } from '@angular/core';

import { environment } from './environments/environment';
import { ToastService } from './app/services/toast.service';
import { provideHttpClient, withXhr, withInterceptorsFromDi } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        provideRouter(routes),
        provideAnimations(),
        ToastService,
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideTranslateService({ fallbackLang: 'en' }),
        provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' })
    ]
})
  .catch(err => console.error(err));
