import { Routes } from '@angular/router';

export const ACADEMICS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'grading',
    pathMatch: 'full'
  },
  {
    path: 'grading',
    loadComponent: () => import('./grade-entry/grade-entry.component').then(m => m.GradeEntryComponent)
  },
  {
    path: 'report-cards/:id',
    loadComponent: () => import('./report-card/report-card.component').then(m => m.ReportCardComponent)
  }
];
