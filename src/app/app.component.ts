import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './services/language.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private mouseHandler?: (e: MouseEvent) => void;

  constructor(
    private translate: TranslateService,
    private languageService: LanguageService,
    private zone: NgZone
  ) {
    // Initialize translations
    translate.addLangs(['en', 'es', 'fr']);
    translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    this.languageService.currentLanguage$.subscribe(lang => {
      document.documentElement.lang = lang;
    });

    // Mouse-follow glow (runs outside Angular for performance)
    const glow = document.querySelector('.mouse-glow');
    if (glow && window.matchMedia('(pointer: fine)').matches) {
      this.zone.runOutsideAngular(() => {
        this.mouseHandler = (e: MouseEvent) => {
          (glow as HTMLElement).style.left = e.clientX + 'px';
          (glow as HTMLElement).style.top = e.clientY + 'px';
        };
        window.addEventListener('mousemove', this.mouseHandler!);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.mouseHandler) {
      window.removeEventListener('mousemove', this.mouseHandler);
    }
  }
}
