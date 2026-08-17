import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeCubit extends Cubit<ThemeMode> {
  static const String _themeKey = 'app_theme_mode';

  ThemeCubit() : super(ThemeMode.light) {
    _loadTheme();
  }

  Future<void> _loadTheme() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final isDark = prefs.getBool(_themeKey);
      if (isDark != null) {
        emit(isDark ? ThemeMode.dark : ThemeMode.light);
      }
    } catch (_) {}
  }

  Future<void> toggleTheme() async {
    final newMode = state == ThemeMode.light ? ThemeMode.dark : ThemeMode.light;
    emit(newMode);
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_themeKey, newMode == ThemeMode.dark);
    } catch (_) {}
  }

  Future<void> setDarkMode(bool isDark) async {
    final newMode = isDark ? ThemeMode.dark : ThemeMode.light;
    emit(newMode);
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(_themeKey, isDark);
    } catch (_) {}
  }
}
