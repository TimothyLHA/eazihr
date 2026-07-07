import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:employee_app/providers/employee_provider.dart';
import 'package:employee_app/providers/organization_provider.dart';
import 'package:employee_app/providers/supabase_provider.dart';
import 'package:employee_app/features/auth/providers/auth_provider.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:employee_app/core/theme/app_theme.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final employeeAsync = ref.watch(employeeProvider);
    final orgAsync = ref.watch(organizationProvider);
    final authNotifier = ref.watch(authNotifierProvider.notifier);
    final supabase = ref.read(supabaseClientProvider);
    final user = supabase.auth.currentUser;

    final employee = employeeAsync.valueOrNull;
    final org = orgAsync.valueOrNull;

    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          children: [
            const SizedBox(height: 12),
            _buildTopBar(),
            const SizedBox(height: 24),
            // Hero Profile Section
            Center(
              child: Column(
                children: [
                  Stack(
                    children: [
                      Container(
                        width: 128,
                        height: 128,
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: const LinearGradient(
                            colors: [AppColors.primary, AppColors.secondaryContainer],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                        ),
                        child: Container(
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: AppColors.surface, width: 4),
                            color: AppColors.surfaceContainerLow,
                          ),
                          child: const Center(
                            child: Icon(Icons.person, size: 56, color: AppColors.primary),
                          ),
                        ),
                      ),
                      Positioned(
                        bottom: 4,
                        right: 4,
                        child: Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            shape: BoxShape.circle,
                            border: Border.all(color: AppColors.surface, width: 2),
                          ),
                          child: const Icon(Icons.edit, size: 18, color: AppColors.onPrimary),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    user?.email ?? 'Employee',
                    style: GoogleFonts.inter(fontSize: 24, fontWeight: FontWeight.w600, color: AppColors.primary),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    employee?.position ?? 'Employee',
                    style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w500, color: AppColors.onSurfaceVariant),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.secondaryContainer,
                      borderRadius: BorderRadius.circular(100),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 6, height: 6,
                          decoration: const BoxDecoration(shape: BoxShape.circle, color: AppColors.primary),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          employee?.department ?? 'General',
                          style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.onSecondaryContainer),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            // Personal Details
            _sectionHeader('Personal Details'),
            const SizedBox(height: 12),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1.6,
              children: [
                _infoCard(Icons.mail_outline, 'Email Address', user?.email ?? 'N/A'),
                _infoCard(Icons.smartphone, 'Phone Number', user?.phone ?? 'Not set'),
                _infoCard(Icons.badge_outlined, 'Employee ID', employee?.employeeCode ?? 'N/A'),
                _infoCard(Icons.calendar_today, 'Joining Date', employee?.hireDate ?? 'N/A'),
              ],
            ),
            const SizedBox(height: 32),
            // Work Information
            _sectionHeader('Work Information'),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerLow,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.outlineVariant.withAlpha(60)),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _workInfoColumn('Direct Manager', org?.name ?? 'N/A', Icons.person),
                      _workInfoColumn('Location', 'Head Office', Icons.location_on),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Divider(height: 1),
                  const SizedBox(height: 16),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Professional Skills',
                        style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.outline, letterSpacing: 0.5)),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8, runSpacing: 8,
                        children: [
                          _skillChip('Strategic Planning'),
                          _skillChip('Operations'),
                          _skillChip('Leadership'),
                          _skillChip('+4 More'),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            // Action Buttons
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.download, size: 18),
                    label: Text('Export CV',
                      style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.share, size: 18),
                    label: Text('Share Profile',
                      style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.onSecondaryContainer,
                      backgroundColor: AppColors.secondaryContainer,
                      side: const BorderSide(color: AppColors.primary, width: 0.5),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildTopBar() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.surfaceContainer,
              ),
              child: const Icon(Icons.person, size: 20, color: AppColors.primary),
            ),
            const SizedBox(width: 12),
            Text('Executive HR',
              style: GoogleFonts.inter(fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.primary)),
          ],
        ),
        Stack(
          children: [
            IconButton(
              icon: const Icon(Icons.notifications_outlined, color: AppColors.primary),
              onPressed: () {},
            ),
          ],
        ),
      ],
    );
  }

  Widget _sectionHeader(String title) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title,
          style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.primary)),
        GestureDetector(
          onTap: () {},
          child: Row(
            children: [
              Text('View All',
                style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.primary)),
              const Icon(Icons.chevron_right, size: 18, color: AppColors.primary),
            ],
          ),
        ),
      ],
    );
  }

  Widget _infoCard(IconData icon, String label, String value) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.outlineVariant.withAlpha(80)),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
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
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(label,
                  style: GoogleFonts.inter(fontSize: 11, color: AppColors.outline, fontWeight: FontWeight.w500)),
                const SizedBox(height: 2),
                Text(value,
                  style: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.onSurface),
                  maxLines: 1, overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _workInfoColumn(String label, String value, IconData icon) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
          style: GoogleFonts.inter(fontSize: 11, color: AppColors.outline, fontWeight: FontWeight.w500)),
        const SizedBox(height: 4),
        Row(
          children: [
            Container(
              width: 24, height: 24,
              decoration: BoxDecoration(
                color: AppColors.secondaryContainer,
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 14, color: AppColors.primary),
            ),
            const SizedBox(width: 8),
            Text(value,
              style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.onSurface)),
          ],
        ),
      ],
    );
  }

  Widget _skillChip(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.surfaceBright,
        borderRadius: BorderRadius.circular(100),
        border: Border.all(color: AppColors.outlineVariant),
      ),
      child: Text(label,
        style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w500, color: AppColors.onSurfaceVariant)),
    );
  }
}
