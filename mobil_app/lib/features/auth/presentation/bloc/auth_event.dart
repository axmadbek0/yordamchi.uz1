import 'package:equatable/equatable.dart';
import 'package:yordamchi_med/features/auth/domain/models/user_model.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

class AuthCheckRequested extends AuthEvent {}

class AuthLoginSubmitted extends AuthEvent {
  final int schoolNumber;
  final String login;
  final String password;
  final UserRole role;

  const AuthLoginSubmitted({
    required this.schoolNumber,
    required this.login,
    required this.password,
    required this.role,
  });

  @override
  List<Object?> get props => [schoolNumber, login, password, role];
}

class AuthLogoutRequested extends AuthEvent {}
