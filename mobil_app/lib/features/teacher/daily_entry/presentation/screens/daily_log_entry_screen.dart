import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:yordamchi_med/core/constants/app_colors.dart';
import 'package:yordamchi_med/core/constants/app_strings.dart';
import 'package:yordamchi_med/core/constants/app_typography.dart';
import 'package:yordamchi_med/core/utils/haptic_helper.dart';
import 'package:yordamchi_med/core/widgets/app_button.dart';
import 'package:yordamchi_med/core/widgets/app_text_field.dart';
import 'package:yordamchi_med/core/widgets/custom_app_bar.dart';
import 'package:yordamchi_med/features/teacher/class_roster/presentation/bloc/teacher_roster_bloc.dart';
import 'package:yordamchi_med/features/teacher/class_roster/domain/models/student_roster_item.dart';

class DailyLogEntryScreen extends StatefulWidget {
  const DailyLogEntryScreen({super.key});

  @override
  State<DailyLogEntryScreen> createState() => _DailyLogEntryScreenState();
}

class _DailyLogEntryScreenState extends State<DailyLogEntryScreen> {
  StudentRosterItem? _selectedStudent;
  String _selectedMood = '🌟 Xursand';
  String _selectedHealth = 'Sog‘lom';
  final _teacherNoteController = TextEditingController();
  String? _generatedAiAnalysis;
  bool _isGeneratingAi = false;
  bool _isSaving = false;

  final List<String> _moods = [
    '🌟 Xursand',
    '🙂 Oddiy',
    '😟 Tashvishli',
    '😴 Charchagan',
  ];

  final List<String> _healths = [
    'Sog‘lom',
    'Yengil bezovta',
    'Betob',
  ];

  @override
  void dispose() {
    _teacherNoteController.dispose();
    super.dispose();
  }

