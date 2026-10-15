import { Directive, ElementRef, OnDestroy, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

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
  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private platformId = inject(PLATFORM_ID);

  private observer?: IntersectionObserver;

  ngOnInit(): void {
    const node = this.el.nativeElement as HTMLElement;
    // delay read from attribute to stay NgModule-friendly
    const delay = Number(node.getAttribute('data-delay')) || 0;
    const direction = this.attr('reveal-direction') || 'up';

    // Applied on the server too: the prerendered HTML starts hidden, so the
    // first paint never flashes the fully visible page before hydration
    // re-hides it to run the reveal animation.
    node.classList.add('sr-init', `sr-${direction}`);

    if (!isPlatformBrowser(this.platformId)) return;

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
