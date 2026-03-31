export interface Grade {
  id: string;
  name: string;
  level: number;
  description?: string;
}

export interface Class {
  id: string;
  name: string;
  grade_id: string;
  grade_name: string;
  section: string;
  academic_year_id: string;
  capacity?: number;
  current_enrollment?: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface ExamCycle {
  id: string;
  name: string;
  term_id: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'completed';
}

export interface StudentGrade {
  id: string;
  student_id: string;
  student_name: string;
  student_number: string;
  grades: {
    subject_id: string;
    subject_name: string;
    score?: number;
    grade?: string;
    status: 'graded' | 'pending';
  }[];
}

export interface GradingInsight {
  average_score: number;
  trend: number;
  recommendation: string;
}

export interface ReportCard {
  id: string;
  student_id: string;
  student_name: string;
  student_number: string;
  grade: string;
  section: string;
  term: string;
  academic_year: string;
  faculty_advisor: string;
  issue_date: string;
  subjects: {
    subject: string;
    score: number;
    max_score: number;
    grade: string;
    remark: string;
  }[];
  gpa: number;
  gpa_trend: {
    term: string;
    gpa: number;
  }[];
  attendance_rate: number;
  attendance_days: number;
  total_days: number;
  teacher_remarks: string;
}
