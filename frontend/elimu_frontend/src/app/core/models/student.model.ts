export interface Student {
  id: string;
  admission_number: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  date_of_birth: string;
  gender: 'M' | 'F' | 'O';
  email?: string;
  phone?: string;
  photo?: string;
  current_grade?: string;
  current_section?: string;
  enrollment_status: 'active' | 'inactive' | 'graduated' | 'transferred';
  enrollment_date: string;
  gpa?: number;
  attendance_rate?: number;
  fee_status?: 'paid' | 'partial' | 'unpaid';
  balance?: number;
}

export interface Guardian {
  id: string;
  first_name: string;
  last_name: string;
  relationship: string;
  email?: string;
  phone?: string;
  is_primary: boolean;
  occupation?: string;
}

export interface StudentDetail extends Student {
  guardians: Guardian[];
  health_info?: {
    blood_group?: string;
    allergies?: string[];
  };
  recent_grades?: {
    subject: string;
    grade: string;
    score: number;
    date: string;
  }[];
  upcoming_payment?: {
    amount: number;
    currency: string;
    due_date: string;
  };
}
