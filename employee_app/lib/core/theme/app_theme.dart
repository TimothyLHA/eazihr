import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  static const background = Color(0xFFFFF8E7);
  static const surface = Color(0xFFFFF8E7);
  static const surfaceDim = Color(0xFFE0DAC9);
  static const surfaceBright = Color(0xFFFFF9EC);
  static const surfaceContainerLowest = Color(0xFFFFFFFF);
  static const surfaceContainerLow = Color(0xFFFAF3E2);
  static const surfaceContainer = Color(0xFFF4EDDD);
  static const surfaceContainerHigh = Color(0xFFEEE8D7);
  static const surfaceContainerHighest = Color(0xFFE9E2D2);
  static const primary = Color(0xFF065F46);
  static const onPrimary = Color(0xFFFFFFFF);
  static const primaryContainer = Color(0xFF065F46);
  static const onPrimaryContainer = Color(0xFF8BD6B7);
  static const secondary = Color(0xFF1B6B4F);
  static const onSecondary = Color(0xFFFFFFFF);
  static const secondaryContainer = Color(0xFFA7F3D0);
  static const onSecondaryContainer = Color(0xFF065F46);
  static const tertiary = Color(0xFF004533);
  static const onTertiary = Color(0xFFFFFFFF);
  static const tertiaryContainer = Color(0xFF1D5D49);
  static const onTertiaryContainer = Color(0xFF95D4BA);
  static const error = Color(0xFFBA1A1A);
  static const onError = Color(0xFFFFFFFF);
  static const errorContainer = Color(0xFFFFDAD6);
  static const onErrorContainer = Color(0xFF93000A);
  static const onSurface = Color(0xFF1E1C12);
  static const onSurfaceVariant = Color(0xFF3F4944);
  static const outline = Color(0xFF6F7973);
  static const outlineVariant = Color(0xFFBEC9C2);
  static const inverseSurface = Color(0xFF333025);
  static const inverseOnSurface = Color(0xFFF7F0DF);
  static const inversePrimary = Color(0xFF8BD6B6);
  static const surfaceTint = Color(0xFF1B6B51);
  static const primaryFixed = Color(0xFFA6F2D1);
  static const primaryFixedDim = Color(0xFF8BD6B6);
  static const onPrimaryFixed = Color(0xFF002116);
  static const onPrimaryFixedVariant = Color(0xFF00513B);
  static const secondaryFixed = Color(0xFFA6F2CF);
  static const secondaryFixedDim = Color(0xFF8BD6B4);
  static const onSecondaryFixed = Color(0xFF002115);
  static const onSecondaryFixedVariant = Color(0xFF00513A);
  static const tertiaryFixed = Color(0xFFB0F0D6);
  static const tertiaryFixedDim = Color(0xFF95D3BA);
  static const onTertiaryFixed = Color(0xFF002117);
  static const onTertiaryFixedVariant = Color(0xFF0B513D);
  static const surfaceVariant = Color(0xFFE9E2D2);
}

class AppTheme {
  static ThemeData get light {
    final textTheme = GoogleFonts.interTextTheme();

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppColors.background,
      colorScheme: const ColorScheme.light(
        primary: AppColors.primary,
        onPrimary: AppColors.onPrimary,
        primaryContainer: AppColors.primaryContainer,
        onPrimaryContainer: AppColors.onPrimaryContainer,
        secondary: AppColors.secondary,
        onSecondary: AppColors.onSecondary,
        secondaryContainer: AppColors.secondaryContainer,
        onSecondaryContainer: AppColors.onSecondaryContainer,
        tertiary: AppColors.tertiary,
        onTertiary: AppColors.onTertiary,
        error: AppColors.error,
        onError: AppColors.onError,
        errorContainer: AppColors.errorContainer,
        onErrorContainer: AppColors.onErrorContainer,
        surface: AppColors.background,
        onSurface: AppColors.onSurface,
        onSurfaceVariant: AppColors.onSurfaceVariant,
        outline: AppColors.outline,
        outlineVariant: AppColors.outlineVariant,
        inverseSurface: AppColors.inverseSurface,
        inversePrimary: AppColors.inversePrimary,
      ),
      textTheme: textTheme,
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.primary,
        elevation: 0,
        centerTitle: false,
        surfaceTintColor: Colors.transparent,
        titleTextStyle: textTheme.titleMedium?.copyWith(
          fontWeight: FontWeight.w600,
          color: AppColors.primary,
          fontSize: 20,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.onPrimary,
          minimumSize: const Size(double.infinity, 52),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          textStyle: textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w600,
          ),
          elevation: 4,
          shadowColor: AppColors.primary.withAlpha(50),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surfaceContainerLowest,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.outlineVariant),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.outlineVariant),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.error),
        ),
        labelStyle: textTheme.bodyMedium?.copyWith(
          color: AppColors.onSurfaceVariant,
          fontWeight: FontWeight.w500,
        ),
        prefixIconColor: AppColors.outline,
        suffixIconColor: AppColors.outline,
      ),
      dividerColor: AppColors.outlineVariant,
      dividerTheme: DividerThemeData(
        color: AppColors.outlineVariant.withAlpha(100),
        thickness: 1,
        space: 1,
      ),
    );
  }
}
