import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:employee_app/data/models/loan_model.dart';
import 'package:employee_app/providers/loan_provider.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:employee_app/core/theme/app_theme.dart';

class LoansScreen extends ConsumerWidget {
  const LoansScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final loansAsync = ref.watch(myLoansProvider);

    return Scaffold(
      body: SafeArea(
        child: loansAsync.when(
          data: (loans) => _buildContent(context, loans, ref),
          loading: () => const Center(child: CircularProgressIndicator(strokeWidth: 2)),
          error: (e, _) => _buildError(ref),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: const Icon(Icons.add, size: 28),
      ),
    );
  }

  Widget _buildContent(BuildContext context, List<LoanModel> loans, WidgetRef ref) {
    final activeLoans = loans.where((l) => l.status == 'approved' || l.status == 'disbursed').toList();
    final totalActiveAmount = activeLoans.fold<double>(0, (s, l) => s + l.balance);
    final totalMonthlyEmi = activeLoans.fold<double>(0, (s, l) => s + (l.monthlyEmi ?? 0));

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(myLoansProvider);
        await Future.delayed(const Duration(milliseconds: 500));
      },
      child: ListView(
        padding: const EdgeInsets.only(bottom: 100),
        children: [
          _buildTopBar(context),
          _buildHeroSection(),
          _buildActiveLoanCard(totalActiveAmount, activeLoans),
          _buildSummaryCards(totalActiveAmount, totalMonthlyEmi, activeLoans),
          _buildRecentApplications(loans),
          _buildPolicyInfo(),
        ],
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
        children: [
          GestureDetector(
            onTap: () => context.pop(),
            child: const Icon(Icons.arrow_back, color: AppColors.onSurface, size: 24),
          ),
          const Spacer(),
          Text('Loans',
            style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w700,
              color: AppColors.onSurface, letterSpacing: -0.015)),
          const Spacer(),
          const SizedBox(width: 24),
        ],
      ),
    );
  }

  Widget _buildHeroSection() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.primaryContainer,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.account_balance, color: AppColors.onPrimaryContainer, size: 32),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Loan Tracker',
                style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w700,
                  color: AppColors.onSurface, letterSpacing: -0.015)),
              const SizedBox(height: 2),
              Text('Manage and track your active loan applications.',
                style: GoogleFonts.inter(fontSize: 13, color: AppColors.onSurfaceVariant)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActiveLoanCard(double totalActiveAmount, List<LoanModel> activeLoans) {
    final nextRepayment = activeLoans.isNotEmpty ? 'Nov 05, 2026' : 'No active loans';

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(color: AppColors.primary.withAlpha(60), blurRadius: 20, offset: const Offset(0, 8)),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Stack(
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppColors.primary, Color(0xFF004533)],
                    begin: Alignment.topLeft, end: Alignment.bottomRight,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text('Total Active Loans',
                            style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w500,
                              color: AppColors.primaryFixed, letterSpacing: 0.5)),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: AppColors.tertiaryFixed,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text('History',
                            style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700,
                              color: AppColors.onTertiaryFixed)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text('\$${totalActiveAmount.toStringAsFixed(2)}',
                      style: GoogleFonts.inter(fontSize: 36, fontWeight: FontWeight.w700,
                        color: Colors.white, letterSpacing: -0.015)),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('NEXT REPAYMENT',
                              style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600,
                                color: AppColors.primaryFixed)),
                            const SizedBox(height: 2),
                            Text(nextRepayment,
                              style: GoogleFonts.inter(fontSize: 13,
                                color: AppColors.primaryFixed.withAlpha(200), fontStyle: FontStyle.italic)),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Positioned(
                top: 0, right: 0, bottom: 0,
                child: Opacity(
                  opacity: 0.08,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Transform.scale(
                      scale: 4,
                      child: const Icon(Icons.account_balance_wallet, color: Colors.white, size: 48),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSummaryCards(double totalActiveAmount, double totalMonthlyEmi, List<LoanModel> activeLoans) {
    final totalOriginal = activeLoans.fold<double>(0, (s, l) => s + l.amount);
    final remainingPercent = totalOriginal > 0 ? (totalActiveAmount / totalOriginal * 100) : 0;

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Expanded(child: _summaryCard(
            icon: Icons.pending_actions,
            label: 'Remaining',
            value: '\$${totalActiveAmount.toStringAsFixed(2)}',
            sub: '${remainingPercent.toStringAsFixed(0)}% of total',
            subColor: AppColors.primary,
          )),
          const SizedBox(width: 12),
          Expanded(child: _summaryCard(
            icon: Icons.calendar_month,
            label: 'Monthly',
            value: '\$${totalMonthlyEmi.toStringAsFixed(2)}',
            sub: activeLoans.isNotEmpty ? 'Next: Nov 05' : 'No active loans',
            subColor: AppColors.onSurfaceVariant,
          )),
        ],
      ),
    );
  }

  Widget _summaryCard({
    required IconData icon,
    required String label,
    required String value,
    required String sub,
    required Color subColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.outlineVariant.withAlpha(120)),
        boxShadow: [
          BoxShadow(color: AppColors.primary.withAlpha(6), blurRadius: 12, offset: const Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: AppColors.primary, size: 18),
              const SizedBox(width: 6),
              Text(label,
                style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700,
                  color: AppColors.onSurfaceVariant, letterSpacing: 0.5)),
            ],
          ),
          const SizedBox(height: 8),
          Text(value,
            style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w700,
              color: AppColors.onSurface, letterSpacing: -0.015)),
          Text(sub,
            style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w600,
              color: subColor)),
        ],
      ),
    );
  }

  Widget _buildRecentApplications(List<LoanModel> loans) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Recent Applications',
                style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w700,
                  color: AppColors.onSurface)),
              Text('View All',
                style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600,
                  color: AppColors.primary)),
            ],
          ),
          const SizedBox(height: 12),
          if (loans.isEmpty)
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerLowest,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.outlineVariant.withAlpha(120)),
              ),
              child: Center(
                child: Text('No loan applications yet',
                  style: GoogleFonts.inter(fontSize: 13, color: AppColors.onSurfaceVariant)),
              ),
            )
          else
            ...loans.take(5).map((loan) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: _loanCard(loan),
            )),
        ],
      ),
    );
  }

  Widget _loanCard(LoanModel loan) {
    final date = _formatDate(loan.createdAt);
    final (statusLabel, statusColor) = _getStatus(loan.status);
    final icon = _getLoanIcon(loan.purpose);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.outlineVariant.withAlpha(80)),
        boxShadow: [
          BoxShadow(color: AppColors.primary.withAlpha(4), blurRadius: 8, offset: const Offset(0, 2)),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(
              color: AppColors.tertiaryFixed.withAlpha(80),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: AppColors.primary, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(date,
                  style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700,
                    color: AppColors.onSurface)),
                Text(loan.purpose ?? 'Loan',
                  style: GoogleFonts.inter(fontSize: 11, color: AppColors.onSurfaceVariant)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('\$${loan.amount.toStringAsFixed(2)}',
                style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700,
                  color: AppColors.onSurface)),
              const SizedBox(height: 2),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: statusColor.withAlpha(25),
                  borderRadius: BorderRadius.circular(100),
                ),
                child: Text(statusLabel,
                  style: GoogleFonts.inter(fontSize: 9, fontWeight: FontWeight.w700,
                    color: statusColor, letterSpacing: 0.5)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPolicyInfo() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.primary.withAlpha(60), style: BorderStyle.solid),
          color: AppColors.primary.withAlpha(8),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(Icons.info, color: AppColors.primary, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: RichText(
                text: TextSpan(
                  style: GoogleFonts.inter(fontSize: 12, height: 1.5, color: AppColors.onSurfaceVariant),
                  children: [
                    TextSpan(
                      text: 'Loan Policy Information: ',
                      style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700,
                        color: AppColors.primary),
                    ),
                    TextSpan(
                      text: 'Maximum loan limit is restricted to ',
                    ),
                    TextSpan(
                      text: '3x monthly salary',
                      style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700,
                        color: AppColors.primary),
                    ),
                    TextSpan(text: '. Competitive annual interest rate of '),
                    TextSpan(
                      text: '4% APR',
                      style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700,
                        color: AppColors.primary),
                    ),
                    TextSpan(text: ' applied. Standard repayment periods range from 6 to 24 months.'),
                  ],
                ),
              ),
            ),
          ],
        ),
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
            Text('Could not load loans',
              style: GoogleFonts.inter(fontSize: 14, color: AppColors.onSurfaceVariant)),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () => ref.invalidate(myLoansProvider),
              child: Text('Retry',
                style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.primary)),
            ),
          ],
        ),
      ),
    );
  }

  (String, Color) _getStatus(String status) {
    switch (status) {
      case 'approved':
      case 'disbursed':
        return ('Approved', AppColors.secondary);
      case 'pending':
        return ('Pending', const Color(0xFFE68A2E));
      case 'rejected':
        return ('Rejected', AppColors.error);
      case 'closed':
        return ('Completed', AppColors.secondary);
      default:
        return (status, AppColors.outline);
    }
  }

  IconData _getLoanIcon(String? purpose) {
    final p = purpose?.toLowerCase() ?? '';
    if (p.contains('emergency') || p.contains('medical')) return Icons.medical_services;
    if (p.contains('education')) return Icons.school;
    if (p.contains('salary')) return Icons.account_balance;
    return Icons.account_balance;
  }

  String _formatDate(String isoDate) {
    final date = DateTime.tryParse(isoDate);
    if (date == null) return isoDate;
    final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${months[date.month - 1]} ${date.day}, ${date.year}';
  }
}
