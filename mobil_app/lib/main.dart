import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'app.dart';
import 'core/network/api_client.dart';
import 'core/storage/local_cache_service.dart';
import 'core/storage/secure_storage_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set preferred orientations & system overlay
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  final secureStorage = SecureStorageService();
  final localCache = LocalCacheService();
  final apiClient = ApiClient(secureStorage: secureStorage);

  runApp(
    YordamchiMedApp(
      secureStorage: secureStorage,
      localCache: localCache,
      apiClient: apiClient,
    ),
  );
}
