# EasyHR — Supabase Database Plan

## Overview

- **Platform**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Clients**: Next.js (Web Admin Portal) + Flutter (Admin App, Staff App)
- **Approach**: Multi-tenant (organization_id on every table)

---

## Project Structure (SQL)

```
supabase/
├── migrations/
│   ├── 001_organizations.sql
│   ├── 002_profiles.sql
│   ├── 003_employees.sql
│   ├── 004_attendance.sql
│   ├── 005_leave.sql
│   ├── 006_payroll.sql
│   ├── 007_payslips.sql
│   ├── 008_incentives.sql
│   ├── 009_loans.sql
│   ├── 010_overtime.sql
│   ├── 011_vehicles.sql
│   └── 012_rls_policies.sql
├── seed.sql
└── functions/
    ├── calculate_payroll.sql
    ├── generate_payslip.sql
    └── approve_leave.sql
```

---

## Phase 1: Foundation (Organizations & Auth)

### Table: `organizations`

```sql
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  is_active boolean default true,
  settings jsonb default '{}'::jsonb,
  -- Org-specific payroll rules
  payroll_config jsonb default '{
    "currency": "USD",
    "payroll_cutoff_day": 25,
    "payday": "month_end",
    "overtime_rate": 1.5,
    "overtime_max_hours_per_week": 40,
    "tax_type": "progressive",
    "tax_percentage": 10
  }'::jsonb,
  -- Org-specific leave rules
  leave_config jsonb default '{
    "types": ["annual", "sick", "personal"],
    "annual_leave_days": 18,
    "sick_leave_days": 15,
    "personal_leave_days": 5,
    "carry_forward": true,
    "carry_forward_limit": 5,
    "requires_approval": true
  }'::jsonb,
  -- Org-specific loan rules
  loan_config jsonb default '{
    "enabled": true,
    "max_amount": 10000,
    "interest_rate": 4.0,
    "min_tenure_months": 3,
    "max_tenure_months": 24,
    "requires_approval": true
  }'::jsonb,
  -- Org-specific feature toggles
  feature_config jsonb default '{
    "vehicle_tracking": false,
    "live_tracking": true,
    "overtime": true,
    "incentives": true
  }'::jsonb,
  created_at timestamptz default now()
);
```

### Supabase Auth Setup

- Enable `email + password` sign-up
- Enable `email confirmations` (optional)
- Custom JWT claim: include `organization_id` in access token

**How**: Use Supabase Auth hooks or trigger on `auth.users` insert to auto-create profile + set org.

### Auth Trigger: Auto-create profile on signup

```sql
-- After user signs up, create a profile row
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
```

---

## Phase 2: Profiles & Employees

### Table: `profiles`

```sql
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

-- Index for multi-tenant queries
create index idx_profiles_org on profiles(organization_id);
```

### Table: `employees`

```sql
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
```

---

## Phase 3: Attendance

### Table: `attendance_logs`

```sql
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
```

### Table: `late_logs`

```sql
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
```

---

## Phase 4: Leave Management

### Table: `leave_types`

```sql
create table leave_types (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) not null,
  name text not null, -- e.g. Annual, Sick, Personal, Maternity
  days_allowed int not null,
  is_paid boolean default true,
  carry_forward boolean default false,
  requires_approval boolean default true,
  created_at timestamptz default now(),
  unique(organization_id, name)
);
```

### Table: `leave_balances`

```sql
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
```

### Table: `leave_requests`

```sql
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
```

---

## Phase 5: Payroll

### Table: `payroll_runs`

```sql
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
```

### Table: `payroll_items`

```sql
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
```

---

## Phase 6: Payslips

### Table: `payslips`

```sql
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
```

---

## Phase 7: Incentives & Loans

### Table: `incentives`

```sql
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
```

### Table: `loans`

```sql
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
```

### Table: `loan_repayments`

```sql
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
```

---

## Phase 8: Overtime & Vehicles

