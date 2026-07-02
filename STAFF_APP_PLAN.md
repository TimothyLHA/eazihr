# EasyHR - Staff Mobile App Development Plan

**Stack**: Flutter (Dart) → Android & iOS
**Database**: Supabase (PostgreSQL)
**Auth**: Supabase Auth (email/password)
**Architecture**: Multi-Tenant (organization_id on every query)
**State Management**: Riverpod / BLoC
**HTTP Client**: Supabase Dart client (`supabase_flutter`)

---

## Multi-Tenant Architecture

- Same Supabase project as Admin Portal + Admin App
- Staff user belongs to one organization
- Can ONLY see their own data within their org
- RLS enforces: "employee can only see their own records" + "within their org"

**Access restrictions**:
- Attendance: own check-in/out records only
- Leave: own requests + balances only
- Payslips: own payslips only
- Profile: own profile only
- Live Tracking: own GPS only

### Config-Driven Rules for Staff

Same `org_config` is fetched at login. Staff app reads org-specific rules:

```dart
// Fetch org config after login
final orgConfig = await supabase
  .from('organizations')
  .select('leave_config, overtime_config')
  .eq('id', orgId)
  .single();

ref.read(orgConfigProvider.notifier).state = orgConfig;
```

**How staff screens use config**:

| Config | Screen | Behavior |
|--------|--------|----------|
| `leave_config.types` | Apply Leave | Show only org's leave types |
| `leave_config.annual_leave_days` | Leave Balance | Display annual allocation |
| `leave_config.carry_forward` | Leave Balance | Show carry-over balance or not |
| `overtime_config.rate` | Overtime | Calculate earnings display |
| `overtime_config.max_hours` | Overtime | Enforce max per week |

### Data Flow

```
Login → JWT with org_id + user_id → fetch org_config
       ↓
All queries: .eq('organization_id', orgId).eq('employee_id', userId)
       ↓
Supabase RLS: employee sees own records within their org only
```

---

## Project Structure

