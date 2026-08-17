import 'package:flutter/material.dart';
import 'package:yordamchi_med/core/constants/app_colors.dart';
import 'package:yordamchi_med/core/constants/app_typography.dart';
import 'package:yordamchi_med/core/utils/haptic_helper.dart';

enum ButtonVariant { primary, secondary, outline, text, danger }

class AppButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final ButtonVariant variant;
  final bool isLoading;
  final bool isFullWidth;
  final IconData? icon;
  final double height;
  final EdgeInsetsGeometry? padding;
  final double? fontSize;

  const AppButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.variant = ButtonVariant.primary,
    this.isLoading = false,
    this.isFullWidth = true,
    this.icon,
    this.height = 48,
    this.padding,
    this.fontSize,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Widget childContent = Row(
      mainAxisSize: isFullWidth ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (isLoading) ...[
          SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(
              strokeWidth: 2.0,
              valueColor: AlwaysStoppedAnimation<Color>(_getTextColor(isDark)),
            ),
          ),
          const SizedBox(width: 8),
        ] else if (icon != null) ...[
          Icon(icon, size: 18, color: _getTextColor(isDark)),
          const SizedBox(width: 6),
        ],
        Flexible(
          child: FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              text,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: AppTypography.labelLarge.copyWith(
                color: _getTextColor(isDark),
                fontWeight: FontWeight.w600,
                fontSize: fontSize ?? 13.5,
              ),
            ),
          ),
        ),
      ],
    );

    if (variant == ButtonVariant.text) {
      return TextButton(
        onPressed: isLoading ? null : _handleTap,
        style: TextButton.styleFrom(
          padding: padding ?? const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        ),
        child: childContent,
      );
    }

    return Container(
      width: isFullWidth ? double.infinity : null,
      height: height,
      decoration: BoxDecoration(
        gradient: variant == ButtonVariant.primary ? AppColors.primaryGradient : null,
        borderRadius: BorderRadius.circular(14),
        boxShadow: variant == ButtonVariant.primary
            ? [
                BoxShadow(
                  color: AppColors.primary.withAlpha(70),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ]
            : null,
      ),
      child: Material(
        color: _getBackgroundColor(isDark),
        borderRadius: BorderRadius.circular(14),
        child: InkWell(
          onTap: isLoading ? null : _handleTap,
          borderRadius: BorderRadius.circular(14),
          child: Container(
            padding: padding ?? const EdgeInsets.symmetric(horizontal: 10),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              border: _getBorder(isDark),
            ),
            alignment: Alignment.center,
            child: childContent,
          ),
        ),
      ),
    );
  }

  void _handleTap() {
    if (onPressed != null) {
      HapticHelper.lightImpact();
      onPressed!();
    }
  }

  Color _getBackgroundColor(bool isDark) {
    switch (variant) {
      case ButtonVariant.primary:
        return Colors.transparent;
      case ButtonVariant.secondary:
        return isDark ? AppColors.surfaceDark : AppColors.softBlueCard;
      case ButtonVariant.outline:
        return Colors.transparent;
      case ButtonVariant.danger:
        return AppColors.danger;
      case ButtonVariant.text:
        return Colors.transparent;
    }
  }

  Color _getTextColor(bool isDark) {
    switch (variant) {
      case ButtonVariant.primary:
      case ButtonVariant.danger:
        return Colors.white;
      case ButtonVariant.secondary:
        return isDark ? AppColors.primaryLight : AppColors.primary;
      case ButtonVariant.outline:
        return isDark ? AppColors.primaryLight : AppColors.primary;
      case ButtonVariant.text:
        return AppColors.primary;
    }
  }

  Border? _getBorder(bool isDark) {
    if (variant == ButtonVariant.outline) {
      return Border.all(
        color: isDark ? AppColors.borderDark : AppColors.borderLight,
        width: 1.5,
      );
    }
    return null;
  }
}
