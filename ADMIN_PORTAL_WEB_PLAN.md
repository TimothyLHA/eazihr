# EasyHR - Admin Portal Website Development Plan

**Stack**: Next.js 15+ (App Router) + TypeScript + Tailwind CSS → **Vercel**
**Database**: Supabase (PostgreSQL)
**Auth**: Supabase Auth (email/password)
**Architecture**: Multi-Tenant (organization_id on every query)

---

## Multi-Tenant Architecture

```
supabase project (single instance)
  ├── Organization A (config: payroll_cycle=month_end, OT_rate=1.5x)
  ├── Organization B (config: payroll_cycle=15th, OT_rate=2x)
  └── Organization C (config: payroll_cycle=month_end, loans=disabled)
```

### Three Layers of Multi-Tenancy

**Layer 1: Data Isolation (RLS)**
- Every table has `organization_id` column
- Row Level Security auto-filters all queries by logged-in user's org
- Single Supabase project, one codebase, data stays separate

**Layer 2: Config-Driven Rules (`org_config`)**
- `organizations` table has `payroll_config`, `leave_config`, `loan_config` as JSONB columns
- Each org defines their own rules (OT rate, leave types, loan interest, tax formula)
- Code reads config dynamically — no hardcoding, no per-org deploy

**Layer 3: UI Adaptation**
- Next.js Server Components read org config at request time
- UI renders conditionally based on org rules (e.g., hide Loans tab if org disabled it)
- Edge Functions evaluate org-specific calculations (payroll, OT, tax)

### How Config Flows (Web)

```
User logs in → JWT contains organization_id
       ↓
Server Component reads org config from Supabase
       ↓
UI renders with that org's rules, fields, calculations
       ↓
All API queries include organization_id
       ↓
RLS enforces isolation at database level
```

### Super Admin
- Can switch orgs from a dropdown in the sidebar
- Sees cross-org analytics (separate from per-org dashboard)

---

## Project Structure

