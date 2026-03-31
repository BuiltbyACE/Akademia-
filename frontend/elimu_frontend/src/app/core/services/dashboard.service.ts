import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DashboardData } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private api = inject(ApiService);

  getDashboardData(): Observable<DashboardData> {
    return this.api.get<DashboardData>('/api/v1/dashboard/overview/');
  }
}
