import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class LocalCacheService {
  Future<void> cacheJson(String key, dynamic data) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(key, jsonEncode(data));
  }

  Future<dynamic> getCachedJson(String key) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString(key);
    if (jsonStr == null) return null;
    try {
      return jsonDecode(jsonStr);
    } catch (_) {
      return null;
    }
  }

  Future<void> remove(String key) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(key);
  }
}
