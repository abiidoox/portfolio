import { Directive, ElementRef, HostListener, NgZone, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[appHeroParallax]',
  standalone: true
})
export class HeroParallaxDirective implements OnInit, OnDestroy {
  private el!: HTMLElement;
  private reducedMotion = false;
  private rafId = 0;
  private ticking = false;

  constructor(private elementRef: ElementRef, private zone: NgZone) {}

  ngOnInit(): void {
    this.el = this.elementRef.nativeElement;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!this.reducedMotion) {
      this.zone.runOutsideAngular(() => this.onScroll());
    }
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.reducedMotion || this.ticking) return;
    this.ticking = true;
    this.rafId = requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const heroHeight = this.el.offsetHeight;
      const progress = Math.min(scrollY / (heroHeight * 0.7), 1);
      
      // Fade out content
      this.el.style.opacity = (1 - progress * 0.9).toFixed(3);
      
      // Subtle scale + translateY for parallax exit
      const translateY = scrollY * 0.15;
      const scale = 1 - progress * 0.08;
      this.el.style.transform = `translateY(${translateY.toFixed(1)}px) scale(${scale.toFixed(3)})`;
      
      this.ticking = false;
    });
  }
}