### Table: `overtime_requests`

```sql
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
```

### Table: `vehicles`

```sql
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
```

---

## Phase 9: Row Level Security (RLS)

**Core principle**: Every table uses `organization_id` for isolation. Users can ONLY see rows from their own organization.

### Enable RLS on all tables

```sql
alter table profiles enable row level security;
alter table employees enable row level security;
alter table attendance_logs enable row level security;
alter table late_logs enable row level security;
alter table leave_types enable row level security;
alter table leave_balances enable row level security;
alter table leave_requests enable row level security;
alter table payroll_runs enable row level security;
alter table payroll_items enable row level security;
alter table payslips enable row level security;
alter table incentives enable row level security;
alter table loans enable row level security;
alter table loan_repayments enable row level security;
alter table overtime_requests enable row level security;
alter table vehicles enable row level security;
```

### Helper function: Get current user's org_id

```sql
create or replace function get_user_organization_id()
returns uuid
language sql stable
as $$
  select organization_id from public.profiles
  where id = auth.uid()
  limit 1;
$$;
```

### Example RLS Policy (applies to ALL tables)

```sql
-- Users can only see their own organization's data
create policy "org_isolation_select"
  on employees for select
  using (organization_id = get_user_organization_id());

-- Admins can insert/update in their org
create policy "org_isolation_insert"
  on employees for insert
  with check (organization_id = get_user_organization_id());

create policy "org_isolation_update"
  on employees for update
  using (organization_id = get_user_organization_id());

-- Only super_admin can delete
create policy "org_isolation_delete"
  on employees for delete
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('super_admin')
    )
  );
```

### Staff-specific policy: employees can only see their own record

```sql
create policy "staff_see_own_record"
  on employees for select
  using (
    profile_id = auth.uid()
    or
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('org_admin', 'hr_manager', 'super_admin')
    )
  );
```

---

## Phase 10: Database Functions (Edge Functions / SQL)

### Function: Calculate Payroll for an organization

```sql
create or replace function calculate_payroll(
  p_org_id uuid,
  p_month int,
  p_year int
)
returns void
language plpgsql
security definer
as $$
declare
  v_payroll_run_id uuid;
begin
  -- Create payroll run
  insert into payroll_runs (organization_id, month, year, status)
  values (p_org_id, p_month, p_year, 'processing')
  returning id into v_payroll_run_id;

  -- Insert payroll items for each active employee
  insert into payroll_items (payroll_run_id, employee_id, organization_id, basic_salary, overtime_amount, incentives_amount, deductions)
  select
    v_payroll_run_id,
    e.id,
    e.organization_id,
    e.basic_salary,
    coalesce(ot.total_overtime, 0),
    coalesce(inc.total_incentives, 0),
    coalesce(loan.total_deductions, 0)
  from employees e
  left join (
    select employee_id, sum(total_amount) as total_overtime
    from overtime_requests
    where status = 'approved'
    and extract(month from date) = p_month
    and extract(year from date) = p_year
    group by employee_id
  ) ot on ot.employee_id = e.id
  left join (
    select employee_id, sum(amount) as total_incentives
    from incentives
    where extract(month from date) = p_month
    and extract(year from date) = p_year
    group by employee_id
  ) inc on inc.employee_id = e.id
  left join (
    select employee_id, sum(monthly_emi) as total_deductions
    from loans
    where status = 'disbursed'
    group by employee_id
  ) loan on loan.employee_id = e.id
  where e.organization_id = p_org_id
  and e.status = 'active';

  -- Update payroll run status
  update payroll_runs
  set status = 'completed', executed_at = now()
  where id = v_payroll_run_id;
end;
$$;
```

---

## Phase 11: Supabase Realtime (Live Updates)

### Enable Realtime on key tables

```sql
-- Dashboard needs live updates
alter publication supabase_realtime add table attendance_logs;
alter publication supabase_realtime add table late_logs;
alter publication supabase_realtime add table leave_requests;
alter publication supabase_realtime add table payroll_runs;
```

