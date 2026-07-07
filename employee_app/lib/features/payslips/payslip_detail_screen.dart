import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:employee_app/providers/payslip_provider.dart';
import 'package:employee_app/features/auth/providers/auth_provider.dart';
import 'package:url_launcher/url_launcher.dart';

class PayslipDetailScreen extends ConsumerWidget {
  final String payslipId;

  const PayslipDetailScreen({super.key, required this.payslipId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final payslipAsync = ref.watch(payslipDetailProvider(payslipId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Payslip Details'),
        actions: [
          payslipAsync.when(
            data: (payslip) {
              if (payslip.pdfUrl == null) return const SizedBox.shrink();
              return IconButton(
                icon: const Icon(Icons.picture_as_pdf),
                onPressed: () => _openPdf(context, payslip.pdfUrl!),
                tooltip: 'Download PDF',
              );
            },
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
          ),
        ],
      ),
      body: payslipAsync.when(
        data: (payslip) {
          final months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ];

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header Card
                Card(
                  color: theme.colorScheme.primaryContainer,
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        Text(
                          '${months[payslip.month - 1]} ${payslip.year}',
                          style: theme.textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: theme.colorScheme.onPrimaryContainer,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _buildSummaryItem(
                              theme,
                              label: 'Gross Pay',
                              value: '\$${payslip.grossPay.toStringAsFixed(2)}',
                              color: theme.colorScheme.onPrimaryContainer,
                            ),
                            _buildSummaryItem(
                              theme,
                              label: 'Deductions',
                              value: '\$${payslip.deductions.toStringAsFixed(2)}',
                              color: theme.colorScheme.error,
                            ),
                            _buildSummaryItem(
                              theme,
                              label: 'Net Pay',
                              value: '\$${payslip.netPay.toStringAsFixed(2)}',
                              color: theme.colorScheme.onPrimaryContainer,
                              isHighlighted: true,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                // Earnings Breakdown
                if (payslip.earningsBreakdown.isNotEmpty) ...[
                  Text(
                    'Earnings Breakdown',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: payslip.earningsBreakdown.entries.map((entry) {
                          return _buildBreakdownRow(
                            theme,
                            label: _formatLabel(entry.key),
                            value: '\$${(entry.value as num).toStringAsFixed(2)}',
                          );
                        }).toList(),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],

                // Deductions Breakdown
                if (payslip.deductionsBreakdown.isNotEmpty) ...[
                  Text(
                    'Deductions Breakdown',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: payslip.deductionsBreakdown.entries.map((entry) {
                          return _buildBreakdownRow(
                            theme,
                            label: _formatLabel(entry.key),
                            value: '\$${(entry.value as num).toStringAsFixed(2)}',
                            isDeduction: true,
                          );
                        }).toList(),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],

                // Net Pay Highlight
                Card(
                  color: theme.colorScheme.tertiaryContainer,
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Net Pay',
                          style: theme.textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: theme.colorScheme.onTertiaryContainer,
                          ),
                        ),
                        Text(
                          '\$${payslip.netPay.toStringAsFixed(2)}',
                          style: theme.textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: theme.colorScheme.onTertiaryContainer,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                if (payslip.pdfUrl != null) ...[
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: FilledButton.icon(
                      onPressed: () => _openPdf(context, payslip.pdfUrl!),
                      icon: const Icon(Icons.picture_as_pdf),
                      label: const Text('Download PDF'),
                    ),
                  ),
                ],
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(strokeWidth: 2)),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.cloud_off, size: 48, color: theme.colorScheme.error.withAlpha(150)),
              const SizedBox(height: 12),
              Text('Could not load payslip details', style: theme.textTheme.bodyMedium),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => ref.invalidate(payslipDetailProvider(payslipId)),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSummaryItem(
    ThemeData theme, {
    required String label,
    required String value,
    required Color color,
    bool isHighlighted = false,
  }) {
    return Column(
      children: [
        Text(
          value,
          style: theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.w700,
            color: color,
            fontSize: isHighlighted ? 24 : 16,
          ),
        ),
        Text(
          label,
          style: theme.textTheme.bodySmall?.copyWith(
            color: color.withAlpha(180),
          ),
        ),
      ],
    );
  }

  Widget _buildBreakdownRow(
    ThemeData theme, {
    required String label,
    required String value,
    bool isDeduction = false,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              label,
              style: theme.textTheme.bodyMedium,
            ),
          ),
          Text(
            value,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w600,
              color: isDeduction ? theme.colorScheme.error : theme.colorScheme.onSurface,
            ),
          ),
        ],
      ),
    );
  }

  String _formatLabel(String key) {
    // Convert snake_case to Title Case
    return key.split('_').map((word) {
      return word[0].toUpperCase() + word.substring(1);
    }).join(' ');
  }

  Future<void> _openPdf(BuildContext context, String url) async {
    try {
      final uri = Uri.parse(url);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Could not open PDF'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (context.mounted) {
        final theme = Theme.of(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error opening PDF: $e'),
            backgroundColor: theme.colorScheme.error,
          ),
        );
      }
    }
  }
}
