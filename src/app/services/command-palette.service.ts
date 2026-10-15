import { Injectable, signal } from '@angular/core';

/**
 * Open/close state for the command palette. A service rather than local state
 * because two owners need it: the global Ctrl+K listener and the header
 * trigger button.
 */
@Injectable({ providedIn: 'root' })
export class CommandPaletteService {
  private readonly openSignal = signal(false);
  readonly isOpen = this.openSignal.asReadonly();

  private readonly shortcutsSignal = signal(false);
  readonly isShortcutsOpen = this.shortcutsSignal.asReadonly();

  open(): void {
    this.shortcutsSignal.set(false);
    this.openSignal.set(true);
  }

  close(): void {
    this.openSignal.set(false);
  }

  toggle(): void {
    this.shortcutsSignal.set(false);
    this.openSignal.update(value => !value);
  }

  openShortcuts(): void {
    this.openSignal.set(false);
    this.shortcutsSignal.set(true);
  }

  closeShortcuts(): void {
    this.shortcutsSignal.set(false);
  }

  toggleShortcuts(): void {
    this.openSignal.set(false);
    this.shortcutsSignal.update(value => !value);
  }
}
