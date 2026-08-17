import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:yordamchi_med/core/constants/app_colors.dart';
import 'package:yordamchi_med/core/constants/app_typography.dart';
import 'package:yordamchi_med/core/theme/theme_cubit.dart';
import 'package:yordamchi_med/core/utils/haptic_helper.dart';
import 'package:yordamchi_med/core/widgets/app_button.dart';
import 'package:yordamchi_med/core/widgets/custom_app_bar.dart';
import 'package:yordamchi_med/core/widgets/glass_card.dart';
import 'package:yordamchi_med/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:yordamchi_med/features/auth/presentation/bloc/auth_event.dart';
import 'package:yordamchi_med/features/auth/presentation/bloc/auth_state.dart';

class TeacherProfileScreen extends StatefulWidget {
  const TeacherProfileScreen({super.key});

  @override
  State<TeacherProfileScreen> createState() => _TeacherProfileScreenState();
}

class _TeacherProfileScreenState extends State<TeacherProfileScreen> {
  bool _pushNotifications = true;

  void _showLogoutDialog() {
    HapticHelper.lightImpact();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text("Tizimdan chiqish"),
        content: const Text("Haqiqatan ham hisobingizdan chiqmoqchimisiz?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text("Bekor qilish"),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
            onPressed: () {
              Navigator.of(ctx).pop();
              context.read<AuthBloc>().add(AuthLogoutRequested());
              context.go('/login');
            },
            child: const Text("Chiqish", style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: const CustomAppBar(
        title: "O'qituvchi Profili",
        subtitle: "Shaxsiy kabinet va tizim sozlamalari",
        showBackButton: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            BlocBuilder<AuthBloc, AuthState>(
              builder: (context, state) {
                final user = (state is Authenticated) ? state.user : null;
                final name = user?.fullName ?? "Rustam Ahmedov";
                final login = user?.login ?? "teacher_12";
                final schoolNum = user?.schoolNumber ?? 12;

                return GlassCard(
                  padding: const EdgeInsets.all(18),
                  child: Row(
                    children: [
                      Container(
                        width: 60,
                        height: 60,
                        decoration: const BoxDecoration(
                          gradient: AppColors.emeraldGradient,
                          shape: BoxShape.circle,
                        ),
                        child: const Center(
                          child: Icon(Icons.school_rounded,
                              color: Colors.white, size: 30),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              name,
                              style: AppTypography.titleMedium.copyWith(
                                color: isDark
                                    ? AppColors.textPrimaryDark
                                    : AppColors.deepDark,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              "Login: $login • 4-A sinf rahbari",
                              style: AppTypography.bodySmall.copyWith(
                                color: isDark
                                    ? AppColors.textSecondaryDark
                                    : AppColors.textSecondaryLight,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              "$schoolNum-sonli maxsus maktab-internat",
                              style: AppTypography.bodySmall.copyWith(
                                color: AppColors.primary,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
            const SizedBox(height: 20),

            Text(
              "Ilova Sozlamalari",
              style: AppTypography.titleSmall.copyWith(
                color: isDark ? AppColors.textPrimaryDark : AppColors.deepDark,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 10),

            GlassCard(
              padding: EdgeInsets.zero,
              child: Column(
                children: [
                  SwitchListTile(
                    title: Text("Tungi rejim (Dark Mode)",
                        style: AppTypography.bodyMedium),
                    subtitle: Text("Qorong'i mavzuni yoqish",
                        style: AppTypography.bodySmall),
                    value: isDark,
                    onChanged: (val) {
                      HapticHelper.selectionClick();
                      context.read<ThemeCubit>().setDarkMode(val);
                    },
                  ),
                  const Divider(height: 1),
                  SwitchListTile(
                    title: Text("Ota-onalar javoblari xabarnomasi",
                        style: AppTypography.bodyMedium),
                    subtitle: Text("Har bir ota-ona javob berganda push-bildirishnoma",
                        style: AppTypography.bodySmall),
                    value: _pushNotifications,
                    onChanged: (val) {
                      HapticHelper.selectionClick();
                      setState(() => _pushNotifications = val);
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            AppButton(
              text: "Hisobdan chiqish",
              icon: Icons.logout_rounded,
              variant: ButtonVariant.danger,
              onPressed: _showLogoutDialog,
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }
}
