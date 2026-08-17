import 'package:equatable/equatable.dart';

class StudentRosterItem extends Equatable {
  final String id;
  final String firstName;
  final String lastName;
  final String className;
  final String parentPhone;
  final String parentLogin;
  final String parentPassword;
  final String? diagnosis;
  final String? birthDate;
  final String? todayMood;
  final String? todayHealth;
  final bool hasTodayLog;

  const StudentRosterItem({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.className,
    required this.parentPhone,
    required this.parentLogin,
    required this.parentPassword,
    this.diagnosis,
    this.birthDate,
    this.todayMood,
    this.todayHealth,
    this.hasTodayLog = false,
  });

  String get fullName => '$firstName $lastName'.trim();

  StudentRosterItem copyWith({
    String? id,
    String? firstName,
    String? lastName,
    String? className,
    String? parentPhone,
    String? parentLogin,
    String? parentPassword,
    String? diagnosis,
    String? birthDate,
    String? todayMood,
    String? todayHealth,
    bool? hasTodayLog,
  }) {
    return StudentRosterItem(
      id: id ?? this.id,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      className: className ?? this.className,
      parentPhone: parentPhone ?? this.parentPhone,
      parentLogin: parentLogin ?? this.parentLogin,
      parentPassword: parentPassword ?? this.parentPassword,
      diagnosis: diagnosis ?? this.diagnosis,
      birthDate: birthDate ?? this.birthDate,
      todayMood: todayMood ?? this.todayMood,
      todayHealth: todayHealth ?? this.todayHealth,
      hasTodayLog: hasTodayLog ?? this.hasTodayLog,
    );
  }

  factory StudentRosterItem.fromJson(Map<String, dynamic> json) {
    return StudentRosterItem(
      id: json['id'] ?? '',
      firstName: json['first_name'] ?? json['firstName'] ?? '',
      lastName: json['last_name'] ?? json['lastName'] ?? '',
      className: json['class_name'] ?? json['className'] ?? '4-A',
      parentPhone: json['parentPhone'] ?? json['parent_phone'] ?? '',
      parentLogin: json['parentLogin'] ?? json['parent_login'] ?? '',
      parentPassword: json['parentPassword'] ?? json['parent_password'] ?? '',
      diagnosis: json['diagnosis'],
      birthDate: json['dob'] ?? json['birthDate'],
      todayMood: json['todayMood'],
      todayHealth: json['todayHealth'],
      hasTodayLog: json['hasTodayLog'] ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'first_name': firstName,
        'last_name': lastName,
        'class_name': className,
        'parentPhone': parentPhone,
        'parentLogin': parentLogin,
        'parentPassword': parentPassword,
        'diagnosis': diagnosis,
        'dob': birthDate,
      };

  @override
  List<Object?> get props => [id, firstName, lastName, className, parentLogin, hasTodayLog];
}
