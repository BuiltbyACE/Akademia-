import { Routes } from '@angular/router';

export const ADMISSIONS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'pipeline',
    pathMatch: 'full'
  },
  {
    path: 'pipeline',
    loadComponent: () => import('./pipeline/admissions-pipeline.component').then(m => m.AdmissionsPipelineComponent)
  },
  {
    path: 'analytics',
    loadComponent: () => import('./analytics/admissions-analytics.component').then(m => m.AdmissionsAnalyticsComponent)
  },
  {
    path: 'applicants/:id',
    loadComponent: () => import('./applicant-detail/applicant-detail.component').then(m => m.ApplicantDetailComponent)
  }
];
