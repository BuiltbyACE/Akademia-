export interface Invoice {
  id: string;
  invoice_number: string;
  student_id: string;
  student_name: string;
  student_grade?: string;
  student_section?: string;
  total_amount: number;
  amount_paid: number;
  balance: number;
  currency: string;
  status: 'draft' | 'issued' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
  issue_date: string;
  due_date: string;
  payment_method?: 'cash' | 'bank' | 'mpesa' | 'card';
}

export interface Payment {
  id: string;
  payment_reference: string;
  invoice_id: string;
  student_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_date: string;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  transaction_id?: string;
  receipt_number?: string;
}

export interface FeeStructure {
  id: string;
  name: string;
  fee_type: 'academic' | 'facility' | 'extracurricular' | 'other';
  frequency: 'one-time' | 'term-based' | 'monthly' | 'annual';
  total_amount: number;
  currency: string;
  components: FeeComponent[];
  assigned_grades: string[];
  is_active: boolean;
}

export interface FeeComponent {
  name: string;
  amount: number;
  description?: string;
}

export interface FinanceOverview {
  total_revenue: number;
  outstanding_fees: number;
  total_expenses: number;
  collection_rate: number;
  currency: string;
  revenue_trend: {
    period: string;
    projected: number;
    collected: number;
  }[];
  fee_by_grade: {
    grade: string;
    amount: number;
  }[];
  recent_transactions: Payment[];
}
