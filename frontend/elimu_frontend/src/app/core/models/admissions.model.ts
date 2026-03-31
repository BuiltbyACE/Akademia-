export interface AdmissionsPipeline {
  academic_year: string;
  stages: PipelineStage[];
  stats: {
    total_applicants: number;
    active_pipeline: number;
  };
}

export interface PipelineStage {
  id: string;
  name: 'inquiry' | 'applied' | 'interviewing' | 'accepted' | 'enrolled';
  display_name: string;
  count: number;
  applicants: Applicant[];
}

export interface Applicant {
  id: string;
  name: string;
  grade: string;
  program?: string;
  applied_date?: string;
  priority: 'standard' | 'high' | 'pending';
  status_badge?: string;
  documents_verified?: boolean;
  interview_scheduled?: boolean;
  interview_date?: string;
  interview_time?: string;
  assigned_to?: string;
  notes?: string;
  contact_email?: string;
  contact_phone?: string;
  scholarship?: string;
}

export interface ApplicantDetail extends Applicant {
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  date_of_birth: string;
  previous_school?: string;
  test_scores?: TestScore[];
  documents: ApplicantDocument[];
  timeline: TimelineEvent[];
  notes_history: Note[];
}

export interface TestScore {
  test_name: string;
  score: number;
  max_score: number;
  date: string;
}

export interface ApplicantDocument {
  id: string;
  name: string;
  type: string;
  uploaded_date: string;
  verified: boolean;
}

export interface TimelineEvent {
  id: string;
  date: string;
  time: string;
  event: string;
  user?: string;
}

export interface Note {
  id: string;
  date: string;
  author: string;
  content: string;
}

export interface AdmissionsAnalytics {
  enrollment_cycle: string;
  total_applications: number;
  total_applications_change: number;
  conversion_rate: number;
  conversion_rate_change: number;
  yield_rate: number;
  yield_rate_change: number;
  time_to_enroll: number;
  time_to_enroll_change: number;
  pipeline_funnel: PipelineFunnelStage[];
  recent_activity: RecentActivityItem[];
  enrollment_trends: EnrollmentTrendData[];
  applications_by_grade: GradeApplicationData[];
}

export interface PipelineFunnelStage {
  stage: string;
  count: number;
  percentage: number;
}

export interface RecentActivityItem {
  id: string;
  applicant_name: string;
  applicant_avatar?: string;
  activity_type: 'application' | 'status_change' | 'document_upload' | 'interview';
  description: string;
  timestamp: string;
}

export interface EnrollmentTrendData {
  month: string;
  current_year: number;
  previous_year: number;
}

export interface GradeApplicationData {
  grade: string;
  count: number;
  max_count?: number;
}

export interface InterviewAssessment {
  academic_readiness: number;
  cultural_fit: number;
  notes: string;
  last_updated: string;
  updated_by: string;
}

export interface DocumentChecklistItem {
  id: string;
  name: string;
  status: 'received' | 'pending' | 'requested';
}
