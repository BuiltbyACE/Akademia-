import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PerformanceAnalytics } from '../models/analytics.model';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private api = inject(ApiService);

  getPerformanceAnalytics(params?: {
    academic_year_id?: string;
    term_id?: string;
  }): Observable<PerformanceAnalytics> {
    return this.api.get<PerformanceAnalytics>('/api/v1/analytics/performance/', params);
  }

  exportAnalytics(format: 'csv' | 'pdf' = 'csv'): Observable<Blob> {
    return this.api.get<Blob>('/api/v1/analytics/export/', { format });
  }
}
