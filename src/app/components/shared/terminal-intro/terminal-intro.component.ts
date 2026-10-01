import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-terminal-intro',
  template: `
    <div class="terminal-intro" [class.done]="done" aria-hidden="true">
      <div class="terminal-window">
        <div class="terminal-header">
          <div class="terminal-dots">
            <span></span><span></span><span></span>
          </div>
          <div class="terminal-title">~/portfolio — {{ 'terminal.title' | translate }}</div>
        </div>
        <div class="terminal-body">
          <div class="terminal-line" *ngFor="let line of visibleLines">
            <span class="prompt">$</span>
            <span class="command" [class.success]="line.success">{{ line.text }}</span>
          </div>
          <div class="terminal-line cursor-line">
            <span class="prompt">$</span>
            <span class="cursor"></span>
          </div>
          <div class="terminal-progress">
            <div class="progress-track"><div class="progress-fill" [style.width.%]="progress"></div></div>
            <span class="progress-pct">{{ progress }}%</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .terminal-intro {
      position: fixed; inset: 0; z-index: 10000;
      background: radial-gradient(circle at 50% 50%, #161b22 0%, #0d1117 70%);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      transition: opacity 0.6s ease, clip-path 0.8s cubic-bezier(.76,0,.24,1);
      clip-path: inset(0 0 0 0);
    }
    .terminal-intro.done { opacity: 0; pointer-events: none; clip-path: inset(0 0 100% 0); display: none; }
    .terminal-window {
      width: min(620px, 90vw);
      box-shadow: 0 24px 80px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.04);
      border-radius: 12px;
      overflow: hidden;
      animation: win-in .5s cubic-bezier(.22,1,.36,1) both;
    }
    @keyframes win-in { from { opacity: 0; transform: translateY(20px) scale(.96); } to { opacity: 1; transform: none; } }
    .terminal-header {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 20px;
      background: #161b22;
      border-bottom: 1px solid #30363d;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 0.8rem;
      color: #8b949e;
    }
    .terminal-dots { display: flex; gap: 8px; }
    .terminal-dots span { width: 12px; height: 12px; border-radius: 50%; }
    .terminal-dots span:nth-child(1) { background: #ff5f57; }
    .terminal-dots span:nth-child(2) { background: #ffbd2e; }
    .terminal-dots span:nth-child(3) { background: #28ca42; }
    .terminal-title { margin-left: auto; }
    .terminal-body {
      padding: 20px 22px;
      background: #0d1117;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 1rem;
      color: #e6edf3;
      min-height: 200px;
      display: flex; flex-direction: column;
    }
    .terminal-line { display: flex; align-items: flex-start; gap: 10px; margin: 6px 0; animation: line-in .3s ease both; }
    @keyframes line-in { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: none; } }
    .prompt { color: #ff5e3a; white-space: nowrap; user-select: none; }
    .command {
      white-space: pre;
      overflow: hidden;
      display: inline-block;
      color: #58a6ff;
      text-shadow: 0 0 14px rgba(88,166,255,.3);
    }
    .terminal-line .command.success { color: #3fb950; text-shadow: 0 0 14px rgba(63,185,80,.3); }
    .cursor-line { margin-top: 4px; }
    .cursor {
      display: inline-block; width: 8px; height: 1.1em;
      background: #ff5e3a; 
      box-shadow: 0 0 10px rgba(255,94,58,.8);
      animation: blink 1s step-end infinite;
    }
    @keyframes blink { 50% { opacity: 0; } }
    .terminal-progress {
      margin-top: auto; padding-top: 20px;
      display: flex; align-items: center; gap: 14px;
    }
    .progress-track {
      flex: 1; height: 4px;
      background: rgba(255,255,255,.08);
      border-radius: 99px; overflow: hidden;
    }
    .progress-fill {
      height: 100%; width: 0;
      background: linear-gradient(90deg, #ff5e3a, #38bdf8);
      border-radius: 99px;
      box-shadow: 0 0 12px rgba(56,189,248,.7);
      transition: width .3s ease;
    }
    .progress-pct {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem; color: #8b949e; min-width: 46px; text-align: right;
    }
    @media (prefers-reduced-motion: reduce) {
      .terminal-intro { display: flex; }
      .terminal-window { animation: none; }
      .cursor { animation: none; }
    }
  `]
})
export class TerminalIntroComponent implements OnInit, OnDestroy {
  visibleLines: Array<{ text: string; success: boolean }> = [];
  progress = 0;
  done = false;
  private lines: string[] = [];
  private currentLine = 0;
  private lineTimer: any;
  private progressTimer: any;

  constructor(private zone: NgZone, private translate: TranslateService) {}

  ngOnInit(): void {
    this.translate.get([
      'terminal.open',
      'terminal.ls',
      'terminal.cat',
      'terminal.run',
      'terminal.ready',
      'terminal.welcome'
    ]).subscribe(t => {
      const o = (k: string, d: string) => (t[k] !== k ? t[k] : d);
      this.lines = [
        `${o('terminal.open', 'open')} career --profile=dev`,
        `${o('terminal.ls', 'ls')} projects/`,
        `${o('terminal.cat', 'cat')} skills.yaml`,
        `${o('terminal.run', 'run')} npm run build`,
        `✓ ${o('terminal.ready', 'app ready')}`,
        `${o('terminal.welcome', 'Welcome')}, Abderrazzaq`,
      ];
      this.start();
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.lineTimer);
    clearInterval(this.progressTimer);
  }

  private start(): void {
    this.zone.runOutsideAngular(() => {
      this.lineTimer = setInterval(() => {
        if (this.currentLine < this.lines.length) {
          // The last two lines report a result, so they get the success colour.
          // Indexed rather than matched on text, which would not survive
          // translation.
          const done = this.currentLine >= this.lines.length - 2;
          this.visibleLines = [...this.visibleLines, {
            text: this.lines[this.currentLine],
            success: done
          }];
          this.currentLine++;
        } else {
          clearInterval(this.lineTimer);
          // Re-enter the zone: both intervals are cleared by now, so nothing
          // else would trigger change detection and the `done` class (which
          // is what removes the overlay from the page) would not be applied
          // until an unrelated event happened to fire.
          setTimeout(() => this.zone.run(() => (this.done = true)), 200);
        }
      }, 250);

      // Progress counter (faster than line reveal for a satisfying feel)
      let p = 0;
      this.progressTimer = setInterval(() => {
        p = Math.min(100, p + Math.random() * 18);
        if (p >= 100) { p = 100; clearInterval(this.progressTimer); }
        this.zone.run(() => (this.progress = Math.floor(p)));
      }, 180);
    });
  }
}
