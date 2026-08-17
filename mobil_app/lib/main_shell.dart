import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:yordamchi_med/core/constants/app_colors.dart';
import 'package:yordamchi_med/core/constants/app_typography.dart';
import 'package:yordamchi_med/core/utils/haptic_helper.dart';
import 'package:yordamchi_med/features/auth/domain/models/user_model.dart';
import 'package:yordamchi_med/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:yordamchi_med/features/auth/presentation/bloc/auth_state.dart';

class MainShell extends StatelessWidget {
  final StatefulNavigationShell navigationShell;
  final bool? isTeacher;

  const MainShell({
    super.key,
    required this.navigationShell,
    this.isTeacher,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, authState) {
        final isParent = isTeacher != null
            ? !isTeacher!
            : ((authState is Authenticated)
                ? authState.user.role == UserRole.parent
                : true);

        final parentItems = [
          const BottomNavigationBarItem(
            icon: Icon(Icons.calendar_today_rounded),
            activeIcon: Icon(Icons.calendar_month_rounded),
            label: "Kundalik",
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.auto_awesome_outlined),
            activeIcon: Icon(Icons.auto_awesome_rounded),
            label: "AI Chat",
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.videocam_outlined),
            activeIcon: Icon(Icons.videocam_rounded),
            label: "Kameralar",
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.map_outlined),
            activeIcon: Icon(Icons.map_rounded),
            label: "Maktablar",
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.person_outline_rounded),
            activeIcon: Icon(Icons.person_rounded),
            label: "Profil",
          ),
        ];

        final teacherItems = [
          const BottomNavigationBarItem(
            icon: Icon(Icons.people_outline_rounded),
            activeIcon: Icon(Icons.people_alt_rounded),
            label: "Sinf",
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.edit_note_rounded),
            activeIcon: Icon(Icons.edit_note_rounded),
            label: "Qayd",
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.campaign_outlined),
            activeIcon: Icon(Icons.campaign_rounded),
            label: "Xabarnoma",
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.bar_chart_rounded),
            activeIcon: Icon(Icons.bar_chart_rounded),
            label: "Statistika",
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.person_outline_rounded),
            activeIcon: Icon(Icons.person_rounded),
            label: "Profil",
          ),
        ];

        return Scaffold(
          body: navigationShell,
          bottomNavigationBar: Container(
            decoration: BoxDecoration(
              color: isDark ? AppColors.surfaceDark : Colors.white,
              border: Border(
                top: BorderSide(
                  color: isDark ? AppColors.borderDark : AppColors.borderLight,
                  width: 1,
                ),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(isDark ? 50 : 10),
                  blurRadius: 16,
                  offset: const Offset(0, -4),
                ),
              ],
            ),
            child: BottomNavigationBar(
              currentIndex: navigationShell.currentIndex,
              onTap: (index) {
                HapticHelper.selectionClick();
                navigationShell.goBranch(
                  index,
                  initialLocation: index == navigationShell.currentIndex,
                );
              },
              type: BottomNavigationBarType.fixed,
              backgroundColor: Colors.transparent,
              elevation: 0,
              selectedItemColor: AppColors.primary,
              unselectedItemColor:
                  isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
              selectedLabelStyle: AppTypography.labelSmall.copyWith(
                fontWeight: FontWeight.w700,
                fontSize: 10.5,
              ),
              unselectedLabelStyle: AppTypography.labelSmall.copyWith(
                fontWeight: FontWeight.w500,
                fontSize: 10,
              ),
              items: isParent ? parentItems : teacherItems,
            ),
          ),
        );
      },
    );
  }
}