```
employee_app/
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
│   │   │   ├── organization_model.dart      # NEW: org config (read-only for staff)
│   │   │   ├── user_model.dart
│   │   │   ├── employee_model.dart
│   │   │   ├── attendance_model.dart
│   │   │   ├── leave_request_model.dart
│   │   │   ├── leave_balance_model.dart
│   │   │   ├── payslip_model.dart
│   │   │   ├── overtime_model.dart
│   │   │   └── notification_model.dart
│   │   └── repositories/
│   │       ├── auth_repository.dart          # Returns org_id + user_id
│   │       ├── organization_repository.dart  # NEW: fetch org config (read-only)
│   │       ├── attendance_repository.dart    # Own records only + org scope
│   │       ├── leave_repository.dart         # Own requests + org scope
│   │       ├── payslip_repository.dart       # Own payslips + org scope
│   │       ├── overtime_repository.dart      # Own overtime + org scope
│   │       └── profile_repository.dart       # Own profile + org scope
│   ├── providers/
│   │   ├── auth_provider.dart
│   │   ├── organization_provider.dart        # NEW: provides org name + config
│   │   ├── attendance_provider.dart
│   │   ├── leave_provider.dart
│   │   ├── payslip_provider.dart
│   │   ├── overtime_provider.dart
│   │   └── profile_provider.dart
│   └── features/
│       ├── auth/
│       │   ├── login_screen.dart
│       │   └── widgets/
│       │       ├── login_form.dart
│       │       └── login_header.dart
│       ├── dashboard/
│       │   ├── dashboard_screen.dart
│       │   └── widgets/
│       │       ├── check_in_card.dart             # Check In/Out + GPS status
│       │       ├── stats_bento.dart               # Hours worked + overtime
│       │       ├── current_task_card.dart         # Task progress
│       │       ├── quick_actions_grid.dart        # 4-icon quick links
│       │       └── recent_logs_list.dart          # Own recent entries
│       ├── leave/
│       │   ├── leave_screen_1.dart               # Leave list/overview
│       │   ├── leave_screen_2.dart               # Apply leave form
│       │   └── widgets/
│       │       ├── leave_balance_card.dart        # Uses org's leave_config
│       │       ├── leave_request_tile.dart
│       │       ├── leave_form.dart
│       │       └── leave_type_picker.dart         # From org's leave_types
│       ├── payslips/
│       │   ├── payslip_screen_1.dart             # List of own payslips
│       │   ├── payslip_screen_2.dart             # Payslip detail viewer
│       │   └── widgets/
│       │       ├── payslip_card.dart
│       │       ├── payslip_detail_header.dart
│       │       └── payslip_breakdown.dart
│       ├── profile/
│       │   ├── profile_screen.dart
│       │   └── widgets/
│       │       ├── profile_header.dart
│       │       ├── personal_info_section.dart
│       │       ├── employment_info_section.dart
│       │       └── contact_info_section.dart
│       ├── live_tracking/
│       │   ├── live_tracking_screen.dart
│       │   └── widgets/
│       │       ├── map_view.dart
│       │       ├── location_status.dart
│       │       └── trip_timer.dart
│       └── settings/
│           ├── settings_screen.dart
│           └── widgets/
│               ├── settings_tile.dart
│               ├── theme_toggle.dart
│               ├── notification_toggle.dart
│               └── logout_button.dart
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
| 1 | Login | `mobile_login_screen/` | Auto-scopes to org after login |
| 2 | Dashboard | `employee_mobile_dashboard/` | Own data only, org-scoped |
| 3 | Leave Requests 1 | `mobile_leave_requests_1/` | Own requests, org leave types |
| 4 | Leave Requests 2 | `mobile_leave_requests_2/` | Apply form, org's policy |
| 5 | Payslips 1 | `mobile_payslips_1/` | Own payslips only |
| 6 | Payslips 2 | `mobile_payslips_2/` | Own payslip detail |
| 7 | Profile | `mobile_employee_profile/` | Own profile |
| 8 | Live Tracking | `mobile_live_tracking/` | Own GPS, org scope |
| 9 | Settings | `mobile_settings_preferences/` | Shows org name |

---

## Bottom Navigation (Shell)

```
Tab 1: Home        (icon: dashboard)
Tab 2: Schedule    (icon: calendar_today)  → Leave screens
Tab 3: Payroll     (icon: payments)         → Payslips screen
Tab 4: Team/Profile (icon: groups)         → Profile screen
```

---

## Phases

### Phase 1: Project Setup & Theme
- [ ] `flutter create --org com.easyhr employee_app`
- [ ] Add dependencies: `supabase_flutter`, `go_router`, `flutter_riverpod`, `intl`, `shimmer`, `cached_network_image`, `fl_chart`, `geolocator`, `google_maps_flutter`
- [ ] Set up project structure
- [ ] Create theme from design tokens
- [ ] Set up Supabase client
- [ ] Create GoRouter with all routes
- [ ] Set up bottom navigation shell (4 tabs)
- [ ] **Create OrganizationModel + OrganizationRepository** (read-only, fetch org name + config)

### Phase 2: Authentication (Multi-Tenant)
- [ ] Build login screen (email, password, sign in button)
- [ ] Create auth repository — extracts `organization_id` + `user_id` from JWT
- [ ] Create auth provider — exposes user_id, org_id, role
- [ ] **Create OrganizationProvider** — fetches org name + config (read-only)
- [ ] Session persistence & auto-login
- [ ] Error handling

### Phase 3: Dashboard
- [ ] Check In/Out card with:
  - Animated pulse ring around location icon
  - GPS status indicator
  - Toggle button (Check In ↔ Check Out)
  - Last activity timestamp
  - **Checked against own attendance_logs + org scope**
- [ ] Stats Bento grid:
  - Hours worked today (own records)
  - Overtime this week (own, uses org's overtime_rate)
- [ ] Current Task card with progress bar
- [ ] Quick Actions grid (4 icons)
- [ ] Recent Logs list (own entries)
- [ ] Loading skeleton state

### Phase 4: Leave (2 screens)
- **Leave Screen 1 (Overview)**:
  - Leave balance cards — **uses org's leave_config** for allowed days
  - Leave request list (own requests only)
  - FAB to create new request
- **Leave Screen 2 (Apply)**:
  - Leave type picker — **from org's leave_types**
  - Date range picker
  - Reason text field
  - Submit button — creates with org_id + employee_id

### Phase 5: Payslips (2 screens)
- **Payslip Screen 1 (List)**:
  - Cards for each month (own payslips only)
  - Status badge
  - Year filter
- **Payslip Screen 2 (Detail)**:
  - Earnings section
  - Deductions section
  - Net pay highlighted
  - Download/share button

### Phase 6: Profile
- [ ] Profile header with avatar, name, role
- [ ] Personal info section
- [ ] Employment info section (employee code, department, join date)
- [ ] Contact info section
- [ ] Edit profile option

### Phase 7: Live Tracking
- [ ] Map view with current location
- [ ] GPS status indicator
- [ ] Trip timer
- [ ] Location history path
- [ ] Permission handling

### Phase 8: Settings & Preferences
- [ ] Settings tiles
- [ ] Dark/Light theme toggle
- [ ] Notification preferences
- [ ] **Show organization name**
- [ ] App version info
- [ ] Logout button
- [ ] Clear cache option

### Phase 9: Polish
- [ ] Loading skeletons on all screens
- [ ] Empty states
- [ ] Error handling with retry
- [ ] Pull-to-refresh
- [ ] Haptic feedback
- [ ] Deep linking setup
- [ ] App icon and branding

---

## Multi-Tenant Data Flow (Flutter)

```
User opens app → Splash Screen
    ↓
