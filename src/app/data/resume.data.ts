/**
 * Resume structure. Point counts per role are derived from the i18n files so
 * the template never hardcodes a number that could drift out of sync.
 *
 * The technology tag list is NOT maintained here: it is derived from the
 * shared inventory in skills.data.ts so the Skills page and the Resume can
 * never disagree.
 */
import { SkillCategory, skillsIn } from './skills.data';

export interface ExperienceEntry {
  key: string;
  /** Number of POINT1..POINTn keys present in the translations. */
  pointCount: number;
}

export interface EducationEntry {
  key: string;
}

export interface SkillTagGroup {
  categoryKey: string;
  /** Literal technology names; these are proper nouns and stay untranslated. */
  items: string[];
}

/**
 * The four roles on the CV, newest first. `key` indexes
 * RESUME.EXPERIENCE_ITEMS, and `pointCount` must match the POINTn keys there.
 */
export const EXPERIENCE: ExperienceEntry[] = [
  { key: 'ITEM4', pointCount: 5 },
  { key: 'ITEM3', pointCount: 3 },
  { key: 'ITEM2', pointCount: 3 },
  { key: 'ITEM1', pointCount: 3 }
];

export const EDUCATION: EducationEntry[] = [
  { key: 'ITEM1' },
  { key: 'ITEM2' },
  { key: 'ITEM3' }
];

const TAG_GROUP_ORDER: { category: SkillCategory; categoryKey: string }[] = [
  { category: 'languages', categoryKey: 'LANGUAGES' },
  { category: 'frameworks', categoryKey: 'FRAMEWORKS' },
  { category: 'databases', categoryKey: 'DATABASES' },
  { category: 'tools', categoryKey: 'TOOLS' }
];

export const SKILL_GROUPS: SkillTagGroup[] = TAG_GROUP_ORDER.map(({ category, categoryKey }) => ({
  categoryKey,
  items: skillsIn(category).map(s => s.name)
}));

export const SOFT_SKILL_KEYS: string[] = [
  'TEAMWORK',
  'STRESS_MANAGEMENT',
  'ADAPTABILITY'
];

export const LANGUAGE_KEYS: string[] = ['ARABIC', 'FRENCH', 'ENGLISH'];

export const CERTIFICATION_KEYS: string[] = ['SCRUM'];

/** Builds the i18n path for the nth bullet of an experience entry. */
export function pointKey(entryKey: string, index: number): string {
  return `RESUME.EXPERIENCE_ITEMS.${entryKey}.POINTS.POINT${index + 1}`;
}
