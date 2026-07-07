import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:employee_app/providers/supabase_provider.dart';
import 'package:employee_app/data/repositories/leave_repository.dart';
import 'package:employee_app/data/models/leave_request_model.dart';
import 'package:employee_app/data/models/leave_balance_model.dart';
import 'package:employee_app/features/auth/providers/auth_provider.dart';
import 'employee_provider.dart';

final leaveRepositoryProvider = Provider<LeaveRepository>((ref) {
  return LeaveRepository(ref.read(supabaseClientProvider));
});

final leaveBalancesProvider = FutureProvider<List<LeaveBalanceModel>>((ref) {
  final orgId = ref.watch(authNotifierProvider.notifier).organizationId;
  final employee = ref.watch(employeeProvider).valueOrNull;
  if (orgId == null || employee == null) throw Exception('Not authenticated');
  return ref.read(leaveRepositoryProvider).getMyBalances(
    organizationId: orgId,
    employeeId: employee.id,
  );
});

final leaveRequestsProvider = FutureProvider<List<LeaveRequestModel>>((ref) {
  final orgId = ref.watch(authNotifierProvider.notifier).organizationId;
  final employee = ref.watch(employeeProvider).valueOrNull;
  if (orgId == null || employee == null) throw Exception('Not authenticated');
  return ref.read(leaveRepositoryProvider).getMyRequests(
    organizationId: orgId,
    employeeId: employee.id,
  );
});

final leaveTypesProvider = FutureProvider<List<Map<String, dynamic>>>((ref) {
  final orgId = ref.watch(authNotifierProvider.notifier).organizationId;
  if (orgId == null) throw Exception('Not authenticated');
  return ref.read(leaveRepositoryProvider).getLeaveTypes(organizationId: orgId);
});
