import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProjectModalData } from '../components/shared/project-modal/project-modal.component';

@Injectable({ providedIn: 'root' })
export class ProjectModalService {
  private projectSubject = new BehaviorSubject<ProjectModalData | null>(null);
  project$ = this.projectSubject.asObservable();

  open(project: ProjectModalData): void {
    this.projectSubject.next(project);
  }

  close(): void {
    this.projectSubject.next(null);
  }

  get currentProject(): ProjectModalData | null {
    return this.projectSubject.value;
  }
}
