import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:yordamchi_med/core/constants/app_colors.dart';
import 'package:yordamchi_med/core/constants/app_strings.dart';
import 'package:yordamchi_med/core/constants/app_typography.dart';
import 'package:yordamchi_med/core/utils/haptic_helper.dart';
import 'package:yordamchi_med/core/widgets/custom_app_bar.dart';
import 'package:yordamchi_med/core/widgets/glass_card.dart';
import 'package:yordamchi_med/core/widgets/state_views/empty_state_view.dart';
import 'package:yordamchi_med/core/widgets/state_views/shimmer_loading_view.dart';
import 'package:yordamchi_med/features/teacher/class_roster/presentation/bloc/teacher_roster_bloc.dart';
import 'package:yordamchi_med/features/teacher/class_roster/presentation/widgets/add_student_modal.dart';
import 'package:yordamchi_med/features/teacher/class_roster/presentation/widgets/credentials_created_dialog.dart';

class TeacherRosterScreen extends StatefulWidget {
  const TeacherRosterScreen({super.key});

  @override
  State<TeacherRosterScreen> createState() => _TeacherRosterScreenState();
}

class _TeacherRosterScreenState extends State<TeacherRosterScreen> {
  final _searchController = TextEditingController();
  final List<String> _classFilterList = ['Barchasi', '4-A', '4-B', '2-A'];

