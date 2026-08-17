import 'package:flutter/material.dart';
import 'package:yordamchi_med/core/constants/app_typography.dart';
import 'package:yordamchi_med/features/parent/daily_reports/domain/models/daily_report_models.dart';

class MoodBadgeWidget extends StatelessWidget {
  final MoodType mood;
  final bool isLarge;

  const MoodBadgeWidget({
    super.key,
    required this.mood,
    this.isLarge = false,
  });

  @override
  Widget build(BuildContext context) {
    final color = Color(mood.colorValue);

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isLarge ? 14 : 10,
        vertical: isLarge ? 8 : 4,
      ),
      decoration: BoxDecoration(
        color: color.withAlpha(25),
        borderRadius: BorderRadius.circular(isLarge ? 12 : 8),
        border: Border.all(color: color.withAlpha(80), width: 1),
      ),
      child: Text(
        mood.label,
        style: (isLarge ? AppTypography.titleSmall : AppTypography.labelSmall).copyWith(
          color: color,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class HealthBadgeWidget extends StatelessWidget {
  final HealthType health;
  final bool isLarge;

  const HealthBadgeWidget({
    super.key,
    required this.health,
    this.isLarge = false,
  });

  @override
  Widget build(BuildContext context) {
    final color = Color(health.colorValue);

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isLarge ? 14 : 10,
        vertical: isLarge ? 8 : 4,
      ),
      decoration: BoxDecoration(
        color: color.withAlpha(25),
        borderRadius: BorderRadius.circular(isLarge ? 12 : 8),
        border: Border.all(color: color.withAlpha(80), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            health == HealthType.soglom
                ? Icons.check_circle_outline_rounded
                : (health == HealthType.yengilBezovta
                    ? Icons.help_outline_rounded
                    : Icons.healing_rounded),
            size: isLarge ? 16 : 13,
            color: color,
          ),
          const SizedBox(width: 5),
          Text(
            health.label,
            style: (isLarge ? AppTypography.titleSmall : AppTypography.labelSmall).copyWith(
              color: color,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}
