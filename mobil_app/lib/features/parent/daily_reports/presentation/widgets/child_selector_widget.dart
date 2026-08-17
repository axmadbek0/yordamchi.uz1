import 'package:flutter/material.dart';
import 'package:yordamchi_med/core/constants/app_colors.dart';
import 'package:yordamchi_med/core/constants/app_typography.dart';
import 'package:yordamchi_med/core/utils/haptic_helper.dart';
import 'package:yordamchi_med/features/parent/daily_reports/domain/models/daily_report_models.dart';

class ChildSelectorWidget extends StatelessWidget {
  final List<Student> children;
  final Student selectedChild;
  final ValueChanged<Student> onChildSelected;

  const ChildSelectorWidget({
    super.key,
    required this.children,
    required this.selectedChild,
    required this.onChildSelected,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (children.length <= 1) {
      return _buildSingleChildHeader(context, selectedChild, isDark);
    }

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceDark : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? AppColors.borderDark : AppColors.borderLight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.people_alt_outlined, size: 16, color: AppColors.primary),
              const SizedBox(width: 6),
              Text(
                "Farzandni tanlang:",
                style: AppTypography.bodySmall.copyWith(
                  fontWeight: FontWeight.w600,
                  color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: children.map((child) {
              final isSelected = child.id == selectedChild.id;
              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: Material(
                    color: isSelected
                        ? AppColors.primary
                        : (isDark ? AppColors.cardDark : AppColors.softBlueCard),
                    borderRadius: BorderRadius.circular(12),
                    child: InkWell(
                      onTap: () {
                        HapticHelper.selectionClick();
                        onChildSelected(child);
                      },
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
                        alignment: Alignment.center,
                        child: Column(
                          children: [
                            Text(
                              child.fullName,
                              style: AppTypography.titleSmall.copyWith(
                                color: isSelected
                                    ? Colors.white
                                    : (isDark
                                        ? AppColors.textPrimaryDark
                                        : AppColors.deepDark),
                                fontWeight:
                                    isSelected ? FontWeight.w700 : FontWeight.w600,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              child.className,
                              style: AppTypography.labelSmall.copyWith(
                                color: isSelected
                                    ? Colors.white.withAlpha(200)
                                    : AppColors.textMutedLight,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildSingleChildHeader(BuildContext context, Student child, bool isDark) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceDark : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? AppColors.borderDark : AppColors.borderLight,
        ),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 22,
            backgroundColor: AppColors.primary.withAlpha(25),
            child: const Icon(Icons.face_rounded, color: AppColors.primary, size: 26),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  child.fullName,
                  style: AppTypography.titleMedium.copyWith(
                    color: isDark ? AppColors.textPrimaryDark : AppColors.deepDark,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  "${child.className} • ${child.schoolNumber}-sonli maktab-internat",
                  style: AppTypography.bodySmall.copyWith(
                    color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
