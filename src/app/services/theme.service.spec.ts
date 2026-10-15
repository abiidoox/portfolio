import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    document.body.className = '';
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
  });

  it('defaults to dark when nothing is stored', () => {
    expect(service.current).toBe('dark');
  });

  it('toggles between dark and light', () => {
    service.toggle();
    expect(service.current).toBe('light');
    service.toggle();
    expect(service.current).toBe('dark');
  });

  it('persists the theme and applies it to the document', () => {
    service.set('light');
    expect(localStorage.getItem('theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.body.classList.contains('light-theme')).toBe(true);
  });
});
