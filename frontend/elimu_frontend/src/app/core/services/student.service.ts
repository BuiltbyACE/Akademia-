import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginatedResponse } from './api.service';
import { Student, StudentDetail } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private api = inject(ApiService);

  getStudents(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    grade?: string;
    section?: string;
    status?: string;
  }): Observable<PaginatedResponse<Student>> {
    return this.api.get<PaginatedResponse<Student>>('/api/v1/students/', params);
  }

  getStudent(id: string): Observable<StudentDetail> {
    return this.api.get<StudentDetail>(`/api/v1/students/${id}/`);
  }

  createStudent(data: Partial<Student>): Observable<Student> {
    return this.api.post<Student>('/api/v1/students/', data);
  }

  updateStudent(id: string, data: Partial<Student>): Observable<Student> {
    return this.api.patch<Student>(`/api/v1/students/${id}/`, data);
  }

  deleteStudent(id: string): Observable<void> {
    return this.api.delete<void>(`/api/v1/students/${id}/`);
  }

  bulkSendSMS(studentIds: string[], message: string): Observable<any> {
    return this.api.post('/api/v1/students/bulk-sms/', { student_ids: studentIds, message });
  }

  exportStudents(params?: any): Observable<Blob> {
    return this.api.get<Blob>('/api/v1/students/export/', params);
  }
}
