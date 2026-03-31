import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ParentService } from '../../../core/services/parent.service';
import { ChildOverview, SchoolEvent } from '../../../core/models/parent.model';

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './parent-dashboard.component.html',
  styleUrl: './parent-dashboard.component.css'
})
export class ParentDashboardComponent implements OnInit {
  private parentService = inject(ParentService);

  selectedChild = signal<ChildOverview | null>(null);
  children = signal<ChildOverview[]>([]);
  events = signal<SchoolEvent[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading.set(true);
    this.parentService.getDashboard().subscribe({
      next: (data) => {
        this.children.set(data.children);
        this.events.set(data.upcoming_events);
        if (data.children.length > 0) {
          this.selectedChild.set(data.children[0]);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load parent dashboard:', err);
        this.loading.set(false);
        this.loadMockData();
      }
    });
  }

  loadMockData() {
    const mockChildren: ChildOverview[] = [
      {
        id: '1',
        name: 'Benjamin Harrison',
        grade: 'Grade 11 • Senior High School',
        student_id: '#SHS-2024-882',
        current_status: 'in_class',
        next_class: 'AP Calculus',
        next_class_time: '1:15 PM',
        current_gpa: 3.85,
        gpa_change: 0.2,
        attendance_rate: 97.4,
        attendance_excused: 2,
        upcoming_payment: {
          amount: 1240.00,
          currency: '$',
          due_date: 'November 01, 2024',
          due_in_days: 4
        },
        recent_grades: [
          { subject: 'Calculus II', subject_code: 'MAT', assessment_name: 'Mid-term Exam', score: 94, grade: 'A', date: 'October 24, 2024', teacher: 'Ms. Sarah Jenkins' },
          { subject: 'Literary Analysis', subject_code: 'ENG', assessment_name: 'Modernism', score: 88, grade: 'B+', date: 'October 21, 2024', teacher: 'Mr. Robert Vance' },
          { subject: 'Thermodynamics', subject_code: 'PHY', assessment_name: 'Quiz', score: 76, grade: 'C', date: 'October 18, 2024', teacher: 'Dr. Elena Rossi' }
        ]
      }
    ];

    const mockEvents: SchoolEvent[] = [
      { id: '1', title: 'Parent-Teacher Conference', date: '2024-11-12', time: '4:00 PM', location: 'Virtual Session', type: 'conference', month: 'NOV', day: 12 },
      { id: '2', title: 'Fall Science Fair', date: '2024-11-15', time: '9:00 AM', location: 'Main Gymnasium', type: 'fair', month: 'NOV', day: 15 },
      { id: '3', title: 'Winter Sports Registration', date: '2024-11-22', location: 'Online Portal Opens', type: 'registration', month: 'NOV', day: 22 }
    ];

    this.children.set(mockChildren);
    this.events.set(mockEvents);
    this.selectedChild.set(mockChildren[0]);
    this.loading.set(false);
  }

  switchChild(child: ChildOverview) {
    this.selectedChild.set(child);
  }

  getGradeClass(grade: string): string {
    if (grade === 'A' || grade === 'A+') return 'text-success-600 bg-success-50';
    if (grade === 'B' || grade === 'B+') return 'text-primary-600 bg-primary-50';
    if (grade === 'C') return 'text-warning-600 bg-warning-50';
    return 'text-gray-600 bg-gray-50';
  }
}
