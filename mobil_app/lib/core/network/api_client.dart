import 'package:dio/dio.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';
import 'package:yordamchi_med/core/constants/api_endpoints.dart';
import 'package:yordamchi_med/core/network/auth_interceptor.dart';
import 'package:yordamchi_med/core/network/network_exceptions.dart';
import 'package:yordamchi_med/core/storage/secure_storage_service.dart';

class ApiClient {
  late final Dio _dio;

  ApiClient({required SecureStorageService secureStorage}) {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiEndpoints.baseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        sendTimeout: const Duration(seconds: 10),
      ),
    );

    _dio.interceptors.addAll([
      AuthInterceptor(secureStorage: secureStorage),
      PrettyDioLogger(
        requestHeader: true,
        requestBody: true,
        responseBody: true,
        responseHeader: false,
        compact: true,
      ),
    ]);
  }

  Future<dynamic> get(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response = await _dio.get(path, queryParameters: queryParameters);
      return response.data;
    } on DioException catch (e) {
      throw NetworkExceptions.fromDioError(e);
    }
  }

  Future<dynamic> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response =
          await _dio.post(path, data: data, queryParameters: queryParameters);
      return response.data;
    } on DioException catch (e) {
      throw NetworkExceptions.fromDioError(e);
    }
  }

  Future<dynamic> patch(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response =
          await _dio.patch(path, data: data, queryParameters: queryParameters);
      return response.data;
    } on DioException catch (e) {
      throw NetworkExceptions.fromDioError(e);
    }
  }

  Future<dynamic> delete(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response =
          await _dio.delete(path, data: data, queryParameters: queryParameters);
      return response.data;
    } on DioException catch (e) {
      throw NetworkExceptions.fromDioError(e);
    }
  }
}
