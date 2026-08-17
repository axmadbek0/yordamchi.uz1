import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:yordamchi_med/core/constants/app_colors.dart';
import 'package:yordamchi_med/core/constants/app_strings.dart';
import 'package:yordamchi_med/core/constants/app_typography.dart';
import 'package:yordamchi_med/core/utils/date_formatter.dart';
import 'package:yordamchi_med/core/utils/haptic_helper.dart';
import 'package:yordamchi_med/core/widgets/app_button.dart';
import 'package:yordamchi_med/core/widgets/custom_app_bar.dart';
import 'package:yordamchi_med/core/widgets/glass_card.dart';
import 'package:yordamchi_med/core/widgets/state_views/empty_state_view.dart';
import 'package:yordamchi_med/core/widgets/state_views/shimmer_loading_view.dart';
import 'package:yordamchi_med/features/parent/notifications/domain/models/parent_notification_model.dart';
import 'package:yordamchi_med/features/parent/notifications/presentation/bloc/parent_notifications_bloc.dart';

class ParentNotificationsScreen extends StatefulWidget {
  const ParentNotificationsScreen({super.key});

  @override
  State<ParentNotificationsScreen> createState() =>
      _ParentNotificationsScreenState();
}

class _ParentNotificationsScreenState extends State<ParentNotificationsScreen> {
  @override
  void initState() {
    super.initState();
    context.read<ParentNotificationsBloc>().add(LoadNotificationsEvent());
  }

  void _sendResponse(String notifId, ParentResponseStatus status) {
    HapticHelper.successVibration();
    context.read<ParentNotificationsBloc>().add(
          RespondToPickupEvent(notificationId: notifId, status: status),
        );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(
        title: AppStrings.notificationsTitle,
        subtitle: "O'qituvchi va maktab xabarlari",
        showBackButton: true,
      ),
      body: BlocConsumer<ParentNotificationsBloc, ParentNotificationsState>(
        listener: (context, state) {
          if (state is ParentNotificationsLoaded && state.toastMessage != null) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.toastMessage!),
                backgroundColor: AppColors.success,
                behavior: SnackBarBehavior.floating,
                duration: const Duration(seconds: 2),
              ),
            );
          }
        },
        builder: (context, state) {
          if (state is ParentNotificationsLoading) {
            return const ShimmerLoadingView(itemCount: 3);
          }

          if (state is ParentNotificationsLoaded) {
            if (state.alerts.isEmpty) {
              return const EmptyStateView(
                title: "Yangi bildirishnomalar yo'q",
                subtitle: "Barcha xabarlar o'qilgan va faol so'rovlar mavjud emas.",
                icon: Icons.notifications_off_outlined,
              );
            }

            return ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              itemCount: state.alerts.length,
              separatorBuilder: (_, _) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final alert = state.alerts[index];
                return _NotificationItemCard(
                  alert: alert,
                  onRespond: (status) => _sendResponse(alert.id, status),
                );
              },
            );
          }

          return const SizedBox.shrink();
        },
      ),
    );
  }
}

class _NotificationItemCard extends StatelessWidget {
  final ParentAlert alert;
  final ValueChanged<ParentResponseStatus> onRespond;

  const _NotificationItemCard({
    required this.alert,
    required this.onRespond,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isPickup = alert.type == AlertType.pickupRequest;

    Color getHeaderColor() {
      switch (alert.type) {
        case AlertType.pickupRequest:
          return AppColors.coral;
        case AlertType.urgent:
          return AppColors.danger;
        case AlertType.announcement:
          return AppColors.primary;
        case AlertType.dailyReport:
          return AppColors.success;
      }
    }

    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: getHeaderColor().withAlpha(25),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  isPickup ? Icons.directions_walk_rounded : Icons.notifications_active_outlined,
                  color: getHeaderColor(),
                  size: 18,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      alert.title,
                      style: AppTypography.titleSmall.copyWith(
                        color: isDark ? AppColors.textPrimaryDark : AppColors.deepDark,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    Text(
                      DateFormatter.getRelativeTime(alert.timestamp),
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.textMutedLight,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            alert.body,
            style: AppTypography.bodyMedium.copyWith(
              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 14),

          if (isPickup) ...[
            if (alert.responseStatus == ParentResponseStatus.none) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.surfaceDark : AppColors.softBlueCard,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isDark ? AppColors.borderDark : AppColors.borderLight,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "O'qituvchiga tezkor javob berish:",
                      style: AppTypography.labelSmall.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 10),
                    LayoutBuilder(
                      builder: (context, constraints) {
                        return Row(
                          children: [
                            Expanded(
                              child: AppButton(
                                text: "Yo'ldaman",
                                icon: Icons.directions_car_rounded,
                                height: 36,
                                padding: const EdgeInsets.symmetric(horizontal: 4),
                                fontSize: 11.5,
                                onPressed: () =>
                                    onRespond(ParentResponseStatus.onMyWay),
                              ),
                            ),
                            const SizedBox(width: 6),
                            Expanded(
                              child: AppButton(
                                text: "15 daqiqada",
                                icon: Icons.access_time_rounded,
                                variant: ButtonVariant.secondary,
                                height: 36,
                                padding: const EdgeInsets.symmetric(horizontal: 4),
                                fontSize: 11.5,
                                onPressed: () =>
                                    onRespond(ParentResponseStatus.arrivingIn15Min),
                              ),
                            ),
                            const SizedBox(width: 6),
                            Expanded(
                              child: AppButton(
                                text: "Kechikaman",
                                icon: Icons.schedule_rounded,
                                variant: ButtonVariant.danger,
                                height: 36,
                                padding: const EdgeInsets.symmetric(horizontal: 4),
                                fontSize: 11.5,
                                onPressed: () =>
                                    onRespond(ParentResponseStatus.delayed),
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                  ],
                ),
              ),
            ] else ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: AppColors.success.withAlpha(20),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.success.withAlpha(80)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle_rounded,
                        color: AppColors.success, size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        alert.responseStatus == ParentResponseStatus.onMyWay
                            ? "Siz: \"Yo'ldaman (Kelayapman)\" deb javob berdingiz."
                            : (alert.responseStatus ==
                                    ParentResponseStatus.arrivingIn15Min
                                ? "Siz: \"15 daqiqada boraman\" deb javob berdingiz."
                                : "Siz: \"Kechikaman\" deb xabar qildingiz."),
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.successDark,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ],
      ),
    );
  }
}
