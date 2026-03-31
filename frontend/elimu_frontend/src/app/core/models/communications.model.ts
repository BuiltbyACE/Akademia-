export interface SentMessage {
  id: string;
  channel: 'email' | 'sms' | 'push';
  recipient: string;
  recipient_group?: string;
  subject: string;
  date: string;
  time: string;
  status: 'read' | 'delivered' | 'sent' | 'failed';
}

export interface CommunicationsMetrics {
  delivery_rate: number;
  delivery_rate_change: number;
  messages_sent: number;
  open_rate: number;
  open_rate_change: number;
  failed_messages: number;
  risk_level: 'low' | 'medium' | 'high';
}

export interface MessageLog {
  id: string;
  student_name?: string;
  parent_name?: string;
  recipient_type: 'student' | 'parent';
  grade?: string;
  date: string;
  time: string;
  channel: 'email' | 'sms' | 'push';
  status: 'delivered' | 'sent' | 'failed';
  error_code?: string;
}

export interface MessageComposer {
  recipient_group: string;
  template: string;
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  subject: string;
  body: string;
  smart_tags: string[];
  reach: number;
  sms_charge_note?: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  category: string;
  subject?: string;
  body: string;
}

export interface RecipientGroup {
  id: string;
  name: string;
  count: number;
  description?: string;
}

export interface DeliveryAnalytics {
  time_period: string;
  delivery_rate: number;
  open_rate: number;
  failed_messages: number;
  total_sent: number;
  by_channel: {
    email: ChannelStats;
    sms: ChannelStats;
    push: ChannelStats;
  };
  automated_audit?: {
    health_score: number;
    main_issue: string;
    recommendation: string;
  };
}

export interface ChannelStats {
  sent: number;
  delivered: number;
  failed: number;
  delivery_rate: number;
}
