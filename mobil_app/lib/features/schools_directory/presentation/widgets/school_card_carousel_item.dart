import 'package:flutter/material.dart';
import 'package:yordamchi_med/core/constants/app_colors.dart';
import 'package:yordamchi_med/core/constants/app_typography.dart';
import 'package:yordamchi_med/core/utils/distance_calculator.dart';
import 'package:yordamchi_med/core/utils/haptic_helper.dart';
import 'package:yordamchi_med/features/schools_directory/domain/models/school_model.dart';

class SchoolCardCarouselItem extends StatelessWidget {
  final SchoolModel school;
  final bool isSelected;
  final VoidCallback onTap;
  final VoidCallback onDetailTap;

  const SchoolCardCarouselItem({
    super.key,
    required this.school,
    this.isSelected = false,
    required this.onTap,
    required this.onDetailTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      width: 290,
      margin: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isSelected ? AppColors.primary : (isDark ? AppColors.borderDark : AppColors.borderLight),
          width: isSelected ? 2 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: isSelected
                ? AppColors.primary.withAlpha(50)
                : Colors.black.withAlpha(isDark ? 40 : 15),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(18),
        child: InkWell(
          onTap: () {
            HapticHelper.selectionClick();
            onTap();
          },
          borderRadius: BorderRadius.circular(18),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withAlpha(20),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        "${school.number}-sonli maktab",
                        style: AppTypography.labelSmall.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    if (school.distanceKm != null)
                      Text(
                        DistanceCalculator.formatDistance(school.distanceKm!),
                        style: AppTypography.labelSmall.copyWith(
                          color: AppColors.coral,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  school.name,
                  style: AppTypography.titleSmall.copyWith(
                    color: isDark ? AppColors.textPrimaryDark : AppColors.deepDark,
                    fontWeight: FontWeight.w700,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  "${school.district}, ${school.region}",
                  style: AppTypography.bodySmall.copyWith(
                    color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                    fontSize: 11,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "${school.studentCount} o'quvchi • ${school.teacherCount} o'qituvchi",
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.textMutedLight,
                        fontSize: 10,
                      ),
                    ),
                    InkWell(
                      onTap: () {
                        HapticHelper.lightImpact();
                        onDetailTap();
                      },
                      child: Row(
                        children: [
                          Text(
                            "Batafsil",
                            style: AppTypography.labelSmall.copyWith(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const Icon(
                            Icons.arrow_forward_ios_rounded,
                            size: 10,
                            color: AppColors.primary,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
