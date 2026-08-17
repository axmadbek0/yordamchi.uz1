import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:yordamchi_med/features/auth/presentation/screens/login_screen.dart';
import 'package:yordamchi_med/features/auth/presentation/screens/splash_screen.dart';
import 'package:yordamchi_med/features/parent/ai_chat/presentation/screens/parent_ai_chat_screen.dart';
import 'package:yordamchi_med/features/parent/daily_reports/presentation/screens/parent_reports_screen.dart';
import 'package:yordamchi_med/features/parent/live_cameras/presentation/screens/camera_grid_screen.dart';
import 'package:yordamchi_med/features/parent/notifications/presentation/screens/parent_notifications_screen.dart';
import 'package:yordamchi_med/features/parent/profile/presentation/screens/parent_profile_screen.dart';
import 'package:yordamchi_med/features/schools_directory/presentation/screens/schools_map_screen.dart';
import 'package:yordamchi_med/features/teacher/alerts_dispatcher/presentation/screens/send_alert_screen.dart';
import 'package:yordamchi_med/features/teacher/class_roster/presentation/screens/teacher_roster_screen.dart';
import 'package:yordamchi_med/features/teacher/daily_entry/presentation/screens/daily_log_entry_screen.dart';
import 'package:yordamchi_med/features/teacher/profile/presentation/screens/teacher_profile_screen.dart';
import 'package:yordamchi_med/features/teacher/statistics/presentation/screens/teacher_stats_screen.dart';
import 'package:yordamchi_med/main_shell.dart';

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>();
final GlobalKey<NavigatorState> _parentReportsNavKey = GlobalKey<NavigatorState>();
final GlobalKey<NavigatorState> _parentAiNavKey = GlobalKey<NavigatorState>();
final GlobalKey<NavigatorState> _parentCamNavKey = GlobalKey<NavigatorState>();
final GlobalKey<NavigatorState> _parentSchoolsNavKey = GlobalKey<NavigatorState>();
final GlobalKey<NavigatorState> _parentProfileNavKey = GlobalKey<NavigatorState>();

final GlobalKey<NavigatorState> _teacherRosterNavKey = GlobalKey<NavigatorState>();
final GlobalKey<NavigatorState> _teacherEntryNavKey = GlobalKey<NavigatorState>();
final GlobalKey<NavigatorState> _teacherAlertNavKey = GlobalKey<NavigatorState>();
final GlobalKey<NavigatorState> _teacherStatsNavKey = GlobalKey<NavigatorState>();
final GlobalKey<NavigatorState> _teacherProfileNavKey = GlobalKey<NavigatorState>();

class AppRouter {
  static final GoRouter router = GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/splash',
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),

      // Parent Navigation Shell
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return MainShell(
            navigationShell: navigationShell,
            isTeacher: false,
          );
        },
        branches: [
          StatefulShellBranch(
            navigatorKey: _parentReportsNavKey,
            routes: [
              GoRoute(
                path: '/parent/reports',
                builder: (context, state) => const ParentReportsScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            navigatorKey: _parentAiNavKey,
            routes: [
              GoRoute(
                path: '/parent/ai-chat',
                builder: (context, state) => const ParentAiChatScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            navigatorKey: _parentCamNavKey,
            routes: [
              GoRoute(
                path: '/parent/cameras',
                builder: (context, state) => const CameraGridScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            navigatorKey: _parentSchoolsNavKey,
            routes: [
              GoRoute(
                path: '/parent/schools',
                builder: (context, state) => const SchoolsMapScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            navigatorKey: _parentProfileNavKey,
            routes: [
              GoRoute(
                path: '/parent/profile',
                builder: (context, state) => const ParentProfileScreen(),
              ),
            ],
          ),
        ],
      ),

      // Teacher Navigation Shell
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return MainShell(
            navigationShell: navigationShell,
            isTeacher: true,
          );
        },
        branches: [
          StatefulShellBranch(
            navigatorKey: _teacherRosterNavKey,
            routes: [
              GoRoute(
                path: '/teacher/roster',
                builder: (context, state) => const TeacherRosterScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            navigatorKey: _teacherEntryNavKey,
            routes: [
              GoRoute(
                path: '/teacher/daily-entry',
                builder: (context, state) => const DailyLogEntryScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            navigatorKey: _teacherAlertNavKey,
            routes: [
              GoRoute(
                path: '/teacher/send-alert',
                builder: (context, state) => const SendAlertScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            navigatorKey: _teacherStatsNavKey,
            routes: [
              GoRoute(
                path: '/teacher/stats',
                builder: (context, state) => const TeacherStatsScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            navigatorKey: _teacherProfileNavKey,
            routes: [
              GoRoute(
                path: '/teacher/profile',
                builder: (context, state) => const TeacherProfileScreen(),
              ),
            ],
          ),
        ],
      ),

      // Direct Standalone Routes
      GoRoute(
        path: '/parent/notifications',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const ParentNotificationsScreen(),
      ),
    ],
  );
}
