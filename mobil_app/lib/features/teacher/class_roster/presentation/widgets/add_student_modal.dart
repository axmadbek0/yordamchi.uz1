import 'package:flutter/material.dart';
import 'package:yordamchi_med/core/constants/app_colors.dart';
import 'package:yordamchi_med/core/constants/app_strings.dart';
import 'package:yordamchi_med/core/constants/app_typography.dart';
import 'package:yordamchi_med/core/utils/haptic_helper.dart';
import 'package:yordamchi_med/core/widgets/app_button.dart';
import 'package:yordamchi_med/core/widgets/app_text_field.dart';

class AddStudentModal extends StatefulWidget {
  final Function({
    required String firstName,
    required String lastName,
    required String className,
    required String parentPhone,
    String? diagnosis,
    String? birthDate,
  }) onAdd;

  const AddStudentModal({super.key, required this.onAdd});

  @override
  State<AddStudentModal> createState() => _AddStudentModalState();
}

class _AddStudentModalState extends State<AddStudentModal> {
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _phoneController = TextEditingController(text: '+998 ');
  final _diagnosisController = TextEditingController();
  String _selectedClass = '4-A';
  String? _error;

  final List<String> _classes = ['4-A', '4-B', '2-A', '2-B', '1-A'];

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _phoneController.dispose();
    _diagnosisController.dispose();
    super.dispose();
  }

  void _submit() {
    final first = _firstNameController.text.trim();
    final last = _lastNameController.text.trim();
    final phone = _phoneController.text.trim();

    if (first.isEmpty || last.isEmpty) {
      setState(() => _error = "Ism va familiyani to'liq kiriting");
      return;
    }
    if (phone.length < 9) {
      setState(() => _error = "Ota-ona telefon raqamini to'g'ri kiriting");
      return;
    }

    HapticHelper.successVibration();
    Navigator.of(context).pop();
    widget.onAdd(
      firstName: first,
      lastName: last,
      className: _selectedClass,
      parentPhone: phone,
      diagnosis: _diagnosisController.text.trim().isNotEmpty
          ? _diagnosisController.text.trim()
          : "Pedagogik korreksiya",
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceDark : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 44,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.textMutedLight.withAlpha(80),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 18),
            Text(
              AppStrings.addNewStudent,
              style: AppTypography.titleLarge.copyWith(
                color: isDark ? AppColors.textPrimaryDark : AppColors.deepDark,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              "Yangi o'quvchi qo'shilgach, uning ota-onasi uchun avtomatik tizimga kirish logini yaratiladi.",
              style: AppTypography.bodySmall.copyWith(
                color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
              ),
            ),
            const SizedBox(height: 20),

            if (_error != null) ...[
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.danger.withAlpha(20),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  _error!,
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.danger,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(height: 12),
            ],

            AppTextField(
              controller: _firstNameController,
              label: "Ismi",
              hint: "Masalan: Jasur",
            ),
            const SizedBox(height: 12),

            AppTextField(
              controller: _lastNameController,
              label: "Familiyasi",
              hint: "Masalan: Karimov",
            ),
            const SizedBox(height: 12),

            Text(
              "Sinfi",
              style: AppTypography.titleSmall.copyWith(
                color: isDark ? AppColors.textPrimaryDark : AppColors.deepDark,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: isDark ? AppColors.cardDark : Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isDark ? AppColors.borderDark : AppColors.borderLight,
                ),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedClass,
                  isExpanded: true,
                  dropdownColor: isDark ? AppColors.surfaceDark : Colors.white,
                  items: _classes.map((c) {
                    return DropdownMenuItem(
                      value: c,
                      child: Text("$c sinf"),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedClass = val);
                  },
                ),
              ),
            ),
            const SizedBox(height: 12),

            AppTextField(
              controller: _phoneController,
              label: "Ota-ona telefon raqami",
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 12),

            AppTextField(
              controller: _diagnosisController,
              label: "Tashxis / Maxsus ehtiyoji (Ixtiyoriy)",
              hint: "Masalan: Nutq buzilishi",
            ),
            const SizedBox(height: 24),

            AppButton(
              text: "O'quvchini saqlash & Login yaratish",
              icon: Icons.person_add_alt_1_rounded,
              onPressed: _submit,
            ),
          ],
        ),
      ),
    );
  }
}
