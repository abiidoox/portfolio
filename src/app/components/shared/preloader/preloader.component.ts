import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-preloader',
  template: `
    <div class="preloader" [class.done]="done">
      <div class="preloader-name">
        <span *ngFor="let letter of letters; let i = index"
              [style.animation-delay.ms]="i * 50">{{ letter }}</span>
      </div>
      <div class="preloader-bar"><i [style.width.%]="progress"></i></div>
    </div>
  `,
  styles: [`
    .preloader {
      position: fixed; inset: 0; z-index: 9999;
      background: var(--bg-dark, #121a24);
      display: flex; flex-direction: column; gap: 22px;
      align-items: center; justify-content: center;
      transition: clip-path 1s cubic-bezier(.76, 0, .24, 1);
      clip-path: inset(0 0 0 0);
    }
    .preloader.done { clip-path: inset(0 0 100% 0); pointer-events: none; }
    .preloader-name {
      font-family: 'Space Grotesk', 'Inter', sans-serif;
      font-weight: 700; letter-spacing: -.02em;
      font-size: clamp(1.6rem, 5vw, 3.2rem);
      display: flex; overflow: hidden; color: var(--text-color, #fff);
    }
    .preloader-name span {
      display: inline-block;
      transform: translateY(110%);
      animation: preloader-rise .7s cubic-bezier(.22, 1, .36, 1) forwards;
    }
    .preloader-name span.space { width: .4em; }
    @keyframes preloader-rise { to { transform: translateY(0); } }
    .preloader-bar {
      width: min(320px, 70vw); height: 2px;
      background: rgba(255, 255, 255, .1); overflow: hidden;
    }
    .preloader-bar i {
      display: block; height: 100%; width: 0;
      background: linear-gradient(90deg, var(--primary-color, #ff5e3a), #38bdf8);
      transition: width .25s ease;
    }
  `]
})
export class PreloaderComponent implements OnInit {
  letters: string[] = [];
  progress = 0;
  done = false;

  ngOnInit(): void {
    const name = 'ABDERRAZZAQ';
    this.letters = [...name].map(c => (c === ' ' ? '\u00A0' : c));

    const timer = setInterval(() => {
      this.progress = Math.min(100, this.progress + Math.random() * 24);
      if (this.progress >= 100) {
        clearInterval(timer);
        setTimeout(() => (this.done = true), 400);
        // Remove from DOM after the wipe animation completes
        setTimeout(() => {
          const el = document.querySelector('app-preloader');
          el?.remove();
        }, 1600);
      }
    }, 150);
  }
}
