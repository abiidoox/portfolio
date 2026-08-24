import { Directive, ElementRef, OnDestroy } from '@angular/core';

/**
 * Animated counter directive.
 * Usage: <span appCountUp [countTo]="7" [duration]="1400">0</span>
 * Counts from 0 to countTo when the element scrolls into view (ease-out cubic).
 */
@Directive({
  selector: '[appCountUp]',
  standalone: true
})
export class CountUpDirective implements OnDestroy {
  private observer?: IntersectionObserver;
  private started = false;

  constructor(private el: ElementRef<HTMLElement>) {
    const target = Number((this.el.nativeElement as HTMLElement).getAttribute('countTo') || '100');
    const duration = Number((this.el.nativeElement as HTMLElement).getAttribute('duration') || '1400');

    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.started) {
            this.started = true;
            this.animate(target, duration);
            this.observer?.unobserve(this.el.nativeElement);
          }
        });
      },
      { threshold: 0.6 }
    );
    this.observer.observe(this.el.nativeElement);
  }

  private animate(target: number, duration: number): void {
    const node = this.el.nativeElement as HTMLElement;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      node.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
