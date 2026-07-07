import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:employee_app/data/models/overtime_model.dart';
import 'package:employee_app/providers/overtime_provider.dart';
import 'package:employee_app/features/auth/providers/auth_provider.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:employee_app/core/theme/app_theme.dart';

class OvertimeScreen extends ConsumerWidget {
  const OvertimeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final requestsAsync = ref.watch(overtimeRequestsProvider);

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            _buildTopBar(context),
            Expanded(
              child: requestsAsync.when(
                data: (requests) => _buildContent(context, requests, ref),
                loading: () => const Center(child: CircularProgressIndicator(strokeWidth: 2)),
                error: (e, _) => _buildError(ref),
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/overtime/request'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildTopBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border(bottom: BorderSide(color: AppColors.outlineVariant.withAlpha(60))),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              GestureDetector(
                onTap: () => context.pop(),
                child: const Icon(Icons.arrow_back, color: AppColors.primary),
              ),
              const SizedBox(width: 12),
              Text('Overtime',
                style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.primary)),
            ],
          ),
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.outlineVariant),
            ),
            child: const Icon(Icons.notifications_outlined, size: 18, color: AppColors.primary),
          ),
        ],
      ),
    );
  }

  Widget _buildContent(BuildContext context, List<OvertimeModel> requests, WidgetRef ref) {
    final pendingCount = requests.where((r) => r.status == 'pending').length;
    final totalHours = requests.fold<double>(0, (sum, r) => sum + r.hours);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(overtimeRequestsProvider);
        await Future.delayed(const Duration(milliseconds: 500));
      },
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSummaryRow(pendingCount, totalHours),
          const SizedBox(height: 20),
          if (requests.isEmpty) ...[
            const SizedBox(height: 80),
            _buildEmptyState(),
          ] else ...[
            Text('Recent Requests',
              style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.onSurface)),
            const SizedBox(height: 12),
            ...requests.map((r) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _OvertimeCard(request: r),
            )),
          ],
        ],
      ),
    );
  }

  Widget _buildSummaryRow(int pendingCount, double totalHours) {
    return Row(
      children: [
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.white.withAlpha(30),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.hourglass_top, color: Colors.white, size: 20),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withAlpha(30),
                        borderRadius: BorderRadius.circular(100),
                      ),
                      child: Text('$pendingCount pending',
                        style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w600,
                          color: Colors.white, letterSpacing: 0.3)),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text('${totalHours.toStringAsFixed(1)}',
                  style: GoogleFonts.inter(fontSize: 28, fontWeight: FontWeight.w700, color: Colors.white)),
                Text('Total Hours',
                  style: GoogleFonts.inter(fontSize: 12, color: Colors.white.withAlpha(200))),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        children: [
          Container(
            width: 64, height: 64,
            decoration: BoxDecoration(
              color: AppColors.secondaryContainer.withAlpha(100),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Icon(Icons.access_time, size: 32, color: AppColors.primary),
          ),
          const SizedBox(height: 16),
          Text('No overtime requests',
            style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.onSurface)),
          const SizedBox(height: 4),
          Text('Tap + to request overtime',
            style: GoogleFonts.inter(fontSize: 13, color: AppColors.onSurfaceVariant)),
        ],
      ),
    );
  }

  Widget _buildError(WidgetRef ref) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.cloud_off, size: 48, color: AppColors.error),
            const SizedBox(height: 12),
            Text('Could not load overtime requests',
              style: GoogleFonts.inter(fontSize: 14, color: AppColors.onSurfaceVariant)),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () => ref.invalidate(overtimeRequestsProvider),
              child: Text('Retry',
                style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.primary)),
            ),
          ],
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
    final statusColor = _getStatusColor(request.status);
    final statusLabel = _getStatusLabel(request.status);
    final date = _formatDate(request.date);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.outlineVariant.withAlpha(120)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.secondaryContainer.withAlpha(120),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.access_time, size: 18, color: AppColors.primary),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(date,
                        style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600,
                          color: AppColors.onSurface)),
                      Text('${request.hours} hour${request.hours != 1 ? 's' : ''} \u2022 ${request.rate}x rate',
                        style: GoogleFonts.inter(fontSize: 11, color: AppColors.onSurfaceVariant)),
                    ],
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: statusColor.withAlpha(25),
                  borderRadius: BorderRadius.circular(100),
                ),
                child: Text(statusLabel,
                  style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700,
                    color: statusColor, letterSpacing: 0.5)),
              ),
            ],
          ),
          if (request.totalAmount != null) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.primary.withAlpha(8),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.payments, size: 14, color: AppColors.primary),
                  const SizedBox(width: 6),
                  Text('Estimated: \$${request.totalAmount!.toStringAsFixed(2)}',
                    style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600,
                      color: AppColors.primary)),
                ],
              ),
            ),
          ],
          if (request.reason != null && request.reason!.isNotEmpty) ...[
            const SizedBox(height: 10),
            Text(request.reason!,
              style: GoogleFonts.inter(fontSize: 12, color: AppColors.onSurfaceVariant,
                fontStyle: FontStyle.italic),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'approved': return AppColors.secondary;
      case 'rejected': return AppColors.error;
      case 'pending': return const Color(0xFFE68A2E);
      default: return AppColors.outline;
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
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }
}
