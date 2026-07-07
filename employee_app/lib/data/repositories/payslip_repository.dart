import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:employee_app/data/models/payslip_model.dart';

class PayslipRepository {
  final SupabaseClient _client;

  PayslipRepository(this._client);

  Future<List<PayslipModel>> getMyPayslips({
    required String organizationId,
    required String employeeId,
  }) async {
    final response = await _client
        .from('payslips')
        .select()
        .eq('organization_id', organizationId)
        .eq('employee_id', employeeId)
        .order('year', ascending: false)
        .order('month', ascending: false);

    return (response as List)
        .map((json) => PayslipModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  Future<PayslipModel> getPayslipDetail(String payslipId) async {
    final response = await _client
        .from('payslips')
        .select()
        .eq('id', payslipId)
        .single();

    return PayslipModel.fromJson(response);
  }

  Future<List<int>> getAvailableYears({
    required String organizationId,
    required String employeeId,
  }) async {
    final response = await _client
        .from('payslips')
        .select('year')
        .eq('organization_id', organizationId)
        .eq('employee_id', employeeId)
        .order('year', ascending: false);

    final years = (response as List)
        .map((json) => json['year'] as int)
        .toSet()
        .toList();
    years.sort((a, b) => b.compareTo(a));
    return years;
  }
}
