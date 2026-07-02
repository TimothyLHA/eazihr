import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:admin_app/features/auth/providers/auth_provider.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _navigate();
  }

  Future<void> _navigate() async {
    await Future.delayed(const Duration(seconds: 2));
    if (!mounted) return;
    final authStatus = ref.read(authNotifierProvider);
    if (authStatus == AuthStatus.authenticated) {
      context.go('/');
    } else {
      context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      backgroundColor: theme.colorScheme.primary,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.handshake_rounded,
              size: 80,
              color: theme.colorScheme.onPrimary,
            ),
            const SizedBox(height: 24),
            Text(
              'EasyHR',
              style: theme.textTheme.headlineLarge?.copyWith(
                color: theme.colorScheme.onPrimary,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Admin Portal',
              style: theme.textTheme.bodyLarge?.copyWith(
                color: theme.colorScheme.onPrimary.withAlpha(180),
              ),
            ),
            const SizedBox(height: 48),
            const CircularProgressIndicator(
              color: Colors.white,
              strokeWidth: 2,
            ),
          ],
        ),
      ),
    );
  }
}
