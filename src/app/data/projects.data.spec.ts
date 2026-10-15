import { PROJECTS } from './projects.data';

describe('PROJECTS data', () => {
  it('has unique keys', () => {
    const keys = PROJECTS.map(p => p.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('derives title and description keys from the project key', () => {
    for (const p of PROJECTS) {
      expect(p.titleKey).toBe(`PROJECTS.${p.key}.TITLE`);
      expect(p.descriptionKey).toBe(`PROJECTS.${p.key}.DESCRIPTION`);
    }
  });
});
