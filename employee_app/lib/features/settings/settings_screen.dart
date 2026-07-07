import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:employee_app/features/auth/providers/auth_provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:employee_app/core/theme/app_theme.dart';
import 'package:package_info_plus/package_info_plus.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authNotifier = ref.watch(authNotifierProvider.notifier);

    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          children: [
            const SizedBox(height: 12),
            _buildTopBar(context),
            const SizedBox(height: 24),
            Text('Settings',
              style: GoogleFonts.inter(fontSize: 28, fontWeight: FontWeight.w600, color: AppColors.onSurface)),
            Text('Manage your account and app experience.',
              style: GoogleFonts.inter(fontSize: 14, color: AppColors.onSurfaceVariant)),
            const SizedBox(height: 28),
            // Account Settings
            _sectionHeader('Account Settings'),
            const SizedBox(height: 12),
            _settingsCard([
              _settingsItem(Icons.lock, 'Password', 'Update your login credentials', null, () {}),
              _settingsDivider(),
              _settingsItem(Icons.security, 'Two-Factor Auth', 'Secure your account access',
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.secondaryContainer,
                    borderRadius: BorderRadius.circular(100),
                  ),
                  child: Text('Active',
                    style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.primary)),
                ),
                () {}),
            ]),
            const SizedBox(height: 24),
            // Notifications
            _sectionHeader('Notifications'),
            const SizedBox(height: 12),
            _settingsCard([
              _toggleItem(Icons.notifications_active, 'Push Notifications', 'Mobile app alerts', true, (v) {}),
              _settingsDivider(),
              _toggleItem(Icons.mail, 'Email Updates', 'Company news & payslips', false, (v) {}),
            ]),
            const SizedBox(height: 24),
            // App Preferences
            _sectionHeader('App Preferences'),
            const SizedBox(height: 12),
            _settingsCard([
              _settingsItem(Icons.language, 'Language', 'English (US)', null, () {}),
              _settingsDivider(),
              _settingsItem(Icons.dark_mode, 'Dark Mode', 'Match system settings',
                Text('System',
                  style: GoogleFonts.inter(fontSize: 12, fontStyle: FontStyle.italic, color: AppColors.onSurfaceVariant)),
                () {}),
            ]),
            const SizedBox(height: 24),
            // Support
            _sectionHeader('Support'),
            const SizedBox(height: 12),
            _settingsCard([
              _settingsItem(Icons.help_outline, 'Help Center', 'FAQs and direct support',
                const Icon(Icons.open_in_new, size: 18, color: AppColors.outline), () {}),
              _settingsDivider(),
              FutureBuilder<PackageInfo>(
                future: PackageInfo.fromPlatform(),
                builder: (context, snapshot) {
                  final version = snapshot.data?.version ?? '1.0.0';
                  final buildNumber = snapshot.data?.buildNumber ?? '1';
                  return _settingsItem(Icons.info_outline, 'About', 'Version $version (Build $buildNumber)',
                    const Icon(Icons.chevron_right, size: 20, color: AppColors.outline), () {});
                },
              ),
            ]),
            const SizedBox(height: 24),
            // Log Out
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () async {
                  final confirm = await showDialog<bool>(
                    context: context,
                    builder: (context) => AlertDialog(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      title: const Text('Sign Out'),
                      content: const Text('Are you sure you want to sign out?'),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(context, false),
                          child: const Text('Cancel'),
                        ),
                        TextButton(
                          onPressed: () => Navigator.pop(context, true),
                          child: Text('Sign Out',
                            style: GoogleFonts.inter(color: AppColors.error, fontWeight: FontWeight.w600)),
                        ),
                      ],
                    ),
                  );
                  if (confirm == true && context.mounted) {
                    await authNotifier.signOut();
                  }
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.error,
                  side: const BorderSide(color: AppColors.error, width: 0.5),
                  backgroundColor: AppColors.errorContainer.withAlpha(40),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: Text('Log Out',
                  style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600)),
              ),
            ),
            const SizedBox(height: 8),
            Center(
              child: Text('Executive HR Portal \u00a9 2024',
                style: GoogleFonts.inter(fontSize: 11, color: AppColors.outline)),
            ),
            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  Widget _buildTopBar(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            GestureDetector(
              onTap: () => Navigator.pop(context),
              child: const Icon(Icons.arrow_back, color: AppColors.primary),
            ),
            const SizedBox(width: 12),
            Text('Executive HR',
              style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.primary)),
          ],
        ),
        Row(
          children: [
            const Icon(Icons.notifications_outlined, color: AppColors.primary),
            const SizedBox(width: 12),
            Container(
              width: 32, height: 32,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.outlineVariant),
              ),
              child: const Icon(Icons.person, size: 16, color: AppColors.primary),
            ),
          ],
        ),
      ],
    );
  }

  Widget _sectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4),
      child: Text(title.toUpperCase(),
        style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600,
          color: AppColors.primary, letterSpacing: 1)),
    );
  }

  Widget _settingsCard(List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.outlineVariant.withAlpha(80)),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withAlpha(8),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(children: children),
    );
  }

  Widget _settingsItem(IconData icon, String title, String subtitle, Widget? trailing, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Container(
              width: 40, height: 40,
              decoration: BoxDecoration(
                color: AppColors.surfaceContainer,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, size: 20, color: AppColors.primary),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                    style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.onSurface)),
                  Text(subtitle,
                    style: GoogleFonts.inter(fontSize: 12, color: AppColors.onSurfaceVariant)),
                ],
              ),
            ),
            if (trailing != null) trailing,
            if (trailing == null) const Icon(Icons.chevron_right, size: 20, color: AppColors.outline),
          ],
        ),
      ),
    );
  }

  Widget _toggleItem(IconData icon, String title, String subtitle, bool initialValue, ValueChanged<bool> onChanged) {
    return StatefulBuilder(
      builder: (context, setLocalState) {
        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            children: [
              Container(
                width: 40, height: 40,
                decoration: BoxDecoration(
                  color: AppColors.surfaceContainer,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, size: 20, color: AppColors.primary),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title,
                      style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.onSurface)),
                    Text(subtitle,
                      style: GoogleFonts.inter(fontSize: 12, color: AppColors.onSurfaceVariant)),
                  ],
                ),
              ),
              Switch(
                value: initialValue,
                activeColor: AppColors.primary,
                activeTrackColor: AppColors.primary.withAlpha(100),
                onChanged: (v) {
                  setLocalState(() => initialValue = v);
                  onChanged(v);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _settingsDivider() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Divider(height: 1, color: AppColors.outlineVariant.withAlpha(80)),
    );
  }
}
