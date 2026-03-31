export interface TeacherDashboard {
  teacher_name: string;
  role: string;
  current_date: string;
  term: string;
  week: number;
  classes_today: number;
  pending_tasks: number;
  todays_schedule: TeacherClass[];
  attention_required: AttentionItem[];
  activity_stream: ActivityStreamItem[];
  task_ledger: TaskItem[];
  ai_suggestion?: AISuggestion;
}

export interface TeacherClass {
  id: string;
  time_start: string;
  time_end: string;
  subject: string;
  grade: string;
  room: string;
  student_count: number;
  status: 'in_progress' | 'upcoming' | 'completed';
  has_lesson_plan?: boolean;
}

export interface AttentionItem {
  id: string;
  student_name: string;
  student_avatar?: string;
  issue: string;
  metric?: string;
  action_type: 'email' | 'call' | 'meeting';
}

export interface ActivityStreamItem {
  id: string;
  type: 'assignment' | 'admin' | 'mention';
  icon: string;
  title: string;
  description: string;
  timestamp: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  due_date: string;
  priority: 'high' | 'standard';
  papers_count?: number;
  estimated_hours?: number;
}

export interface AISuggestion {
  title: string;
  description: string;
  action_text: string;
  action_link: string;
}

export interface LessonPlan {
  id: string;
  class_id: string;
  title: string;
  objectives: string[];
  materials: string[];
  activities: LessonActivity[];
  homework?: string;
}

export interface LessonActivity {
  duration: number;
  description: string;
  type: 'lecture' | 'discussion' | 'lab' | 'assessment';
}
