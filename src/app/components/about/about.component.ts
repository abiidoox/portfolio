import { Component, ElementRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastService } from '../../services/toast.service';
import { PROJECTS } from '../../data/projects.data';
import { SKILL_COUNT } from '../../data/skills.data';

const EMAIL = 'elabdouni.abderrazzaq@gmail.com';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/**
 * First professional role on the CV started 07/2021 (ISMA internship plus
 * freelance), so the span is derived from that date rather than guessed.
 */
const FIRST_ROLE = { year: 2021, month: 6 };
const CURRENT_YEAR = new Date().getFullYear();

interface StatItem {
  value: number;
  label: string;
}

interface FocusArea {
  key: string;
  icon: string;
}
interface StackLine {
  label: string;
  value: string;
}

interface CommitLine {
  hash: string;
  msg: string;
}

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html'
})
export class AboutComponent {
  emailCopied = false;

  // Counts are read from the shared data files so they can never drift out of
  // sync with the Skills page or the project list.
  readonly stats: StatItem[] = [
    { value: this.yearsOfExperience(), label: 'ABOUT.STATS.YEARS_EXPERIENCE' },
    { value: PROJECTS.length, label: 'ABOUT.STATS.PROJECTS' },
    { value: SKILL_COUNT, label: 'ABOUT.STATS.TECHNOLOGIES' }
  ];

  private yearsOfExperience(): number {
    const now = new Date();
    const months =
      (now.getFullYear() - FIRST_ROLE.year) * 12 + (now.getMonth() - FIRST_ROLE.month);
    return Math.max(1, Math.floor(months / 12));
  }

  readonly focusAreas: FocusArea[] = [
    { key: 'WEB', icon: 'fa-globe' },
    { key: 'AI', icon: 'fa-brain' },
    { key: 'MOBILE', icon: 'fa-mobile-screen-button' },
    { key: 'CLOUD', icon: 'fa-cloud' }
  ];

  readonly stackSummary: StackLine[] = [
    { label: 'ABOUT.STACK_KEYS.ROLE', value: 'ABOUT.ROLE' },
    { label: 'ABOUT.STACK_KEYS.BASED', value: 'ABOUT.LOCATION' },
    { label: 'ABOUT.STACK_KEYS.STACK', value: 'ABOUT.STACK_VALUES.WEB' },
    { label: 'ABOUT.STACK_KEYS.DATA', value: 'ABOUT.STACK_VALUES.DATA' },
    { label: 'ABOUT.STACK_KEYS.OPS', value: 'ABOUT.STACK_VALUES.OPS' }
  ];

  // Real commits from this repository — verified via `git log`.
  readonly commitLines: CommitLine[] = [
    { hash: '43011fa', msg: 'fix: floating chips frozen by reduced-motion rule' },
    { hash: 'bd2283c', msg: 'feat: add salary advance module to INRA resume' },
    { hash: 'fe318c9', msg: 'fix: translation bugs, modal visibility, a11y' }
  ];

  constructor(
    private elRef: ElementRef,
    private translate: TranslateService,
    private toast: ToastService
  ) {}

  /** Feeds the pointer-following glow in .lab-glow-hover via --mx/--my. */
  onGlowMove(e: MouseEvent): void {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }

  /** Subtle terminal tilt; disabled for touch and reduced-motion users. */
  onTerminalMove(e: MouseEvent): void {
    if (window.matchMedia(`${REDUCED_MOTION}, not (hover: hover) and (pointer: fine)`).matches) return;
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1200px) rotateY(${px * 3.5}deg) rotateX(${-py * 3.5}deg)`;
  }

  /** Returns the terminal to rest once the pointer leaves. */
  onTerminalLeave(e: MouseEvent): void {
    (e.currentTarget as HTMLElement).style.transform = '';
  }

  copyEmail(): void {
    navigator.clipboard.writeText(EMAIL).then(() => {
      this.emailCopied = true;
      this.translate.get('TOAST.EMAIL_COPIED').subscribe(msg => this.toast.success(msg));
      setTimeout(() => (this.emailCopied = false), 2000);
    }).catch(() => {
      this.translate.get('TOAST.EMAIL_COPY_FAILED').subscribe(msg => this.toast.error(msg));
    });
  }
}
