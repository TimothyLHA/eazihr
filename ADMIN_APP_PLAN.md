# EasyHR - Admin Mobile App Development Plan

**Stack**: Flutter (Dart) → Android & iOS
**Database**: Supabase (PostgreSQL)
**Auth**: Supabase Auth (email/password)
**Architecture**: Multi-Tenant (organization_id on every query)
**State Management**: Riverpod / BLoC
**HTTP Client**: Supabase Dart client (`supabase_flutter`)

---

## Multi-Tenant Architecture

- Single Flutter app, single Supabase project
- Every query includes `organization_id` filter
- RLS enforces org isolation at database level
- Admin can manage all employees within their org
- Super admin can switch orgs (same as web)

### Config-Driven Rules at App Start

App fetches `org_config` on launch and stores in global state (Riverpod):

```dart
// On login success, fetch org settings
final orgConfig = await supabase
  .from('organizations')
  .select('payroll_config, leave_config, loan_config, overtime_config')
  .eq('id', orgId)
  .single();

// Store in provider — all screens read from here
ref.read(orgConfigProvider.notifier).state = orgConfig;
```

**How screens use config**:

| Config | Screen | Behavior |
|--------|--------|----------|
| `payroll_config.cycle` | Payroll | Show month-end or 15th cutoff UI |
| `leave_config.types` | Leave Requests | Dynamic leave type picker |
| `loan_config.enabled` | Loans Menu | Hide Loans tab if false |
| `overtime_config.rate` | Overtime | Calculate pay: hours × rate |

### Data Flow

```
Login → JWT with org_id → fetch org_config → store in provider
       ↓
Each screen reads org_config + queries with org_id filter
       ↓
Supabase RLS ensures org isolation automatically
```

---

## Project Structure

```
admin_app/
├── lib/
│   ├── main.dart
│   ├── app.dart
│   ├── core/
│   │   ├── theme/
│   │   │   ├── app_theme.dart
│   │   │   ├── colors.dart
│   │   │   ├── typography.dart
│   │   │   └── spacing.dart
│   │   ├── constants/
│   │   │   └── api_constants.dart
│   │   ├── utils/
│   │   │   ├── formatters.dart
│   │   │   ├── validators.dart
│   │   │   └── extensions.dart
│   │   ├── router/
│   │   │   └── app_router.dart
│   │   └── network/
│   │       ├── supabase_client.dart
│   │       └── api_response.dart
│   ├── data/
│   │   ├── models/
│   │   │   ├── organization_model.dart    # NEW: org config + settings
│   │   │   ├── user_model.dart
│   │   │   ├── employee_model.dart
│   │   │   ├── attendance_model.dart
│   │   │   ├── leave_request_model.dart
│   │   │   ├── leave_config_model.dart    # NEW: org's leave policy
│   │   │   ├── payroll_config_model.dart  # NEW: org's payroll policy
│   │   │   ├── overtime_model.dart
│   │   │   ├── incentive_model.dart
│   │   │   ├── loan_model.dart
│   │   │   ├── payroll_model.dart
│   │   │   ├── payslip_model.dart
│   │   │   └── late_log_model.dart
│   │   └── repositories/
│   │       ├── auth_repository.dart       # Returns org_id from session
│   │       ├── organization_repository.dart # NEW: fetch org config
│   │       ├── employee_repository.dart   # All filtered by org_id
│   │       ├── attendance_repository.dart
│   │       ├── leave_repository.dart
│   │       ├── overtime_repository.dart
│   │       ├── incentive_repository.dart
│   │       ├── loan_repository.dart
│   │       ├── payroll_repository.dart
│   │       └── payslip_repository.dart
│   ├── providers/
│   │   ├── auth_provider.dart
│   │   ├── organization_provider.dart     # NEW: provides org config
│   │   ├── employee_provider.dart
│   │   ├── attendance_provider.dart
│   │   ├── leave_provider.dart
│   │   ├── overtime_provider.dart
│   │   ├── incentive_provider.dart
│   │   ├── loan_provider.dart
│   │   ├── payroll_provider.dart
│   │   └── payslip_provider.dart
│   └── features/
│       ├── splash/
│       │   └── splash_screen.dart
│       ├── auth/
│       │   ├── login_screen.dart
│       │   └── widgets/
│       │       ├── login_form.dart
│       │       └── login_header.dart
│       ├── dashboard/
│       │   ├── dashboard_screen.dart
│       │   └── widgets/
│       │       ├── welcome_header.dart      # Shows org name
│       │       ├── metrics_grid.dart
│       │       ├── metric_card.dart
│       │       ├── payroll_cycle_card.dart  # Uses org's payroll_config
│       │       ├── action_buttons.dart
│       │       └── realtime_tracking_list.dart
│       ├── attendance/
│       │   ├── attendance_screen.dart
│       │   └── widgets/
│       │       ├── attendance_stats.dart
│       │       ├── attendance_list.dart
│       │       ├── attendance_tile.dart
│       │       └── status_badge.dart
│       ├── directory/
│       │   ├── directory_screen.dart
│       │   └── widgets/
│       │       ├── employee_search.dart
│       │       ├── employee_card.dart
│       │       └── employee_detail_sheet.dart
│       ├── leave_requests/
│       │   ├── leave_requests_screen.dart
│       │   └── widgets/
│       │       ├── leave_request_tile.dart
│       │       ├── leave_status_badge.dart
│       │       └── approve_reject_buttons.dart
│       ├── overtime/
│       │   ├── overtime_screen_1.dart
│       │   ├── overtime_screen_2.dart
│       │   └── widgets/
│       │       ├── overtime_stats.dart
│       │       └── overtime_tile.dart
│       ├── incentives/
│       │   ├── incentives_screen.dart
│       │   └── widgets/
│       │       ├── incentive_summary.dart
│       │       └── incentive_tile.dart
│       ├── late_logs/
│       │   ├── late_logs_screen.dart
│       │   └── widgets/
│       │       ├── late_log_stats.dart
│       │       └── late_log_tile.dart
│       ├── loans/
│       │   ├── loans_screen.dart
│       │   └── widgets/
│       │       ├── loan_summary.dart
│       │       ├── loan_tile.dart
│       │       └── loan_approval_dialog.dart
│       ├── payroll/
│       │   └── payroll_screen.dart
│       └── payslips/
│           ├── payslips_screen.dart
│           └── widgets/
│               ├── payslip_tile.dart
│               └── payslip_viewer.dart
├── assets/
│   ├── images/
│   └── fonts/
├── pubspec.yaml
└── analysis_options.yaml
```

