import 'package:flutter/material.dart';
import 'package:yordamchi_med/core/constants/app_typography.dart';

class BadgeChip extends StatelessWidget {
  final String label;
  final Color color;
  final IconData? icon;
  final bool isFilled;

  const BadgeChip({
    super.key,
    required this.label,
    required this.color,
    this.icon,
    this.isFilled = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: isFilled ? color : color.withAlpha(25),
        borderRadius: BorderRadius.circular(8),
        border: isFilled ? null : Border.all(color: color.withAlpha(80), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 14, color: isFilled ? Colors.white : color),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: AppTypography.labelSmall.copyWith(
              color: isFilled ? Colors.white : color,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}
