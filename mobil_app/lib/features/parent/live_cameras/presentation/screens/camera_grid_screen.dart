import 'package:flutter/material.dart';
import 'package:yordamchi_med/core/constants/app_colors.dart';
import 'package:yordamchi_med/core/constants/app_strings.dart';
import 'package:yordamchi_med/core/constants/app_typography.dart';
import 'package:yordamchi_med/core/utils/haptic_helper.dart';
import 'package:yordamchi_med/core/widgets/custom_app_bar.dart';
import 'package:yordamchi_med/features/parent/live_cameras/domain/models/camera_feed.dart';
import 'package:yordamchi_med/features/parent/live_cameras/presentation/screens/fullscreen_camera_screen.dart';
import 'package:yordamchi_med/features/parent/live_cameras/presentation/widgets/camera_card_widget.dart';

class CameraGridScreen extends StatelessWidget {
  const CameraGridScreen({super.key});

  final List<CameraFeed> _cameras = const [
    CameraFeed(
      id: 'cam_dorm_1',
      name: 'Yotoqxona (1-bino)',
      location: "1-qavat dam olish va uxlash zali",
      streamUrl: 'rtsp://yordamchi.uz/live/dormitory_1',
      viewersCount: 18,
      timeString: 'Jonli',
    ),
    CameraFeed(
      id: 'cam_kitchen_1',
      name: 'Oshxona & Ovqatlanish zali',
      location: 'Asosiy ovqatlanish majmuasi',
      streamUrl: 'rtsp://yordamchi.uz/live/kitchen_1',
      viewersCount: 24,
      timeString: 'Jonli',
    ),
    CameraFeed(
      id: 'cam_activity_1',
      name: "Rivojlanish va o'yin xonasi",
      location: 'Sensorika va sensor integratsiya xonasi',
      streamUrl: 'rtsp://yordamchi.uz/live/activity_1',
      viewersCount: 14,
      timeString: 'Jonli',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: const CustomAppBar(
        title: AppStrings.liveCamerasTitle,
        subtitle: AppStrings.liveCamerasSubtitle,
        showBackButton: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.primary.withAlpha(15),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.primary.withAlpha(40)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.security_rounded,
                      color: AppColors.primary, size: 22),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      "Kameralar faqat farzandingiz xavfsizligi va shaffoflikni ta'minlash maqsadida ota-onalarga ochiq.",
                      style: AppTypography.bodySmall.copyWith(
                        color: isDark ? AppColors.textPrimaryDark : AppColors.deepDark,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _cameras.length,
              separatorBuilder: (_, _) => const SizedBox(height: 16),
              itemBuilder: (context, index) {
                final cam = _cameras[index];
                return CameraCardWidget(
                  camera: cam,
                  onTap: () {
                    HapticHelper.lightImpact();
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => FullscreenCameraScreen(camera: cam),
                      ),
                    );
                  },
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