```
admin-portal/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx              # Sidebar + Topbar + OrgContext
│   │   │   ├── page.tsx                # Dashboard
│   │   │   ├── attendance/
│   │   │   │   └── page.tsx
│   │   │   ├── employees/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── leave-balance/
│   │   │   │   └── page.tsx
│   │   │   ├── overtime/
│   │   │   │   └── page.tsx
│   │   │   ├── incentives/
│   │   │   │   └── page.tsx
│   │   │   ├── loans/
│   │   │   │   └── page.tsx
│   │   │   ├── payroll/
│   │   │   │   └── page.tsx
│   │   │   ├── payslips/
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx            # Company info + Org config
│   │   │   │   └── organization/
│   │   │   │       └── page.tsx        # Org-level settings (payroll policy, leave policy)
│   │   │   └── vehicle-tracking/
│   │   │       └── page.tsx
│   │   │   └── super-admin/            # Super admin only
│   │   │       ├── page.tsx            # All organizations list
│   │   │       └── [org_id]/
│   │   │           └── page.tsx        # Impersonate / manage org
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── input.tsx
│   │   │   ├── table.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── dropdown.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── search-input.tsx
│   │   │   ├── progress-bar.tsx
│   │   │   ├── stats-card.tsx
│   │   │   ├── status-pill.tsx
│   │   │   ├── icon-button.tsx
│   │   │   └── skeleton.tsx
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── topbar.tsx              # Shows current org name
│   │   │   ├── org-switcher.tsx        # Super admin only — switch org
│   │   │   ├── footer.tsx
│   │   │   └── mobile-header.tsx
│   │   ├── dashboard/
│   │   │   ├── workforce-metric.tsx
│   │   │   ├── pending-loans-card.tsx
│   │   │   ├── late-logs-card.tsx
│   │   │   ├── employee-tracking-table.tsx
│   │   │   ├── payroll-execution-card.tsx
│   │   │   ├── overtime-calc.tsx
│   │   │   ├── payslip-progress.tsx
│   │   │   └── system-health.tsx
│   │   ├── attendance/
│   │   │   ├── attendance-filters.tsx
│   │   │   ├── attendance-table.tsx
│   │   │   └── attendance-summary.tsx
│   │   ├── employees/
│   │   │   ├── employee-card.tsx
│   │   │   ├── employee-filters.tsx
│   │   │   ├── employee-list.tsx
│   │   │   └── employee-detail.tsx
│   │   ├── leave/
│   │   │   ├── leave-overview.tsx
│   │   │   ├── leave-table.tsx
│   │   │   ├── leave-request-modal.tsx
│   │   │   └── leave-balance-chart.tsx
│   │   ├── payroll/
│   │   │   ├── payroll-summary.tsx
│   │   │   ├── payroll-table.tsx
│   │   │   ├── payroll-execute-btn.tsx
│   │   │   └── payroll-history.tsx
│   │   ├── payslips/
│   │   │   ├── payslip-list.tsx
│   │   │   ├── payslip-viewer.tsx
│   │   │   └── payslip-filters.tsx
│   │   ├── incentives/
│   │   │   ├── incentives-table.tsx
│   │   │   ├── bonus-form.tsx
│   │   │   └── incentives-summary.tsx
│   │   ├── loans/
│   │   │   ├── loan-table.tsx
│   │   │   ├── loan-request-modal.tsx
│   │   │   └── loan-summary.tsx
│   │   ├── overtime/
│   │   │   ├── overtime-table.tsx
│   │   │   ├── overtime-form.tsx
│   │   │   └── overtime-summary.tsx
│   │   ├── settings/
│   │   │   ├── company-info.tsx
│   │   │   ├── org-payroll-config.tsx   # Payroll policy per org
│   │   │   ├── org-leave-config.tsx     # Leave policy per org
│   │   │   ├── roles-permissions.tsx
│   │   │   ├── notification-settings.tsx
│   │   │   └── integration-settings.tsx
│   │   └── vehicle-tracking/
│   │       ├── map-view.tsx
│   │       ├── vehicle-list.tsx
│   │       └── vehicle-detail.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   ├── middleware.ts
│   │   │   └── types.ts
│   │   ├── utils/
│   │   │   ├── cn.ts
│   │   │   ├── formatters.ts
│   │   │   └── validators.ts
│   │   └── constants.ts
│   ├── hooks/
│   │   ├── use-auth.ts               # Returns user + org_id
│   │   ├── use-organization.ts       # Current org config/settings
│   │   ├── use-employees.ts          # Filtered by org_id
│   │   ├── use-attendance.ts         # Filtered by org_id
│   │   ├── use-leave.ts              # Filtered by org_id
│   │   ├── use-payroll.ts            # Filtered by org_id
│   │   ├── use-payslips.ts           # Filtered by org_id
│   │   ├── use-loans.ts              # Filtered by org_id
│   │   ├── use-incentives.ts         # Filtered by org_id
│   │   ├── use-overtime.ts           # Filtered by org_id
│   │   └── use-vehicles.ts           # Filtered by org_id
│   └── providers/
│       ├── auth-provider.tsx
│       ├── org-provider.tsx           # Provides org context to all pages
│       └── query-provider.tsx
├── public/
│   └── images/
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## Pages & Designs Mapping

| # | Route | Design Source | Key Components | Multi-Tenant Notes |
|---|-------|---------------|----------------|-------------------|
| 1 | `/login` | `login_web_page/` | Login form, remember me, forgot password | Auto-scopes to user's org |
| 2 | `/dashboard` | `hrms_admin_dashboard/` | Metrics cards, tracking table, payroll card | Data filtered by org_id |
| 3 | `/attendance` | `attendance_tracking/` | Filters, table with status, summary | Org scope |
| 4 | `/employees` | `employee_directory/` | Search, grid/list, employee cards | Org scope |
| 5 | `/leave-balance` | `leave_balance_management_restored/` | Overview, table, request modal | Org scope, uses org's leave_config |
| 6 | `/overtime` | `overtime_management_restored/` | Overtime logs, approval, summary | Org scope, uses org's overtime_rate |
| 7 | `/incentives` | `incentives_bonuses_restored/` | Incentives table, bonus allocation | Org scope |
| 8 | `/loans` | `employee_loans_management_restored/` | Loan table, request approval | Org scope |
| 9 | `/payroll` | `payroll_management/` | Execute payroll, history, summary | Org scope, uses org's payroll_config |
| 10 | `/payslips` | `payslips_management/` | List, filters, viewer | Org scope |
| 11 | `/settings` | `portal_settings/` | Company info, roles, notifications | Includes org-level policy config |
| 12 | `/vehicle-tracking` | `staff_vehicle_tracking/` | Map, vehicle list, status | Org scope |

---

## Phases

### Phase 1: Project Initialization
- [ ] `npx create-next-app@latest admin-portal --typescript --tailwind --eslint --app --src-dir`
- [ ] Install deps: `@supabase/supabase-js`, `@supabase/ssr`, `lucide-react`, `date-fns`, `recharts`, `sonner`, `zod`
- [ ] Configure Tailwind with design tokens from code.html
- [ ] Set up folder structure
- [ ] Create Supabase client (browser + server)
- [ ] Set up auth provider wrapper
- [ ] **Set up org-provider.tsx** — reads org_id from JWT, fetches org settings
- [ ] Create TypeScript types for all tables (with organization_id)

### Phase 2: Auth & Layout (Multi-Tenant)
- [ ] Build login page with email/password, remember me, forgot password
- [ ] **Login flow**: After auth, read `organization_id` from JWT claim → scope all queries
- [ ] Create auth middleware for protected routes
- [ ] Build sidebar navigation
- [ ] Build topbar with org name display + org switcher (super admin only)
- [ ] Build responsive layout
- [ ] Create logout flow
- [ ] **Super admin**: special route to list all orgs and switch between them

### Phase 3: Dashboard
- [ ] Active Workforce metric card (filtered by org_id)
- [ ] Pending Loans card (org scope)
- [ ] Late Logs card (org scope)
- [ ] Real-Time Employee Tracking table (org scope)
- [ ] Payroll Execution card (uses org's payroll_config)
- [ ] Execute Monthly Payroll button
- [ ] System Health widget (org scope)
- [ ] Simulated real-time updates → swap with Supabase Realtime

### Phase 4: Attendance
- [ ] Attendance filters (date range, department, status) — all org-scoped
- [ ] Attendance table with employee name, check-in, check-out, status
- [ ] Status badges (On Time, Late, Absent, Half Day)
- [ ] Attendance summary
- [ ] Export functionality

### Phase 5: Employee Directory
- [ ] Search bar with debounced input (within org)
- [ ] Filter by department, role, location (org-scoped)
- [ ] Employee card grid
- [ ] Employee detail modal/page
- [ ] Pagination/infinite scroll

### Phase 6: Leave Balance Management
- [ ] Leave overview (uses org's leave_config for days_allowed)
- [ ] Leave requests table (org scope)
- [ ] Approve/Reject actions
- [ ] Leave request form
- [ ] Leave balance chart

### Phase 7: Overtime Management
- [ ] Overtime logs table (org scope)
- [ ] Overtime approval workflow
- [ ] Overtime summary (uses org's overtime_rate from payroll_config)
- [ ] Overtime request form

### Phase 8: Incentives & Bonuses
- [ ] Incentives table (org scope)
- [ ] Bonus allocation form
- [ ] Incentives summary
- [ ] Performance-based bonus calculator

### Phase 9: Employee Loans
- [ ] Loan table (org scope)
- [ ] Loan request approval flow
- [ ] Loan repayment tracking
- [ ] Loan summary

### Phase 10: Payroll Management
- [ ] Payroll summary (org scope)
- [ ] Payroll execution button — calls `calculate_payroll(p_org_id, month, year)`
- [ ] Payroll history
- [ ] Payroll breakdown per employee

### Phase 11: Payslips
- [ ] Payslip list/grid (org scope)
- [ ] Payslip viewer
- [ ] Filters (month, employee, department)
- [ ] Generate/download payslip
- [ ] Batch generation progress

### Phase 12: Settings & Vehicle Tracking
- [ ] Company information (org name, logo, address)
- [ ] **Org payroll_config editor** (cutoff day, overtime rate, tax type)
- [ ] **Org leave_config editor** (leave days, carry forward, etc.)
- [ ] Roles & permissions (org-level)
- [ ] Notification preferences
- [ ] Integration settings
- [ ] Vehicle tracking map (org scope)
- [ ] Vehicle list with status
- [ ] Vehicle detail view

### Phase 13: Super Admin Features
- [ ] All organizations list with details
- [ ] Create new organization flow
- [ ] Suspend/activate organization
- [ ] Impersonate organization (view as that org)
- [ ] Usage metrics per org

### Phase 14: Polish & Deploy
- [ ] Responsive design pass
- [ ] Loading skeletons for all pages
- [ ] Error boundaries
- [ ] SEO metadata
- [ ] Performance audit (Lighthouse)
- [ ] Env vars setup for Vercel
- [ ] Deploy to Vercel

---

## Multi-Tenant Data Flow

```
User logs in
    ↓
