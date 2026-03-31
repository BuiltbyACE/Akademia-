import { Routes } from '@angular/router';

export const STUDENT_PORTAL_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent)
  },
  {
    path: 'results',
    loadComponent: () => import('./results/student-results.component').then(m => m.StudentResultsComponent)
  },
  {
    path: 'timetable',
    loadComponent: () => import('./timetable/student-timetable.component').then(m => m.StudentTimetableComponent)
  }
];
