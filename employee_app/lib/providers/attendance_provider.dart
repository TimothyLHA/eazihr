import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:employee_app/providers/supabase_provider.dart';
import 'package:employee_app/data/repositories/attendance_repository.dart';
import 'package:employee_app/data/models/attendance_model.dart';
import 'package:employee_app/features/auth/providers/auth_provider.dart';
import 'employee_provider.dart';

final attendanceRepositoryProvider = Provider<AttendanceRepository>((ref) {
  return AttendanceRepository(ref.read(supabaseClientProvider));
});

final attendanceLogsProvider = FutureProvider<List<AttendanceModel>>((ref) {
  final orgId = ref.watch(authNotifierProvider.notifier).organizationId;
  final employee = ref.watch(employeeProvider).valueOrNull;
  if (orgId == null || employee == null) throw Exception('Not authenticated');
  return ref.read(attendanceRepositoryProvider).getMyLogs(
    organizationId: orgId,
    employeeId: employee.id,
  );
});

final todayAttendanceProvider = FutureProvider<AttendanceModel?>((ref) {
  final orgId = ref.watch(authNotifierProvider.notifier).organizationId;
  final employee = ref.watch(employeeProvider).valueOrNull;
  if (orgId == null || employee == null) throw Exception('Not authenticated');
  final today = DateTime.now().toIso8601String().split('T')[0];
  return ref.read(attendanceRepositoryProvider).getTodayLog(
    organizationId: orgId,
    employeeId: employee.id,
    today: today,
  );
});
