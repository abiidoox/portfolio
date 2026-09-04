import { Component, ElementRef } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  constructor(private elRef: ElementRef) {}

  onHeroMove(e: MouseEvent): void {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (motion) return;
    const visual = this.elRef.nativeElement.querySelector('.hero-visual') as HTMLElement;
    if (!visual) return;
    const rect = visual.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const ring = visual.querySelector('.avatar-ring') as HTMLElement;
    const chips = visual.querySelectorAll('.float-chip');
    if (ring) {
      const rx = (py - 0.5) * 26;
      const ry = (px - 0.5) * 26;
      ring.style.transition = 'transform .12s ease-out';
      ring.style.transform = `perspective(800px) rotateX(${(-rx).toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    }
    chips.forEach((chip, i) => {
      const depth = (i + 1) * 14;
      const cx = (px - 0.5) * depth;
      const cy = (py - 0.5) * depth;
      (chip as HTMLElement).style.transition = 'transform .25s ease-out';
      (chip as HTMLElement).style.transform = `translate(${cy.toFixed(1)}px, ${cx.toFixed(1)}px)`;
    });
  }

  onHeroLeave(): void {
    const visual = this.elRef.nativeElement.querySelector('.hero-visual') as HTMLElement;
    if (!visual) return;
    const ring = visual.querySelector('.avatar-ring') as HTMLElement;
    const chips = visual.querySelectorAll('.float-chip');
    if (ring) {
      ring.style.transition = 'transform .6s cubic-bezier(.22,1,.36,1)';
      ring.style.transform = '';
    }
    chips.forEach((chip) => {
      (chip as HTMLElement).style.transition = 'transform .6s cubic-bezier(.22,1,.36,1)';
      (chip as HTMLElement).style.transform = '';
    });
  }
}
