import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:employee_app/providers/organization_provider.dart';

class QuickActionsGrid extends ConsumerWidget {
  const QuickActionsGrid({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final orgAsync = ref.watch(organizationProvider);
    
    final actions = <Map<String, dynamic>>[
      {'icon': Icons.card_travel, 'label': 'Leave', 'route': '/leave'},
      {'icon': Icons.payments, 'label': 'Payslips', 'route': '/payslips'},
      {'icon': Icons.timer_outlined, 'label': 'Overtime', 'route': '/overtime'},
      {'icon': Icons.person, 'label': 'Profile', 'route': '/profile'},
    ];

    // Add live tracking if enabled for organization
    orgAsync.whenOrNull(
      data: (org) {
        final featureConfig = org.featureConfig;
        final liveTrackingEnabled = featureConfig['live_tracking'] ?? false;
        if (liveTrackingEnabled) {
          actions.add({'icon': Icons.location_on, 'label': 'Live Track', 'route': '/live-tracking'});
        }
      },
    );

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
        childAspectRatio: 0.85,
      ),
      itemCount: actions.length,
      itemBuilder: (context, index) {
        final action = actions[index];
        return Material(
          color: theme.colorScheme.surfaceContainerLow,
          borderRadius: BorderRadius.circular(16),
          child: InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () => context.push(action['route'] as String),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(action['icon'] as IconData, size: 28, color: theme.colorScheme.primary),
                const SizedBox(height: 6),
                Text(
                  action['label'] as String,
                  style: theme.textTheme.labelSmall,
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}