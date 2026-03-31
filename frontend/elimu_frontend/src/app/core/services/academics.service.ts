import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { 
  Grade, 
  Class, 
  Subject, 
  ExamCycle, 
  StudentGrade,
  GradingInsight,
  ReportCard 
} from '../models/academics.model';

@Injectable({
  providedIn: 'root'
})
export class AcademicsService {
  private api = inject(ApiService);

  getGrades(): Observable<Grade[]> {
    return this.api.get<Grade[]>('/api/v1/academics/grades/');
  }

  getClasses(gradeId?: string): Observable<Class[]> {
    return this.api.get<Class[]>('/api/v1/academics/classes/', gradeId ? { grade_id: gradeId } : {});
  }

  getSubjects(): Observable<Subject[]> {
    return this.api.get<Subject[]>('/api/v1/academics/subjects/');
  }

  getExamCycles(params?: { term_id?: string; status?: string }): Observable<ExamCycle[]> {
    return this.api.get<ExamCycle[]>('/api/v1/academics/exam-cycles/', params);
  }

  getExamCycle(id: string): Observable<ExamCycle> {
    return this.api.get<ExamCycle>(`/api/v1/academics/exam-cycles/${id}/`);
  }

  getStudentGrades(examCycleId: string, classId: string): Observable<{
    students: StudentGrade[];
    insights: GradingInsight;
    class_distribution: { grade: string; count: number }[];
  }> {
    return this.api.get(`/api/v1/academics/exam-cycles/${examCycleId}/grades/`, { class_id: classId });
  }

  saveGrades(examCycleId: string, grades: {
    student_id: string;
    subject_id: string;
    score: number;
  }[]): Observable<any> {
    return this.api.post(`/api/v1/academics/exam-cycles/${examCycleId}/grades/`, { grades });
  }

  bulkImportGrades(examCycleId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post(`/api/v1/academics/exam-cycles/${examCycleId}/import-grades/`, formData);
  }

  getReportCard(id: string): Observable<ReportCard> {
    return this.api.get<ReportCard>(`/api/v1/reports/report-cards/${id}/`);
  }

  generateReportCard(studentId: string, termId: string): Observable<ReportCard> {
    return this.api.post<ReportCard>('/api/v1/reports/report-cards/', { 
      student_id: studentId, 
      term_id: termId 
    });
  }

  exportToReportCard(examCycleId: string, classId: string): Observable<any> {
    return this.api.post(`/api/v1/academics/exam-cycles/${examCycleId}/export-report-cards/`, { 
      class_id: classId 
    });
  }
}
