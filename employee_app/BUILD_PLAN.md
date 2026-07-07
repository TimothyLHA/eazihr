# EasyHR Employee App — Build Plan

**Stack**: Flutter (Dart) → Android & iOS  
**Database**: Supabase (PostgreSQL) — same project as admin portal  
**Auth**: Supabase Auth (email/password)  
**State**: Riverpod (StateNotifier)  
**Router**: GoRouter with auth redirect guard  

---

## Current State (July 2026)

| Feature | Status |
|---------|--------|
| Project setup (flutter create, deps) | ✅ Done |
| Theme (Material 3, Inter font, tokens) | ✅ Done |
| Supabase client config | ✅ Done |
| GoRouter with auth redirect | ✅ Done |
| Splash screen (2-sec, auto-navigate) | ✅ Done |
| Login screen (email/password) | ✅ Done |
| Auth repository (signIn, signUp, signOut, JWT metadata) | ✅ Done |
| Auth provider (AuthNotifier, AuthStatus) | ✅ Done |
| Dashboard, attendance, leave, payslips, profile, settings | ❌ Not built |

---

## Database Tables Accessed

All queries scoped by `organization_id` + `employee_id`.

| Table | Employee Access |
|-------|----------------|
| `organizations` | Read name + config only |
| `profiles` | Own profile only |
| `employees` | Own record only |
| `attendance_logs` | Own check-in/out, insert check-in/out |
| `leave_requests` | Own requests, insert new request |
| `leave_balances` | Own balances (read-only) |
| `leave_types` | Org types (read-only) |
| `payslips` | Own payslips (read-only) |
| `overtime_requests` | Own OT requests, insert new request |

---

## Phase 1: Core Architecture & Data Layer

**Goal**: Data models, repositories, providers, and bottom navigation shell.

### Steps
- Create data models: `OrganizationModel`, `EmployeeModel`, `AttendanceModel`, `LeaveRequestModel`, `LeaveBalanceModel`, `PayslipModel`, `OvertimeModel`
- Create repositories: `OrganizationRepository`, `EmployeeRepository`, `AttendanceRepository`, `LeaveRepository`, `PayslipRepository`, `OvertimeRepository`
- Create Riverpod providers for each repository
- Create `OrganizationProvider` (fetch org config on login)
- Create bottom navigation shell (Home, Schedule, Payroll, Profile tabs)
- Update router to use shell

### File Structure Added
```
lib/
├── data/models/
│   ├── organization_model.dart
│   ├── employee_model.dart
│   ├── attendance_model.dart
│   ├── leave_request_model.dart
│   ├── leave_balance_model.dart
│   ├── payslip_model.dart
│   └── overtime_model.dart
├── data/repositories/
│   ├── organization_repository.dart
│   ├── employee_repository.dart
│   ├── attendance_repository.dart
│   ├── leave_repository.dart
│   ├── payslip_repository.dart
│   └── overtime_repository.dart
├── providers/
│   ├── organization_provider.dart
│   ├── attendance_provider.dart
│   ├── leave_provider.dart
│   ├── payslip_provider.dart
│   ├── overtime_provider.dart
│   └── profile_provider.dart
└── features/
    └── shell.dart
```

---

## Phase 2: Dashboard (Check In/Out)

**Goal**: Employee home screen with check-in/out, stats, quick actions, recent logs.

### Screens
- `features/dashboard/dashboard_screen.dart`

### Widgets
- `check_in_card.dart` — Animated pulse ring, GPS status, toggle button (Check In ↔ Check Out), last activity timestamp
- `stats_bento.dart` — Hours worked today, overtime this week
- `quick_actions_grid.dart` — 4 icon shortcuts (Request Leave, View Payslips, Overtime, Profile)
- `recent_logs_list.dart` — Own recent attendance entries

### Check-In Button States
| State | Button |
|-------|--------|
| Checked Out | "Check In to Site" — Primary |
| Checking In | "Checking In..." — Disabled |
| Checked In | "Check Out of Site" — Error (red) |
| Checking Out | "Checking Out..." — Disabled |
| Error | "Retry" — Error |

### Component States (every screen)
- **Loading**: Shimmer skeletons
- **Empty**: Illustration + "No X found"
- **Error**: Error card + Retry button
- **Success**: Normal data + pull-to-refresh

---

## Phase 3: Attendance History

**Goal**: View own attendance records with filters.

### Screens
- `features/attendance_history/attendance_screen.dart`

### Features
- Monthly calendar or date-filtered list
- Status badges: on_time (green), late (orange), absent (red), half_day (yellow)
- Expandable day row: check-in time, check-out time, duration, location
- Pull-to-refresh, paginated loading

---

## Phase 4: Leave (2 Screens)

**Goal**: View balances, apply for leave.

### Screen 1: Leave Overview
- `features/leave/leave_screen_1.dart`
- Leave balance cards (uses org's `leave_config` for allowed days)
- Leave request list (own requests) with status badges
- FAB to create new request

### Screen 2: Apply Leave
- `features/leave/leave_screen_2.dart`
- Leave type picker (from org's `leave_types`)
- Date range picker
- Reason text field
- Submit → insert into `leave_requests`

---

## Phase 5: Payslips (2 Screens)

**Goal**: View own payslips.

### Screen 1: Payslip List
- `features/payslips/payslip_screen_1.dart`
- Cards per month: gross pay, net pay, status badge
- Year filter dropdown

### Screen 2: Payslip Detail
- `features/payslips/payslip_screen_2.dart`
- Earnings breakdown section
- Deductions breakdown section
- Net pay highlighted
- Download/share PDF button (when `pdf_url` exists)

---

## Phase 6: Overtime

**Goal**: View and request overtime.

### Screens
- `features/overtime/ot_list_screen.dart` — Own OT requests list
- `features/overtime/ot_request_screen.dart` — Apply form (date, hours, rate, reason)

---

## Phase 7: Profile & Settings

**Goal**: View/edit profile, app settings.

### Profile Screen
- `features/profile/profile_screen.dart`
- Header: avatar, name, role, employee code
- Personal info (email, phone)
- Employment info (department, position, hire date)

### Settings Screen
- `features/settings/settings_screen.dart`
- Theme toggle (light/dark)
- Notification preferences
- App version
- Logout button

---

## Phase 8 (Optional): Live Tracking

**Goal**: GPS tracking during work hours.

### Features
- Map view with current location
- GPS status indicator
- Trip timer
- Only if `feature_config.live_tracking` is true
- Permission handling
