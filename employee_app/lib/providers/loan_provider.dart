import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:employee_app/providers/supabase_provider.dart';
import 'package:employee_app/data/repositories/loan_repository.dart';
import 'package:employee_app/data/models/loan_model.dart';
import 'package:employee_app/features/auth/providers/auth_provider.dart';
import 'employee_provider.dart';

final loanRepositoryProvider = Provider<LoanRepository>((ref) {
  return LoanRepository(ref.read(supabaseClientProvider));
});

final myLoansProvider = FutureProvider<List<LoanModel>>((ref) {
  final orgId = ref.watch(authNotifierProvider.notifier).organizationId;
  final employee = ref.watch(employeeProvider).valueOrNull;
  if (orgId == null || employee == null) throw Exception('Not authenticated');
  return ref.read(loanRepositoryProvider).getMyLoans(
    organizationId: orgId,
    employeeId: employee.id,
  );
});
