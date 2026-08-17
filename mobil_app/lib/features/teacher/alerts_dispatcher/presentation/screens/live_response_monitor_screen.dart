import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:yordamchi_med/core/constants/app_colors.dart';
import 'package:yordamchi_med/core/constants/app_typography.dart';
import 'package:yordamchi_med/core/utils/haptic_helper.dart';
import 'package:yordamchi_med/core/widgets/custom_app_bar.dart';
import 'package:yordamchi_med/core/widgets/glass_card.dart';
import 'package:yordamchi_med/features/teacher/alerts_dispatcher/domain/models/teacher_alert_model.dart';

class LiveResponseMonitorScreen extends StatefulWidget {
  final String alertTitle;
  final String targetClass;
  final String messageText;

  const LiveResponseMonitorScreen({
    super.key,
    required this.alertTitle,
    required this.targetClass,
    required this.messageText,
  });

  @override
  State<LiveResponseMonitorScreen> createState() =>
      _LiveResponseMonitorScreenState();
}

class _LiveResponseMonitorScreenState extends State<LiveResponseMonitorScreen> {
  final List<ParentResponseLiveItem> _responses = [
    ParentResponseLiveItem(
      studentName: 'Ali Karimov',
      parentName: 'Aziza Karimova (Onasi)',
      parentPhone: '+998 90 123 45 67',
      responseStatus: "Kelayapman (Yo'ldaman)",
      responseTime: DateTime.now().subtract(const Duration(minutes: 2)),
    ),
    ParentResponseLiveItem(
      studentName: 'Zarina Ergasheva',
      parentName: 'Dilnoza Ergasheva (Onasi)',
      parentPhone: '+998 93 345 67 89',
      responseStatus: "15 daqiqada boraman",
      responseTime: DateTime.now().subtract(const Duration(minutes: 1)),
    ),
    ParentResponseLiveItem(
      studentName: 'Bekzod Nazarov',
      parentName: 'Bobur Nazarov (Otasi)',
      parentPhone: '+998 97 789 01 23',
      responseStatus: "Kechikaman (Tirbandlikda)",
      responseTime: DateTime.now().subtract(const Duration(minutes: 4)),
    ),
    const ParentResponseLiveItem(
      studentName: 'Shaxzoda Yusupova',
      parentName: 'Gulbahor Yusupova (Onasi)',
      parentPhone: '+998 99 890 12 34',
      responseStatus: "Kutilmoqda...",
    ),
  ];

  Future<void> _callParent(String phone) async {
    HapticHelper.lightImpact();
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final onWayCount = _responses.where((r) => r.responseStatus.contains("Yo'l") || r.responseStatus.contains("Kel")).length;
    final soonCount = _responses.where((r) => r.responseStatus.contains("15 daqiqa")).length;
    final delayedCount = _responses.where((r) => r.responseStatus.contains("Kechik")).length;
    final pendingCount = _responses.where((r) => r.responseStatus.contains("Kutil")).length;

    return Scaffold(
      appBar: CustomAppBar(
        title: "Jonli Javoblar Kuzatuvi",
        subtitle: "${widget.targetClass} • ${widget.alertTitle}",
        showBackButton: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: _CounterBox(
                    count: onWayCount,
                    title: "Yo'lda",
                    color: AppColors.success,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _CounterBox(
                    count: soonCount,
                    title: "15 daqiqada",
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _CounterBox(
                    count: delayedCount,
                    title: "Kechikadi",
                    color: AppColors.coral,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _CounterBox(
                    count: pendingCount,
                    title: "Kutilmoqda",
                    color: AppColors.warning,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            Text(
              "Ota-onalar ro'yxati va holati:",
              style: AppTypography.titleSmall.copyWith(
                color: isDark ? AppColors.textPrimaryDark : AppColors.deepDark,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 10),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _responses.length,
              separatorBuilder: (_, _) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final item = _responses[index];

                Color getStatusColor() {
                  if (item.responseStatus.contains("Yo'l") || item.responseStatus.contains("Kel")) {
                    return AppColors.success;
                  } else if (item.responseStatus.contains("15 daqiqa")) {
                    return AppColors.primary;
                  } else if (item.responseStatus.contains("Kechik")) {
                    return AppColors.coral;
                  }
                  return AppColors.warning;
                }

                return GlassCard(
                  padding: const EdgeInsets.all(14),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 20,
                        backgroundColor: getStatusColor().withAlpha(20),
                        child: Icon(
                          item.responseStatus.contains("Kutil")
                              ? Icons.hourglass_empty_rounded
                              : Icons.check_circle_outline_rounded,
                          color: getStatusColor(),
                          size: 22,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.studentName,
                              style: AppTypography.titleSmall.copyWith(
                                color: isDark
                                    ? AppColors.textPrimaryDark
                                    : AppColors.deepDark,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            Text(
                              item.parentName,
                              style: AppTypography.bodySmall.copyWith(
                                color: isDark
                                    ? AppColors.textSecondaryDark
                                    : AppColors.textSecondaryLight,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: getStatusColor().withAlpha(25),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                item.responseStatus,
                                style: AppTypography.labelSmall.copyWith(
                                  color: getStatusColor(),
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withAlpha(20),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.call_rounded,
                              color: AppColors.primary, size: 18),
                        ),
                        onPressed: () => _callParent(item.parentPhone),
                      ),
                    ],
                  ),
                );
              },
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

class _CounterBox extends StatelessWidget {
  final int count;
  final String title;
  final Color color;

  const _CounterBox({
    required this.count,
    required this.title,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 4),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceDark : Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withAlpha(60)),
      ),
      child: Column(
        children: [
          Text(
            "$count",
            style: AppTypography.titleLarge.copyWith(
              color: color,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            title,
            style: AppTypography.bodySmall.copyWith(
              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
              fontSize: 10,
              fontWeight: FontWeight.w600,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
