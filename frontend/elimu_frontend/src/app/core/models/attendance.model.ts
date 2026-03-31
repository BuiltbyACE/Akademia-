export interface AttendanceSession {
  id: string;
  class_id: string;
  term_id: string;
  date: string;
  session_type: 'daily' | 'period';
  period_number?: number;
  period_name?: string;
  marked_by?: string;
  marked_at?: string;
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  student_id: string;
  student_name: string;
  student_photo?: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  marked_at?: string;
}

export interface AttendanceSummary {
  total_students: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
}

export interface AttendanceMarkingRequest {
  session_id?: string;
  class_id: string;
  date: string;
  records: {
    student_id: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    notes?: string;
  }[];
}
