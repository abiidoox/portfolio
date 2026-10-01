import { Component } from '@angular/core';
import {
  SKILLS,
  SKILL_CATEGORY_ORDER,
  Skill,
  SkillCategory,
  SkillGroup
} from '../../data/skills.data';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html'
})
export class SkillsComponent {
  readonly skills: Skill[] = SKILLS;
  readonly categoryOrder: SkillCategory[] = SKILL_CATEGORY_ORDER;
  readonly categories: string[] = ['all', ...SKILL_CATEGORY_ORDER];

  selectedCategory = 'all';

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
