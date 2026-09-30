import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'auth/login',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'dashboard',
    renderMode: RenderMode.Client,
  },
  {
    path: 'customers',
    renderMode: RenderMode.Client,
  },
  {
    path: 'workorders',
    renderMode: RenderMode.Client,
  },
  {
    path: 'repairtasks',
    renderMode: RenderMode.Client,
  },
  {
    path: 'schedules',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
