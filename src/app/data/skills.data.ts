/**
 * Single source of truth for the technology inventory.
 *
 * Every entry below is evidenced by one of three sources, recorded per item:
 *   'cv-skills'  -> the "Competences Techniques" block of the CV PDF
 *   'cv-role'    -> a "Technologies cles" line on one of the CV roles
 *   'project'    -> the technology list of a shipped project in projects.data.ts
 *
 * Nothing may be added here without one of those sources. Experience/year
 * figures are deliberately absent: the CV states no durations, so any number
 * shown next to a technology would be an invention.
 */

export type SkillCategory = 'languages' | 'frameworks' | 'databases' | 'tools';

export type SkillSource = 'cv-skills' | 'cv-role' | 'project';

export interface Skill {
  name: string;
  /** Devicon token ("csharp" -> devicon-csharp-plain) or a Font Awesome class. */
  icon: string;
  category: SkillCategory;
  source: SkillSource;
}

export interface SkillGroup {
  category: SkillCategory;
  items: Skill[];
}

/** Render order of the category panels. */
export const SKILL_CATEGORY_ORDER: SkillCategory[] = [
  'languages',
  'frameworks',
  'databases',
  'tools'
];

export const SKILLS: Skill[] = [
  // Languages
  { name: 'C#', icon: 'devicon-csharp-plain', category: 'languages', source: 'cv-skills' },
  { name: 'Java', icon: 'devicon-java-plain', category: 'languages', source: 'cv-skills' },
  { name: 'Python', icon: 'devicon-python-plain', category: 'languages', source: 'cv-skills' },
  { name: 'JavaScript', icon: 'devicon-javascript-plain', category: 'languages', source: 'cv-skills' },
  { name: 'TypeScript', icon: 'devicon-typescript-plain', category: 'languages', source: 'cv-skills' },
  { name: 'T-SQL', icon: 'devicon-microsoftsqlserver-plain', category: 'languages', source: 'cv-role' },
  { name: 'HTML5', icon: 'devicon-html5-plain', category: 'languages', source: 'project' },
  { name: 'CSS3', icon: 'devicon-css3-plain', category: 'languages', source: 'project' },

  // Frameworks
  { name: '.NET 7', icon: 'devicon-dotnetcore-plain', category: 'frameworks', source: 'cv-skills' },
  { name: 'ASP.NET Core', icon: 'devicon-dotnetcore-plain', category: 'frameworks', source: 'cv-role' },
  { name: 'Spring Boot', icon: 'devicon-spring-plain', category: 'frameworks', source: 'cv-skills' },
  { name: 'Django', icon: 'devicon-django-plain', category: 'frameworks', source: 'cv-skills' },
  { name: 'Node.js', icon: 'devicon-nodejs-plain', category: 'frameworks', source: 'cv-skills' },
  { name: 'Angular', icon: 'devicon-angular-plain', category: 'frameworks', source: 'cv-skills' },
  { name: 'React', icon: 'devicon-react-plain', category: 'frameworks', source: 'cv-skills' },
  { name: 'React Native', icon: 'devicon-react-plain', category: 'frameworks', source: 'cv-skills' },
  { name: 'Bootstrap', icon: 'devicon-bootstrap-plain', category: 'frameworks', source: 'cv-skills' },
  { name: 'FastAPI', icon: 'devicon-fastapi-plain', category: 'frameworks', source: 'project' },
  { name: 'Entity Framework', icon: 'devicon-entityframeworkcore-plain', category: 'frameworks', source: 'cv-role' },

  // Databases
  { name: 'SQL Server', icon: 'devicon-microsoftsqlserver-plain', category: 'databases', source: 'cv-skills' },
  { name: 'MySQL', icon: 'devicon-mysql-plain', category: 'databases', source: 'cv-skills' },
  { name: 'PostgreSQL', icon: 'devicon-postgresql-plain', category: 'databases', source: 'cv-skills' },
  { name: 'MongoDB', icon: 'devicon-mongodb-plain', category: 'databases', source: 'cv-skills' },
  { name: 'Redis', icon: 'devicon-redis-plain', category: 'databases', source: 'project' },

  // Tools & practices
  { name: 'Git', icon: 'devicon-git-plain', category: 'tools', source: 'cv-skills' },
  { name: 'GitHub', icon: 'devicon-github-plain', category: 'tools', source: 'cv-skills' },
  { name: 'GitLab', icon: 'devicon-gitlab-plain', category: 'tools', source: 'cv-skills' },
  { name: 'Docker', icon: 'devicon-docker-plain', category: 'tools', source: 'project' },
  { name: 'Postman', icon: 'devicon-postman-plain', category: 'tools', source: 'cv-skills' },
  { name: 'Scrum', icon: 'fas fa-sitemap', category: 'tools', source: 'cv-skills' },
  { name: 'UML', icon: 'fas fa-sitemap', category: 'tools', source: 'cv-skills' }
];

/** Total number of technologies, used by the About page counters. */
export const SKILL_COUNT: number = SKILLS.length;

export function skillsIn(category: SkillCategory): Skill[] {
  return SKILLS.filter(s => s.category === category);
}
