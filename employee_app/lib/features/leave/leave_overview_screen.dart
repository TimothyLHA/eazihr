import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:employee_app/data/models/leave_balance_model.dart';
import 'package:employee_app/data/models/leave_request_model.dart';
import 'package:employee_app/providers/leave_provider.dart';
import 'package:employee_app/providers/organization_provider.dart';
import 'package:employee_app/features/auth/providers/auth_provider.dart';
import 'package:go_router/go_router.dart';

class LeaveOverviewScreen extends ConsumerWidget {
  const LeaveOverviewScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final balancesAsync = ref.watch(leaveBalancesProvider);
    final requestsAsync = ref.watch(leaveRequestsProvider);
    final orgAsync = ref.watch(organizationProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Leave'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline),
            onPressed: () => context.push('/leave/apply'),
            tooltip: 'Apply for Leave',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(leaveBalancesProvider);
          ref.invalidate(leaveRequestsProvider);
          await Future.delayed(const Duration(milliseconds: 500));
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Leave Balance Section
            Text('Leave Balances', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            balancesAsync.when(
              data: (balances) {
                if (balances.isEmpty) {
                  return Card(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Center(
                        child: Text('No leave balances found', style: theme.textTheme.bodyMedium),
                      ),
                    ),
                  );
                }
                return Column(
                  children: balances.map((balance) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _BalanceCard(balance: balance),
                    );
                  }).toList(),
                );
              },
              loading: () => const Column(
                children: [
                  Card(child: SizedBox(height: 80, child: Center(child: CircularProgressIndicator(strokeWidth: 2)))),
                  SizedBox(height: 12),
                  Card(child: SizedBox(height: 80, child: Center(child: CircularProgressIndicator(strokeWidth: 2)))),
                ],
              ),
              error: (e, _) => Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      const Icon(Icons.cloud_off, size: 32),
                      const SizedBox(height: 8),
                      Text('Could not load balances', style: theme.textTheme.bodySmall),
                      const SizedBox(height: 8),
                      TextButton(
                        onPressed: () => ref.invalidate(leaveBalancesProvider),
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Leave Requests Section
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('My Requests', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                TextButton(
                  onPressed: () => context.push('/leave/apply'),
                  child: const Text('New Request'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            requestsAsync.when(
              data: (requests) {
                if (requests.isEmpty) {
                  return Card(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Center(
                        child: Column(
                          children: [
                            Icon(Icons.card_travel, size: 48, color: theme.colorScheme.onSurface.withAlpha(60)),
                            const SizedBox(height: 12),
                            Text('No leave requests yet', style: theme.textTheme.bodyMedium),
                          ],
                        ),
                      ),
                    ),
                  );
                }
                return Column(
                  children: requests.map((request) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _RequestCard(request: request),
                    );
                  }).toList(),
                );
              },
              loading: () => const Card(
                child: SizedBox(height: 120, child: Center(child: CircularProgressIndicator(strokeWidth: 2))),
              ),
              error: (e, _) => Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      const Icon(Icons.cloud_off, size: 32),
                      const SizedBox(height: 8),
                      Text('Could not load requests', style: theme.textTheme.bodySmall),
                      const SizedBox(height: 8),
                      TextButton(
                        onPressed: () => ref.invalidate(leaveRequestsProvider),
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BalanceCard extends StatelessWidget {
  final LeaveBalanceModel balance;

  const _BalanceCard({required this.balance});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final progress = balance.allocatedDays > 0
        ? balance.usedDays / balance.allocatedDays
        : 0.0;

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
                    _getLeaveTypeName(balance.leaveTypeId),
                    style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primaryContainer,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${balance.remainingDays} left',
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: theme.colorScheme.onPrimaryContainer,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            LinearProgressIndicator(
              value: progress,
              backgroundColor: theme.colorScheme.surfaceContainerHighest,
              valueColor: AlwaysStoppedAnimation<Color>(
                progress > 0.8 ? theme.colorScheme.error : theme.colorScheme.primary,
              ),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${balance.usedDays} used',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurface.withAlpha(150),
                  ),
                ),
                Text(
                  '${balance.allocatedDays} total',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurface.withAlpha(150),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _getLeaveTypeName(String leaveTypeId) {
    // This is a placeholder - in a real app, you'd map leaveTypeId to name
    // For now, we'll extract from the ID or use a default
    return 'Leave'; // TODO: Implement proper leave type name mapping
  }
}

class _RequestCard extends StatelessWidget {
  final LeaveRequestModel request;

  const _RequestCard({required this.request});

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
                    _getLeaveTypeName(request.leaveTypeId),
                    style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600),
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
                const Icon(Icons.calendar_today, size: 16, color: Colors.grey),
                const SizedBox(width: 8),
                Text(
                  '${_formatDate(request.startDate)} - ${_formatDate(request.endDate)}',
                  style: theme.textTheme.bodySmall,
                ),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.hourglass_empty, size: 16, color: Colors.grey),
                const SizedBox(width: 8),
                Text(
                  '${request.days} day${request.days != 1 ? 's' : ''}',
                  style: theme.textTheme.bodySmall,
                ),
              ],
            ),
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

  String _getLeaveTypeName(String leaveTypeId) {
    // This is a placeholder - in a real app, you'd map leaveTypeId to name
    return 'Leave'; // TODO: Implement proper leave type name mapping
  }
}