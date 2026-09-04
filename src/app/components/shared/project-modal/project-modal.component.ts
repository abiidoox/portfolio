import { Component, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export interface ProjectModalData {
  title: string;
  description: string;
  longDescription?: string;
  technologies: string[];
  category: string;
  featured: boolean;
  date: string;
  links?: { label: string; url: string; icon: string }[];
}

@Component({
  selector: 'app-project-modal',
  template: `
    <div class="pm-backdrop" (click)="close()" aria-hidden="true"></div>
    <div class="pm-dialog" role="dialog" aria-modal="true" aria-labelledby="pm-title">
      <button class="pm-close" (click)="close()" aria-label="Close modal">
        <i class="fas fa-times"></i>
      </button>
      <div class="pm-body">
        <div class="pm-visual" [style.background]="getVisualGradient()">
          <i class="pm-icon fas" [ngClass]="getCategoryIcon()"></i>
        </div>
        <div class="pm-head">
          <span class="pm-category" [ngClass]="'cat-' + project?.category">{{ getCategoryLabel() }}</span>
          <h2 id="pm-title">{{ project?.title }}</h2>
          <span class="pm-date" *ngIf="project?.date">{{ project?.date }}</span>
        </div>

        <div class="pm-content">
          <p class="pm-description">{{ project?.longDescription || project?.description }}</p>

          <div class="pm-tech" *ngIf="project?.technologies?.length">
            <h4>{{ 'PROJECTS.TECHNOLOGIES' | translate }}</h4>
            <div class="tech-chips">
              <span class="tech-chip" *ngFor="let tech of project!.technologies">{{ tech }}</span>
            </div>
          </div>

          <div class="pm-links" *ngIf="project?.links?.length">
            <a *ngFor="let link of project!.links!" [href]="link.url" target="_blank" rel="noopener noreferrer" class="pm-link">
              <i [class]="link.icon"></i>
              {{ link.label }}
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .pm-backdrop {
      position: fixed; inset: 0; z-index: 10000;
      background: rgba(10, 12, 18, 0.85);
      backdrop-filter: blur(8px);
      animation: fadeIn .35s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .pm-dialog {
      position: fixed; top: 50%; left: 50%; z-index: 10001;
      transform: translate(-50%, -50%);
      width: min(640px, 92vw);
      max-height: 85vh;
      overflow-y: auto;
      background: var(--bg-section, #1a2432);
      border: 1px solid var(--border-color, rgba(255,255,255,.08));
      border-radius: 24px;
      box-shadow: 0 32px 80px rgba(0,0,0,.5);
      animation: modalIn .4s cubic-bezier(.22,1,.36,1);
    }
    @keyframes modalIn {
      from { opacity: 0; transform: translate(-50%, -50%) scale(.92); }
      to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }

    .pm-close {
      position: absolute; top: 16px; right: 16px; z-index: 10;
      width: 40px; height: 40px; border-radius: 50%;
      background: rgba(255,255,255,.08);
      border: 1px solid var(--border-color);
      color: var(--text-color);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: background 0.2s, color 0.2s, transform 0.2s;
    }
    .pm-close:hover { background: var(--primary-color); color: #fff; transform: rotate(90deg); }

    .pm-body { padding: 32px; }

    .pm-visual {
      height: 160px; border-radius: 16px;
      margin: -32px -32px 24px;
      display: flex; align-items: center; justify-content: center;
      position: relative; overflow: hidden;
    }
    .pm-visual::before {
      content: ''; position: absolute; inset: 0;
      background: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.08), transparent 50%);
    }
    .pm-icon { font-size: 3.6rem; color: rgba(255,255,255,.28); filter: drop-shadow(0 8px 24px rgba(0,0,0,.3)); }

    .pm-head { margin-bottom: 20px; }
    .pm-category {
      display: inline-block; padding: 6px 14px; border-radius: 99px;
      font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.1em; color: #fff;
      background: linear-gradient(120deg, var(--primary-color), #ff8c66);
      box-shadow: 0 4px 16px rgba(255,94,58,.3);
    }
    .pm-category.cat-web { background: linear-gradient(120deg, #ff5e3a, #ffaa42); }
    .pm-category.cat-mobile { background: linear-gradient(120deg, #38bdf8, #a855f7); }
    .pm-category.cat-ai { background: linear-gradient(120deg, #c084fc, #38bdf8); }
    .pm-category.cat-iot { background: linear-gradient(120deg, #4ade80, #38bdf8); }
    .pm-category.cat-desktop { background: linear-gradient(120deg, #94a3b8, #3b82f6); }

    .pm-head h2 { margin: 16px 0 8px; font-size: 1.8rem; }
    .pm-date { color: var(--text-light); font-size: 0.85rem; font-family: 'JetBrains Mono', monospace; }

    .pm-content h4 { margin: 24px 0 12px; font-size: 1rem; }
    .pm-description { color: var(--text-light); line-height: 1.8; margin-bottom: 8px; }

    .tech-chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .tech-chip {
      font-family: 'JetBrains Mono', monospace; font-size: 0.7rem;
      padding: 6px 14px; border-radius: 99px;
      border: 1px solid rgba(255,94,58,.35);
      color: var(--primary-color);
      background: rgba(255,94,58,.07);
      transition: all 0.3s;
    }
    .tech-chip:hover { color: #fff; background: var(--primary-color); border-color: transparent; }

    .pm-links { display: flex; gap: 12px; margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border-color); }
    .pm-link {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 18px; border-radius: 99px;
      font-weight: 600; font-size: 0.85rem;
      color: var(--text-color);
      background: rgba(255,255,255,.04);
      border: 1px solid var(--border-color);
      transition: all 0.3s;
    }
    .pm-link:hover { color: #fff; background: linear-gradient(120deg, var(--primary-color), #ff8c66); border-color: transparent; }

    @media (max-width: 600px) {
      .pm-body { padding: 24px; }
      .pm-head h2 { font-size: 1.5rem; }
      .pm-visual { height: 130px; margin: -24px -24px 20px; }
      .pm-icon { font-size: 3rem; }
    }
    @media (prefers-reduced-motion: reduce) {
      .pm-dialog, .pm-backdrop { animation-duration: .1s; }
    }
  `]
})
export class ProjectModalComponent {
  @Input() project: ProjectModalData | null = null;
  @Output() closeRequest = new EventEmitter<void>();

