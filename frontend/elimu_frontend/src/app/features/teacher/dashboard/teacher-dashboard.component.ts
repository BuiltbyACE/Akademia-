import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TeacherService } from '../../../core/services/teacher.service';
import { TeacherDashboard } from '../../../core/models/teacher.model';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.css'
})
export class TeacherDashboardComponent implements OnInit {
  private teacherService = inject(TeacherService);

  dashboard = signal<TeacherDashboard | null>(null);
  loading = signal(true);
  
  // Helper to check if AI suggestion exists
  hasAISuggestion(): boolean {
    return !!this.dashboard()?.ai_suggestion;
  }

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading.set(true);
    this.teacherService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load teacher dashboard:', err);
        this.loading.set(false);
        this.loadMockData();
      }
    });
  }

  loadMockData() {
    const mockDashboard: TeacherDashboard = {
      teacher_name: 'Mr. Sterling',
      role: 'Lead Physics Faculty',
      current_date: 'Tuesday, October 14th',
      term: 'Term 2',
      week: 6,
      classes_today: 4,
      pending_tasks: 12,
      todays_schedule: [
        {
          id: '1',
          time_start: '09:00',
          time_end: '10:30 AM',
          subject: 'Grade 11 Physics',
          grade: 'Grade 11',
          room: 'Lab 402',
          student_count: 28,
          status: 'in_progress',
          has_lesson_plan: true
        },
        {
          id: '2',
          time_start: '11:30',
          time_end: '1:00 PM',
          subject: 'Grade 10 General Science',
          grade: 'Grade 10',
          room: 'Room 215',
          student_count: 32,
          status: 'upcoming',
          has_lesson_plan: true
        },
        {
          id: '3',
          time_start: '2:15',
          time_end: '3:45 PM',
          subject: 'AP Astrophysics',
          grade: 'AP',
          room: 'Observatory Deck',
          student_count: 12,
          status: 'upcoming',
          has_lesson_plan: true
        }
      ],
      attention_required: [
        {
          id: '1',
          student_name: 'Sarah Jenkins',
          issue: 'Low Attendance (68%)',
          action_type: 'email'
        },
        {
          id: '2',
          student_name: 'Julian Chen',
          issue: 'Grade Drop: Physics 101',
          action_type: 'call'
        }
      ],
      activity_stream: [
        {
          id: '1',
          type: 'assignment',
          icon: '📝',
          title: '14 assignments submitted for Quantum Mechanics Lab.',
          description: '22 MINUTES AGO',
          timestamp: '22 minutes ago'
        },
        {
          id: '2',
          type: 'admin',
          icon: '📅',
          title: 'Admin: Faculty meeting moved to Thursday 4 PM.',
          description: '2 HOURS AGO',
          timestamp: '2 hours ago'
        },
        {
          id: '3',
          type: 'mention',
          icon: '💬',
          title: 'Mrs. Gable mentioned you in Physics Dept Chat.',
          description: '4 HOURS AGO',
          timestamp: '4 hours ago'
        }
      ],
      task_ledger: [
        {
          id: '1',
          title: 'Grade Physics Midterm Exams',
          description: '42 papers pending • Approx 2.5hrs',
          due_date: 'Tomorrow',
          priority: 'high',
          papers_count: 42,
          estimated_hours: 2.5
        },
        {
          id: '2',
          title: 'Science Fair Rubric Prep',
          description: 'Drafting criteria for Grade 10-12',
          due_date: 'Oct 16',
          priority: 'standard'
        },
        {
          id: '3',
          title: 'Parent-Teacher Night Prep',
          description: 'Compile top 5 student highlights',
          due_date: 'Oct 18',
          priority: 'standard'
        }
      ],
      ai_suggestion: {
        title: 'ARCHITECT AI SUGGESTION',
        description: 'Based on recent quiz scores, Grade 11 might need a review session on Refraction before Friday\'s lab.',
        action_text: 'Schedule Review',
        action_link: '/teacher/schedule-review'
      }
    };

    this.dashboard.set(mockDashboard);
    this.loading.set(false);
  }

  markAttendance(classId: string) {
    console.log('Mark attendance for class:', classId);
  }

  viewLessonPlan(classId: string) {
    console.log('View lesson plan for class:', classId);
  }

  contactParent(studentName: string) {
    console.log('Contact parent for:', studentName);
  }

  logIncident() {
    console.log('Log incident');
  }

  generateReport() {
    console.log('Generate report');
  }

  openCalendar() {
    console.log('Open calendar');
  }

  scheduleReview() {
    console.log('Schedule review session');
  }
}
