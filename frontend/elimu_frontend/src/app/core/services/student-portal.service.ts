import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { StudentDashboard, AcademicResults, ClassSchedule } from '../models/student-portal.model';

@Injectable({
  providedIn: 'root'
})
export class StudentPortalService {
  private api = inject(ApiService);

  getDashboard(): Observable<StudentDashboard> {
    return this.api.get<StudentDashboard>('/api/student-portal/dashboard/');
  }

  getAcademicResults(): Observable<AcademicResults> {
    return this.api.get<AcademicResults>('/api/student-portal/results/');
  }

  getSchedule(weekStart?: string): Observable<ClassSchedule> {
    const params = weekStart ? { week_start: weekStart } : {};
    return this.api.get<ClassSchedule>('/api/student-portal/schedule/', params);
  }

  downloadTranscript(): Observable<any> {
    return this.api.get('/api/student-portal/transcript/download/');
  }

  updateStudyPlan(itemId: string, completed: boolean): Observable<any> {
    return this.api.patch(`/api/student-portal/study-plan/${itemId}/`, { completed });
  }
}
