import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import 'package:yordamchi_med/core/constants/app_colors.dart';

class ShimmerLoadingView extends StatelessWidget {
  final int itemCount;
  final double itemHeight;

  const ShimmerLoadingView({
    super.key,
    this.itemCount = 3,
    this.itemHeight = 120,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: itemCount,
      separatorBuilder: (_, _) => const SizedBox(height: 14),
      itemBuilder: (context, index) {
        return Shimmer.fromColors(
          baseColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0),
          highlightColor: isDark ? const Color(0xFF334155) : const Color(0xFFF8FAFC),
          child: Container(
            height: itemHeight,
            decoration: BoxDecoration(
              color: isDark ? AppColors.surfaceDark : Colors.white,
              borderRadius: BorderRadius.circular(18),
            ),
          ),
        );
      },
    );
  }
}
