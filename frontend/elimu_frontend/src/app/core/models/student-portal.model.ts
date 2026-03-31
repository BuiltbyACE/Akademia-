export interface StudentDashboard {
  student_id: string;
  name: string;
  academic_year: string;
  current_week: number;
  semester: number;
  campus_status: 'open' | 'closed';
  current_gpa: number;
  gpa_change: number;
  gpa_since: string;
  attendance_rate: number;
  attendance_target: number;
  pending_tasks: number;
  tasks_due_today: number;
  class_progress: number;
  semester_completion: number;
  todays_schedule: ScheduleItem[];
  upcoming_tasks: Task[];
  recent_grades: StudentGrade[];
  announcements: Announcement[];
}

export interface ScheduleItem {
  id: string;
  time: string;
  subject: string;
  teacher: string;
  room: string;
  type: 'lecture' | 'practical' | 'seminar' | 'lab';
  is_new?: boolean;
}

export interface Task {
  id: string;
  title: string;
  course: string;
  due_date: string;
  due_time: string;
  priority: 'high' | 'standard' | 'low';
  status: 'pending' | 'completed';
}

export interface StudentGrade {
  subject: string;
  assessment: string;
  grade: string;
  date: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  icon: string;
  published: string;
  category: 'maintenance' | 'sports' | 'academic' | 'general';
}

export interface AcademicResults {
  student_id: string;
  current_semester_gpa: number;
  gpa_change: number;
  credits_earned: number;
  credits_total: number;
  rank_percentile: number;
  grade_trends: GradeTrend[];
  transcript: TranscriptItem[];
}

export interface GradeTrend {
  semester: string;
  gpa: number;
  average: number;
}

export interface TranscriptItem {
  id: string;
  subject: string;
  subject_icon: string;
  assessment_type: string;
  weightage: number;
  date: string;
  grade: string;
  score?: number;
}

export interface ClassSchedule {
  week_start: string;
  week_end: string;
  schedule: DaySchedule[];
  upcoming_exams: UpcomingExam[];
  study_plan: StudyPlanItem[];
  daily_goal?: string;
  goal_progress?: number;
}

export interface DaySchedule {
  day: string;
  date: string;
  classes: ClassItem[];
}

export interface ClassItem {
  time: string;
  subject: string;
  teacher: string;
  room: string;
  type: 'lecture' | 'practical' | 'seminar' | 'lab';
  category: string;
}

export interface UpcomingExam {
  id: string;
  subject: string;
  title: string;
  description: string;
  priority: 'high' | 'standard';
  days_until: number;
}

export interface StudyPlanItem {
  id: string;
  task: string;
  completed: boolean;
}
