import 'package:flutter/material.dart';
import 'package:employee_app/data/models/attendance_model.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:employee_app/core/theme/app_theme.dart';

class RecentLogsList extends StatelessWidget {
  final List<AttendanceModel> logs;

  const RecentLogsList({super.key, required this.logs});

  @override
  Widget build(BuildContext context) {
    if (logs.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surfaceContainerLowest,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.outlineVariant.withAlpha(80)),
        ),
        child: Center(
          child: Column(
            children: [
              const Icon(Icons.history, size: 40, color: AppColors.onSurfaceVariant),
              const SizedBox(height: 8),
              Text(
                'No attendance records yet',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: AppColors.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Check in to start tracking your hours',
                style: GoogleFonts.inter(fontSize: 12, color: AppColors.onSurfaceVariant.withAlpha(150)),
              ),
            ],
          ),
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.outlineVariant.withAlpha(80)),
      ),
      child: Column(
        children: [
          ...logs.take(5).map((log) => _buildLogItem(log)),
        ],
      ),
    );
  }

  Widget _buildLogItem(AttendanceModel log) {
    final date = log.date;
    final checkIn = log.checkIn?.substring(11, 16) ?? '--:--';
    final checkOut = log.checkOut?.substring(11, 16) ?? '--:--';
    final isCheckIn = log.checkOut == null;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: AppColors.outlineVariant.withAlpha(60))),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.secondaryContainer.withAlpha(80),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              isCheckIn ? Icons.login : Icons.logout,
              size: 18,
              color: AppColors.secondary,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isCheckIn ? 'Clock In' : 'Clock Out',
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.onSurface,
                  ),
                ),
                Text(
                  _formatDate(date),
                  style: GoogleFonts.inter(fontSize: 12, color: AppColors.onSurfaceVariant),
                ),
              ],
            ),
          ),
          Text(
            isCheckIn ? checkIn : checkOut,
            style: GoogleFonts.inter(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: AppColors.onSurface,
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(String isoDate) {
    final date = DateTime.tryParse(isoDate);
    if (date == null) return isoDate;
    final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${months[date.month - 1]} ${date.day}';
  }
}
