export interface DashboardMetrics {
  total_students: number;
  total_students_change: number;
  total_revenue: number;
  total_revenue_change: number;
  avg_attendance: number;
  avg_attendance_change: number;
  outstanding_fees: number;
  outstanding_fees_change: number;
  currency: string;
}

export interface RevenueAnalytics {
  labels: string[];
  projected: number[];
  collected: number[];
}

export interface WeeklyAttendance {
  days: string[];
  rates: number[];
  highest_day: string;
  highest_rate: number;
}

export interface ActivityItem {
  id: string;
  type: 'admission' | 'payment' | 'attendance' | 'grade' | 'announcement';
  title: string;
  description: string;
  timestamp: string;
  icon?: string;
}

export interface Alert {
  id: string;
  type: 'attendance' | 'fee' | 'behavior' | 'academic';
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  action_url?: string;
  created_at: string;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  revenue_analytics: RevenueAnalytics;
  weekly_attendance: WeeklyAttendance;
  recent_activity: ActivityItem[];
  alerts: Alert[];
  fee_defaulters_count: number;
  pending_approvals_count: number;
  upcoming_events: {
    date: string;
    title: string;
    description: string;
  }[];
}
