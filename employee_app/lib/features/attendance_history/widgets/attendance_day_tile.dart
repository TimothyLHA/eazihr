import 'package:flutter/material.dart';
import 'package:employee_app/data/models/attendance_model.dart';

class AttendanceDayTile extends StatelessWidget {
  final AttendanceModel log;
  final bool initiallyExpanded;

  const AttendanceDayTile({
    super.key,
    required this.log,
    this.initiallyExpanded = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final checkIn = log.checkIn?.substring(11, 19) ?? '--';
    final checkOut = log.checkOut?.substring(11, 19) ?? '--';
    final duration = _formatDuration(log);

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 0, vertical: 4),
      child: ExpansionTile(
        initiallyExpanded: initiallyExpanded,
        leading: _statusIcon(log.status),
        title: Text(
          _formatDate(log.date),
          style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w500),
        ),
        subtitle: Text(
          '$checkIn - $checkOut${duration != null ? '  ·  $duration' : ''}',
          style: theme.textTheme.bodySmall,
        ),
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: Column(
              children: [
                _detailRow(theme, 'Status', _statusLabel(log.status)),
                if (log.checkIn != null) _detailRow(theme, 'Check In', checkIn),
                if (log.checkOut != null) _detailRow(theme, 'Check Out', checkOut),
                if (duration != null) _detailRow(theme, 'Duration', duration),
                if (log.shiftType != null) _detailRow(theme, 'Shift', log.shiftType!),
                if (log.location.isNotEmpty && log.location['address'] != null)
                  _detailRow(theme, 'Location', log.location['address'] as String),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _detailRow(ThemeData theme, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurface.withAlpha(150))),
          Text(value, style: theme.textTheme.bodySmall?.copyWith(fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  String _statusLabel(String status) {
    switch (status) {
      case 'on_time': return 'On Time';
      case 'late': return 'Late';
      case 'absent': return 'Absent';
      case 'half_day': return 'Half Day';
      default: return status;
    }
  }

  String _formatDate(String isoDate) {
    final date = DateTime.tryParse(isoDate);
    if (date == null) return isoDate;
    final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    final days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return '${date.day} ${months[date.month - 1]} ${date.year}, ${days[date.weekday - 1]}';
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
        return const Icon(Icons.check_circle, color: Colors.green);
      case 'late':
        return const Icon(Icons.warning, color: Colors.orange);
      case 'absent':
        return const Icon(Icons.cancel, color: Colors.red);
      case 'half_day':
        return const Icon(Icons.remove_circle, color: Colors.amber);
      default:
        return const Icon(Icons.help);
    }
  }
}
