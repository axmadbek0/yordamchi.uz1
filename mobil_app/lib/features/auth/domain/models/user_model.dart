import 'package:equatable/equatable.dart';

enum UserRole { parent, teacher, admin }

class UserModel extends Equatable {
  final String id;
  final String login;
  final String fullName;
  final UserRole role;
  final int schoolNumber;
  final String? phone;
  final String? schoolId;
  final String? associatedStudentId;

  const UserModel({
    required this.id,
    required this.login,
    required this.fullName,
    required this.role,
    required this.schoolNumber,
    this.phone,
    this.schoolId,
    this.associatedStudentId,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    UserRole parsedRole;
    final r = (json['role'] ?? '').toString().toUpperCase();
    if (r == 'TEACHER') {
      parsedRole = UserRole.teacher;
    } else if (r == 'SUPER_ADMIN' || r == 'SCHOOL_ADMIN' || r == 'ADMIN') {
      parsedRole = UserRole.admin;
    } else {
      parsedRole = UserRole.parent;
    }

    return UserModel(
      id: json['id'] ?? '',
      login: json['login'] ?? '',
      fullName: json['full_name'] ?? json['displayName'] ?? json['fullName'] ?? 'Foydalanuvchi',
      role: parsedRole,
      schoolNumber: json['school_number'] ?? json['schoolNumber'] ?? 12,
      phone: json['phone'],
      schoolId: json['school_id'] ?? json['schoolId'],
      associatedStudentId: json['associatedStudentId'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'login': login,
      'full_name': fullName,
      'role': role.name,
      'school_number': schoolNumber,
      'phone': phone,
      'school_id': schoolId,
      'associatedStudentId': associatedStudentId,
    };
  }

  @override
  List<Object?> get props => [id, login, fullName, role, schoolNumber, phone];
}
