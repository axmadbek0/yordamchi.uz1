import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'core/constants/app_strings.dart';
import 'core/network/api_client.dart';
import 'core/router/app_router.dart';
import 'core/storage/local_cache_service.dart';
import 'core/storage/secure_storage_service.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/theme_cubit.dart';
import 'features/auth/data/repositories/auth_repository.dart';
import 'features/auth/presentation/bloc/auth_bloc.dart';
import 'features/parent/ai_chat/data/repositories/ai_chat_repository.dart';
import 'features/parent/ai_chat/presentation/bloc/ai_chat_bloc.dart';
import 'features/parent/daily_reports/data/repositories/parent_reports_repository.dart';
import 'features/parent/daily_reports/presentation/bloc/parent_reports_bloc.dart';
import 'features/parent/notifications/data/repositories/parent_notifications_repository.dart';
import 'features/parent/notifications/presentation/bloc/parent_notifications_bloc.dart';
import 'features/schools_directory/data/repositories/schools_repository.dart';
import 'features/schools_directory/presentation/bloc/schools_bloc.dart';
import 'features/teacher/class_roster/data/repositories/teacher_roster_repository.dart';
import 'features/teacher/class_roster/presentation/bloc/teacher_roster_bloc.dart';

class YordamchiMedApp extends StatelessWidget {
  final SecureStorageService secureStorage;
  final LocalCacheService localCache;
  final ApiClient apiClient;

  const YordamchiMedApp({
    super.key,
    required this.secureStorage,
    required this.localCache,
    required this.apiClient,
  });

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider<AuthRepository>(
          create: (_) => AuthRepository(
            apiClient: apiClient,
            secureStorage: secureStorage,
            localCache: localCache,
          ),
        ),
        RepositoryProvider<ParentReportsRepository>(
          create: (_) => ParentReportsRepository(
            apiClient: apiClient,
            localCache: localCache,
          ),
        ),
        RepositoryProvider<AiChatRepository>(
          create: (_) => AiChatRepository(apiClient: apiClient),
        ),
        RepositoryProvider<ParentNotificationsRepository>(
          create: (_) => ParentNotificationsRepository(),
        ),
        RepositoryProvider<TeacherRosterRepository>(
          create: (_) => TeacherRosterRepository(
            apiClient: apiClient,
            localCache: localCache,
          ),
        ),
        RepositoryProvider<SchoolsRepository>(
          create: (_) => SchoolsRepository(apiClient: apiClient),
        ),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider<ThemeCubit>(
            create: (_) => ThemeCubit(),
          ),
          BlocProvider<AuthBloc>(
            create: (context) => AuthBloc(
              authRepository: context.read<AuthRepository>(),
            ),
          ),
          BlocProvider<ParentReportsBloc>(
            create: (context) => ParentReportsBloc(
              repository: context.read<ParentReportsRepository>(),
            ),
          ),
          BlocProvider<AiChatBloc>(
            create: (context) => AiChatBloc(
              repository: context.read<AiChatRepository>(),
            ),
          ),
          BlocProvider<ParentNotificationsBloc>(
            create: (context) => ParentNotificationsBloc(
              repository: context.read<ParentNotificationsRepository>(),
            ),
          ),
          BlocProvider<TeacherRosterBloc>(
            create: (context) => TeacherRosterBloc(
              repository: context.read<TeacherRosterRepository>(),
            ),
          ),
          BlocProvider<SchoolsBloc>(
            create: (context) => SchoolsBloc(
              repository: context.read<SchoolsRepository>(),
            ),
          ),
        ],
        child: BlocBuilder<ThemeCubit, ThemeMode>(
          builder: (context, themeMode) {
            return MaterialApp.router(
              title: AppStrings.appName,
              debugShowCheckedModeBanner: false,
              theme: AppTheme.lightTheme,
              darkTheme: AppTheme.darkTheme,
              themeMode: themeMode,
              routerConfig: AppRouter.router,
            );
          },
        ),
      ),
    );
  }
}
