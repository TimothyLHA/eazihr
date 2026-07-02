-- EasyHR Initial Database Schema
-- Organizations
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  is_active boolean default true,
  settings jsonb default '{}'::jsonb,
  payroll_config jsonb default '{"currency": "USD", "payroll_cutoff_day": 25, "payday": "month_end", "overtime_rate": 1.5, "overtime_max_hours_per_week": 40, "tax_type": "progressive", "tax_percentage": 10}'::jsonb,
  leave_config jsonb default '{"types": ["annual", "sick", "personal"], "annual_leave_days": 18, "sick_leave_days": 15, "personal_leave_days": 5, "carry_forward": true, "carry_forward_limit": 5, "requires_approval": true}'::jsonb,
  loan_config jsonb default '{"enabled": true, "max_amount": 10000, "interest_rate": 4.0, "min_tenure_months": 3, "max_tenure_months": 24, "requires_approval": true}'::jsonb,
  feature_config jsonb default '{"vehicle_tracking": false, "live_tracking": true, "overtime": true, "incentives": true}'::jsonb,
  created_at timestamptz default now()
);

-- Profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  phone text,
  organization_id uuid references organizations(id) not null,
  role text check (role in ('super_admin', 'org_admin', 'hr_manager', 'employee')) not null default 'employee',
  is_active boolean default true,
  created_at timestamptz default now()
);

create index idx_profiles_org on profiles(organization_id);

-- Auth trigger: auto-create profile on signup
create function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, organization_id, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'organization_id',
    'admin'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Employees
create table employees (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) not null,
  organization_id uuid references organizations(id) not null,
  employee_code text,
  position text,
  department text,
  hire_date date,
  basic_salary numeric(12,2) default 0,
  status text check (status in ('active', 'resigned', 'suspended')) default 'active',
  emergency_contact jsonb default '{}'::jsonb,
  documents jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  unique(organization_id, employee_code)
);

create index idx_employees_org on employees(organization_id);
create index idx_employees_department on employees(organization_id, department);

-- Attendance
create table attendance_logs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id) not null,
  organization_id uuid references organizations(id) not null,
  date date not null default current_date,
  check_in timestamptz,
  check_out timestamptz,
  status text check (status in ('on_time', 'late', 'absent', 'half_day')) default 'on_time',
  shift_type text default 'morning',
  location jsonb default '{}'::jsonb,
  notes text,
  created_at timestamptz default now(),
  unique(employee_id, date)
);

create index idx_attendance_org_date on attendance_logs(organization_id, date);

create table late_logs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id) not null,
  organization_id uuid references organizations(id) not null,
  attendance_log_id uuid references attendance_logs(id),
  date date not null,
  check_in_time time,
  minutes_late int not null default 0,
  reason text,
  created_at timestamptz default now()
);

create index idx_late_logs_org on late_logs(organization_id);

-- Leave Management
create table leave_types (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) not null,
  name text not null,
  days_allowed int not null,
  is_paid boolean default true,
  carry_forward boolean default false,
  requires_approval boolean default true,
  created_at timestamptz default now(),
  unique(organization_id, name)
);

create table leave_balances (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id) not null,
  organization_id uuid references organizations(id) not null,
  leave_type_id uuid references leave_types(id) not null,
  allocated_days int not null,
  used_days int default 0,
  remaining_days int generated always as (allocated_days - used_days) stored,
  year int not null default extract(year from current_date),
  unique(employee_id, leave_type_id, year)
);

create table leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id) not null,
  organization_id uuid references organizations(id) not null,
  leave_type_id uuid references leave_types(id) not null,
  start_date date not null,
  end_date date not null,
  days numeric(4,1) not null,
  reason text,
  status text check (status in ('pending', 'approved', 'rejected', 'cancelled')) default 'pending',
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  created_at timestamptz default now()
);

create index idx_leave_requests_org_status on leave_requests(organization_id, status);

-- Payroll
create table payroll_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) not null,
  month int not null check (month between 1 and 12),
  year int not null,
  status text check (status in ('draft', 'processing', 'completed', 'cancelled')) default 'draft',
  total_amount numeric(14,2) default 0,
  employee_count int default 0,
  executed_by uuid references profiles(id),
  executed_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  unique(organization_id, month, year)
);

create table payroll_items (
  id uuid primary key default gen_random_uuid(),
  payroll_run_id uuid references payroll_runs(id) not null,
  employee_id uuid references employees(id) not null,
  organization_id uuid references organizations(id) not null,
  basic_salary numeric(12,2) default 0,
  overtime_amount numeric(12,2) default 0,
  incentives_amount numeric(12,2) default 0,
  deductions numeric(12,2) default 0,
  net_pay numeric(12,2) generated always as (basic_salary + overtime_amount + incentives_amount - deductions) stored,
  status text check (status in ('pending', 'generated', 'paid')) default 'pending',
  created_at timestamptz default now()
);

-- Payslips
create table payslips (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id) not null,
  organization_id uuid references organizations(id) not null,
  payroll_run_id uuid references payroll_runs(id),
  month int not null,
  year int not null,
  gross_pay numeric(12,2) not null,
  deductions numeric(12,2) default 0,
  net_pay numeric(12,2) not null,
  earnings_breakdown jsonb default '{}'::jsonb,
  deductions_breakdown jsonb default '{}'::jsonb,
  pdf_url text,
  status text check (status in ('generated', 'sent', 'viewed')) default 'generated',
  generated_at timestamptz default now(),
  unique(employee_id, month, year)
);

-- Incentives
create table incentives (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id) not null,
  organization_id uuid references organizations(id) not null,
  type text check (type in ('bonus', 'commission', 'allowance', 'other')) not null,
  amount numeric(10,2) not null,
  description text,
  date date not null default current_date,
  approved_by uuid references profiles(id),
  created_at timestamptz default now()
);

create index idx_incentives_org_month on incentives(organization_id, date);

-- Loans
create table loans (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id) not null,
  organization_id uuid references organizations(id) not null,
  amount numeric(12,2) not null,
  interest_rate numeric(5,2) default 0,
  tenure_months int not null,
  monthly_emi numeric(10,2),
  balance numeric(12,2) default 0,
  purpose text,
  status text check (status in ('pending', 'approved', 'disbursed', 'rejected', 'closed')) default 'pending',
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  created_at timestamptz default now()
);

create table loan_repayments (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid references loans(id) not null,
  amount numeric(10,2) not null,
  due_date date,
  paid_at timestamptz,
  status text check (status in ('pending', 'paid', 'overdue')) default 'pending',
  receipt_url text,
  created_at timestamptz default now()
);

-- Overtime
create table overtime_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id) not null,
  organization_id uuid references organizations(id) not null,
  date date not null,
  hours numeric(5,2) not null,
  rate numeric(5,2) default 1.5,
  total_amount numeric(10,2),
  reason text,
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  created_at timestamptz default now()
);

-- Vehicles
create table vehicles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) not null,
  name text not null,
  plate_number text not null,
  driver_name text,
  driver_phone text,
  status text check (status in ('active', 'idle', 'maintenance', 'out_of_service')) default 'idle',
  last_location jsonb default '{}'::jsonb,
  last_updated timestamptz,
  created_at timestamptz default now(),
  unique(organization_id, plate_number)
);
