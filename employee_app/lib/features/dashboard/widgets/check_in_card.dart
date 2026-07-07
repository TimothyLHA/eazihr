import 'package:flutter/material.dart';
import 'package:employee_app/data/models/attendance_model.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:employee_app/core/theme/app_theme.dart';

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
    final isCheckedIn = attendance != null && attendance!.checkIn != null && attendance!.checkOut == null;
    final isCheckedOut = attendance != null && attendance!.checkIn != null && attendance!.checkOut != null;
    final isIdle = action == CheckInAction.idling;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest.withAlpha(230),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.outlineVariant.withAlpha(80)),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withAlpha(8),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Stack(
            alignment: Alignment.center,
            children: [
              if (!isCheckedOut)
                Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.secondary.withAlpha(15),
                  ),
                ),
              Container(
                width: 88,
                height: 88,
                decoration: BoxDecoration(
                  color: AppColors.primaryContainer,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  isCheckedIn ? Icons.logout : Icons.location_on,
                  size: 40,
                  color: AppColors.onPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            isCheckedOut
                ? 'Checked Out'
                : isCheckedIn
                    ? 'Checked In'
                    : 'Check In / Out',
            style: GoogleFonts.inter(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.secondary,
                ),
              ),
              const SizedBox(width: 6),
              Text(
                isCheckedIn
                    ? 'Since ${attendance!.checkIn!.substring(11, 16)}'
                    : 'GPS Active: Site B-12',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.secondary,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          if (error != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Text(error!, style: const TextStyle(color: AppColors.error, fontSize: 13)),
            ),
          SizedBox(
            width: double.infinity,
            height: 56,
            child: ElevatedButton(
              onPressed: !isIdle ? null : (isCheckedIn ? onCheckOut : onCheckIn),
              style: ElevatedButton.styleFrom(
                backgroundColor: isCheckedIn ? AppColors.error : AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 4,
                shadowColor: (isCheckedIn ? AppColors.error : AppColors.primary).withAlpha(50),
              ),
              child: _buildButtonChild(isCheckedIn, isCheckedOut),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            isCheckedIn
                ? 'Tap to check out from site'
                : isCheckedOut
                    ? 'Tap to start your shift'
                    : 'Tap to check in to site',
            style: GoogleFonts.inter(
              fontSize: 12,
              color: AppColors.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildButtonChild(bool isCheckedIn, bool isCheckedOut) {
    if (action == CheckInAction.checkingIn || action == CheckInAction.checkingOut) {
      return const SizedBox(
        height: 22, width: 22,
        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
      );
    }
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          isCheckedIn ? 'Check Out of Site' : 'Check In to Site',
          style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w700),
        ),
        const SizedBox(width: 8),
        Icon(isCheckedIn ? Icons.logout : Icons.login, size: 20),
      ],
    );
  }
}
