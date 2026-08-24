import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-word-rotator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="word-rotator" aria-live="polite">
      <span class="rotator-track" [style.animation-duration.ms]="duration">
        <span *ngFor="let word of words" class="rotator-word">{{ word }}</span>
        <span class="rotator-word">{{ words[0] }}</span>
      </span>
    </span>
  `,
  styles: [`
    :host { display: inline-block; }
    .word-rotator {
      display: inline-flex;
      overflow: hidden;
      vertical-align: bottom;
      height: 1.25em;
    }
    .rotator-track {
      display: flex;
      flex-direction: column;
      animation-timing-function: cubic-bezier(.76, 0, .24, 1);
      animation-name: word-flip;
      animation-iteration-count: infinite;
    }
    .rotator-word {
      height: 1.25em;
      line-height: 1.25em;
      white-space: nowrap;
    }
    @keyframes word-flip {
      /* n words + duplicate of first; each visible for equal slice */
      0%   { transform: translateY(0); }
      100% { transform: translateY(calc(-100% + 1.25em)); }
    }
    @media (prefers-reduced-motion: reduce) {
      .rotator-track { animation: none; }
    }
  `]
})
export class WordRotatorComponent {
  duration = 8000;
  words: string[] = ['...'];

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    // Words come from translation keys ABOUT.ROTATE_* so they localize
    this.translate.get(['ABOUT.ROTATE_1', 'ABOUT.ROTATE_2', 'ABOUT.ROTATE_3', 'ABOUT.ROTATE_4'])
      .subscribe(res => {
        const list = Object.values(res).filter(v => v && !(v as string).includes('ABOUT.'));
        if (list.length) {
          this.words = list as string[];
          // recompute duration: ~2s per word
          this.duration = (this.words.length) * 2000;
        }
      });
  }
}
