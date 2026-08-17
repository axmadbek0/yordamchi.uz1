import 'package:dio/dio.dart';
import 'package:yordamchi_med/core/storage/secure_storage_service.dart';

class AuthInterceptor extends Interceptor {
  final SecureStorageService secureStorage;

  AuthInterceptor({required this.secureStorage});

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await secureStorage.getAccessToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    options.headers['Accept'] = 'application/json';
    options.headers['Content-Type'] = 'application/json';

    return handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      // Auto-clear or refresh token
      await secureStorage.clearAuthData();
    }
    return handler.next(err);
  }
}
