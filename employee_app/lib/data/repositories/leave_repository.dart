import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:employee_app/data/models/leave_request_model.dart';
import 'package:employee_app/data/models/leave_balance_model.dart';

class LeaveRepository {
  final SupabaseClient _client;

  LeaveRepository(this._client);

  Future<List<LeaveBalanceModel>> getMyBalances({
    required String organizationId,
    required String employeeId,
  }) async {
    final response = await _client
        .from('leave_balances')
        .select()
        .eq('organization_id', organizationId)
        .eq('employee_id', employeeId);

    return (response as List)
        .map((json) => LeaveBalanceModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  Future<List<LeaveRequestModel>> getMyRequests({
    required String organizationId,
    required String employeeId,
  }) async {
    final response = await _client
        .from('leave_requests')
        .select()
        .eq('organization_id', organizationId)
        .eq('employee_id', employeeId)
        .order('created_at', ascending: false);

    return (response as List)
        .map((json) => LeaveRequestModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  Future<List<Map<String, dynamic>>> getLeaveTypes({
    required String organizationId,
  }) async {
    final response = await _client
        .from('leave_types')
        .select()
        .eq('organization_id', organizationId);

    return (response as List).cast<Map<String, dynamic>>();
  }

  Future<LeaveRequestModel> createRequest({
    required String employeeId,
    required String organizationId,
    required String leaveTypeId,
    required String startDate,
    required String endDate,
    required double days,
    String? reason,
  }) async {
    final response = await _client.from('leave_requests').insert({
      'employee_id': employeeId,
      'organization_id': organizationId,
      'leave_type_id': leaveTypeId,
      'start_date': startDate,
      'end_date': endDate,
      'days': days,
      'reason': reason,
      'status': 'pending',
    }).select().single();

    return LeaveRequestModel.fromJson(response);
  }
}
