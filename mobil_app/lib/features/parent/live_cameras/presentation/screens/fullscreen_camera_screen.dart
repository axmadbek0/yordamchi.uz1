import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:yordamchi_med/core/constants/app_colors.dart';
import 'package:yordamchi_med/core/constants/app_typography.dart';
import 'package:yordamchi_med/core/utils/haptic_helper.dart';
import 'package:yordamchi_med/features/parent/live_cameras/domain/models/camera_feed.dart';

class FullscreenCameraScreen extends StatefulWidget {
  final CameraFeed camera;

  const FullscreenCameraScreen({super.key, required this.camera});

  @override
  State<FullscreenCameraScreen> createState() => _FullscreenCameraScreenState();
}

class _FullscreenCameraScreenState extends State<FullscreenCameraScreen> {
  bool _isPlaying = true;
  bool _isMuted = true;
  String _selectedQuality = '1080p';
  late Timer _timer;
  String _currentTime = '';

  @override
  void initState() {
    super.initState();
    _updateTime();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) => _updateTime());
  }

  void _updateTime() {
    setState(() {
      _currentTime = DateFormat('yyyy-MM-dd HH:mm:ss').format(DateTime.now());
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Stack(
          children: [
            Center(
              child: AspectRatio(
                aspectRatio: 16 / 9,
                child: Container(
                  color: const Color(0xFF0F172A),
                  child: Stack(
                    children: [
                      Positioned.fill(
                        child: Container(
                          decoration: const BoxDecoration(
                            gradient: RadialGradient(
                              colors: [Color(0xFF1E293B), Color(0xFF0A0F1D)],
                              radius: 0.9,
                            ),
                          ),
                          child: Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.videocam_rounded,
                                  size: 64,
                                  color: Colors.white.withAlpha(50),
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  "${widget.camera.name} • Jonli efir uzatilmoqda",
                                  style: AppTypography.bodySmall.copyWith(
                                    color: Colors.white70,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      Positioned(
                        top: 16,
                        left: 16,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: Colors.black.withAlpha(150),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 8,
                                height: 8,
                                decoration: const BoxDecoration(
                                  color: AppColors.danger,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                "REC • $_currentTime",
                                style: AppTypography.labelSmall.copyWith(
                                  color: Colors.white,
                                  fontFamily: 'monospace',
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            Positioned(
              top: 16,
              left: 16,
              right: 16,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    icon: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.black.withAlpha(150),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.arrow_back_ios_new_rounded,
                          color: Colors.white, size: 18),
                    ),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.black.withAlpha(150),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: _selectedQuality,
                            dropdownColor: const Color(0xFF1E293B),
                            style: AppTypography.labelSmall.copyWith(color: Colors.white),
                            icon: const Icon(Icons.keyboard_arrow_down_rounded,
                                color: Colors.white, size: 18),
                            items: ['720p', '1080p HD', '4K Ultra'].map((q) {
                              return DropdownMenuItem(
                                value: q.split(' ').first,
                                child: Text(q),
                              );
                            }).toList(),
                            onChanged: (val) {
                              if (val != null) setState(() => _selectedQuality = val);
                            },
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton(
                        icon: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.black.withAlpha(150),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            _isMuted
                                ? Icons.volume_off_rounded
                                : Icons.volume_up_rounded,
                            color: Colors.white,
                            size: 20,
                          ),
                        ),
                        onPressed: () {
                          HapticHelper.lightImpact();
                          setState(() => _isMuted = !_isMuted);
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Positioned(
              bottom: 24,
              left: 20,
              right: 20,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B).withAlpha(220),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          widget.camera.name,
                          style: AppTypography.titleSmall.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        Text(
                          widget.camera.location,
                          style: AppTypography.bodySmall.copyWith(
                            color: Colors.white70,
                          ),
                        ),
                      ],
                    ),
                    IconButton(
                      icon: Icon(
                        _isPlaying ? Icons.pause_circle_filled : Icons.play_circle_fill,
                        color: AppColors.primaryLight,
                        size: 38,
                      ),
                      onPressed: () {
                        HapticHelper.lightImpact();
                        setState(() => _isPlaying = !_isPlaying);
                      },
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
