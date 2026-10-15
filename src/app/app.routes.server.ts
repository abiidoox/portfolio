import { RenderMode, ServerRoute } from '@angular/ssr';
import { PROJECTS, projectSlug } from './data/projects.data';

export const serverRoutes: ServerRoute[] = [
  {
    // One prerendered page per project, in the same slug form the UI links to.
    path: 'projects/:key',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => PROJECTS.map(p => ({ key: projectSlug(p) }))
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
