import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AdmissionsPipeline, Applicant, ApplicantDetail } from '../models/admissions.model';

@Injectable({
  providedIn: 'root'
})
export class AdmissionsService {
  private api = inject(ApiService);

  getPipeline(academicYear?: string): Observable<AdmissionsPipeline> {
    const params = academicYear ? { academic_year: academicYear } : {};
    return this.api.get<AdmissionsPipeline>('/api/admissions/pipeline/', params);
  }

  getApplicant(id: string): Observable<ApplicantDetail> {
    return this.api.get<ApplicantDetail>(`/api/admissions/applicants/${id}/`);
  }

  createApplicant(data: Partial<Applicant>): Observable<Applicant> {
    return this.api.post<Applicant>('/api/admissions/applicants/', data);
  }

  updateApplicant(id: string, data: Partial<Applicant>): Observable<Applicant> {
    return this.api.patch<Applicant>(`/api/admissions/applicants/${id}/`, data);
  }

  moveApplicantStage(id: string, stage: string): Observable<Applicant> {
    return this.api.post<Applicant>(`/api/admissions/applicants/${id}/move/`, { stage });
  }

  scheduleInterview(id: string, date: string, time: string): Observable<any> {
    return this.api.post(`/api/admissions/applicants/${id}/schedule-interview/`, { date, time });
  }

  addNote(id: string, content: string): Observable<any> {
    return this.api.post(`/api/admissions/applicants/${id}/notes/`, { content });
  }

  uploadDocument(id: string, file: File, documentType: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    return this.api.post(`/api/admissions/applicants/${id}/documents/`, formData);
  }
}
