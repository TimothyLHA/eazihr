import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:employee_app/data/models/employee_model.dart';

class EmployeeRepository {
  final SupabaseClient _client;

  EmployeeRepository(this._client);

  Future<EmployeeModel> fetchMyEmployee({
    required String organizationId,
    required String profileId,
  }) async {
    final response = await _client
        .from('employees')
        .select()
        .eq('organization_id', organizationId)
        .eq('profile_id', profileId)
        .single();

    return EmployeeModel.fromJson(response);
  }
}
