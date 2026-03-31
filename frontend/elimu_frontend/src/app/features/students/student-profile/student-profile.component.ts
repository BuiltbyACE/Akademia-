import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { StudentService } from '../../../core/services/student.service';
import { StudentDetail } from '../../../core/models/student.model';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-profile.component.html',
  styleUrl: './student-profile.component.css'
})
export class StudentProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private studentService = inject(StudentService);

  student = signal<StudentDetail | null>(null);
  loading = signal(true);
  activeTab = signal('overview');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadStudent(id);
    }
  }

  loadStudent(id: string) {
    this.loading.set(true);
    this.studentService.getStudent(id).subscribe({
      next: (data) => {
        this.student.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load student:', err);
        this.loading.set(false);
        this.loadMockData();
      }
    });
  }

  loadMockData() {
    const mockStudent: StudentDetail = {
      id: '1',
      admission_number: '#STU-2024-0892',
      first_name: 'Benjamin',
      last_name: 'Harrison',
      date_of_birth: '2008-03-15',
      gender: 'M',
      email: 'b.harrison@student.schools.edu',
      phone: '+1 (555) 234-9871',
      current_grade: 'Grade 11 - Section B (Science)',
      enrollment_status: 'active',
      enrollment_date: '2020-09-01',
      gpa: 3.88,
      attendance_rate: 94,
      guardians: [
        {
          id: '1',
          first_name: 'Marcus',
          last_name: 'Harrison',
          relationship: 'Father',
          email: 'marcus.h@email.com',
          phone: '+1 (555) 234-9871',
          is_primary: true,
          occupation: 'Software Engineer'
        },
        {
          id: '2',
          first_name: 'Sarah',
          last_name: 'Harrison',
          relationship: 'Mother',
          email: 'sarah.h@email.com',
          phone: '+1 (555) 234-9872',
          is_primary: false,
          occupation: 'Pediatrician'
        }
      ],
      health_info: {
        blood_group: 'O Positive',
        allergies: ['Peanuts', 'Shellfish']
      },
      recent_grades: [
        { subject: 'Physics: Quantum Mechanics', grade: 'A-', score: 92, date: 'Mid-Term Assessment • 12 Oct' },
        { subject: 'Advanced Calculus', grade: 'B+', score: 88, date: 'Weekly Quiz • 08 Oct' },
        { subject: 'English Literature', grade: 'A', score: 95, date: 'Essay: Modernism • 05 Oct' }
      ],
      upcoming_payment: {
        amount: 2450.00,
        currency: '$',
        due_date: 'November 01, 2024'
      }
    };

    this.student.set(mockStudent);
    this.loading.set(false);
  }

  setActiveTab(tab: string) {
    this.activeTab.set(tab);
  }
}
