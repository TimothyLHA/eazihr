import 'package:flutter/material.dart';
import 'package:employee_app/data/models/attendance_model.dart';

class RecentLogsList extends StatelessWidget {
  final List<AttendanceModel> logs;
  final VoidCallback? onRefresh;

  const RecentLogsList({
    super.key,
    required this.logs,
    this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (logs.isEmpty) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(48),
          child: Center(
            child: Column(
              children: [
                Icon(Icons.history, size: 48, color: theme.colorScheme.onSurface.withAlpha(60)),
                const SizedBox(height: 12),
                Text(
                  'No attendance records yet',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurface.withAlpha(120),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Check in to start tracking your hours',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurface.withAlpha(80),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Column(
      children: [
        ...logs.take(5).map((log) {
          final date = log.date;
          final checkIn = log.checkIn?.substring(11, 19) ?? '--';
          final checkOut = log.checkOut?.substring(11, 19) ?? '--';
          final duration = _formatDuration(log);

          return ListTile(
            leading: _statusIcon(log.status),
            title: Text(
              _formatDate(date),
              style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w500),
            ),
            subtitle: Text(
              '$checkIn - $checkOut${duration != null ? ' ($duration)' : ''}',
              style: theme.textTheme.bodySmall,
            ),
          );
        }),
      ],
    );
  }

  String _formatDate(String isoDate) {
    final date = DateTime.tryParse(isoDate);
    if (date == null) return isoDate;

    final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }

  String? _formatDuration(AttendanceModel log) {
    if (log.checkIn == null || log.checkOut == null) return null;
    final checkIn = DateTime.tryParse(log.checkIn!);
    final checkOut = DateTime.tryParse(log.checkOut!);
    if (checkIn == null || checkOut == null) return null;

    final minutes = checkOut.difference(checkIn).inMinutes;
    if (minutes < 60) return '${minutes}m';
    return '${(minutes / 60).floor()}h ${minutes % 60}m';
  }

  Widget _statusIcon(String status) {
    switch (status) {
      case 'on_time':
        return const Icon(Icons.check_circle, color: Colors.green, size: 20);
      case 'late':
        return const Icon(Icons.warning, color: Colors.orange, size: 20);
      case 'absent':
        return const Icon(Icons.cancel, color: Colors.red, size: 20);
      case 'half_day':
        return const Icon(Icons.remove_circle, color: Colors.amber, size: 20);
      default:
        return const Icon(Icons.help, size: 20);
    }
  }
}
