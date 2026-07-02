# EasyHR — Supabase Database Build Status

## Overview

- **Platform**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Project**: `rnhnuounnxhcdnregeft` (https://rnhnuounnxhcdnregeft.supabase.co)
- **Clients**: Next.js (Web Admin Portal) + Flutter (Admin App, Staff App)
- **Approach**: Multi-tenant (organization_id on every table)

---

## Project Structure (Actual Files)

```
supabase/
├── migrations/
│   └── 20260702000000_initial_schema.sql   # Combined initial schema
├── functions/
│   ├── calculate_payroll.sql
│   └── generate_payslip.sql
```

---

## Build Summary

### ✅ Phase 1: Foundation (Organizations & Auth)

**Table: `organizations`** — Created with all config columns:
- `payroll_config` (currency, cutoff, payday, overtime rate, tax)
- `leave_config` (types, annual/sick/personal days, carry forward)
- `loan_config` (max amount, interest rate, tenure)
- `feature_config` (vehicle tracking, live tracking, overtime, incentives)

**Auth Setup:**
- `email + password` sign-up enabled by default on Supabase
- `handle_new_user()` trigger on `auth.users` — **script created but needs manual execution** in Supabase SQL Editor (Management API cannot create triggers on `auth` schema)

### ✅ Phase 2: Profiles & Employees

**Table: `profiles`** — Links to `auth.users` with `organization_id` and `role` (super_admin, org_admin, hr_manager, employee)
**Table: `employees`** — Links to `profiles` with employee_code, position, department, basic_salary, status, emergency_contact, documents

### ✅ Phase 3: Attendance

**Table: `attendance_logs`** — check_in/out, status (on_time, late, absent, half_day), location, unique per employee per day
**Table: `late_logs`** — Links to attendance_logs with minutes_late and reason

### ✅ Phase 4: Leave Management

**Table: `leave_types`** — Per-organization leave types with days_allowed, is_paid, carry_forward
**Table: `leave_balances`** — Allocated/used/remaining days with generated column, per employee per type per year
**Table: `leave_requests`** — start/end date, days, reason, status workflow (pending → approved/rejected/cancelled)

### ✅ Phase 5: Payroll

**Table: `payroll_runs`** — Per month/year, status workflow (draft → processing → completed)
**Table: `payroll_items`** — basic_salary + overtime + incentives - deductions = net_pay (generated column)

### ✅ Phase 6: Payslips

**Table: `payslips`** — gross_pay, deductions, net_pay with earnings_breakdown/deductions_breakdown JSONB, pdf_url

### ✅ Phase 7: Incentives & Loans

**Table: `incentives`** — Type (bonus, commission, allowance, other), amount, date
**Table: `loans`** — Amount, interest_rate, tenure_months, monthly_emi, balance, status workflow (pending → approved → disbursed → closed)
**Table: `loan_repayments`** — Links to loans, due_date, paid_at, status (pending, paid, overdue)

### ✅ Phase 8: Overtime & Vehicles

**Table: `overtime_requests`** — hours, rate, total_amount, status workflow
**Table: `vehicles`** — Organization-shared, plate_number unique per org, status (active, idle, maintenance, out_of_service)

### ✅ Phase 9: Row Level Security (RLS)

**All 15 tables** have RLS enabled with 4 policies each:
| Policy | Rule |
|--------|------|
| `org_isolation_select` | `organization_id = get_user_organization_id()` |
| `org_isolation_insert` | Same check on insert |
| `org_isolation_update` | Same check on update |
| `org_isolation_delete` | Only `super_admin` role can delete |

**Special policies:**
- `staff_see_own_record` on `employees` — staff see their own record, admins see all
- `loan_repayments` uses subquery through `loans` table (no `organization_id` column on this table)

**Helper function: `get_user_organization_id()`** — Returns current user's org_id from profiles

### ✅ Phase 10: Database Functions

| Function | Description |
|----------|-------------|
| `calculate_payroll(p_org_id, p_month, p_year)` | Creates payroll run, calculates items from overtime/incentives/loans |
| `generate_payslip(p_employee_id, p_org_id, p_payroll_run_id, p_month, p_year)` | Generates payslip with earnings breakdown |

### ✅ Phase 11: Supabase Realtime

Enabled on `supabase_realtime` publication:
- `attendance_logs`
- `late_logs`
- `leave_requests`
- `payroll_runs`

### ❌ Phase 12: Storage (Not Yet Created)

Buckets and RLS policies for `avatars`, `payslips`, `documents`, `logos` still need to be set up.

### ✅ Seed Data

```sql
insert into organizations (name, slug) values ('EasyHR Demo', 'easyhr-demo');
```

---

## Manual Steps Needed

1. **Auth trigger** — Run this in Supabase SQL Editor:
```sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, organization_id, role)
  values (new.id, new.email, new.raw_user_meta_data ->> 'organization_id', 'admin');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

2. **Storage buckets** — Create via Supabase Dashboard: `avatars`, `payslips`, `documents`, `logos`

---

## Database ERD

```
Organizations (1)
    └── Profiles (many) ──── auth.users
            └── Employees (many)
                    ├── Attendance Logs (many)
                    ├── Late Logs (many)
                    ├── Leave Types (many per org)
                    │   └── Leave Balances (many per employee)
                    ├── Leave Requests (many)
                    ├── Payroll Runs (many)
                    │   └── Payroll Items (many per run)
                    │       └── Payslips (one per item)
                    ├── Incentives (many)
                    ├── Loans (many)
                    │   └── Loan Repayments (many per loan)
                    ├── Overtime Requests (many)
                    └── Vehicles (many, shared across org)
```

---

## Client Connection

- **URL**: `https://rnhnuounnxhcdnregeft.supabase.co`
- **Anon Key**: Available in Supabase Dashboard → Settings → API
- **Service Key**: Available in Supabase Dashboard → Settings → API

Supabase client setup snippets are in the design plan documents for each app.
