import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:employee_app/data/models/overtime_model.dart';
import 'package:employee_app/providers/overtime_provider.dart';
import 'package:employee_app/features/auth/providers/auth_provider.dart';
import 'package:go_router/go_router.dart';

class OvertimeScreen extends ConsumerWidget {
  const OvertimeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final requestsAsync = ref.watch(overtimeRequestsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Overtime'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline),
            onPressed: () => context.push('/overtime/request'),
            tooltip: 'Request Overtime',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(overtimeRequestsProvider);
          await Future.delayed(const Duration(milliseconds: 500));
        },
        child: requestsAsync.when(
          data: (requests) {
            if (requests.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.access_time,
                      size: 64,
                      color: theme.colorScheme.onSurface.withAlpha(60),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'No overtime requests',
                      style: theme.textTheme.titleMedium,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Tap + to request overtime',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurface.withAlpha(120),
                      ),
                    ),
                  ],
                ),
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: requests.length,
              itemBuilder: (context, index) {
                final request = requests[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _OvertimeCard(request: request),
                );
              },
            );
          },
          loading: () => const Center(child: CircularProgressIndicator(strokeWidth: 2)),
          error: (e, _) => Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.cloud_off, size: 48, color: theme.colorScheme.error.withAlpha(150)),
                const SizedBox(height: 12),
                Text('Could not load overtime requests', style: theme.textTheme.bodyMedium),
                const SizedBox(height: 8),
                TextButton(
                  onPressed: () => ref.invalidate(overtimeRequestsProvider),
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _OvertimeCard extends StatelessWidget {
  final OvertimeModel request;

  const _OvertimeCard({required this.request});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final statusColor = _getStatusColor(request.status);
    final statusLabel = _getStatusLabel(request.status);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    _formatDate(request.date),
                    style: theme.textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: statusColor.withAlpha(30),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    statusLabel,
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: statusColor,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Icon(Icons.access_time, size: 16, color: theme.colorScheme.onSurface.withAlpha(150)),
                const SizedBox(width: 8),
                Text(
                  '${request.hours} hour${request.hours != 1 ? 's' : ''}',
                  style: theme.textTheme.bodySmall,
                ),
                const SizedBox(width: 24),
                Icon(Icons.trending_up, size: 16, color: theme.colorScheme.onSurface.withAlpha(150)),
                const SizedBox(width: 8),
                Text(
                  '${request.rate}x rate',
                  style: theme.textTheme.bodySmall,
                ),
              ],
            ),
            if (request.totalAmount != null) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.payments, size: 16, color: theme.colorScheme.onSurface.withAlpha(150)),
                  const SizedBox(width: 8),
                  Text(
                    'Total: \$${request.totalAmount!.toStringAsFixed(2)}',
                    style: theme.textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.primary,
                    ),
                  ),
                ],
              ),
            ],
            if (request.reason != null && request.reason!.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                request.reason!,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurface.withAlpha(150),
                  fontStyle: FontStyle.italic,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'approved':
        return Colors.green;
      case 'rejected':
        return Colors.red;
      case 'pending':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  String _getStatusLabel(String status) {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  }

  String _formatDate(String isoDate) {
    final date = DateTime.tryParse(isoDate);
    if (date == null) return isoDate;
    final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }
}