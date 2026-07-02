import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:employee_app/features/splash/screens/splash_screen.dart';
import 'package:employee_app/features/auth/screens/login_screen.dart';
import 'package:employee_app/features/auth/providers/auth_provider.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authStatus = ref.watch(authNotifierProvider);

  return GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final isLoggedIn = authStatus == AuthStatus.authenticated;
      final isLoggingIn = state.matchedLocation == '/login';
      final isSplash = state.matchedLocation == '/splash';

      if (authStatus == AuthStatus.unknown) return null;
      if (isLoggedIn && (isLoggingIn || isSplash)) return '/';
      if (!isLoggedIn && !isLoggingIn && !isSplash) return '/login';
      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/',
        builder: (context, state) => Scaffold(
          body: Center(
            child: Text(
              'Employee Dashboard',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
          ),
        ),
      ),
    ],
  );
});
