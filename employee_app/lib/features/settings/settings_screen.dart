import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:employee_app/features/auth/providers/auth_provider.dart';
import 'package:employee_app/core/theme/app_theme.dart';
import 'package:package_info_plus/package_info_plus.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final authNotifier = ref.watch(authNotifierProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Appearance Section
          Text('Appearance', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
          const SizedBox(height: 12),
          Card(
            child: Column(
              children: [
                _SettingsTile(
                  theme: theme,
                  icon: Icons.brightness_6,
                  title: 'Theme',
                  subtitle: 'Choose your preferred theme',
                  trailing: SegmentedButton<ThemeMode>(
                    segments: const [
                      ButtonSegment<ThemeMode>(
                        value: ThemeMode.light,
                        label: Text('Light'),
                        icon: Icon(Icons.light_mode, size: 18),
                      ),
                      ButtonSegment<ThemeMode>(
                        value: ThemeMode.dark,
                        label: Text('Dark'),
                        icon: Icon(Icons.dark_mode, size: 18),
                      ),
                      ButtonSegment<ThemeMode>(
                        value: ThemeMode.system,
                        label: Text('Auto'),
                        icon: Icon(Icons.brightness_auto, size: 18),
                      ),
                    ],
                    selected: {ThemeMode.system},
                    onSelectionChanged: (Set<ThemeMode> selected) {
                      // TODO: Implement theme persistence
                      // For now, this is a placeholder
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Theme preference will be saved in future update'),
                          duration: Duration(seconds: 2),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Notifications Section
          Text('Notifications', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
          const SizedBox(height: 12),
          Card(
            child: Column(
              children: [
                _SettingsTile(
                  theme: theme,
                  icon: Icons.notifications_active,
                  title: 'Push Notifications',
                  subtitle: 'Receive push notifications',
                  trailing: Switch(
                    value: true,
                    onChanged: (value) {
                      // TODO: Implement notification preferences
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(value ? 'Notifications enabled' : 'Notifications disabled'),
                          duration: const Duration(seconds: 2),
                        ),
                      );
                    },
                  ),
                ),
                const Divider(height: 1),
                _SettingsTile(
                  theme: theme,
                  icon: Icons.email,
                  title: 'Email Notifications',
                  subtitle: 'Receive email updates',
                  trailing: Switch(
                    value: false,
                    onChanged: (value) {
                      // TODO: Implement email notification preferences
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(value ? 'Email notifications enabled' : 'Email notifications disabled'),
                          duration: const Duration(seconds: 2),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // About Section
          Text('About', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
          const SizedBox(height: 12),
          Card(
            child: FutureBuilder<PackageInfo>(
              future: PackageInfo.fromPlatform(),
              builder: (context, snapshot) {
                final version = snapshot.data?.version ?? '1.0.0';
                final buildNumber = snapshot.data?.buildNumber ?? '1';

                return Column(
                  children: [
                    _SettingsTile(
                      theme: theme,
                      icon: Icons.info,
                      title: 'App Version',
                      subtitle: 'Version $version ($buildNumber)',
                      trailing: null,
                    ),
                    const Divider(height: 1),
                    _SettingsTile(
                      theme: theme,
                      icon: Icons.description,
                      title: 'Terms of Service',
                      subtitle: 'View terms and conditions',
                      trailing: const Icon(Icons.chevron_right, size: 20),
                      onTap: () {
                        // TODO: Open terms of service
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Terms of Service will be available soon'),
                            duration: Duration(seconds: 2),
                          ),
                        );
                      },
                    ),
                    const Divider(height: 1),
                    _SettingsTile(
                      theme: theme,
                      icon: Icons.privacy_tip,
                      title: 'Privacy Policy',
                      subtitle: 'View privacy policy',
                      trailing: const Icon(Icons.chevron_right, size: 20),
                      onTap: () {
                        // TODO: Open privacy policy
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Privacy Policy will be available soon'),
                            duration: Duration(seconds: 2),
                          ),
                        );
                      },
                    ),
                  ],
                );
              },
            ),
          ),

          const SizedBox(height: 24),

          // Account Section
          Text('Account', style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
          const SizedBox(height: 12),
          Card(
            child: Column(
              children: [
                _SettingsTile(
                  theme: theme,
                  icon: Icons.logout,
                  title: 'Sign Out',
                  subtitle: 'Log out of your account',
                  trailing: null,
                  onTap: () async {
                    final confirm = await showDialog<bool>(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: const Text('Sign Out'),
                        content: const Text('Are you sure you want to sign out?'),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(context, false),
                            child: const Text('Cancel'),
                          ),
                          TextButton(
                            onPressed: () => Navigator.pop(context, true),
                            child: Text(
                              'Sign Out',
                              style: TextStyle(color: theme.colorScheme.error),
                            ),
                          ),
                        ],
                      ),
                    );

                    if (confirm == true && context.mounted) {
                      await authNotifier.signOut();
                    }
                  },
                ),
              ],
            ),
          ),

          const SizedBox(height: 32),

          // App Logo
          Center(
            child: Column(
              children: [
                Icon(
                  Icons.work,
                  size: 48,
                  color: theme.colorScheme.primary.withAlpha(100),
                ),
                const SizedBox(height: 8),
                Text(
                  'EasyHR',
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: theme.colorScheme.onSurface.withAlpha(150),
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Employee App',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurface.withAlpha(120),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final ThemeData theme;
  final IconData icon;
  final String title;
  final String subtitle;
  final Widget? trailing;
  final VoidCallback? onTap;

  const _SettingsTile({
    required this.theme,
    required this.icon,
    required this.title,
    required this.subtitle,
    this.trailing,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Icon(icon, size: 24, color: theme.colorScheme.primary),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: theme.textTheme.bodyLarge?.copyWith(
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurface.withAlpha(150),
                    ),
                  ),
                ],
              ),
            ),
            if (trailing != null) trailing!,
          ],
        ),
      ),
    );
  }
}