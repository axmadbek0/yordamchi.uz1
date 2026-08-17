import 'package:dio/dio.dart';

class AppException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic details;

  AppException({
    required this.message,
    this.statusCode,
    this.details,
  });

  @override
  String toString() => message;

  factory AppException.fromDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return AppException(
          message: "Server bilan aloqa vaqti tugadi. Internetni tekshiring.",
          statusCode: error.response?.statusCode,
        );
      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        final responseData = error.response?.data;
        String errorMessage = "Serverda xatolik yuz berdi ($statusCode).";

        if (responseData is Map<String, dynamic>) {
          if (responseData['message'] != null) {
            errorMessage = responseData['message'].toString();
          } else if (responseData['error'] != null) {
            errorMessage = responseData['error'].toString();
          }
        }

        if (statusCode == 401) {
          errorMessage = "Login yoki parol noto'g'ri, yoki sessiya muddati tugagan.";
        } else if (statusCode == 403) {
          errorMessage = "Ushbu amalni bajarish uchun sizda ruxsat yo'q.";
        } else if (statusCode == 404) {
          errorMessage = "So'ralgan ma'lumot topilmadi.";
        }

        return AppException(
          message: errorMessage,
          statusCode: statusCode,
          details: responseData,
        );
      case DioExceptionType.cancel:
        return AppException(message: "So'rov bekor qilindi.");
      case DioExceptionType.connectionError:
        return AppException(
          message: "Internetga ulanish mavjud emas. Offline rejimda ishlamoqdasiz.",
        );
      default:
        return AppException(
          message: error.message ?? "Noma'lum xatolik yuz berdi.",
        );
    }
  }
}

typedef NetworkExceptions = AppException;
