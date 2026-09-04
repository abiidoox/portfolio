import { AfterViewInit, Directive, ElementRef, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appSplitText]',
  standalone: true
})
export class SplitTextDirective implements AfterViewInit {
  constructor(
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone
  ) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const el = this.elementRef.nativeElement as HTMLElement;
    if (el.dataset['splitDone']) return;
    el.dataset['splitDone'] = 'true';

    const mode = el.dataset['splitMode'] || 'word';

    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        this.split(el, mode);
        this.watchForAngularReinsert(el, mode);
      });
    });
  }

  private split(el: HTMLElement, mode: string): void {
    let text = '';
    const textNodes: Node[] = [];

    el.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent;
        textNodes.push(node);
      }
    });

    textNodes.forEach(node => el.removeChild(node));

    if (!text.trim()) return;

    const fragment = document.createDocumentFragment();
    const parts = mode === 'char' ? [...text] : text.split(/(\s+)/);

    const gradientChild = el.classList.contains('text-gradient-animated') ||
                          el.classList.contains('gradient-text');

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;

      if (mode === 'char') {
        const span = document.createElement('span');
        span.className = 'split-char';
        span.textContent = part === ' ' ? '\u00A0' : part;
        span.style.transitionDelay = `${i * 30}ms`;
        if (gradientChild) span.classList.add('text-gradient-animated');
        fragment.appendChild(span);
      } else {
        if (part.trim() === '') {
          fragment.appendChild(document.createTextNode(part));
          continue;
        }
        const span = document.createElement('span');
        span.className = 'split-word';
        span.textContent = part;
        span.style.transitionDelay = `${i * 55}ms`;
        if (gradientChild) span.classList.add('text-gradient-animated');
        fragment.appendChild(span);
        fragment.appendChild(document.createTextNode(' '));
      }
    }

    el.appendChild(fragment);
    el.classList.add('split-parent');
  }

  private watchForAngularReinsert(el: HTMLElement, mode: string): void {
    let pending = false;

    const observer = new MutationObserver(() => {
      if (pending) return;

      const hasRawText = Array.from(el.childNodes).some(
        n => n.nodeType === Node.TEXT_NODE && (n.textContent || '').trim()
      );

      if (hasRawText) {
        pending = true;
        requestAnimationFrame(() => {
          const existingSplits = el.querySelectorAll('.split-word, .split-char');
          if (existingSplits.length > 0) {
            el.childNodes.forEach(node => {
              if (node.nodeType === Node.TEXT_NODE) {
                el.removeChild(node);
              }
            });
          } else {
            this.split(el, mode);
          }
          pending = false;
        });
      }
    });

    observer.observe(el, { childList: true, subtree: true, characterData: true });

    setTimeout(() => observer.disconnect(), 3000);
  }
}
