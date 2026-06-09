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
  error = false;

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
    // In production we ship a single CV file under assets (cv.pdf).
    // If you want per-language resumes, add them under `src/assets/resumes/` and
    // update this method accordingly.
    const filePath = 'assets/cv.pdf';
    const fileName = 'cv.pdf';

    const link = document.createElement('a');
    link.href = filePath;
    link.download = fileName;

    // Try to fetch first to provide a nicer error when file is missing
    fetch(filePath)
      .then(response => {
        if (!response.ok) {
          throw new Error('CV not found');
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
        console.error('Error downloading CV:', error);
        // Optionally surface a user-visible message here instead of silent failure
        this.error = true;
      });
  }
}