Supabase Auth returns JWT with org_id claim
    ↓
org-provider.tsx reads org_id from JWT
    ↓
Fetches org settings (payroll_config, leave_config)
    ↓
All hooks use org_id as filter:
  supabase.from('employees').select().eq('organization_id', orgId)
    ↓
RLS on database ensures data isolation even if filter is forgotten
    ↓
All queries automatically scoped to user's organization
```

### Org Provider (Concept)

```tsx
// providers/org-provider.tsx
function OrgProvider({ children }) {
  const { data: session } = useAuth()
  const orgId = session?.user?.app_metadata?.organization_id

  const { data: organization } = useQuery({
    queryKey: ['organization', orgId],
    queryFn: () => supabase.from('organizations').select('*').eq('id', orgId).single(),
    enabled: !!orgId,
  })

  return (
    <OrgContext.Provider value={{ orgId, organization }}>
      {children}
    </OrgContext.Provider>
  )
}
```

---

## Supabase Tables (with organization_id)

```sql
-- Every table includes organization_id for multi-tenant isolation

organizations (id, name, slug, logo_url, settings, payroll_config, leave_config)

profiles              (id, email, organization_id, role, ...)
employees             (id, profile_id, organization_id, ...)
attendance_logs       (id, employee_id, organization_id, date, ...)
late_logs             (id, employee_id, organization_id, ...)
leave_types           (id, organization_id, name, days_allowed, ...)
leave_balances        (id, employee_id, organization_id, leave_type_id, ...)
leave_requests        (id, employee_id, organization_id, leave_type_id, ...)
payroll_runs          (id, organization_id, month, year, ...)
payroll_items         (id, payroll_run_id, employee_id, organization_id, ...)
payslips              (id, employee_id, organization_id, ...)
incentives            (id, employee_id, organization_id, ...)
loans                 (id, employee_id, organization_id, ...)
loan_repayments       (id, loan_id, ...)
overtime_requests     (id, employee_id, organization_id, ...)
vehicles              (id, organization_id, ...)
```

---

## Component Design System

### Color Tokens (tailwind.config.ts)
```ts
colors: {
  surface: '#f8f9ff',
  'surface-bright': '#f8f9ff',
  'surface-dim': '#cbdbf5',
  'surface-container': '#e5eeff',
  'surface-container-low': '#eff4ff',
  'surface-container-lowest': '#ffffff',
  'surface-container-high': '#dce9ff',
  'surface-container-highest': '#d3e4fe',
  'surface-variant': '#d3e4fe',
  primary: '#0f172a',
  'primary-container': '#131b2e',
  'primary-fixed': '#dae2fd',
  'primary-fixed-dim': '#bec6e0',
  secondary: '#006c49',
  'secondary-container': '#6cf8bb',
  'secondary-fixed': '#6ffbbe',
  'secondary-fixed-dim': '#4edea3',
  error: '#ba1a1a',
  'error-container': '#ffdad6',
  outline: '#76777d',
  'outline-variant': '#c6c6cd',
  'on-surface': '#0b1c30',
  'on-primary': '#ffffff',
  'on-secondary': '#ffffff',
  'on-error': '#ffffff',
  'on-surface-variant': '#45464d',
}
```

### Typography Tokens
```ts
fontFamily: { inter: ['Inter', 'sans-serif'] }
fontSize: {
  'display-lg': ['48px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
  'headline-lg': ['32px', { lineHeight: '1.3', fontWeight: '600' }],
  'title-md': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
  'body-lg': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
  'body-md': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
  'caption': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
  'label-md': ['12px', { lineHeight: '1', letterSpacing: '0.05em', fontWeight: '600' }],
}
```

---

## States (Every Component)

Each data component should handle:
- **Loading**: Skeleton placeholders
- **Empty**: Illustration + "No data" message
- **Error**: Error card with retry button
- **Success**: Normal data display
- **Optimistic updates**: For approve/reject actions
