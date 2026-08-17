import 'package:flutter/material.dart';
import 'package:yordamchi_med/core/constants/app_colors.dart';
import 'package:yordamchi_med/core/constants/app_strings.dart';
import 'package:yordamchi_med/core/constants/app_typography.dart';
import 'package:yordamchi_med/core/utils/haptic_helper.dart';
import 'package:yordamchi_med/core/widgets/app_button.dart';
import 'package:yordamchi_med/core/widgets/app_text_field.dart';
import 'package:yordamchi_med/core/widgets/custom_app_bar.dart';
import 'package:yordamchi_med/features/teacher/alerts_dispatcher/presentation/screens/live_response_monitor_screen.dart';

class SendAlertScreen extends StatefulWidget {
  const SendAlertScreen({super.key});

  @override
  State<SendAlertScreen> createState() => _SendAlertScreenState();
}

class _SendAlertScreenState extends State<SendAlertScreen> {
  String _selectedType = 'pickup';
  String _targetClass = '4-A';
  final _messageController = TextEditingController(
    text: "Hurmatli ota-onalar! Bugungi dars mashg'ulotlari yakunlandi. Farzandingizni olib ketishingiz mumkin.",
  );
  bool _isSending = false;

  final List<String> _quickTemplates = [
    "Darslar yakunlandi, farzandingizni olib ketishingiz mumkin.",
    "Iltimos, darsdan so'ng sinf raxbari bilan uchrashing.",
    "Ertaga soat 10:00 da ota-onalar yig'ilishi bo'lib o'tadi.",
  ];

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  void _dispatchAlert() async {
    final text = _messageController.text.trim();
    if (text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Xabar matnini to'ldiring."),
          backgroundColor: AppColors.warningDark,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    HapticHelper.successVibration();
    setState(() => _isSending = true);

    await Future.delayed(const Duration(milliseconds: 900));

    if (mounted) {
      setState(() => _isSending = false);
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => LiveResponseMonitorScreen(
            alertTitle: _selectedType == 'pickup'
                ? "Olib ketish so'rovi"
                : (_selectedType == 'urgent'
                    ? "Shoshilinch xabar"
                    : "Sinf e'loni"),
            targetClass: _targetClass,
            messageText: text,
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: const CustomAppBar(
        title: AppStrings.sendClassNotification,
        subtitle: "Ota-onalarga push bildirishnoma yuborish",
        showBackButton: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "Bildirishnoma turi",
              style: AppTypography.titleSmall.copyWith(
                color: isDark ? AppColors.textPrimaryDark : AppColors.deepDark,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: _TypeButton(
                    title: "Olib ketish",
                    icon: Icons.directions_walk_rounded,
                    color: AppColors.coral,
                    isSelected: _selectedType == 'pickup',
                    onTap: () {
                      HapticHelper.selectionClick();
                      setState(() {
                        _selectedType = 'pickup';
                        _messageController.text =
                            "Hurmatli ota-onalar! Bugungi dars mashg'ulotlari yakunlandi. Farzandingizni olib ketishingiz mumkin.";
                      });
                    },
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _TypeButton(
                    title: "Shoshilinch",
                    icon: Icons.warning_amber_rounded,
                    color: AppColors.danger,
                    isSelected: _selectedType == 'urgent',
                    onTap: () {
                      HapticHelper.selectionClick();
                      setState(() {
                        _selectedType = 'urgent';
                        _messageController.text =
                            "Shoshilinch xabar: Iltimos, o'qituvchi bilan zudlik bilan bog'laning.";
                      });
                    },
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _TypeButton(
                    title: "E'lon",
                    icon: Icons.campaign_rounded,
                    color: AppColors.primary,
                    isSelected: _selectedType == 'announcement',
                    onTap: () {
                      HapticHelper.selectionClick();
                      setState(() {
                        _selectedType = 'announcement';
                        _messageController.text =
                            "Ertaga soat 10:00 da ochiq dars va ota-onalar yig'ilishi bo'lib o'tadi.";
                      });
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            Text(
              "Qabul qiluvchilar (Sinf)",
              style: AppTypography.titleSmall.copyWith(
                color: isDark ? AppColors.textPrimaryDark : AppColors.deepDark,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: isDark ? AppColors.surfaceDark : Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isDark ? AppColors.borderDark : AppColors.borderLight,
                ),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _targetClass,
                  isExpanded: true,
                  dropdownColor: isDark ? AppColors.surfaceDark : Colors.white,
                  items: ['4-A', '4-B', '2-A', 'Barcha sinflar'].map((c) {
                    return DropdownMenuItem(
                      value: c,
                      child: Text("$c ota-onalari"),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => _targetClass = val);
                  },
                ),
              ),
            ),
            const SizedBox(height: 20),

            AppTextField(
              controller: _messageController,
              label: "Xabar matni",
              maxLines: 4,
            ),
            const SizedBox(height: 14),

            Text(
              "Tayyor shablonlar:",
              style: AppTypography.bodySmall.copyWith(
                color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _quickTemplates.map((tpl) {
                return ActionChip(
                  label: Text(
                    tpl.length > 32 ? "${tpl.substring(0, 32)}..." : tpl,
                    style: AppTypography.labelSmall,
                  ),
                  backgroundColor:
                      isDark ? AppColors.cardDark : AppColors.softBlueCard,
                  onPressed: () {
                    HapticHelper.lightImpact();
                    setState(() => _messageController.text = tpl);
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 28),

            AppButton(
              text: "Bildirishnomani barchaga yuborish",
              icon: Icons.send_rounded,
              isLoading: _isSending,
              onPressed: _dispatchAlert,
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }
}

class _TypeButton extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color color;
  final bool isSelected;
  final VoidCallback onTap;

  const _TypeButton({
    required this.title,
    required this.icon,
    required this.color,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Material(
      color: isSelected
          ? color
          : (isDark ? AppColors.surfaceDark : Colors.white),
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isSelected
                  ? color
                  : (isDark ? AppColors.borderDark : AppColors.borderLight),
            ),
          ),
          child: Column(
            children: [
              Icon(
                icon,
                color: isSelected
                    ? Colors.white
                    : (isDark ? AppColors.textPrimaryDark : color),
                size: 24,
              ),
              const SizedBox(height: 6),
              Text(
                title,
                style: AppTypography.labelSmall.copyWith(
                  color: isSelected
                      ? Colors.white
                      : (isDark
                          ? AppColors.textPrimaryDark
                          : AppColors.deepDark),
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
