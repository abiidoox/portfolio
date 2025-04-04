import { Component, OnInit } from '@angular/core';
import { LanguageService } from './services/language.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'portfolio-website';

  constructor(
    private languageService: LanguageService,
    private translate: TranslateService
  ) {
    // Define the languages we support
    translate.addLangs(['en', 'fr']);
    
    // Set the default language
    translate.setDefaultLang('fr');
  }

  ngOnInit(): void {
    // The language service will handle setting the initial language
  }
}
