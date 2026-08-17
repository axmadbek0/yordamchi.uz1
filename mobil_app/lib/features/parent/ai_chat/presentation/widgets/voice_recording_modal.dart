import 'dart:math';
import 'package:flutter/material.dart';
import 'package:yordamchi_med/core/constants/app_colors.dart';
import 'package:yordamchi_med/core/constants/app_strings.dart';
import 'package:yordamchi_med/core/constants/app_typography.dart';
import 'package:yordamchi_med/core/utils/haptic_helper.dart';

class VoiceRecordingModal extends StatefulWidget {
  final ValueChanged<String> onRecorded;

  const VoiceRecordingModal({super.key, required this.onRecorded});

  @override
  State<VoiceRecordingModal> createState() => _VoiceRecordingModalState();
}

class _VoiceRecordingModalState extends State<VoiceRecordingModal>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  int _secondsElapsed = 0;
  bool _isListening = true;

  final List<String> _demoTranscripts = [
    "Bolam uy vazifasini bajarayotganda tez-tez diqqati chalg'iyapti, qanday maslahat berasiz?",
    "Bugun darsdan so'ng kayfiyati nega tushkun bo'ldi? Qanday yordam ko'rsatsak bo'ladi?",
    "Logopedik mashqlarni uyda qanchadan va qaysi vaqtda bajargan ma'qul?",
  ];

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat(reverse: true);

    _startTimer();
  }

  void _startTimer() {
    Future.doWhile(() async {
      await Future.delayed(const Duration(seconds: 1));
      if (!mounted || !_isListening) return false;
      setState(() {
        _secondsElapsed++;
      });
      return true;
    });
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  void _stopAndSend() {
    HapticHelper.successVibration();
    setState(() => _isListening = false);
    final randomText = _demoTranscripts[Random().nextInt(_demoTranscripts.length)];
    Navigator.of(context).pop();
    widget.onRecorded(randomText);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceDark : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 44,
            height: 4,
            decoration: BoxDecoration(
              color: AppColors.textMutedLight.withAlpha(80),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            AppStrings.aiVoiceListening,
            style: AppTypography.titleMedium.copyWith(
              color: isDark ? AppColors.textPrimaryDark : AppColors.deepDark,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            "00:${_secondsElapsed.toString().padLeft(2, '0')}",
            style: AppTypography.bodyMedium.copyWith(
              color: AppColors.coral,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 32),

          AnimatedBuilder(
            animation: _animController,
            builder: (context, child) {
              return Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(7, (index) {
                  final waveHeight = 16.0 +
                      (sin((_animController.value * pi * 2) + index) + 1.0) * 16.0;
                  return Container(
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    width: 5,
                    height: waveHeight,
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  );
                }),
              );
            },
          ),
          const SizedBox(height: 36),

          GestureDetector(
            onTap: _stopAndSend,
            child: Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                gradient: AppColors.warmGradient,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: AppColors.coral.withAlpha(100),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: const Icon(Icons.stop_rounded, color: Colors.white, size: 36),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            "Tugatish va yuborish uchun bosing",
            style: AppTypography.bodySmall.copyWith(
              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
            ),
          ),
        ],
      ),
    );
  }
}
