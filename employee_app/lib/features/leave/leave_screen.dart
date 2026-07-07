import 'package:flutter/material.dart';

class LeaveScreen extends StatelessWidget {
  const LeaveScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Leave')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.card_travel, size: 64, color: theme.colorScheme.primary.withAlpha(100)),
            const SizedBox(height: 16),
            Text('Leave Management', style: theme.textTheme.titleMedium),
            const SizedBox(height: 8),
            Text('Coming in Phase 4', style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurface.withAlpha(120))),
          ],
        ),
      ),
    );
  }
}