  @override
  void initState() {
    super.initState();
    context.read<TeacherRosterBloc>().add(LoadRosterEvent());
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _openAddStudentModal() {
    HapticHelper.lightImpact();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => AddStudentModal(
        onAdd: ({
          required String firstName,
          required String lastName,
          required String className,
          required String parentPhone,
          String? diagnosis,
          String? birthDate,
        }) {
          context.read<TeacherRosterBloc>().add(
                AddStudentEvent(
                  firstName: firstName,
                  lastName: lastName,
                  className: className,
                  parentPhone: parentPhone,
                  diagnosis: diagnosis,
                  birthDate: birthDate,
                ),
              );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: CustomAppBar(
        title: AppStrings.teacherRosterTitle,
        subtitle: "12-sonli maktab-internat o'quvchilari",
        showBackButton: false,
        actions: [
          IconButton(
            icon: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.primary.withAlpha(20),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.person_add_rounded,
                  color: AppColors.primary, size: 20),
            ),
            onPressed: _openAddStudentModal,
          ),
        ],
      ),
      body: BlocConsumer<TeacherRosterBloc, TeacherRosterState>(
        listener: (context, state) {
          if (state is TeacherRosterLoaded && state.newlyAddedStudent != null) {
            showDialog(
              context: context,
              builder: (_) => CredentialsCreatedDialog(
                student: state.newlyAddedStudent!,
              ),
            );
          }
        },
        builder: (context, state) {
          if (state is TeacherRosterLoading) {
            return const ShimmerLoadingView(itemCount: 4);
          }

          if (state is TeacherRosterLoaded) {
            return Column(
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: TextField(
                    controller: _searchController,
                    onChanged: (val) {
                      context.read<TeacherRosterBloc>().add(SearchStudentEvent(val));
                    },
                    decoration: InputDecoration(
                      hintText: "O'quvchi ismi yoki login bo'yicha qidirish...",
                      prefixIcon: const Icon(Icons.search_rounded, size: 20),
                      filled: true,
                      fillColor:
                          isDark ? AppColors.surfaceDark : AppColors.softBlueCard,
                      contentPadding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                Container(
                  height: 42,
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: _classFilterList.length,
                    separatorBuilder: (_, _) => const SizedBox(width: 8),
                    itemBuilder: (context, index) {
                      final c = _classFilterList[index];
                      final isSelected = c == state.selectedClass;
                      return FilterChip(
                        label: Text(c == 'Barchasi' ? c : "$c sinf"),
                        selected: isSelected,
                        selectedColor: AppColors.primary,
                        backgroundColor:
                            isDark ? AppColors.surfaceDark : Colors.white,
                        labelStyle: AppTypography.labelSmall.copyWith(
                          color: isSelected
                              ? Colors.white
                              : (isDark
                                  ? AppColors.textSecondaryDark
                                  : AppColors.deepDark),
                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                        ),
                        side: BorderSide(
                          color: isSelected
                              ? AppColors.primary
                              : (isDark
                                  ? AppColors.borderDark
                                  : AppColors.borderLight),
                        ),
                        onSelected: (_) {
                          HapticHelper.selectionClick();
                          context
                              .read<TeacherRosterBloc>()
                              .add(FilterClassEvent(c));
                        },
                      );
                    },
                  ),
                ),
                Expanded(
                  child: state.filteredStudents.isEmpty
                      ? EmptyStateView(
                          title: "O'quvchi topilmadi",
                          subtitle: "Qidiruv parametrlarini o'zgartirib ko'ring.",
                          actionText: "Yangi o'quvchi qo'shish",
                          onAction: _openAddStudentModal,
                        )
                      : ListView.separated(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 8),
                          itemCount: state.filteredStudents.length,
                          separatorBuilder: (_, _) => const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final student = state.filteredStudents[index];
                            return GlassCard(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      CircleAvatar(
                                        radius: 24,
                                        backgroundColor:
                                            AppColors.primary.withAlpha(20),
                                        child: Text(
                                          student.firstName.isNotEmpty
                                              ? student.firstName[0]
                                              : 'O',
                                          style: AppTypography.titleMedium.copyWith(
                                            color: AppColors.primary,
                                            fontWeight: FontWeight.w800,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              mainAxisAlignment:
                                                  MainAxisAlignment.spaceBetween,
                                              children: [
                                                Expanded(
                                                  child: Text(
                                                    student.fullName,
                                                    style: AppTypography.titleSmall
                                                        .copyWith(
                                                      color: isDark
                                                          ? AppColors
                                                              .textPrimaryDark
                                                          : AppColors.deepDark,
                                                      fontWeight: FontWeight.w700,
                                                    ),
                                                    maxLines: 1,
                                                    overflow:
                                                        TextOverflow.ellipsis,
                                                  ),
                                                ),
                                                Container(
                                                  padding: const EdgeInsets
                                                      .symmetric(
                                                      horizontal: 8, vertical: 3),
                                                  decoration: BoxDecoration(
                                                    color: AppColors.primary
                                                        .withAlpha(20),
                                                    borderRadius:
                                                        BorderRadius.circular(8),
                                                  ),
                                                  child: Text(
                                                    student.className,
                                                    style: AppTypography.labelSmall
                                                        .copyWith(
                                                      color: AppColors.primary,
                                                      fontWeight: FontWeight.w700,
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              "Ota-ona logini: ${student.parentLogin}",
                                              style: AppTypography.bodySmall
                                                  .copyWith(
                                                color: isDark
                                                    ? AppColors.textSecondaryDark
                                                    : AppColors
                                                        .textSecondaryLight,
                                                fontFamily: 'monospace',
                                              ),
                                            ),
                                            if (student.diagnosis != null) ...[
                                              const SizedBox(height: 4),
                                              Text(
                                                student.diagnosis!,
                                                style: AppTypography.bodySmall
                                                    .copyWith(
                                                  color: AppColors.textMutedLight,
                                                  fontSize: 11,
                                                ),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ],
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  const Divider(height: 1),
                                  const SizedBox(height: 10),
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      student.hasTodayLog
                                          ? Row(
                                              children: [
                                                const Icon(
                                                    Icons.check_circle_rounded,
                                                    color: AppColors.success,
                                                    size: 16),
                                                const SizedBox(width: 6),
                                                Text(
                                                  "Bugungi qayd: ${student.todayMood ?? ''}",
                                                  style: AppTypography.bodySmall
                                                      .copyWith(
                                                    color: AppColors.success,
                                                    fontWeight: FontWeight.w600,
                                                    fontSize: 11,
                                                  ),
                                                ),
                                              ],
                                            )
                                          : Row(
                                              children: [
                                                const Icon(
                                                    Icons.hourglass_top_rounded,
                                                    color: AppColors.warning,
                                                    size: 16),
                                                const SizedBox(width: 6),
                                                Text(
                                                  "Bugun qayd kiritilmagan",
                                                  style: AppTypography.bodySmall
                                                      .copyWith(
                                                    color: AppColors.warning,
                                                    fontSize: 11,
                                                  ),
                                                ),
                                              ],
                                            ),
                                      InkWell(
                                        onTap: () {
                                          HapticHelper.lightImpact();
                                          context.go('/teacher/daily-entry');
                                        },
                                        borderRadius: BorderRadius.circular(8),
                                        child: Padding(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 8, vertical: 4),
                                          child: Row(
                                            children: [
                                              Text(
                                                student.hasTodayLog
                                                    ? "Tahrirlash"
                                                    : "Qayd kiritish",
                                                style: AppTypography.labelSmall
                                                    .copyWith(
                                                  color: AppColors.primary,
                                                  fontWeight: FontWeight.w700,
                                                ),
                                              ),
                                              const Icon(
                                                Icons.chevron_right_rounded,
                                                color: AppColors.primary,
                                                size: 16,
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                ),
              ],
            );
          }

          return const SizedBox.shrink();
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: Text(
          "O'quvchi qo'shish",
          style: AppTypography.labelLarge.copyWith(color: Colors.white),
        ),
        onPressed: _openAddStudentModal,
      ),
    );
  }
}