  void _generateAiInsight() async {
    final note = _teacherNoteController.text.trim();
    if (note.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("AI tahlil yaratish uchun avval o'qituvchi izohini yozing."),
          backgroundColor: AppColors.warningDark,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    HapticHelper.lightImpact();
    setState(() => _isGeneratingAi = true);

    await Future.delayed(const Duration(milliseconds: 1200));

    final studentName = _selectedStudent?.fullName ?? "O'quvchi";
    setState(() {
      _isGeneratingAi = false;
      _generatedAiAnalysis =
          "🌟 AI Pedagogik tavsiya ($studentName uchun):\n"
          "Bolada bugun $_selectedMood kayfiyati va $_selectedHealth holati kuzatildi. "
          "O'qituvchi qaydlariga ko'ra, mashg'ulotlarda ijobiy dinamika mavjud. Ota-onaga uyda sokin muhitda kun xulosasini qilish va nutq mashqlarini takrorlash tavsiya etiladi.";
    });
  }

  void _saveDailyLog() async {
    if (_selectedStudent == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Iltimos, o'quvchini tanlang."),
          backgroundColor: AppColors.warningDark,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    final note = _teacherNoteController.text.trim();
    if (note.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("O'qituvchi izohini to'ldiring."),
          backgroundColor: AppColors.warningDark,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    HapticHelper.successVibration();
    setState(() => _isSaving = true);

    await Future.delayed(const Duration(milliseconds: 800));

    if (mounted) {
      setState(() => _isSaving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("${_selectedStudent!.fullName} uchun kunlik qayd saqlandi va ota-onaga yetkazildi!"),
          backgroundColor: AppColors.success,
          behavior: SnackBarBehavior.floating,
        ),
      );

      _teacherNoteController.clear();
      setState(() => _generatedAiAnalysis = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: const CustomAppBar(
        title: AppStrings.dailyLogEntry,
        subtitle: "Bugungi kunlik holat va AI tahlil yaratish",
        showBackButton: false,
      ),
      body: BlocBuilder<TeacherRosterBloc, TeacherRosterState>(
        builder: (context, state) {
          List<StudentRosterItem> students = [];
          if (state is TeacherRosterLoaded) {
            students = state.allStudents;
            if (_selectedStudent == null && students.isNotEmpty) {
              _selectedStudent = students.first;
            }
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "O'quvchini tanlang",
                  style: AppTypography.titleSmall.copyWith(
                    color: isDark ? AppColors.textPrimaryDark : AppColors.deepDark,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.surfaceDark : Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isDark ? AppColors.borderDark : AppColors.borderLight,
                    ),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<StudentRosterItem>(
                      value: _selectedStudent,
                      isExpanded: true,
                      dropdownColor: isDark ? AppColors.surfaceDark : Colors.white,
                      items: students.map((s) {
                        return DropdownMenuItem(
                          value: s,
                          child: Text(
                            "${s.fullName} (${s.className} • ${s.parentLogin})",
                            style: AppTypography.bodyMedium.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) {
                          HapticHelper.selectionClick();
                          setState(() {
                            _selectedStudent = val;
                            _generatedAiAnalysis = null;
                          });
                        }
                      },
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                Text(
                  "Bugungi kayfiyati",
                  style: AppTypography.titleSmall.copyWith(
                    color: isDark ? AppColors.textPrimaryDark : AppColors.deepDark,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _moods.map((m) {
                    final isSelected = m == _selectedMood;
                    return ChoiceChip(
                      label: Text(m),
                      selected: isSelected,
                      selectedColor: AppColors.primary,
                      backgroundColor:
                          isDark ? AppColors.surfaceDark : AppColors.softBlueCard,
                      labelStyle: AppTypography.labelSmall.copyWith(
                        color: isSelected
                            ? Colors.white
                            : (isDark
                                ? AppColors.textPrimaryDark
                                : AppColors.deepDark),
                        fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                      ),
                      onSelected: (_) {
                        HapticHelper.selectionClick();
                        setState(() => _selectedMood = m);
                      },
                    );
                  }).toList(),
                ),
                const SizedBox(height: 20),

                Text(
                  "Salomatlik holati",
                  style: AppTypography.titleSmall.copyWith(
                    color: isDark ? AppColors.textPrimaryDark : AppColors.deepDark,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _healths.map((h) {
                    final isSelected = h == _selectedHealth;
                    return ChoiceChip(
                      label: Text(h),
                      selected: isSelected,
                      selectedColor: AppColors.primary,
                      backgroundColor:
                          isDark ? AppColors.surfaceDark : AppColors.softBlueCard,
                      labelStyle: AppTypography.labelSmall.copyWith(
                        color: isSelected
                            ? Colors.white
                            : (isDark
                                ? AppColors.textPrimaryDark
                                : AppColors.deepDark),
                        fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                      ),
                      onSelected: (_) {
                        HapticHelper.selectionClick();
                        setState(() => _selectedHealth = h);
                      },
                    );
                  }).toList(),
                ),
                const SizedBox(height: 20),

                AppTextField(
                  controller: _teacherNoteController,
                  label: "O'qituvchi izohi va darsdagi faolligi",
                  hint: "Darsdagi ishtiroki, ovqatlanishi va kayfiyati haqida batafsil yozing...",
                  maxLines: 4,
                ),
                const SizedBox(height: 14),

                AppButton(
                  text: AppStrings.generateAiSummary,
                  icon: Icons.auto_awesome_rounded,
                  variant: ButtonVariant.secondary,
                  isLoading: _isGeneratingAi,
                  onPressed: _generateAiInsight,
                ),
                const SizedBox(height: 16),

                if (_generatedAiAnalysis != null) ...[
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: AppColors.aiCardGradient,
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF4338CA).withAlpha(50),
                          blurRadius: 14,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.auto_awesome,
                                color: Colors.white, size: 20),
                            const SizedBox(width: 8),
                            Text(
                              "Generatsiya qilingan AI xulosa",
                              style: AppTypography.titleSmall.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Text(
                          _generatedAiAnalysis!,
                          style: AppTypography.bodyMedium.copyWith(
                            color: Colors.white,
                            height: 1.4,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                ],

                AppButton(
                  text: "Kunlik qaydni saqlash & Ota-onaga yuborish",
                  icon: Icons.send_rounded,
                  isLoading: _isSaving,
                  onPressed: _saveDailyLog,
                ),
                const SizedBox(height: 30),
              ],
            ),
          );
        },
      ),
    );
  }
}
