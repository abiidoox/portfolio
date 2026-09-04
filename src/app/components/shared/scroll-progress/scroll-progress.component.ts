import { Component, HostListener, NgZone, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-scroll-progress',
  template: `<div class="scroll-progress" aria-hidden="true"><i></i></div>`,
  styles: [`
    :host { position: fixed; top: 0; left: 0; right: 0; z-index: 2005; pointer-events: none; }
    .scroll-progress {
      position: relative;
      height: 3px;
      background: transparent;
      transform-origin: left;
      transform: scaleX(0);
      background: linear-gradient(90deg, var(--primary-color, #ff5e3a), #38bdf8, var(--primary-color, #ff5e3a));
      background-size: 200% 100%;
      will-change: transform;
    }
  `]
})
export class ScrollProgressComponent implements OnInit, OnDestroy {
  private el!: HTMLElement;
  private rafId = 0;
  private target = 0;
  private current = 0;

  constructor(private zone: NgZone) {}

  ngOnInit(): void {
    this.el = document.querySelector('.scroll-progress')!;
    this.update();
    this.zone.runOutsideAngular(() => this.animate());
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  update(): void {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    this.target = max > 0 ? window.scrollY / max : 0;
  }

  private animate(): void {
    const loop = () => {
      this.current += (this.target - this.current) * 0.12;
      this.el.style.transform = `scaleX(${this.current.toFixed(4)})`;
      this.rafId = requestAnimationFrame(loop);
    };
    loop();
  }
}
