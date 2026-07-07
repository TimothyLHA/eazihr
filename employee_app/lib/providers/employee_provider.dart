import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:employee_app/providers/supabase_provider.dart';
import 'package:employee_app/data/repositories/employee_repository.dart';
import 'package:employee_app/data/models/employee_model.dart';
import 'package:employee_app/features/auth/providers/auth_provider.dart';

final employeeRepositoryProvider = Provider<EmployeeRepository>((ref) {
  return EmployeeRepository(ref.read(supabaseClientProvider));
});

final employeeIdProvider = Provider<String?>((ref) {
  return null;
});

final employeeProvider = FutureProvider<EmployeeModel>((ref) {
  final supabase = ref.read(supabaseClientProvider);
  final orgId = ref.watch(authNotifierProvider.notifier).organizationId;
  final userId = supabase.auth.currentUser?.id;
  if (orgId == null || userId == null) throw Exception('Not authenticated');
  return ref.read(employeeRepositoryProvider).fetchMyEmployee(
    organizationId: orgId,
    profileId: userId,
  );
});
