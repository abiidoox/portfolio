import {
  Component, HostListener, Input, Output, EventEmitter,
  ElementRef, AfterViewInit, NgZone
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export interface ProjectModalData {
  title: string;
  description: string;
  longDescription?: string;
  technologies: string[];
  category: string;
  featured: boolean;
  date: string;
  links?: { labelKey: string; url: string; icon: string }[];
}

@Component({
  selector: 'app-project-modal',
  templateUrl: './project-modal.component.html'
})
export class ProjectModalComponent implements AfterViewInit {
  @Input() project: ProjectModalData | null = null;
  @Output() closeRequest = new EventEmitter<void>();

  private previouslyFocused: HTMLElement | null = null;

  constructor(
    private translate: TranslateService,
    private elRef: ElementRef<HTMLElement>,
    private zone: NgZone
  ) {}

  ngAfterViewInit(): void {
    // Remember the trigger so focus can be restored on close.
    this.previouslyFocused = document.activeElement as HTMLElement | null;
    // Move focus into the dialog for keyboard and screen-reader users.
    setTimeout(() => this.elRef.nativeElement.querySelector<HTMLElement>('.pm-close')?.focus(), 40);
    document.body.style.overflow = 'hidden';
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.close();
  }

  /** Traps Tab inside the dialog so focus cannot escape to the page behind. */
  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;
    const focusables = this.elRef.nativeElement.querySelectorAll<HTMLElement>(
      'button, a[href], [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  close(): void {
    document.body.style.overflow = '';
    this.previouslyFocused?.focus?.();
    this.closeRequest.emit();
  }

  getCategoryLabel(): string {
    if (!this.project?.category) return '';
    return this.translate.instant('PROJECTS.CATEGORIES.' + this.project.category.toUpperCase());
  }

  categoryIcon(category: string): string {
    switch (category) {
      case 'web': return 'fa-globe';
      case 'mobile': return 'fa-mobile-screen-button';
      case 'ai': return 'fa-brain';
      case 'iot': return 'fa-microchip';
      case 'desktop': return 'fa-desktop';
      default: return 'fa-code';
    }
  }

  gradientFor(category: string): string {
    switch (category) {
      case 'ai': return 'from-violet-500/25 via-fuchsia-500/10 to-transparent';
      case 'iot': return 'from-emerald-500/25 via-teal-500/10 to-transparent';
      case 'desktop': return 'from-sky-500/22 via-blue-500/10 to-transparent';
      case 'web': return 'from-signal/25 via-orange-500/10 to-transparent';
      default: return 'from-slate-500/20 to-transparent';
    }
  }
}
