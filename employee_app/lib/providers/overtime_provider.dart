import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:employee_app/providers/supabase_provider.dart';
import 'package:employee_app/data/repositories/overtime_repository.dart';
import 'package:employee_app/data/models/overtime_model.dart';
import 'package:employee_app/features/auth/providers/auth_provider.dart';
import 'employee_provider.dart';

final overtimeRepositoryProvider = Provider<OvertimeRepository>((ref) {
  return OvertimeRepository(ref.read(supabaseClientProvider));
});

final overtimeRequestsProvider = FutureProvider<List<OvertimeModel>>((ref) {
  final orgId = ref.watch(authNotifierProvider.notifier).organizationId;
  final employee = ref.watch(employeeProvider).valueOrNull;
  if (orgId == null || employee == null) throw Exception('Not authenticated');
  return ref.read(overtimeRepositoryProvider).getMyRequests(
    organizationId: orgId,
    employeeId: employee.id,
  );
});
