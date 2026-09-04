import { Component } from '@angular/core';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  template: `
    <div class="toast-container" aria-live="polite" aria-atomic="true">
      <div *ngFor="let toast of toastService.toasts$ | async" class="toast" [ngClass]="toast.type">
        <i class="toast-icon" [ngClass]="getIconClass(toast.type)"></i>
        <span class="toast-message">{{ toast.message }}</span>
        <div class="toast-progress" [style.animation-duration.ms]="3000"></div>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
      max-width: 360px;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      background: var(--bg-section, #1a2432);
      border: 1px solid var(--border-color, rgba(255,255,255,.08));
      border-radius: 12px;
      box-shadow: 0 16px 40px rgba(0,0,0,.4);
      animation: slideIn 0.35s cubic-bezier(.22,1,.36,1);
      pointer-events: auto;
      position: relative;
      overflow: hidden;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(100%); }
      to { opacity: 1; transform: translateX(0); }
    }

    .toast.success { border-left: 4px solid #4ade80; }
    .toast.error { border-left: 4px solid #ef4444; }
    .toast.info { border-left: 4px solid #38bdf8; }

    .toast-icon { font-size: 1.1rem; flex-shrink: 0; }
    .toast.success .toast-icon { color: #4ade80; }
    .toast.error .toast-icon { color: #ef4444; }
    .toast.info .toast-icon { color: #38bdf8; }

    .toast-message { color: var(--text-color); font-size: 0.9rem; line-height: 1.4; }

    .toast-progress {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--primary-color), #38bdf8);
      animation: progressBar 3s linear forwards;
      transform-origin: left;
    }

    @keyframes progressBar {
      from { transform: scaleX(1); }
      to { transform: scaleX(0); }
    }

    @media (prefers-reduced-motion: reduce) {
      .toast, .toast-progress { animation-duration: 0.01ms; }
    }
  `]
})
export class ToastContainerComponent {
  constructor(public toastService: ToastService) {}

  getIconClass(type: string): string {
    const icons: Record<string, string> = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      info: 'fas fa-info-circle'
    };
    return icons[type] || 'fas fa-info-circle';
  }
}