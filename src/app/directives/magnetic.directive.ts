import { Directive, ElementRef, HostListener, NgZone, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[appMagnetic]',
  standalone: true
})
export class MagneticDirective implements OnInit, OnDestroy {
  private el!: HTMLElement;
  private strength = 0.35;
  private rafId = 0;
  private currentX = 0;
  private currentY = 0;
  private targetX = 0;
  private targetY = 0;
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
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    this.targetX = (e.clientX - centerX) * this.strength;
    this.targetY = (e.clientY - centerY) * this.strength;
  }

  @HostListener('mouseenter')
  onEnter(): void {
    this.active = true;
    this.el.style.willChange = 'transform';
  }

  @HostListener('mouseleave')
  onLeave(): void {
    this.active = false;
    this.targetX = 0;
    this.targetY = 0;
  }

  private animate(): void {
    const loop = () => {
      this.currentX += (this.targetX - this.currentX) * 0.18;
      this.currentY += (this.targetY - this.currentY) * 0.18;
      const settled = Math.abs(this.currentX) < 0.1 && Math.abs(this.currentY) < 0.1;
      if (this.active || !settled) {
        this.el.style.transform = `translate(${this.currentX.toFixed(2)}px, ${this.currentY.toFixed(2)}px)`;
      } else if (settled) {
        this.el.style.transform = '';
        this.el.style.willChange = '';
        this.currentX = 0;
        this.currentY = 0;
      }
      this.rafId = requestAnimationFrame(loop);
    };
    loop();
  }
}
