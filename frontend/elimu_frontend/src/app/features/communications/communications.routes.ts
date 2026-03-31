import { Routes } from '@angular/router';

export const COMMUNICATIONS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'sent',
    pathMatch: 'full'
  },
  {
    path: 'sent',
    loadComponent: () => import('./sent-messages/sent-messages.component').then(m => m.SentMessagesComponent)
  },
  {
    path: 'logs',
    loadComponent: () => import('./delivery-logs/delivery-logs.component').then(m => m.DeliveryLogsComponent)
  },
  {
    path: 'compose',
    loadComponent: () => import('./message-composer/message-composer.component').then(m => m.MessageComposerComponent)
  }
];
