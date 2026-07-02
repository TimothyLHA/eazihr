import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:employee_app/data/repositories/auth_repository.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository();
});

enum AuthStatus { unknown, authenticated, unauthenticated }

class AuthNotifier extends StateNotifier<AuthStatus> {
  AuthNotifier(this._authRepository) : super(AuthStatus.unknown) {
    _init();
  }

  final AuthRepository _authRepository;

  void _init() {
    final session = _authRepository.session;
    state = session != null
        ? AuthStatus.authenticated
        : AuthStatus.unauthenticated;

    _authRepository.authStateChanges.listen((authState) {
      state = authState.session != null
          ? AuthStatus.authenticated
          : AuthStatus.unauthenticated;
    });
  }

  Future<void> signIn({required String email, required String password}) async {
    await _authRepository.signIn(email: email, password: password);
  }

  Future<void> signUp({
    required String email,
    required String password,
    required String organizationId,
    String? fullName,
    String role = 'employee',
  }) async {
    await _authRepository.signUp(
      email: email,
      password: password,
      organizationId: organizationId,
      fullName: fullName,
      role: role,
    );
  }

  Future<void> signOut() async {
    await _authRepository.signOut();
    state = AuthStatus.unauthenticated;
  }

  String? get organizationId => _authRepository.organizationId;
  String? get userRole => _authRepository.userRole;
}

final authNotifierProvider = StateNotifierProvider<AuthNotifier, AuthStatus>((ref) {
  return AuthNotifier(ref.read(authRepositoryProvider));
});