  constructor(private translate: TranslateService) {}

  @HostListener('document:keydown.escape')
  onEsc(): void { this.close(); }

  close(): void {
    this.closeRequest.emit();
  }

  getCategoryLabel(): string {
    if (!this.project?.category) return '';
    return this.translate.instant('PROJECTS.CATEGORIES.' + this.project.category.toUpperCase());
  }

  getCategoryIcon(): string {
    const icons: Record<string, string> = {
      web: 'fa-globe',
      mobile: 'fa-mobile-screen-button',
      ai: 'fa-brain',
      iot: 'fa-microchip',
      desktop: 'fa-desktop'
    };
    return icons[this.project?.category || ''] || 'fa-code';
  }

  getVisualGradient(): string {
    const gradients: Record<string, string> = {
      web: 'radial-gradient(circle at 30% 25%, rgba(255,94,58,.4), transparent 60%), radial-gradient(circle at 75% 80%, rgba(255,170,66,.32), transparent 55%), rgba(0,0,0,.28)',
      mobile: 'radial-gradient(circle at 30% 25%, rgba(56,189,248,.42), transparent 60%), radial-gradient(circle at 75% 80%, rgba(168,85,247,.34), transparent 55%), rgba(0,0,0,.28)',
      ai: 'radial-gradient(circle at 30% 25%, rgba(192,132,252,.42), transparent 60%), radial-gradient(circle at 75% 80%, rgba(56,189,248,.32), transparent 55%), rgba(0,0,0,.28)',
      iot: 'radial-gradient(circle at 30% 25%, rgba(74,222,128,.4), transparent 60%), radial-gradient(circle at 75% 80%, rgba(56,189,248,.32), transparent 55%), rgba(0,0,0,.28)',
      desktop: 'radial-gradient(circle at 30% 25%, rgba(148,163,184,.4), transparent 60%), radial-gradient(circle at 75% 80%, rgba(59,130,246,.3), transparent 55%), rgba(0,0,0,.28)'
    };
    return gradients[this.project?.category || ''] || gradients['web'];
  }
}