import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:employee_app/data/models/overtime_model.dart';

class OvertimeRepository {
  final SupabaseClient _client;

  OvertimeRepository(this._client);

  Future<List<OvertimeModel>> getMyRequests({
    required String organizationId,
    required String employeeId,
  }) async {
    final response = await _client
        .from('overtime_requests')
        .select()
        .eq('organization_id', organizationId)
        .eq('employee_id', employeeId)
        .order('date', ascending: false);

    return (response as List)
        .map((json) => OvertimeModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  Future<OvertimeModel> createRequest({
    required String employeeId,
    required String organizationId,
    required String date,
    required double hours,
    double rate = 1.5,
    String? reason,
  }) async {
    final totalAmount = hours * rate;

    final response = await _client.from('overtime_requests').insert({
      'employee_id': employeeId,
      'organization_id': organizationId,
      'date': date,
      'hours': hours,
      'rate': rate,
      'total_amount': totalAmount,
      'reason': reason,
      'status': 'pending',
    }).select().single();

    return OvertimeModel.fromJson(response);
  }
}
