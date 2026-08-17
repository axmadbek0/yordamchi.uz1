import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:yordamchi_med/core/constants/app_colors.dart';
import 'package:yordamchi_med/core/constants/app_strings.dart';
import 'package:yordamchi_med/core/constants/app_typography.dart';
import 'package:yordamchi_med/core/utils/date_formatter.dart';
import 'package:yordamchi_med/core/utils/haptic_helper.dart';
import 'package:yordamchi_med/core/widgets/custom_app_bar.dart';
import 'package:yordamchi_med/core/widgets/glass_card.dart';
import 'package:yordamchi_med/core/widgets/state_views/error_state_view.dart';
import 'package:yordamchi_med/core/widgets/state_views/shimmer_loading_view.dart';
import 'package:yordamchi_med/features/parent/daily_reports/presentation/bloc/parent_reports_bloc.dart';
import 'package:yordamchi_med/features/parent/daily_reports/presentation/widgets/ai_analysis_card.dart';
import 'package:yordamchi_med/features/parent/daily_reports/presentation/widgets/child_selector_widget.dart';
import 'package:yordamchi_med/features/parent/daily_reports/presentation/widgets/mood_badge_widget.dart';
import 'package:yordamchi_med/features/parent/daily_reports/presentation/widgets/mood_chart_widget.dart';

class ParentReportsScreen extends StatefulWidget {
  const ParentReportsScreen({super.key});

  @override
  State<ParentReportsScreen> createState() => _ParentReportsScreenState();
}

class _ParentReportsScreenState extends State<ParentReportsScreen> {
  @override
  void initState() {
    super.initState();
    context.read<ParentReportsBloc>().add(LoadParentReports());
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: CustomAppBar(
        title: AppStrings.parentReportsTitle,
        subtitle: DateFormatter.formatUzbekDate(DateTime.now()),
        showBackButton: false,
        actions: [
          IconButton(
            icon: Stack(
              children: [
                Icon(
                  Icons.notifications_none_rounded,
                  color: isDark ? AppColors.textPrimaryDark : AppColors.deepDark,
                  size: 24,
                ),
                Positioned(
                  right: 2,
                  top: 2,
                  child: Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: AppColors.coral,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
              ],
            ),
            onPressed: () {
              HapticHelper.lightImpact();
              context.push('/parent/notifications');
            },
          ),
        ],
      ),
      body: BlocBuilder<ParentReportsBloc, ParentReportsState>(
        builder: (context, state) {
          if (state is ParentReportsLoading) {
            return const ShimmerLoadingView(itemCount: 4);
          }

          if (state is ParentReportsError) {
            return ErrorStateView(
              message: state.message,
              onRetry: () {
                context.read<ParentReportsBloc>().add(LoadParentReports());
              },
            );
          }

          if (state is ParentReportsLoaded) {
            final report = state.todayReport;
            final selectedChild = state.selectedChild;

            return RefreshIndicator(
              onRefresh: () async {
                HapticHelper.lightImpact();
                context.read<ParentReportsBloc>().add(RefreshTodayReport());
              },
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.only(bottom: 30),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Child Selector
                    ChildSelectorWidget(
                      children: state.children,
                      selectedChild: selectedChild,
                      onChildSelected: (child) {
                        context
                            .read<ParentReportsBloc>()
                            .add(SelectChildEvent(child));
                      },
                    ),

                    // Today's Status Main Card
                    GlassCard(
                      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      padding: const EdgeInsets.all(18),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: AppColors.primary.withAlpha(20),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: const Icon(
                                      Icons.calendar_today_rounded,
                                      color: AppColors.primary,
                                      size: 18,
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Text(
                                    AppStrings.todayStatus,
                                    style: AppTypography.titleMedium.copyWith(
                                      color: isDark
                                          ? AppColors.textPrimaryDark
                                          : AppColors.deepDark,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ],
                              ),
                              Text(
                                DateFormatter.formatShortDate(report.date),
                                style: AppTypography.bodySmall.copyWith(
                                  color: AppColors.textMutedLight,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          const Divider(height: 1),
                          const SizedBox(height: 16),

                          // Mood and Health Row
                          Row(
                            children: [
                              Expanded(
                                child: Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: isDark
                                        ? AppColors.surfaceDark
                                        : AppColors.softBlueCard,
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        AppStrings.moodTitle,
                                        style: AppTypography.bodySmall.copyWith(
                                          color: isDark
                                              ? AppColors.textSecondaryDark
                                              : AppColors.textSecondaryLight,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                      const SizedBox(height: 6),
                                      MoodBadgeWidget(mood: report.mood),
                                    ],
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: isDark
                                        ? AppColors.surfaceDark
                                        : AppColors.softBlueCard,
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        AppStrings.healthTitle,
                                        style: AppTypography.bodySmall.copyWith(
                                          color: isDark
                                              ? AppColors.textSecondaryDark
                                              : AppColors.textSecondaryLight,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                      const SizedBox(height: 6),
                                      HealthBadgeWidget(health: report.health),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),

                          // Teacher's Note
                          Text(
                            AppStrings.teacherNoteTitle,
                            style: AppTypography.titleSmall.copyWith(
                              color: isDark
                                  ? AppColors.textPrimaryDark
                                  : AppColors.deepDark,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: isDark
                                  ? AppColors.cardDark
                                  : const Color(0xFFFAFCFF),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: isDark
                                    ? AppColors.borderDark
                                    : AppColors.borderLight,
                              ),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  report.teacherNote,
                                  style: AppTypography.bodyMedium.copyWith(
                                    color: isDark
                                        ? AppColors.textPrimaryDark
                                        : AppColors.textPrimaryLight,
                                    height: 1.5,
                                  ),
                                ),
                                if (report.teacherName != null) ...[
                                  const SizedBox(height: 10),
                                  Row(
                                    children: [
                                      const Icon(Icons.school_outlined,
                                          size: 14, color: AppColors.primary),
                                      const SizedBox(width: 6),
                                      Text(
                                        "O'qituvchi: ${report.teacherName}",
                                        style: AppTypography.bodySmall.copyWith(
                                          color: AppColors.primary,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                    // AI Analysis & Recommendation Block
                    AiAnalysisCard(analysisText: report.aiAnalysis),

                    // Weekly Mood Dynamics Chart
                    MoodChartWidget(weeklyData: state.weeklyDynamics),

                    // Quick Action Cards
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: Row(
                        children: [
                          Expanded(
                            child: _QuickActionCard(
                              title: "AI Maslahatchi",
                              subtitle: "Savol-javob & maslahat",
                              icon: Icons.chat_bubble_outline_rounded,
                              gradient: AppColors.primaryGradient,
                              onTap: () {
                                context.go('/parent/ai-chat');
                              },
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _QuickActionCard(
                              title: "Jonli Kameralar",
                              subtitle: "Yotoqxona & Oshxona",
                              icon: Icons.videocam_outlined,
                              gradient: AppColors.emeraldGradient,
                              onTap: () {
                                context.go('/parent/cameras');
                              },
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          }

          return const SizedBox.shrink();
        },
      ),
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Gradient gradient;
  final VoidCallback onTap;

  const _QuickActionCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.gradient,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: gradient,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(20),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          onTap: () {
            HapticHelper.lightImpact();
            onTap();
          },
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(icon, color: Colors.white, size: 26),
                const SizedBox(height: 12),
                Text(
                  title,
                  style: AppTypography.titleSmall.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: AppTypography.bodySmall.copyWith(
                    color: Colors.white.withAlpha(210),
                    fontSize: 11,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
