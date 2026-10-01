import { Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';

/**
 * Animated counter.
 * Usage: <span appCountUp [countTo]="7" [duration]="1400">0</span>
 *
 * Reads inputs via @Input (not raw attributes in the constructor) so bound
 * values are resolved before the animation is scheduled. Writes to a nested
 * counter node rather than the host, so host classes such as gradient text
 * survive the animation.
 */
@Directive({
  selector: '[appCountUp]',
  standalone: true
})
export class CountUpDirective implements OnInit, OnChanges, OnDestroy {
  @Input() countTo = 100;
  @Input() duration = 1400;

  private observer?: IntersectionObserver;
  private started = false;
  private target: HTMLElement;
  private reducedMotion = false;

  constructor(private el: ElementRef<HTMLElement>) {
    this.target = this.el.nativeElement;
  }

  ngOnInit(): void {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.reducedMotion) {
      this.target.textContent = String(this.countTo);
      return;
    }

    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.started) {
            this.started = true;
            this.animate();
            this.observer?.unobserve(this.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    this.observer.observe(this.target);
  }

  ngOnChanges(): void {
    // If the value arrives after the element was already revealed, keep it correct.
    if (this.started) this.target.textContent = String(this.countTo);
  }

  private animate(): void {
    const node = this.target;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / this.duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      node.textContent = String(Math.round(this.countTo * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
