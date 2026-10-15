import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-not-found',
    templateUrl: './not-found.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class NotFoundComponent {
  private router = inject(Router);


  goHome(): void {
    this.router.navigate(['/']);
  }
}
