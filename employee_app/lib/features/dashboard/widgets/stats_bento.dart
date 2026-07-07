import 'package:flutter/material.dart';
import 'package:employee_app/data/models/attendance_model.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:employee_app/core/theme/app_theme.dart';

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
    final hoursToday = _calculateHoursToday(recentLogs);
    final otThisWeek = _calculateOvertimeThisWeek(recentLogs);

    return Row(
      children: [
        Expanded(
          child: _StatCard(
            icon: Icons.schedule,
            label: 'Today',
            value: '${hoursToday.toStringAsFixed(0)}h ${((hoursToday % 1) * 60).toStringAsFixed(0)}m',
            sublabel: 'Hours Worked',
            bgColor: AppColors.surfaceContainerLowest,
            valueColor: AppColors.primary,
            iconColor: AppColors.secondary,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _StatCard(
            icon: Icons.more_time,
            label: 'Overtime',
            value: '+${otThisWeek.toStringAsFixed(0)}h ${((otThisWeek % 1) * 60).toStringAsFixed(0)}m',
            sublabel: 'Current Week',
            bgColor: AppColors.primaryContainer,
            valueColor: AppColors.primaryFixed,
            iconColor: AppColors.primaryFixed,
            labelColor: AppColors.primaryFixedDim,
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
  final IconData icon;
  final String label;
  final String value;
  final String sublabel;
  final Color bgColor;
  final Color valueColor;
  final Color iconColor;
  final Color? labelColor;

  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.sublabel,
    required this.bgColor,
    required this.valueColor,
    required this.iconColor,
    this.labelColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
        border: bgColor == AppColors.surfaceContainerLowest
            ? Border.all(color: AppColors.outlineVariant.withAlpha(120))
            : null,
        boxShadow: bgColor == AppColors.surfaceContainerLowest
            ? [BoxShadow(color: AppColors.primary.withAlpha(8), blurRadius: 12, offset: const Offset(0, 2))]
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(icon, color: iconColor, size: 22),
              Text(
                label,
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: labelColor ?? AppColors.onSurfaceVariant,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            value,
            style: GoogleFonts.inter(
              fontSize: 26,
              fontWeight: FontWeight.w700,
              color: valueColor,
              height: 1.1,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            sublabel,
            style: GoogleFonts.inter(
              fontSize: 12,
              color: labelColor?.withAlpha(200) ?? AppColors.onSurfaceVariant.withAlpha(180),
            ),
          ),
        ],
      ),
    );
  }
}
