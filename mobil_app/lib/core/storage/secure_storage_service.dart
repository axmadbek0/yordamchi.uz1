import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  final FlutterSecureStorage _storage;

  SecureStorageService({FlutterSecureStorage? storage})
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(encryptedSharedPreferences: true),
            );

  static const String _accessTokenKey = 'yordamchi_auth_token';
  static const String _refreshTokenKey = 'yordamchi_refresh_token';
  static const String _userRoleKey = 'yordamchi_user_role';
  static const String _userIdKey = 'yordamchi_user_id';
  static const String _userSchoolNumberKey = 'yordamchi_school_number';
  static const String _userLoginKey = 'yordamchi_user_login';

  Future<void> saveAuthData({
    required String accessToken,
    String? refreshToken,
    required String role,
    required String userId,
    required int schoolNumber,
    required String login,
  }) async {
    await _storage.write(key: _accessTokenKey, value: accessToken);
    if (refreshToken != null) {
      await _storage.write(key: _refreshTokenKey, value: refreshToken);
    }
    await _storage.write(key: _userRoleKey, value: role);
    await _storage.write(key: _userIdKey, value: userId);
    await _storage.write(key: _userSchoolNumberKey, value: schoolNumber.toString());
    await _storage.write(key: _userLoginKey, value: login);
  }

  Future<String?> getAccessToken() async {
    return await _storage.read(key: _accessTokenKey);
  }

  Future<String?> getRefreshToken() async {
    return await _storage.read(key: _refreshTokenKey);
  }

  Future<String?> getUserRole() async {
    return await _storage.read(key: _userRoleKey);
  }

  Future<String?> getUserId() async {
    return await _storage.read(key: _userIdKey);
  }

  Future<String?> getUserLogin() async {
    return await _storage.read(key: _userLoginKey);
  }

  Future<int?> getSchoolNumber() async {
    final val = await _storage.read(key: _userSchoolNumberKey);
    return val != null ? int.tryParse(val) : null;
  }

  Future<void> clearAuthData() async {
    await _storage.deleteAll();
  }
}
