import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { 
  SentMessage, 
  CommunicationsMetrics, 
  MessageLog, 
  MessageComposer,
  MessageTemplate,
  RecipientGroup,
  DeliveryAnalytics
} from '../models/communications.model';

@Injectable({
  providedIn: 'root'
})
export class CommunicationsService {
  private api = inject(ApiService);

  getSentMessages(filters?: any): Observable<{ results: SentMessage[], count: number }> {
    return this.api.get('/api/communications/sent/', filters);
  }

  getMetrics(period?: string): Observable<CommunicationsMetrics> {
    const params = period ? { period } : {};
    return this.api.get<CommunicationsMetrics>('/api/communications/metrics/', params);
  }

  getDeliveryLogs(filters?: any): Observable<{ results: MessageLog[], count: number }> {
    return this.api.get('/api/communications/logs/', filters);
  }

  getDeliveryAnalytics(period?: string): Observable<DeliveryAnalytics> {
    const params = period ? { period } : {};
    return this.api.get<DeliveryAnalytics>('/api/communications/analytics/', params);
  }

  getTemplates(): Observable<MessageTemplate[]> {
    return this.api.get<MessageTemplate[]>('/api/communications/templates/');
  }

  getRecipientGroups(): Observable<RecipientGroup[]> {
    return this.api.get<RecipientGroup[]>('/api/communications/recipient-groups/');
  }

  sendMessage(data: Partial<MessageComposer>): Observable<any> {
    return this.api.post('/api/communications/send/', data);
  }

  scheduleMessage(data: Partial<MessageComposer>, scheduledTime: string): Observable<any> {
    return this.api.post('/api/communications/schedule/', { ...data, scheduled_time: scheduledTime });
  }

  exportLogs(format: 'csv' | 'pdf' = 'csv'): Observable<any> {
    return this.api.get(`/api/communications/logs/export/?format=${format}`);
  }

  runHealthAudit(): Observable<any> {
    return this.api.post('/api/communications/health-audit/', {});
  }
}
