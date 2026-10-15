import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { TerminalIntroComponent } from './terminal-intro.component';

const TERMINAL: Record<string, string> = {
  'terminal.open': 'open',
  'terminal.ls': 'ls',
  'terminal.cat': 'cat',
  'terminal.run': 'run',
  'terminal.ready': 'app ready',
  'terminal.welcome': 'Welcome'
};

/**
 * Advances fake time in small steps. A single large advanceTimersByTime call
 * does not reliably drain the component's nested interval ticks under zone.js,
 * so the tests walk the clock instead.
 */
const advance = (ms: number) => {
  for (let t = 0; t < ms; t += 50) vi.advanceTimersByTime(50);
};

describe('TerminalIntroComponent', () => {
  let component: TerminalIntroComponent;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TranslateService,
          useValue: { get: () => of(TERMINAL), onLangChange: of(), defaultLang: 'en' }
        }
      ]
    });
    component = TestBed.runInInjectionContext(() => new TerminalIntroComponent());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
  });

  it('reveals lines one by one and marks the last two as success', () => {
    component.ngOnInit();

    expect(component.visibleLines.length).toBe(0);
    advance(250);
    expect(component.visibleLines.length).toBe(1);
    expect(component.visibleLines[0].success).toBe(false);

    advance(250 * 5);
    expect(component.visibleLines.length).toBe(6);
    expect(component.visibleLines[0].text).toBe('open career --profile=dev');
    expect(component.visibleLines.slice(4).every(line => line.success)).toBe(true);

    component.ngOnDestroy();
  });

  it('fills the progress counter and finishes on its own', () => {
    component.ngOnInit();

    // 6 lines by 1500ms, finish scheduled at 1750ms, done at 1950ms.
    advance(2500);
    expect(component.done).toBe(true);
    expect(component.removed).toBe(false);

    // The exit transition waits 900ms before leaving the DOM.
    advance(900);
    expect(component.removed).toBe(true);
    expect(component.progress).toBe(100);

    component.ngOnDestroy();
  });

  it('skip() stops the typing and ends the intro early', () => {
    component.ngOnInit();
    advance(300);
    expect(component.visibleLines.length).toBe(1);

    component.skip();
    expect(component.done).toBe(true);

    advance(2000);
    expect(component.visibleLines.length).toBe(1);
    expect(component.removed).toBe(true);

    component.ngOnDestroy();
  });

  it('skip() after the intro already finished is a no-op', () => {
    component.ngOnInit();
    advance(2500);
    expect(component.done).toBe(true);

    component.skip();
    expect(component.done).toBe(true);

    advance(1000);
    expect(component.removed).toBe(true);

    component.ngOnDestroy();
  });
});
