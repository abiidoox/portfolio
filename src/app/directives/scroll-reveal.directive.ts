import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';

/**
 * Scroll reveal directive.
 * Usage: <div appScrollReveal [delay]="200" direction="left">
 * Element animates in (fade + translate/scale) the first time it enters the viewport.
 */
@Directive({
  selector: '[appScrollReveal]',
  standalone: true
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  private observer?: IntersectionObserver;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    const node = this.el.nativeElement as HTMLElement;
    // delay read from attribute to stay NgModule-friendly
    const delay = Number(node.getAttribute('data-delay')) || 0;
    const direction = this.attr('reveal-direction') || 'up';

    node.classList.add('sr-init', `sr-${direction}`);
    if (delay) {
      node.style.transitionDelay = `${delay}ms`;
    }

    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            node.classList.add('sr-in');
            this.observer?.unobserve(node);
          }
        });
      },
      { threshold: 0.15 }
    );
    this.observer.observe(node);
  }

  private attr(name: string): string | null {
    return (this.el.nativeElement as HTMLElement).getAttribute(`data-${name}`) ??
           (this.el.nativeElement as HTMLElement).getAttribute(name);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
