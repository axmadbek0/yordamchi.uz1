import 'package:flutter/material.dart';

class AppColors {
  // Primary Palette
  static const Color primary = Color(0xFF1B6FA8);
  static const Color primaryDark = Color(0xFF0F4E78);
  static const Color primaryLight = Color(0xFF388DC7);
  static const Color secondary = Color(0xFF0F4E78);
  static const Color deepDark = Color(0xFF0A2540);
  
  // Card & Background Colors (Light)
  static const Color backgroundLight = Color(0xFFF6FAFD);
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color cardLight = Color(0xFFFFFFFF);
  static const Color softBlueCard = Color(0xFFEAF3FB);
  static const Color softAmberCard = Color(0xFFFEF3C7);
  static const Color softGreenCard = Color(0xFFD1FAE5);
  static const Color softRoseCard = Color(0xFFFFE4E6);
  
  // Card & Background Colors (Dark)
  static const Color backgroundDark = Color(0xFF071426);
  static const Color surfaceDark = Color(0xFF0D2137);
  static const Color cardDark = Color(0xFF132B45);
  static const Color softDarkCard = Color(0xFF1A3859);

  // Status & Feedback Colors
  static const Color success = Color(0xFF10B981);
  static const Color successDark = Color(0xFF059669);
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningDark = Color(0xFFD97706);
  static const Color danger = Color(0xFFFF4D4F);
  static const Color coral = Color(0xFFFF6B6B);
  static const Color info = Color(0xFF0284C7);

  // Neutral / Gray Gradients
  static const Color textPrimaryLight = Color(0xFF0A2540);
  static const Color textSecondaryLight = Color(0xFF5A6F82);
  static const Color textMutedLight = Color(0xFF94A3B8);
  static const Color borderLight = Color(0xFFE2E8F0);
  static const Color dividerLight = Color(0xFFEEF2F6);

  static const Color textPrimaryDark = Color(0xFFF8FAFC);
  static const Color textSecondaryDark = Color(0xFF94A3B8);
  static const Color textMutedDark = Color(0xFF64748B);
  static const Color borderDark = Color(0xFF1E3A5F);

  // Linear Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF1B6FA8), Color(0xFF0F4E78)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient aiCardGradient = LinearGradient(
    colors: [Color(0xFF1B6FA8), Color(0xFF4338CA), Color(0xFF6D28D9)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient warmGradient = LinearGradient(
    colors: [Color(0xFFFF6B6B), Color(0xFFFF8E53)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient emeraldGradient = LinearGradient(
    colors: [Color(0xFF10B981), Color(0xFF059669)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
