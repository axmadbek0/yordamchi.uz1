import 'package:equatable/equatable.dart';

enum MoodType {
  xursand('🌟 Xursand', 5, 0xFF10B981),
  oddiy('🙂 Oddiy', 4, 0xFF3B82F6),
  tashvishli('😟 Tashvishli', 2, 0xFFF59E0B),
  charchagan('😴 Charchagan', 1, 0xFF8B5CF6);

  final String label;
  final int score;
  final int colorValue;
  const MoodType(this.label, this.score, this.colorValue);

  static MoodType fromString(String val) {
    final clean = val.toLowerCase().trim();
    if (clean.contains('xursand')) return MoodType.xursand;
    if (clean.contains('oddiy')) return MoodType.oddiy;
    if (clean.contains('tashvishli')) return MoodType.tashvishli;
    if (clean.contains('charchagan')) return MoodType.charchagan;
    return MoodType.oddiy;
  }
}

enum HealthType {
  soglom('Sog‘lom', 0xFF10B981),
  yengilBezovta('Yengil bezovta', 0xFFF59E0B),
  betob('Betob', 0xFFFF4D4F);

  final String label;
  final int colorValue;
  const HealthType(this.label, this.colorValue);

  static HealthType fromString(String val) {
    final clean = val.toLowerCase().trim();
    if (clean.contains('sog')) return HealthType.soglom;
    if (clean.contains('yengil') || clean.contains('bezovta')) return HealthType.yengilBezovta;
    if (clean.contains('betob')) return HealthType.betob;
    return HealthType.soglom;
  }
}

class Student extends Equatable {
  final String id;
  final String fullName;
  final String className;
  final int schoolNumber;
  final String? avatarUrl;
  final String? diagnosis;
  final String? birthDate;

  const Student({
    required this.id,
    required this.fullName,
    required this.className,
    required this.schoolNumber,
    this.avatarUrl,
    this.diagnosis,
    this.birthDate,
  });

  factory Student.fromJson(Map<String, dynamic> json) {
    return Student(
      id: json['id'] ?? '',
      fullName: json['fullName'] ??
          '${json['first_name'] ?? ''} ${json['last_name'] ?? ''}'.trim(),
      className: json['className'] ?? json['class_name'] ?? '4-A sinf',
      schoolNumber: json['schoolNumber'] ?? json['school_number'] ?? 12,
      avatarUrl: json['avatarUrl'],
      diagnosis: json['diagnosis'],
      birthDate: json['birthDate'] ?? json['dob'],
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'fullName': fullName,
        'className': className,
        'schoolNumber': schoolNumber,
        'avatarUrl': avatarUrl,
        'diagnosis': diagnosis,
        'birthDate': birthDate,
      };

  @override
  List<Object?> get props => [id, fullName, className, schoolNumber];
}

class DailyStatusEntry extends Equatable {
  final String id;
  final String studentId;
  final DateTime date;
  final HealthType health;
  final MoodType mood;
  final String teacherNote;
  final String? aiAnalysis;
  final String? teacherName;

  const DailyStatusEntry({
    required this.id,
    required this.studentId,
    required this.date,
    required this.health,
    required this.mood,
    required this.teacherNote,
    this.aiAnalysis,
    this.teacherName,
  });

  factory DailyStatusEntry.fromJson(Map<String, dynamic> json) {
    return DailyStatusEntry(
      id: json['id'] ?? '',
      studentId: json['studentId'] ?? json['student_id'] ?? '',
      date: json['date'] != null
          ? DateTime.tryParse(json['date'].toString()) ?? DateTime.now()
          : DateTime.now(),
      health: HealthType.fromString(json['healthStatus'] ?? json['health'] ?? 'sog‘lom'),
      mood: MoodType.fromString(json['mood'] ?? 'oddiy'),
      teacherNote: json['teacherNote'] ?? json['teacher_note'] ?? '',
      aiAnalysis: json['aiAnalysis'] ?? json['ai_analysis'],
      teacherName: json['teacherName'] ?? json['teacher_name'],
    );
  }

  @override
  List<Object?> get props => [id, studentId, date, health, mood, teacherNote, aiAnalysis];
}

class WeeklyMoodPoint extends Equatable {
  final String dayName;
  final double score; // 1 to 5
  final MoodType mood;
  final DateTime date;

  const WeeklyMoodPoint({
    required this.dayName,
    required this.score,
    required this.mood,
    required this.date,
  });

  @override
  List<Object?> get props => [dayName, score, mood, date];
}
