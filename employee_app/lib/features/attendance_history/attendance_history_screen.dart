import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:employee_app/providers/attendance_provider.dart';
import 'package:employee_app/providers/employee_provider.dart';
import 'package:employee_app/features/auth/providers/auth_provider.dart';
import 'package:employee_app/features/attendance_history/widgets/attendance_day_tile.dart';
import 'package:employee_app/features/attendance_history/widgets/month_picker.dart';

class AttendanceHistoryScreen extends ConsumerStatefulWidget {
  const AttendanceHistoryScreen({super.key});

  @override
  ConsumerState<AttendanceHistoryScreen> createState() => _AttendanceHistoryScreenState();
}

class _AttendanceHistoryScreenState extends ConsumerState<AttendanceHistoryScreen> {
  late int _selectedYear;
  late int _selectedMonth;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _selectedYear = now.year;
    _selectedMonth = now.month;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final logsAsync = ref.watch(attendanceLogsProvider);
    final logs = logsAsync.valueOrNull ?? [];

    final monthLogs = logs.where((l) {
      final date = DateTime.tryParse(l.date);
      return date != null && date.year == _selectedYear && date.month == _selectedMonth;
    }).toList();

    final presentCount = monthLogs.where((l) => l.status != 'absent').length;
    final lateCount = monthLogs.where((l) => l.status == 'late').length;
    final totalWorkDays = monthLogs.length;

    return Scaffold(
      appBar: AppBar(title: const Text('Attendance')),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            color: theme.colorScheme.surface,
            child: Column(
              children: [
                MonthPicker(
                  year: _selectedYear,
                  month: _selectedMonth,
                  onYearChanged: (y) => setState(() { _selectedYear = y; }),
                  onMonthChanged: (m) => setState(() { _selectedMonth = m; }),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    _summaryChip(theme, 'Present', presentCount.toString(), Colors.green),
                    const SizedBox(width: 8),
                    _summaryChip(theme, 'Late', lateCount.toString(), Colors.orange),
                    const SizedBox(width: 8),
                    _summaryChip(theme, 'Total', totalWorkDays.toString(), theme.colorScheme.onSurface),
                  ],
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: logsAsync.hasError
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.cloud_off, size: 48, color: theme.colorScheme.error.withAlpha(150)),
                        const SizedBox(height: 12),
                        Text('Could not load data', style: theme.textTheme.bodyMedium),
                        const SizedBox(height: 8),
                        TextButton(
                          onPressed: () {
                            ref.invalidate(attendanceLogsProvider);
                          },
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  )
                : logsAsync.isLoading
                    ? const Center(child: CircularProgressIndicator(strokeWidth: 2))
                    : monthLogs.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.history, size: 48, color: theme.colorScheme.onSurface.withAlpha(60)),
                                const SizedBox(height: 12),
                                Text('No records for this month', style: theme.textTheme.bodyMedium),
                              ],
                            ),
                          )
                        : RefreshIndicator(
                            onRefresh: () async {
                              ref.invalidate(attendanceLogsProvider);
                              await Future.delayed(const Duration(milliseconds: 500));
                            },
                            child: ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: monthLogs.length,
                              itemBuilder: (context, index) => AttendanceDayTile(
                                log: monthLogs[index],
                                initiallyExpanded: index == 0,
                              ),
                            ),
                          ),
          ),
        ],
      ),
    );
  }

  Widget _summaryChip(ThemeData theme, String label, String count, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: color.withAlpha(20),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Text(count, style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700, color: color)),
            Text(label, style: theme.textTheme.labelSmall?.copyWith(color: theme.colorScheme.onSurface.withAlpha(150))),
          ],
        ),
      ),
    );
  }
}
