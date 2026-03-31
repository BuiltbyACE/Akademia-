import { Routes } from '@angular/router';

export const ANALYTICS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./performance-analytics/performance-analytics.component').then(m => m.PerformanceAnalyticsComponent)
  }
];