---

## Screens & Designs Mapping

| # | Screen | Design Source | Multi-Tenant Notes |
|---|--------|---------------|--------------------|
| 1 | Splash | `mobile_splash_screen/` | — |
| 2 | Login | `employee_mobile_login/` | Auto-scopes to org after login |
| 3 | Dashboard | `admin_mobile_dashboard_restored/` | Data filtered by org_id |
| 4 | Attendance | `admin_mobile_attendance/` | Org scope |
| 5 | Directory | `admin_mobile_directory/` | Org scope |
| 6 | Leave Requests | `admin_mobile_leave_requests/` | Uses org's leave_config |
| 7 | Overtime 1 | `admin_mobile_overtime_1/` | Uses org's overtime_rate |
| 8 | Overtime 2 | `admin_mobile_overtime_2/` | Org scope |
| 9 | Incentives | `admin_mobile_incentives/` | Org scope |
| 10 | Late Logs | `admin_mobile_late_logs/` | Org scope |
| 11 | Loans | `admin_mobile_loans/` | Org scope |
| 12 | Payroll | `admin_mobile_payroll/` | Uses org's payroll_config |
| 13 | Payslips | `admin_mobile_payslips/` | Org scope |

---

## Bottom Navigation (Shell)

```
Tab 1: Dashboard    (icon: dashboard)
Tab 2: Attendance   (icon: how_to_reg)
Tab 3: Payroll      (icon: account_balance_wallet)
Tab 4: Settings     (icon: settings)
```

---

## Phases

### Phase 1: Project Setup & Theme
- [ ] `flutter create --org com.easyhr admin_app`
- [ ] Add dependencies: `supabase_flutter`, `go_router`, `flutter_riverpod`, `intl`, `shimmer`, `cached_network_image`, `fl_chart`
- [ ] Set up project structure
- [ ] Create theme from design tokens
- [ ] Set up Supabase client initialization
- [ ] Create GoRouter with all routes placeholder
- [ ] Build splash screen with auto-navigation
- [ ] Set up bottom navigation shell
- [ ] **Create OrganizationModel + OrganizationRepository** (fetch org config)

### Phase 2: Authentication (Multi-Tenant)
- [ ] Build login screen (email, password, sign in button)
- [ ] Create auth repository — extracts `organization_id` from session's JWT
- [ ] Create auth provider — exposes org_id + user role
- [ ] **Create OrganizationProvider** — fetches org settings after login
- [ ] Handle session persistence
- [ ] Handle auth errors
- [ ] Password reset flow (link to web)

