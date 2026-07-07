import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:employee_app/data/models/attendance_model.dart';

class AttendanceRepository {
  final SupabaseClient _client;

  AttendanceRepository(this._client);

  Future<List<AttendanceModel>> getMyLogs({
    required String organizationId,
    required String employeeId,
    int limit = 30,
  }) async {
    final response = await _client
        .from('attendance_logs')
        .select()
        .eq('organization_id', organizationId)
        .eq('employee_id', employeeId)
        .order('date', ascending: false)
        .limit(limit);

    return (response as List)
        .map((json) => AttendanceModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  Future<AttendanceModel?> getTodayLog({
    required String organizationId,
    required String employeeId,
    required String today,
  }) async {
    final response = await _client
        .from('attendance_logs')
        .select()
        .eq('organization_id', organizationId)
        .eq('employee_id', employeeId)
        .eq('date', today)
        .maybeSingle();

    if (response == null) return null;
    return AttendanceModel.fromJson(response);
  }

  Future<AttendanceModel> checkIn({
    required String organizationId,
    required String employeeId,
    required String today,
    required String now,
    Map<String, dynamic>? location,
  }) async {
    final response = await _client.from('attendance_logs').insert({
      'employee_id': employeeId,
      'organization_id': organizationId,
      'date': today,
      'check_in': now,
      'status': 'on_time',
      'location': location ?? {},
    }).select().single();

    return AttendanceModel.fromJson(response);
  }

  Future<List<AttendanceModel>> getLogsByMonth({
    required String organizationId,
    required String employeeId,
    required int year,
    required int month,
  }) async {
    final startDate = DateTime(year, month, 1).toIso8601String().split('T')[0];
    final endDate = DateTime(year, month + 1, 0).toIso8601String().split('T')[0];

    final response = await _client
        .from('attendance_logs')
        .select()
        .eq('organization_id', organizationId)
        .eq('employee_id', employeeId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', ascending: false);

    return (response as List)
        .map((json) => AttendanceModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  Future<AttendanceModel> checkOut({
    required String attendanceId,
    required String now,
  }) async {
    final response = await _client
        .from('attendance_logs')
        .update({'check_out': now})
        .eq('id', attendanceId)
        .select()
        .single();

    return AttendanceModel.fromJson(response);
  }
}
