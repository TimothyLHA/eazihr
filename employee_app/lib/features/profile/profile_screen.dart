import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:employee_app/providers/employee_provider.dart';
import 'package:employee_app/providers/organization_provider.dart';
import 'package:employee_app/providers/supabase_provider.dart';
import 'package:employee_app/features/auth/providers/auth_provider.dart';
import 'package:go_router/go_router.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final employeeAsync = ref.watch(employeeProvider);
    final orgAsync = ref.watch(organizationProvider);
    final authNotifier = ref.watch(authNotifierProvider.notifier);
    final supabase = ref.read(supabaseClientProvider);
    final user = supabase.auth.currentUser;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => context.push('/settings'),
            tooltip: 'Settings',
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const SizedBox(height: 16),
          CircleAvatar(
            radius: 48,
            backgroundColor: theme.colorScheme.primary.withAlpha(25),
            child: Icon(Icons.person, size: 48, color: theme.colorScheme.primary),
          ),
          const SizedBox(height: 16),
          employeeAsync.when(
            data: (employee) => Column(
              children: [
                Text(
                  user?.email ?? '',
                  style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 4),
                if (employee.employeeCode != null)
                  Text(
                    employee.employeeCode!,
                    style: theme.textTheme.bodySmall?.copyWith(color: theme.colorScheme.onSurface.withAlpha(150)),
                  ),
                const SizedBox(height: 8),
                Chip(
                  label: Text(employee.status, style: const TextStyle(fontSize: 12)),
                  visualDensity: VisualDensity.compact,
                ),
              ],
            ),
            loading: () => const CircularProgressIndicator(),
            error: (e, _) => Text('Error: $e'),
          ),
          const SizedBox(height: 32),

          // Personal Information Section
          Text('Personal Information', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _InfoTile(theme: theme, label: 'Email', value: user?.email ?? 'N/A'),
                  const Divider(height: 24),
                  _InfoTile(theme: theme, label: 'Phone', value: user?.phone ?? 'Not set'),
                ],
              ),
            ),
          ),

          const SizedBox(height: 24),

          // Employment Information Section
          Text('Employment Information', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  orgAsync.when(
                    data: (org) => _InfoTile(theme: theme, label: 'Organization', value: org.name),
                    loading: () => const SizedBox(),
                    error: (_, __) => _InfoTile(theme: theme, label: 'Organization', value: 'N/A'),
                  ),
                  const Divider(height: 24),
                  employeeAsync.when(
                    data: (employee) => Column(
                      children: [
                        if (employee.employeeCode != null) ...[
                          _InfoTile(theme: theme, label: 'Employee Code', value: employee.employeeCode!),
                          const Divider(height: 24),
                        ],
                        if (employee.department != null) ...[
                          _InfoTile(theme: theme, label: 'Department', value: employee.department!),
                          const Divider(height: 24),
                        ],
                        if (employee.position != null) ...[
                          _InfoTile(theme: theme, label: 'Position', value: employee.position!),
                          const Divider(height: 24),
                        ],
                        if (employee.hireDate != null) _InfoTile(theme: theme, label: 'Joined', value: employee.hireDate!),
                      ],
                    ),
                    loading: () => const SizedBox(),
                    error: (_, __) => const Text('Unable to load employment info'),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () async {
                await authNotifier.signOut();
              },
              icon: const Icon(Icons.logout),
              label: const Text('Sign Out'),
              style: OutlinedButton.styleFrom(
                foregroundColor: theme.colorScheme.error,
                side: BorderSide(color: theme.colorScheme.error.withAlpha(80)),
                minimumSize: const Size(0, 48),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  final ThemeData theme;
  final String label;
  final String value;

  const _InfoTile({required this.theme, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              label,
              style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurface.withAlpha(180)),
            ),
          ),
          Expanded(
            flex: 2,
            child: Text(
              value,
              style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w500),
              textAlign: TextAlign.end,
            ),
          ),
        ],
      ),
    );
  }
}
