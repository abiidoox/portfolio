import { TestBed } from '@angular/core/testing';
import { Toast, ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;
  let latest: Toast[];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
    latest = [];
    service.toasts$.subscribe(toasts => (latest = toasts));
  });

  afterEach(() => TestBed.resetTestingModule());

  it('show() adds a toast with the info type by default', () => {
    service.show('hello');

    expect(latest.length).toBe(1);
    expect(latest[0].message).toBe('hello');
    expect(latest[0].type).toBe('info');
  });

  it('assigns incrementing ids', () => {
    service.show('a');
    service.show('b');

    expect(latest.map(t => t.id)).toEqual([1, 2]);
  });

  it('helpers set the matching type', () => {
    service.success('s');
    service.error('e');
    service.info('i');

    expect(latest.map(t => t.type)).toEqual(['success', 'error', 'info']);
  });

  it('remove() drops only the matching toast', () => {
    service.show('a');
    service.show('b');

    service.remove(latest[0].id);

    expect(latest.map(t => t.message)).toEqual(['b']);
  });

  it('auto-dismisses after the duration', () => {
    vi.useFakeTimers();
    try {
      service.show('bye', 'info', 1000);
      expect(latest.length).toBe(1);

      vi.advanceTimersByTime(999);
      expect(latest.length).toBe(1);

      vi.advanceTimersByTime(1);
      expect(latest.length).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
