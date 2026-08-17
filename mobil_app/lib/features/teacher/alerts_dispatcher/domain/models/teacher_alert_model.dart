import 'package:equatable/equatable.dart';

enum TeacherAlertBroadcastType { pickupRequest, urgentNotice, announcement }

class ParentResponseLiveItem extends Equatable {
  final String studentName;
  final String parentName;
  final String parentPhone;
  final String responseStatus; // "Kelayapman", "15 daqiqada boraman", "Kechikaman", "Kutilmoqda"
  final DateTime? responseTime;

  const ParentResponseLiveItem({
    required this.studentName,
    required this.parentName,
    required this.parentPhone,
    required this.responseStatus,
    this.responseTime,
  });

  @override
  List<Object?> get props => [studentName, parentName, responseStatus, responseTime];
}
