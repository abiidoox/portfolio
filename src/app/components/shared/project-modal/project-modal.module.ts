import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ProjectModalComponent } from './project-modal.component';

@NgModule({
  declarations: [ProjectModalComponent],
  imports: [CommonModule, TranslateModule],
  exports: [ProjectModalComponent]
})
export class ProjectModalModule {}
