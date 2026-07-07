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
import 'package:google_fonts/google_fonts.dart';
import 'package:employee_app/core/theme/app_theme.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  CheckInAction _action = CheckInAction.idling;
  String? _checkInError;

  Future<void> _handleCheckIn() async {
    setState(() { _action = CheckInAction.checkingIn; _checkInError = null; });
    try {
      final repo = ref.read(attendanceRepositoryProvider);
      final orgId = ref.read(authNotifierProvider.notifier).organizationId;
      final employee = ref.read(employeeProvider).valueOrNull;
      if (orgId == null || employee == null) throw Exception('Not authenticated');
      final now = DateTime.now().toUtc().toIso8601String();
      final today = now.split('T')[0];
      await repo.checkIn(organizationId: orgId, employeeId: employee.id, today: today, now: now);
      ref.invalidate(todayAttendanceProvider);
      ref.invalidate(attendanceLogsProvider);
    } catch (e) {
      setState(() => _checkInError = e.toString());
    } finally {
      if (mounted) setState(() => _action = CheckInAction.idling);
    }
  }

  Future<void> _handleCheckOut() async {
    setState(() { _action = CheckInAction.checkingOut; _checkInError = null; });
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
    final employeeAsync = ref.watch(employeeProvider);
    final todayAsync = ref.watch(todayAttendanceProvider);
    final logsAsync = ref.watch(attendanceLogsProvider);
    final authNotifier = ref.watch(authNotifierProvider.notifier);

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _refresh,
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            children: [
              const SizedBox(height: 12),
              _buildTopBar(context, employeeAsync, authNotifier),
              const SizedBox(height: 20),
              todayAsync.when(
                data: (attendance) => CheckInCard(
                  attendance: attendance,
                  action: _action,
                  error: _checkInError,
                  onCheckIn: _handleCheckIn,
                  onCheckOut: _handleCheckOut,
                ),
                loading: () => const SizedBox(height: 260, child: Center(child: CircularProgressIndicator(strokeWidth: 2))),
                error: (e, _) => _buildErrorCard('Could not load today\'s status'),
              ),
              const SizedBox(height: 16),
              logsAsync.when(
                data: (logs) => StatsBento(recentLogs: logs),
                loading: () => const SizedBox(
                  height: 130,
                  child: Row(children: [
                    Expanded(child: Card(child: Center(child: CircularProgressIndicator(strokeWidth: 2)))),
                    SizedBox(width: 12),
                    Expanded(child: Card(child: Center(child: CircularProgressIndicator(strokeWidth: 2)))),
                  ]),
                ),
                error: (_, _) => const SizedBox(),
              ),
              const SizedBox(height: 24),
              _buildCurrentTask(),
              const SizedBox(height: 24),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: Text('Quick Actions',
                  style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.primary)),
              ),
              const SizedBox(height: 12),
              const QuickActionsGrid(),
              const SizedBox(height: 24),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Recent Logs',
                      style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.primary)),
                    GestureDetector(
                      onTap: () => context.push('/attendance-history'),
                      child: Row(
                        children: [
                          Text('View All',
                            style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary)),
                          const SizedBox(width: 2),
                          const Icon(Icons.chevron_right, size: 18, color: AppColors.primary),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              logsAsync.when(
                data: (logs) => RecentLogsList(logs: logs),
                loading: () => const SizedBox(height: 120, child: Center(child: CircularProgressIndicator(strokeWidth: 2))),
                error: (e, _) => _buildErrorCard('Error loading records'),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTopBar(BuildContext context, AsyncValue employeeAsync, authNotifier) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.primary, width: 2),
                color: AppColors.surfaceContainerLowest,
              ),
              child: const Icon(Icons.person, color: AppColors.primary, size: 22),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('HR Portal',
                  style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w600, color: AppColors.primary)),
                Text('Field Associate',
                  style: GoogleFonts.inter(fontSize: 12, color: AppColors.onSurfaceVariant)),
              ],
            ),
          ],
        ),
        Row(
          children: [
            _iconButton(Icons.notifications_outlined, () {}),
            const SizedBox(width: 4),
            _iconButton(Icons.help_outline, () {}),
          ],
        ),
      ],
    );
  }

  Widget _iconButton(IconData icon, VoidCallback onTap) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(50),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(8),
          child: Icon(icon, size: 24, color: AppColors.onSurface),
        ),
      ),
    );
  }

  Widget _buildCurrentTask() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.secondaryContainer.withAlpha(100),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.outlineVariant.withAlpha(60)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('CURRENT TASK',
                    style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.onSurfaceVariant, letterSpacing: 1.2)),
                  const SizedBox(height: 4),
                  Text('Equipment Inspection',
                    style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.onSurface)),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.secondary,
                  borderRadius: BorderRadius.circular(100),
                ),
                child: Text('In Progress',
                  style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white, letterSpacing: 0.5)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ClipRRect(
            borderRadius: BorderRadius.circular(100),
            child: Container(
              height: 8,
              color: Colors.white.withAlpha(150),
              child: FractionallySizedBox(
                alignment: Alignment.centerLeft,
                widthFactor: 0.65,
                child: Container(
                  decoration: BoxDecoration(
                    color: AppColors.secondary,
                    borderRadius: BorderRadius.circular(100),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Phase 2 of 3',
                style: GoogleFonts.inter(fontSize: 11, color: AppColors.onSurfaceVariant)),
              Text('65% Complete',
                style: GoogleFonts.inter(fontSize: 11, color: AppColors.onSurfaceVariant)),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () {},
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.primary,
                side: const BorderSide(color: AppColors.primary),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              child: Text('Update Status',
                style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorCard(String message) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.outlineVariant.withAlpha(80)),
      ),
      child: Column(
        children: [
          const Icon(Icons.cloud_off, size: 32, color: AppColors.onSurfaceVariant),
          const SizedBox(height: 8),
          Text(message, style: GoogleFonts.inter(fontSize: 13, color: AppColors.onSurfaceVariant)),
        ],
      ),
    );
  }
}
