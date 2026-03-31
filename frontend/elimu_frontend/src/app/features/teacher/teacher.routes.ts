import { Routes } from '@angular/router';

export const TEACHER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard/teacher-dashboard.component').then(m => m.TeacherDashboardComponent)
  }
];
