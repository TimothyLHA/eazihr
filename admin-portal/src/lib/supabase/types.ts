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

// Attendance log types (matches SQL schema)
export type AttendanceLog = {
  id: string
  employee_id: string
  organization_id: string
  date: string
  check_in: string | null
  check_out: string | null
  status: 'on_time' | 'late' | 'absent' | 'half_day'
  shift_type: string | null
  location: Json
  notes: string | null
  created_at: string
}

export type AttendanceLogInsert = {
  employee_id: string
  organization_id: string
  date: string
  check_in?: string | null
  check_out?: string | null
  status?: 'on_time' | 'late' | 'absent' | 'half_day'
  shift_type?: string | null
  location?: Json
  notes?: string | null
}

// Late log types (matches SQL schema)
export type LateLog = {
  id: string
  employee_id: string
  organization_id: string
  attendance_log_id: string | null
  date: string
  check_in_time: string | null
  minutes_late: number
  reason: string | null
  created_at: string
}

export type LateLogInsert = {
  employee_id: string
  organization_id: string
  attendance_log_id?: string | null
  date: string
  check_in_time?: string | null
  minutes_late?: number
  reason?: string | null
}

// Leave type types
export type LeaveType = {
  id: string
  organization_id: string
  name: string
  days_allowed: number
  is_paid: boolean
  carry_forward: boolean
  requires_approval: boolean
  created_at: string
}

// Leave balance types
export type LeaveBalance = {
  id: string
  employee_id: string
  organization_id: string
  leave_type_id: string
  allocated_days: number
  used_days: number
  remaining_days: number
  year: number
}

export type LeaveBalanceInsert = {
  employee_id: string
  organization_id: string
  leave_type_id: string
  allocated_days: number
  used_days?: number
  year: number
}

export type LeaveTypeInsert = {
  organization_id: string
  name: string
  days_allowed: number
  is_paid?: boolean
  carry_forward?: boolean
  requires_approval?: boolean
}

// Leave request types
export type LeaveRequest = {
  id: string
  employee_id: string
  organization_id: string
  leave_type_id: string
  start_date: string
  end_date: string
  days: number
  reason: string | null
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  approved_by: string | null
  approved_at: string | null
  created_at: string
}

export type LeaveRequestInsert = {
  employee_id: string
  organization_id: string
  leave_type_id: string
  start_date: string
  end_date: string
  days: number
  reason?: string | null
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
  approved_by?: string | null
  approved_at?: string | null
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
  payroll_run_id: string | null
  month: number
  year: number
  gross_pay: number
  deductions: number
  net_pay: number
  earnings_breakdown: Record<string, unknown> | null
  deductions_breakdown: Record<string, unknown> | null
  pdf_url: string | null
  status: 'generated' | 'sent' | 'viewed'
  generated_at: string | null
  created_at: string
}

// Incentive types
export type Incentive = {
  id: string
  employee_id: string
  organization_id: string
  type: 'bonus' | 'commission' | 'allowance' | 'other'
  amount: number
  description: string | null
  date: string
  approved_by: string | null
  created_at: string
}

// Loan types
export type Loan = {
  id: string
  employee_id: string
  organization_id: string
  amount: number
  interest_rate: number
  tenure_months: number
  monthly_emi: number
  balance: number
  purpose: string | null
  status: 'pending' | 'approved' | 'disbursed' | 'rejected' | 'closed'
  approved_by: string | null
  approved_at: string | null
  created_at: string
}

// Loan repayment types
export type LoanRepayment = {
  id: string
  loan_id: string
  amount: number
  due_date: string | null
  paid_at: string | null
  status: 'pending' | 'paid' | 'overdue'
  receipt_url: string | null
  created_at: string
}

// Overtime request types
export type OvertimeRequest = {
  id: string
  employee_id: string
  organization_id: string
  date: string
  hours: number
  rate: number
  total_amount: number | null
  reason: string | null
  status: 'pending' | 'approved' | 'rejected'
  approved_by: string | null
  approved_at: string | null
  created_at: string
}

export type OvertimeRequestInsert = {
  employee_id: string
  organization_id: string
  date: string
  hours: number
  rate?: number
  total_amount?: number | null
  reason?: string | null
  status?: 'pending' | 'approved' | 'rejected'
  approved_by?: string | null
  approved_at?: string | null
}

// Vehicle types
export type Vehicle = {
  id: string
  organization_id: string
  name: string
  plate_number: string
  driver_name: string | null
  driver_phone: string | null
  status: 'active' | 'idle' | 'maintenance' | 'out_of_service'
  last_location: Record<string, unknown> | null
  last_updated: string | null
  created_at: string
}

export type VehicleInsert = {
  organization_id: string
  name: string
  plate_number: string
  driver_name?: string | null
  driver_phone?: string | null
  status?: 'active' | 'idle' | 'maintenance' | 'out_of_service'
  last_location?: Record<string, unknown> | null
  last_updated?: string | null
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
        Insert: AttendanceLogInsert
        Update: Partial<AttendanceLogInsert>
      }
      late_logs: {
        Row: LateLog
        Insert: LateLogInsert
        Update: Partial<LateLogInsert>
      }
      leave_types: {
        Row: LeaveType
        Insert: LeaveTypeInsert
        Update: Partial<LeaveTypeInsert>
      }
      leave_balances: {
        Row: LeaveBalance
        Insert: LeaveBalanceInsert
        Update: Partial<LeaveBalanceInsert>
      }
      leave_requests: {
        Row: LeaveRequest
        Insert: LeaveRequestInsert
        Update: Partial<LeaveRequestInsert>
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
        Insert: Omit<Payslip, 'id' | 'created_at' | 'generated_at'>
        Update: Partial<Omit<Payslip, 'id' | 'created_at' | 'generated_at'>>
      }
      incentives: {
        Row: Incentive
        Insert: Omit<Incentive, 'id' | 'created_at'>
        Update: Partial<Omit<Incentive, 'id' | 'created_at'>>
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
        Insert: OvertimeRequestInsert
        Update: Partial<OvertimeRequestInsert>
      }
      vehicles: {
        Row: Vehicle
        Insert: VehicleInsert
        Update: Partial<VehicleInsert>
      }
    }
  }
}