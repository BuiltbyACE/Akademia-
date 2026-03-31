import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ParentDashboard, AttendanceCalendar } from '../models/parent.model';
import { FinanceOverview, Invoice } from '../models/finance.model';

@Injectable({
  providedIn: 'root'
})
export class ParentService {
  private api = inject(ApiService);

  getDashboard(): Observable<ParentDashboard> {
    return this.api.get<ParentDashboard>('/api/parent/dashboard/');
  }

  getChildFinances(childId: string): Observable<FinanceOverview> {
    return this.api.get<FinanceOverview>(`/api/parent/children/${childId}/finances/`);
  }

  getChildInvoices(childId: string): Observable<Invoice[]> {
    return this.api.get<Invoice[]>(`/api/parent/children/${childId}/invoices/`);
  }

  getChildAttendance(childId: string, month: string, year: number): Observable<AttendanceCalendar> {
    return this.api.get<AttendanceCalendar>(`/api/parent/children/${childId}/attendance/`, {
      month,
      year: year.toString()
    });
  }

  logAbsence(childId: string, data: any): Observable<any> {
    return this.api.post(`/api/parent/children/${childId}/attendance/log-absence/`, data);
  }

  switchChild(childId: string): Observable<any> {
    return this.api.post('/api/parent/switch-child/', { child_id: childId });
  }
}
