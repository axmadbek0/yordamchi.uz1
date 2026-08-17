import 'package:yordamchi_med/features/parent/notifications/domain/models/parent_notification_model.dart';

class ParentNotificationsRepository {
  final List<ParentAlert> _mockAlerts = [
    ParentAlert(
      id: 'notif_1',
      title: "Olib ketish so'rovi",
      body: "Bugungi darslar va to'garaklar yakunlandi. Ali Karimovni olib ketishingiz mumkin.",
      type: AlertType.pickupRequest,
      timestamp: DateTime.now().subtract(const Duration(minutes: 8)),
      studentName: 'Ali Karimov',
      teacherName: 'Rustam Ahmedov',
      responseStatus: ParentResponseStatus.none,
    ),
    ParentAlert(
      id: 'notif_2',
      title: "Ertangi ochiq dars haqida",
      body: "Ertaga soat 10:00 da ota-onalar ishtirokida maxsus art-terapiya darsi bo'lib o'tadi.",
      type: AlertType.announcement,
      timestamp: DateTime.now().subtract(const Duration(hours: 3)),
      teacherName: 'Maktab ma’muriyati',
    ),
    ParentAlert(
      id: 'notif_3',
      title: "Bugungi kunlik hisobot tayyor",
      body: "O'qituvchi bugungi kunlik monitoring va AI tahlilini kiritdi.",
      type: AlertType.dailyReport,
      timestamp: DateTime.now().subtract(const Duration(hours: 5)),
      isRead: true,
    ),
  ];

  Future<List<ParentAlert>> getNotifications() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return List<ParentAlert>.from(_mockAlerts);
  }

  Future<void> respondToPickup({
    required String notificationId,
    required ParentResponseStatus status,
  }) async {
    final idx = _mockAlerts.indexWhere((a) => a.id == notificationId);
    if (idx != -1) {
      _mockAlerts[idx] = _mockAlerts[idx].copyWith(responseStatus: status);
    }
  }
}
