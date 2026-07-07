import 'package:flutter/material.dart';
import 'package:employee_app/data/models/attendance_model.dart';

enum CheckInAction { idling, checkingIn, checkingOut }

class CheckInCard extends StatelessWidget {
  final AttendanceModel? attendance;
  final CheckInAction action;
  final String? error;
  final VoidCallback onCheckIn;
  final VoidCallback onCheckOut;

  const CheckInCard({
    super.key,
    this.attendance,
    this.action = CheckInAction.idling,
    this.error,
    required this.onCheckIn,
    required this.onCheckOut,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isCheckedIn = attendance != null && attendance!.checkIn != null && attendance!.checkOut == null;
    final isCheckedOut = attendance != null && attendance!.checkIn != null && attendance!.checkOut != null;
    final isIdle = action == CheckInAction.idling;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                _StatusIndicator(
                  isCheckedIn: isCheckedIn,
                  isPulsing: action == CheckInAction.idling && (isCheckedIn || !isCheckedOut),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isCheckedOut
                            ? 'Checked Out'
                            : isCheckedIn
                                ? 'Checked In'
                                : 'Not Checked In',
                        style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        attendance?.checkIn != null
                            ? 'Since ${attendance!.checkIn!.substring(11, 19)}'
                            : 'Tap the button to mark your attendance',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurface.withAlpha(150),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            if (error != null) ...[
              const SizedBox(height: 12),
              Text(
                error!,
                style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.error),
              ),
            ],
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: !isIdle ? null : (isCheckedIn ? onCheckOut : onCheckIn),
                style: ElevatedButton.styleFrom(
                  backgroundColor: isCheckedIn ? theme.colorScheme.error : theme.colorScheme.secondary,
                  foregroundColor: theme.colorScheme.onError,
                  minimumSize: const Size(0, 52),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: _buildButtonChild(isCheckedIn, isCheckedOut),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildButtonChild(bool isCheckedIn, bool isCheckedOut) {
    if (action == CheckInAction.checkingIn) {
      return const Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)),
          SizedBox(width: 8),
          Text('Checking In...'),
        ],
      );
    }
    if (action == CheckInAction.checkingOut) {
      return const Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)),
          SizedBox(width: 8),
          Text('Checking Out...'),
        ],
      );
    }
    if (error != null) {
      return const Text('Retry');
    }
    if (isCheckedIn) {
      return const Text('Check Out of Site');
    }
    if (isCheckedOut) {
      return const Text('Check In to Site');
    }
    return const Text('Check In to Site');
  }
}

class _StatusIndicator extends StatelessWidget {
  final bool isCheckedIn;
  final bool isPulsing;

  const _StatusIndicator({required this.isCheckedIn, required this.isPulsing});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final color = isCheckedIn ? theme.colorScheme.error : theme.colorScheme.secondary;

    return Container(
      width: 56,
      height: 56,
      decoration: BoxDecoration(
        color: color.withAlpha(25),
        shape: BoxShape.circle,
      ),
      child: Icon(
        isCheckedIn ? Icons.logout : Icons.login,
        color: color,
        size: 28,
      ),
    );
  }
}
