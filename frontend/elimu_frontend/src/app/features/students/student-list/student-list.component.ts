import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../../core/services/student.service';
import { Student } from '../../../core/models/student.model';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.css'
})
export class StudentListComponent implements OnInit {
  private studentService = inject(StudentService);

  students = signal<Student[]>([]);
  loading = signal(true);
  selectedStudents = signal<Set<string>>(new Set());
  
  // Filters
  searchQuery = signal('');
  selectedGrade = signal('all');
  selectedSection = signal('all');
  selectedStatus = signal('active');
  
  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);
  
  // Make Math available in template
  protected readonly Math = Math;
  totalCount = signal(0);

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    this.loading.set(true);
    
    const params = {
      page: this.currentPage(),
      page_size: this.pageSize(),
      search: this.searchQuery() || undefined,
      grade: this.selectedGrade() !== 'all' ? this.selectedGrade() : undefined,
      section: this.selectedSection() !== 'all' ? this.selectedSection() : undefined,
      status: this.selectedStatus()
    };

    this.studentService.getStudents(params).subscribe({
      next: (response) => {
        this.students.set(response.results);
        this.totalCount.set(response.count);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load students:', err);
        this.loading.set(false);
        this.loadMockData();
      }
    });
  }

  loadMockData() {
    const mockStudents: Student[] = [
      {
        id: '1',
        admission_number: '#SID-2024-001',
        first_name: 'Alex',
        last_name: 'Thompson',
        email: 'alex.t@school.edu',
        phone: '+1 (555) 012-3456',
        date_of_birth: '2008-05-15',
        gender: 'M',
        current_grade: '11-A',
        enrollment_status: 'active',
        enrollment_date: '2020-09-01',
        gpa: 3.8,
        attendance_rate: 98,
        fee_status: 'paid',
        photo: undefined
      },
      {
        id: '2',
        admission_number: '#SID-2024-084',
        first_name: 'Elena',
        last_name: 'Rodriguez',
        email: 'elena.r@school.edu',
        phone: '+1 (555) 098-7654',
        date_of_birth: '2009-03-22',
        gender: 'F',
        current_grade: '10-C',
        enrollment_status: 'active',
        enrollment_date: '2021-09-01',
        gpa: 3.5,
        attendance_rate: 85,
        fee_status: 'partial',
        photo: undefined
      },
      {
        id: '3',
        admission_number: '#SID-2024-112',
        first_name: 'Marcus',
        last_name: 'Chen',
        email: 'm.chen@school.edu',
        phone: '+1 (555) 234-5678',
        date_of_birth: '2008-11-08',
        gender: 'M',
        current_grade: '12-B',
        enrollment_status: 'active',
        enrollment_date: '2019-09-01',
        gpa: 2.8,
        attendance_rate: 72,
        fee_status: 'unpaid',
        photo: undefined
      }
    ];

    this.students.set(mockStudents);
    this.totalCount.set(1284);
    this.loading.set(false);
  }

  toggleStudent(studentId: string) {
    const selected = new Set(this.selectedStudents());
    if (selected.has(studentId)) {
      selected.delete(studentId);
    } else {
      selected.add(studentId);
    }
    this.selectedStudents.set(selected);
  }

  toggleAll() {
    const selected = this.selectedStudents();
    if (selected.size === this.students().length) {
      this.selectedStudents.set(new Set());
    } else {
      this.selectedStudents.set(new Set(this.students().map(s => s.id)));
    }
  }

  isSelected(studentId: string): boolean {
    return this.selectedStudents().has(studentId);
  }

  get allSelected(): boolean {
    return this.students().length > 0 && this.selectedStudents().size === this.students().length;
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.currentPage.set(1);
    this.loadStudents();
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadStudents();
  }

  clearFilters() {
    this.searchQuery.set('');
    this.selectedGrade.set('all');
    this.selectedSection.set('all');
    this.selectedStatus.set('active');
    this.currentPage.set(1);
    this.loadStudents();
  }

  goToPage(page: number) {
    this.currentPage.set(page);
    this.loadStudents();
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount() / this.pageSize());
  }

  get pages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage();
    const pages: number[] = [];
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, -1, total);
      } else if (current >= total - 2) {
        pages.push(1, -1, total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, -1, current - 1, current, current + 1, -1, total);
      }
    }
    
    return pages;
  }

  getFeeStatusClass(status?: string): string {
    switch (status) {
      case 'paid': return 'badge-success';
      case 'partial': return 'badge-warning';
      case 'unpaid': return 'badge-danger';
      default: return 'badge-gray';
    }
  }

  getFeeStatusText(status?: string): string {
    switch (status) {
      case 'paid': return 'Paid';
      case 'partial': return 'Partial';
      case 'unpaid': return 'Unpaid';
      default: return 'Unknown';
    }
  }
}
