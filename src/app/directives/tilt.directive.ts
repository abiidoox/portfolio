import { Directive, ElementRef, HostListener, NgZone, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[appTilt]',
  standalone: true
})
export class TiltDirective implements OnInit, OnDestroy {
  private rafId = 0;
  private el!: HTMLElement;
  private currentX = 0;
  private currentY = 0;
  private targetX = 0;
  private targetY = 0;
  private maxTilt = 7;
  private active = false;
  private reducedMotion = false;

  constructor(private elementRef: ElementRef, private zone: NgZone) {}

  ngOnInit(): void {
    this.el = this.elementRef.nativeElement;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.zone.runOutsideAngular(() => this.animate());
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
  }

  @HostListener('mousemove', ['$event'])
  onMove(e: MouseEvent): void {
    if (!this.active || this.reducedMotion) return;
    const rect = this.el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    this.targetY = (px - 0.5) * this.maxTilt * 2;
    this.targetX = (0.5 - py) * this.maxTilt * 2;
  }

  @HostListener('mouseenter')
  onEnter(): void {
    if (this.reducedMotion) return;
    this.active = true;
    this.el.style.transformStyle = 'preserve-3d';
    this.el.style.willChange = 'transform';
  }

  @HostListener('mouseleave')
  onLeave(): void {
    this.targetX = 0;
    this.targetY = 0;
  }

  private animate(): void {
    const loop = () => {
      if (this.active || this.currentX !== 0 || this.currentY !== 0) {
        this.currentX += (this.targetX - this.currentX) * 0.16;
        this.currentY += (this.targetY - this.currentY) * 0.16;
        const settled = Math.abs(this.currentX) < 0.05 && Math.abs(this.currentY) < 0.05;
        if (this.active || !settled) {
          this.el.style.transform =
            `perspective(900px) rotateX(${this.currentX.toFixed(2)}deg) rotateY(${this.currentY.toFixed(2)}deg) translateY(${this.active ? -6 : 0}px)`;
        } else if (settled && !this.active) {
          // Returned to rest: remove inline transform so scroll-reveal CSS takes over
          this.el.style.transform = '';
          this.el.style.willChange = '';
          this.currentX = 0;
          this.currentY = 0;
        }
        if (!this.active && settled) {
          this.active = false;
        }
      }
      this.rafId = requestAnimationFrame(loop);
    };
    loop();
  }
}
