import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-resume',
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.scss']
})
export class ResumeComponent implements OnInit {
  constructor(
    private translate: TranslateService,
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
    // Initialize any language-dependent content
  }

  downloadResume(): void {
    // Get current language and download appropriate resume
    const lang = this.languageService.getCurrentLanguage();
    const resumeFile = lang === 'fr' ? 'resume_fr.pdf' : 'resume_en.pdf';
    
    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = `assets/${resumeFile}`;
    link.download = resumeFile;
    link.click();
  }
}