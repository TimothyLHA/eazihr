import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:employee_app/data/models/payslip_model.dart';
import 'package:employee_app/providers/payslip_provider.dart';
import 'package:employee_app/providers/organization_provider.dart';
import 'package:employee_app/features/auth/providers/auth_provider.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:employee_app/core/theme/app_theme.dart';

class PayslipsScreen extends ConsumerStatefulWidget {
  const PayslipsScreen({super.key});

  @override
  ConsumerState<PayslipsScreen> createState() => _PayslipsScreenState();
}

class _PayslipsScreenState extends ConsumerState<PayslipsScreen> {
  int? _selectedYear;

  @override
  void initState() {
    super.initState();
    _selectedYear = DateTime.now().year;
  }

  @override
  Widget build(BuildContext context) {
    final payslipsAsync = ref.watch(payslipsProvider);
    final yearsAsync = ref.watch(payslipYearsProvider);

    final filteredPayslips = payslipsAsync.valueOrNull?.where((p) {
      return _selectedYear == null || p.year == _selectedYear;
    }).toList() ?? [];

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(payslipsProvider);
            ref.invalidate(payslipYearsProvider);
          },
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            children: [
              const SizedBox(height: 12),
              _buildTopBar(),
              const SizedBox(height: 8),
              Text('Payroll',
                style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w600, color: AppColors.primary)),
              Text('View and download your salary statements.',
                style: GoogleFonts.inter(fontSize: 14, color: AppColors.onSurfaceVariant)),
              const SizedBox(height: 20),
              payslipsAsync.when(
                data: (payslips) {
                  final latest = payslips.isNotEmpty ? payslips.first : null;
                  return _buildLatestPayslip(latest);
                },
                loading: () => const SizedBox(
                  height: 200,
                  child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
                ),
                error: (_, __) => _buildErrorCard(),
              ),
              const SizedBox(height: 20),
              yearsAsync.when(
                data: (years) => _buildYearFilters(years),
                loading: () => const SizedBox(height: 40),
                error: (_, __) => const SizedBox(),
              ),
              const SizedBox(height: 16),
              _buildArchiveHeader(filteredPayslips.length),
              const SizedBox(height: 12),
              payslipsAsync.when(
                data: (payslips) {
                  if (filteredPayslips.isEmpty) {
                    return _buildEmptyState();
                  }
                  return Column(
                    children: filteredPayslips.map((p) => _buildArchiveItem(p)).toList(),
                  );
                },
                loading: () => const SizedBox(
                  height: 200,
                  child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
                ),
                error: (e, _) => _buildErrorCard(),
              ),
              const SizedBox(height: 16),
              _buildTaxInfoCard(),
              const SizedBox(height: 80),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTopBar() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Container(
              width: 40, height: 40,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.primary.withAlpha(50)),
                color: AppColors.primaryFixed.withAlpha(100),
              ),
              child: const Icon(Icons.person, size: 20, color: AppColors.primary),
            ),
            const SizedBox(width: 12),
            Text('HR Portal',
              style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.primary)),
          ],
        ),
        IconButton(
          icon: const Icon(Icons.notifications_outlined, color: AppColors.primary),
          onPressed: () {},
        ),
      ],
    );
  }

  Widget _buildLatestPayslip(PayslipModel? payslip) {
    if (payslip == null) {
      return Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [AppColors.primaryContainer, Color(0xFF002116)]),
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Center(
          child: Text('No payslips available',
            style: TextStyle(color: Colors.white70, fontSize: 16)),
        ),
      );
    }

    final months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [AppColors.primaryContainer, Color(0xFF002116)]),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withAlpha(60),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('LATEST STATEMENT',
                    style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w600,
                      color: AppColors.secondaryContainer, letterSpacing: 1.5)),
                  const SizedBox(height: 4),
                  Text('${months[payslip.month - 1]} ${payslip.year}',
                    style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w600, color: Colors.white)),
                ],
              ),
              const Icon(Icons.verified, color: AppColors.secondaryContainer),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Gross Pay',
                      style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600,
                        color: AppColors.secondaryContainer.withAlpha(200))),
                    const SizedBox(height: 4),
                    Text('\$${payslip.grossPay.toStringAsFixed(2)}',
                      style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.white)),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Net Pay',
                      style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600,
                        color: AppColors.secondaryContainer.withAlpha(200))),
                    const SizedBox(height: 4),
                    Text('\$${payslip.netPay.toStringAsFixed(2)}',
                      style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w700,
                        color: AppColors.secondaryContainer)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.only(top: 16),
            decoration: BoxDecoration(
              border: Border(top: BorderSide(color: Colors.white.withAlpha(25))),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(Icons.calendar_month, size: 14, color: AppColors.secondaryContainer.withAlpha(200)),
                    const SizedBox(width: 8),
                    Text('Paid on ${months[payslip.month - 1]} 28, ${payslip.year}',
                      style: GoogleFonts.inter(fontSize: 11, color: AppColors.secondaryContainer.withAlpha(200))),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.download, size: 16),
                  label: Text('PDF',
                    style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.secondaryContainer,
                    foregroundColor: AppColors.onSecondaryContainer,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    elevation: 0,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildYearFilters(List<int> years) {
    final displayYears = years.take(4).toList();
    return SizedBox(
      height: 40,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          _filterChip('${_selectedYear ?? ''}', true),
          ...displayYears.map((y) => const SizedBox(width: 8)),
          ...displayYears.map((y) => _filterChip('$y', y == _selectedYear)),
          if (displayYears.isNotEmpty) ...[
            const SizedBox(width: 8),
            _filterChip('Bonuses', false),
          ],
        ],
      ),
    );
  }

  Widget _filterChip(String label, bool isActive) {
    return GestureDetector(
      onTap: () {
        final year = int.tryParse(label);
        if (year != null) setState(() => _selectedYear = year);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? AppColors.primary : AppColors.secondaryContainer,
          borderRadius: BorderRadius.circular(100),
        ),
        child: Text(label,
          style: GoogleFonts.inter(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: isActive ? AppColors.onPrimary : AppColors.onSecondaryContainer,
          )),
      ),
    );
  }

  Widget _buildArchiveHeader(int count) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text('Archive',
          style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.primary)),
        Text('$count Documents',
          style: GoogleFonts.inter(fontSize: 11, color: AppColors.outline)),
      ],
    );
  }

  Widget _buildArchiveItem(PayslipModel payslip) {
    final months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.outlineVariant.withAlpha(60)),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        leading: Container(
          width: 40, height: 40,
          decoration: BoxDecoration(
            color: AppColors.secondaryContainer.withAlpha(80),
            borderRadius: BorderRadius.circular(10),
          ),
          child: const Icon(Icons.description, color: AppColors.primary, size: 20),
        ),
        title: Text('${months[payslip.month - 1]} ${payslip.year}',
          style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.onSurface)),
        subtitle: Text('\$${payslip.netPay.toStringAsFixed(2)} \u2022 PDF',
          style: GoogleFonts.inter(fontSize: 12, color: AppColors.onSurfaceVariant)),
        trailing: IconButton(
          icon: const Icon(Icons.download, color: AppColors.onSurfaceVariant),
          onPressed: () {},
        ),
        onTap: () => context.push('/payslips/${payslip.id}'),
      ),
    );
  }

  Widget _buildTaxInfoCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.secondaryContainer.withAlpha(100),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primary.withAlpha(20)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.security, color: AppColors.primary, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Tax Season (2022)',
                  style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.onSecondaryContainer)),
                const SizedBox(height: 4),
                Text('Your annual W-2 and tax forms for 2022 are now available in the Tax section of your profile.',
                  style: GoogleFonts.inter(fontSize: 11, color: AppColors.onSecondaryContainer.withAlpha(200))),
                const SizedBox(height: 8),
                GestureDetector(
                  onTap: () {},
                  child: Row(
                    children: [
                      Text('Go to Tax Forms',
                        style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.primary)),
                      const SizedBox(width: 4),
                      const Icon(Icons.arrow_forward, size: 14, color: AppColors.primary),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.outlineVariant.withAlpha(80)),
      ),
      child: Center(
        child: Column(
          children: [
            Icon(Icons.receipt_long, size: 48, color: AppColors.onSurfaceVariant.withAlpha(80)),
            const SizedBox(height: 12),
            Text('No payslips found',
              style: GoogleFonts.inter(fontSize: 16, color: AppColors.onSurfaceVariant)),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Center(
        child: Column(
          children: [
            Icon(Icons.cloud_off, size: 40, color: AppColors.error.withAlpha(150)),
            const SizedBox(height: 8),
            Text('Could not load payslips',
              style: GoogleFonts.inter(fontSize: 14, color: AppColors.onSurfaceVariant)),
          ],
        ),
      ),
    );
  }
}
