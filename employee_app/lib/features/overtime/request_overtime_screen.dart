import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:employee_app/providers/employee_provider.dart';
import 'package:employee_app/providers/overtime_provider.dart';
import 'package:employee_app/features/auth/providers/auth_provider.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:employee_app/core/theme/app_theme.dart';

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

  Future<void> _selectDate() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now().subtract(const Duration(days: 7)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          colorScheme: ColorScheme.light(
            primary: AppColors.primary,
            onPrimary: Colors.white,
            surface: AppColors.surface,
            onSurface: AppColors.onSurface,
          ),
        ),
        child: child!,
      ),
    );
    if (picked != null) {
      setState(() { _selectedDate = picked; _error = null; });
    }
  }

  Future<void> _submitOvertimeRequest() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedDate == null) {
      setState(() => _error = 'Please select a date');
      return;
    }

    setState(() { _isSubmitting = true; _error = null; });

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

      ref.invalidate(overtimeRequestsProvider);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Overtime request submitted successfully'),
            backgroundColor: AppColors.primary,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
        context.pop();
      }
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            _buildTopBar(),
            Expanded(
              child: Form(
                key: _formKey,
                child: ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    if (_error != null) ...[
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.error.withAlpha(20),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.error.withAlpha(40)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.error_outline, color: AppColors.error, size: 20),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(_error!,
                                style: GoogleFonts.inter(fontSize: 13, color: AppColors.error)),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],
                    _buildSectionLabel('Date'),
                    const SizedBox(height: 8),
                    _buildDatePicker(),
                    if (_selectedDate != null) ...[
                      const SizedBox(height: 8),
                      _buildDayChip(),
                    ],
                    const SizedBox(height: 24),
                    _buildSectionLabel('Hours'),
                    const SizedBox(height: 8),
                    _buildHoursField(),
                    const SizedBox(height: 24),
                    _buildSectionLabel('Rate Multiplier'),
                    const SizedBox(height: 8),
                    _buildRateField(),
                    if (_hoursController.text.isNotEmpty && _rateController.text.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      _buildEstimateChip(),
                    ],
                    const SizedBox(height: 24),
                    _buildSectionLabel('Reason (Optional)'),
                    const SizedBox(height: 8),
                    _buildReasonField(),
                    const SizedBox(height: 32),
                    _buildSubmitButton(),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTopBar() {
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
            child: const Icon(Icons.arrow_back, color: AppColors.primary),
          ),
          const SizedBox(width: 12),
          Text('Request Overtime',
            style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.primary)),
        ],
      ),
    );
  }

  Widget _buildSectionLabel(String label) {
    return Text(label,
      style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w700,
        color: AppColors.onSurface, letterSpacing: 0.3));
  }

  Widget _buildDatePicker() {
    return InkWell(
      onTap: _selectDate,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: AppColors.surfaceContainerLow,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.outlineVariant),
        ),
        child: Row(
          children: [
            const Icon(Icons.calendar_today, color: AppColors.primary, size: 20),
            const SizedBox(width: 12),
            Text(
              _selectedDate != null
                  ? DateFormat('MMM dd, yyyy').format(_selectedDate!)
                  : 'Select date',
              style: GoogleFonts.inter(fontSize: 15,
                color: _selectedDate != null ? AppColors.onSurface : AppColors.onSurfaceVariant),
            ),
            const Spacer(),
            const Icon(Icons.chevron_right, color: AppColors.onSurfaceVariant, size: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildDayChip() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.secondaryContainer.withAlpha(120),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.calendar_view_day, size: 16, color: AppColors.primary),
          const SizedBox(width: 6),
          Text(_getDayName(_selectedDate!.weekday),
            style: GoogleFonts.inter(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  Widget _buildHoursField() {
    return TextFormField(
      controller: _hoursController,
      keyboardType: const TextInputType.numberWithOptions(decimal: true),
      style: GoogleFonts.inter(fontSize: 15, color: AppColors.onSurface),
      decoration: InputDecoration(
        hintText: 'Enter number of hours',
        hintStyle: GoogleFonts.inter(fontSize: 15, color: AppColors.onSurfaceVariant.withAlpha(120)),
        prefixIcon: const Icon(Icons.access_time, color: AppColors.primary, size: 20),
        filled: true,
        fillColor: AppColors.surfaceContainerLow,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.outlineVariant),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.outlineVariant),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      validator: (value) {
        if (value == null || value.trim().isEmpty) return 'Please enter hours';
        final hours = double.tryParse(value);
        if (hours == null || hours <= 0) return 'Please enter a valid number';
        if (hours > 24) return 'Cannot exceed 24 hours';
        return null;
      },
    );
  }

  Widget _buildRateField() {
    return TextFormField(
      controller: _rateController,
      keyboardType: const TextInputType.numberWithOptions(decimal: true),
      style: GoogleFonts.inter(fontSize: 15, color: AppColors.onSurface),
      decoration: InputDecoration(
        hintText: 'e.g., 1.5 for time and a half',
        hintStyle: GoogleFonts.inter(fontSize: 15, color: AppColors.onSurfaceVariant.withAlpha(120)),
        prefixIcon: const Icon(Icons.trending_up, color: AppColors.primary, size: 20),
        filled: true,
        fillColor: AppColors.surfaceContainerLow,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.outlineVariant),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.outlineVariant),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      validator: (value) {
        if (value == null || value.trim().isEmpty) return 'Please enter rate';
        final rate = double.tryParse(value);
        if (rate == null || rate <= 0) return 'Please enter a valid number';
        return null;
      },
    );
  }

  Widget _buildEstimateChip() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.primary.withAlpha(8),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.calculate, size: 16, color: AppColors.primary),
          const SizedBox(width: 6),
          Text('Estimated: \$${_calculateTotal().toStringAsFixed(2)}',
            style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.primary)),
        ],
      ),
    );
  }

  Widget _buildReasonField() {
    return TextFormField(
      controller: _reasonController,
      maxLines: 4,
      maxLength: 500,
      style: GoogleFonts.inter(fontSize: 15, color: AppColors.onSurface),
      decoration: InputDecoration(
        hintText: 'Please provide a reason for overtime request',
        hintStyle: GoogleFonts.inter(fontSize: 15, color: AppColors.onSurfaceVariant.withAlpha(120)),
        prefixIcon: const Padding(
          padding: EdgeInsets.only(bottom: 20),
          child: Icon(Icons.text_fields, color: AppColors.primary, size: 20),
        ),
        filled: true,
        fillColor: AppColors.surfaceContainerLow,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.outlineVariant),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.outlineVariant),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }

  Widget _buildSubmitButton() {
    return SizedBox(
      width: double.infinity,
      height: 52,
      child: ElevatedButton(
        onPressed: _isSubmitting ? null : _submitOvertimeRequest,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          disabledBackgroundColor: AppColors.primary.withAlpha(100),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          elevation: 4,
          shadowColor: AppColors.primary.withAlpha(60),
        ),
        child: _isSubmitting
            ? const SizedBox(
                width: 22, height: 22,
                child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white))
            : Text('Submit Request',
                style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600)),
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
