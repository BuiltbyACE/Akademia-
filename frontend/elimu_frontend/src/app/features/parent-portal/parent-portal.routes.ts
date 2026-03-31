import { Routes } from '@angular/router';

export const PARENT_PORTAL_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/parent-dashboard.component').then(m => m.ParentDashboardComponent)
  },
  {
    path: 'fees',
    loadComponent: () => import('./fees/parent-fees.component').then(m => m.ParentFeesComponent)
  },
  {
    path: 'attendance',
    loadComponent: () => import('./attendance/parent-attendance.component').then(m => m.ParentAttendanceComponent)
  }
];
