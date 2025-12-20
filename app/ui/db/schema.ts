// This file defines the core TypeScript types for the application's data models.
// It is based on the schema defined in `docs/database-schema.md`.

export type UserRole = "director" | "secretary" | "accountant" | "teacher" | "academic_director";
export type StudentStatus = "active" | "withdrawn" | "graduated" | "pending";
export type PaymentStatus = "paid" | "pending" | "overdue" | "cancelled";
export type PaymentCategory = "tuition" | "fees" | "transport" | "canteen" | "other_income";
export type ActivityType = "class" | "club" | "sport";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  avatar_url?: string;
}

export interface Period {
  id: number;
  name: string; // e.g., "2024-2025"
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_email: string;
  status: StudentStatus;
  class_id?: number; // Reference to an Activity of type 'class'
  enrollment_date: string;
  balance: number; // Calculated field: total fees - total payments
  avatar_url?: string;
}

export interface Payment {
  id: number;
  student_id: number;
  period_id: number;
  amount: number;
  status: PaymentStatus;
  category: PaymentCategory;
  due_date: string;
  paid_at?: string;
  transaction_id?: string;
  description: string;
}

export interface Activity {
  id: number;
  name: string;
  type: ActivityType;
  teacher_id?: number; // User ID
  period_id: number;
  description?: string;
}
