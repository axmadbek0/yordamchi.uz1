import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:yordamchi_med/core/constants/app_colors.dart';
import 'package:yordamchi_med/core/constants/app_typography.dart';
import 'package:yordamchi_med/core/utils/haptic_helper.dart';
import 'package:yordamchi_med/core/widgets/app_button.dart';
import 'package:yordamchi_med/features/teacher/class_roster/domain/models/student_roster_item.dart';

class CredentialsCreatedDialog extends StatelessWidget {
  final StudentRosterItem student;

  const CredentialsCreatedDialog({super.key, required this.student});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    void copyToClipboard() {
      HapticHelper.successVibration();
      final text =
          "Yordamchi Med - Ota-ona kabineti kirish ma'lumotlari:\nO'quvchi: ${student.fullName}\nMaktab: 12-sonli maktab-internat\nLogin: ${student.parentLogin}\nParol: ${student.parentPassword}\nIlova orqali kiring.";
      Clipboard.setData(ClipboardData(text: text));
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Login va parol nusxalandi! Ota-onaga yuborishingiz mumkin."),
          backgroundColor: AppColors.success,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      backgroundColor: isDark ? AppColors.surfaceDark : Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: const BoxDecoration(
                color: AppColors.softGreenCard,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_circle_rounded,
                  color: AppColors.success, size: 36),
            ),
            const SizedBox(height: 16),
            Text(
              "O'quvchi muvaffaqiyatli qo'shildi!",
              textAlign: TextAlign.center,
              style: AppTypography.titleMedium.copyWith(
                color: isDark ? AppColors.textPrimaryDark : AppColors.deepDark,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              "Ota-ona uchun unikal login va parol generatsiya qilindi:",
              textAlign: TextAlign.center,
              style: AppTypography.bodySmall.copyWith(
                color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
              ),
            ),
            const SizedBox(height: 20),

            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? AppColors.cardDark : AppColors.softBlueCard,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isDark ? AppColors.borderDark : AppColors.borderLight,
                ),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text("O'quvchi:", style: AppTypography.bodySmall),
                      Text(student.fullName,
                          style: AppTypography.titleSmall.copyWith(
                            color: isDark ? AppColors.textPrimaryDark : AppColors.deepDark,
                          )),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Divider(height: 1),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text("Ota-ona Logini:", style: AppTypography.bodySmall),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withAlpha(25),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          student.parentLogin,
                          style: AppTypography.titleSmall.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w800,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text("Parol:", style: AppTypography.bodySmall),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.coral.withAlpha(25),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          student.parentPassword,
                          style: AppTypography.titleSmall.copyWith(
                            color: AppColors.coral,
                            fontWeight: FontWeight.w800,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            Row(
              children: [
                Expanded(
                  child: AppButton(
                    text: "Nusxalash",
                    icon: Icons.copy_rounded,
                    variant: ButtonVariant.secondary,
                    onPressed: copyToClipboard,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: AppButton(
                    text: "Tushunarli",
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
