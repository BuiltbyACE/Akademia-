import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdmissionsService } from '../../../core/services/admissions.service';
import { AdmissionsAnalytics } from '../../../core/models/admissions.model';

@Component({
  selector: 'app-admissions-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admissions-analytics.component.html',
  styleUrl: './admissions-analytics.component.css'
})
export class AdmissionsAnalyticsComponent implements OnInit {
  private admissionsService = inject(AdmissionsService);

  analytics = signal<AdmissionsAnalytics | null>(null);
  loading = signal(true);
  selectedPeriod = signal('Past 30 Days');

  ngOnInit() {
    this.loadAnalytics();
  }

  loadAnalytics() {
    this.loading.set(true);
    // In production, this would call the API
    // this.admissionsService.getAnalytics().subscribe(...)
    this.loadMockData();
  }

  loadMockData() {
    const mockData: AdmissionsAnalytics = {
      enrollment_cycle: '2024-2025 Academic Year',
      total_applications: 1248,
      total_applications_change: 12.5,
      conversion_rate: 64.2,
      conversion_rate_change: 3.2,
      yield_rate: 78.5,
      yield_rate_change: -1.4,
      time_to_enroll: 18.4,
      time_to_enroll_change: -4,
      pipeline_funnel: [
        { stage: 'INQUIRY', count: 2450, percentage: 100 },
        { stage: 'APPLIED', count: 1248, percentage: 51 },
        { stage: 'ACCEPTED', count: 812, percentage: 33 },
        { stage: 'ENROLLED', count: 637, percentage: 26 }
      ],
      recent_activity: [
        { id: '1', applicant_name: 'Maya Rodriguez', activity_type: 'application', description: 'Applied for Grade 9', timestamp: '12m ago' },
        { id: '2', applicant_name: 'Julian Chen', activity_type: 'status_change', description: 'Status Changed: Accepted', timestamp: '2h ago' },
        { id: '3', applicant_name: 'Sarah Jenkins', activity_type: 'document_upload', description: 'Documents Uploaded', timestamp: '4h ago' },
        { id: '4', applicant_name: 'The Harrison Family', activity_type: 'interview', description: 'Interview Scheduled', timestamp: '8h ago' },
        { id: '5', applicant_name: "Liam O'Connor", activity_type: 'application', description: 'New inquiry received', timestamp: '1d ago' }
      ],
      enrollment_trends: [
        { month: 'SEP', current_year: 120, previous_year: 95 },
        { month: 'OCT', current_year: 145, previous_year: 110 },
        { month: 'NOV', current_year: 165, previous_year: 130 },
        { month: 'DEC', current_year: 180, previous_year: 145 },
        { month: 'JAN', current_year: 195, previous_year: 160 },
        { month: 'FEB', current_year: 210, previous_year: 175 }
      ],
      applications_by_grade: [
        { grade: 'Grade 9', count: 342, max_count: 400 },
        { grade: 'Grade 10', count: 210, max_count: 300 },
        { grade: 'Grade 11', count: 288, max_count: 350 },
        { grade: 'Grade 12', count: 156, max_count: 200 },
        { grade: 'KG - G8', count: 252, max_count: 300 }
      ]
    };

    this.analytics.set(mockData);
    this.loading.set(false);
  }

  getChangeClass(value: number): string {
    return value >= 0 ? 'text-success-600' : 'text-danger-600';
  }

  getChangeIcon(value: number): string {
    return value >= 0 ? '↑' : '↓';
  }
}
