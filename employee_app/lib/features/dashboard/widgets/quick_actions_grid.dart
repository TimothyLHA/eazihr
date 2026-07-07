import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:employee_app/providers/organization_provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:employee_app/core/theme/app_theme.dart';

class QuickActionsGrid extends ConsumerWidget {
  const QuickActionsGrid({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orgAsync = ref.watch(organizationProvider);

    final actions = <_Action>[
      _Action(Icons.event_busy, 'Leave', '/leave'),
      _Action(Icons.receipt_long, 'Payslips', '/payslips'),
      _Action(Icons.stars, 'Perks', null),
      _Action(Icons.settings, 'Profile', '/profile'),
    ];

    orgAsync.whenOrNull(
      data: (org) {
        final featureConfig = org.featureConfig;
        final overtimeEnabled = featureConfig['overtime'] ?? true;
        final trackingEnabled = featureConfig['live_tracking'] ?? true;
        if (overtimeEnabled) {
          actions.insert(1, _Action(Icons.timer_outlined, 'Overtime', '/overtime'));
        }
        if (trackingEnabled) {
          actions.insert(2, _Action(Icons.location_on, 'Tracking', '/live-tracking'));
        }
      },
    );

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        crossAxisSpacing: 12,
        mainAxisSpacing: 8,
        childAspectRatio: 0.75,
      ),
      itemCount: actions.length,
      itemBuilder: (context, index) {
        final action = actions[index];
        return GestureDetector(
          onTap: action.route != null ? () => context.push(action.route!) : null,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: AppColors.surfaceContainerLowest,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.outlineVariant.withAlpha(120)),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withAlpha(6),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Icon(action.icon, color: AppColors.primary, size: 26),
              ),
              const SizedBox(height: 8),
              Text(
                action.label,
                style: GoogleFonts.inter(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: AppColors.onSurfaceVariant,
                  letterSpacing: 0.3,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        );
      },
    );
  }
}

class _Action {
  final IconData icon;
  final String label;
  final String? route;
  const _Action(this.icon, this.label, this.route);
}
