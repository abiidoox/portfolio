import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { ProjectModalComponent } from './project-modal.component';

@NgModule({
  declarations: [ProjectModalComponent],
  imports: [CommonModule, TranslatePipe],
  exports: [ProjectModalComponent]
})
export class ProjectModalModule {}
