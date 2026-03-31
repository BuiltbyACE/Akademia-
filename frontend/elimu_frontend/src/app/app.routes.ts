import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'students',
        loadChildren: () => import('./features/students/students.routes').then(m => m.STUDENT_ROUTES)
      },
      {
        path: 'attendance',
        loadChildren: () => import('./features/attendance/attendance.routes').then(m => m.ATTENDANCE_ROUTES)
      },
      {
        path: 'finance',
        loadChildren: () => import('./features/finance/finance.routes').then(m => m.FINANCE_ROUTES)
      },
      {
        path: 'academics',
        loadChildren: () => import('./features/academics/academics.routes').then(m => m.ACADEMICS_ROUTES)
      },
      {
        path: 'analytics',
        loadChildren: () => import('./features/analytics/analytics.routes').then(m => m.ANALYTICS_ROUTES)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
