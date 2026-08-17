import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:yordamchi_med/core/constants/app_colors.dart';
import 'package:yordamchi_med/core/constants/app_strings.dart';
import 'package:yordamchi_med/core/constants/app_typography.dart';
import 'package:yordamchi_med/core/utils/distance_calculator.dart';
import 'package:yordamchi_med/core/utils/haptic_helper.dart';
import 'package:yordamchi_med/core/widgets/app_button.dart';
import 'package:yordamchi_med/core/widgets/custom_app_bar.dart';
import 'package:yordamchi_med/core/widgets/glass_card.dart';
import 'package:yordamchi_med/features/schools_directory/domain/models/school_model.dart';
import 'package:yordamchi_med/features/schools_directory/presentation/widgets/faq_accordion_widget.dart';

class SchoolDetailScreen extends StatelessWidget {
  final SchoolModel school;

  const SchoolDetailScreen({super.key, required this.school});

  Future<void> _makeCall(String phone) async {
    HapticHelper.lightImpact();
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  Future<void> _openMapRoute(double lat, double lng) async {
    HapticHelper.lightImpact();
    final uri = Uri.parse('https://www.google.com/maps/dir/?api=1&destination=$lat,$lng');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: CustomAppBar(
        title: school.name,
        subtitle: "${school.region}, ${school.district}",
        showBackButton: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: AppColors.primaryGradient,
                borderRadius: BorderRadius.circular(22),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withAlpha(80),
                    blurRadius: 18,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: Colors.white.withAlpha(50),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          "${school.number}-SONLI MAKTAB",
                          style: AppTypography.labelSmall.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                      if (school.isVerified)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.success,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.verified_rounded,
                                  color: Colors.white, size: 14),
                              const SizedBox(width: 4),
                              Text(
                                "Tasdiqlangan",
                                style: AppTypography.labelSmall.copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Text(
                    school.name,
                    style: AppTypography.titleLarge.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined,
                          color: Colors.white70, size: 16),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          school.address,
                          style: AppTypography.bodySmall.copyWith(
                            color: Colors.white.withAlpha(220),
                          ),
                        ),
                      ),
                    ],
                  ),
                  if (school.distanceKm != null) ...[
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withAlpha(30),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        "📍 Sizdan ${DistanceCalculator.formatDistance(school.distanceKm!)} uzoqlikda",
                        style: AppTypography.labelSmall.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 16),

            Row(
              children: [
                Expanded(
                  child: AppButton(
                    text: AppStrings.callSchool,
                    icon: Icons.phone_in_talk_rounded,
                    onPressed: () => _makeCall(school.phone),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: AppButton(
                    text: AppStrings.viewRoute,
                    icon: Icons.directions_rounded,
                    variant: ButtonVariant.secondary,
                    onPressed: () => _openMapRoute(school.lat, school.lng),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            Row(
              children: [
                Expanded(
                  child: _MetricCard(
                    title: "Sinflar",
                    value: "${school.classCount} ta",
                    icon: Icons.meeting_room_outlined,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _MetricCard(
                    title: "O'qituvchilar",
                    value: "${school.teacherCount} nafar",
                    icon: Icons.school_outlined,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _MetricCard(
                    title: "O'quvchilar",
                    value: "${school.studentCount} nafar",
                    icon: Icons.people_alt_outlined,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            GlassCard(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Muassasa haqida",
                    style: AppTypography.titleSmall.copyWith(
                      color: isDark ? AppColors.textPrimaryDark : AppColors.deepDark,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    school.description ??
                        "Ushbu ixtisoslashtirilgan maktab-internatda maxsus pedagogik va tibbiy korreksiya xizmatlari yo'lga qo'yilgan.",
                    style: AppTypography.bodyMedium.copyWith(
                      color: isDark
                          ? AppColors.textSecondaryDark
                          : AppColors.textSecondaryLight,
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Divider(height: 1),
                  const SizedBox(height: 14),

                  _InfoRow(
                    label: "Ish vaqti:",
                    value: school.workingHours ?? "08:00 - 18:00",
                    icon: Icons.access_time_rounded,
                  ),
                  const SizedBox(height: 10),
                  _InfoRow(
                    label: "Davlat litsenziyasi:",
                    value: school.licenseNumber ?? "Mavjud",
                    icon: Icons.assignment_turned_in_rounded,
                  ),
                  const SizedBox(height: 10),
                  _InfoRow(
                    label: "Tashkil etilgan yili:",
                    value: "${school.foundedYear ?? 1984}-yil",
                    icon: Icons.history_rounded,
                  ),
                  const SizedBox(height: 10),
                  _InfoRow(
                    label: "Bog'lanish:",
                    value: school.phone,
                    icon: Icons.phone_rounded,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            FaqAccordionWidget(faqItems: school.faqItems),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;

  const _MetricCard({
    required this.title,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GlassCard(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
      child: Column(
        children: [
          Icon(icon, color: AppColors.primary, size: 22),
          const SizedBox(height: 8),
          Text(
            value,
            style: AppTypography.titleSmall.copyWith(
              color: isDark ? AppColors.textPrimaryDark : AppColors.deepDark,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            title,
            style: AppTypography.bodySmall.copyWith(
              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
              fontSize: 10,
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _InfoRow({
    required this.label,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Row(
      children: [
        Icon(icon, size: 16, color: AppColors.primary),
        const SizedBox(width: 8),
        Text(
          label,
          style: AppTypography.bodySmall.copyWith(
            fontWeight: FontWeight.w600,
            color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
          ),
        ),
        const SizedBox(width: 6),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.end,
            style: AppTypography.bodySmall.copyWith(
              fontWeight: FontWeight.w700,
              color: isDark ? AppColors.textPrimaryDark : AppColors.deepDark,
            ),
          ),
        ),
      ],
    );
  }
}
