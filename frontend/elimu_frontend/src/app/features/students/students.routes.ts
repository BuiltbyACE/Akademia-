import { Routes } from '@angular/router';

export const STUDENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./student-list/student-list.component').then(m => m.StudentListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./student-profile/student-profile.component').then(m => m.StudentProfileComponent)
  }
];
