import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:employee_app/core/theme/app_theme.dart';

class AppShell extends StatelessWidget {
  final StatefulNavigationShell child;

  const AppShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: CustomBottomNav(child: child),
    );
  }
}

class CustomBottomNav extends StatelessWidget {
  final StatefulNavigationShell child;

  const CustomBottomNav({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final tabs = [
      ('dashboard', 'Home', Icons.dashboard_outlined, Icons.dashboard),
      ('event_note', 'Leave', Icons.calendar_today_outlined, Icons.calendar_today),
      ('payments', 'Payslips', Icons.payments_outlined, Icons.payments),
      ('person', 'Profile', Icons.person_outlined, Icons.person),
    ];

    final labels = ['Home', 'Leave', 'Payslips', 'Profile'];

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border(
          top: BorderSide(color: AppColors.outlineVariant.withAlpha(80)),
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withAlpha(10),
            blurRadius: 12,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(tabs.length, (index) {
              final isActive = child.currentIndex == index;
              return GestureDetector(
                onTap: () => child.goBranch(index),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: isActive ? AppColors.secondaryContainer : Colors.transparent,
                    borderRadius: BorderRadius.circular(100),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        isActive ? Icons.dashboard : Icons.dashboard_outlined,
                        size: 24,
                        color: isActive ? AppColors.onSecondaryContainer : AppColors.onSurfaceVariant,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        labels[index],
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 10,
                          fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                          color: isActive ? AppColors.onSecondaryContainer : AppColors.onSurfaceVariant,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}
