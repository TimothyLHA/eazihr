import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:employee_app/core/network/supabase_client.dart';

class AuthRepository {
  final SupabaseClient _client;

  AuthRepository() : _client = SupabaseConfig.client;

  Session? get session => _client.auth.currentSession;
  User? get currentUser => _client.auth.currentUser;
  Stream<AuthState> get authStateChanges => _client.auth.onAuthStateChange;

  Future<AuthResponse> signIn({
    required String email,
    required String password,
  }) async {
    final response = await _client.auth.signInWithPassword(
      email: email,
      password: password,
    );
    return response;
  }

  Future<AuthResponse> signInWithEmployeeCode({
    required String slug,
    required String employeeCode,
    required String password,
  }) async {
    final result = await _client.rpc('sign_in_employee', params: {
      'p_slug': slug,
      'p_employee_code': employeeCode,
      'p_password': password,
    }).single();
    final email = result['sign_in_employee'] as String?;

    if (email == null || email.isEmpty) {
      throw Exception('Employee ID not found or account inactive');
    }

    final response = await _client.auth.signInWithPassword(
      email: email,
      password: password,
    );
    return response;
  }

  Future<AuthResponse> signUp({
    required String email,
    required String password,
    required String organizationId,
    String? fullName,
    String role = 'employee',
  }) async {
    final response = await _client.auth.signUp(
      email: email,
      password: password,
      data: {
        'organization_id': organizationId,
        'role': role,
        'full_name': fullName ?? '',
      },
    );
    return response;
  }

  Future<void> signOut() async {
    await _client.auth.signOut();
  }

  Future<void> resetPassword(String email) async {
    await _client.auth.resetPasswordForEmail(email);
  }

  String? get userId => currentUser?.id;

  String? get organizationId {
    final metadata = currentUser?.userMetadata;
    return metadata?['organization_id'] as String?;
  }

  String? get userRole {
    final metadata = currentUser?.userMetadata;
    return metadata?['role'] as String?;
  }
}
