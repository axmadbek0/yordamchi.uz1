import 'package:flutter/material.dart';
import 'package:yordamchi_med/core/constants/app_colors.dart';
import 'package:yordamchi_med/core/constants/app_typography.dart';
import 'package:yordamchi_med/core/widgets/glass_card.dart';
import 'package:yordamchi_med/features/schools_directory/domain/models/school_model.dart';

class FaqAccordionWidget extends StatefulWidget {
  final List<FaqItem> faqItems;

  const FaqAccordionWidget({super.key, required this.faqItems});

  @override
  State<FaqAccordionWidget> createState() => _FaqAccordionWidgetState();
}

class _FaqAccordionWidgetState extends State<FaqAccordionWidget> {
  int? _expandedIndex;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (widget.faqItems.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "Ko'p beriladigan savollar (FAQ)",
          style: AppTypography.titleSmall.copyWith(
            color: isDark ? AppColors.textPrimaryDark : AppColors.deepDark,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 10),
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: widget.faqItems.length,
          separatorBuilder: (_, _) => const SizedBox(height: 8),
          itemBuilder: (context, index) {
            final item = widget.faqItems[index];
            final isExpanded = _expandedIndex == index;

            return GlassCard(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  InkWell(
                    onTap: () {
                      setState(() {
                        _expandedIndex = isExpanded ? null : index;
                      });
                    },
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            item.question,
                            style: AppTypography.titleSmall.copyWith(
                              color: isDark
                                  ? AppColors.textPrimaryDark
                                  : AppColors.deepDark,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        Icon(
                          isExpanded
                              ? Icons.keyboard_arrow_up_rounded
                              : Icons.keyboard_arrow_down_rounded,
                          color: AppColors.primary,
                        ),
                      ],
                    ),
                  ),
                  if (isExpanded) ...[
                    const SizedBox(height: 10),
                    const Divider(height: 1),
                    const SizedBox(height: 10),
                    Text(
                      item.answer,
                      style: AppTypography.bodyMedium.copyWith(
                        color: isDark
                            ? AppColors.textSecondaryDark
                            : AppColors.textSecondaryLight,
                        height: 1.4,
                      ),
                    ),
                  ],
                ],
              ),
            );
          },
        ),
      ],
    );
  }
}
