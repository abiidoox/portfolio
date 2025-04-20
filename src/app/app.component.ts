import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './services/language.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private translate: TranslateService,
    private languageService: LanguageService
  ) {
    // Initialize translations
    translate.addLangs(['en', 'es', 'fr']);
    translate.setDefaultLang('en');

    // Language will be initialized by the LanguageService
    // which handles saved preferences and browser language
  }

  ngOnInit(): void {
    // Subscribe to language changes
    this.languageService.currentLanguage$.subscribe(lang => {
      document.documentElement.lang = lang;
    });
  }
}
