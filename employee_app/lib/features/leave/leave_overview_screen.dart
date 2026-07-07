import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:employee_app/data/models/leave_balance_model.dart';
import 'package:employee_app/data/models/leave_request_model.dart';
import 'package:employee_app/providers/leave_provider.dart';
import 'package:employee_app/providers/organization_provider.dart';
import 'package:employee_app/features/auth/providers/auth_provider.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:employee_app/core/theme/app_theme.dart';

class LeaveOverviewScreen extends ConsumerWidget {
  const LeaveOverviewScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final balancesAsync = ref.watch(leaveBalancesProvider);
    final requestsAsync = ref.watch(leaveRequestsProvider);

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(leaveBalancesProvider);
            ref.invalidate(leaveRequestsProvider);
          },
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            children: [
              const SizedBox(height: 12),
              _buildTopBar(context),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Leave Requests',
                        style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w600, color: AppColors.primary)),
                      Text('Manage your time off',
                        style: GoogleFonts.inter(fontSize: 14, color: AppColors.onSurfaceVariant)),
                    ],
                  ),
                  ElevatedButton.icon(
                    onPressed: () => context.push('/leave/apply'),
                    icon: const Icon(Icons.add, size: 18),
                    label: Text('Submit New',
                      style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Text('REMAINING BALANCE',
                style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.outline, letterSpacing: 1)),
              const SizedBox(height: 12),
              balancesAsync.when(
                data: (balances) => _buildBalanceGrid(balances),
                loading: () => const SizedBox(
                  height: 200,
                  child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
                ),
                error: (e, _) => _buildErrorCard('Could not load balances'),
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('RECENT REQUESTS',
                    style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.outline, letterSpacing: 1)),
                  GestureDetector(
                    onTap: () {},
                    child: Text('View All',
                      style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary)),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              requestsAsync.when(
                data: (requests) => _buildRequestsList(requests, theme),
                loading: () => const SizedBox(
                  height: 120,
                  child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
                ),
                error: (e, _) => _buildErrorCard('Could not load requests'),
              ),
              const SizedBox(height: 16),
              _buildPolicyReminder(),
              const SizedBox(height: 80),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/leave/apply'),
        backgroundColor: AppColors.primary,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: const Icon(Icons.add, color: AppColors.onPrimary),
      ),
    );
  }

  Widget _buildTopBar(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Container(
              width: 40, height: 40,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.outlineVariant),
                image: const DecorationImage(
                  image: NetworkImage(''),
                  fit: BoxFit.cover,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Text('HR Portal',
              style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.primary)),
          ],
        ),
        IconButton(
          icon: const Icon(Icons.notifications_outlined, color: AppColors.onSurfaceVariant),
          onPressed: () {},
        ),
      ],
    );
  }

  Widget _buildBalanceGrid(List<LeaveBalanceModel> balances) {
    if (balances.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: AppColors.surfaceContainerLowest,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.outlineVariant.withAlpha(80)),
        ),
        child: Center(
          child: Text('No leave balances found',
            style: GoogleFonts.inter(fontSize: 14, color: AppColors.onSurfaceVariant)),
        ),
      );
    }

    final annual = balances.isNotEmpty ? balances.first : null;
    final rest = balances.length > 1 ? balances.sublist(1).take(2).toList() : [];

    return Column(
      children: [
        if (annual != null)
          Container(
            width: double.infinity,
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.primaryContainer,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Stack(
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('ANNUAL LEAVE',
                      style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.onPrimaryContainer, letterSpacing: 1.2)),
                    const SizedBox(height: 8),
                    Text('${annual.remainingDays}',
                      style: GoogleFonts.inter(fontSize: 36, fontWeight: FontWeight.w700, color: Colors.white)),
                    Text('days remaining',
                      style: GoogleFonts.inter(fontSize: 14, color: AppColors.onPrimaryContainer)),
                    const SizedBox(height: 16),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(100),
                      child: Container(
                        height: 6,
                        color: AppColors.onPrimaryContainer.withAlpha(40),
                        child: FractionallySizedBox(
                          alignment: Alignment.centerLeft,
                          widthFactor: annual.allocatedDays > 0
                              ? (annual.remainingDays / annual.allocatedDays).clamp(0.0, 1.0)
                              : 0,
                          child: Container(
                            decoration: BoxDecoration(
                              color: AppColors.secondaryContainer,
                              borderRadius: BorderRadius.circular(100),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                Positioned(
                  right: -16,
                  bottom: -16,
                  child: Icon(Icons.beach_access, size: 100, color: Colors.white.withAlpha(25)),
                ),
              ],
            ),
          ),
        if (rest.isNotEmpty)
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.8,
            ),
            itemCount: rest.length,
            itemBuilder: (context, index) {
              final balance = rest[index];
              return Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surfaceContainerLowest,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.outlineVariant.withAlpha(80)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Row(
                      children: [
                        Icon(
                          index == 0 ? Icons.medical_services : Icons.home_work,
                          size: 18,
                          color: index == 0 ? AppColors.error : AppColors.secondary,
                        ),
                        const SizedBox(width: 8),
                        Text(index == 0 ? 'Sick' : 'Remote',
                          style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.onSurfaceVariant)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text('${balance.remainingDays}',
                          style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.onSurface)),
                        const SizedBox(width: 4),
                        Text('days',
                          style: GoogleFonts.inter(fontSize: 10, color: AppColors.onSurfaceVariant)),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
      ],
    );
  }

  Widget _buildRequestsList(List<LeaveRequestModel> requests, ThemeData theme) {
    if (requests.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: AppColors.surfaceContainerLowest,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.outlineVariant.withAlpha(80)),
        ),
        child: Center(
          child: Column(
            children: [
              Icon(Icons.card_travel, size: 40, color: AppColors.onSurfaceVariant.withAlpha(100)),
              const SizedBox(height: 8),
              Text('No leave requests yet',
                style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.onSurfaceVariant)),
            ],
          ),
        ),
      );
    }

    return Column(
      children: requests.take(5).map((request) {
        final statusColor = _getStatusColor(request.status);
        final statusLabel = _getStatusLabel(request.status);
        final statusIcon = _getStatusIcon(request.status);

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surfaceContainerLowest,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.outlineVariant.withAlpha(80)),
          ),
          child: Row(
            children: [
              Container(
                width: 48, height: 48,
                decoration: BoxDecoration(
                  color: AppColors.secondaryContainer.withAlpha(80),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(Icons.calendar_month, color: AppColors.secondary, size: 24),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(_getLeaveTypeName(request.leaveTypeId),
                      style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.onSurface)),
                    const SizedBox(height: 2),
                    Text('${_formatDate(request.startDate)} - ${_formatDate(request.endDate)} \u2022 ${request.days} day${request.days != 1 ? 's' : ''}',
                      style: GoogleFonts.inter(fontSize: 12, color: AppColors.onSurfaceVariant)),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusColor.withAlpha(30),
                      borderRadius: BorderRadius.circular(100),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(statusIcon, size: 12, color: statusColor),
                        const SizedBox(width: 4),
                        Text(statusLabel,
                          style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w600, color: statusColor, letterSpacing: 0.3)),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildPolicyReminder() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.primaryContainer,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.info_outline, color: AppColors.onPrimary, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Next Company Holiday',
                  style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.onPrimary)),
                const SizedBox(height: 4),
                Text("Founders' Day is on Nov 15th. The office will be closed.",
                  style: GoogleFonts.inter(fontSize: 14, color: AppColors.primaryFixed, height: 1.5)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorCard(String message) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.outlineVariant.withAlpha(80)),
      ),
      child: Center(
        child: Column(
          children: [
            const Icon(Icons.cloud_off, size: 32, color: AppColors.onSurfaceVariant),
            const SizedBox(height: 8),
            Text(message, style: GoogleFonts.inter(fontSize: 13, color: AppColors.onSurfaceVariant)),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'approved': return AppColors.secondary;
      case 'rejected': return AppColors.error;
      case 'pending': return AppColors.onSurfaceVariant;
      default: return AppColors.outline;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status) {
      case 'approved': return Icons.check_circle;
      case 'rejected': return Icons.cancel;
      case 'pending': return Icons.schedule;
      default: return Icons.help;
    }
  }

  String _getStatusLabel(String status) {
    switch (status) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'pending': return 'Pending';
      default: return status;
    }
  }

  String _formatDate(String isoDate) {
    final date = DateTime.tryParse(isoDate);
    if (date == null) return isoDate;
    final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${date.day} ${months[date.month - 1]}';
  }

  String _getLeaveTypeName(String leaveTypeId) {
    return 'Leave';
  }
}
