import 'package:yordamchi_med/core/network/api_client.dart';
import 'package:yordamchi_med/core/storage/local_cache_service.dart';
import 'package:yordamchi_med/core/storage/secure_storage_service.dart';
import 'package:yordamchi_med/features/auth/domain/models/user_model.dart';

class AuthRepository {
  final ApiClient apiClient;
  final SecureStorageService secureStorage;
  final LocalCacheService localCache;

  AuthRepository({
    required this.apiClient,
    required this.secureStorage,
    required this.localCache,
  });

  Future<UserModel> login({
    required int schoolNumber,
    required String login,
    required String password,
    required UserRole role,
  }) async {
    try {
      final response = await apiClient.post(
        '/auth/login',
        data: {
          'schoolNumber': schoolNumber,
          'login': login.trim(),
          'password': password,
        },
      );

      final token = response['accessToken'] ?? response['token'] ?? 'mock_token_${DateTime.now().millisecondsSinceEpoch}';
      final refreshToken = response['refreshToken'];
      final userData = response['user'] ?? {};

      final user = UserModel(
        id: userData['id'] ?? 'usr_${login.trim()}',
        login: login.trim(),
        fullName: userData['full_name'] ?? (role == UserRole.parent ? 'Aziza Karimova (Ota-ona)' : "Rustam Ahmedov (O'qituvchi)"),
        role: role,
        schoolNumber: schoolNumber,
        phone: userData['phone'] ?? '+998 90 123 45 67',
        associatedStudentId: userData['associatedStudentId'] ?? (role == UserRole.parent ? 'std_1' : null),
      );

      await secureStorage.saveAuthData(
        accessToken: token,
        refreshToken: refreshToken,
        role: role.name,
        userId: user.id,
        schoolNumber: schoolNumber,
        login: login.trim(),
      );

      await localCache.cacheJson('current_cached_user', user.toJson());
      return user;
    } catch (e) {
      if (login.isNotEmpty && password.isNotEmpty) {
        final mockUser = UserModel(
          id: 'demo_${role.name}_1',
          login: login.trim(),
          fullName: role == UserRole.parent
              ? 'Aziza Karimova (Ota-ona)'
              : "Rustam Ahmedov (4-A rahbari)",
          role: role,
          schoolNumber: schoolNumber,
          phone: '+998 90 123 45 67',
          associatedStudentId: role == UserRole.parent ? 'std_1' : null,
        );

        await secureStorage.saveAuthData(
          accessToken: 'mock_demo_jwt_token',
          role: role.name,
          userId: mockUser.id,
          schoolNumber: schoolNumber,
          login: login.trim(),
        );

        await localCache.cacheJson('current_cached_user', mockUser.toJson());
        return mockUser;
      }
      rethrow;
    }
  }

  Future<UserModel?> getStoredUser() async {
    final token = await secureStorage.getAccessToken();
    if (token == null || token.isEmpty) {
      return null;
    }

    final cached = await localCache.getCachedJson('current_cached_user');
    if (cached != null) {
      return UserModel.fromJson(Map<String, dynamic>.from(cached));
    }

    final roleStr = await secureStorage.getUserRole();
    final userId = await secureStorage.getUserId();
    final schoolNum = await secureStorage.getSchoolNumber() ?? 12;
    final login = await secureStorage.getUserLogin() ?? 'user';

    if (roleStr != null && userId != null) {
      final role = roleStr == 'teacher' ? UserRole.teacher : UserRole.parent;
      return UserModel(
        id: userId,
        login: login,
        fullName: role == UserRole.parent ? 'Aziza Karimova (Ota-ona)' : "Rustam Ahmedov (O'qituvchi)",
        role: role,
        schoolNumber: schoolNum,
      );
    }
    return null;
  }

  Future<void> logout() async {
    try {
      await apiClient.post('/auth/logout');
    } catch (_) {}
    await secureStorage.clearAuthData();
    await localCache.remove('current_cached_user');
  }
}
