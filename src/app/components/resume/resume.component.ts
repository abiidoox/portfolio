import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';

interface ResumeData {
  title: string;
  subtitle: string;
  description: string;
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
  };
  experience: {
    title: string;
    items: Array<{
      title: string;
      period: string;
      subtitle: string;
      points: string[];
      technologies: string;
    }>;
  };
  education: {
    title: string;
    items: Array<{
      title: string;
      period: string;
      institution: string;
    }>;
  };
  skills: {
    title: string;
    categories: {
      languages: string;
      frameworks: string;
      databases: string;
      tools: string;
      softSkills: string;
    };
  };
  languages: {
    title: string;
    items: {
      arabic: string;
      french: string;
      english: string;
    };
  };
  certifications: {
    title: string;
    items: {
      scrum: string;
    };
  };
  download: string;
}

@Component({
  selector: 'app-resume',
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.scss']
})
export class ResumeComponent implements OnInit, OnDestroy {
  private langSubscription!: Subscription;
  resumeData!: ResumeData;

  constructor(
    private translate: TranslateService,
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
    // Initial load of translations
    this.updateTranslations();

    // Subscribe to language changes
    this.langSubscription = this.languageService.currentLanguage$.subscribe(() => {
      this.updateTranslations();
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  private updateTranslations(): void {
    // Update all translations when language changes
    this.translate.get('RESUME').subscribe((res: ResumeData) => {
      this.resumeData = res;
    });
  }

  downloadResume(): void {
    // Get current language and download appropriate resume
    const lang = this.languageService.getCurrentLanguage();
    let resumeFile: string;
    
    // Select resume file based on language
    switch (lang) {
      case 'fr':
        resumeFile = 'resume_fr.pdf';
        break;
      case 'es':
        resumeFile = 'resume_es.pdf';
        break;
      default:
        resumeFile = 'resume_en.pdf';
        break;
    }
    
    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = `assets/resumes/${resumeFile}`;
    link.download = resumeFile;
    
    // Add error handling for file not found
    fetch(link.href)
      .then(response => {
        if (!response.ok) {
          throw new Error('Resume not found');
        }
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Error downloading resume:', error);
        // Fallback to English version if the specific language version is not found
        if (lang !== 'en') {
          console.log('Falling back to English resume');
          const fallbackLink = document.createElement('a');
          fallbackLink.href = 'assets/resumes/resume_en.pdf';
          fallbackLink.download = 'resume_en.pdf';
          fallbackLink.click();
        }
      });
  }
}