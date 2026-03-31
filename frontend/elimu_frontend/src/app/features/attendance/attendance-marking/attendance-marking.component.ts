import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../../core/services/attendance.service';
import { AttendanceRecord } from '../../../core/models/attendance.model';

@Component({
  selector: 'app-attendance-marking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance-marking.component.html',
  styleUrl: './attendance-marking.component.css'
})
export class AttendanceMarkingComponent implements OnInit {
  private attendanceService = inject(AttendanceService);

  selectedDate = signal(new Date().toISOString().split('T')[0]);
  selectedGrade = signal('10');
  selectedSection = signal('A');
  
  records = signal<AttendanceRecord[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.loadMockData();
  }

  loadMockData() {
    const mockRecords: AttendanceRecord[] = [
      { id: '1', session_id: '1', student_id: '1', student_name: 'Abraham, Marcus', status: 'present', marked_at: new Date().toISOString() },
      { id: '2', session_id: '1', student_id: '2', student_name: 'Bellamy, Sarah', status: 'absent', marked_at: new Date().toISOString() },
      { id: '3', session_id: '1', student_id: '3', student_name: 'Chen, Wei', status: 'late', marked_at: new Date().toISOString() },
      { id: '4', session_id: '1', student_id: '4', student_name: 'Davidson, Emily', status: 'present', marked_at: new Date().toISOString() },
      { id: '5', session_id: '1', student_id: '5', student_name: 'Ebrahim, Omar', status: 'present', marked_at: new Date().toISOString() },
    ];
    this.records.set(mockRecords);
  }

  setStatus(record: AttendanceRecord, status: 'present' | 'absent' | 'late') {
    const updated = this.records().map(r => 
      r.id === record.id ? { ...r, status } : r
    );
    this.records.set(updated);
  }

  markAllPresent() {
    const updated = this.records().map(r => ({ ...r, status: 'present' as const }));
    this.records.set(updated);
  }

  get summary() {
    const records = this.records();
    return {
      total: records.length,
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length
    };
  }
}
