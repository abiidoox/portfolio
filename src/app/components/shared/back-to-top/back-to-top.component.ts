import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-back-to-top',
  template: `
    <button
      class="btt"
      [class.visible]="visible"
      (click)="scrollTop()"
      aria-label="Back to top"
    >
      <svg class="btt-ring" viewBox="0 0 56 56" aria-hidden="true">
        <circle class="btt-track" cx="28" cy="28" r="25" pathLength="100"></circle>
        <circle class="btt-progress" cx="28" cy="28" r="25" pathLength="100" [attr.stroke-dashoffset]="94 - progress"></circle>
      </svg>
      <i class="fas fa-arrow-up"></i>
    </button>
  `,
  styles: [`
    :host { position: fixed; bottom: 26px; right: 26px; z-index: 1200; }
    .btt {
      position: relative;
      width: 56px; height: 56px;
      border-radius: 50%;
      border: none;
      background: color-mix(in srgb, var(--bg-section, #1a2432) 85%, transparent);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      color: var(--text-color, #fff);
      cursor: pointer;
      opacity: 0;
      transform: translateY(16px) scale(.85);
      pointer-events: none;
      transition: opacity .4s ease, transform .45s cubic-bezier(.22,1,.36,1);
      box-shadow: 0 12px 30px rgba(0,0,0,.35);
      display: flex; align-items: center; justify-content: center;
    }
    .btt.visible {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }
    .btt i {
      font-size: 1rem;
      color: var(--primary-color, #ff5e3a);
      transition: color .3s, transform .3s;
    }
    .btt:hover i { transform: translateY(-2px); color: #fff; }
    .btt:hover {
      background: linear-gradient(120deg, var(--primary-color), #ff8c66);
      box-shadow: 0 14px 34px rgba(255,94,58,.45);
    }
    .btt-ring {
      position: absolute; inset: 0;
      width: 100%; height: 100%;
      transform: rotate(-90deg);
      pointer-events: none;
    }
    .btt-ring circle {
      fill: none;
      stroke-width: 2.5;
    }
    .btt-track { stroke: rgba(128,128,128,.22); }
    .btt-progress {
      stroke: var(--primary-color, #ff5e3a);
      stroke-linecap: round;
      stroke-dasharray: 100;
      stroke-dashoffset: 94;
      filter: drop-shadow(0 0 5px rgba(255,94,58,.6));
    }
    @media (prefers-reduced-motion: reduce) {
      .btt { transition: opacity .2s ease; }
    }
  `]
})
export class BackToTopComponent implements OnInit, OnDestroy {
  visible = false;
  progress = 94;

  constructor() {}

  ngOnInit(): void {
    this.update();
  }

  ngOnDestroy(): void {}

  @HostListener('window:scroll')
  update(): void {
    const scrollY = window.scrollY;
    this.visible = scrollY > 400;
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const pct = max > 0 ? scrollY / max : 0;
    this.progress = 94 - pct * 94;
  }

  scrollTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}