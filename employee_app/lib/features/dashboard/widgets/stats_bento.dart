import 'package:flutter/material.dart';
import 'package:employee_app/data/models/attendance_model.dart';

class StatsBento extends StatelessWidget {
  final List<AttendanceModel> recentLogs;
  final double? overtimeRate;

  const StatsBento({
    super.key,
    required this.recentLogs,
    this.overtimeRate,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final hoursToday = _calculateHoursToday(recentLogs);
    final otThisWeek = _calculateOvertimeThisWeek(recentLogs);

    return Row(
      children: [
        Expanded(
          child: _StatCard(
            theme: theme,
            icon: Icons.schedule,
            label: 'Today',
            value: '${hoursToday.toStringAsFixed(1)}h',
            color: theme.colorScheme.secondary,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _StatCard(
            theme: theme,
            icon: Icons.timer_outlined,
            label: 'OT This Week',
            value: '${otThisWeek.toStringAsFixed(1)}h',
            color: theme.colorScheme.primary,
          ),
        ),
      ],
    );
  }

  double _calculateHoursToday(List<AttendanceModel> logs) {
    final today = DateTime.now().toIso8601String().split('T')[0];
    final todayLog = logs.where((l) => l.date == today).firstOrNull;
    if (todayLog == null || todayLog.checkIn == null) return 0;

    final checkIn = DateTime.tryParse(todayLog.checkIn!);
    if (checkIn == null) return 0;

    final checkOut = todayLog.checkOut != null ? DateTime.tryParse(todayLog.checkOut!) : DateTime.now();
    if (checkOut == null) return 0;

    return (checkOut.difference(checkIn).inMinutes / 60.0);
  }

  double _calculateOvertimeThisWeek(List<AttendanceModel> logs) {
    final now = DateTime.now();
    final startOfWeek = now.subtract(Duration(days: now.weekday - 1));

    double totalHours = 0;
    for (final log in logs) {
      final logDate = DateTime.tryParse(log.date);
      if (logDate == null || logDate.isBefore(startOfWeek)) continue;
      if (log.checkIn == null || log.checkOut == null) continue;

      final checkIn = DateTime.tryParse(log.checkIn!);
      final checkOut = DateTime.tryParse(log.checkOut!);
      if (checkIn == null || checkOut == null) continue;

      totalHours += checkOut.difference(checkIn).inMinutes / 60.0;
    }

    return (totalHours > 40) ? totalHours - 40 : 0;
  }
}

class _StatCard extends StatelessWidget {
  final ThemeData theme;
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatCard({
    required this.theme,
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 16),
            Text(
              value,
              style: theme.textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.w700,
                color: theme.colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurface.withAlpha(150),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
