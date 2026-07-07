import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:employee_app/data/models/organization_model.dart';

class OrganizationRepository {
  final SupabaseClient _client;

  OrganizationRepository(this._client);

  Future<OrganizationModel> fetchOrganization(String orgId) async {
    final response = await _client
        .from('organizations')
        .select()
        .eq('id', orgId)
        .single();

    return OrganizationModel.fromJson(response);
  }
}
