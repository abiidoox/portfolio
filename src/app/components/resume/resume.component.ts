import { Component, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import {
  EXPERIENCE, EDUCATION, SKILL_GROUPS, pointKey,
  SOFT_SKILL_KEYS, LANGUAGE_KEYS, CERTIFICATION_KEYS,
  ExperienceEntry, EducationEntry, SkillTagGroup
} from '../../data/resume.data';

@Component({
  selector: 'app-resume',
  templateUrl: './resume.component.html'
})
export class ResumeComponent implements OnDestroy {
  readonly experience: ExperienceEntry[] = EXPERIENCE;
  readonly education: EducationEntry[] = EDUCATION;
  readonly skillGroups: SkillTagGroup[] = SKILL_GROUPS;
  readonly softSkillKeys = SOFT_SKILL_KEYS;
  readonly languageKeys = LANGUAGE_KEYS;
  readonly certificationKeys = CERTIFICATION_KEYS;

  /** Exposed so the template can build `POINTS.POINTn` paths without literals. */
  readonly pointKey = pointKey;

  /** Translated, comma-separated technology lists keyed by experience entry. */
  private techByKey = new Map<string, string[]>();

  private langSub?: Subscription;

  error = false;

  constructor(private translate: TranslateService) {
    this.resolveTechnologies();
    // Was never unsubscribed: every visit to /resume leaked a subscription and
    // left a language handler running against a destroyed component.
    this.langSub = this.translate.onLangChange.subscribe(() => this.resolveTechnologies());
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  private resolveTechnologies(): void {
    this.experience.forEach(e => {
      const raw = this.translate.instant(`RESUME.EXPERIENCE_ITEMS.${e.key}.TECHNOLOGIES`);
      const list = String(raw ?? '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      // The source data repeats a few technologies across points; show each once.
      this.techByKey.set(e.key, [...new Set(list)]);
    });
  }

  /** [0..count-1] so the template can loop without hardcoding bullet counts. */
  bulletIndexes(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i);
  }

  splitTech(key: string): string[] {
    return this.techByKey.get(key) ?? [];
  }

  onGlowMove(e: MouseEvent): void {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }

  downloadResume(): void {
    const filePath = 'assets/Abderrazzaq_El_Abdouni_CV.pdf';
    const fileName = 'Abderrazzaq_El_Abdouni_CV.pdf';

    fetch(filePath)
      .then(response => {
        if (!response.ok) throw new Error('CV not found');
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
        this.error = false;
      })
      .catch(() => {
        this.error = true;
      });
  }
}
