export interface PerformanceMetrics {
  avg_school_gpa: number;
  gpa_change: number;
  pass_rate: number;
  pass_rate_change: number;
  at_risk_students: number;
  at_risk_change: number;
  subject_completion: number;
  subject_completion_status: string;
}

export interface PassRateByGrade {
  grade: string;
  passing: number;
  failing: number;
}

export interface SubjectMastery {
  subjects: string[];
  scores: number[];
}

export interface SubjectPerformance {
  subject: string;
  percentage: number;
}

export interface GPATrend {
  terms: string[];
  current: number[];
  average: number[];
}

export interface InterventionStudent {
  id: string;
  name: string;
  photo?: string;
  grade: string;
  gpa: number;
  failed_subjects: number;
  priority: 'high' | 'medium' | 'low';
  action: string;
}

export interface PerformanceAnalytics {
  metrics: PerformanceMetrics;
  pass_rate_by_grade: PassRateByGrade[];
  subject_mastery: SubjectMastery;
  subject_performance: SubjectPerformance[];
  gpa_trends: GPATrend;
  intervention_required: InterventionStudent[];
}
