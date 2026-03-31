export interface ParentDashboard {
  children: ChildOverview[];
  upcoming_events: SchoolEvent[];
}

export interface ChildOverview {
  id: string;
  name: string;
  grade: string;
  student_id: string;
  profile_image?: string;
  current_status: 'in_class' | 'absent' | 'off_campus';
  next_class?: string;
  next_class_time?: string;
  current_gpa: number;
  gpa_change: number;
  attendance_rate: number;
  attendance_excused: number;
  upcoming_payment?: {
    amount: number;
    currency: string;
    due_date: string;
    due_in_days: number;
  };
  recent_grades: RecentGrade[];
}

export interface RecentGrade {
  subject: string;
  subject_code: string;
  assessment_name: string;
  score: number;
  grade: string;
  date: string;
  teacher: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  type: 'conference' | 'fair' | 'registration' | 'meeting' | 'other';
  month: string;
  day: number;
}

export interface PaymentMethod {
  id: string;
  type: 'visa' | 'mastercard' | 'mpesa' | 'bank';
  last_four: string;
  expires?: string;
  is_default: boolean;
}

export interface AttendanceCalendar {
  student_id: string;
  student_name: string;
  grade: string;
  month: string;
  year: number;
  overall_rate: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  excused_count: number;
  days: AttendanceDay[];
  history: AttendanceHistoryItem[];
  requirement_reminder?: string;
}

export interface AttendanceDay {
  date: string;
  day_of_week: string;
  status: 'present' | 'absent' | 'late' | 'excused' | null;
}

export interface AttendanceHistoryItem {
  date: string;
  day_name: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  type?: string;
  reason?: string;
  document_url?: string;
}
