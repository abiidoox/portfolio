import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-not-found',
    templateUrl: './not-found.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink, TranslatePipe]
})
export class NotFoundComponent {
  private router = inject(Router);


  goHome(): void {
    this.router.navigate(['/']);
  }
}
