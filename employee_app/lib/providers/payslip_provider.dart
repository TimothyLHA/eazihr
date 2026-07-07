import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:employee_app/providers/supabase_provider.dart';
import 'package:employee_app/data/repositories/payslip_repository.dart';
import 'package:employee_app/data/models/payslip_model.dart';
import 'package:employee_app/features/auth/providers/auth_provider.dart';
import 'employee_provider.dart';

final payslipRepositoryProvider = Provider<PayslipRepository>((ref) {
  return PayslipRepository(ref.read(supabaseClientProvider));
});

final payslipsProvider = FutureProvider<List<PayslipModel>>((ref) {
  final orgId = ref.watch(authNotifierProvider.notifier).organizationId;
  final employee = ref.watch(employeeProvider).valueOrNull;
  if (orgId == null || employee == null) throw Exception('Not authenticated');
  return ref.read(payslipRepositoryProvider).getMyPayslips(
    organizationId: orgId,
    employeeId: employee.id,
  );
});

final payslipYearsProvider = FutureProvider<List<int>>((ref) {
  final orgId = ref.watch(authNotifierProvider.notifier).organizationId;
  final employee = ref.watch(employeeProvider).valueOrNull;
  if (orgId == null || employee == null) throw Exception('Not authenticated');
  return ref.read(payslipRepositoryProvider).getAvailableYears(
    organizationId: orgId,
    employeeId: employee.id,
  );
});

final payslipDetailProvider = FutureProvider.family<PayslipModel, String>((ref, id) {
  return ref.read(payslipRepositoryProvider).getPayslipDetail(id);
});
