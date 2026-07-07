import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:employee_app/data/models/loan_model.dart';

class LoanRepository {
  final SupabaseClient _client;

  LoanRepository(this._client);

  Future<List<LoanModel>> getMyLoans({
    required String organizationId,
    required String employeeId,
  }) async {
    final response = await _client
        .from('loans')
        .select()
        .eq('organization_id', organizationId)
        .eq('employee_id', employeeId)
        .order('created_at', ascending: false);

    return (response as List)
        .map((json) => LoanModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  Future<LoanModel> applyLoan({
    required String employeeId,
    required String organizationId,
    required double amount,
    required double interestRate,
    required int tenureMonths,
    double? monthlyEmi,
    String? purpose,
  }) async {
    final response = await _client.from('loans').insert({
      'employee_id': employeeId,
      'organization_id': organizationId,
      'amount': amount,
      'interest_rate': interestRate,
      'tenure_months': tenureMonths,
      'monthly_emi': monthlyEmi ?? (amount / tenureMonths),
      'balance': amount,
      'purpose': purpose,
      'status': 'pending',
    }).select().single();

    return LoanModel.fromJson(response);
  }

  Future<List<LoanRepaymentModel>> getRepayments(String loanId) async {
    final response = await _client
        .from('loan_repayments')
        .select()
        .eq('loan_id', loanId)
        .order('due_date', ascending: true);

    return (response as List)
        .map((json) => LoanRepaymentModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }
}
