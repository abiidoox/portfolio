import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  SKILLS,
  SKILL_CATEGORY_ORDER,
  Skill,
  SkillCategory,
  SkillGroup,
  projectCountForSkill
} from '../../data/skills.data';
import { PROJECTS } from '../../data/projects.data';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { NgClass } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-skills',
    templateUrl: './skills.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ScrollRevealDirective, NgClass, TranslatePipe]
})
export class SkillsComponent {
  private router = inject(Router);

  readonly skills: Skill[] = SKILLS;
  readonly categoryOrder: SkillCategory[] = SKILL_CATEGORY_ORDER;
  readonly categories: string[] = ['all', ...SKILL_CATEGORY_ORDER];

  selectedCategory = 'all';

  /** Project counts are derived once; the dataset is static. */
  private readonly projectCounts = new Map(
    SKILLS.map(s => [s.name, projectCountForSkill(s.name, PROJECTS)])
  );

  projectCountFor(skill: Skill): number {
    return this.projectCounts.get(skill.name) ?? 0;
  }

  /** Jump to the projects page pre-filtered to this technology. */
  viewProjects(skill: Skill, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/projects'], { queryParams: { tech: skill.name } });
  }

  get visibleGroups(): SkillGroup[] {
    const list = this.selectedCategory === 'all'
      ? this.skills
      : this.skills.filter(s => s.category === this.selectedCategory);

    return this.categoryOrder
      .map(category => ({
        category,
        items: list.filter(s => s.category === category)
      }))
      .filter(g => g.items.length > 0);
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
  }

  countFor(category: string): number {
    if (category === 'all') return this.skills.length;
    return this.skills.filter(s => s.category === category).length;
  }

  categoryIcon(category: string): string {
    switch (category) {
      case 'languages': return 'fa-code';
      case 'frameworks': return 'fa-layer-group';
      case 'databases': return 'fa-database';
      case 'tools': return 'fa-screwdriver-wrench';
      case 'all': return 'fa-th-large';
      default: return 'fa-folder';
    }
  }

  onGlowMove(e: MouseEvent): void {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }
}
