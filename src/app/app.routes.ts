import { Routes } from '@angular/router';

import { authGuard } from './features/auth/auth.guard';
import { Dashboard } from './features/dashboard/dashboard';
import { Landing } from './features/landing/landing';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: Landing },
  { path: 'auth/login', loadComponent: () => import('./features/auth/login').then((m) => m.Login) },
  {
    path: '',
    canActivateChild: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      {
        path: 'customers',
        loadComponent: () => import('./features/customers/customers').then((m) => m.Customers),
      },
      {
        path: 'workorders',
        loadComponent: () => import('./features/workorders/workorders').then((m) => m.WorkOrders),
      },
      {
        path: 'workorders/:id',
        loadComponent: () =>
          import('./features/workorders/workorder-details').then((m) => m.WorkOrderDetails),
      },
      {
        path: 'repairtasks',
        loadComponent: () =>
          import('./features/repairtasks/repairtasks').then((m) => m.RepairTasks),
      },
      {
        path: 'schedules',
        loadComponent: () => import('./features/schedules/schedules').then((m) => m.Schedules),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
