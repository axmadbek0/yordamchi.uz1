import 'package:equatable/equatable.dart';

class CameraFeed extends Equatable {
  final String id;
  final String name;
  final String location;
  final String streamUrl;
  final bool isOnline;
  final int viewersCount;
  final String timeString;

  const CameraFeed({
    required this.id,
    required this.name,
    required this.location,
    required this.streamUrl,
    this.isOnline = true,
    this.viewersCount = 12,
    required this.timeString,
  });

  @override
  List<Object?> get props => [id, name, location, streamUrl, isOnline, viewersCount];
}
