import 'package:equatable/equatable.dart';

enum AlertType { pickupRequest, urgent, announcement, dailyReport }

enum ParentResponseStatus { none, onMyWay, arrivingIn15Min, delayed }

class ParentAlert extends Equatable {
  final String id;
  final String title;
  final String body;
  final AlertType type;
  final DateTime timestamp;
  final bool isRead;
  final String? studentName;
  final String? teacherName;
  final ParentResponseStatus responseStatus;

  const ParentAlert({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.timestamp,
    this.isRead = false,
    this.studentName,
    this.teacherName,
    this.responseStatus = ParentResponseStatus.none,
  });

  ParentAlert copyWith({
    String? id,
    String? title,
    String? body,
    AlertType? type,
    DateTime? timestamp,
    bool? isRead,
    String? studentName,
    String? teacherName,
    ParentResponseStatus? responseStatus,
  }) {
    return ParentAlert(
      id: id ?? this.id,
      title: title ?? this.title,
      body: body ?? this.body,
      type: type ?? this.type,
      timestamp: timestamp ?? this.timestamp,
      isRead: isRead ?? this.isRead,
      studentName: studentName ?? this.studentName,
      teacherName: teacherName ?? this.teacherName,
      responseStatus: responseStatus ?? this.responseStatus,
    );
  }

  @override
  List<Object?> get props => [id, title, body, type, timestamp, isRead, responseStatus];
}
