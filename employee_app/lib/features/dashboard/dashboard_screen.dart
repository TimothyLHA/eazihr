import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:employee_app/providers/organization_provider.dart';
import 'package:employee_app/providers/employee_provider.dart';
import 'package:employee_app/providers/attendance_provider.dart';
import 'package:employee_app/features/auth/providers/auth_provider.dart';
import 'package:go_router/go_router.dart';
import 'package:employee_app/features/dashboard/widgets/check_in_card.dart';
import 'package:employee_app/features/dashboard/widgets/stats_bento.dart';
import 'package:employee_app/features/dashboard/widgets/quick_actions_grid.dart';
import 'package:employee_app/features/dashboard/widgets/recent_logs_list.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  CheckInAction _action = CheckInAction.idling;
  String? _checkInError;

  Future<void> _handleCheckIn() async {
    setState(() {
      _action = CheckInAction.checkingIn;
      _checkInError = null;
    });

    try {
      final repo = ref.read(attendanceRepositoryProvider);
      final orgId = ref.read(authNotifierProvider.notifier).organizationId;
      final employee = ref.read(employeeProvider).valueOrNull;
      if (orgId == null || employee == null) throw Exception('Not authenticated');

      final now = DateTime.now().toUtc().toIso8601String();
      final today = now.split('T')[0];

      await repo.checkIn(
        organizationId: orgId,
        employeeId: employee.id,
        today: today,
        now: now,
      );

      ref.invalidate(todayAttendanceProvider);
      ref.invalidate(attendanceLogsProvider);
    } catch (e) {
      setState(() => _checkInError = e.toString());
    } finally {
      if (mounted) setState(() => _action = CheckInAction.idling);
    }
  }

  Future<void> _handleCheckOut() async {
    setState(() {
      _action = CheckInAction.checkingOut;
      _checkInError = null;
    });

    try {
      final repo = ref.read(attendanceRepositoryProvider);
      final attendance = ref.read(todayAttendanceProvider).valueOrNull;
      if (attendance?.id == null) throw Exception('No check-in record found');

      final now = DateTime.now().toUtc().toIso8601String();

      await repo.checkOut(attendanceId: attendance!.id, now: now);

      ref.invalidate(todayAttendanceProvider);
      ref.invalidate(attendanceLogsProvider);
    } catch (e) {
      setState(() => _checkInError = e.toString());
    } finally {
      if (mounted) setState(() => _action = CheckInAction.idling);
    }
  }

  Future<void> _refresh() async {
    ref.invalidate(organizationProvider);
    ref.invalidate(employeeProvider);
    ref.invalidate(todayAttendanceProvider);
    ref.invalidate(attendanceLogsProvider);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final orgAsync = ref.watch(organizationProvider);
    final employeeAsync = ref.watch(employeeProvider);
    final todayAsync = ref.watch(todayAttendanceProvider);
    final logsAsync = ref.watch(attendanceLogsProvider);
    final authNotifier = ref.watch(authNotifierProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        title: orgAsync.when(
          data: (org) => Text(org.name),
          loading: () => const Text('EasyHR'),
          error: (_, _) => const Text('EasyHR'),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async => authNotifier.signOut(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            employeeAsync.when(
              data: (employee) => Text(
                'Hi, ${employee.employeeCode ?? 'Employee'}',
                style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700),
              ),
              loading: () => const SizedBox(height: 28, child: Center(child: CircularProgressIndicator(strokeWidth: 2))),
              error: (e, _) => Text('Could not load profile', style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.error)),
            ),
            const SizedBox(height: 20),
            todayAsync.when(
              data: (attendance) => CheckInCard(
                attendance: attendance,
                action: _action,
                error: _checkInError,
                onCheckIn: _handleCheckIn,
                onCheckOut: _handleCheckOut,
              ),
              loading: () => const Card(
                child: SizedBox(height: 140, child: Center(child: CircularProgressIndicator(strokeWidth: 2))),
              ),
              error: (e, _) => Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      const Icon(Icons.cloud_off, size: 32),
                      const SizedBox(height: 8),
                      Text('Could not load today\'s status', style: theme.textTheme.bodySmall),
                      const SizedBox(height: 8),
                      TextButton(onPressed: _refresh, child: const Text('Retry')),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
            logsAsync.when(
              data: (logs) => StatsBento(recentLogs: logs),
              loading: () => const Row(
                children: [
                  Expanded(child: Card(child: SizedBox(height: 100, child: Center(child: CircularProgressIndicator(strokeWidth: 2))))),
                  SizedBox(width: 12),
                  Expanded(child: Card(child: SizedBox(height: 100, child: Center(child: CircularProgressIndicator(strokeWidth: 2))))),
                ],
              ),
              error: (_, _) => const SizedBox(),
            ),
            const SizedBox(height: 24),
            Text('Quick Actions', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            const QuickActionsGrid(),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Recent Activity', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                TextButton(
                  onPressed: () => context.push('/attendance-history'),
                  child: const Text('View All'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            logsAsync.when(
              data: (logs) => RecentLogsList(logs: logs),
              loading: () => const Card(child: SizedBox(height: 120, child: Center(child: CircularProgressIndicator(strokeWidth: 2)))),
              error: (e, _) => Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Text('Error loading records: $e', style: theme.textTheme.bodySmall),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
