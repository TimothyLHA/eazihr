import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:employee_app/data/models/payslip_model.dart';
import 'package:employee_app/providers/payslip_provider.dart';
import 'package:employee_app/providers/organization_provider.dart';
import 'package:employee_app/features/auth/providers/auth_provider.dart';
import 'package:go_router/go_router.dart';

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
    final theme = Theme.of(context);
    final payslipsAsync = ref.watch(payslipsProvider);
    final yearsAsync = ref.watch(payslipYearsProvider);

    // Filter payslips by selected year
    final filteredPayslips = payslipsAsync.valueOrNull?.where((p) {
      return _selectedYear == null || p.year == _selectedYear;
    }).toList() ?? [];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Payslips'),
        actions: [
          // Year filter dropdown
          yearsAsync.when(
            data: (years) {
              if (years.isEmpty) return const SizedBox.shrink();
              return Padding(
                padding: const EdgeInsets.only(right: 16),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<int>(
                    value: _selectedYear,
                    isDense: true,
                    style: theme.textTheme.bodyMedium,
                    items: years.map((year) {
                      return DropdownMenuItem<int>(
                        value: year,
                        child: Text(year.toString()),
                      );
                    }).toList(),
                    onChanged: (value) {
                      if (value != null) {
                        setState(() {
                          _selectedYear = value;
                        });
                      }
                    },
                  ),
                ),
              );
            },
            loading: () => const Padding(
              padding: EdgeInsets.only(right: 16),
              child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)),
            ),
            error: (_, __) => const SizedBox.shrink(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(payslipsProvider);
          ref.invalidate(payslipYearsProvider);
          await Future.delayed(const Duration(milliseconds: 500));
        },
        child: payslipsAsync.when(
          data: (payslips) {
            if (filteredPayslips.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.receipt_long,
                      size: 64,
                      color: theme.colorScheme.onSurface.withAlpha(60),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'No payslips found',
                      style: theme.textTheme.titleMedium,
                    ),
                    if (_selectedYear != null) ...[
                      const SizedBox(height: 8),
                      Text(
                        'for $_selectedYear',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.colorScheme.onSurface.withAlpha(120),
                        ),
                      ),
                    ],
                  ],
                ),
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: filteredPayslips.length,
              itemBuilder: (context, index) {
                final payslip = filteredPayslips[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _PayslipCard(
                    payslip: payslip,
                    onTap: () => context.push('/payslips/${payslip.id}'),
                  ),
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
                Text('Could not load payslips', style: theme.textTheme.bodyMedium),
                const SizedBox(height: 8),
                TextButton(
                  onPressed: () {
                    ref.invalidate(payslipsProvider);
                  },
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

class _PayslipCard extends StatelessWidget {
  final PayslipModel payslip;
  final VoidCallback onTap;

  const _PayslipCard({required this.payslip, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
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
                      '${months[payslip.month - 1]} ${payslip.year}',
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primaryContainer,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      'Net: \$${payslip.netPay.toStringAsFixed(2)}',
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: theme.colorScheme.onPrimaryContainer,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _buildInfoItem(
                      theme,
                      icon: Icons.trending_up,
                      label: 'Gross Pay',
                      value: '\$${payslip.grossPay.toStringAsFixed(2)}',
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildInfoItem(
                      theme,
                      icon: Icons.trending_down,
                      label: 'Deductions',
                      value: '\$${payslip.deductions.toStringAsFixed(2)}',
                      valueColor: theme.colorScheme.error,
                    ),
                  ),
                ],
              ),
              if (payslip.pdfUrl != null) ...[
                const SizedBox(height: 12),
                Row(
                  children: [
                    Icon(
                      Icons.picture_as_pdf,
                      size: 16,
                      color: theme.colorScheme.primary,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'PDF Available',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.primary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoItem(
    ThemeData theme, {
    required IconData icon,
    required String label,
    required String value,
    Color? valueColor,
  }) {
    return Row(
      children: [
        Icon(icon, size: 16, color: theme.colorScheme.onSurface.withAlpha(150)),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurface.withAlpha(150),
                  fontSize: 11,
                ),
              ),
              Text(
                value,
                style: theme.textTheme.bodySmall?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: valueColor,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}