import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { TeacherDashboard, LessonPlan } from '../models/teacher.model';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private api = inject(ApiService);

  getDashboard(): Observable<TeacherDashboard> {
    return this.api.get<TeacherDashboard>('/api/teacher/dashboard/');
  }

  getSchedule(date?: string): Observable<any> {
    const params = date ? { date } : {};
    return this.api.get('/api/teacher/schedule/', params);
  }

  getLessonPlan(classId: string): Observable<LessonPlan> {
    return this.api.get<LessonPlan>(`/api/teacher/classes/${classId}/lesson-plan/`);
  }

  markAttendance(classId: string, data: any): Observable<any> {
    return this.api.post(`/api/teacher/classes/${classId}/attendance/`, data);
  }

  contactParent(studentId: string, message: string): Observable<any> {
    return this.api.post('/api/teacher/contact-parent/', { student_id: studentId, message });
  }

  logIncident(data: any): Observable<any> {
    return this.api.post('/api/teacher/incidents/', data);
  }

  generateReport(classId: string): Observable<any> {
    return this.api.get(`/api/teacher/classes/${classId}/report/`);
  }
}
