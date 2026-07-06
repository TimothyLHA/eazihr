// Database types for EasyHR Admin Portal
// All tables include organization_id for multi-tenant isolation

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Organization types
export type Organization = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  is_active: boolean | null
  settings: Json | null
  payroll_config: Json | null
  leave_config: Json | null
  loan_config: Json | null
  feature_config: Json | null
  created_at: string | null
}

// Profile types (extends Supabase auth.users)
export type Profile = {
  id: string
  email: string
  full_name: string
  organization_id: string
  role: 'super_admin' | 'admin' | 'hr_manager' | 'manager' | 'employee'
  avatar_url: string | null
  phone: string | null
  department: string | null
  job_title: string | null
  created_at: string
  updated_at: string
}

// Employee types (matches SQL schema)
export type Employee = {
  id: string
  profile_id: string
  organization_id: string
  employee_code: string | null
  position: string | null
  department: string | null
  hire_date: string | null
  basic_salary: number | null
  status: 'active' | 'resigned' | 'suspended'
  emergency_contact: Json
  documents: Json
  created_at: string
}

export type EmployeeInsert = {
  profile_id: string
  organization_id: string
  employee_code?: string | null
  position?: string | null
  department?: string | null
  hire_date?: string | null
  basic_salary?: number | null
  status?: 'active' | 'resigned' | 'suspended'
  emergency_contact?: Json
  documents?: Json
}

// Attendance log types
export type AttendanceLog = {
  id: string
  employee_id: string
  organization_id: string
  date: string
  check_in: string | null
  check_out: string | null
  check_in_location: string | null
  check_out_location: string | null
  status: 'present' | 'absent' | 'late' | 'half_day' | 'remote'
  late_minutes: number | null
  early_departure_minutes: number | null
  overtime_minutes: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

// Late log types
export type LateLog = {
  id: string
  employee_id: string
  organization_id: string
  date: string
  minutes_late: number
  reason: string | null
  excused: boolean
  excused_by: string | null
  excused_at: string | null
  created_at: string
  updated_at: string
}

// Leave type types
export type LeaveType = {
  id: string
  organization_id: string
  name: string
  description: string | null
  days_allowed: number
  is_paid: boolean
  requires_approval: boolean
  color: string
  created_at: string
  updated_at: string
}

// Leave balance types
export type LeaveBalance = {
  id: string
  employee_id: string
  organization_id: string
  leave_type_id: string
  year: number
  total_days: number
  used_days: number
  remaining_days: number
  carried_forward_days: number
  created_at: string
  updated_at: string
}

// Leave request types
export type LeaveRequest = {
  id: string
  employee_id: string
  organization_id: string
  leave_type_id: string
  start_date: string
  end_date: string
  total_days: number
  reason: string | null
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  approved_by: string | null
  approved_at: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
}

// Payroll run types
export type PayrollRun = {
  id: string
  organization_id: string
  month: number
  year: number
  status: 'draft' | 'processing' | 'completed' | 'failed'
  total_amount: number
  total_employees: number
  processed_by: string | null
  processed_at: string | null
  created_at: string
  updated_at: string
}

// Payroll item types
export type PayrollItem = {
  id: string
  payroll_run_id: string
  employee_id: string
  organization_id: string
  basic_salary: number
  overtime_amount: number
  incentives_amount: number
  deductions_amount: number
  loan_deduction: number
  tax_amount: number
  net_salary: number
  created_at: string
  updated_at: string
}

// Payslip types
export type Payslip = {
  id: string
  employee_id: string
  organization_id: string
  payroll_run_id: string
  month: number
  year: number
  gross_salary: number
  net_salary: number
  pdf_url: string | null
  sent_to_employee: boolean
  sent_at: string | null
  created_at: string
  updated_at: string
}

// Incentive types
export type Incentive = {
  id: string
  employee_id: string
  organization_id: string
  type: 'bonus' | 'commission' | 'performance' | 'referral' | 'other'
  amount: number
  description: string | null
  month: number
  year: number
  approved_by: string | null
  created_at: string
  updated_at: string
}

// Loan types
export type Loan = {
  id: string
  employee_id: string
  organization_id: string
  amount: number
  interest_rate: number
  total_amount: number
  remaining_balance: number
  purpose: string | null
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'defaulted'
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
}

// Loan repayment types
export type LoanRepayment = {
  id: string
  loan_id: string
  amount: number
  payment_method: string | null
  reference_number: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// Overtime request types
export type OvertimeRequest = {
  id: string
  employee_id: string
  organization_id: string
  date: string
  start_time: string
  end_time: string
  hours: number
  reason: string | null
  status: 'pending' | 'approved' | 'rejected'
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
}

// Vehicle types
export type Vehicle = {
  id: string
  organization_id: string
  plate_number: string
  make: string
  model: string
  year: number
  color: string
  driver_id: string | null
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_service'
  current_location: string | null
  last_maintenance_date: string | null
  next_maintenance_date: string | null
  created_at: string
  updated_at: string
}

// Database schema types for queries
export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: Organization
        Insert: Omit<Organization, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Organization, 'id' | 'created_at' | 'updated_at'>>
      }
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
      }
      employees: {
        Row: Employee
        Insert: EmployeeInsert
        Update: Partial<EmployeeInsert>
      }
      attendance_logs: {
        Row: AttendanceLog
        Insert: Omit<AttendanceLog, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<AttendanceLog, 'id' | 'created_at' | 'updated_at'>>
      }
      late_logs: {
        Row: LateLog
        Insert: Omit<LateLog, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<LateLog, 'id' | 'created_at' | 'updated_at'>>
      }
      leave_types: {
        Row: LeaveType
        Insert: Omit<LeaveType, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<LeaveType, 'id' | 'created_at' | 'updated_at'>>
      }
      leave_balances: {
        Row: LeaveBalance
        Insert: Omit<LeaveBalance, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<LeaveBalance, 'id' | 'created_at' | 'updated_at'>>
      }
      leave_requests: {
        Row: LeaveRequest
        Insert: Omit<LeaveRequest, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<LeaveRequest, 'id' | 'created_at' | 'updated_at'>>
      }
      payroll_runs: {
        Row: PayrollRun
        Insert: Omit<PayrollRun, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<PayrollRun, 'id' | 'created_at' | 'updated_at'>>
      }
      payroll_items: {
        Row: PayrollItem
        Insert: Omit<PayrollItem, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<PayrollItem, 'id' | 'created_at' | 'updated_at'>>
      }
      payslips: {
        Row: Payslip
        Insert: Omit<Payslip, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Payslip, 'id' | 'created_at' | 'updated_at'>>
      }
      incentives: {
        Row: Incentive
        Insert: Omit<Incentive, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Incentive, 'id' | 'created_at' | 'updated_at'>>
      }
      loans: {
        Row: Loan
        Insert: Omit<Loan, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Loan, 'id' | 'created_at' | 'updated_at'>>
      }
      loan_repayments: {
        Row: LoanRepayment
        Insert: Omit<LoanRepayment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<LoanRepayment, 'id' | 'created_at' | 'updated_at'>>
      }
      overtime_requests: {
        Row: OvertimeRequest
        Insert: Omit<OvertimeRequest, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<OvertimeRequest, 'id' | 'created_at' | 'updated_at'>>
      }
      vehicles: {
        Row: Vehicle
        Insert: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}