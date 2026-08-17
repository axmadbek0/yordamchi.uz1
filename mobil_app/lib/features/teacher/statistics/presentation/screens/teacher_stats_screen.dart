import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:yordamchi_med/core/constants/app_colors.dart';
import 'package:yordamchi_med/core/constants/app_strings.dart';
import 'package:yordamchi_med/core/constants/app_typography.dart';
import 'package:yordamchi_med/core/widgets/custom_app_bar.dart';
import 'package:yordamchi_med/core/widgets/glass_card.dart';

class TeacherStatsScreen extends StatelessWidget {
  const TeacherStatsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: const CustomAppBar(
        title: AppStrings.statsTitle,
        subtitle: "4-A sinf monitoring va rivojlanish ko'rsatkichlari",
        showBackButton: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: _StatMetricCard(
                    title: "Jami o'quvchilar",
                    value: "16 nafar",
                    icon: Icons.people_outline_rounded,
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _StatMetricCard(
                    title: "Bugungi davomat",
                    value: "100%",
                    icon: Icons.check_circle_outline_rounded,
                    color: AppColors.success,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: _StatMetricCard(
                    title: "O'rtacha kayfiyat",
                    value: "4.6 / 5.0",
                    icon: Icons.sentiment_very_satisfied_rounded,
                    color: AppColors.warningDark,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _StatMetricCard(
                    title: "AI tavsiyalar",
                    value: "28 ta",
                    icon: Icons.auto_awesome_rounded,
                    color: const Color(0xFF6D28D9),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            GlassCard(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Sinfdagi umumiy kayfiyat taqsimoti",
                    style: AppTypography.titleSmall.copyWith(
                      color: isDark ? AppColors.textPrimaryDark : AppColors.deepDark,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    "O'quvchilarning so'nggi 30 kunlik ko'rsatkichi",
                    style: AppTypography.bodySmall.copyWith(
                      color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                    ),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    height: 160,
                    child: PieChart(
                      PieChartData(
                        sectionsSpace: 4,
                        centerSpaceRadius: 40,
                        sections: [
                          PieChartSectionData(
                            value: 65,
                            title: '65%',
                            color: AppColors.success,
                            radius: 35,
                            titleStyle: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                          PieChartSectionData(
                            value: 20,
                            title: '20%',
                            color: AppColors.primary,
                            radius: 35,
                            titleStyle: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                          PieChartSectionData(
                            value: 10,
                            title: '10%',
                            color: AppColors.warning,
                            radius: 35,
                            titleStyle: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                          PieChartSectionData(
                            value: 5,
                            title: '5%',
                            color: AppColors.coral,
                            radius: 35,
                            titleStyle: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _LegendItem(label: "Xursand (65%)", color: AppColors.success),
                      _LegendItem(label: "Oddiy (20%)", color: AppColors.primary),
                      _LegendItem(label: "Tashvishli (10%)", color: AppColors.warning),
                      _LegendItem(label: "Charchagan (5%)", color: AppColors.coral),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

class _StatMetricCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _StatMetricCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withAlpha(20),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: AppTypography.titleLarge.copyWith(
              color: isDark ? AppColors.textPrimaryDark : AppColors.deepDark,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            title,
            style: AppTypography.bodySmall.copyWith(
              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
              fontSize: 11,
            ),
          ),
        ],
      ),
    );
  }
}

class _LegendItem extends StatelessWidget {
  final String label;
  final Color color;

  const _LegendItem({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600),
        ),
      ],
    );
  }
}
