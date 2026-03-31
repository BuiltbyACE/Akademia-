import { Routes } from '@angular/router';

export const FINANCE_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'overview',
    pathMatch: 'full'
  },
  {
    path: 'overview',
    loadComponent: () => import('./finance-overview/finance-overview.component').then(m => m.FinanceOverviewComponent)
  },
  {
    path: 'invoices',
    loadComponent: () => import('./invoices/invoices.component').then(m => m.InvoicesComponent)
  },
  {
    path: 'fee-structures',
    loadComponent: () => import('./fee-structures/fee-structures.component').then(m => m.FeeStructuresComponent)
  }
];
