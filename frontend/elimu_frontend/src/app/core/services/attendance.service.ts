import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { 
  AttendanceSession, 
  AttendanceRecord, 
  AttendanceSummary,
  AttendanceMarkingRequest 
} from '../models/attendance.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private api = inject(ApiService);

  getAttendanceSession(classId: string, date: string): Observable<{
    session: AttendanceSession;
    records: AttendanceRecord[];
    summary: AttendanceSummary;
  }> {
    return this.api.get(`/api/v1/attendance/sessions/`, { class_id: classId, date });
  }

  markAttendance(data: AttendanceMarkingRequest): Observable<{
    session: AttendanceSession;
    records: AttendanceRecord[];
  }> {
    return this.api.post('/api/v1/attendance/mark/', data);
  }

  submitAttendance(sessionId: string): Observable<AttendanceSession> {
    return this.api.post(`/api/v1/attendance/sessions/${sessionId}/submit/`, {});
  }

  getAttendanceSummary(params: {
    class_id?: string;
    student_id?: string;
    date_from?: string;
    date_to?: string;
  }): Observable<AttendanceSummary> {
    return this.api.get('/api/v1/attendance/summary/', params);
  }
}