### Phase 3: Dashboard
- [ ] Welcome header with user name, avatar, and **org name**
- [ ] Overview metrics grid (Active Workforce, Pending Loans, Today's Attendance) — all **org-scoped**
- [ ] Payroll Cycle card — uses **org's payroll_config** for cutoff/cycle info
- [ ] Action buttons (Hire New, Approve Loan)
- [ ] Real-Time Tracking list — **org-scoped**
- [ ] Pull-to-refresh
- [ ] Loading skeleton state

### Phase 4: Attendance
- [ ] Attendance stats (org scope)
- [ ] Attendance list with employee items
- [ ] Date picker for day selection
- [ ] Status badge variants
- [ ] Pull-to-refresh

### Phase 5: Directory
- [ ] Search field (within org)
- [ ] Employee cards grid/list toggle
- [ ] Employee card (avatar, name, role, department)
- [ ] Employee detail bottom sheet
- [ ] Alphabetical filter/scroller

### Phase 6: Leave Requests
- [ ] Leave request list (org scope)
- [ ] Status badges
- [ ] Approve/Reject buttons with confirmation
- [ ] Filter by status tabs
- [ ] **Leave types come from org's leave_config**

### Phase 7: Overtime (2 screens)
- [ ] Overtime Screen 1: List of requests (org scope)
- [ ] Overtime Screen 2: Summary/chart
- [ ] **Overtime rate comes from org's payroll_config**
- [ ] Approve/Reject for pending requests

### Phase 8: Incentives
- [ ] Incentive summary (org scope)
- [ ] Incentive list
- [ ] Add incentive form

### Phase 9: Late Logs
- [ ] Late logs summary (org scope)
- [ ] Late logs list
- [ ] Filter by date range

### Phase 10: Loans
- [ ] Loan summary (org scope)
- [ ] Loan list
- [ ] Loan approval dialog
- [ ] Loan repayment history

### Phase 11: Payroll
- [ ] Payroll cycle status — **uses org's payroll_config**
- [ ] Payroll summary (org scope)
- [ ] Execute payroll button — calls DB function with org_id
- [ ] Payroll history list

### Phase 12: Payslips
- [ ] Payslip list (org scope)
- [ ] Payslip viewer
- [ ] Filter by month/employee
- [ ] Download/share payslip

### Phase 13: Polish
- [ ] Loading skeletons on all screens
- [ ] Empty state illustrations
- [ ] Error handling with retry
- [ ] Pull-to-refresh everywhere
- [ ] Dark mode support
- [ ] Haptic feedback
- [ ] App icon and splash branding

---

## Multi-Tenant Data Flow (Flutter)

```
User opens app → Splash Screen
    ↓
Check for existing session
    ↓
If logged in → read org_id from session.user.appMetadata['organization_id']
    ↓
Fetch organization config (payroll_config, leave_config) using org_id
    ↓
All repository queries include org_id filter:
  supabase.from('employees').select().eq('organization_id', orgId)
    ↓
If no session → Login Screen
    ↓
After login → redirect to Dashboard with org context
```

### Repository pattern with org_id

```dart
// Example: employee_repository.dart
class EmployeeRepository {
  final SupabaseClient _client;
  final String _orgId;

  EmployeeRepository(this._client, this._orgId);

  Future<List<Employee>> getAll() async {
    final response = await _client
        .from('employees')
        .select()
        .eq('organization_id', _orgId)
        .order('created_at', ascending: false);
    return response.map((json) => Employee.fromJson(json)).toList();
  }

  Future<Employee> getById(String id) async {
    final response = await _client
        .from('employees')
        .select()
        .eq('id', id)
        .eq('organization_id', _orgId)  // Extra safety
        .single();
    return Employee.fromJson(response);
  }
}
```

---

## Supabase Tables (Shared)

All tables include `organization_id`. See `DATABASE_PLAN.md` for full schema.

---

## Component States

Every data screen must handle these **4 states**:

| State | UI |
|-------|-----|
| **Loading** | Shimmer/skeleton placeholders |
| **Empty** | Illustration + "No X found" message |
| **Error** | Error card with "Retry" button |
| **Success** | Normal data display with pull-to-refresh |

---

## Design Tokens (Flutter Theme)

```dart
// Colors
static const surface = Color(0xFFF8F9FF);
static const primary = Color(0xFF0F172A);
static const secondary = Color(0xFF006C49);
static const error = Color(0xFFBA1A1A);
static const onSurface = Color(0xFF0B1C30);
static const onPrimary = Color(0xFFFFFFFF);
static const onSecondary = Color(0xFFFFFFFF);
static const surfaceContainerLow = Color(0xFFEFF4FF);
static const surfaceContainer = Color(0xFFE5EEFF);
static const surfaceContainerHighest = Color(0xFFD3E4FE);
static const outlineVariant = Color(0xFFC6C6CD);
static const errorContainer = Color(0xFFFFDAD6);
static const secondaryContainer = Color(0xFF6CF8BB);

// Text styles
TextStyle headlineLg = GoogleFonts.inter(fontSize: 32, fontWeight: FontWeight.w600);
TextStyle titleMd = GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w600);
TextStyle bodyMd = GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w400);
TextStyle caption = GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w400);
TextStyle labelMd = GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, letterSpacing: 0.5);
```
