import { Routes } from '@angular/router';

export const ATTENDANCE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./attendance-marking/attendance-marking.component').then(m => m.AttendanceMarkingComponent)
  }
];
