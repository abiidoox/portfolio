import { RenderMode, ServerRoute } from '@angular/ssr';
import { PROJECTS, projectSlug } from './data/projects.data';
import { NOTES, noteSlug } from './data/notes.data';

export const serverRoutes: ServerRoute[] = [
  {
    // One prerendered page per project, in the same slug form the UI links to.
    path: 'projects/:key',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => PROJECTS.map(p => ({ key: projectSlug(p) }))
  },
  {
    // One prerendered page per note, in the same slug form the UI links to.
    path: 'notes/:key',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => NOTES.map(n => ({ key: noteSlug(n) }))
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