Check session → org_id + employee_id from JWT
    ↓
Fetch org config (read-only): org name, leave_config, payroll_config
    ↓
ALL queries use BOTH:
  .eq('organization_id', orgId)      ← org isolation
  .eq('employee_id', employeeId)     ← own data only (staff)
    ↓
RLS double-enforces at database level
```

### Repository pattern with org_id + employee_id

```dart
// Example: attendance_repository.dart
class AttendanceRepository {
  final SupabaseClient _client;
  final String _orgId;
  final String _employeeId;

  AttendanceRepository(this._client, this._orgId, this._employeeId);

  // Staff can only see their own attendance
  Future<List<Attendance>> getMyLogs() async {
    final response = await _client
        .from('attendance_logs')
        .select()
        .eq('organization_id', _orgId)
        .eq('employee_id', _employeeId)
        .order('date', ascending: false);
    return response.map((json) => Attendance.fromJson(json)).toList();
  }

  // Check in
  Future<void> checkIn() async {
    await _client.from('attendance_logs').insert({
      'employee_id': _employeeId,
      'organization_id': _orgId,
      'date': DateTime.now().toIso8601String().split('T')[0],
      'check_in': DateTime.now().toUtc().toIso8601String(),
      'status': 'on_time',
    });
  }
}
```

---

## Supabase Tables (Staff-Facing)

All queries go through these tables with org_id + employee_id filters:

| Table | Staff Access |
|-------|-------------|
| `profiles` | Own profile only |
| `employees` | Own record only |
| `attendance_logs` | Own check-in/out only |
| `leave_requests` | Own requests only |
| `leave_balances` | Own balances only |
| `leave_types` | Read-only (from org) |
| `payslips` | Own payslips only |
| `overtime_requests` | Own overtime only |
| `organizations` | Read-only (name + config) |

---

## Component States

Every data screen must handle:

| State | UI |
|-------|-----|
| **Loading** | Shimmer/skeleton placeholders |
| **Empty** | Illustration + "No X found" |
| **Error** | Error card with "Retry" button |
| **Success** | Normal data with pull-to-refresh |

### Check-In Button States
| State | Button Text | Button Color |
|-------|-------------|--------------|
| Checked Out | "Check In to Site" | Primary (dark) |
| Checking In... | "Checking In..." | Primary (dimmed) |
| Checked In | "Check Out of Site" | Error (red) |
| Checking Out... | "Checking Out..." | Error (dimmed) |
| Error | "Retry" | Error (red) |

---

## Design Tokens

Same shared design system as Admin Portal.

Key colors for staff app:
- Primary: `#0F172A` (dark navy)
- Secondary: `#006C49` (green - success/check-in)
- Error: `#BA1A1A` (red - late/check-out)
- Surface: `#F8F9FF` (light background)
