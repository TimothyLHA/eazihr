import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:employee_app/core/network/supabase_client.dart';
import 'package:employee_app/core/theme/app_theme.dart';
import 'package:employee_app/router/app_router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SupabaseConfig.initialize();
  runApp(const ProviderScope(child: EmployeeApp()));
}

class EmployeeApp extends ConsumerWidget {
  const EmployeeApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'EasyHR Employee',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      routerConfig: router,
    );
  }
}
