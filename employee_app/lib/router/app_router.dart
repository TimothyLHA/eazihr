import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:employee_app/features/splash/screens/splash_screen.dart';
import 'package:employee_app/features/auth/screens/login_screen.dart';
import 'package:employee_app/features/auth/providers/auth_provider.dart';
import 'package:employee_app/features/shell/shell.dart';
import 'package:employee_app/features/dashboard/dashboard_screen.dart';
import 'package:employee_app/features/leave/leave_overview_screen.dart';
import 'package:employee_app/features/leave/apply_leave_screen.dart';
import 'package:employee_app/features/payslips/payslips_screen.dart';
import 'package:employee_app/features/payslips/payslip_detail_screen.dart';
import 'package:employee_app/features/profile/profile_screen.dart';
import 'package:employee_app/features/settings/settings_screen.dart';
import 'package:employee_app/features/overtime/overtime_screen.dart';
import 'package:employee_app/features/overtime/request_overtime_screen.dart';
import 'package:employee_app/features/attendance_history/attendance_history_screen.dart';
import 'package:employee_app/features/live_tracking/live_tracking_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  final authStatus = ref.watch(authNotifierProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/splash',
    redirect: (context, state) {
      final isLoggedIn = authStatus == AuthStatus.authenticated;
      final isLoggingIn = state.matchedLocation == '/login';
      final isSplash = state.matchedLocation == '/splash';

      if (authStatus == AuthStatus.unknown) return null;
      if (isLoggedIn && (isLoggingIn || isSplash)) return '/';
      if (!isLoggedIn && !isLoggingIn && !isSplash) return '/login';
      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return AppShell(child: navigationShell);
        },
        branches: [
          StatefulShellBranch(
            navigatorKey: _shellNavigatorKey,
            routes: [
              GoRoute(
                path: '/',
                builder: (context, state) => const DashboardScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/leave',
                builder: (context, state) => const LeaveOverviewScreen(),
                routes: [
                  GoRoute(
                    path: 'apply',
                    builder: (context, state) => const ApplyLeaveScreen(),
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/payslips',
                builder: (context, state) => const PayslipsScreen(),
                routes: [
                  GoRoute(
                    path: ':id',
                    builder: (context, state) {
                      final id = state.pathParameters['id']!;
                      return PayslipDetailScreen(payslipId: id);
                    },
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/profile',
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        path: '/overtime',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const OvertimeScreen(),
        routes: [
          GoRoute(
            path: 'request',
            builder: (context, state) => const RequestOvertimeScreen(),
          ),
        ],
      ),
      GoRoute(
        path: '/attendance-history',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const AttendanceHistoryScreen(),
      ),
      GoRoute(
        path: '/settings',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const SettingsScreen(),
      ),
      GoRoute(
        path: '/live-tracking',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const LiveTrackingScreen(),
      ),
    ],
  );
});