### How clients subscribe

**Next.js (Web)**:
```ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Subscribe to attendance changes
supabase
  .channel('attendance-changes')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'attendance_logs',
      filter: `organization_id=eq.${orgId}`
    },
    (payload) => {
      // Update UI in real-time
    }
  )
  .subscribe()
```

**Flutter (Admin & Staff App)**:
```dart
import 'package:supabase_flutter/supabase_flutter.dart';

final supabase = Supabase.instance.client;

supabase
    .channel('attendance-changes')
    .onPostgresChanges(
        PostgresChangeOptions(
            event: PostgresChangeEvent.insert,
            schema: 'public',
            table: 'attendance_logs',
            filter: Filter.equals('organization_id', orgId),
        ),
        (payload) {
            // Update UI
        },
    )
    .subscribe();
```

---

## Phase 12: Supabase Storage

### Buckets needed

| Bucket | Purpose | Access |
|--------|---------|--------|
| `avatars` | Profile pictures | Public read, authenticated write |
| `payslips` | PDF payslips | Auth user + admin read |
| `documents` | Employee documents | Organization members only |
| `logos` | Organization logos | Public read |

### RLS for Storage

```sql
-- Payslips: employee can see their own, admin can see all in org
create policy "payslip_access"
  on storage.objects for select
  using (
    bucket_id = 'payslips'
    and (
      -- Extract org_id from path: payslips/{org_id}/{employee_id}/{file}
      storage.foldername(name)[1] = get_user_organization_id()::text
    )
  );
```

---

## Client Connection Setup

### Next.js (Web Admin Portal)

```ts
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

```ts
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )
}
```

### Flutter (Admin App + Staff App)

```dart
// lib/core/network/supabase_client.dart
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseService {
  static Future<void> initialize() async {
    await Supabase.initialize(
      url: const String.fromEnvironment('SUPABASE_URL'),
      anonKey: const String.fromEnvironment('SUPABASE_ANON_KEY'),
    );
  }

  static SupabaseClient get client => Supabase.instance.client;
}
```

---

## Phase-by-Phase Build Order

| Phase | What to Build | Affects |
|-------|---------------|---------|
| **P1** | Organizations table + Auth setup + Auto-profile trigger | Web + Both Apps |
| **P2** | Profiles + Employees tables + RLS policies | Web + Both Apps |
| **P3** | Attendance + Late Logs tables + Realtime enabled | Web + Admin App |
| **P4** | Leave tables (types, balances, requests) | Web + Both Apps |
| **P5** | Payroll tables (runs, items) + Calculate function | Web + Admin App |
| **P6** | Payslips table + PDF storage bucket | Web + Both Apps |
| **P7** | Incentives + Loans tables | Web + Admin App |
| **P8** | Overtime + Vehicles tables | Web + Admin App + Staff App |
| **P9** | RLS policies on ALL tables (org isolation) | All (security) |
| **P10** | Database functions (payroll calc, leave approval) | Web + Admin App |
| **P11** | Realtime subscriptions setup | Web + Both Apps |
| **P12** | Storage buckets + RLS | Web + Both Apps |
| **P13** | Seed data + Indexes + Performance tuning | All |

---

## Summary

```
Organizations (1)
    └── Users / Profiles (many)
            └── Employees (many)
                    ├── Attendance Logs (many)
                    ├── Late Logs (many)
                    ├── Leave Balances (many per type)
                    ├── Leave Requests (many)
                    ├── Payroll Items (many per run)
                    ├── Payslips (many per month)
                    ├── Incentives (many)
                    ├── Loans (many)
                    ├── Loan Repayments (many per loan)
                    ├── Overtime Requests (many)
                    └── Vehicles (many, shared)
```

Every table is linked to `organization_id`. RLS enforces that users only see their org's data. Web and mobile apps all talk to the same Supabase instance with the same auth.
