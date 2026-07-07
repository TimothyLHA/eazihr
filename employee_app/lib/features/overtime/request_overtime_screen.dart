import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:employee_app/providers/employee_provider.dart';
import 'package:employee_app/providers/overtime_provider.dart';
import 'package:employee_app/features/auth/providers/auth_provider.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

class RequestOvertimeScreen extends ConsumerStatefulWidget {
  const RequestOvertimeScreen({super.key});

  @override
  ConsumerState<RequestOvertimeScreen> createState() => _RequestOvertimeScreenState();
}

class _RequestOvertimeScreenState extends ConsumerState<RequestOvertimeScreen> {
  final _formKey = GlobalKey<FormState>();
  DateTime? _selectedDate;
  final TextEditingController _hoursController = TextEditingController();
  final TextEditingController _rateController = TextEditingController();
  final TextEditingController _reasonController = TextEditingController();
  bool _isSubmitting = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _rateController.text = '1.5';
  }

  @override
  void dispose() {
    _hoursController.dispose();
    _rateController.dispose();
    _reasonController.dispose();
    super.dispose();
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now().subtract(const Duration(days: 1)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );

    if (picked != null) {
      setState(() {
        _selectedDate = picked;
        _error = null;
      });
    }
  }

  Future<void> _submitOvertimeRequest() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedDate == null) {
      setState(() => _error = 'Please select a date');
      return;
    }

    setState(() {
      _isSubmitting = true;
      _error = null;
    });

    try {
      final repo = ref.read(overtimeRepositoryProvider);
      final orgId = ref.read(authNotifierProvider.notifier).organizationId;
      final employee = ref.read(employeeProvider).valueOrNull;
      if (orgId == null || employee == null) throw Exception('Not authenticated');

      final hours = double.parse(_hoursController.text);
      final rate = double.parse(_rateController.text);

      await repo.createRequest(
        employeeId: employee.id,
        organizationId: orgId,
        date: DateFormat('yyyy-MM-dd').format(_selectedDate!),
        hours: hours,
        rate: rate,
        reason: _reasonController.text.trim().isEmpty ? null : _reasonController.text.trim(),
      );

      // Invalidate provider to refresh data
      ref.invalidate(overtimeRequestsProvider);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Overtime request submitted successfully'),
            backgroundColor: Colors.green,
          ),
        );
        context.pop();
      }
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Request Overtime'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (_error != null) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: theme.colorScheme.errorContainer,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Icon(Icons.error_outline, color: theme.colorScheme.error),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        _error!,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onErrorContainer,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Date Picker
            InkWell(
              onTap: () => _selectDate(context),
              child: InputDecorator(
                decoration: const InputDecoration(
                  labelText: 'Date',
                  prefixIcon: Icon(Icons.calendar_today),
                  border: OutlineInputBorder(),
                ),
                child: Text(
                  _selectedDate != null
                      ? DateFormat('MMM dd, yyyy').format(_selectedDate!)
                      : 'Select date',
                  style: theme.textTheme.bodyMedium,
                ),
              ),
            ),

            if (_selectedDate != null) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: theme.colorScheme.primaryContainer.withAlpha(50),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Icon(Icons.calendar_view_day, size: 16, color: theme.colorScheme.primary),
                    const SizedBox(width: 8),
                    Text(
                      _getDayName(_selectedDate!.weekday),
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.primary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 16),

            // Hours Input
            TextFormField(
              controller: _hoursController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: const InputDecoration(
                labelText: 'Hours',
                prefixIcon: Icon(Icons.access_time),
                border: OutlineInputBorder(),
                hintText: 'Enter number of hours',
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter hours';
                }
                final hours = double.tryParse(value);
                if (hours == null || hours <= 0) {
                  return 'Please enter a valid number';
                }
                if (hours > 24) {
                  return 'Cannot exceed 24 hours';
                }
                return null;
              },
            ),

            const SizedBox(height: 16),

            // Rate Input
            TextFormField(
              controller: _rateController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: const InputDecoration(
                labelText: 'Rate (multiplier)',
                prefixIcon: Icon(Icons.trending_up),
                border: OutlineInputBorder(),
                hintText: 'e.g., 1.5 for time and a half',
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter rate';
                }
                final rate = double.tryParse(value);
                if (rate == null || rate <= 0) {
                  return 'Please enter a valid number';
                }
                return null;
              },
            ),

            if (_hoursController.text.isNotEmpty && _rateController.text.isNotEmpty) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: theme.colorScheme.primaryContainer.withAlpha(50),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Icon(Icons.calculate, size: 16, color: theme.colorScheme.primary),
                    const SizedBox(width: 8),
                    Text(
                      'Estimated: \$${_calculateTotal().toStringAsFixed(2)}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.primary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 16),

            // Reason Text Field
            TextFormField(
              controller: _reasonController,
              maxLines: 4,
              maxLength: 500,
              decoration: const InputDecoration(
                labelText: 'Reason (Optional)',
                prefixIcon: Icon(Icons.text_fields),
                border: OutlineInputBorder(),
                hintText: 'Please provide a reason for overtime request',
              ),
              validator: (value) {
                // Reason is optional, so no validation needed
                return null;
              },
            ),

            const SizedBox(height: 24),

            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 50,
              child: FilledButton(
                onPressed: _isSubmitting ? null : _submitOvertimeRequest,
                child: _isSubmitting
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Submit Request', style: TextStyle(fontSize: 16)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  double _calculateTotal() {
    try {
      final hours = double.parse(_hoursController.text);
      final rate = double.parse(_rateController.text);
      return hours * rate;
    } catch (e) {
      return 0.0;
    }
  }

  String _getDayName(int weekday) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[weekday - 1];
  }
}