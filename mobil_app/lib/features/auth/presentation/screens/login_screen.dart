import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:yordamchi_med/core/constants/app_colors.dart';
import 'package:yordamchi_med/core/constants/app_strings.dart';
import 'package:yordamchi_med/core/constants/app_typography.dart';
import 'package:yordamchi_med/core/utils/haptic_helper.dart';
import 'package:yordamchi_med/core/widgets/app_button.dart';
import 'package:yordamchi_med/core/widgets/app_text_field.dart';
import 'package:yordamchi_med/features/auth/domain/models/user_model.dart';
import 'package:yordamchi_med/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:yordamchi_med/features/auth/presentation/bloc/auth_event.dart';
import 'package:yordamchi_med/features/auth/presentation/bloc/auth_state.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _schoolController = TextEditingController(text: '12');
  final _loginController = TextEditingController();
  final _passwordController = TextEditingController();

  UserRole _selectedRole = UserRole.parent;
  bool _obscurePassword = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _setQuickFill(UserRole.parent);
  }

  void _setQuickFill(UserRole role) {
    setState(() {
      _selectedRole = role;
      _schoolController.text = '12';
      if (role == UserRole.parent) {
        _loginController.text = '12_001';
        _passwordController.text = 'parent123';
      } else {
        _loginController.text = 'teacher_12';
        _passwordController.text = 'teacher123';
      }
      _errorMessage = null;
    });
  }

  void _submitLogin() {
    final schoolNum = int.tryParse(_schoolController.text.trim());
    final login = _loginController.text.trim();
    final password = _passwordController.text;

    if (schoolNum == null || schoolNum <= 0) {
      setState(() => _errorMessage = "To'g'ri maktab raqamini kiriting (masalan: 12)");
      return;
    }
    if (login.isEmpty) {
      setState(() => _errorMessage = "Login maydonini to'ldiring");
      return;
    }
    if (password.isEmpty) {
      setState(() => _errorMessage = "Parol maydonini to'ldiring");
      return;
    }

    setState(() => _errorMessage = null);
    context.read<AuthBloc>().add(
          AuthLoginSubmitted(
            schoolNumber: schoolNum,
            login: login,
            password: password,
            role: _selectedRole,
          ),
        );
  }

  @override
  void dispose() {
    _schoolController.dispose();
    _loginController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return BlocConsumer<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is Authenticated) {
          HapticHelper.successVibration();
          if (state.user.role == UserRole.parent) {
            context.go('/parent/reports');
          } else {
            context.go('/teacher/roster');
          }
        } else if (state is AuthFailure) {
          HapticHelper.errorVibration();
          setState(() {
            _errorMessage = state.message;
          });
        }
      },
      builder: (context, state) {
        final isLoading = state is AuthLoading;

        return Scaffold(
          body: SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Header Logo & Branding
                    Center(
                      child: Container(
                        width: 72,
                        height: 72,
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withAlpha(80),
                              blurRadius: 20,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.favorite_rounded,
                          size: 38,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      AppStrings.appName,
                      textAlign: TextAlign.center,
                      style: AppTypography.displayMedium.copyWith(
                        color: isDark ? AppColors.textPrimaryDark : AppColors.deepDark,
                        fontSize: 24,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      AppStrings.loginSubtitle,
                      textAlign: TextAlign.center,
                      style: AppTypography.bodyMedium.copyWith(
                        color: isDark
                            ? AppColors.textSecondaryDark
                            : AppColors.textSecondaryLight,
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Role Switcher Toggle
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: isDark ? AppColors.surfaceDark : AppColors.softBlueCard,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isDark ? AppColors.borderDark : AppColors.borderLight,
                        ),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: _RoleTabButton(
                              title: AppStrings.roleParent,
                              icon: Icons.family_restroom_rounded,
                              isSelected: _selectedRole == UserRole.parent,
                              onTap: () {
                                _setQuickFill(UserRole.parent);
                                HapticHelper.selectionClick();
                              },
                            ),
                          ),
                          Expanded(
                            child: _RoleTabButton(
                              title: AppStrings.roleTeacher,
                              icon: Icons.school_rounded,
                              isSelected: _selectedRole == UserRole.teacher,
                              onTap: () {
                                _setQuickFill(UserRole.teacher);
                                HapticHelper.selectionClick();
                              },
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Error Box if any
                    if (_errorMessage != null) ...[
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.danger.withAlpha(20),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.danger.withAlpha(80)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.error_outline_rounded,
                                color: AppColors.danger, size: 20),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                _errorMessage!,
                                style: AppTypography.bodySmall.copyWith(
                                  color: AppColors.danger,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 14),
                    ],

                    // Input Fields
                    AppTextField(
                      controller: _schoolController,
                      label: AppStrings.schoolNumber,
                      hint: AppStrings.schoolNumberHint,
                      keyboardType: TextInputType.number,
                      prefixIcon: const Icon(Icons.apartment_rounded,
                          color: AppColors.primary, size: 20),
                    ),
                    const SizedBox(height: 14),

                    AppTextField(
                      controller: _loginController,
                      label: AppStrings.loginField,
                      hint: AppStrings.loginFieldHint,
                      prefixIcon: const Icon(Icons.person_outline_rounded,
                          color: AppColors.primary, size: 20),
                    ),
                    const SizedBox(height: 14),

                    AppTextField(
                      controller: _passwordController,
                      label: AppStrings.passwordField,
                      hint: AppStrings.passwordFieldHint,
                      obscureText: _obscurePassword,
                      prefixIcon: const Icon(Icons.lock_outline_rounded,
                          color: AppColors.primary, size: 20),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePassword
                              ? Icons.visibility_outlined
                              : Icons.visibility_off_outlined,
                          color: AppColors.textMutedLight,
                          size: 20,
                        ),
                        onPressed: () {
                          setState(() {
                            _obscurePassword = !_obscurePassword;
                          });
                        },
                      ),
                    ),
                    const SizedBox(height: 22),

                    // Submit Button
                    AppButton(
                      text: AppStrings.signInButton,
                      isLoading: isLoading,
                      icon: Icons.login_rounded,
                      onPressed: _submitLogin,
                    ),
                    const SizedBox(height: 24),

                    // Quick Fill Demo Section
                    Row(
                      children: [
                        Expanded(
                          child: Divider(
                            color: isDark
                                ? AppColors.borderDark
                                : AppColors.borderLight,
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 10),
                          child: Text(
                            "Tezkor Demo Sinov",
                            style: AppTypography.bodySmall.copyWith(
                              color: AppColors.textMutedLight,
                              fontWeight: FontWeight.w600,
                              fontSize: 12,
                            ),
                          ),
                        ),
                        Expanded(
                          child: Divider(
                            color: isDark
                                ? AppColors.borderDark
                                : AppColors.borderLight,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),

                    // Responsive Demo Buttons
                    LayoutBuilder(
                      builder: (context, constraints) {
                        if (constraints.maxWidth < 280) {
                          return Column(
                            children: [
                              AppButton(
                                text: AppStrings.quickFillParent,
                                icon: Icons.face_rounded,
                                variant: ButtonVariant.secondary,
                                height: 40,
                                padding: const EdgeInsets.symmetric(horizontal: 10),
                                fontSize: 12.5,
                                onPressed: () {
                                  _setQuickFill(UserRole.parent);
                                  HapticHelper.lightImpact();
                                },
                              ),
                              const SizedBox(height: 8),
                              AppButton(
                                text: AppStrings.quickFillTeacher,
                                icon: Icons.badge_outlined,
                                variant: ButtonVariant.secondary,
                                height: 40,
                                padding: const EdgeInsets.symmetric(horizontal: 10),
                                fontSize: 12.5,
                                onPressed: () {
                                  _setQuickFill(UserRole.teacher);
                                  HapticHelper.lightImpact();
                                },
                              ),
                            ],
                          );
                        }

                        return Row(
                          children: [
                            Expanded(
                              child: AppButton(
                                text: AppStrings.quickFillParent,
                                icon: Icons.face_rounded,
                                variant: ButtonVariant.secondary,
                                height: 40,
                                padding: const EdgeInsets.symmetric(horizontal: 8),
                                fontSize: 12.5,
                                onPressed: () {
                                  _setQuickFill(UserRole.parent);
                                  HapticHelper.lightImpact();
                                },
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: AppButton(
                                text: AppStrings.quickFillTeacher,
                                icon: Icons.badge_outlined,
                                variant: ButtonVariant.secondary,
                                height: 40,
                                padding: const EdgeInsets.symmetric(horizontal: 8),
                                fontSize: 12.5,
                                onPressed: () {
                                  _setQuickFill(UserRole.teacher);
                                  HapticHelper.lightImpact();
                                },
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

class _RoleTabButton extends StatelessWidget {
  final String title;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _RoleTabButton({
    required this.title,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Material(
      color: isSelected
          ? (isDark ? AppColors.primary : Colors.white)
          : Colors.transparent,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: Colors.black.withAlpha(15),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 18,
                color: isSelected
                    ? Colors.white
                    : (isDark
                        ? AppColors.textSecondaryDark
                        : AppColors.textSecondaryLight),
              ),
              const SizedBox(width: 6),
              Flexible(
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTypography.titleSmall.copyWith(
                      color: isSelected
                          ? Colors.white
                          : (isDark ? AppColors.textPrimaryDark : AppColors.deepDark),
                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                      fontSize: 13,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
